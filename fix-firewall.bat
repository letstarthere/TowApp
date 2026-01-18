@echo off
echo Configuring Windows Firewall for TowTech Server...
echo.
echo This must be run as Administrator!
echo.

netsh advfirewall firewall delete rule name="TowTech Dev Server"
netsh advfirewall firewall add rule name="TowTech Dev Server" dir=in action=allow protocol=TCP localport=5000 profile=any

echo.
echo Firewall configured!
echo.
echo Now try http://192.168.0.167:5000 from your iPhone
echo.
pause
