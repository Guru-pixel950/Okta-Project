from okta_client import create_user as api_create_user
from audit.audit_logger import log_operation


def create_user(first_name, last_name, email, password):
    """Create a new Okta user."""

    data = {
        "profile": {
            "firstName": first_name,
            "lastName": last_name,
            "email": email,
            "login": email
        },
        "credentials": {
            "password": {
                "value": password
            }
        }
    }

    response = api_create_user(data)

    if response.ok:
        user = response.json()

        user_id = user["id"]
        user_name = f"{first_name} {last_name}"

        print("User created successfully!")
        print("User ID:", user_id)
        print("Status:", user["status"])

        log_operation(
            "CREATE",
            user_id,
            user_name,
            "SUCCESS"
        )

        return user

    print("Failed to create user.")
    print("Status:", response.status_code)
    print(response.text)

    log_operation(
        "CREATE",
        "UNKNOWN",
        f"{first_name} {last_name}",
        "FAILED",
        response.text
    )

    return None