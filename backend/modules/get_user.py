from okta_client import get_user as api_get_user


def get_user(user_id):
    """Get information about one Okta user."""

    response = api_get_user(user_id)

    if not response.ok:
        return None

    return response.json()