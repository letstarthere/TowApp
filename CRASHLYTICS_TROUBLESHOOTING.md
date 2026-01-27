# 🔥 Firebase Crashlytics Not Reporting? - Troubleshooting Guide

## ❌ Common Issue: Crashes Not Appearing

**NO, Firebase does NOT require Play Store!** It works with debug builds, sideloaded APKs, etc.

## ✅ Step-by-Step Fix

### 1. Enable Crashlytics in Firebase Console (CRITICAL!)

This is the #1 reason crashes don't appear:

1. Go to: https://console.firebase.google.com/
2. Select your project: **towapp-901ac**
3. Click **Build** → **Crashlytics** in sidebar
4. Click **"Enable Crashlytics"** button
5. Wait for it to fully enable (may take 1-2 minutes)

### 2. Verify google-services.json

✅ Already confirmed: File exists at `android/app/google-services.json`
✅ Package name matches: `com.towtech.app`

### 3. Clean Build Required

After enabling Crashlytics, you MUST do a clean build:

```bash
# Open Android Studio
npx cap open android
```

In Android Studio:
1. **Build** → **Clean Project**
2. **Build** → **Rebuild Project**
3. Uninstall old app from device
4. Run app again

### 4. Test Using Debug Page

Navigate to: `/firebase-debug` in your app

Or add this button temporarily to user-map.tsx:

```typescript
import { testCrash } from '@/lib/firebase';

<Button onClick={() => window.location.href = '/firebase-debug'}>
  Firebase Debug
</Button>
```

### 5. Check Android Logcat

In Android Studio, open **Logcat** and filter for:
- `Crashlytics`
- `Firebase`

Look for these messages:
- ✅ `Firebase Crashlytics initialized successfully`
- ❌ `Failed to initialize Firebase Crashlytics`

### 6. Verify Internet Connection

Crashlytics requires internet to send reports. Check:
- Device has active internet
- No firewall blocking Firebase domains
- App has INTERNET permission (already added)

### 7. Wait Longer

First crash can take:
- **5-10 minutes** normally
- **15-20 minutes** for first-ever crash
- **Up to 1 hour** if Firebase is still setting up

### 8. Check Firebase Console Correctly

1. Go to: https://console.firebase.google.com/
2. Select project: **towapp-901ac**
3. Click **Crashlytics** (not Analytics!)
4. Look for "Issues" tab
5. Check "All crashes" dropdown

## 🧪 Testing Methods

### Method 1: Test Crash (Recommended)
```typescript
import { testCrash } from '@/lib/firebase';
await testCrash(); // App will crash immediately
```

### Method 2: JavaScript Error
```typescript
const obj: any = null;
obj.nonExistentMethod(); // Causes crash
```

### Method 3: Use Debug Page
Navigate to `/firebase-debug` and click "Test Crash"

## 📊 What to Look For in Logcat

**Good signs:**
```
✅ Firebase Crashlytics initialized successfully
✅ Crashlytics report upload has started
✅ Crashlytics report upload complete
```

**Bad signs:**
```
❌ Crashlytics could not be initialized
❌ google-services.json not found
❌ FirebaseApp initialization unsuccessful
```

## 🔍 Advanced Debugging

### Check if Firebase is initialized:

Add to App.tsx temporarily:
```typescript
import { Capacitor } from '@capacitor/core';

useEffect(() => {
  console.log('Platform:', Capacitor.getPlatform());
  console.log('Is Native:', Capacitor.isNativePlatform());
}, []);
```

### Force Crashlytics to send immediately:

In Android Studio, add to MainActivity.java:
```java
import com.google.firebase.crashlytics.FirebaseCrashlytics;

// In onCreate
FirebaseCrashlytics.getInstance().setCrashlyticsCollectionEnabled(true);
```

## 🎯 Most Likely Issues

1. **Crashlytics not enabled in Firebase Console** (90% of cases)
2. **Didn't do clean rebuild after setup** (5% of cases)
3. **Waiting less than 10 minutes** (3% of cases)
4. **Testing on web browser instead of Android** (2% of cases)

## ✅ Verification Checklist

- [ ] Crashlytics enabled in Firebase Console
- [ ] google-services.json in android/app/
- [ ] Clean build performed
- [ ] App uninstalled and reinstalled
- [ ] Testing on Android device/emulator (not web)
- [ ] Device has internet connection
- [ ] Waited at least 10 minutes after crash
- [ ] Checked correct Firebase project
- [ ] Checked "Crashlytics" not "Analytics"

## 🆘 Still Not Working?

### Check Build Logs

In Android Studio, check **Build** output for:
```
✅ google-services.json found
✅ Firebase Crashlytics plugin applied
✅ Crashlytics build ID generated
```

### Verify Package Name

Your app uses: `com.towtech.app`
Firebase expects: `com.towtech.app`

These MUST match exactly!

### Check Firebase Project

Make sure you're looking at the correct project:
- Project ID: `towapp-901ac`
- Project Number: `362949274833`

## 📱 Alternative: Use Android Studio Logcat

While waiting for Firebase, you can see crashes in real-time:

1. Android Studio → **Logcat** tab
2. Filter: **Error** level
3. Run app and trigger crash
4. See full stack trace immediately

## 🔗 Useful Links

- Firebase Console: https://console.firebase.google.com/project/towapp-901ac/crashlytics
- Debug Page: Navigate to `/firebase-debug` in your app
- Logcat: Android Studio → View → Tool Windows → Logcat
