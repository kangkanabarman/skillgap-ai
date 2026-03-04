"""
Skill Gap Analyzer - FastAPI Backend
Modular architecture: resume parsing, skill matching, job data, learning resources, news feed, DSA tracker
Uses FREE APIs only - no paid LLM (rule-based roadmaps)
"""

from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from modules.company_validator import validate_company
from modules.job_fetcher import find_matching_job
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import spacy

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from skills_taxonomy import normalize_skill
from modules.resume_parser import (
    extract_text,
    extract_skills_from_text,
    estimate_skill_levels,
    _init_matcher,
)
from modules.job_data import list_companies, list_roles
from modules.learning_resources import (
    build_rule_based_roadmap,
    get_learning_resources,
)
from modules.news_feed import get_job_news
from modules.dsa_data import (
    get_companies as get_dsa_companies,
    get_topics_by_company,
    get_problems,
    load_dsa_problems,
)
from modules.skill_matcher import get_missing_skills, calculate_match_percentage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")
# =========================
# Load Trained Transformer Model
# =========================

try:
    TRANSFORMER_PATH = ROOT_DIR / "ml" / "skillgap_transformer_v1"
    transformer_model = SentenceTransformer(str(TRANSFORMER_PATH))
    print("✅ Transformer model loaded")
except Exception as e:
    print("❌ Transformer model failed to load:", e)
    transformer_model = None

# MongoDB (optional - use MONGO_URL env)
mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
db_name = os.environ.get("DB_NAME", "skillgap")
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

JWT_SECRET = os.environ.get("JWT_SECRET", "default-secret-key")

# Load spaCy and matcher
nlp = spacy.load("en_core_web_sm")
matcher = _init_matcher(nlp)

app = FastAPI(title="SkillGap AI API", version="2.0")
api_router = APIRouter(prefix="/api")
security = HTTPBearer()


