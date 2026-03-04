"""
Module 1 Step 2: Job Description Skill Mapping
Uses static job database + optional Hugging Face / scraping
"""

import os
import logging
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

# Comprehensive job database (Indian FAANG + product companies)
JOB_DATABASE = {
    "google_software_engineer": {
        "company": "Google",
        "role": "Software Engineer",
        "description": "Google is seeking experienced software engineers to build scalable systems.",
        "skills": [
            "python", "java", "c++", "javascript", "algorithms", "data structures",
            "system design", "distributed systems", "rest api", "testing", "git",
            "linux", "problem solving", "sql", "docker", "kubernetes", "microservices", "agile"
        ],
    },
    "google_data_analyst": {
    "company": "Google",
    "role": "Data Analyst",
    "description": "Google is hiring Data Analysts to analyze business data.",
    "skills": [
        "sql", "python", "excel", "data visualization",
        "tableau", "power bi", "statistics",
        "data cleaning", "communication"
        ],
    },
    "google_data_scientist": {
        "company": "Google",
        "role": "Data Scientist",
        "description": "Join Google as a Data Scientist to extract insights from massive datasets.",
        "skills": [
            "python", "sql", "machine learning", "statistics", "pandas", "numpy",
            "tensorflow", "data science", "data visualization", "tableau", "power bi",
            "deep learning", "nlp", "problem solving", "communication", "jupyter"
        ],
    },
    "microsoft_software_engineer": {
        "company": "Microsoft",
        "role": "Software Engineer",
        "description": "Microsoft seeks talented engineers to build cloud-native applications.",
        "skills": [
            "c#", "azure", "javascript", "typescript", "react", "sql", "git", "agile",
            "problem solving", "teamwork", "rest api", "microservices", "docker", "kubernetes", ".net"
        ],
    },
    "amazon_software_engineer": {
        "company": "Amazon",
        "role": "Software Engineer",
        "description": "Amazon backend engineering position for scalable services.",
        "skills": [
            "java", "python", "aws", "microservices", "rest api", "nosql",
            "distributed systems", "system design", "linux", "devops", "docker",
            "kubernetes", "sql", "dynamodb", "redis", "algorithms", "data structures"
        ],
    },
    "amazon_sde": {
        "company": "Amazon",
        "role": "SDE",
        "description": "Software Development Engineer at Amazon.",
        "skills": [
            "java", "python", "aws", "algorithms", "data structures", "system design",
            "microservices", "rest api", "docker", "linux", "problem solving"
        ],
    },
    "meta_software_engineer": {
        "company": "Meta",
        "role": "Software Engineer",
        "description": "Build the next generation of social products at Meta.",
        "skills": [
            "javascript", "typescript", "react", "graphql", "html", "css",
            "webpack", "redux", "rest api", "git", "testing", "jest", "algorithms"
        ],
    },
    "apple_software_engineer": {
        "company": "Apple",
        "role": "Software Engineer",
        "description": "Create amazing applications for millions of users.",
        "skills": [
            "swift", "ios", "javascript", "python", "rest api", "git",
            "ui/ux", "problem solving", "algorithms", "data structures"
        ],
    },
    "netflix_software_engineer": {
        "company": "Netflix",
        "role": "Software Engineer",
        "description": "Build streaming experiences for the world.",
        "skills": [
            "javascript", "typescript", "react", "node.js", "java", "aws",
            "microservices", "rest api", "graphql", "docker", "kubernetes"
        ],
    },
    "flipkart_software_engineer": {
        "company": "Flipkart",
        "role": "Software Engineer",
        "description": "Build e-commerce at scale for India.",
        "skills": [
            "java", "python", "javascript", "react", "aws", "microservices",
            "sql", "algorithms", "data structures", "system design", "git"
        ],
    },
    "swiggy_software_engineer": {
        "company": "Swiggy",
        "role": "Software Engineer",
        "description": "Build hyperlocal delivery technology.",
        "skills": [
            "java", "python", "javascript", "react", "aws", "sql",
            "microservices", "algorithms", "problem solving", "git"
        ],
    },
    "zomato_software_engineer": {
        "company": "Zomato",
        "role": "Software Engineer",
        "description": "Build food delivery and dining experiences.",
        "skills": [
            "java", "python", "javascript", "react", "aws", "sql",
            "microservices", "algorithms", "problem solving", "git"
        ],
    },
    "paytm_software_engineer": {
        "company": "Paytm",
        "role": "Software Engineer",
        "description": "Build fintech solutions for India.",
        "skills": [
            "java", "python", "javascript", "react", "sql", "aws",
            "microservices", "algorithms", "data structures", "problem solving"
        ],
    },
    "infosys_software_engineer": {
        "company": "Infosys",
        "role": "Software Engineer",
        "description": "Join Infosys as a software engineer.",
        "skills": [
            "java", "python", "sql", "javascript", "git", "agile",
            "problem solving", "communication", "teamwork"
        ],
    },

    "zoho_software_engineer": {
    "company": "Zoho",
    "role": "Software Engineer",
    "description": "Zoho is hiring backend and full-stack engineers.",
    "skills": [
        "java", "python", "mysql", "rest api", "microservices",
        "algorithms", "data structures", "problem solving", "git"
        ],
    },
    "tcs_software_engineer": {
        "company": "TCS",
        "role": "Software Engineer",
        "description": "Join TCS as a software engineer.",
        "skills": [
            "java", "python", "sql", "javascript", "git", "agile",
            "problem solving", "communication", "teamwork"
        ],
    },
}


def _normalize_key(company: str, role: str) -> str:
    return f"{company.lower().replace(' ', '_')}_{role.lower().replace(' ', '_')}"


def get_job_description(company: str, role: str) -> Dict[str, Any]:
    key = _normalize_key(company, role)

    # Exact match
    if key in JOB_DATABASE:
        return JOB_DATABASE[key]

    # Try role-only match (optional)
    role_key = role.lower().strip()
    for db_key in JOB_DATABASE:
        if db_key.endswith(f":{role_key}"):
            return JOB_DATABASE[db_key]

    # If nothing found → return None
    return None

    company_lower = company.lower().replace(" ", "_")
    for job_key, job_data in JOB_DATABASE.items():
        if company_lower in job_key:
            # Use same company, adjust role in response
            return {
                **job_data,
                "role": role,
            }

    # Generic fallback
    return {
        "company": company,
        "role": role,
        "description": f"{company} {role} position",
        "skills": [
            "programming", "problem solving", "communication", "teamwork",
            "git", "algorithms", "data structures", "system design"
        ],
    }

def get_default_skills_for_role(role: str):
    role_skills = {
        "backend": ["python", "apis", "sql", "django", "system design"],
        "frontend": ["react", "javascript", "css", "html"],
        "data": ["python", "pandas", "machine learning", "statistics"],
        "product": ["roadmapping", "stakeholders", "analytics"]
    }

    return role_skills.get(role, [])


def list_companies() -> List[str]:
    """List unique companies in job database."""
    return sorted(set(j["company"] for j in JOB_DATABASE.values()))


def list_roles(company: str = None) -> List[str]:
    """List roles, optionally filtered by company."""
    roles = []
    for j in JOB_DATABASE.values():
        if company and j["company"].lower() != company.lower():
            continue
        roles.append(j["role"])
    return sorted(set(roles))
