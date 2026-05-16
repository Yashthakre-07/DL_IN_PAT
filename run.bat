@echo off
TITLE PAT-IQA Platform Runner
echo =================================================================
echo        PHOTOACOUSTIC INTELLIGENCE RESEARCH PLATFORM
echo =================================================================
echo.

:: Check for backend venv
if not exist "backend\venv" (
    echo [ERROR] Backend virtual environment not found at backend\venv
    pause
    exit /b
)

echo [1/2] Launching Backend API (FastAPI) on port 8000...
start "PAT-IQA Backend" cmd /k "cd backend && venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

echo [2/2] Launching Frontend UI (Next.js) on port 3000...
start "PAT-IQA Frontend" cmd /k "cd stich && npm.cmd run dev"

echo.
echo -----------------------------------------------------------------
echo SUCCESS: Platform initialization commands dispatched.
echo.
echo UI Access:  http://localhost:3000
echo API Access: http://localhost:8000
echo -----------------------------------------------------------------
echo.
pause
