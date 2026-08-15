import requests
from okta_client import authenticate, get_user_roles
from modules.create_user import create_user
from audit.audit_logger import log_operation


def is_super_admin(user_id):
    """
    Query Okta /api/v1/users/{user_id}/roles to check if user has active SUPER_ADMIN role.
    """
    if not user_id:
        return False
    try:
        response = get_user_roles(user_id)
        if response.ok:
            roles = response.json()
            if isinstance(roles, list):
                for r in roles:
                    if r.get("status") == "ACTIVE" and (
                        r.get("type") == "SUPER_ADMIN" or 
                        "super administrator" in (r.get("label") or "").lower() or
                        "super_admin" in (r.get("type") or "").lower()
                    ):
                        return True
    except Exception as e:
        print(f"Error checking Okta roles for {user_id}: {e}")
    return False


def login_user(username, password, selected_role="Administrator"):
    """
    Authenticate user directly against Okta Primary Authn API (/api/v1/authn)
    and verify Okta Super Administrator permissions.
    """
    clean_username = username.strip()
    
    # 1. Call Okta Primary Authentication API
    try:
        response = authenticate(clean_username, password)
    except Exception as e:
        log_operation("LOGIN", "UNKNOWN", clean_username, "FAILED", f"Network error: {str(e)}")
        return {
            "success": False,
            "error": f"Failed to reach Okta authentication server: {str(e)}"
        }

    if response.status_code == 200:
        auth_data = response.json()
        status = auth_data.get("status")

        if status == "SUCCESS":
            embedded = auth_data.get("_embedded", {})
            user_info = embedded.get("user", {})
            user_id = user_info.get("id") or "okta_user"
            
            profile = user_info.get("profile", {})
            first_name = profile.get("firstName", "")
            last_name = profile.get("lastName", "")
            user_login = profile.get("login") or clean_username
            user_email = profile.get("email") or user_login
            full_name = f"{first_name} {last_name}".strip() or user_login

            # 2. Check Super Admin privileges in Okta
            user_is_super_admin = is_super_admin(user_id)

            # If user selected Administrator, enforce Okta Super Admin role check
            if selected_role == "Administrator":
                if not user_is_super_admin:
                    log_operation(
                        "LOGIN",
                        user_id,
                        full_name,
                        "FAILED",
                        "Access Denied: User does not have Okta Super Administrator privileges"
                    )
                    return {
                        "success": False,
                        "error": "Access Denied: Only Okta Super Administrators have privilege to access the Administrator Dashboard. Your account does not have Super Admin permissions in Okta.",
                        "status_code": 403,
                        "isSuperAdmin": False
                    }
                effective_role = "Administrator"
            else:
                effective_role = "User"

            # Record successful login in audit trail
            log_operation(
                "LOGIN",
                user_id,
                full_name,
                "SUCCESS",
                f"Role: {effective_role} | Super Admin: {user_is_super_admin} | Okta Auth"
            )

            return {
                "success": True,
                "sessionToken": auth_data.get("sessionToken"),
                "role": effective_role,
                "isSuperAdmin": user_is_super_admin,
                "user": {
                    "id": user_id,
                    "firstName": first_name,
                    "lastName": last_name,
                    "email": user_email,
                    "status": "ACTIVE",
                    "created": ""
                }
            }

        elif status in ["PASSWORD_WARN", "MFA_REQUIRED", "MFA_ENROLL"]:
            embedded = auth_data.get("_embedded", {})
            user_info = embedded.get("user", {})
            user_id = user_info.get("id") or "okta_user"
            profile = user_info.get("profile", {})
            
            user_is_super_admin = is_super_admin(user_id)
            if selected_role == "Administrator" and not user_is_super_admin:
                log_operation("LOGIN", user_id, clean_username, "FAILED", "Access Denied: Not a Super Admin")
                return {
                    "success": False,
                    "error": "Access Denied: Only Okta Super Administrators have privilege to access the Administrator Dashboard.",
                    "status_code": 403,
                    "isSuperAdmin": False
                }

            log_operation("LOGIN", user_id, clean_username, "SUCCESS", f"Status: {status}")
            
            return {
                "success": True,
                "sessionToken": auth_data.get("sessionToken", "mfa_pending"),
                "role": "Administrator" if selected_role == "Administrator" and user_is_super_admin else "User",
                "isSuperAdmin": user_is_super_admin,
                "user": {
                    "id": user_id,
                    "firstName": profile.get("firstName", clean_username),
                    "lastName": profile.get("lastName", ""),
                    "email": clean_username,
                    "status": "ACTIVE"
                }
            }

    # Error handling from Okta
    error_summary = "Authentication failed. Invalid username or password in Okta tenant."
    try:
        err_json = response.json()
        error_summary = err_json.get("errorSummary") or err_json.get("errorCauses", [{}])[0].get("errorSummary", error_summary)
    except Exception:
        pass

    log_operation("LOGIN", "UNKNOWN", clean_username, "FAILED", error_summary)

    return {
        "success": False,
        "error": error_summary,
        "status_code": response.status_code or 401
    }


def signup_user(first_name, last_name, email, password):
    """
    Provision a new user in the Okta tenant and log the signup event.
    """
    clean_email = email.strip().lower()
    clean_first = first_name.strip()
    clean_last = last_name.strip()

    # Create the user directly in Okta
    created = create_user(
        first_name=clean_first,
        last_name=clean_last,
        email=clean_email,
        password=password
    )

    if not created or (isinstance(created, dict) and "_error" in created):
        error_msg = created.get("_error") if isinstance(created, dict) else "Failed to provision user in Okta"
        return {
            "success": False,
            "error": error_msg
        }

    user_id = created.get("id")
    profile = created.get("profile", {})

    log_operation("SIGNUP", user_id, f"{clean_first} {clean_last}", "SUCCESS", "Okta Tenant")

    return {
        "success": True,
        "message": "User registered and provisioned in Okta successfully",
        "user": {
            "id": user_id,
            "firstName": profile.get("firstName", clean_first),
            "lastName": profile.get("lastName", clean_last),
            "email": profile.get("email", clean_email),
            "status": created.get("status", "ACTIVE"),
            "created": created.get("created", "")
        }
    }
