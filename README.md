# 🔨 Anvil Hackathon Boilerplate

> Next.js 14 + FastAPI — production-ready hackathon starter

## Stack

| Layer    | Technology                             |
|----------|----------------------------------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS   |
| Backend  | FastAPI, Python 3.11+, async SQLAlchemy |
| Database | SQLite (swap to PostgreSQL in one line) |
| AI       | Gemini API + OpenAI (both ready)       |
| Charts   | Recharts                               |
| Icons    | Lucide React                           |

## Quick Start

### 1. Clone & setup env files
```bash
# Backend
cp backend/.env.example backend/.env
# Add your GEMINI_API_KEY or OPENAI_API_KEY

# Frontend
cp frontend/.env.example frontend/.env.local
```

### 2. One-command start (Windows)
```bash
start.bat
```

### 3. Or start manually

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## URLs

| Service  | URL                            |
|----------|--------------------------------|
| Frontend | http://localhost:3001          |
| Backend  | http://localhost:8000          |
| API Docs | http://localhost:8000/docs     |
| ReDoc    | http://localhost:8000/redoc    |

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── health.py     # GET /api/v1/health
│   │   │   │   ├── ai.py         # POST /api/v1/ai/chat
│   │   │   │   └── items.py      # CRUD /api/v1/items
│   │   │   └── __init__.py       # Router registry
│   │   ├── core/
│   │   │   └── config.py         # Settings (env vars)
│   │   ├── models/
│   │   │   └── item.py           # SQLAlchemy models
│   │   ├── database.py           # Async DB engine
│   │   └── main.py               # FastAPI app
│   ├── requirements.txt
│   └── run.py
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Landing page
│   │   ├── globals.css           # Design system
│   │   └── dashboard/
│   │       ├── layout.tsx        # Sidebar layout
│   │       ├── page.tsx          # Main dashboard
│   │       ├── ai/page.tsx       # AI console
│   │       └── data/page.tsx     # CRUD manager
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   ├── StatCard.tsx
│   │   └── ChatPanel.tsx
│   └── lib/
│       ├── api.ts                # Typed API client
│       └── utils.ts              # Helpers
│
├── start.bat                     # One-click start (Windows)
└── .gitignore
```

## Adding a New Feature

### New API Route
1. Create `backend/app/api/routes/myfeature.py`
2. Register in `backend/app/api/__init__.py`
3. Add types to `frontend/lib/api.ts`

### New Database Model
1. Create model in `backend/app/models/mymodel.py`
2. Import it in `backend/app/database.py` so `init_db()` picks it up

### Swap SQLite → PostgreSQL
```python
# backend/.env
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/dbname
```
```bash
pip install asyncpg
```

## Evaluation Checklist (for judges)
- [x] Working prototype — fully functional
- [x] GitHub repo with commit history
- [x] Clean code structure
- [x] AI integration (Gemini / OpenAI)
- [x] Persistent storage
- [x] Live demo ready

---

**Built for The Anvil Hackathon 2026 — Scaler School of Technology, Bengaluru**
