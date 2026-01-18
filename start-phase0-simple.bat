@echo off
echo Starting Phase 0: Authentication Testing
echo.
echo Driver App: http://localhost:5000
echo User App: http://localhost:5001
echo.
echo Press Ctrl+C in any window to stop servers
echo.

start "Phase 0 - Driver Server" cmd /k "cd /d %~dp0 && npm run dev:driver"
start "Phase 0 - User Server" cmd /k "cd /d %~dp0 && npm run dev:user"

echo Servers are starting...
echo Check the opened command windows for server status
echo.
echo Test these pages:
echo - Role Selection, Login, Signup flows
echo - Both Driver and User authentication
pause