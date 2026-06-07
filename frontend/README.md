# Frontend

React + Tailwind hiring platform UI.

## Run

```bash
# From project root
npm run frontend

# Or from this folder
npm start
# or: yarn start
```

## Environment (`frontend/.env`)

```
REACT_APP_BACKEND_URL=http://localhost:8000
```

## Structure

```
frontend/src/
├── components/    # UI primitives + PortalLayout + platform widgets
├── pages/         # Auth, dashboards, jobs, applications, etc.
├── services/      # platformApi.js
└── lib/           # api.js (axios), utils
```
