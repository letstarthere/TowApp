@echo off
echo Starting Phase 6: Admin System Testing
echo.
echo Focus: Administrative control panel
echo Pages: All admin-client pages (Dashboard, LiveOps, Management, etc.)
echo.
echo Starting servers...
echo.

REM Set testing phase
set TESTING_PHASE=6
set NODE_ENV=development

REM Start all servers including admin
start "User Server (Port 5001)" cmd /k "npm run dev:user"
start "Driver Server (Port 5000)" cmd /k "npm run dev:driver"
start "Admin Client (Port 5173)" cmd /k "cd admin-client && npm run dev"
start "Admin Server (Port 3001)" cmd /k "cd admin-server && npm start"

echo.
echo Servers starting...
echo User App: http://localhost:5001
echo Driver App: http://localhost:5000
echo Admin Panel: http://localhost:5173
echo.
echo Test all admin features:
echo 1. Admin login and dashboard
echo 2. User/Driver management
echo 3. Live operations monitoring
echo 4. Financial and dispute management
pause