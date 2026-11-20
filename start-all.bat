@echo off
echo ==============================================================
echo Launching QueueLess: Smart Queue & Crowd Prediction System
echo ==============================================================
start "QueueLess Backend (Spring Boot 8080)" cmd /k "%~dp0start-backend.bat"
start "QueueLess Frontend (Next.js 3000)" cmd /k "%~dp0start-frontend.bat"
echo.
echo Both servers launched in separate windows!
echo - Java Backend:  http://localhost:8080
echo - Next.js UI:    http://localhost:3000
echo.
pause
