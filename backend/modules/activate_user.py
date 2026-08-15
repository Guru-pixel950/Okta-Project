from okta_client import get_user, activate_user as api_activate_user
from audit.audit_logger import log_operation


def activate_user(user_id):
    """Activate a staged Okta user."""

    response = get_user(user_id)

    if not response.ok:
        print("Failed to get user.")
        print(response.status_code)
        print(response.text)

        log_operation(
            "ACTIVATE",
            user_id,
            "Unknown",
            "FAILED",
            "Unable to retrieve user"
        )

        return None

    user = response.json()
    current_status = user["status"]

    profile = user.get("profile", {})

    user_name = (
        f"{profile.get('firstName', '')} "
        f"{profile.get('lastName', '')}"
    ).strip()

    print("Current status:", current_status)

    # Already active
    if current_status == "ACTIVE":

        print("User is already ACTIVE. No action required.")

        log_operation(
            "ACTIVATE",
            user_id,
            user_name,
            "SKIPPED",
            "User is already ACTIVE"
        )

        user["_operation_result"] = "SKIPPED"
        user["_operation_reason"] = "User is already ACTIVE"

        return user

    # If SUSPENDED, unsuspend instead
    if current_status == "SUSPENDED":
        from okta_client import unsuspend_user as api_unsuspend_user
        response = api_unsuspend_user(user_id)
        if response.ok:
            log_operation("ACTIVATE", user_id, user_name, "SUCCESS", "Unsuspended to Active")
            updated_user = get_user(user_id).json() if get_user(user_id).ok else user
            updated_user["_operation_result"] = "SUCCESS"
            return updated_user

    # Activate user from STAGED, PROVISIONED, or DEPROVISIONED
    response = api_activate_user(user_id)


    if response.ok:

        print("User activated successfully!")

        updated_response = get_user(user_id)

        if updated_response.ok:

            updated_user = updated_response.json()

            print(
                "New status:",
                updated_user["status"]
            )

            log_operation(
                "ACTIVATE",
                user_id,
                user_name,
                "SUCCESS"
            )

            updated_user["_operation_result"] = "SUCCESS"

            return updated_user

        log_operation(
            "ACTIVATE",
            user_id,
            user_name,
            "SUCCESS"
        )

        user["_operation_result"] = "SUCCESS"

        return user

    # API failure
    print("Failed to activate user.")
    print(response.status_code)
    print(response.text)

    log_operation(
        "ACTIVATE",
        user_id,
        user_name,
        "FAILED",
        response.text
    )

    return None