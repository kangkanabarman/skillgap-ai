# SkillGap AI – Career Guidance Web App

A fully working career guidance web app that analyzes skill gaps, suggests learning paths, shows hiring news, and recommends DSA problems by company.

## Features

- **Skill Gap Analyzer (Core)**: Resume parsing (PDF/DOCX), skill extraction (spaCy + PhraseMatcher), job description mapping, skill matching, skill level estimation, and learning resource recommendations
- **Real-Time Job News Feed**: Hiring and placement news via GNews API
- **DSA Tracker by Company**: LeetCode-style problems by company (Amazon, Google, Microsoft, Meta, etc.)
- **Career Test**: Rule-based career path recommendations (no paid LLM)
- **Theme Toggle**: Dark/Light mode

## Stack

| Layer | Tools |
|-------|-------|
| Frontend | React, TailwindCSS, shadcn/ui, Recharts, Framer Motion |
| Backend | FastAPI (Python) |
| NLP / AI | spaCy, fuzzywuzzy |
| APIs | GNews API, YouTube API (optional) |
| Auth & DB | MongoDB (motor) |
| Hosting | Vercel, Netlify, Render (free tiers) |

## Setup

### Backend

1. Create a virtual environment and install dependencies:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```

2. Copy .env and configure:
   ```bash
   cp .env
   ```

3. Set `MONGO_URL` (required). Use [MongoDB Atlas](https://www.mongodb.com/atlas) free tier or local MongoDB.

4. Optional APIs:
   - **GNews API**: Add `GNEWS_API_KEY` for hiring news (free 100 req/day at [gnews.io](https://gnews.io))
   - **YouTube API**: Add `YOUTUBE_API_KEY` for video recommendations (optional)

5. Run the server:
   ```bash
   uvicorn server:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   yarn install
   ```

2. Create `.env`:
   ```bash
   REACT_APP_BACKEND_URL=http://localhost:8000
   ```

3. Run the dev server:
   ```bash
   yarn start
   ```

## Project Structure

```
backend/
├── modules/
│   ├── resume_parser.py   # PDF/DOCX parsing, skill extraction, skill levels
│   ├── job_data.py        # Job descriptions by company/role
│   ├── skill_matcher.py   # Exact + fuzzy skill matching
│   ├── learning_resources.py  # Curated free courses, rule-based roadmap
│   ├── news_feed.py       # GNews API integration
│   └── dsa_data.py        # DSA problems by company
├── data/
│   ├── 06_skills.csv      # Skills list for extraction
│   └── dsa_problems.json  # LeetCode problems by company
├── server.py
├── skills_taxonomy.py
└── requirements.txt

frontend/
├── src/
│   ├── pages/
│   │   ├── Dashboard.js
│   │   ├── UploadResume.js
│   │   ├── SkillAnalysis.js
│   │   ├── JobNews.js      # Hiring news feed
│   │   ├── DSATracker.js   # DSA problems by company
│   │   └── ...
│   └── components/
│       └── ThemeToggle.jsx
└── ...
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| POST | /api/resume/upload | Upload resume (PDF/DOCX) |
| POST | /api/skill-analysis | Analyze skill gap for company/role |
| GET | /api/skill-analyses | List user analyses |
| GET | /api/news/jobs | Hiring news (public) |
| GET | /api/dsa/companies | DSA companies (public) |
| GET | /api/dsa/problems?company=X&topic=Y | DSA problems (public) |

## Free APIs Used

- **GNews API**: Hiring news (100 req/day)
- **YouTube API** (optional): Video recommendations
- **Curated links**: FreeCodeCamp, Coursera free courses
- **No paid LLM**: Rule-based learning roadmaps and career test

## Running the Full Application

### Quick Start (Both servers simultaneously)

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```
Backend will be available at: **http://localhost:8000**
- API Docs: http://localhost:8000/docs

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install --legacy-peer-deps  # First time only
npm start
```
Frontend will be available at: **http://localhost:3000**

### Environment Setup

**Backend (.env):**

**Option A: MongoDB Atlas (Recommended - No local setup needed)**
```bash
# Get connection string from https://www.mongodb.com/atlas
MONGO_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/skillgap?retryWrites=true&w=majority
DB_NAME=skillgap
SECRET_KEY=your-secret-key-change-this-in-production
GNEWS_API_KEY=your_gnews_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

**Option B: Local MongoDB**
```bash
# Start MongoDB first: brew services start mongodb-community
# Or: mongod (run in separate terminal)
MONGO_URL=mongodb://localhost:27017
DB_NAME=skillgap
SECRET_KEY=your-secret-key-change-this-in-production
GNEWS_API_KEY=your_gnews_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

**Frontend (.env):**
```bash
REACT_APP_BACKEND_URL=http://localhost:8000
```

### Troubleshooting

- **Port already in use**: Kill process with `lsof -i :8000` or `lsof -i :3000`
- **Module not found (spaCy)**: Run `python -m spacy download en_core_web_sm`
- **npm dependency issues**: Use `npm install --legacy-peer-deps`
- **MongoDB connection**: Ensure MongoDB is running locally or update `MONGO_URL` to Atlas connection string

## License

MIT
