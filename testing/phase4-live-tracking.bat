@echo off
echo Phase 4: Live Tracking Testing
echo Test real-time driver tracking during active request
echo.

REM Kill existing processes
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5001" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul

REM Set Phase 4 environment - Live tracking
set NODE_ENV=development
set TEST_PHASE=live_tracking
set AUTO_LOGIN_USER=true
set AUTO_LOGIN_DRIVER=true
set SKIP_LOGIN=true
set ENABLE_REQUESTS=true
set ENABLE_LIVE_TRACKING=true
set CREATE_ACTIVE_REQUEST=true

start "Driver App - Live Tracking" cmd /k "cd /d %~dp0\.. && set AUTO_LOGIN_DRIVER=true&& set DRIVER_EMAIL=driver1@towapp.com&& set SKIP_LOGIN=true&& npm run dev:driver"
start "User App - Live Tracking" cmd /k "cd /d %~dp0\.. && set AUTO_LOGIN_USER=true&& set USER_EMAIL=bampoesean@gmail.com&& set SKIP_LOGIN=true&& npm run dev:user"

echo.
echo Phase 4 Testing:
echo - Driver App: http://localhost:5000 (Active request in progress)
echo - User App: http://localhost:5001 (Tracking driver in real-time)
echo.
echo Test Features:
echo - Real-time driver location updates
echo - ETA calculations
echo - Route tracking
echo - Status updates
echo.
pause