"""
Module 1 Steps 3-4: Skill Matching (exact + fuzzy + semantic) and Match Calculation
"""

from typing import List, Set, Tuple
from fuzzywuzzy import fuzz

from skills_taxonomy import normalize_skill


def get_missing_skills(resume_skills: List[str], job_skills: List[str], fuzzy_threshold: int = 85) -> List[str]:
    """Compute missing skills: job_skills - resume_skills (with fuzzy matching)."""
    resume_norm = {normalize_skill(s) for s in resume_skills}
    job_norm = [normalize_skill(s) for s in job_skills]
    missing = []

    for js in job_norm:
        matched = False
        if js in resume_norm:
            matched = True
        else:
            for rs in resume_norm:
                if fuzz.ratio(js, rs) >= fuzzy_threshold:
                    matched = True
                    break
        if not matched:
            missing.append(js)

    return list(dict.fromkeys(missing))


def get_matched_skills(resume_skills: List[str], job_skills: List[str], fuzzy_threshold: int = 85) -> List[str]:
    """Get skills that match between resume and job."""
    missing = set(get_missing_skills(resume_skills, job_skills, fuzzy_threshold))
    job_norm = [normalize_skill(s) for s in job_skills]
    return [s for s in job_norm if s not in missing]


def calculate_match_percentage(resume_skills: List[str], job_skills: List[str]) -> float:
    """Calculate skill match % using exact + fuzzy matching."""
    if not job_skills:
        return 100.0

    matched = len(job_skills) - len(get_missing_skills(resume_skills, job_skills))
    return round((matched / len(job_skills)) * 100, 2)
