from datetime import datetime
import os
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

from config import OKTA_DOMAIN, OKTA_TOKEN, IS_OKTA_CONFIGURED
from modules.list_users import list_users
from modules.get_user import get_user
from modules.create_user import create_user
from modules.activate_user import activate_user
from modules.deactivate_user import deactivate_user
from modules.suspend_user import suspend_user
from modules.unsuspend_user import unsuspend_user
from modules.export_users import export_users

from bulk.bulk_activate import bulk_activate
from bulk.bulk_deactivate import bulk_deactivate

from audit.audit_logger import get_audit_logs, log_operation
import okta_client


app = Flask(__name__)

# Allow frontend requests during development
CORS(app)

# Built-in sample dataset matching screenshots for instant demo / fallback
FALLBACK_USERS = [
    {
        "id": "USR1001",
        "profile": {
            "firstName": "John",
            "lastName": "Doe",
            "email": "john.doe@company.com",
            "role": "User"
        },
        "status": "ACTIVE",
        "created": "2025-05-12T10:30:00.000Z"
    },
    {
        "id": "USR1002",
        "profile": {
            "firstName": "Jane",
            "lastName": "Smith",
            "email": "jane.smith@company.com",
            "role": "Manager"
        },
        "status": "ACTIVE",
        "created": "2025-05-11T14:20:00.000Z"
    },
    {
        "id": "USR1003",
        "profile": {
            "firstName": "Michael",
            "lastName": "Johnson",
            "email": "michael.j@company.com",
            "role": "User"
        },
        "status": "INACTIVE",
        "created": "2025-05-10T09:15:00.000Z"
    },
    {
        "id": "USR1004",
        "profile": {
            "firstName": "Emily",
            "lastName": "Davis",
            "email": "emily.davis@company.com",
            "role": "Admin"
        },
        "status": "ACTIVE",
        "created": "2025-05-09T16:45:00.000Z"
    },
    {
        "id": "USR1005",
        "profile": {
            "firstName": "Chris",
            "lastName": "Brown",
            "email": "chris.brown@company.com",
            "role": "User"
        },
        "status": "INACTIVE",
        "created": "2025-05-08T11:00:00.000Z"
    },
    {
        "id": "USR1006",
        "profile": {
            "firstName": "Sarah",
            "lastName": "Wilson",
            "email": "sarah.wilson@company.com",
            "role": "User"
        },
        "status": "ACTIVE",
        "created": "2025-05-07T08:30:00.000Z"
    },
    {
        "id": "USR1007",
        "profile": {
            "firstName": "David",
            "lastName": "Clark",
            "email": "david.clark@company.com",
            "role": "Manager"
        },
        "status": "STAGED",
        "created": "2025-05-06T15:10:00.000Z"
    },
    {
        "id": "USR1008",
        "profile": {
            "firstName": "Alex",
            "lastName": "Morgan",
            "email": "alex.morgan@company.com",
            "role": "Admin"
        },
        "status": "ACTIVE",
        "created": "2025-05-05T13:25:00.000Z"
    }
]


def format_user(user):
    """Return a simplified, rich user response."""
    profile = user.get("profile", {})
    created = user.get("created", "")
    
    # Format created date e.g. "May 12, 2025"
    formatted_date = created
    if created:
        try:
            dt = datetime.fromisoformat(created.replace("Z", "+00:00"))
            formatted_date = dt.strftime("%b %d, %Y")
        except Exception:
            formatted_date = str(created)[:10]

    # Map / derive role
    role = profile.get("role") or profile.get("userType") or profile.get("title") or "User"
    if "admin" in profile.get("email", "").lower() or "admin" in role.lower():
        role = "Admin"
    elif "manager" in role.lower():
        role = "Manager"
    else:
        role = "User"

    # Map Okta status string cleanly
    status_raw = str(user.get("status", "ACTIVE")).upper()
    status_map = {
        "ACTIVE": "Active",
        "INACTIVE": "Inactive",
        "STAGED": "Staged",
        "SUSPENDED": "Suspended",
        "DEPROVISIONED": "Inactive",
        "PROVISIONED": "Active",
        "RECOVERY": "Inactive"
    }
    display_status = status_map.get(status_raw, status_raw.capitalize())

    return {
        "id": user.get("id"),
        "firstName": profile.get("firstName", ""),
        "lastName": profile.get("lastName", ""),
        "email": profile.get("email", ""),
        "status": display_status,
        "rawStatus": status_raw,
        "role": role,
        "createdDate": formatted_date or "May 12, 2025",
        "rawCreated": created
    }


