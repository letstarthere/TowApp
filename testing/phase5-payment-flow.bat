@echo off
echo Phase 5: Payment Flow Testing
echo Test payment processing after completed service
echo.

REM Kill existing processes
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5001" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul

REM Set Phase 5 environment - Payment flow
set NODE_ENV=development
set TEST_PHASE=payment_flow
set AUTO_LOGIN_USER=true
set AUTO_LOGIN_DRIVER=true
set SKIP_LOGIN=true
set ENABLE_PAYMENTS=true
set CREATE_COMPLETED_REQUEST=true

start "Driver App - Payment Test" cmd /k "cd /d %~dp0\.. && set AUTO_LOGIN_DRIVER=true&& set DRIVER_EMAIL=driver1@towapp.com&& set SKIP_LOGIN=true&& npm run dev:driver"
start "User App - Payment Test" cmd /k "cd /d %~dp0\.. && set AUTO_LOGIN_USER=true&& set USER_EMAIL=bampoesean@gmail.com&& set SKIP_LOGIN=true&& npm run dev:user"

echo.
echo Phase 5 Testing:
echo - Driver App: http://localhost:5000 (Completed request, awaiting payment)
echo - User App: http://localhost:5001 (Payment screen ready)
echo.
echo Test Features:
echo - Payment method selection
echo - Payment processing
echo - Receipt generation
echo - Driver earnings
echo.
pause