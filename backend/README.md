# Backend

Node.js Express API + Python AI microservice.

## Structure

```
backend/
├── src/           # Express API (port 8000)
├── ai-engine/     # Python FastAPI AI (port 8001)
├── uploads/       # resume & JD files (local mode)
└── .env
```

## Run

```bash
# From project root
npm run backend
npm run ai

# Or from this folder
npm start
npm run ai
```

## Environment (`backend/.env`)

```
MONGO_URL=mongodb://localhost:27017/skillgap
JWT_SECRET=your-secret
GNEWS_API_KEY=your-gnews-key
AI_SERVICE_URL=http://127.0.0.1:8001
PORT=8000
CORS_ORIGINS=http://localhost:3000
```

## AI setup (one time)

From project root (installs `requirements.txt` into `ai-engine/venv`):

```bash
npm run setup:ai
```
