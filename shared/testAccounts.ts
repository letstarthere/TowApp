import { featureFlags, TestPhase } from './featureFlags.js';

export interface TestAccount {
  id: number;
  type: 'user' | 'driver' | 'admin';
  email: string;
  password: string;
  name: string;
  phone: string;
  isTestAccount: true;
  phase: TestPhase;
  metadata: any;
}

export class TestAccountManager {
  private static testUsers: TestAccount[] = [
    {
      id: 9001,
      type: 'user',
      email: 'testuser1@towapp.test',
      password: 'test123',
      name: 'Test User Alpha',
      phone: '+27123000001',
      isTestAccount: true,
      phase: TestPhase.PHASE_2_USER,
      metadata: {
        vehicle: {
          type: 'sedan',
          model: 'Toyota Corolla',
          licensePlate: 'TEST001'
        },
        location: { latitude: -33.9249, longitude: 18.4241 }
      }
    },
    {
      id: 9002,
      type: 'user',
      email: 'testuser2@towapp.test',
      password: 'test123',
      name: 'Test User Beta',
      phone: '+27123000002',
      isTestAccount: true,
      phase: TestPhase.PHASE_2_USER,
      metadata: {
        vehicle: {
          type: 'suv',
          model: 'BMW X3',
          licensePlate: 'TEST002'
        },
        location: { latitude: -33.9350, longitude: 18.4350 }
      }
    },
    {
      id: 9003,
      type: 'user',
      email: 'testuser3@towapp.test',
      password: 'test123',
      name: 'Test User Gamma',
      phone: '+27123000003',
      isTestAccount: true,
      phase: TestPhase.PHASE_3_REQUEST,
      metadata: {
        vehicle: {
          type: 'hatchback',
          model: 'VW Polo',
          licensePlate: 'TEST003'
        },
        location: { latitude: -33.9150, longitude: 18.4150 },
        behaviorProfile: 'frequent_canceller' // For edge case testing
      }
    }
  ];

  private static testDrivers: TestAccount[] = [
    {
      id: 8001,
      type: 'driver',
      email: 'testdriver1@towapp.test',
      password: 'test123',
      name: 'Test Driver Alpha',
      phone: '+27123000101',
      isTestAccount: true,
      phase: TestPhase.PHASE_1_DRIVER,
      metadata: {
        truckType: 'flatbed',
        licensePlate: 'TDRV001',
        location: { latitude: -33.9200, longitude: 18.4200 },
        status: 'online',
        acceptanceRate: 0.95,
        behaviorProfile: 'reliable' // Always accepts requests
      }
    },
    {
      id: 8002,
      type: 'driver',
      email: 'testdriver2@towapp.test',
      password: 'test123',
      name: 'Test Driver Beta',
      phone: '+27123000102',
      isTestAccount: true,
      phase: TestPhase.PHASE_1_DRIVER,
      metadata: {
        truckType: 'wheel_lift',
        licensePlate: 'TDRV002',
        location: { latitude: -33.9300, longitude: 18.4300 },
        status: 'online',
        acceptanceRate: 0.70,
        behaviorProfile: 'selective' // Sometimes declines
      }
    },
    {
      id: 8003,
      type: 'driver',
      email: 'testdriver3@towapp.test',
      password: 'test123',
      name: 'Test Driver Gamma',
      phone: '+27123000103',
      isTestAccount: true,
      phase: TestPhase.PHASE_5_EDGE,
      metadata: {
        truckType: 'integrated',
        licensePlate: 'TDRV003',
        location: { latitude: -33.9100, longitude: 18.4100 },
        status: 'offline',
        acceptanceRate: 0.30,
        behaviorProfile: 'unreliable' // For failure testing
      }
    }
  ];

  private static testAdmins: TestAccount[] = [
    {
      id: 7001,
      type: 'admin',
      email: 'testadmin@towapp.test',
      password: 'admin123',
      name: 'Test Admin',
      phone: '+27123000201',
      isTestAccount: true,
      phase: TestPhase.PHASE_6_ADMIN,
      metadata: {
        role: 'super_admin',
        permissions: ['all']
      }
    }
  ];

  static getTestAccounts(type?: 'user' | 'driver' | 'admin', phase?: TestPhase): TestAccount[] {
    let accounts: TestAccount[] = [];
    
    if (!type || type === 'user') accounts = accounts.concat(this.testUsers);
    if (!type || type === 'driver') accounts = accounts.concat(this.testDrivers);
    if (!type || type === 'admin') accounts = accounts.concat(this.testAdmins);

    if (phase) {
      const phaseOrder = [
        TestPhase.PHASE_0_AUTH,
        TestPhase.PHASE_1_DRIVER,
        TestPhase.PHASE_2_USER,
        TestPhase.PHASE_3_REQUEST,
        TestPhase.PHASE_4_LIVE,
        TestPhase.PHASE_5_EDGE,
        TestPhase.PHASE_6_ADMIN,
        TestPhase.PRODUCTION
      ];
      
      const currentPhaseIndex = phaseOrder.indexOf(phase);
      accounts = accounts.filter(account => {
        const accountPhaseIndex = phaseOrder.indexOf(account.phase);
        return accountPhaseIndex <= currentPhaseIndex;
      });
    }

    return accounts;
  }