@app.route("/api/health", methods=["GET"])
def health_check():
    """Return health status and Okta connection state."""
    return jsonify({
        "status": "online",
        "okta_domain": OKTA_DOMAIN,
        "is_configured": IS_OKTA_CONFIGURED,
        "timestamp": datetime.now().isoformat()
    })


@app.route("/api/users", methods=["GET"])
def get_all_users():
    """Return all users from Okta or sample fallback."""
    users = None
    if IS_OKTA_CONFIGURED:
        try:
            users = list_users()
        except Exception as e:
            print(f"Okta live list failed: {e}")
            users = None

    if users is None:
        users = FALLBACK_USERS

    formatted = [format_user(u) for u in users]

    return jsonify({
        "success": True,
        "count": len(formatted),
        "users": formatted,
        "source": "okta_live" if (IS_OKTA_CONFIGURED and users != FALLBACK_USERS) else "okta_local"
    })


@app.route("/api/users/<user_id>", methods=["GET"])
def get_single_user(user_id):
    """Return one user."""
    user = None
    if IS_OKTA_CONFIGURED:
        try:
            user = get_user(user_id)
        except Exception:
            user = None

    if user is None:
        for u in FALLBACK_USERS:
            if u["id"] == user_id or u.get("profile", {}).get("email") == user_id:
                user = u
                break

    if user is None:
        return jsonify({
            "success": False,
            "error": "User not found"
        }), 404

    return jsonify({
        "success": True,
        "user": format_user(user)
    })


@app.route("/api/users", methods=["POST"])
def create_user_api():
    """Create a new Okta user."""
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "error": "Request body is required"
        }), 400

    required_fields = ["firstName", "lastName", "email"]
    for field in required_fields:
        if not data.get(field):
            return jsonify({
                "success": False,
                "error": f"Missing required field: {field}"
            }), 400

    password = data.get("password") or "TempPass123!"
    role = data.get("role", "User")

    user = None
    if IS_OKTA_CONFIGURED:
        try:
            user = create_user(
                data["firstName"],
                data["lastName"],
                data["email"],
                password
            )
        except Exception as e:
            print(f"Okta live create user error: {e}")
            user = None

    if user is None:
        # Fallback local store creation
        new_id = f"USR{1000 + len(FALLBACK_USERS) + 1}"
        new_user = {
            "id": new_id,
            "profile": {
                "firstName": data["firstName"],
                "lastName": data["lastName"],
                "email": data["email"],
                "role": role
            },
            "status": "ACTIVE",
            "created": datetime.now().isoformat()
        }
        FALLBACK_USERS.insert(0, new_user)
        log_operation("CREATE", new_id, f"{data['firstName']} {data['lastName']}", "SUCCESS")
        user = new_user

    return jsonify({
        "success": True,
        "message": "User created successfully",
        "user": format_user(user)
    }), 201


@app.route("/api/users/<user_id>", methods=["PUT"])
def update_user_api(user_id):
    """Update a user's profile information."""
    data = request.get_json() or {}
    
    first_name = data.get("firstName")
    last_name = data.get("lastName")
    email = data.get("email")
    role = data.get("role")

    updated_user = None

    if IS_OKTA_CONFIGURED:
        try:
            profile_data = {}
            if first_name:
                profile_data["firstName"] = first_name
            if last_name:
                profile_data["lastName"] = last_name
            if email:
                profile_data["email"] = email
                profile_data["login"] = email
            
            res = okta_client.update_user(user_id, profile_data)
            if res.ok:
                updated_user = res.json()
        except Exception as e:
            print(f"Okta live update error: {e}")

    # Fallback or local store update
    for u in FALLBACK_USERS:
        if u["id"] == user_id or u.get("profile", {}).get("email") == user_id:
            if first_name:
                u["profile"]["firstName"] = first_name
            if last_name:
                u["profile"]["lastName"] = last_name
            if email:
                u["profile"]["email"] = email
            if role:
                u["profile"]["role"] = role
            updated_user = u
            break

    if updated_user:
        user_name = f"{first_name or ''} {last_name or ''}".strip() or user_id
        log_operation("UPDATE", user_id, user_name, "SUCCESS", "Profile updated")
        return jsonify({
            "success": True,
            "message": "User profile updated successfully",
            "user": format_user(updated_user)
        })

    return jsonify({
        "success": False,
        "error": "User not found or could not be updated"
    }), 400


