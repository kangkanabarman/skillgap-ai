import json
import os
import requests
from typing import Dict

DATA_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data",
    "companies.json"
)


def load_companies():
    with open(DATA_PATH, "r") as f:
        data = json.load(f)
    return set(company.lower() for company in data.get("companies", []))


LOCAL_COMPANIES = load_companies()


def check_wikipedia(company: str) -> bool:
    """
    Free Wikipedia existence check.
    """
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{company}"
    try:
        res = requests.get(url, timeout=5)
        return res.status_code == 200
    except Exception:
        return False


def validate_company(company: str) -> Dict:
    company = company.lower().strip()

    # 1️⃣ Local DB check
    if company in LOCAL_COMPANIES:
        return {
            "exists": True,
            "source": "local_db",
            "confidence": 1.0
        }

    # 2️⃣ Wikipedia fallback
    wiki_exists = check_wikipedia(company)
    if wiki_exists:
        return {
            "exists": True,
            "source": "wikipedia",
            "confidence": 0.8
        }

    return {
        "exists": False,
        "source": "none",
        "confidence": 0.0
    }