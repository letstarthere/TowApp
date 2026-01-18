// Background location handling for drivers

export class BackgroundLocationManager {
  private watchId: number | null = null;
  private isTracking = false;

  async requestPermissions(): Promise<boolean> {
    try {
      // Request location permission
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'denied') {
        throw new Error('Location permission denied');
      }

      // Request notification permission for foreground service
      if ('Notification' in window) {
        const notificationPermission = await Notification.requestPermission();
        if (notificationPermission === 'denied') {
          console.warn('Notification permission denied - background tracking may be limited');
        }
      }

      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  startTracking(onLocationUpdate: (position: GeolocationPosition) => void): boolean {
    if (this.isTracking) return true;

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    };

    try {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          onLocationUpdate(position);
          this.showForegroundNotification();
        },
        (error) => {
          console.error('Location tracking error:', error);
          this.handleLocationError(error);
        },
        options
      );

      this.isTracking = true;
      return true;
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      return false;
    }
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
    this.hideForegroundNotification();
  }

  private showForegroundNotification(): void {
    // Show persistent notification for foreground service
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('TOWAPP Driver Active', {
        body: 'Location tracking active - ready to receive jobs',
        icon: '/icon-192x192.png',
        tag: 'driver-active',
        silent: true,
        requireInteraction: false
      });
    }
  }

  private hideForegroundNotification(): void {
    // Close the persistent notification
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.getNotifications({ tag: 'driver-active' }).then(notifications => {
          notifications.forEach(notification => notification.close());
        });
      });
    }
  }

  private handleLocationError(error: GeolocationPositionError): void {
    let message = 'Location tracking error';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Location permission denied. Please enable location access.';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Location unavailable. Please check GPS settings.';
        break;
      case error.TIMEOUT:
        message = 'Location request timed out. Retrying...';
        break;
    }

    console.error(message, error);
    
    // Show user-friendly error
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Location Error', {
        body: message,
        icon: '/icon-192x192.png'
      });
    }
  }

  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  // Check if device has battery optimization that might affect background tracking
  async checkBatteryOptimization(): Promise<{ optimized: boolean; message: string }> {
    // This is a placeholder - actual implementation would depend on device capabilities
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('android')) {
      return {
        optimized: true,
        message: 'For reliable job notifications, please disable battery optimization for TOWAPP in your device settings.'
      };
    }
    
    return {
      optimized: false,
      message: 'Background tracking should work normally on this device.'
    };
  }
}

export const backgroundLocationManager = new BackgroundLocationManager();