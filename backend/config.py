import os
from dotenv import load_dotenv


load_dotenv()


OKTA_DOMAIN = os.getenv("OKTA_DOMAIN")
OKTA_TOKEN = os.getenv("OKTA_TOKEN")


if not OKTA_DOMAIN or not OKTA_TOKEN:
    raise ValueError(
        "OKTA_DOMAIN and OKTA_TOKEN must be set in the .env file."
    )


HEADERS = {
    "Authorization": f"SSWS {OKTA_TOKEN}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}