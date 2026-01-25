// Push Notifications with Firebase Cloud Messaging

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  icon?: string;
  badge?: string;
  tag?: string;
}

class PushNotificationManager {
  private registration: ServiceWorkerRegistration | null = null;
  private vapidKey = process.env.VITE_VAPID_KEY || '';

  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered');
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Notifications not supported');
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribeToPush(): Promise<string | null> {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidKey)
      });

      return JSON.stringify(subscription);
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.registration) return false;

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  }

  // Send push notification (works when app is in background)
  async sendPushNotification(payload: NotificationPayload): Promise<void> {
    if (!this.registration) {
      await this.initialize();
    }
    
    if (this.registration && 'showNotification' in this.registration) {
      await this.registration.showNotification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/assets/blackapplogo.png',
        badge: payload.badge || '/assets/blackapplogo.png',
        tag: payload.tag,
        data: payload.data,
        requireInteraction: true,
        vibrate: [200, 100, 200]
      });
    }
  }

  // Play notification sound
  playNotificationSound(soundFile: string = '/assets/TowApp_Success_Notification_Sound.mp3'): void {
    try {
      const audio = new Audio(soundFile);
      audio.play().catch(err => console.error('Sound play failed:', err));
    } catch (error) {
      console.error('Sound error:', error);
    }
  }

  // Handle notification click
  handleNotificationClick(event: NotificationEvent): void {
    event.notification.close();

    const data = event.notification.data;
    if (data?.url) {
      // Open specific page based on notification data
      event.waitUntil(
        self.clients.openWindow(data.url)
      );
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

export const pushNotificationManager = new PushNotificationManager();