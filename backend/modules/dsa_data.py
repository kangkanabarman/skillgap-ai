"""
Module 3: DSA Tracker by Company
Loads problems from dsa_problems.json (Striver SDE Sheet / Love Babbar 450 style)
"""

import json
from pathlib import Path
from typing import List, Dict, Any, Optional

ROOT = Path(__file__).resolve().parent.parent
DSA_JSON = ROOT / "data" / "dsa_problems.json"


def load_dsa_problems() -> List[Dict[str, Any]]:
    """Load DSA problems from JSON."""
    try:
        with open(DSA_JSON, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def get_companies() -> List[str]:
    """Get unique company names."""
    data = load_dsa_problems()
    return sorted(set(d["company"] for d in data))


def get_topics_by_company(company: str) -> List[str]:
    """Get topics for a company."""
    data = load_dsa_problems()
    return sorted(
        set(d["topic"] for d in data if d["company"].lower() == company.lower())
    )


def get_problems(company: str, topic: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Get DSA problems for a company, optionally filtered by topic.
    Returns list of {topic, problems: [{title, url, difficulty}]}
    """
    data = load_dsa_problems()
    result = []
    for d in data:
        if d["company"].lower() != company.lower():
            continue
        if topic and d["topic"].lower() != topic.lower():
            continue
        result.append({
            "topic": d["topic"],
            "problems": d.get("problems", []),
        })
    return result


def get_all_problems_flat(company: str, topic: Optional[str] = None) -> List[Dict[str, Any]]:
    """Get flattened list of problems for a company."""
    chunks = get_problems(company, topic)
    flat = []
    for c in chunks:
        for p in c.get("problems", []):
            flat.append({
                **p,
                "topic": c["topic"],
            })
    return flat
