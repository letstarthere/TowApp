// Testing utilities for phase-based testing
export interface TestingConfig {
  autoLoginUser?: boolean;
  autoLoginDriver?: boolean;
  userEmail?: string;
  driverEmail?: string;
  skipLogin?: boolean;
  testPhase?: string;
  enableRequests?: boolean;
  enableLiveTracking?: boolean;
  createActiveRequest?: boolean;
  createCompletedRequest?: boolean;
}

export class TestingUtils {
  private static config: TestingConfig = {};

  static initialize() {
    // Check if we're in development mode and read environment variables
    if (import.meta.env.DEV) {
      this.config = {
        autoLoginUser: import.meta.env.VITE_AUTO_LOGIN_USER === 'true',
        autoLoginDriver: import.meta.env.VITE_AUTO_LOGIN_DRIVER === 'true',
        userEmail: import.meta.env.VITE_USER_EMAIL,
        driverEmail: import.meta.env.VITE_DRIVER_EMAIL,
        skipLogin: import.meta.env.VITE_SKIP_LOGIN === 'true',
        testPhase: import.meta.env.VITE_TEST_PHASE,
        enableRequests: import.meta.env.VITE_ENABLE_REQUESTS === 'true',
        enableLiveTracking: import.meta.env.VITE_ENABLE_LIVE_TRACKING === 'true',
        createActiveRequest: import.meta.env.VITE_CREATE_ACTIVE_REQUEST === 'true',
        createCompletedRequest: import.meta.env.VITE_CREATE_COMPLETED_REQUEST === 'true'
      };
    }
  }

  static getConfig(): TestingConfig {
    return this.config;
  }

  static shouldAutoLogin(): boolean {
    // Simple check - if we're in testing mode and have credentials, auto-login
    return this.isTestingMode() && (this.config.autoLoginUser || this.config.autoLoginDriver) && !this.shouldSkipAutoLogin();
  }

  static getAutoLoginCredentials(): { email: string; phone: string; userType: 'user' | 'driver' } | null {
    // Use hardcoded test credentials for simplicity
    if (this.config.testPhase === 'service_requests' || this.config.testPhase === 'live_tracking' || this.config.testPhase === 'payment_flow') {
      // For phases that need both, default to user
      return {
        email: 'bampoesean@gmail.com',
        phone: '+27123456789',
        userType: 'user'
      };
    }
    
    if (this.config.testPhase === 'driver_dashboard') {
      return {
        email: 'driver1@towapp.com',
        phone: '+27123456700',
        userType: 'driver'
      };
    }
    
    if (this.config.testPhase === 'user_dashboard') {
      return {
        email: 'bampoesean@gmail.com',
        phone: '+27123456789',
        userType: 'user'
      };
    }

    return null;
  }

  static shouldSkipRoleSelection(): boolean {
    return this.config.skipLogin || false;
  }

  static getTestPhase(): string | undefined {
    return this.config.testPhase;
  }

  static isTestingMode(): boolean {
    return import.meta.env.DEV && !!this.config.testPhase;
  }

  static async performAutoLogin(): Promise<boolean> {
    const credentials = this.getAutoLoginCredentials();
    if (!credentials) return false;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          phone: credentials.phone,
          userType: credentials.userType
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('Auto-login successful:', data.user);
        return true;
      } else {
        console.error('Auto-login failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Auto-login error:', error);
      return false;
    }
  }

  static skipAutoLogin(): void {
    localStorage.setItem('skipAutoLogin', 'true');
  }

  static shouldSkipAutoLogin(): boolean {
    return localStorage.getItem('skipAutoLogin') === 'true';
  }
}

// Initialize on module load
TestingUtils.initialize();