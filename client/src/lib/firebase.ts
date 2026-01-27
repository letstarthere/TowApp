import { Capacitor } from '@capacitor/core';
import { FirebaseCrashlytics } from '@capacitor-firebase/crashlytics';

export const initializeFirebase = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      // Enable Crashlytics collection
      await FirebaseCrashlytics.setEnabled({ enabled: true });
      console.log('Firebase Crashlytics initialized');
    } catch (error) {
      console.error('Failed to initialize Firebase Crashlytics:', error);
    }
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
    } catch (e) {
      console.error('Failed to log error to Crashlytics:', e);
    }
  }
  console.error(error);
};

export const setUserId = async (userId: string) => {
  if (Capacitor.isNativePlatform()) {
    try {
      await FirebaseCrashlytics.setUserId({ userId });
    } catch (error) {
      console.error('Failed to set user ID:', error);
    }
  }
};

export const testCrash = async () => {
  if (Capacitor.isNativePlatform()) {
    await FirebaseCrashlytics.crash({ message: 'Test crash' });
  }
};
