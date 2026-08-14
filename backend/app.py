from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

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

from audit.audit_logger import get_audit_logs


app = Flask(__name__)

# Allow frontend requests during development
CORS(app)


def format_user(user):
    """Return a simplified user response."""

    profile = user.get("profile", {})

    return {
        "id": user.get("id"),
        "firstName": profile.get("firstName", ""),
        "lastName": profile.get("lastName", ""),
        "email": profile.get("email", ""),
        "status": user.get("status")
    }


@app.route("/api/users", methods=["GET"])
def get_all_users():
    """Return all users."""

    users = list_users()

    if users is None:
        return jsonify({
            "success": False,
            "error": "Failed to retrieve users"
        }), 500

    return jsonify({
        "success": True,
        "count": len(users),
        "users": [
            format_user(user)
            for user in users
        ]
    })


@app.route("/api/users/<user_id>", methods=["GET"])
def get_single_user(user_id):
    """Return one user."""

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


@app.route("/api/users", methods=["POST"])
def create_user_api():
    """Create a new Okta user."""

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
        data["firstName"],
        data["lastName"],
        data["email"],
        data["password"]
    )

    if user is None:
        return jsonify({
            "success": False,
            "error": "Failed to create user"
        }), 400

    return jsonify({
        "success": True,
        "message": "User created successfully",
        "user": format_user(user)
    }), 201


@app.route("/api/users/<user_id>/activate", methods=["POST"])
def activate_user_api(user_id):
    """Activate a user."""

    user = activate_user(user_id)

    if user is None:
        return jsonify({
            "success": False,
            "error": "User could not be activated"
        }), 400

    result = user.pop("_operation_result", "SUCCESS")
    reason = user.pop("_operation_reason", "")

    return jsonify({
        "success": True,
        "result": result,
        "reason": reason,
        "user": format_user(user)
    })


@app.route("/api/users/<user_id>/deactivate", methods=["POST"])
def deactivate_user_api(user_id):
    """Deactivate a user."""

    user = deactivate_user(user_id)

    if user is None:
        return jsonify({
            "success": False,
            "error": "User could not be deactivated"
        }), 400

    result = user.pop("_operation_result", "SUCCESS")
    reason = user.pop("_operation_reason", "")

    return jsonify({
        "success": True,
        "result": result,
        "reason": reason,
        "user": format_user(user)
    })


@app.route("/api/users/<user_id>/suspend", methods=["POST"])
def suspend_user_api(user_id):
    """Suspend a user."""

    user = suspend_user(user_id)

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

    user = unsuspend_user(user_id)

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

    return jsonify({
        "success": True,
        "count": len(logs),
        "logs": logs
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
        download_name="users.csv"
    )


if __name__ == "__main__":
    app.run(debug=False)