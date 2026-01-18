export interface FeatureFlags {
  // Core System Features
  SERVICE_REQUEST_FLOW: boolean;
  LIVE_DRIVER_TRACKING: boolean;
  PUSH_NOTIFICATIONS: boolean;
  PAYMENTS: boolean;
  ADMIN_OVERRIDES: boolean;
  
  // Domain-Specific Features
  AUTH_DOMAIN: boolean;
  DRIVER_DOMAIN: boolean;
  USER_DOMAIN: boolean;
  REQUEST_LIFECYCLE_DOMAIN: boolean;
  NOTIFICATIONS_DOMAIN: boolean;
  ADMIN_DOMAIN: boolean;
  
  // Testing Features
  MOCK_USERS: boolean;
  MOCK_DRIVERS: boolean;
  FAKE_LOCATIONS: boolean;
  MOCK_NOTIFICATIONS: boolean;
  SIMULATE_FAILURES: boolean;
  DEBUG_LOGGING: boolean;
}

export enum TestPhase {
  PHASE_0_AUTH = 'auth_infrastructure',
  PHASE_1_DRIVER = 'driver_core',
  PHASE_2_USER = 'user_core',
  PHASE_3_REQUEST = 'service_request_lifecycle',
  PHASE_4_LIVE = 'live_interaction',
  PHASE_5_EDGE = 'failure_edge_cases',
  PHASE_6_ADMIN = 'admin_oversight',
  PRODUCTION = 'production'
}

export interface TestConfig {
  currentPhase: TestPhase;
  enabledDomains: string[];
  lockedDomains: string[];
  testAccountsOnly: boolean;
  debugMode: boolean;
}

