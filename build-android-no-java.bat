@echo off
echo Using Android Studio's bundled JDK...
cd /d "%~dp0"

REM Unset JAVA_HOME to let Gradle use Android Studio's JDK
set JAVA_HOME=

echo.
echo Building Android app...
cd android
call gradlew.bat assembleDebug

echo.
echo Build complete. Check for errors above.
pause
