@echo off
echo ========================================================
echo   Starting Smart Irrigation Agent - FastAPI Backend
echo ========================================================
cd backend
if exist "..\venv\bin\python.exe" (
    ..\venv\bin\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
) else if exist "..\venv\Scripts\python.exe" (
    ..\venv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
) else (
    python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
)
pause

