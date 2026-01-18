# Build APK for TowTech Web App

## Option 1: Using Android Studio (EASIEST)
1. Download Android Studio: https://developer.android.com/studio
2. Install Android Studio
3. Open Android Studio
4. Click "Open an Existing Project"
5. Navigate to: C:\Users\Sean\Documents\TowTech\android
6. Wait for Gradle sync to complete
7. Click Build > Build Bundle(s) / APK(s) > Build APK(s)
8. APK will be at: android\app\build\outputs\apk\debug\app-debug.apk

## Option 2: Using Command Line (requires Java 17+)
1. Download Java 17: https://adoptium.net/temurin/releases/?version=17
2. Install Java 17
3. Set JAVA_HOME environment variable to Java 17 installation
4. Run: cd C:\Users\Sean\Documents\TowTech\android
5. Run: gradlew.bat assembleDebug
6. APK will be at: app\build\outputs\apk\debug\app-debug.apk

## Install APK on Phone
1. Transfer the APK file to your phone
2. Enable "Install from Unknown Sources" in phone settings
3. Open the APK file on your phone to install
4. Launch TowTech app

## What This Does
- Wraps your Vite web app in a native Android container
- The app runs your web code inside a WebView
- All your existing web features will work
- Maps, camera, location will work if you add Capacitor plugins for them
