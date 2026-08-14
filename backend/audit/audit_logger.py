from datetime import datetime
import os


LOG_FILE = "data/audit.log"


def log_operation(action, user_id, user_name, result, reason=""):
    """Record a user lifecycle operation."""

    os.makedirs("data", exist_ok=True)

    timestamp = datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

    message = (
        f"{timestamp} | "
        f"{action} | "
        f"{user_id} | "
        f"{user_name} | "
        f"{result}"
    )

    if reason:
        message += f" | {reason}"

    with open(
        LOG_FILE,
        "a",
        encoding="utf-8"
    ) as file:

        file.write(message + "\n")

    print("Audit logged.")


def get_audit_logs():
    """Read all audit log entries."""

    if not os.path.exists(LOG_FILE):
        return []

    logs = []

    with open(
        LOG_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        for line in file:
            line = line.strip()

            if not line:
                continue

            parts = line.split(" | ")

            if len(parts) < 5:
                continue

            logs.append({
                "timestamp": parts[0],
                "action": parts[1],
                "user_id": parts[2],
                "user_name": parts[3],
                "result": parts[4],
                "reason": parts[5] if len(parts) > 5 else ""
            })

    return logs