import { featureFlags } from './featureFlags.js';

// Fake Location Provider
export class FakeLocationProvider {
  private static locations = new Map<number, { latitude: number; longitude: number; timestamp: string }>();
  
  // Cape Town area coordinates for realistic simulation
  private static readonly CAPE_TOWN_BOUNDS = {
    north: -33.8000,
    south: -34.1000,
    east: 18.6000,
    west: 18.2000
  };

  static updateLocation(entityId: number, latitude?: number, longitude?: number): void {
    if (!featureFlags.isEnabled('FAKE_LOCATIONS')) {
      throw new Error('Fake locations not enabled');
    }

    const location = {
      latitude: latitude || this.generateRandomLatitude(),
      longitude: longitude || this.generateRandomLongitude(),
      timestamp: new Date().toISOString()
    };

    this.locations.set(entityId, location);
    console.log(`[FAKE_LOCATION] Entity ${entityId} moved to ${location.latitude}, ${location.longitude}`);
  }

  static getLocation(entityId: number): { latitude: number; longitude: number; timestamp: string } | null {
    if (!featureFlags.isEnabled('FAKE_LOCATIONS')) {
      return null;
    }

    return this.locations.get(entityId) || null;
  }

  static simulateMovement(entityId: number, speed: number = 0.001): void {
    if (!featureFlags.isEnabled('FAKE_LOCATIONS')) return;

    const current = this.locations.get(entityId);
    if (!current) {
      this.updateLocation(entityId);
      return;
    }

    // Simulate realistic movement
    const deltaLat = (Math.random() - 0.5) * speed;
    const deltaLng = (Math.random() - 0.5) * speed;

    const newLat = Math.max(this.CAPE_TOWN_BOUNDS.south, 
                   Math.min(this.CAPE_TOWN_BOUNDS.north, current.latitude + deltaLat));
    const newLng = Math.max(this.CAPE_TOWN_BOUNDS.west, 
                   Math.min(this.CAPE_TOWN_BOUNDS.east, current.longitude + deltaLng));

    this.updateLocation(entityId, newLat, newLng);
  }

  private static generateRandomLatitude(): number {
    return this.CAPE_TOWN_BOUNDS.south + 
           Math.random() * (this.CAPE_TOWN_BOUNDS.north - this.CAPE_TOWN_BOUNDS.south);
  }

  private static generateRandomLongitude(): number {
    return this.CAPE_TOWN_BOUNDS.west + 
           Math.random() * (this.CAPE_TOWN_BOUNDS.east - this.CAPE_TOWN_BOUNDS.west);
  }

  static startMovementSimulation(entityIds: number[], intervalMs: number = 5000): NodeJS.Timeout {
    if (!featureFlags.isEnabled('FAKE_LOCATIONS')) {
      throw new Error('Fake locations not enabled');
    }

    return setInterval(() => {
      entityIds.forEach(id => this.simulateMovement(id));
    }, intervalMs);
  }

  static getAllLocations(): Map<number, { latitude: number; longitude: number; timestamp: string }> {
    return new Map(this.locations);
  }

  static clearLocations(): void {
    this.locations.clear();
    console.log('[FAKE_LOCATION] All locations cleared');
  }
}

// Mock Push Notification Provider
export class MockNotificationProvider {
  private static notifications: Array<{
    id: number;
    recipient: number;
    type: 'push' | 'sms' | 'email';
    message: string;
    status: 'sent' | 'delivered' | 'failed';
    timestamp: string;
  }> = [];

  private static nextId = 1;

  static sendNotification(
    recipient: number, 
    type: 'push' | 'sms' | 'email', 
    message: string,
    forceFailure: boolean = false
  ): { id: number; status: 'sent' | 'failed' } {
    if (!featureFlags.isEnabled('MOCK_NOTIFICATIONS')) {
      throw new Error('Mock notifications not enabled');
    }

    const id = this.nextId++;
    const status = forceFailure ? 'failed' : 'sent';

    const notification = {
      id,
      recipient,
      type,
      message,
      status,
      timestamp: new Date().toISOString()
    };

    this.notifications.push(notification);

    // Simulate delivery delay
    if (status === 'sent') {
      setTimeout(() => {
        const notif = this.notifications.find(n => n.id === id);
        if (notif) {
          notif.status = Math.random() > 0.1 ? 'delivered' : 'failed';
        }
      }, Math.random() * 2000 + 500); // 0.5-2.5 second delay
    }

    console.log(`[MOCK_NOTIFICATION] ${type} to ${recipient}: ${message.substring(0, 50)}... [${status}]`);
    return { id, status };
  }

  static getNotifications(recipient?: number): typeof MockNotificationProvider.notifications {
    if (!featureFlags.isEnabled('MOCK_NOTIFICATIONS')) {
      return [];
    }

    if (recipient) {
      return this.notifications.filter(n => n.recipient === recipient);
    }

    return [...this.notifications];
  }

  static getDeliveryStats(): { sent: number; delivered: number; failed: number } {
    const stats = { sent: 0, delivered: 0, failed: 0 };
    
    this.notifications.forEach(n => {
      stats[n.status as keyof typeof stats]++;
    });

    return stats;
  }

  static clearNotifications(): void {
    this.notifications = [];
    this.nextId = 1;
    console.log('[MOCK_NOTIFICATION] All notifications cleared');
  }
}

// WebSocket Failure Simulator
export class WebSocketFailureSimulator {
  private static connections = new Map<string, { 
    id: string; 
    status: 'connected' | 'disconnected' | 'degraded';
    lastPing: string;
  }>();

  private static failureScenarios = [
    'connection_drop',
    'message_loss',
    'high_latency',
    'partial_connectivity'
  ];

