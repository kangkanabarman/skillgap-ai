import os
import requests
from typing import Optional, Dict, Any, List


def fetch_greenhouse_jobs(company: str) -> List[Dict[str, Any]]:
    url = f"https://boards-api.greenhouse.io/v1/boards/{company}/jobs"
    try:
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            return res.json().get("jobs", [])
    except Exception:
        pass
    return []


def fetch_lever_jobs(company: str) -> List[Dict[str, Any]]:
    url = f"https://api.lever.co/v0/postings/{company}?mode=json"
    try:
        res = requests.get(url, timeout=5)
        if res.status_code == 200:
            return res.json()
    except Exception:
        pass
    return []

def fetch_google_jobs(company: str, role: str) -> Optional[str]:
    """
    Universal fallback using SerpAPI Google Jobs search
    Requires SERPAPI_KEY in .env
    """
    api_key = os.environ.get("SERPAPI_KEY")
    if not api_key:
        return None

    params = {
    "engine": "google_jobs",
    "q": f'"{role}" "{company}"',
    "api_key": api_key,
}

    try:
        res = requests.get("https://serpapi.com/search", params=params, timeout=10)
        if res.status_code == 200:
            data = res.json()
            jobs = data.get("jobs_results", [])
            if jobs:
                return jobs[0].get("description")
    except Exception:
        pass

    return None

def find_matching_job(company: str, role: str) -> Optional[str]:
    role_lower = role.lower()

    # 1️⃣ Try Greenhouse
    gh_jobs = fetch_greenhouse_jobs(company)
    for job in gh_jobs:
        if role_lower in job["title"].lower():
            job_id = job["id"]
            detail_url = f"https://boards-api.greenhouse.io/v1/boards/{company}/jobs/{job_id}"
            try:
                res = requests.get(detail_url, timeout=5)
                if res.status_code == 200:
                    return res.json().get("content", "")
            except Exception:
                pass

    # 2️⃣ Try Lever
    lever_jobs = fetch_lever_jobs(company)
    for job in lever_jobs:
        if role_lower in job.get("text", "").lower():
            return job.get("descriptionPlain", "")

    # 3️⃣ Try Google Jobs
    google_job = fetch_google_jobs(company, role)
    if google_job:
        return google_job

    return None