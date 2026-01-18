@echo off
echo Phase 1: Driver Dashboard Testing
echo Auto-login as driver, test dashboard features
echo.

REM Kill existing processes
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul

REM Set Phase 1 environment - Driver dashboard
set NODE_ENV=development
set TEST_PHASE=driver_dashboard
set AUTO_LOGIN_DRIVER=true
set DRIVER_EMAIL=driver1@towapp.com
set SKIP_LOGIN=true

start "Driver Dashboard Test" cmd /k "cd /d %~dp0\.. && npm run dev:driver"

echo.
echo Phase 1 Testing:
echo - Driver App: http://localhost:5000 (Auto-logged in as driver)
echo.
echo Test Features:
echo - Driver map and location
echo - Status toggle (online/offline)
echo - Profile management
echo - Location updates
echo.
pause