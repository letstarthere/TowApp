@echo off
echo Testing TowTech App Connection
echo.
echo 1. Test if server is accessible from phone:
echo    Open phone browser and go to: http://192.168.0.167:5000
echo    You should see the TowTech login page
echo.
echo 2. If browser works but app doesn't, check Android logs:
echo    - Connect phone via USB
echo    - Enable USB debugging on phone
echo    - Run: adb logcat | findstr "TowTech"
echo.
echo 3. Common issues:
echo    - Firewall blocking port 5000
echo    - Wrong IP address (check with: ipconfig)
echo    - Server not running (check terminal shows "serving on http://localhost:5000")
echo.
pause
