@echo off
echo Starting Phase 3: Service Request Lifecycle Testing
echo.
echo Focus: Core tow request functionality
echo Pages: user-map, user-map-simple, driver-map (request handling)
echo.
echo Starting servers...
echo.

REM Set testing phase
set TESTING_PHASE=3
set NODE_ENV=development

REM Start both servers
start "User Server (Port 5001)" cmd /k "npm run dev:user"
start "Driver Server (Port 5000)" cmd /k "npm run dev:driver"

echo.
echo Servers starting...
echo User App: http://localhost:5001
echo Driver App: http://localhost:5000
echo.
echo Test the complete request flow:
echo 1. User side: Make a tow request
echo 2. Driver side: Receive and respond to request
echo 3. Verify real-time communication works
pause