# PAT-IQA Platform Runner (PowerShell)
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "       PHOTOACOUSTIC INTELLIGENCE RESEARCH PLATFORM" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

$root = Get-Location

# Start Backend
Write-Host "[1/2] Launching Backend API (FastAPI)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd backend && venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000" -WindowStyle Normal

# Start Frontend
Write-Host "[2/2] Launching Frontend UI (Next.js)..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k cd stich && npm.cmd run dev" -WindowStyle Normal

Write-Host ""
Write-Host "-----------------------------------------------------------------" -ForegroundColor Green
Write-Host "SUCCESS: Platform initialization commands dispatched." -ForegroundColor Green
Write-Host ""
Write-Host "UI Access:  http://localhost:3000"
Write-Host "API Access: http://localhost:8000"
Write-Host "-----------------------------------------------------------------" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit this loader..."
$null = [Console]::ReadKey($true)
