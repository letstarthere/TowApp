# Firebase Crashlytics Setup Guide

## ✅ Completed Steps

1. ✅ Installed Firebase packages
2. ✅ Updated Android build.gradle files with Firebase BoM 34.8.0
3. ✅ Added Google Services plugin (4.4.4) and Crashlytics plugin (3.0.2)
4. ✅ Created Firebase utility functions
5. ✅ Initialized Firebase in App.tsx
6. ✅ Synced Capacitor

## 🔥 REQUIRED: Complete Firebase Console Setup

### Step 1: Go to Firebase Console

**Visit**: https://console.firebase.google.com/

1. Click "Add project" (or select existing project)
2. Follow the wizard to create your project

### Step 2: Register Your Android App

1. In Firebase Console, click "Add app" → Select **Android** icon
2. Fill in the registration form:
   ```
   Android package name: com.towtech.app
   App nickname: TowTech (optional)
   Debug signing certificate SHA-1: (skip for now)
   ```
3. Click **"Register app"**

### Step 3: Download google-services.json

1. Firebase will provide a **google-services.json** file
2. Click **"Download google-services.json"**
3. **CRITICAL**: Place the file here:
   ```
   TowTech/android/app/google-services.json
   ```

### Step 4: Enable Crashlytics

1. In Firebase Console sidebar: **Build** → **Crashlytics**
2. Click **"Enable Crashlytics"**
3. Click through the setup wizard (code integration already done)

### Step 5: Build Your App

After placing google-services.json:

```bash
# Open Android Studio
npx cap open android
```

In Android Studio:
1. **Build** → **Clean Project**
2. **Build** → **Rebuild Project**
3. Run app on device/emulator

### Step 6: Verify Crashlytics Works

Add test crash button to any page:

```typescript
import { testCrash } from '@/lib/firebase';

<Button onClick={() => testCrash()}>
  Test Crash
</Button>
```

Click button → App crashes → Wait 5 minutes → Check Firebase Console

## 📱 Usage in Your Code

### Log Errors Automatically

```typescript
import { logError } from '@/lib/firebase';

try {
  // Your code
} catch (error) {
  logError(error as Error, 'Context: User Map Navigation');
}
```

### Set User ID for Tracking

```typescript
import { setUserId } from '@/lib/firebase';

// After user logs in
setUserId(user.id.toString());
```

### Example: Update user-map.tsx

```typescript
import { logError } from '@/lib/firebase';

// In your error handling
useEffect(() => {
  const handleError = (e: ErrorEvent) => {
    console.error('App error:', e.error);
    logError(e.error, 'User Map Component');
    e.preventDefault();
  };
  window.addEventListener('error', handleError);
  return () => window.removeEventListener('error', handleError);
}, []);
```

## 🎯 What You'll Get

Once set up, Firebase Crashlytics will automatically report:
- ✅ App crashes with full stack traces
- ✅ Line numbers where crashes occurred
- ✅ Device info (Android version, model, etc.)
- ✅ Number of affected users
- ✅ Crash-free users percentage
- ✅ Real-time crash alerts

## 📊 Viewing Crash Reports

1. Go to Firebase Console
2. Select your project
3. Navigate to: **Build** → **Crashlytics**
4. View crashes, stack traces, and affected users

## 🔒 Important Notes

- **google-services.json** contains your Firebase config (not sensitive but don't commit to public repos)
- Crashes appear in console within 5 minutes
- First crash might take longer to appear
- Works only on real devices/emulators (not web browser)

## 🆘 Troubleshooting

If crashes don't appear:
1. Verify `google-services.json` is in correct location
2. Clean and rebuild: Build → Clean Project → Rebuild Project
3. Check Android Studio logs for Firebase initialization
4. Wait 5-10 minutes after first crash
5. Make sure app has internet connection

## Package Name Mismatch?

Your capacitor.config.ts shows `com.towapp.app` but build.gradle shows `com.towtech.app`.

To fix, update capacitor.config.ts:
```typescript
appId: 'com.towtech.app',
```

Then run: `npx cap sync android`