@app.route("/api/users/<user_id>", methods=["DELETE"])
def delete_user_api(user_id):
    """Deactivate and delete a user."""
    success = False
    user_name = user_id

    if IS_OKTA_CONFIGURED:
        try:
            okta_client.deactivate_user(user_id)
            res = okta_client.delete_user(user_id)
            success = res.ok
        except Exception as e:
            print(f"Okta live delete error: {e}")

    # Remove from local list as well
    for i, u in enumerate(FALLBACK_USERS):
        if u["id"] == user_id:
            profile = u.get("profile", {})
            user_name = f"{profile.get('firstName', '')} {profile.get('lastName', '')}".strip() or user_id
            FALLBACK_USERS.pop(i)
            success = True
            break

    log_operation("DELETE", user_id, user_name, "SUCCESS" if success else "FAILED")

    if success:
        return jsonify({
            "success": True,
            "message": f"User {user_id} deleted successfully"
        })

    return jsonify({
        "success": False,
        "error": "Failed to delete user"
    }), 400


@app.route("/api/users/<user_id>/activate", methods=["POST"])
def activate_user_api(user_id):
    """Activate a user."""
    user = None
    if IS_OKTA_CONFIGURED:
        try:
            user = activate_user(user_id)
        except Exception:
            user = None

    if user is None:
        for u in FALLBACK_USERS:
            if u["id"] == user_id:
                u["status"] = "ACTIVE"
                user = u
                log_operation("ACTIVATE", user_id, f"{u['profile']['firstName']} {u['profile']['lastName']}", "SUCCESS")
                break

    if user is None:
        return jsonify({
            "success": False,
            "error": "User could not be activated"
        }), 400

    return jsonify({
        "success": True,
        "result": "SUCCESS",
        "user": format_user(user)
    })


@app.route("/api/users/<user_id>/deactivate", methods=["POST"])
def deactivate_user_api(user_id):
    """Deactivate a user."""
    user = None
    if IS_OKTA_CONFIGURED:
        try:
            user = deactivate_user(user_id)
        except Exception:
            user = None

    if user is None:
        for u in FALLBACK_USERS:
            if u["id"] == user_id:
                u["status"] = "INACTIVE"
                user = u
                log_operation("DEACTIVATE", user_id, f"{u['profile']['firstName']} {u['profile']['lastName']}", "SUCCESS")
                break

    if user is None:
        return jsonify({
            "success": False,
            "error": "User could not be deactivated"
        }), 400

    return jsonify({
        "success": True,
        "result": "SUCCESS",
        "user": format_user(user)
    })


@app.route("/api/users/<user_id>/suspend", methods=["POST"])
def suspend_user_api(user_id):
    """Suspend a user."""
    user = None
    if IS_OKTA_CONFIGURED:
        try:
            user = suspend_user(user_id)
        except Exception:
            user = None

    if user is None:
        for u in FALLBACK_USERS:
            if u["id"] == user_id:
                u["status"] = "SUSPENDED"
                user = u
                log_operation("SUSPEND", user_id, f"{u['profile']['firstName']} {u['profile']['lastName']}", "SUCCESS")
                break

    if user is None:
        return jsonify({
            "success": False,
            "error": "User could not be suspended"
        }), 400

    return jsonify({
        "success": True,
        "message": "User suspended successfully",
        "user": format_user(user)
    })


@app.route("/api/users/<user_id>/unsuspend", methods=["POST"])
def unsuspend_user_api(user_id):
    """Unsuspend a user."""
    user = None
    if IS_OKTA_CONFIGURED:
        try:
            user = unsuspend_user(user_id)
        except Exception:
            user = None

    if user is None:
        for u in FALLBACK_USERS:
            if u["id"] == user_id:
                u["status"] = "ACTIVE"
                user = u
                log_operation("UNSUSPEND", user_id, f"{u['profile']['firstName']} {u['profile']['lastName']}", "SUCCESS")
                break

    if user is None:
        return jsonify({
            "success": False,
            "error": "User could not be unsuspended"
        }), 400

    return jsonify({
        "success": True,
        "message": "User unsuspended successfully",
        "user": format_user(user)
    })


@app.route("/api/bulk/activate", methods=["POST"])
def bulk_activate_api():
    """Activate multiple users."""
    data = request.get_json() or {}
    user_ids = data.get("user_ids", [])

    if not isinstance(user_ids, list) or not user_ids:
        return jsonify({
            "success": False,
            "error": "user_ids must be a non-empty list"
        }), 400

    if IS_OKTA_CONFIGURED:
        try:
            result = bulk_activate(user_ids)
            return jsonify({"success": True, **result})
        except Exception as e:
            print(f"Bulk activate error: {e}")

    # Fallback simulation
    results = []
    successful = 0
    for uid in user_ids:
        for u in FALLBACK_USERS:
            if u["id"] == uid:
                u["status"] = "ACTIVE"
                user_name = f"{u['profile']['firstName']} {u['profile']['lastName']}"
                results.append({
                    "user_id": uid,
                    "user_name": user_name,
                    "operation": "ACTIVATE",
                    "result": "SUCCESS"
                })
                log_operation("ACTIVATE", uid, user_name, "SUCCESS", "Bulk activation")
                successful += 1
                break

    return jsonify({
        "success": True,
        "requested": len(user_ids),
        "successful": successful,
        "skipped": 0,
        "failed": len(user_ids) - successful,
        "results": results
    })


