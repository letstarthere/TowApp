@echo off
echo Starting TowTech Phase 1: Driver Core Testing...
echo.
echo Admin Server will run on: http://localhost:4000
echo Admin Dashboard will run on: http://localhost:3001
echo Driver App will run on: http://localhost:5000
echo User App will run on: http://localhost:5001
echo.
echo Press Ctrl+C in any window to stop servers
echo.

start "TowTech Admin Server" cmd /k "cd /d %~dp0\..\admin-server && npm run dev"
start "TowTech Admin Dashboard" cmd /k "cd /d %~dp0\..\admin-client && npm run dev"
start "TowTech Driver Server" cmd /k "cd /d %~dp0\.. && npm run dev:driver"
start "TowTech User Server" cmd /k "cd /d %~dp0\.. && npm run dev:user"

echo All servers are starting...
echo Check the opened command windows for server status
echo.
echo Access URLs:
echo - Admin Dashboard: http://localhost:3001 (admin@towapp.co.za / admin123)
echo - Driver App: http://localhost:5000
echo - User App: http://localhost:5001
echo.
echo Phase 1 Features:
echo - Driver authentication and core features
echo - Live tracking enabled
echo - Service requests disabled
echo - Payments disabled
echo - Admin overrides disabled
pause