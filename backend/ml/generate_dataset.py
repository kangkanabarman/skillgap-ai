import csv
import time
import os
import requests

api_key = os.environ.get("SERPAPI_KEY")

roles_by_label = {
    "backend": [
        "backend engineer",
        "software engineer backend",
        "api developer",
        "python developer",
        "java backend developer"
    ],
    "data": [
        "data scientist",
        "machine learning engineer",
        "data analyst",
        "data engineer",
        "ai engineer"
    ],
    "frontend": [
        "frontend engineer",
        "react developer",
        "ui engineer",
        "javascript developer",
        "frontend developer"
    ],
    "product": [
        "product manager",
        "technical product manager",
        "associate product manager",
        "product owner",
        "growth product manager"
    ],
}

output_file = os.path.join(os.path.dirname(__file__), "dataset.csv")

def fetch_jobs_by_role(role_query):
    params = {
        "engine": "google_jobs",
        "q": role_query,
        "api_key": api_key,
    }

    res = requests.get("https://serpapi.com/search", params=params)
    if res.status_code == 200:
        return res.json().get("jobs_results", [])
    return []

with open(output_file, mode="w", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)
    writer.writerow(["text", "label"])

    for label, role_list in roles_by_label.items():
        print(f"\nCollecting for category: {label}")

        for role_query in role_list:
            print(f"  Fetching: {role_query}")

            jobs = fetch_jobs_by_role(role_query)
            print("Jobs returned:", len(jobs))

            for job in jobs:

                desc = job.get("description") or job.get("description_html") or ""

                if not desc:
                    highlights = job.get("job_highlights", [])
                    if highlights:
                        desc = " ".join(
                            item
                            for group in highlights
                            for item in group.get("items", [])
                        )

                if desc and len(desc) > 100:
                    writer.writerow([desc.replace("\n", " "), label])
                    print("     Saved ✔")

            time.sleep(2)  # rate limit

print("\nDataset expansion complete!")