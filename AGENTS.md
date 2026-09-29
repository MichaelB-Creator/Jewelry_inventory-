# Jewelry Inventory App

## Stack
- **Backend**: FastAPI (Python 3.12) with SQLite, served by uvicorn with `--reload`
- **Frontend**: React 18 + TypeScript + Vite 6
- **Database**: SQLite (stored in a Docker volume at `/app/data`)

## Architecture
- Single-origin wiring: Vite dev server proxies `/api/*` to the FastAPI backend at `http://backend:8000`
- Frontend runs on port 3000 (public), backend on port 8000 (internal, proxied through Vite)
- No external services or credentials required

## Running
```
docker compose -f docker-compose.base44.yml up -d --build
```

## Verification
- Frontend: `curl http://localhost:3000/` returns the React app HTML
- Backend: `curl http://localhost:8000/api/items` returns JSON array of items
- Stats: `curl http://localhost:8000/api/stats` returns inventory stats

## Key Files
- `backend/main.py` — FastAPI app with all routes, SQLAlchemy models, and seed data
- `frontend/src/App.tsx` — main React component (state, data loading, CRUD orchestration)
- `frontend/vite.config.ts` — Vite config with API proxy and allowedHosts
