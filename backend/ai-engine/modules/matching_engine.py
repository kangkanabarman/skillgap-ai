"""
Unified AI matching pipeline: semantic similarity + TF-IDF + skill matching.
Used for job applications and preview matching.
"""

from typing import Any, Dict, List

import math
import re
from collections import Counter

from skills_taxonomy import normalize_skill
from modules.skill_matcher import (
    calculate_match_percentage,
    get_matched_skills,
    get_missing_skills,
)

_WORD_RE = re.compile(r"[a-zA-Z][a-zA-Z0-9_+\-\.]{1,}")
_STOPWORDS = {
    "the","and","for","with","that","this","are","you","your","from","have","has","will","can","our","we",
    "a","an","to","of","in","on","as","at","by","is","it","or","be","not","if","they","their","than",
}


def _tokenize(text: str) -> List[str]:
    words = [w.lower() for w in _WORD_RE.findall(text or "")]
    return [w for w in words if w not in _STOPWORDS and len(w) > 2]


def _cosine_sparse(v1: Dict[str, float], v2: Dict[str, float]) -> float:
    if not v1 or not v2:
        return 0.0
    # dot product over intersection
    dot = 0.0
    for k, a in v1.items():
        b = v2.get(k)
        if b is not None:
            dot += a * b
    n1 = math.sqrt(sum(a * a for a in v1.values()))
    n2 = math.sqrt(sum(b * b for b in v2.values()))
    if n1 == 0.0 or n2 == 0.0:
        return 0.0
    return dot / (n1 * n2)


def compute_tfidf_score(resume_text: str, job_text: str) -> float:
    """Cosine similarity of TF-IDF vectors (0–100 scale)."""
    if not resume_text or not job_text:
        return 0.0
    t1 = _tokenize(resume_text)
    t2 = _tokenize(job_text)
    if not t1 or not t2:
        return 0.0

    c1 = Counter(t1)
    c2 = Counter(t2)
    n1 = sum(c1.values()) or 1
    n2 = sum(c2.values()) or 1

    vocab = set(c1.keys()) | set(c2.keys())
    # idf over 2 docs: idf = log((N+1)/(df+1)) + 1
    tfidf1: Dict[str, float] = {}
    tfidf2: Dict[str, float] = {}
    for term in vocab:
        df = (1 if term in c1 else 0) + (1 if term in c2 else 0)
        idf = math.log((2 + 1) / (df + 1)) + 1.0
        tfidf1[term] = (c1.get(term, 0) / n1) * idf
        tfidf2[term] = (c2.get(term, 0) / n2) * idf

    score = _cosine_sparse(tfidf1, tfidf2)
    return round(float(score) * 100, 2)


def compute_full_match(
    resume_text: str,
    resume_skills: List[str],
    job_text: str,
    job_skills: List[str],
    semantic_fn,
) -> Dict[str, Any]:
    """
    Run full matching pipeline.
    semantic_fn: callable(resume_text, job_text) -> float in [0, 1]
    """
    resume_skills_norm = [normalize_skill(s) for s in resume_skills if s]
    job_skills_norm = [normalize_skill(s) for s in job_skills if s]

    if not job_skills_norm:
        job_skills_norm = []

    matched = get_matched_skills(resume_skills_norm, job_skills_norm) if job_skills_norm else []
    missing = get_missing_skills(resume_skills_norm, job_skills_norm) if job_skills_norm else []

    skill_match_score = (
        calculate_match_percentage(resume_skills_norm, job_skills_norm)
        if job_skills_norm
        else 0.0
    )

    job_blob = job_text or " ".join(job_skills_norm)
    semantic_raw = semantic_fn(resume_text or " ".join(resume_skills_norm), job_blob)
    semantic_score = round(semantic_raw * 100, 2)

    tfidf_score = compute_tfidf_score(
        resume_text or " ".join(resume_skills_norm),
        job_blob,
    )

    if job_skills_norm and len(missing) == 0:
        final_match_score = 99.9
    else:
        final_match_score = round(
            skill_match_score * 0.4 + semantic_score * 0.35 + tfidf_score * 0.25,
            2,
        )

    return {
        "semantic_score": semantic_score,
        "tfidf_score": tfidf_score,
        "skill_match_score": skill_match_score,
        "final_match_score": final_match_score,
        "matched_skills": matched,
        "missing_skills": missing,
        "resume_skills": resume_skills_norm,
        "job_skills": job_skills_norm,
    }


def build_ai_recommendation(
    final_score: float,
    missing_skills: List[str],
    role_title: str = "this role",
) -> str:
    """Rule-based improvement suggestion (no paid LLM)."""
    if not missing_skills:
        return (
            f"You are {final_score}% fit for {role_title}. "
            "Your skills align well — polish your portfolio and prepare for interviews."
        )
    top = missing_skills[:3]
    skills_str = " + ".join(top)
    potential = min(99, round(final_score + len(missing_skills) * 4, 1))
    return (
        f"You are {final_score}% fit for {role_title}. "
        f"Learning {skills_str} can increase your match to ~{potential}%."
    )


def build_applicant_summary(
    matched_skills: List[str],
    missing_skills: List[str],
    final_score: float,
) -> str:
    """Recruiter-facing AI summary."""
    if matched_skills and missing_skills:
        strong = ", ".join(matched_skills[:5])
        gaps = ", ".join(missing_skills[:5])
        return (
            f"Candidate scores {final_score}% overall. "
            f"Strong in {strong} but lacks {gaps} experience."
        )
    if matched_skills:
        return (
            f"Candidate scores {final_score}% with strong skills in "
            f"{', '.join(matched_skills[:6])}."
        )
    if missing_skills:
        return (
            f"Candidate scores {final_score}% and is missing "
            f"{', '.join(missing_skills[:6])}."
        )
    return f"Candidate scores {final_score}% — limited skill overlap detected."