class FeatureFlagManager {
  private flags: FeatureFlags;
  private testConfig: TestConfig;
  private environment: string;

  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.loadConfiguration();
  }

  private loadConfiguration() {
    const currentPhase = (process.env.TEST_PHASE as TestPhase) || TestPhase.PRODUCTION;
    
    // Base flags from environment
    this.flags = {
      SERVICE_REQUEST_FLOW: process.env.FEATURE_SERVICE_REQUEST === 'true',
      LIVE_DRIVER_TRACKING: process.env.FEATURE_LIVE_TRACKING === 'true',
      PUSH_NOTIFICATIONS: process.env.FEATURE_PUSH_NOTIFICATIONS === 'true',
      PAYMENTS: process.env.FEATURE_PAYMENTS === 'true',
      ADMIN_OVERRIDES: process.env.FEATURE_ADMIN_OVERRIDES === 'true',
      
      AUTH_DOMAIN: true,
      DRIVER_DOMAIN: true,
      USER_DOMAIN: true,
      REQUEST_LIFECYCLE_DOMAIN: true,
      NOTIFICATIONS_DOMAIN: true,
      ADMIN_DOMAIN: true,
      
      MOCK_USERS: process.env.MOCK_USERS === 'true',
      MOCK_DRIVERS: process.env.MOCK_DRIVERS === 'true',
      FAKE_LOCATIONS: process.env.FAKE_LOCATIONS === 'true',
      MOCK_NOTIFICATIONS: process.env.MOCK_NOTIFICATIONS === 'true',
      SIMULATE_FAILURES: process.env.SIMULATE_FAILURES === 'true',
      DEBUG_LOGGING: process.env.DEBUG_LOGGING === 'true'
    };

    // Apply phase-specific overrides
    this.applyPhaseConfiguration(currentPhase);
    
    this.testConfig = {
      currentPhase,
      enabledDomains: this.getEnabledDomains(),
      lockedDomains: this.getLockedDomains(),
      testAccountsOnly: process.env.TEST_ACCOUNTS_ONLY === 'true',
      debugMode: process.env.DEBUG_MODE === 'true'
    };
  }

  private applyPhaseConfiguration(phase: TestPhase) {
    switch (phase) {
      case TestPhase.PHASE_0_AUTH:
        this.flags.AUTH_DOMAIN = true;
        this.flags.DRIVER_DOMAIN = false;
        this.flags.USER_DOMAIN = false;
        this.flags.REQUEST_LIFECYCLE_DOMAIN = false;
        this.flags.NOTIFICATIONS_DOMAIN = false;
        this.flags.ADMIN_DOMAIN = false;
        this.flags.SERVICE_REQUEST_FLOW = false;
        this.flags.LIVE_DRIVER_TRACKING = false;
        break;

      case TestPhase.PHASE_1_DRIVER:
        this.flags.AUTH_DOMAIN = true;
        this.flags.DRIVER_DOMAIN = true;
        this.flags.USER_DOMAIN = false;
        this.flags.REQUEST_LIFECYCLE_DOMAIN = false;
        this.flags.NOTIFICATIONS_DOMAIN = false;
        this.flags.ADMIN_DOMAIN = false;
        this.flags.MOCK_DRIVERS = true;
        this.flags.FAKE_LOCATIONS = true;
        break;

      case TestPhase.PHASE_2_USER:
        this.flags.AUTH_DOMAIN = true;
        this.flags.DRIVER_DOMAIN = true;
        this.flags.USER_DOMAIN = true;
        this.flags.REQUEST_LIFECYCLE_DOMAIN = false;
        this.flags.NOTIFICATIONS_DOMAIN = false;
        this.flags.ADMIN_DOMAIN = false;
        this.flags.MOCK_USERS = true;
        break;

      case TestPhase.PHASE_3_REQUEST:
        this.flags.AUTH_DOMAIN = true;
        this.flags.DRIVER_DOMAIN = true;
        this.flags.USER_DOMAIN = true;
        this.flags.REQUEST_LIFECYCLE_DOMAIN = true;
        this.flags.NOTIFICATIONS_DOMAIN = false;
        this.flags.ADMIN_DOMAIN = false;
        this.flags.SERVICE_REQUEST_FLOW = true;
        this.flags.MOCK_USERS = true;
        this.flags.MOCK_DRIVERS = true;
        this.flags.PAYMENTS = false;
        break;

      case TestPhase.PHASE_4_LIVE:
        this.flags.AUTH_DOMAIN = true;
        this.flags.DRIVER_DOMAIN = true;
        this.flags.USER_DOMAIN = true;
        this.flags.REQUEST_LIFECYCLE_DOMAIN = true;
        this.flags.NOTIFICATIONS_DOMAIN = true;
        this.flags.ADMIN_DOMAIN = false;
        this.flags.LIVE_DRIVER_TRACKING = true;
        this.flags.PUSH_NOTIFICATIONS = true;
        break;

      case TestPhase.PHASE_5_EDGE:
        Object.keys(this.flags).forEach(key => {
          if (key.includes('DOMAIN')) this.flags[key as keyof FeatureFlags] = true;
        });
        this.flags.SIMULATE_FAILURES = true;
        this.flags.DEBUG_LOGGING = true;
        break;

      case TestPhase.PHASE_6_ADMIN:
        Object.keys(this.flags).forEach(key => {
          this.flags[key as keyof FeatureFlags] = true;
        });
        break;

      case TestPhase.PRODUCTION:
        // Production defaults - all domains enabled, test features disabled
        Object.keys(this.flags).forEach(key => {
          if (key.includes('DOMAIN')) this.flags[key as keyof FeatureFlags] = true;
          if (key.includes('MOCK') || key.includes('FAKE') || key.includes('SIMULATE')) {
            this.flags[key as keyof FeatureFlags] = false;
          }
        });
        break;
    }
  }

  private getEnabledDomains(): string[] {
    return Object.keys(this.flags)
      .filter(key => key.includes('DOMAIN') && this.flags[key as keyof FeatureFlags])
      .map(key => key.replace('_DOMAIN', '').toLowerCase());
  }

  private getLockedDomains(): string[] {
    return Object.keys(this.flags)
      .filter(key => key.includes('DOMAIN') && !this.flags[key as keyof FeatureFlags])
      .map(key => key.replace('_DOMAIN', '').toLowerCase());
  }

  isEnabled(flag: keyof FeatureFlags): boolean {
    return this.flags[flag];
  }

  isDomainEnabled(domain: string): boolean {
    const domainFlag = `${domain.toUpperCase()}_DOMAIN` as keyof FeatureFlags;
    return this.flags[domainFlag] || false;
  }

  getCurrentPhase(): TestPhase {
    return this.testConfig.currentPhase;
  }

  getTestConfig(): TestConfig {
    return { ...this.testConfig };
  }

  getFlags(): FeatureFlags {
    return { ...this.flags };
  }

  // Runtime flag updates (for admin control)
  updateFlag(flag: keyof FeatureFlags, value: boolean) {
    if (this.environment === 'production') {
      throw new Error('Cannot update flags in production');
    }
    this.flags[flag] = value;
    this.logFlagChange(flag, value);
  }

  private logFlagChange(flag: keyof FeatureFlags, value: boolean) {
    console.log(`[FEATURE_FLAG] ${flag} = ${value} | Phase: ${this.testConfig.currentPhase}`);
  }
}

export const featureFlags = new FeatureFlagManager();