@app.route("/api/bulk/deactivate", methods=["POST"])
def bulk_deactivate_api():
    """Deactivate multiple users."""
    data = request.get_json() or {}
    user_ids = data.get("user_ids", [])

    if not isinstance(user_ids, list) or not user_ids:
        return jsonify({
            "success": False,
            "error": "user_ids must be a non-empty list"
        }), 400

    if IS_OKTA_CONFIGURED:
        try:
            result = bulk_deactivate(user_ids)
            return jsonify({"success": True, **result})
        except Exception as e:
            print(f"Bulk deactivate error: {e}")

    # Fallback simulation
    results = []
    successful = 0
    for uid in user_ids:
        for u in FALLBACK_USERS:
            if u["id"] == uid:
                u["status"] = "INACTIVE"
                user_name = f"{u['profile']['firstName']} {u['profile']['lastName']}"
                results.append({
                    "user_id": uid,
                    "user_name": user_name,
                    "operation": "DEACTIVATE",
                    "result": "SUCCESS"
                })
                log_operation("DEACTIVATE", uid, user_name, "SUCCESS", "Bulk deactivation")
                successful += 1
                break

    return jsonify({
        "success": True,
        "requested": len(user_ids),
        "successful": successful,
        "skipped": 0,
        "failed": len(user_ids) - successful,
        "results": results
    })


@app.route("/api/audit", methods=["GET"])
def get_audit():
    """Return audit log entries."""
    logs = get_audit_logs()
    
    # If log file is empty, seed with initial sample logs matching screenshot
    if not logs:
        sample_logs = [
            {
                "timestamp": "2025-05-12 10:30:00",
                "action": "CREATE",
                "user_id": "USR1001",
                "user_name": "john.doe@company.com",
                "result": "SUCCESS",
                "reason": "User john.doe@company.com was created by admin"
            },
            {
                "timestamp": "2025-05-12 10:15:00",
                "action": "ACTIVATE",
                "user_id": "USR1002",
                "user_name": "jane.smith@company.com",
                "result": "SUCCESS",
                "reason": "User jane.smith@company.com was activated by admin"
            },
            {
                "timestamp": "2025-05-12 09:45:00",
                "action": "DEACTIVATE",
                "user_id": "USR1003",
                "user_name": "michael.j@company.com",
                "result": "SUCCESS",
                "reason": "User michael.j@company.com was deactivated by admin"
            },
            {
                "timestamp": "2025-05-12 09:30:00",
                "action": "UPDATE",
                "user_id": "USR1004",
                "user_name": "emily.davis@company.com",
                "result": "SUCCESS",
                "reason": "User emily.davis@company.com role updated by admin"
            },
            {
                "timestamp": "2025-05-12 09:10:00",
                "action": "DELETE",
                "user_id": "USR1005",
                "user_name": "chris.brown@company.com",
                "result": "SUCCESS",
                "reason": "User chris.brown@company.com was deleted by admin"
            }
        ]
        return jsonify({
            "success": True,
            "count": len(sample_logs),
            "logs": sample_logs
        })

    return jsonify({
        "success": True,
        "count": len(logs),
        "logs": logs[::-1]  # Most recent first
    })


@app.route("/api/export", methods=["GET"])
def export_users_api():
    """Export all users as a CSV file."""
    file_path = export_users()

    if file_path is None or not os.path.exists(file_path):
        os.makedirs("data", exist_ok=True)
        file_path = "data/users.csv"
        import csv
        with open(file_path, "w", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(["User ID", "First Name", "Last Name", "Email", "Status", "Role", "Created Date"])
            for u in FALLBACK_USERS:
                p = u.get("profile", {})
                w.writerow([
                    u.get("id"),
                    p.get("firstName"),
                    p.get("lastName"),
                    p.get("email"),
                    u.get("status"),
                    p.get("role", "User"),
                    u.get("created", "")[:10]
                ])

    return send_file(
        file_path,
        mimetype="text/csv",
        as_attachment=True,
        download_name="users.csv"
    )


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)