  static registerConnection(connectionId: string): void {
    if (!featureFlags.isEnabled('SIMULATE_FAILURES')) return;

    this.connections.set(connectionId, {
      id: connectionId,
      status: 'connected',
      lastPing: new Date().toISOString()
    });

    console.log(`[WS_SIMULATOR] Connection ${connectionId} registered`);
  }

  static simulateFailure(connectionId: string, scenario?: string): void {
    if (!featureFlags.isEnabled('SIMULATE_FAILURES')) return;

    const connection = this.connections.get(connectionId);
    if (!connection) return;

    const failureType = scenario || this.failureScenarios[Math.floor(Math.random() * this.failureScenarios.length)];

    switch (failureType) {
      case 'connection_drop':
        connection.status = 'disconnected';
        console.log(`[WS_SIMULATOR] Connection ${connectionId} dropped`);
        break;

      case 'message_loss':
        // Simulate by not updating lastPing
        console.log(`[WS_SIMULATOR] Message loss simulated for ${connectionId}`);
        break;

      case 'high_latency':
        connection.status = 'degraded';
        console.log(`[WS_SIMULATOR] High latency simulated for ${connectionId}`);
        break;

      case 'partial_connectivity':
        connection.status = 'degraded';
        console.log(`[WS_SIMULATOR] Partial connectivity simulated for ${connectionId}`);
        break;
    }
  }

  static restoreConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.status = 'connected';
      connection.lastPing = new Date().toISOString();
      console.log(`[WS_SIMULATOR] Connection ${connectionId} restored`);
    }
  }

  static getConnectionStatus(connectionId: string): string {
    const connection = this.connections.get(connectionId);
    return connection?.status || 'unknown';
  }

  static getAllConnections(): Map<string, any> {
    return new Map(this.connections);
  }
}

// Network Drop Simulator
export class NetworkDropSimulator {
  private static isNetworkDown = false;
  private static dropStartTime: string | null = null;

  static simulateNetworkDrop(durationMs: number = 5000): void {
    if (!featureFlags.isEnabled('SIMULATE_FAILURES')) {
      throw new Error('Failure simulation not enabled');
    }

    this.isNetworkDown = true;
    this.dropStartTime = new Date().toISOString();

    console.log(`[NETWORK_SIMULATOR] Network drop simulated for ${durationMs}ms`);

    setTimeout(() => {
      this.restoreNetwork();
    }, durationMs);
  }

  static restoreNetwork(): void {
    this.isNetworkDown = false;
    const duration = this.dropStartTime ? 
      Date.now() - new Date(this.dropStartTime).getTime() : 0;
    
    console.log(`[NETWORK_SIMULATOR] Network restored after ${duration}ms`);
    this.dropStartTime = null;
  }

  static isNetworkAvailable(): boolean {
    return !this.isNetworkDown;
  }

  static interceptRequest(url: string): boolean {
    if (!featureFlags.isEnabled('SIMULATE_FAILURES')) {
      return true; // Allow request
    }

    if (this.isNetworkDown) {
      console.log(`[NETWORK_SIMULATOR] Request blocked: ${url}`);
      return false;
    }

    return true;
  }
}

// Comprehensive Debug Controller
export class DebugController {
  static getSystemStatus(): any {
    return {
      featureFlags: featureFlags.getFlags(),
      currentPhase: featureFlags.getCurrentPhase(),
      testConfig: featureFlags.getTestConfig(),
      simulators: {
        fakeLocations: {
          enabled: featureFlags.isEnabled('FAKE_LOCATIONS'),
          activeLocations: FakeLocationProvider.getAllLocations().size
        },
        mockNotifications: {
          enabled: featureFlags.isEnabled('MOCK_NOTIFICATIONS'),
          totalSent: MockNotificationProvider.getNotifications().length,
          deliveryStats: MockNotificationProvider.getDeliveryStats()
        },
        websocketFailures: {
          enabled: featureFlags.isEnabled('SIMULATE_FAILURES'),
          activeConnections: WebSocketFailureSimulator.getAllConnections().size
        },
        networkDrop: {
          enabled: featureFlags.isEnabled('SIMULATE_FAILURES'),
          isDown: !NetworkDropSimulator.isNetworkAvailable()
        }
      },
      timestamp: new Date().toISOString()
    };
  }

  static resetAllSimulators(): void {
    if (featureFlags.getCurrentPhase() === 'production') {
      throw new Error('Cannot reset simulators in production');
    }

    FakeLocationProvider.clearLocations();
    MockNotificationProvider.clearNotifications();
    NetworkDropSimulator.restoreNetwork();

    console.log('[DEBUG_CONTROLLER] All simulators reset');
  }

  static enableDebugMode(): void {
    if (featureFlags.getCurrentPhase() === 'production') {
      throw new Error('Cannot enable debug mode in production');
    }

    featureFlags.updateFlag('DEBUG_LOGGING', true);
    featureFlags.updateFlag('SIMULATE_FAILURES', true);
    featureFlags.updateFlag('FAKE_LOCATIONS', true);
    featureFlags.updateFlag('MOCK_NOTIFICATIONS', true);

    console.log('[DEBUG_CONTROLLER] Debug mode enabled');
  }

  static disableDebugMode(): void {
    featureFlags.updateFlag('DEBUG_LOGGING', false);
    featureFlags.updateFlag('SIMULATE_FAILURES', false);
    featureFlags.updateFlag('FAKE_LOCATIONS', false);
    featureFlags.updateFlag('MOCK_NOTIFICATIONS', false);

    this.resetAllSimulators();
    console.log('[DEBUG_CONTROLLER] Debug mode disabled');
  }
}