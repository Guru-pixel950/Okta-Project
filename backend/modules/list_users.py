from okta_client import get_users as api_get_users


def list_users():
    """Get all users from Okta."""

    response = api_get_users()

    if hasattr(response, "ok") and not response.ok:
        return None

    if hasattr(response, "json"):
        return response.json()

    return response