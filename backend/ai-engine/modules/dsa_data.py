"""
Module 3: DSA Tracker (Master Bank Version)
Scalable filtering by company + topic
"""

import json
from pathlib import Path
from typing import List, Dict, Any, Optional

ROOT = Path(__file__).resolve().parent.parent
DSA_JSON = ROOT / "data" / "master_dsa_bank.json"


def load_dsa_problems() -> List[Dict[str, Any]]:
    try:
        with open(DSA_JSON, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def get_companies() -> List[str]:
    data = load_dsa_problems()
    companies = set()
    for p in data:
        for c in p.get("companies", []):
            companies.add(c)
    return sorted(companies)


def get_topics_by_company(company: str) -> List[str]:
    data = load_dsa_problems()
    topics = set()

    for p in data:
        if company in p.get("companies", []):
            for t in p.get("topics", []):
                topics.add(t)

    return sorted(topics)


def get_problems(company: str, topic: Optional[str] = None) -> List[Dict[str, Any]]:
    data = load_dsa_problems()
    results = []

    for p in data:
        if company not in p.get("companies", []):
            continue

        if topic and topic not in p.get("topics", []):
            continue

        results.append(p)

    return results