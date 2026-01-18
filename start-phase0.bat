@echo off
echo Starting Phase 0: Basic Authentication Testing
echo.
echo This will start both servers for testing login/signup flows
echo.

REM Just use the basic npm scripts without any testing configuration
start "Driver App (Port 5000)" cmd /k "cd /d %~dp0 && npm run dev:driver"
timeout /t 3 /nobreak >nul
start "User App (Port 5001)" cmd /k "cd /d %~dp0 && npm run dev:user"

echo.
echo Servers starting...
echo.
echo URLs:
echo Driver App: http://localhost:5000
echo User App: http://localhost:5001
echo.
echo Focus on testing:
echo - Role selection page
echo - User/Driver login flows  
echo - User/Driver signup flows
echo.
pause