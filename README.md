# SkillGap AI

AI-powered student and recruiter hiring platform: resume matching, job applications, career tools, company-wise DSA tracker, and hiring news.

---

## What you need installed

| Software | Version | Used for |
|----------|---------|----------|
| **Node.js** | 18 or newer | React frontend + Express API |
| **npm** | (bundled with Node) | JavaScript dependencies |
| **Python** | 3.10+ | AI engine (`backend/ai-engine`) |
| **MongoDB** | 6+ (local or Atlas) | Database |

Check versions:

```bash
node -v
npm -v
python3 --version
mongosh --version   # or: mongo --version
```

---

## Project layout

| Path | Purpose | Port |
|------|---------|------|
| `frontend/` | React UI | **3000** |
| `backend/src/` | Node.js Express API | **8000** |
| `backend/ai-engine/` | Python FastAPI (AI) | **8001** |

```
Skill-Booster-AI-main/
├── frontend/                 # React app
├── backend/
│   ├── src/                  # Express API
│   ├── ai-engine/            # Python AI service
│   └── src/data/             # company_wise_dsa.json (DSA tracker)
├── requirements.txt          # Python deps (AI engine)
├── package.json              # npm scripts (run from root)
└── README.md                 # this file
```

---

## Setup (first time)

Do all steps from the **project root** (the folder that contains `package.json`).

### 1. Unzip or clone the project

```bash
cd Skill-Booster-AI-main
```

If you received a `.zip` file, extract it first, then `cd` into the folder.

### 2. Install Node.js dependencies

```bash
npm run install:all
```

This installs packages for the root workspace, `backend/`, and `frontend/`.

Equivalent manual commands:

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 3. Python virtual environment + `requirements.txt`

The AI service needs a virtual environment. **Easiest (recommended):**

```bash
npm run setup:ai
```

This will:

- Create `backend/ai-engine/venv`
- Install everything from `requirements.txt`
- Download the spaCy language model (`en_core_web_sm`)

**Manual setup** (same result):

```bash
cd backend/ai-engine
python3 -m venv venv

# macOS / Linux
source venv/bin/activate

# Windows (Command Prompt)
venv\Scripts\activate

# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

pip install --upgrade pip
pip install -r ../../requirements.txt
python -m spacy download en_core_web_sm
cd ../..
```

> **Note:** `torch` and `sentence-transformers` are large. The first install may take several minutes.

### 4. Environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit **`backend/.env`**:

| Variable | Description |
|----------|-------------|
| `MONGO_URL` | MongoDB connection string (default: `mongodb://localhost:27017/skillgap`) |
| `JWT_SECRET` | Secret for auth tokens — change to a long random string |
| `GNEWS_API_KEY` | Optional — [gnews.io](https://gnews.io) free key for **Hiring News** |
| `AI_SERVICE_URL` | Default `http://127.0.0.1:8001` (leave as-is for local dev) |
| `PORT` | API port, default `8000` |

**`frontend/.env`** (usually no changes needed):

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

### 5. Start MongoDB

**Local MongoDB (macOS with Homebrew):**

```bash
brew services start mongodb-community
```

**Local MongoDB (generic):**

```bash
mongod
```

**MongoDB Atlas:** put your Atlas connection string in `MONGO_URL` in `backend/.env`.

The API will not work correctly until MongoDB is reachable.

---

## Run the application

From the **project root**:

```bash
npm run dev
```

This starts all three services:

| Service | URL |
|---------|-----|
| Web app | http://localhost:3000 |
| API | http://localhost:8000 |
| AI engine | http://localhost:8001 |

Open **http://localhost:3000** in your browser.

### Run services separately

```bash
npm run frontend    # React only (port 3000)
npm run backend     # Node API only (port 8000)
npm run ai          # Python AI only (port 8001)
```

---

## npm scripts reference

| Command | Description |
|---------|-------------|
| `npm run install:all` | Install all Node dependencies |
| `npm run setup:ai` | Create Python venv + install `requirements.txt` + spaCy model |
| `npm run dev` | Start frontend + backend + AI together |
| `npm run build` | Production build of the React app |

---

## Features

- **Student portal** — jobs, AI match scores, applications, career test, DSA tracker by company, hiring news
- **Recruiter portal** — post jobs, JD parsing, applicant pipeline, analytics
- **AI matching** — semantic similarity, skill overlap, resume/JD parsing

---

## Sharing the project (zip)

**Include:** full source, `requirements.txt`, `.env.example` files, `backend/src/data/company_wise_dsa.json`

**Exclude** (recipient regenerates these):

- `node_modules/` → run `npm run install:all`
- `backend/ai-engine/venv/` → run `npm run setup:ai`
- `.env` files with real secrets → copy from `.env.example`

---

## Troubleshooting

| Problem | What to do |
|---------|------------|
| `npm: command not found` | Install Node.js 18+ from [nodejs.org](https://nodejs.org) |
| `EADDRINUSE` on 3000 / 8000 / 8001 | Stop the other process using that port or change `PORT` / frontend port |
| MongoDB connection error | Start `mongod` or fix `MONGO_URL` in `backend/.env` |
| AI / resume upload fails | Run `npm run setup:ai`; ensure `npm run ai` or `npm run dev` shows AI on port 8001 |
| `Run npm run setup:ai from project root first` | AI venv missing — run step 3 above |
| Hiring news empty | Add `GNEWS_API_KEY` to `backend/.env` |
| DSA tracker shows demo data | Restart backend after setup; confirm `backend/src/data/company_wise_dsa.json` exists |

---

## API smoke test (optional)

With the backend running:

```bash
BACKEND_URL=http://127.0.0.1:8000 python3 backend/tests/api.test.py
```

---

## More documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — system design and API layers
- [backend/README.md](./backend/README.md) — backend-specific notes
- [frontend/README.md](./frontend/README.md) — frontend notes

---

## Environment reference

**`backend/.env`**

```env
PORT=8000
MONGO_URL=mongodb://localhost:27017/skillgap
JWT_SECRET=your-long-random-secret
GNEWS_API_KEY=
AI_SERVICE_URL=http://127.0.0.1:8001
CORS_ORIGINS=http://localhost:3000
PUBLIC_UPLOAD_BASE_URL=http://localhost:8000/uploads
```

**`frontend/.env`**

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```
