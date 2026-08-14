import csv
import os

from okta_client import get_users


def export_users():
    """Export all Okta users to a CSV file."""

    users = get_users()

    # Handle API failure
    if hasattr(users, "ok"):

        if not users.ok:
            return None

        users = users.json()

    if not users:
        return None

    # Make sure data directory exists
    os.makedirs("data", exist_ok=True)

    file_path = "data/users.csv"

    with open(
        file_path,
        "w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.writer(file)

        writer.writerow([
            "ID",
            "First Name",
            "Last Name",
            "Email",
            "Status"
        ])

        for user in users:

            profile = user.get("profile", {})

            writer.writerow([
                user.get("id", ""),
                profile.get("firstName", ""),
                profile.get("lastName", ""),
                profile.get("email", ""),
                user.get("status", "")
            ])

    return file_path