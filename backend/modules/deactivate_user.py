from okta_client import get_user
from okta_client import deactivate_user as api_deactivate_user
from audit.audit_logger import log_operation


def deactivate_user(user_id):
    """Deactivate an active Okta user."""

    response = get_user(user_id)

    if not response.ok:
        print("Failed to get user.")
        print(response.status_code)
        print(response.text)

        log_operation(
            "DEACTIVATE",
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

    # Already deprovisioned
    if current_status == "DEPROVISIONED":

        print(
            "User is already DEPROVISIONED. "
            "No action required."
        )

        log_operation(
            "DEACTIVATE",
            user_id,
            user_name,
            "SKIPPED",
            "User is already DEPROVISIONED"
        )

        user["_operation_result"] = "SKIPPED"
        user["_operation_reason"] = "User is already DEPROVISIONED"

        return user

    # Only ACTIVE users can be deactivated
    if current_status != "ACTIVE":

        reason = f"Invalid current state: {current_status}"

        print(
            f"User cannot be deactivated from "
            f"the current state: {current_status}"
        )

        log_operation(
            "DEACTIVATE",
            user_id,
            user_name,
            "SKIPPED",
            reason
        )

        return None

    # Deactivate user
    response = api_deactivate_user(user_id)

    if response.ok:

        print("User deactivated successfully!")

        updated_response = get_user(user_id)

        if updated_response.ok:

            updated_user = updated_response.json()

            print(
                "New status:",
                updated_user["status"]
            )

            log_operation(
                "DEACTIVATE",
                user_id,
                user_name,
                "SUCCESS"
            )

            updated_user["_operation_result"] = "SUCCESS"

            return updated_user

        log_operation(
            "DEACTIVATE",
            user_id,
            user_name,
            "SUCCESS"
        )

        user["_operation_result"] = "SUCCESS"

        return user

    # API failure
    print("Failed to deactivate user.")
    print(response.status_code)
    print(response.text)

    log_operation(
        "DEACTIVATE",
        user_id,
        user_name,
        "FAILED",
        response.text
    )

    return None