  static getTestAccount(id: number): TestAccount | null {
    const allAccounts = [
      ...this.testUsers,
      ...this.testDrivers,
      ...this.testAdmins
    ];
    
    return allAccounts.find(account => account.id === id) || null;
  }

  static isTestAccount(email: string): boolean {
    return email.endsWith('@towapp.test');
  }

  static validateTestAccountAccess(accountType: 'user' | 'driver' | 'admin'): boolean {
    const currentPhase = featureFlags.getCurrentPhase();
    const testConfig = featureFlags.getTestConfig();

    // Production allows real accounts only
    if (currentPhase === TestPhase.PRODUCTION) {
      return false;
    }

    // Test phases require test accounts
    if (testConfig.testAccountsOnly) {
      return true;
    }

    return false;
  }

  static getAccountsForCurrentPhase(): TestAccount[] {
    const currentPhase = featureFlags.getCurrentPhase();
    return this.getTestAccounts(undefined, currentPhase);
  }

  // Deterministic behavior simulation
  static simulateDriverBehavior(driverId: number, requestId: number): 'accept' | 'decline' | 'timeout' {
    const driver = this.getTestAccount(driverId);
    if (!driver || driver.type !== 'driver') {
      return 'timeout';
    }

    const behaviorProfile = driver.metadata.behaviorProfile;
    const acceptanceRate = driver.metadata.acceptanceRate;

    switch (behaviorProfile) {
      case 'reliable':
        return 'accept';
      
      case 'selective':
        // Use request ID for deterministic behavior
        return (requestId % 3 === 0) ? 'decline' : 'accept';
      
      case 'unreliable':
        return (requestId % 4 === 0) ? 'accept' : 'timeout';
      
      default:
        return Math.random() < acceptanceRate ? 'accept' : 'decline';
    }
  }

  static simulateUserBehavior(userId: number, action: string): boolean {
    const user = this.getTestAccount(userId);
    if (!user || user.type !== 'user') {
      return true; // Default behavior
    }

    const behaviorProfile = user.metadata.behaviorProfile;

    if (action === 'cancel_request' && behaviorProfile === 'frequent_canceller') {
      return Math.random() < 0.4; // 40% chance to cancel
    }

    return true; // Normal behavior
  }
}

// Test-only admin commands
export class TestAdminCommands {
  static async createTestRequest(userId: number, driverId?: number): Promise<any> {
    if (!featureFlags.isEnabled('MOCK_USERS')) {
      throw new Error('Test commands only available in test mode');
    }

    const user = TestAccountManager.getTestAccount(userId);
    if (!user || user.type !== 'user') {
      throw new Error('Invalid test user ID');
    }

    return {
      requestId: Math.floor(Math.random() * 10000),
      userId,
      driverId,
      status: 'pending',
      pickupLocation: user.metadata.location,
      dropoffLocation: {
        latitude: user.metadata.location.latitude + 0.01,
        longitude: user.metadata.location.longitude + 0.01
      },
      estimatedPrice: 350,
      createdAt: new Date().toISOString()
    };
  }

  static async simulateDriverResponse(driverId: number, requestId: number, action: 'accept' | 'decline'): Promise<any> {
    if (!featureFlags.isEnabled('MOCK_DRIVERS')) {
      throw new Error('Driver simulation only available in test mode');
    }

    const driver = TestAccountManager.getTestAccount(driverId);
    if (!driver || driver.type !== 'driver') {
      throw new Error('Invalid test driver ID');
    }

    return {
      driverId,
      requestId,
      action,
      timestamp: new Date().toISOString(),
      location: driver.metadata.location
    };
  }

  static async resetTestData(): Promise<void> {
    if (featureFlags.getCurrentPhase() === TestPhase.PRODUCTION) {
      throw new Error('Cannot reset data in production');
    }

    // Reset any in-memory test data
    console.log('[TEST_ADMIN] Test data reset');
  }

  static async setDriverStatus(driverId: number, status: 'online' | 'offline' | 'busy'): Promise<void> {
    if (!featureFlags.isEnabled('MOCK_DRIVERS')) {
      throw new Error('Driver control only available in test mode');
    }

    const driver = TestAccountManager.getTestAccount(driverId);
    if (driver && driver.type === 'driver') {
      driver.metadata.status = status;
      console.log(`[TEST_ADMIN] Driver ${driverId} status set to ${status}`);
    }
  }

  static async moveDriver(driverId: number, latitude: number, longitude: number): Promise<void> {
    if (!featureFlags.isEnabled('FAKE_LOCATIONS')) {
      throw new Error('Location control only available in test mode');
    }

    const driver = TestAccountManager.getTestAccount(driverId);
    if (driver && driver.type === 'driver') {
      driver.metadata.location = { latitude, longitude };
      console.log(`[TEST_ADMIN] Driver ${driverId} moved to ${latitude}, ${longitude}`);
    }
  }

  static getTestAccountSummary(): any {
    const currentPhase = featureFlags.getCurrentPhase();
    const accounts = TestAccountManager.getAccountsForCurrentPhase();

    return {
      currentPhase,
      totalAccounts: accounts.length,
      users: accounts.filter(a => a.type === 'user').length,
      drivers: accounts.filter(a => a.type === 'driver').length,
      admins: accounts.filter(a => a.type === 'admin').length,
      accounts: accounts.map(a => ({
        id: a.id,
        type: a.type,
        email: a.email,
        name: a.name,
        phase: a.phase
      }))
    };
  }
}