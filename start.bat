@echo off
echo Starting Anvil Hackathon Stack...

:: Backend
start "FastAPI Backend" cmd /k "cd backend && pip install -r requirements.txt -q && python run.py"

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak >nul

:: Frontend
start "Next.js Frontend" cmd /k "cd frontend && npm install --silent && npm run dev"

echo.
echo ╔══════════════════════════════════════╗
echo ║  Frontend  →  http://localhost:3000  ║
echo ║  Backend   →  http://localhost:8000  ║
echo ║  API Docs  →  http://localhost:8000/docs ║
echo ╚══════════════════════════════════════╝
echo.
