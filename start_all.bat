@echo off
echo ========================================================
echo   Launching Smart Irrigation Agent (Full Stack)
echo ========================================================
start "Smart Irrigation Backend (Port 8000)" cmd /k "start_backend.bat"
timeout /t 3 /nobreak >nul
start "Smart Irrigation Frontend (Port 5173)" cmd /k "start_frontend.bat"
echo.
echo Both servers launched!
echo Access Web Dashboard at: http://localhost:5173
echo API Docs at: http://localhost:8000/docs
echo.

