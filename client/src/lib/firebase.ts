import { Capacitor } from '@capacitor/core';
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';

export const initializeFirebase = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      // Enable Crashlytics collection
      await FirebaseCrashlytics.setEnabled({ enabled: true });
      
      // Set custom key to verify it's working
      await FirebaseCrashlytics.setCustomKey({ key: 'app_initialized', value: 'true' });
      
      console.log('✅ Firebase Crashlytics initialized successfully');
      
      // Log a non-fatal error to test
      await FirebaseCrashlytics.log({ message: 'App started successfully' });
    } catch (error) {
      console.error('❌ Failed to initialize Firebase Crashlytics:', error);
    }
  } else {
    console.log('⚠️ Not on native platform, Crashlytics disabled');
  }
};

export const logError = async (error: Error, context?: string) => {
  if (Capacitor.isNativePlatform()) {
    try {
      await FirebaseCrashlytics.recordException({
        message: error.message,
        stacktrace: error.stack || ''
      });
      if (context) {
        await FirebaseCrashlytics.log({ message: `Context: ${context}` });
      }
      console.log('✅ Error logged to Crashlytics:', error.message);
    } catch (e) {
      console.error('❌ Failed to log error to Crashlytics:', e);
    }
  }
  console.error(error);
};

export const setUserId = async (userId: string) => {
  if (Capacitor.isNativePlatform()) {
    try {
      await FirebaseCrashlytics.setUserId({ userId });
      console.log('✅ User ID set:', userId);
    } catch (error) {
      console.error('❌ Failed to set user ID:', error);
    }
  }
};

export const testCrash = async () => {
  if (Capacitor.isNativePlatform()) {
    console.log('🔥 Triggering test crash...');
    await FirebaseCrashlytics.crash({ message: 'Test crash from TowTech app' });
  } else {
    console.log('⚠️ Test crash only works on native platform');
  }
};

export const sendTestLog = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      await FirebaseCrashlytics.log({ message: 'Test log from TowTech' });
      await FirebaseCrashlytics.setCustomKey({ key: 'test_key', value: 'test_value' });
      console.log('✅ Test log sent to Crashlytics');
    } catch (error) {
      console.error('❌ Failed to send test log:', error);
    }
  }
};
