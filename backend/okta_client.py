import requests

from config import OKTA_DOMAIN, HEADERS


def get_user(user_id):
    """Get a single user from Okta."""

    url = f"{OKTA_DOMAIN}/api/v1/users/{user_id}"

    return requests.get(
        url,
        headers=HEADERS,
        timeout=10
    )


def get_users():
    """Get all users from Okta, including multiple pages."""

    users = []
    url = f"{OKTA_DOMAIN}/api/v1/users"

    while url:

        response = requests.get(
            url,
            headers=HEADERS,
            params={"limit": 200} if url.endswith("/users") else None,
            timeout=10
        )

        if not response.ok:
            return response

        users.extend(response.json())

        if "next" in response.links:
            url = response.links["next"]["url"]
        else:
            url = None

    return users


def create_user(data):
    """Create a new user in Okta."""

    url = f"{OKTA_DOMAIN}/api/v1/users?activate=false"

    return requests.post(
        url,
        headers=HEADERS,
        json=data,
        timeout=10
    )


def activate_user(user_id):
    """Activate a user in Okta."""

    url = (
        f"{OKTA_DOMAIN}/api/v1/users/"
        f"{user_id}/lifecycle/activate"
    )

    return requests.post(
        url,
        headers=HEADERS,
        timeout=10
    )


def deactivate_user(user_id):
    """Deactivate a user in Okta."""

    url = (
        f"{OKTA_DOMAIN}/api/v1/users/"
        f"{user_id}/lifecycle/deactivate"
    )

    return requests.post(
        url,
        headers=HEADERS,
        timeout=10
    )


def suspend_user(user_id):
    """Suspend a user in Okta."""

    url = (
        f"{OKTA_DOMAIN}/api/v1/users/"
        f"{user_id}/lifecycle/suspend"
    )

    return requests.post(
        url,
        headers=HEADERS,
        timeout=10
    )


def unsuspend_user(user_id):
    """Unsuspend a user in Okta."""

    url = (
        f"{OKTA_DOMAIN}/api/v1/users/"
        f"{user_id}/lifecycle/unsuspend"
    )

    return requests.post(
        url,
        headers=HEADERS,
        timeout=10
    )


def update_user(user_id, profile_data):
    """Update a user profile in Okta."""

    url = f"{OKTA_DOMAIN}/api/v1/users/{user_id}"

    return requests.post(
        url,
        headers=HEADERS,
        json={"profile": profile_data},
        timeout=10
    )


def delete_user(user_id):
    """Delete a deprovisioned user in Okta."""

    url = f"{OKTA_DOMAIN}/api/v1/users/{user_id}"

    return requests.delete(
        url,
        headers=HEADERS,
        timeout=10
    )