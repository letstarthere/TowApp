@echo off
echo Phase 6: Admin Control Testing
echo Test admin dashboard and system management
echo.

REM Kill existing processes
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":4000" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul

REM Set Phase 6 environment - Admin control
set NODE_ENV=development
set TEST_PHASE=admin_control
set AUTO_LOGIN_ADMIN=true
set ADMIN_EMAIL=admin@towapp.co.za
set SKIP_LOGIN=true
set ENABLE_ADMIN=true

start "Admin Server" cmd /k "cd /d %~dp0\..\admin-server && npm run dev"
start "Admin Dashboard" cmd /k "cd /d %~dp0\..\admin-client && npm run dev"

echo.
echo Phase 6 Testing:
echo - Admin Dashboard: http://localhost:3001 (Auto-logged in as admin)
echo.
echo Test Features:
echo - Driver application reviews
echo - User management
echo - System statistics
echo - Job oversight
echo - Financial controls
echo.
pause