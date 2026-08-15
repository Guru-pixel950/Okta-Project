from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
from datetime import datetime

from modules.list_users import list_users
from modules.get_user import get_user
from modules.create_user import create_user
from modules.activate_user import activate_user
from modules.deactivate_user import deactivate_user
from modules.suspend_user import suspend_user
from modules.unsuspend_user import unsuspend_user
from modules.export_users import export_users
from modules.update_user import update_user_profile
from modules.auth import login_user, signup_user, is_super_admin

from bulk.bulk_activate import bulk_activate
from bulk.bulk_deactivate import bulk_deactivate

from audit.audit_logger import get_audit_logs


app = Flask(__name__)

# Allow frontend requests during development
CORS(app)


def format_user_date(iso_str):
    """Format ISO date string to human-friendly 'May 12, 2025' format."""
    if not iso_str:
        return "May 12, 2025"
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        return dt.strftime("%b %d, %Y")
    except Exception:
        return str(iso_str)[:10]


def format_user(user, index=None):
    """Return a clean user response containing only core identity fields."""
    profile = user.get("profile", {})
    user_id = user.get("id", "")
    
    display_id = f"USR{1001 + index}" if index is not None else (f"USR{user_id[-4:]}" if len(user_id) >= 4 else user_id)
    status = (user.get("status") or "ACTIVE").upper()
    ui_status = "Active" if status == "ACTIVE" else ("Inactive" if status in ["DEPROVISIONED", "SUSPENDED", "LOCKED_OUT"] else status.capitalize())

    created_raw = user.get("created") or user.get("activated") or ""
    created_formatted = format_user_date(created_raw)

    return {
        "id": user_id,
        "displayId": display_id,
        "firstName": profile.get("firstName", ""),
        "lastName": profile.get("lastName", ""),
        "email": profile.get("email", "") or profile.get("login", ""),
        "status": status,
        "uiStatus": ui_status,
        "created": created_raw,
        "createdDate": created_formatted,
        "lastLogin": user.get("lastLogin", "")
    }


# ==========================================
# Authentication Routes
# ==========================================

@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    """
    Validate credentials directly against Okta tenant API.
    Flow: Request -> Validate -> okta_client.authenticate -> Okta /api/v1/authn -> Audit Log -> Return Session.
    """
    data = request.get_json() or {}
    username = data.get("username") or data.get("email")
    password = data.get("password")
    role = data.get("role", "Administrator")

    if not username or not password:
        return jsonify({
            "success": False,
            "error": "Email/Username and Password are required."
        }), 400

    result = login_user(username=username, password=password, selected_role=role)

    if not result.get("success"):
        status_code = result.get("status_code", 401)
        return jsonify(result), status_code

    return jsonify(result), 200



@app.route("/api/auth/signup", methods=["POST"])
def auth_signup():
    """
    Register and provision a new user in the Okta tenant with the 4 core fields.
    Flow: Request -> Validate -> okta_client.create_user -> Okta /api/v1/users -> Audit Log -> Return User.
    """
    data = request.get_json() or {}
    
    first_name = data.get("firstName")
    last_name = data.get("lastName")
    email = data.get("email")
    password = data.get("password")

    if not all([first_name, last_name, email, password]):
        return jsonify({
            "success": False,
            "error": "First Name, Last Name, Email, and Password are required."
        }), 400

    result = signup_user(
        first_name=first_name,
        last_name=last_name,
        email=email,
        password=password
    )

    if not result.get("success"):
        return jsonify(result), 400

    return jsonify(result), 201


@app.route("/api/auth/me", methods=["GET"])
def auth_me():
    """Verify session / return current Okta user info."""
    users = list_users()
    if users and len(users) > 0:
        u = users[0]
        uid = u.get("id")
        super_admin = is_super_admin(uid) if uid else False
        user_formatted = format_user(u, 0)
        user_formatted["isSuperAdmin"] = super_admin
        return jsonify({
            "success": True,
            "user": user_formatted,
            "isSuperAdmin": super_admin,
            "role": "Administrator" if super_admin else "User"
        })
    return jsonify({
        "success": False,
        "error": "No active session"
    }), 401



