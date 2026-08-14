from okta_client import get_user
from okta_client import suspend_user as api_suspend_user
from audit.audit_logger import log_operation


def suspend_user(user_id):
    """Suspend an active Okta user."""

    # Check current status
    response = get_user(user_id)

    if not response.ok:
        print("Failed to get user.")
        print(response.status_code)
        print(response.text)

        log_operation(
            "SUSPEND",
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

    # Already suspended
    if current_status == "SUSPENDED":

        print(
            "User is already SUSPENDED. "
            "No action required."
        )

        log_operation(
            "SUSPEND",
            user_id,
            user_name,
            "SKIPPED",
            "User is already SUSPENDED"
        )

        return user

    # Only ACTIVE users can be suspended
    if current_status != "ACTIVE":

        reason = (
            f"Invalid current state: {current_status}"
        )

        print(
            f"User cannot be suspended from "
            f"the current state: {current_status}"
        )

        log_operation(
            "SUSPEND",
            user_id,
            user_name,
            "SKIPPED",
            reason
        )

        return None

    # Suspend user
    response = api_suspend_user(user_id)

    if response.ok:

        print("User suspended successfully!")

        # Get updated status
        updated_response = get_user(user_id)

        if updated_response.ok:

            updated_user = updated_response.json()

            print(
                "New status:",
                updated_user["status"]
            )

            log_operation(
                "SUSPEND",
                user_id,
                user_name,
                "SUCCESS"
            )

            return updated_user

        log_operation(
            "SUSPEND",
            user_id,
            user_name,
            "SUCCESS"
        )

        return True

    # API failure
    print("Failed to suspend user.")
    print(response.status_code)
    print(response.text)

    log_operation(
        "SUSPEND",
        user_id,
        user_name,
        "FAILED",
        response.text
    )

    return None