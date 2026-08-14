import os
from dotenv import load_dotenv

load_dotenv()

OKTA_DOMAIN = os.getenv("OKTA_DOMAIN", "https://integrator-7972368.okta.com")
OKTA_TOKEN = os.getenv("OKTA_TOKEN", "")

IS_OKTA_CONFIGURED = bool(
    OKTA_DOMAIN
    and OKTA_TOKEN
    and OKTA_TOKEN != "your_okta_token_here"
)

HEADERS = {
    "Authorization": f"SSWS {OKTA_TOKEN}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}