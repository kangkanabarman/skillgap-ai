# SkillGap AI - Technical Documentation

## Table of Contents
1. [Full Tech Stack](#full-tech-stack)
2. [Architecture Overview](#architecture-overview)
3. [Core Features & Logic](#core-features--logic)
4. [Data Flow & Processing](#data-flow--processing)
5. [API Endpoints](#api-endpoints)
6. [ML/AI Components](#mlai-components)
7. [Frontend Architecture](#frontend-architecture)
8. [Database Schema](#database-schema)

---

## Full Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TailwindCSS | Styling |
| shadcn/ui | Component Library |
| Recharts | Data Visualization |
| Framer Motion | Animations |
| React Router | Navigation |
| Axios | HTTP Client |

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | Web Framework |
| Python 3.11+ | Runtime |
| MongoDB (Motor) | Database |
| spaCy | NLP Processing |
| Sentence Transformers | Semantic Embeddings |
| scikit-learn | ML/Classification |

### External APIs (Free Tier)
| API | Purpose |
|-----|---------|
| GNews API | Job/Hiring News |
| YouTube Data API | Video Resources |

### Key Python Libraries
- `fitz` (PyMuPDF) - PDF parsing
- `python-docx` - DOCX parsing
- `fuzzywuzzy` - Fuzzy string matching
- `bcrypt` - Password hashing
- `PyJWT` - JWT authentication
- `httpx` - Async HTTP client

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐ │
│  │Dashboard│ │ Upload  │ │ Skill   │ │  Job    │ │   DSA      │ │
│  │         │ │Resume   │ │Analysis │ │ News    │ │  Tracker   │ │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └──────┬──────┘ │
└───────┼──────────┼──────────┼──────────┼──────────────┼─────────┘
        │          │          │          │              │
        └──────────┴──────────┴──────────┴──────────────┘
                              │
                     ┌────────▼────────┐
                     │   FASTAPI       │
                     │  Backend        │
                     │  (Port 8000)    │
                     └────────┬────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
   ┌─────▼─────┐      ┌───────▼──────┐    ┌──────▼──────┐
   │  Resume   │      │    Skill     │    │    DSA     │
   │  Parser   │      │   Matcher    │    │   Data     │
   └─────┬─────┘      └───────┬──────┘    └─────────────┘
         │                    │
   ┌─────▼─────┐      ┌───────▼──────┐
   │  spaCy    │      │  Sentence    │
   │  + Fuzzy  │      │ Transformers │
   └───────────┘      └──────────────┘
         │                    │
         └────────────────────┼────────────────────┐
                              │                    │
                      ┌───────▼──────┐    ┌───────▼───────┐
                      │   MongoDB    │    │  GNews API   │
                      │   Database   │    │  (News Feed) │
                      └──────────────┘    └───────────────┘
```

---

## Core Features & Logic

### 1. Resume Parsing & Skill Extraction

**Process Flow:**
```
Upload Resume (PDF/DOCX)
         │
         ▼
┌─────────────────────┐
│  Extract Text       │  ──► fitz (PDF) / python-docx (DOCX)
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Skill Extraction  │  ──► spaCy PhraseMatcher + Fuzzy Matching
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Skill Levels      │  ──► Rule-based (verb analysis)
└─────────────────────┘
```

**Key Components:**
- **PDF Parsing**: Uses PyMuPDF (fitz) for accurate PDF text extraction
- **DOCX Parsing**: Uses python-docx library
- **Skill Detection**: spaCy PhraseMatcher with 100+ tech skills
- **Fuzzy Matching**: fuzzywuzzy (90% threshold) for typo tolerance
- **Synonym Mapping**: Maps variations (e.g., "ReactJS" → "react")

**Skill Level Estimation Logic:**
```
1. Parse resume text
2. Find skill mentions
3. Analyze nearby verbs:
   - Advanced: "architected", "designed", "implemented", "led"
   - Intermediate: "worked", "collaborated", "maintained"
   - Beginner: "used", "learned", "explored"
4. Check experience duration (years mentioned)
5. Apply rules to determine level
```

### 2. Job Description Skill Mapping (Fallback Cascade)

The system uses a **4-layer fallback cascade** to get job skills:

```
Layer 1: PREDEFINED_STATIC
    │
    ├── Check static JOB_DATABASE (Google, Amazon, Meta, etc.)
    └── Returns predefined skills for known roles

    ▼ If not found
Layer 2: JOB_API (External)
    │
    ├── Use job_fetcher to scrape/search job descriptions
    ├── Extract skills using spaCy + PhraseMatcher
    └── Returns dynamically fetched skills

    ▼ If not found
Layer 3: EMBEDDING_MODEL (ML)
    │
    ├── Use SentenceTransformer (all-MiniLM-L6-v2)
    ├── Predict role category (backend/frontend/data/product)
    └── Map to default skills for that category

    ▼ If not found
Layer 4: OLLAMA_LLM (Final)
    │
    ├── Use local Ollama LLM (Llama 3.2)
    ├── Generate skills based on company + role
    └── Last resort - requires local LLM setup
```

**Static Job Database (Sample):**
```python
JOB_DATABASE = {
    "google_software_engineer": {
        "company": "Google",
        "role": "Software Engineer",
        "skills": ["python", "java", "c++", "algorithms", "data structures", ...]
    },
    # ... 15+ companies with roles
}
```

### 3. Skill Matching & Gap Analysis

**Matching Algorithm:**
```
Resume Skills: [python, javascript, react, git]
Job Skills:    [python, java, aws, docker, react, algorithms]

Exact Match:  python, react ✓
Fuzzy Match:   (90% threshold)
Missing:       java, aws, docker, algorithms
```

**Match Percentage Calculation:**
```python
# Rule-based score (60% weight)
rule_score = (matched_skills / total_job_skills) * 100

# AI similarity score (40% weight)
ai_score = compute_ai_similarity(resume_text, job_description) * 100

# Final score
match_percentage = (rule_score * 0.6) + (ai_score * 0.4)
```

### 4. AI Semantic Similarity

**Using Sentence Transformers:**
```python
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

# Load trained model
model = SentenceTransformer("ml/skillgap_transformer_v1")

# Encode texts
resume_embedding = model.encode(resume_text)
job_embedding = model.encode(job_description)

# Calculate cosine similarity
similarity = cosine_similarity([resume_embedding], [job_embedding])[0][0]
```

### 5. Learning Resource Recommendation

**Resource Sources:**
1. **Curated Database**: Hand-picked FreeCodeCamp, Coursera links
2. **YouTube API**: Dynamic video search (requires API key)
3. **Default Fallbacks**: Generic programming resources

**Roadmap Generation:**
- No LLM - purely rule-based
- Groups skills by priority
- Provides timeline suggestions
- Links to specific resources per skill

### 6. Career Test (Rule-Based)

**Logic:**
```
20 Questions ──► Score each answer by category
                        │
         ┌──────────────┼──────────────┐
         ▼              ▼              ▼
    "Backend"      "Data"        "Frontend"
    (coding)       (analytics)   (creative)
         │              │              │
         └──────────────┴──────────────┘
                        │
                 Highest Score = Career Path
```

**Career Paths:**
- Backend/Full-Stack Development
- Data Science / Machine Learning
- Frontend / UI Engineering
- Product Management

### 7. DSA Tracker

**Data Source:**
- Master bank JSON file (master_dsa_bank.json)
- 500+ LeetCode problems
- Tagged by company and topic

**Filtering:**
```python
get_problems(company="Google", topic="Arrays")
# Returns problems asked at Google about Arrays
```

### 8. Job News Feed

**API**: GNews (free 100 requests/day)

**Queries:**
- "hiring OR recruitment OR placement"
- "tech jobs India"
- "IT hiring 2025"

---

## Data Flow & Processing

### Authentication Flow
```
1. User registers → POST /api/auth/register
2. Password hashed with bcrypt
3. JWT token generated (30-day expiry)
4. Token sent in Authorization header
5. Protected routes verify token
```

### Resume Upload Flow
```
1. POST /api/resume/upload (with file)
2. Validate PDF/DOCX format
3. Extract text using appropriate parser
4. Run spaCy NLP pipeline
5. Extract skills via PhraseMatcher
6. Estimate skill levels (rule-based)
7. Save to MongoDB
8. Return extracted data
```

### Skill Analysis Flow
```
1. POST /api/skill-analysis
2. Validate company and role
3. Get latest resume from user
4. Run FALLBACK CASCADE (4 layers)
5. Extract job skills
6. Compute AI similarity (transformer)
7. Calculate match percentage
8. Identify missing skills
9. Generate learning roadmap
10. Get learning resources
11. Save analysis to MongoDB
12. Return full analysis
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/profile` | Get user profile |

### Resume
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/resume/upload` | Upload resume (PDF/DOCX) |

### Skill Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/skill-analysis` | Analyze skill gap |
| GET | `/api/skill-analyses` | List user's analyses |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs/companies` | List companies |
| GET | `/api/jobs/roles` | List roles (by company) |

### Career Test
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/career-test/questions` | Get test questions |
| POST | `/api/career-test/submit` | Submit answers |
| GET | `/api/career-test/results` | Get results |

### News
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/news/jobs` | Get hiring news |

### DSA
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dsa/companies` | List DSA companies |
| GET | `/api/dsa/topics` | Topics by company |
| GET | `/api/dsa/problems` | Problems (filtered) |

---

## ML/AI Components

### 1. Role Similarity Model

**Purpose**: Classify job roles into categories when static data isn't available

**Architecture**:
- Base Model: `all-MiniLM-L6-v2` (Sentence Transformers)
- Role Profiles: 4 categories with descriptive text
- Classification: Cosine similarity against profiles

**Role Profiles**:
```python
ROLE_PROFILES = {
    "backend": "...APIs, databases, microservices...",
    "frontend": "...UI design, React, CSS, HTML...",
    "data": "...machine learning, pandas, numpy...",
    "product": "...roadmap planning, stakeholders..."
}
```

### 2. Skill Gap Transformer Model

**Purpose**: Semantic similarity between resume and job descriptions

**Location**: `backend/ml/skillgap_transformer_v1`

**Training**:
- Built using `build_training_dataset.py`
- Trained on job posting data
- Fine-tuned for career/technical text

### 3. Fuzzy Matching

**Library**: fuzzywuzzy

**Parameters**:
- Threshold: 90% for skill matching
- Used for: typo tolerance, skill variations

---

## Frontend Architecture

### Pages
| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Landing page |
| Auth | `/auth` | Login/Register |
| Dashboard | `/dashboard` | Main dashboard |
| Upload Resume | `/upload` | Resume upload |
| Skill Analysis | `/analysis` | Gap analysis results |
| Job News | `/news` | Hiring news feed |
| DSA Tracker | `/dsa` | LeetCode by company |
| Career Test | `/career-test` | Career assessment |
| Profile | `/profile` | User profile |

### State Management
- React Context for auth state
- Local state for form data
- API calls via Axios

### UI Components
- shadcn/ui component library
- Custom ThemeToggle (dark/light mode)
- Recharts for visualizations

---

## Database Schema

### Users Collection
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "password_hash": "bcrypt_hash",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Resumes Collection
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "filename": "resume.pdf",
  "text": "extracted text...",
  "skills": ["python", "react", ...],
  "skill_levels": {"python": "Advanced", ...},
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Skill Analyses Collection
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "resume_id": "uuid",
  "company": "Google",
  "role": "Software Engineer",
  "resume_skills": [...],
  "job_skills": [...],
  "missing_skills": [...],
  "match_percentage": 75.5,
  "confidence_score": 0.82,
  "confidence_level": "High",
  "fallback_used": "PREDEFINED_STATIC",
  "learning_roadmap": "markdown string...",
  "learning_resources": {...},
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Career Test Results Collection
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "answers": [{"question_id": 1, "answer": "..."}],
  "career_path": "Backend/Full-Stack Development",
  "explanation": "...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## Environment Variables

### Backend (.env)
```bash
MONGO_URL=mongodb://localhost:27017
DB_NAME=skillgap
JWT_SECRET=your-secret-key
GNEWS_API_KEY=your_gnews_api_key
YOUTUBE_API_KEY=your_youtube_api_key
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=http://localhost:8000
```

---

## Running the Application

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## Key Design Decisions

1. **No Paid LLM**: All AI features use sentence transformers or rule-based logic
2. **Fallback Cascade**: Multiple layers ensure reliability
3. **Free APIs Only**: GNews + optional YouTube (both have free tiers)
4. **MongoDB**: Flexible schema for evolving data needs
5. **JWT Auth**: Stateless authentication for scalability
6. **SPA Frontend**: Fast, responsive user experience

