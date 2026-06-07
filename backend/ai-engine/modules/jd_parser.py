"""
Job Description parsing — extract skills, technologies, keywords from text or files.
"""

from typing import Any, Dict, List

from modules.resume_parser import extract_text, extract_skills_from_text


def parse_jd_text(text: str, nlp, matcher) -> Dict[str, Any]:
    """Parse JD plain text into structured fields."""
    if not text or len(text.strip()) < 10:
        return {
            "raw_text": text or "",
            "skills": [],
            "technologies": [],
            "keywords": [],
            "requirements": [],
            "qualifications": [],
        }

    skills = extract_skills_from_text(text, nlp, matcher)
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]

    requirements = []
    qualifications = []
    keywords = []

    for line in lines:
        lower = line.lower()
        if any(k in lower for k in ["require", "must have", "mandatory", "essential"]):
            requirements.append(line[:200])
        elif any(k in lower for k in ["qualif", "degree", "bachelor", "master", "cgpa", "gpa"]):
            qualifications.append(line[:200])
        elif len(line.split()) <= 6 and line[0].isupper():
            keywords.append(line)

    return {
        "raw_text": text[:10000],
        "skills": skills,
        "technologies": skills[:20],
        "keywords": list(dict.fromkeys(keywords))[:30],
        "requirements": requirements[:20],
        "qualifications": qualifications[:20],
    }


def parse_jd_file(file_bytes: bytes, filename: str, nlp, matcher) -> Dict[str, Any]:
    """Parse uploaded JD PDF/DOCX."""
    text = extract_text(file_bytes, filename)
    parsed = parse_jd_text(text, nlp, matcher)
    parsed["filename"] = filename
    return parsed
