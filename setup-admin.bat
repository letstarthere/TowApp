@echo off
echo Setting up TOWAPP Admin System...
echo.

echo Installing Admin Server dependencies...
cd admin-server
call npm install
if %errorlevel% neq 0 (
    echo Failed to install admin server dependencies
    pause
    exit /b 1
)
cd ..

echo Installing Admin Client dependencies...
cd admin-client
call npm install
if %errorlevel% neq 0 (
    echo Failed to install admin client dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo ✅ Admin system setup complete!
echo.
echo You can now run: start-both-servers.bat
echo.
echo Access URLs:
echo - Admin Dashboard: http://localhost:3001
echo - Admin Login: admin@towapp.co.za / admin123
echo.
pause