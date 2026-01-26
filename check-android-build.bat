@echo off
echo Building Android app to check for errors...
cd /d "%~dp0"

echo.
echo Step 1: Building web assets...
call npm run build

echo.
echo Step 2: Syncing to Android...
call npx cap sync android

echo.
echo Step 3: Checking Android build...
cd android
call gradlew.bat assembleDebug 2>&1 | findstr /i "error failed exception"

echo.
echo Build check complete. Check output above for errors.
pause
