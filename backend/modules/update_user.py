from okta_client import update_user as api_update_user
from audit.audit_logger import log_operation


def update_user_profile(user_id, profile_updates):
    """
    Update user profile attributes in Okta.
    """
    response = api_update_user(user_id, profile_updates)

    if response.ok:
        user = response.json()
        profile = user.get("profile", {})
        full_name = f"{profile.get('firstName', '')} {profile.get('lastName', '')}".strip() or user_id

        log_operation(
            "UPDATE",
            user_id,
            full_name,
            "SUCCESS",
            f"Updated fields: {', '.join(profile_updates.keys())}"
        )
        return user

    error_detail = response.text
    try:
        err_json = response.json()
        error_detail = err_json.get("errorSummary") or response.text
    except Exception:
        pass

    log_operation(
        "UPDATE",
        user_id,
        user_id,
        "FAILED",
        error_detail
    )

    return {"_error": error_detail, "status_code": response.status_code}
