@echo off
echo ==============================================================
echo Pushing QueueLess System to GitHub: tejaswinishty/Queueless-system
echo ==============================================================
echo.
cd /d "%~dp0"
"C:\Program Files\Git\cmd\git.exe" push -u origin main --force
echo.
echo ==============================================================
echo If you saw a browser popup, please click "Sign in with browser"
echo ==============================================================
pause
