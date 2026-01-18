@echo off
echo Phase 2: User Dashboard Testing
echo Auto-login as user, test user features
echo.

REM Kill existing processes
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5001" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul

REM Set Phase 2 environment - User dashboard
set NODE_ENV=development
set TEST_PHASE=user_dashboard
set AUTO_LOGIN_USER=true
set USER_EMAIL=bampoesean@gmail.com
set SKIP_LOGIN=true

start "User Dashboard Test" cmd /k "cd /d %~dp0\.. && npm run dev:user"

echo.
echo Phase 2 Testing:
echo - User App: http://localhost:5001 (Auto-logged in as user)
echo.
echo Test Features:
echo - User map with nearby drivers
echo - Vehicle management
echo - Profile settings
echo - Location services
echo.
pause