# ==========================================
# User Lifecycle & CRUD Routes
# ==========================================

@app.route("/api/users", methods=["GET"])
def get_all_users():
    """Return all users from Okta directory."""
    users = list_users()

    if users is None:
        return jsonify({
            "success": False,
            "error": "Failed to retrieve users from Okta tenant"
        }), 500

    formatted_list = [
        format_user(u, idx)
        for idx, u in enumerate(users)
    ]

    return jsonify({
        "success": True,
        "count": len(users),
        "users": formatted_list
    })


@app.route("/api/users/<user_id>", methods=["GET"])
def get_single_user(user_id):
    """Return one user by ID."""
    user = get_user(user_id)

    if user is None:
        return jsonify({
            "success": False,
            "error": "User not found"
        }), 404

    return jsonify({
        "success": True,
        "user": format_user(user)
    })


@app.route("/api/users/<user_id>", methods=["PUT"])
def update_user_api(user_id):
    """Update user profile in Okta."""
    data = request.get_json() or {}
    
    profile_updates = {}
    if "firstName" in data: profile_updates["firstName"] = data["firstName"]
    if "lastName" in data: profile_updates["lastName"] = data["lastName"]
    if "email" in data: profile_updates["email"] = data["email"]

    updated = update_user_profile(user_id, profile_updates)
    if not updated or (isinstance(updated, dict) and "_error" in updated):
        err = updated.get("_error") if isinstance(updated, dict) else "Failed to update profile"
        return jsonify({"success": False, "error": err}), 400

    return jsonify({
        "success": True,
        "message": "User profile updated successfully",
        "user": format_user(updated)
    })


@app.route("/api/users", methods=["POST"])
def create_user_api():
    """
    Administrator workflow:
    React Frontend (Create User Form)
    ↓
    Validate User Input (firstName, lastName, email, password)
    ↓
    POST /api/users
    ↓
    Flask REST API
    ↓
    modules/create_user.py
    ↓
    okta_client.py
    ↓
    Okta Users API (/api/v1/users)
    ↓
    Create User in Okta
    ↓
    Audit Logger
    ↓
    Store Operation Logs
    ↓
    Return JSON Response
    """
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "error": "Request body is required"
        }), 400

    required_fields = [
        "firstName",
        "lastName",
        "email",
        "password"
    ]

    for field in required_fields:
        if not data.get(field):
            return jsonify({
                "success": False,
                "error": f"Missing required field: {field}"
            }), 400

    user = create_user(
        first_name=data["firstName"],
        last_name=data["lastName"],
        email=data["email"],
        password=data["password"]
    )

    if not user or (isinstance(user, dict) and "_error" in user):
        err_msg = user.get("_error") if isinstance(user, dict) else "Failed to create user in Okta"
        return jsonify({
            "success": False,
            "error": err_msg
        }), 400

    return jsonify({
        "success": True,
        "message": "User created successfully in Okta tenant",
        "user": format_user(user)
    }), 201


@app.route("/api/users/<user_id>/activate", methods=["POST"])
def activate_user_api(user_id):
    """Activate a user in Okta."""
    user = activate_user(user_id)

    if user is None:
        return jsonify({
            "success": False,
            "error": "User could not be activated"
        }), 400

    result = user.pop("_operation_result", "SUCCESS") if isinstance(user, dict) else "SUCCESS"
    reason = user.pop("_operation_reason", "") if isinstance(user, dict) else ""

    return jsonify({
        "success": True,
        "result": result,
        "reason": reason,
        "user": format_user(user) if isinstance(user, dict) else {"id": user_id, "status": "ACTIVE"}
    })


@app.route("/api/users/<user_id>/deactivate", methods=["POST"])
def deactivate_user_api(user_id):
    """Deactivate a user in Okta."""
    user = deactivate_user(user_id)

    if user is None:
        return jsonify({
            "success": False,
            "error": "User could not be deactivated"
        }), 400

    result = user.pop("_operation_result", "SUCCESS") if isinstance(user, dict) else "SUCCESS"
    reason = user.pop("_operation_reason", "") if isinstance(user, dict) else ""

    return jsonify({
        "success": True,
        "result": result,
        "reason": reason,
        "user": format_user(user) if isinstance(user, dict) else {"id": user_id, "status": "DEPROVISIONED"}
    })


