@echo off
echo Phase 3: Service Request Flow Testing
echo Manual login for both user and driver
echo.

REM Kill existing processes
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5001" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul

REM Set Phase 3 environment - Service requests
set NODE_ENV=development
set TEST_PHASE=service_requests
set ENABLE_REQUESTS=true

start "Driver App - Request Test" cmd /k "cd /d %~dp0\.. && npm run dev:driver"
start "User App - Request Test" cmd /k "cd /d %~dp0\.. && npm run dev:user"

echo.
echo Phase 3 Testing:
echo - Driver App: http://localhost:5000 (Login: driver1@towapp.com / +27123456700)
echo - User App: http://localhost:5001 (Login: bampoesean@gmail.com / +27123456789)
echo.
echo Test Flow:
echo 1. Login to both apps manually
echo 2. User creates tow request
echo 3. Driver receives notification
echo 4. Driver accepts/declines
echo 5. Track request progress
echo.
pause