# Pydantic models
class UserRegister(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class TokenResponse(BaseModel):
    token: str
    email: str


class ResumeUploadResponse(BaseModel):
    resume_id: str
    extracted_text: str
    extracted_skills: List[str]
    skill_levels: Optional[Dict[str, str]] = None


class JobSelectionRequest(BaseModel):
    company: str
    role: str


class SkillGapAnalysis(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    resume_id: str
    company: str
    role: str
    resume_skills: List[str]
    job_skills: List[str]
    missing_skills: List[str]
    match_percentage: float
    confidence_score: float
    confidence_level: str
    fallback_used: str   
    learning_roadmap: str
    learning_resources: Optional[Dict[str, List[Dict[str, Any]]]] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class CareerTestAnswer(BaseModel):
    question_id: int
    answer: str


class CareerTestSubmission(BaseModel):
    answers: List[CareerTestAnswer]


class CareerTestResult(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    answers: List[Dict[str, Any]]
    career_path: str
    explanation: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Auth helpers
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def create_token(email: str) -> str:
    payload = {"email": email, "exp": datetime.now(timezone.utc) + timedelta(days=30)}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def verify_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload["email"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    email = verify_token(credentials.credentials)
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# Rule-based career path analysis (no LLM)
def analyze_career_path_rule_based(answers: List[Dict[str, Any]]) -> Dict[str, str]:
    """Map answers to career path using rule-based scoring (no paid API)."""
    scores = {"backend": 0, "data": 0, "frontend": 0, "product": 0}
    option_map = {
        0: "backend",
        1: "data",
        2: "frontend",
        3: "product",
    }
    for a in answers:
        ans = a.get("answer", "")
        qid = a.get("question_id", 1)
        opts = ["Break it down", "Building something", "Code and algorithms", "Logical thinking"]
        idx = 0
        if isinstance(ans, str):
            ans_lower = ans.lower()
            if "data" in ans_lower or "pattern" in ans_lower or "analysis" in ans_lower:
                idx = 1
            elif "design" in ans_lower or "creative" in ans_lower or "visual" in ans_lower:
                idx = 2
            elif "team" in ans_lower or "people" in ans_lower or "manage" in ans_lower:
                idx = 3
        key = option_map.get(idx, "backend")
        scores[key] = scores.get(key, 0) + 1

    best = max(scores, key=scores.get)
    path_map = {
        "backend": ("Backend/Full-Stack Development", "You show strong logical thinking and interest in building scalable systems. Focus on algorithms, system design, and backend technologies."),
        "data": ("Data Science / Machine Learning", "You enjoy finding patterns and extracting insights. Focus on statistics, Python, ML frameworks, and data visualization."),
        "frontend": ("Frontend / UI Engineering", "You have a creative eye and care about user experience. Focus on React, CSS, design systems, and accessibility."),
        "product": ("Product Management", "You thrive coordinating people and shipping products. Focus on communication, analytics, and product strategy."),
    }
    path, explanation = path_map.get(best, path_map["backend"])
    return {"career_path": path, "explanation": explanation}


def compute_ai_similarity(resume_text: str, job_text: str) -> float:
    """
    Compute semantic similarity using trained transformer model.
    Returns score between 0 and 1.
    """
    if transformer_model is None:
        return 0.0

    emb1 = transformer_model.encode(resume_text)
    emb2 = transformer_model.encode(job_text)

    score = cosine_similarity([emb1], [emb2])[0][0]
    return float(score)

def validate_company_and_role(company: str, role: str):
    """
    Strict validation:
    - Company must exist
    - Role must exist
    - Role must belong to company (if mapped)
    """

    if not company or len(company.strip()) < 2:
        raise HTTPException(status_code=400, detail="Invalid company name.")

    if not role or len(role.strip()) < 2:
        raise HTTPException(status_code=400, detail="Invalid role name.")

    company = company.strip()
    role = role.strip()

    valid_companies = list_companies()
    valid_companies_lower = [c.lower() for c in valid_companies]

    if company.lower() not in valid_companies_lower:
        raise HTTPException(
            status_code=400,
            detail=f"Company '{company}' is not supported."
        )

    valid_roles = list_roles(company)
    valid_roles_lower = [r.lower() for r in valid_roles]

    if role.lower() not in valid_roles_lower:
        raise HTTPException(
            status_code=400,
            detail=f"Role '{role}' is not valid for company '{company}'."
        )

    return True

# Routes
@api_router.get("/")
async def root():
    return {"message": "SkillGap AI API", "status": "running", "version": "2.0"}
    


@api_router.post("/auth/register", response_model=TokenResponse)
async def register(user_input: UserRegister):
    existing = await db.users.find_one({"email": user_input.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(email=user_input.email, password_hash=hash_password(user_input.password))
    doc = user.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.users.insert_one(doc)

    token = create_token(user.email)
    return TokenResponse(token=token, email=user.email)


@api_router.post("/auth/login", response_model=TokenResponse)
async def login(user_input: UserLogin):
    user = await db.users.find_one({"email": user_input.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(user_input.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user["email"])
    return TokenResponse(token=token, email=user["email"])


@api_router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return {"email": current_user["email"]}


@api_router.post("/resume/upload", response_model=ResumeUploadResponse)
async def upload_resume(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    if not file.filename or not file.filename.lower().endswith((".pdf", ".docx")):
        raise HTTPException(status_code=400, detail="Invalid format. Use PDF or DOCX.")

    file_bytes = await file.read()

    try:
        text = extract_text(file_bytes, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    if not text or len(text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Could not extract text. Ensure file has readable content.")

    skills = extract_skills_from_text(text, nlp, matcher)
    if not skills:
        raise HTTPException(status_code=400, detail="No skills detected. Add technical skills to your resume.")

    skill_levels = estimate_skill_levels(text, skills)

    resume_id = str(uuid.uuid4())
    resume_doc = {
        "id": resume_id,
        "user_id": current_user["id"],
        "filename": file.filename,
        "text": text,
        "skills": skills,
        "skill_levels": skill_levels,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.resumes.insert_one(resume_doc)

    return ResumeUploadResponse(
        resume_id=resume_id,
        extracted_text=text[:500],
        extracted_skills=skills,
        skill_levels=skill_levels,
    )


@api_router.post("/skill-analysis", response_model=SkillGapAnalysis)
async def analyze_skill_gap(
    job_request: JobSelectionRequest,
    current_user: dict = Depends(get_current_user),
): 
    # Strict validation
    validate_company_and_role(
    job_request.company,
    job_request.role
)



    # STEP 2 — Get latest resume
    resume = await db.resumes.find_one(
        {"user_id": current_user["id"]},
        {"_id": 0},
        sort=[("created_at", -1)],
    )

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="No resume found. Upload a resume first.",
        )

    # ==============================
    # FALLBACK CASCADE (UPDATED)
    # ==============================

    job_skills_raw = []
    fallback_used = "NONE"
    job_description_text = None


    # ----------------------------------
    # STEP 1 — PREDEFINED STATIC ROLES
    # ----------------------------------
    try:
        from modules.job_data import get_default_skills_for_role

        predefined_skills = get_default_skills_for_role(job_request.role)

        if predefined_skills:
            job_skills_raw = predefined_skills
            fallback_used = "PREDEFINED_STATIC"

    except Exception:
        pass


    # ----------------------------------
    # STEP 2 — EXTERNAL JOB API
    # ----------------------------------
    if not job_skills_raw:

        job_description_text = find_matching_job(
            job_request.company.lower(),
            job_request.role.lower()
        )

        if job_description_text:
            job_skills_raw = extract_skills_from_text(
                job_description_text,
                nlp,
                matcher
            )
            fallback_used = "JOB_API"


    # ----------------------------------
    # STEP 3 — YOUR ML MODEL
    # ----------------------------------
    if not job_skills_raw:
        try:
            from modules.role_similarity import predict_role_from_text
            from modules.job_data import get_default_skills_for_role

            prediction = predict_role_from_text(
                f"{job_request.company} {job_request.role}"
            )

            predicted_role = prediction["predicted_role"]

            job_skills_raw = get_default_skills_for_role(predicted_role)

            fallback_used = "EMBEDDING_MODEL"

        except Exception:
            pass


    # ----------------------------------
    # STEP 4 — OLLAMA LLM (FINAL)
    # ----------------------------------
    if not job_skills_raw:
        try:
            from modules.llm_fallback import generate_skills_llm

            job_skills_raw = generate_skills_llm(
                job_request.company,
                job_request.role
            )

            fallback_used = "OLLAMA_LLM"

        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Unable to determine skills for this role."
            )
    # Normalize skills
    resume_skills = [normalize_skill(s) for s in resume.get("skills", [])]
    job_skills = [normalize_skill(s) for s in job_skills_raw]

    if not job_skills:
        raise HTTPException(
            status_code=400,
            detail="Could not extract skills for this role."
        )

    if not resume_skills:
        raise HTTPException(
            status_code=400,
            detail="No skills extracted from resume."
        )

    # STEP 5 — Confidence Score
    # =========================
    # AI Semantic Similarity
    # =========================

    if job_description_text:
        similarity_score = compute_ai_similarity(
            resume["text"],
            job_description_text
    )
    else:
        similarity_score = compute_ai_similarity(
            resume["text"],
            " ".join(job_skills)
        )

    confidence_score = similarity_score

    if confidence_score > 0.75:
        confidence_level = "High"
    elif confidence_score > 0.5:
        confidence_level = "Medium"
    else:
        confidence_level = "Low"


    # STEP 6 — Skill Matching
    missing_skills = get_missing_skills(resume_skills, job_skills)

    rule_based_score = calculate_match_percentage(
        resume_skills,
        job_skills,
    )
    print("Rule score:", rule_based_score)
    print("Similarity:", confidence_score)
    print("Fallback used:", fallback_used)

    # Combine rule-based + AI similarity
    match_percentage = round(
        (rule_based_score * 0.6) + (confidence_score * 100 * 0.4),2
    )

    # 🚀 If no missing skills, almost perfect match
    if len(missing_skills) == 0:
        match_percentage = 99.9

    roadmap = build_rule_based_roadmap(
        missing_skills,
        job_request.role,
    )

    learning_resources = get_learning_resources(missing_skills)

    analysis = SkillGapAnalysis(
        user_id=current_user["id"],
        resume_id=resume["id"],
        company=job_request.company,
        role=job_request.role,
        resume_skills=resume_skills,
        job_skills=job_skills,
        missing_skills=missing_skills,
        match_percentage=match_percentage,
        confidence_score=confidence_score,
        confidence_level=confidence_level,
        fallback_used=fallback_used,
        learning_roadmap=roadmap,
        learning_resources=learning_resources,
    )

    doc = analysis.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()

    await db.skill_analyses.insert_one(doc)

    return analysis



@api_router.get("/skill-analyses")
async def get_skill_analyses(current_user: dict = Depends(get_current_user)):
    analyses = await db.skill_analyses.find({"user_id": current_user["id"]}, {"_id": 0}).sort(
        "created_at", -1
    ).to_list(100)
    return analyses


@api_router.get("/jobs/companies")
async def jobs_companies():
    """List companies for job selection."""
    return list_companies()


@api_router.get("/jobs/roles")
async def jobs_roles(company: Optional[str] = None):
    """List roles, optionally filtered by company."""
    return list_roles(company)


# Career test (rule-based, no LLM)
@api_router.get("/career-test/questions")
async def get_career_test_questions():
    return [
        {"id": 1, "question": "When faced with a complex problem, I prefer to:", "options": ["Break it down into smaller logical steps", "Brainstorm creative solutions", "Research how others solved similar problems", "Discuss with team members"]},
        {"id": 2, "question": "I feel most energized when:", "options": ["Building something from scratch", "Analyzing data and patterns", "Designing user experiences", "Managing projects and people"]},
        {"id": 3, "question": "My ideal work environment is:", "options": ["Quiet space for deep focus", "Collaborative team setting", "Fast-paced and dynamic", "Structured with clear goals"]},
        {"id": 4, "question": "I learn best by:", "options": ["Hands-on practice and experimentation", "Reading documentation and theory", "Visual demonstrations and videos", "Teaching others"]},
        {"id": 5, "question": "When starting a new project, I:", "options": ["Jump right into coding", "Plan everything meticulously", "Sketch out designs first", "Define success metrics"]},
        {"id": 6, "question": "I'm most interested in:", "options": ["How things work technically", "Understanding user behavior", "Making things look beautiful", "Business impact and metrics"]},
        {"id": 7, "question": "My communication style is:", "options": ["Detailed and technical", "Visual and illustrative", "Concise and data-driven", "Story-telling and persuasive"]},
        {"id": 8, "question": "I prefer working with:", "options": ["Code and algorithms", "Data and statistics", "Design tools and prototypes", "People and processes"]},
        {"id": 9, "question": "Success to me means:", "options": ["Building elegant technical solutions", "Solving complex analytical problems", "Creating delightful user experiences", "Shipping products that users love"]},
        {"id": 10, "question": "I'm naturally good at:", "options": ["Logical thinking and problem-solving", "Finding patterns in data", "Visual design and aesthetics", "Organization and planning"]},
        {"id": 11, "question": "My ideal project involves:", "options": ["Building scalable systems", "Extracting insights from data", "Crafting intuitive interfaces", "Coordinating team efforts"]},
        {"id": 12, "question": "I get frustrated when:", "options": ["Code is poorly structured", "Decisions aren't data-driven", "Designs lack polish", "Projects lack clear direction"]},
        {"id": 13, "question": "My favorite part of tech is:", "options": ["Writing clean, efficient code", "Discovering insights through analysis", "Creating beautiful user experiences", "Bringing ideas to life"]},
        {"id": 14, "question": "I'm drawn to problems that are:", "options": ["Technically challenging", "Analytically complex", "Creatively open-ended", "Strategically important"]},
        {"id": 15, "question": "My workflow style is:", "options": ["Systematic and methodical", "Exploratory and iterative", "Intuitive and experimental", "Structured with milestones"]},
        {"id": 16, "question": "I feel accomplished when:", "options": ["My code runs perfectly", "I find meaningful patterns", "Users love the interface", "The project ships on time"]},
        {"id": 17, "question": "I prefer to focus on:", "options": ["Backend architecture", "Data pipelines and models", "Frontend design", "Product strategy"]},
        {"id": 18, "question": "My ideal tools are:", "options": ["IDEs and terminals", "Jupyter notebooks and SQL", "Figma and Sketch", "Jira and roadmaps"]},
        {"id": 19, "question": "I'm most curious about:", "options": ["New programming languages", "Machine learning algorithms", "Design trends", "Market opportunities"]},
        {"id": 20, "question": "At the end of the day, I want to have:", "options": ["Written solid code", "Uncovered insights", "Created something beautiful", "Made progress on goals"]},
    ]


@api_router.post("/career-test/submit", response_model=CareerTestResult)
async def submit_career_test(submission: CareerTestSubmission, current_user: dict = Depends(get_current_user)):
    answers_dict = [ans.model_dump() for ans in submission.answers]
    result = analyze_career_path_rule_based(answers_dict)

    test_result = CareerTestResult(
        user_id=current_user["id"],
        answers=answers_dict,
        career_path=result["career_path"],
        explanation=result["explanation"],
    )
    doc = test_result.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    await db.career_test_results.insert_one(doc)
    return test_result


@api_router.get("/career-test/results")
async def get_career_test_results(current_user: dict = Depends(get_current_user)):
    results = await db.career_test_results.find({"user_id": current_user["id"]}, {"_id": 0}).sort(
        "created_at", -1
    ).to_list(100)
    return results


# Module 2: Job News Feed (public)
@api_router.get("/news/jobs")
async def get_news(count: int = 15):
    """Get real-time hiring/job news (GNews API - requires GNEWS_API_KEY)."""
    articles = await get_job_news(count=count)
    return {"articles": articles}


# Module 3: DSA Tracker by Company (public)
@api_router.get("/dsa/companies")
async def dsa_companies():
    """List companies with DSA problems."""
    return get_dsa_companies()


@api_router.get("/dsa/topics")
async def dsa_topics(company: str):
    """Get DSA topics for a company."""
    return get_topics_by_company(company)


@api_router.get("/dsa/problems")
async def dsa_problems(company: str, topic: Optional[str] = None):
    """Get DSA problems for a company, optionally filtered by topic."""
    return get_problems(company, topic)


@api_router.get("/dsa/all")
async def dsa_all():
    """Get all DSA data (for frontend)."""
    return load_dsa_problems()


# Mount router and middleware
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
