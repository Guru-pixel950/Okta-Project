from modules.deactivate_user import deactivate_user
from okta_client import get_user
from audit.audit_logger import log_operation


def bulk_deactivate(user_ids):
    """Deactivate multiple users and collect detailed results."""

    results = []

    print("\n========================================")
    print("          BULK DEACTIVATION")
    print("========================================")

    for user_id in user_ids:

        print(f"\nProcessing user: {user_id}")

        # Get current status before attempting deactivation
        response = get_user(user_id)

        if not response.ok:

            log_operation(
                "DEACTIVATE",
                user_id,
                "Unknown",
                "FAILED",
                "Unable to retrieve user"
            )

            results.append({
                "user_id": user_id,
                "operation": "DEACTIVATE",
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

        # Already deprovisioned
        if previous_status == "DEPROVISIONED":

            reason = "User is already DEPROVISIONED"

            print(
                f"{reason}. "
                "No action required."
            )

            log_operation(
                "DEACTIVATE",
                user_id,
                user_name,
                "SKIPPED",
                reason
            )

            results.append({
                "user_id": user_id,
                "user_name": user_name,
                "operation": "DEACTIVATE",
                "previous_status": "DEPROVISIONED",
                "new_status": "DEPROVISIONED",
                "result": "SKIPPED",
                "reason": reason
            })

            continue

        # Only ACTIVE users can be deactivated
        if previous_status != "ACTIVE":

            reason = (
                f"Cannot deactivate from state: "
                f"{previous_status}"
            )

            print(reason)

            log_operation(
                "DEACTIVATE",
                user_id,
                user_name,
                "SKIPPED",
                reason
            )

            results.append({
                "user_id": user_id,
                "user_name": user_name,
                "operation": "DEACTIVATE",
                "previous_status": previous_status,
                "new_status": previous_status,
                "result": "SKIPPED",
                "reason": reason
            })

            continue

        # Perform deactivation
        result = deactivate_user(user_id)

        if result:

            new_status = result.get("status", "UNKNOWN")

            if new_status == "DEPROVISIONED":

                results.append({
                    "user_id": user_id,
                    "user_name": user_name,
                    "operation": "DEACTIVATE",
                    "previous_status": previous_status,
                    "new_status": new_status,
                    "result": "SUCCESS",
                    "reason": ""
                })

            else:

                results.append({
                    "user_id": user_id,
                    "user_name": user_name,
                    "operation": "DEACTIVATE",
                    "previous_status": previous_status,
                    "new_status": new_status,
                    "result": "FAILED",
                    "reason": (
                        "Deactivation did not result "
                        "in DEPROVISIONED state"
                    )
                })

        else:

            results.append({
                "user_id": user_id,
                "user_name": user_name,
                "operation": "DEACTIVATE",
                "previous_status": previous_status,
                "new_status": "UNKNOWN",
                "result": "FAILED",
                "reason": "Deactivation request failed"
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
    print("       BULK DEACTIVATION COMPLETE")
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