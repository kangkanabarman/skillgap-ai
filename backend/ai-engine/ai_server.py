"""
SkillGap AI — Python AI microservice.
Handles resume/JD parsing, semantic matching, and skill analysis.
"""

from pathlib import Path
import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel
from typing import List, Optional
import spacy
import uvicorn

ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")

from modules.resume_parser import extract_text, extract_skills_from_text, estimate_skill_levels, _init_matcher
from modules.jd_parser import parse_jd_file, parse_jd_text
from modules.matching_engine import compute_full_match
from skills_taxonomy import normalize_skill

nlp = spacy.load("en_core_web_sm")
matcher = _init_matcher(nlp)

try:
    from sentence_transformers import SentenceTransformer
    transformer_model = SentenceTransformer(str(ROOT / "ml" / "skillgap_transformer_v1"))
    print("Transformer model loaded")
except Exception as e:
    print("Transformer model failed:", e)
    transformer_model = None


def compute_ai_similarity(resume_text: str, job_text: str) -> float:
    if not transformer_model:
        return 0.5
    emb = transformer_model.encode([resume_text or "", job_text or ""])
    from numpy import dot
    from numpy.linalg import norm
    if norm(emb[0]) == 0 or norm(emb[1]) == 0:
        return 0.0
    return float(dot(emb[0], emb[1]) / (norm(emb[0]) * norm(emb[1])))


app = FastAPI(title="SkillGap AI Engine", version="2.0")


class JdTextRequest(BaseModel):
    description: str


class MatchRequest(BaseModel):
    resume_text: str = ""
    resume_skills: List[str] = []
    job_text: str = ""
    job_skills: List[str] = []


class SkillAnalysisRequest(BaseModel):
    company: str
    role: str
    resume_text: str
    resume_skills: List[str]
    user_id: str
    resume_id: str


@app.get("/ai/health")
async def health():
    return {
        "status": "running",
        "transformer_loaded": transformer_model is not None,
    }


@app.post("/ai/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith((".pdf", ".docx")):
        raise HTTPException(400, "Invalid format. Use PDF or DOCX.")
    data = await file.read()
    text = extract_text(data, file.filename)
    skills = extract_skills_from_text(text, nlp, matcher)
    levels = estimate_skill_levels(text, skills)
    return {"text": text, "skills": skills, "skill_levels": levels}


@app.post("/ai/parse-jd-text")
async def parse_jd_text_endpoint(payload: JdTextRequest):
    return parse_jd_text(payload.description, nlp, matcher)


@app.post("/ai/parse-jd-file")
async def parse_jd_file_endpoint(file: UploadFile = File(...)):
    data = await file.read()
    return parse_jd_file(data, file.filename, nlp, matcher)


@app.post("/ai/compute-match")
async def compute_match(payload: MatchRequest):
    return compute_full_match(
        payload.resume_text,
        payload.resume_skills,
        payload.job_text,
        payload.job_skills,
        compute_ai_similarity,
    )


@app.post("/ai/skill-analysis")
async def skill_analysis(payload: SkillAnalysisRequest):
    from modules.job_data import get_job_description, get_default_skills_for_role
    from modules.skill_matcher import get_missing_skills, calculate_match_percentage
    from modules.learning_resources import build_rule_based_roadmap, get_learning_resources

    job_skills = get_job_description(payload.company, payload.role)
    fallback = "static"
    if not job_skills:
        job_skills = get_default_skills_for_role(payload.role)
        fallback = "default_role"

    resume_skills = [normalize_skill(s) for s in payload.resume_skills]
    job_skills_norm = [normalize_skill(s) for s in job_skills]
    missing = get_missing_skills(resume_skills, job_skills_norm)
    match_pct = calculate_match_percentage(resume_skills, job_skills_norm)
    semantic = compute_ai_similarity(payload.resume_text, " ".join(job_skills_norm))
    final_pct = round(match_pct * 0.6 + semantic * 100 * 0.4, 2)
    roadmap = build_rule_based_roadmap(missing, payload.role)
    resources = get_learning_resources(missing[:5])

    return {
        "resume_id": payload.resume_id,
        "company": payload.company,
        "role": payload.role,
        "resume_skills": resume_skills,
        "job_skills": job_skills_norm,
        "missing_skills": missing,
        "match_percentage": final_pct,
        "confidence_score": round(semantic * 100, 2),
        "confidence_level": "high" if semantic > 0.6 else "medium",
        "fallback_used": fallback,
        "learning_roadmap": roadmap,
        "learning_resources": resources,
    }


if __name__ == "__main__":
    port = int(os.environ.get("AI_PORT", "8001"))
    uvicorn.run(app, host="127.0.0.1", port=port)
