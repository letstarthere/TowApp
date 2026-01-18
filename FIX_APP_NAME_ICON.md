# Fix App Name and Icon

## The Problem
Android caches app names and icons. Even after installing a new APK, the old name/icon may still show.

## Solution

### Step 1: Uninstall Old App
1. On your phone, long-press the TowTech app
2. Select "Uninstall" or drag to uninstall
3. Confirm uninstallation

### Step 2: Clear Launcher Cache (Optional but recommended)
1. Go to Settings > Apps
2. Find your launcher app (e.g., "Launcher", "Home", "Pixel Launcher")
3. Tap "Storage"
4. Tap "Clear Cache"
5. Restart your phone

### Step 3: Rebuild and Install
1. Open Android Studio
2. Open project: C:\Users\Sean\Documents\TowTech\android
3. Build > Clean Project
4. Build > Build Bundle(s) / APK(s) > Build APK(s)
5. Transfer APK to phone and install

The app will now show:
- Name: TowApp
- Icon: Your custom logo (1_1752240565195.png)