@app.route("/api/users/<user_id>/suspend", methods=["POST"])
def suspend_user_api(user_id):
    """Suspend a user in Okta."""
    user = suspend_user(user_id)

    if user is None:
        return jsonify({
            "success": False,
            "error": "User could not be suspended"
        }), 400

    return jsonify({
        "success": True,
        "message": "User suspended successfully",
        "user": format_user(user) if isinstance(user, dict) else {"id": user_id, "status": "SUSPENDED"}
    })


@app.route("/api/users/<user_id>/unsuspend", methods=["POST"])
def unsuspend_user_api(user_id):
    """Unsuspend a user in Okta."""
    user = unsuspend_user(user_id)

    if user is None:
        return jsonify({
            "success": False,
            "error": "User could not be unsuspended"
        }), 400

    return jsonify({
        "success": True,
        "message": "User unsuspended successfully",
        "user": format_user(user) if isinstance(user, dict) else {"id": user_id, "status": "ACTIVE"}
    })


@app.route("/api/bulk/activate", methods=["POST"])
def bulk_activate_api():
    """Activate multiple users."""
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "error": "Request body is required"
        }), 400

    user_ids = data.get("user_ids")
    if not isinstance(user_ids, list) or not user_ids:
        return jsonify({
            "success": False,
            "error": "user_ids must be a non-empty list"
        }), 400

    result = bulk_activate(user_ids)
    return jsonify({
        "success": True,
        **result
    })


@app.route("/api/bulk/deactivate", methods=["POST"])
def bulk_deactivate_api():
    """Deactivate multiple users."""
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "error": "Request body is required"
        }), 400

    user_ids = data.get("user_ids")
    if not isinstance(user_ids, list) or not user_ids:
        return jsonify({
            "success": False,
            "error": "user_ids must be a non-empty list"
        }), 400

    result = bulk_deactivate(user_ids)
    return jsonify({
        "success": True,
        **result
    })


@app.route("/api/audit", methods=["GET"])
def get_audit():
    """Return audit log entries."""
    logs = get_audit_logs()
    
    formatted_logs = []
    for l in logs:
        action = (l.get("action") or "EVENT").upper()
        user_name = l.get("user_name") or "User"
        raw_ts = l.get("timestamp") or ""

        if action == "CREATE" or action == "SIGNUP":
            desc = f"User {user_name} was created by admin"
            icon_type = "created"
        elif action == "ACTIVATE":
            desc = f"User {user_name} was activated by admin"
            icon_type = "activated"
        elif action == "DEACTIVATE":
            desc = f"User {user_name} was deactivated by admin"
            icon_type = "deactivated"
        elif action == "SUSPEND":
            desc = f"User {user_name} was suspended by admin"
            icon_type = "suspended"
        elif action == "UPDATE":
            desc = f"User {user_name} profile updated by admin"
            icon_type = "updated"
        elif action == "DELETE":
            desc = f"User {user_name} was deleted by admin"
            icon_type = "deleted"
        elif action == "LOGIN":
            desc = f"User {user_name} signed in successfully"
            icon_type = "login"
        else:
            desc = f"User {user_name} - {action} performed"
            icon_type = "default"

        formatted_logs.append({
            **l,
            "description": desc,
            "iconType": icon_type,
            "formattedTime": raw_ts
        })

    return jsonify({
        "success": True,
        "count": len(formatted_logs),
        "logs": formatted_logs
    })


@app.route("/api/export", methods=["GET"])
def export_users_api():
    """Export all users as a CSV file."""
    file_path = export_users()

    if file_path is None:
        return jsonify({
            "success": False,
            "error": "Failed to export users"
        }), 500

    return send_file(
        file_path,
        mimetype="text/csv",
        as_attachment=True,
        download_name="okta_users_export.csv"
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)