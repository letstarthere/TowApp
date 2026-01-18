@echo off
echo Starting TowTech Phase 1: Driver Core Testing...
echo.

REM Kill any existing processes on our ports
echo Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":4000" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5001" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul
echo Ports cleared.
echo.

REM Set Phase 1 environment variables
set NODE_ENV=development
set TEST_PHASE=driver_core
set FEATURE_SERVICE_REQUEST=false
set FEATURE_LIVE_TRACKING=true
set FEATURE_PUSH_NOTIFICATIONS=false
set FEATURE_PAYMENTS=false
set FEATURE_ADMIN_OVERRIDES=false
set MOCK_USERS=false
set MOCK_DRIVERS=true
set FAKE_LOCATIONS=true
set MOCK_NOTIFICATIONS=false
set SIMULATE_FAILURES=false
set DEBUG_LOGGING=true
set TEST_ACCOUNTS_ONLY=true

echo Phase 1 Configuration:
echo - Driver authentication and core features
echo - Live tracking enabled
echo - Service requests disabled
echo - Mock drivers with fake locations
echo - Test accounts only
echo.

start "TowTech Admin Server" cmd /k "cd /d %~dp0\admin-server && npm run dev"
start "TowTech Admin Dashboard" cmd /k "cd /d %~dp0\admin-client && npm run dev"
start "TowTech Driver Server" cmd /k "cd /d %~dp0 && npm run dev:driver"
start "TowTech User Server" cmd /k "cd /d %~dp0 && npm run dev:user"

echo.
echo Phase 1 Testing URLs:
echo - Admin Dashboard: http://localhost:3001 (admin@towapp.co.za / admin123)
echo - Driver App: http://localhost:5000
echo - User App: http://localhost:5001
echo - Phase Status: http://localhost:5000/api/testing/phase/status
echo.
echo Phase 1 Test Flow:
echo 1. Open Driver App (localhost:5000)
echo 2. Login with existing driver account
echo 3. Test driver location updates
echo 4. Test driver status changes
echo 5. Verify user requests are blocked
echo.
pause