@echo off
TITLE PAT-IQA Platform Launcher
echo =================================================================
echo        PHOTOACOUSTIC INTELLIGENCE RESEARCH PLATFORM
echo =================================================================
echo.

echo [1/2] Launching Backend API (FastAPI)...
start "PAT-IQA Backend" /min cmd /c "cd backend && venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Launching Frontend UI (Next.js)...
start "PAT-IQA Frontend" /min cmd /c "cd stich && npm.cmd run dev"

echo.
echo -----------------------------------------------------------------
echo SUCCESS: Platform initialization commands dispatched.
echo.
echo UI Access:  http://localhost:3000
echo API Access: http://localhost:8000
echo -----------------------------------------------------------------
echo.
echo Closing this loader... the platform is running in the background.
timeout /t 3 > nul
exit
