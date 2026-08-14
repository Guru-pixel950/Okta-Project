from modules.activate_user import activate_user
from okta_client import get_user
from audit.audit_logger import log_operation


def bulk_activate(user_ids):
    """Activate multiple users and collect detailed results."""

    results = []

    print("\n========================================")
    print("          BULK ACTIVATION")
    print("========================================")

    for user_id in user_ids:

        print(f"\nProcessing user: {user_id}")

        # Get status BEFORE attempting activation
        response = get_user(user_id)

        if not response.ok:

            log_operation(
                "ACTIVATE",
                user_id,
                "Unknown",
                "FAILED",
                "Unable to retrieve user"
            )

            results.append({
                "user_id": user_id,
                "operation": "ACTIVATE",
                "previous_status": "UNKNOWN",
                "new_status": "UNKNOWN",
                "result": "FAILED",
                "reason": "Unable to retrieve user"
            })

            continue

        user = response.json()

        profile = user.get("profile", {})

        user_name = (
            f"{profile.get('firstName', '')} "
            f"{profile.get('lastName', '')}"
        ).strip()

        previous_status = user["status"]

        # Already active
        if previous_status == "ACTIVE":

            reason = "User is already ACTIVE"

            print(f"{reason}. No action required.")

            log_operation(
                "ACTIVATE",
                user_id,
                user_name,
                "SKIPPED",
                reason
            )

            results.append({
                "user_id": user_id,
                "user_name": user_name,
                "operation": "ACTIVATE",
                "previous_status": "ACTIVE",
                "new_status": "ACTIVE",
                "result": "SKIPPED",
                "reason": reason
            })

            continue

        # Invalid state
        if previous_status != "STAGED":

            reason = (
                f"Cannot activate from state: "
                f"{previous_status}"
            )

            print(reason)

            log_operation(
                "ACTIVATE",
                user_id,
                user_name,
                "SKIPPED",
                reason
            )

            results.append({
                "user_id": user_id,
                "user_name": user_name,
                "operation": "ACTIVATE",
                "previous_status": previous_status,
                "new_status": previous_status,
                "result": "SKIPPED",
                "reason": reason
            })

            continue

        # Perform activation
        result = activate_user(user_id)

        if result:

            new_status = result.get("status", "UNKNOWN")

            if new_status == "ACTIVE":

                results.append({
                    "user_id": user_id,
                    "user_name": user_name,
                    "operation": "ACTIVATE",
                    "previous_status": previous_status,
                    "new_status": new_status,
                    "result": "SUCCESS",
                    "reason": ""
                })

            else:

                results.append({
                    "user_id": user_id,
                    "user_name": user_name,
                    "operation": "ACTIVATE",
                    "previous_status": previous_status,
                    "new_status": new_status,
                    "result": "FAILED",
                    "reason": "Activation did not result in ACTIVE state"
                })

        else:

            results.append({
                "user_id": user_id,
                "user_name": user_name,
                "operation": "ACTIVATE",
                "previous_status": previous_status,
                "new_status": "UNKNOWN",
                "result": "FAILED",
                "reason": "Activation request failed"
            })

    # Summary
    successful = sum(
        1 for result in results
        if result["result"] == "SUCCESS"
    )

    skipped = sum(
        1 for result in results
        if result["result"] == "SKIPPED"
    )

    failed = sum(
        1 for result in results
        if result["result"] == "FAILED"
    )

    print("\n========================================")
    print("       BULK ACTIVATION COMPLETE")
    print("========================================")

    print("Requested:", len(user_ids))
    print("Successful:", successful)
    print("Skipped:", skipped)
    print("Failed:", failed)

    return {
        "requested": len(user_ids),
        "successful": successful,
        "skipped": skipped,
        "failed": failed,
        "results": results
    }