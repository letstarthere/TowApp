@echo off
echo Phase 0: Authentication Testing
echo Testing login flows for users and drivers
echo.

REM Kill existing processes
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5001" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul

REM Set Phase 0 environment - Authentication only
set NODE_ENV=development
set TEST_PHASE=auth_only
set SKIP_TO_LOGIN=true

start "Driver App - Auth Test" cmd /k "cd /d %~dp0\.. && npm run dev:driver"
start "User App - Auth Test" cmd /k "cd /d %~dp0\.. && npm run dev:user"

echo.
echo Phase 0 Testing:
echo - Driver App: http://localhost:5000 (Login page only)
echo - User App: http://localhost:5001 (Login page only)
echo.
echo Test Accounts:
echo Driver: driver1@towapp.com / +27123456700
echo User: bampoesean@gmail.com / +27123456789
echo.
pause