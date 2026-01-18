@echo off
echo Adding Windows Firewall rule for port 5000...
echo.
echo This requires Administrator privileges.
echo Right-click this file and select "Run as administrator"
echo.

netsh advfirewall firewall add rule name="TowTech Dev Server" dir=in action=allow protocol=TCP localport=5000

echo.
echo Firewall rule added successfully!
echo Port 5000 is now accessible from your local network.
echo.
pause
