from okta_client import get_user
from okta_client import unsuspend_user as api_unsuspend_user
from audit.audit_logger import log_operation


def unsuspend_user(user_id):
    """Unsuspend a suspended Okta user."""

    response = get_user(user_id)

    if not response.ok:
        print("Failed to get user.")
        print(response.status_code)
        print(response.text)

        log_operation(
            "UNSUSPEND",
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

        print(
            "User is already ACTIVE. "
            "No action required."
        )

        log_operation(
            "UNSUSPEND",
            user_id,
            user_name,
            "SKIPPED",
            "User is already ACTIVE"
        )

        return user

    # Only SUSPENDED users can be unsuspended
    if current_status != "SUSPENDED":

        reason = (
            f"Invalid current state: {current_status}"
        )

        print(
            f"User cannot be unsuspended from "
            f"the current state: {current_status}"
        )

        log_operation(
            "UNSUSPEND",
            user_id,
            user_name,
            "SKIPPED",
            reason
        )

        return None

    # Unsuspend user
    response = api_unsuspend_user(user_id)

    if response.ok:

        print("User unsuspended successfully!")

        updated_response = get_user(user_id)

        if updated_response.ok:

            updated_user = updated_response.json()

            print(
                "New status:",
                updated_user["status"]
            )

            log_operation(
                "UNSUSPEND",
                user_id,
                user_name,
                "SUCCESS"
            )

            return updated_user

        log_operation(
            "UNSUSPEND",
            user_id,
            user_name,
            "SUCCESS"
        )

        return True

    # API failure
    print("Failed to unsuspend user.")
    print(response.status_code)
    print(response.text)

    log_operation(
        "UNSUSPEND",
        user_id,
        user_name,
        "FAILED",
        response.text
    )

    return None