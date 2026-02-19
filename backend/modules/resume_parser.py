"""
Module 1: Resume Parsing + Skill Extraction + Skill Level Estimation
Uses PyMuPDF (fitz) for PDF, python-docx for DOCX, spaCy + PhraseMatcher for skills
"""

import io
import re
from pathlib import Path
from typing import List, Dict, Any, Tuple

# PDF: PyMuPDF (fitz) - more accurate than PyPDF2
try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False

try:
    import docx
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False

from skills_taxonomy import (
    ALL_SKILLS,
    SKILL_SYNONYMS,
    normalize_skill,
    get_all_skills,
)


# Verb-based skill level estimation (rule-based)
ADVANCED_VERBS = {
    "architected", "designed", "developed", "implemented", "built", "created",
    "led", "managed", "optimized", "scaled", "deployed", "engineered",
    "established", "integrated", "refactored", "migrated"
}
INTERMEDIATE_VERBS = {
    "worked", "collaborated", "contributed", "maintained", "enhanced",
    "improved", "updated", "configured", "debugged", "tested"
}
BEGINNER_VERBS = {
    "used", "learned", "explored", "assisted", "helped", "supported"
}


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from PDF using PyMuPDF (fitz) - fallback to pdfminer if needed."""
    if HAS_PYMUPDF:
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            return text
        except Exception:
            pass

    # Fallback: PyPDF2
    try:
        import PyPDF2
        pdf_file = io.BytesIO(file_bytes)
        reader = PyPDF2.PdfReader(pdf_file)
        return "".join(page.extract_text() or "" for page in reader.pages)
    except Exception:
        return ""


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from DOCX."""
    if not HAS_DOCX:
        raise ImportError("python-docx is required for DOCX files")
    doc_file = io.BytesIO(file_bytes)
    doc = docx.Document(doc_file)
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def extract_text(file_bytes: bytes, filename: str) -> str:
    """Extract text from PDF or DOCX based on filename."""
    ext = Path(filename).suffix.lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_bytes)
    elif ext == ".docx":
        return extract_text_from_docx(file_bytes)
    raise ValueError(f"Unsupported format: {ext}. Use PDF or DOCX.")


def _init_matcher(nlp):
    """Initialize spaCy PhraseMatcher with skills."""
    from spacy.matcher import PhraseMatcher
    matcher = PhraseMatcher(nlp.vocab, attr="LOWER")
    skills = get_all_skills()
    patterns = [nlp.make_doc(s) for s in skills]
    for k, v in SKILL_SYNONYMS.items():
        if k not in skills:
            patterns.append(nlp.make_doc(k))
    matcher.add("SKILLS", patterns)
    return matcher


def extract_skills_from_text(text: str, nlp, matcher) -> List[str]:
    """Extract skills using spaCy PhraseMatcher + synonym matching + fuzzy matching."""
    from fuzzywuzzy import fuzz

    text_lower = text.lower()
    extracted = set()

    # 1. PhraseMatcher
    doc = nlp(text_lower)
    for _, start, end in matcher(doc):
        span = doc[start:end].text
        extracted.add(normalize_skill(span))

    # 2. Synonym matching
    for synonym, primary in SKILL_SYNONYMS.items():
        if synonym in text_lower:
            extracted.add(primary)

    # 3. Fuzzy match for typos
    words = re.findall(r"[a-z0-9+#./]+", text_lower)
    for w in words:
        if len(w) < 2:
            continue
        for primary in get_all_skills():
            if fuzz.ratio(w, primary) >= 90:
                extracted.add(primary)

    return list(extracted)


def estimate_skill_levels(text: str, skills: List[str]) -> Dict[str, str]:
    """
    Rule-based skill level: Advanced / Intermediate / Beginner
    Based on verbs + experience duration mentions.
    """
    text_lower = text.lower()
    levels = {}

    # Check for experience duration (years)
    year_match = re.findall(r"(\d+)\+?\s*(?:years?|yrs?)", text_lower)
    total_years = sum(int(m) for m in year_match[:5])  # cap at first 5 mentions

    for skill in skills:
        skill_lower = skill.lower()
        if skill_lower not in text_lower and not any(
            s in text_lower for s in SKILL_SYNONYMS if SKILL_SYNONYMS[s] == skill
        ):
            levels[skill] = "Beginner"  # mentioned only in skill list
            continue

        level = "Intermediate"

        # Check verbs near skill
        for adv in ADVANCED_VERBS:
            if adv in text_lower:
                idx = text_lower.find(adv)
                window = text_lower[max(0, idx - 150) : idx + 200]
                if skill_lower in window or any(s in window for s in SKILL_SYNONYMS if SKILL_SYNONYMS[s] == skill):
                    level = "Advanced"
                    break

        if level == "Intermediate":
            for beg in BEGINNER_VERBS:
                if beg in text_lower:
                    idx = text_lower.find(beg)
                    window = text_lower[max(0, idx - 100) : idx + 150]
                    if skill_lower in window:
                        level = "Beginner"
                        break

        # Experience-based override
        if total_years >= 4 and level == "Intermediate":
            level = "Advanced"
        elif total_years >= 2 and level == "Beginner":
            level = "Intermediate"

        levels[skill] = level

    return levels
