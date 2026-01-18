import { featureFlags, TestPhase } from './featureFlags.js';
import { domainRegistry } from './domainPartitions.js';

export interface PhaseRequirement {
  phase: TestPhase;
  requiredDomains: string[];
  lockedDomains: string[];
  requiredFlags: string[];
  testAccounts: boolean;
  description: string;
}

export class PhaseEnforcer {
  private static phases: Map<TestPhase, PhaseRequirement> = new Map([
    [TestPhase.PHASE_0_AUTH, {
      phase: TestPhase.PHASE_0_AUTH,
      requiredDomains: ['auth'],
      lockedDomains: ['driver', 'user', 'request_lifecycle', 'notifications', 'admin'],
      requiredFlags: ['AUTH_DOMAIN'],
      testAccounts: true,
      description: 'Authentication and infrastructure testing only'
    }],
    
    [TestPhase.PHASE_1_DRIVER, {
      phase: TestPhase.PHASE_1_DRIVER,
      requiredDomains: ['auth', 'driver'],
      lockedDomains: ['user', 'request_lifecycle', 'notifications', 'admin'],
      requiredFlags: ['AUTH_DOMAIN', 'DRIVER_DOMAIN', 'MOCK_DRIVERS', 'FAKE_LOCATIONS'],
      testAccounts: true,
      description: 'Driver core functionality with mocked location data'
    }],
    
    [TestPhase.PHASE_2_USER, {
      phase: TestPhase.PHASE_2_USER,
      requiredDomains: ['auth', 'driver', 'user'],
      lockedDomains: ['request_lifecycle', 'notifications', 'admin'],
      requiredFlags: ['AUTH_DOMAIN', 'DRIVER_DOMAIN', 'USER_DOMAIN', 'MOCK_USERS'],
      testAccounts: true,
      description: 'User core functionality with vehicle details'
    }],
    
    [TestPhase.PHASE_3_REQUEST, {
      phase: TestPhase.PHASE_3_REQUEST,
      requiredDomains: ['auth', 'driver', 'user', 'request_lifecycle'],
      lockedDomains: ['notifications', 'admin'],
      requiredFlags: ['SERVICE_REQUEST_FLOW', 'MOCK_USERS', 'MOCK_DRIVERS'],
      testAccounts: true,
      description: 'Service request lifecycle with deterministic behavior'
    }],
    
    [TestPhase.PHASE_4_LIVE, {
      phase: TestPhase.PHASE_4_LIVE,
      requiredDomains: ['auth', 'driver', 'user', 'request_lifecycle', 'notifications'],
      lockedDomains: ['admin'],
      requiredFlags: ['LIVE_DRIVER_TRACKING', 'PUSH_NOTIFICATIONS'],
      testAccounts: true,
      description: 'Live interaction with real-time features'
    }],
    
    [TestPhase.PHASE_5_EDGE, {
      phase: TestPhase.PHASE_5_EDGE,
      requiredDomains: ['auth', 'driver', 'user', 'request_lifecycle', 'notifications'],
      lockedDomains: ['admin'],
      requiredFlags: ['SIMULATE_FAILURES', 'DEBUG_LOGGING'],
      testAccounts: true,
      description: 'Failure scenarios and edge case testing'
    }],
    
    [TestPhase.PHASE_6_ADMIN, {
      phase: TestPhase.PHASE_6_ADMIN,
      requiredDomains: ['auth', 'driver', 'user', 'request_lifecycle', 'notifications', 'admin'],
      lockedDomains: [],
      requiredFlags: ['ADMIN_OVERRIDES'],
      testAccounts: true,
      description: 'Admin oversight and control testing'
    }],
    
    [TestPhase.PRODUCTION, {
      phase: TestPhase.PRODUCTION,
      requiredDomains: ['auth', 'driver', 'user', 'request_lifecycle', 'notifications', 'admin'],
      lockedDomains: [],
      requiredFlags: [],
      testAccounts: false,
      description: 'Production environment with all features enabled'
    }]
  ]);

  static validatePhase(requestedPhase: TestPhase): boolean {
    const currentPhase = featureFlags.getCurrentPhase();
    const phaseReq = this.phases.get(currentPhase);
    
    if (!phaseReq) {
      throw new Error(`Invalid phase: ${currentPhase}`);
    }

    // Check if all required domains are enabled
    for (const domain of phaseReq.requiredDomains) {
      if (!featureFlags.isDomainEnabled(domain)) {
        throw new Error(`Phase ${currentPhase} requires domain ${domain} to be enabled`);
      }
    }

    // Check if locked domains are disabled
    for (const domain of phaseReq.lockedDomains) {
      if (featureFlags.isDomainEnabled(domain)) {
        throw new Error(`Phase ${currentPhase} requires domain ${domain} to be locked`);
      }
    }

    // Check required flags
    for (const flag of phaseReq.requiredFlags) {
      if (!featureFlags.isEnabled(flag as any)) {
        throw new Error(`Phase ${currentPhase} requires flag ${flag} to be enabled`);
      }
    }

    return true;
  }

  static enforcePhaseRestrictions(domain: string, action: string): void {
    const currentPhase = featureFlags.getCurrentPhase();
    const phaseReq = this.phases.get(currentPhase);
    
    if (!phaseReq) {
      throw new Error(`Invalid phase: ${currentPhase}`);
    }

    // Prevent access to locked domains
    if (phaseReq.lockedDomains.includes(domain)) {
      throw new Error(`Domain ${domain} is locked in phase ${currentPhase}. Action: ${action}`);
    }

    // Ensure required domains are available
    if (phaseReq.requiredDomains.includes(domain) && !featureFlags.isDomainEnabled(domain)) {
      throw new Error(`Domain ${domain} is required but not enabled in phase ${currentPhase}`);
    }

    this.logPhaseAccess(domain, action, currentPhase);
  }

  static preventCrossTesting(domains: string[]): void {
    const currentPhase = featureFlags.getCurrentPhase();
    const phaseReq = this.phases.get(currentPhase);
    
    if (!phaseReq) return;

    const unauthorizedDomains = domains.filter(domain => 
      phaseReq.lockedDomains.includes(domain)
    );

    if (unauthorizedDomains.length > 0) {
      throw new Error(`Cross-testing prevented: Domains [${unauthorizedDomains.join(', ')}] are locked in phase ${currentPhase}`);
    }
  }

  static getPhaseInfo(phase?: TestPhase): PhaseRequirement | null {
    const targetPhase = phase || featureFlags.getCurrentPhase();
    return this.phases.get(targetPhase) || null;
  }

  static getAllPhases(): PhaseRequirement[] {
    return Array.from(this.phases.values());
  }

  static canTransitionTo(targetPhase: TestPhase): boolean {
    const currentPhase = featureFlags.getCurrentPhase();
    const currentReq = this.phases.get(currentPhase);
    const targetReq = this.phases.get(targetPhase);

    if (!currentReq || !targetReq) return false;

    // Can always go to production
    if (targetPhase === TestPhase.PRODUCTION) return true;

    // Can go backwards for debugging
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

    const currentIndex = phaseOrder.indexOf(currentPhase);
    const targetIndex = phaseOrder.indexOf(targetPhase);

    // Allow forward progression or backward debugging
    return targetIndex >= currentIndex - 1;
  }

  private static logPhaseAccess(domain: string, action: string, phase: TestPhase): void {
    if (featureFlags.isEnabled('DEBUG_LOGGING')) {
      console.log(`[PHASE_ENFORCER] ${domain}.${action} | Phase: ${phase} | ${new Date().toISOString()}`);
    }
  }
}

// Phase-aware middleware for API routes
export function phaseMiddleware(domain: string) {
  return (req: any, res: any, next: any) => {
    try {
      const action = `${req.method}:${req.path}`;
      PhaseEnforcer.enforcePhaseRestrictions(domain, action);
      
      // Add phase info to request
      req.testPhase = featureFlags.getCurrentPhase();
      req.phaseInfo = PhaseEnforcer.getPhaseInfo();
      
      next();
    } catch (error) {
      res.status(403).json({
        error: 'Phase restriction violation',
        message: (error as Error).message,
        currentPhase: featureFlags.getCurrentPhase(),
        domain
      });
    }
  };
}

// Phase transition controller
export class PhaseController {
  static async transitionTo(targetPhase: TestPhase): Promise<boolean> {
    if (!PhaseEnforcer.canTransitionTo(targetPhase)) {
      throw new Error(`Cannot transition to phase ${targetPhase} from ${featureFlags.getCurrentPhase()}`);
    }

    try {
      // Update environment variable (would need restart in real implementation)
      process.env.TEST_PHASE = targetPhase;
      
      // Reload feature flags
      const newFlags = new (featureFlags.constructor as any)();
      Object.assign(featureFlags, newFlags);
      
      console.log(`[PHASE_TRANSITION] Moved to ${targetPhase}`);
      return true;
    } catch (error) {
      console.error(`[PHASE_TRANSITION] Failed to transition to ${targetPhase}:`, error);
      return false;
    }
  }

  static getCurrentPhaseStatus() {
    const phase = featureFlags.getCurrentPhase();
    const phaseInfo = PhaseEnforcer.getPhaseInfo(phase);
    const enabledDomains = domainRegistry.getEnabledDomains();
    const lockedDomains = domainRegistry.getLockedDomains();

    return {
      currentPhase: phase,
      description: phaseInfo?.description,
      enabledDomains,
      lockedDomains,
      testAccountsOnly: phaseInfo?.testAccounts,
      flags: featureFlags.getFlags(),
      isValid: PhaseEnforcer.validatePhase(phase)
    };
  }

  static getAvailableTransitions(): TestPhase[] {
    return PhaseEnforcer.getAllPhases()
      .map(p => p.phase)
      .filter(phase => PhaseEnforcer.canTransitionTo(phase));
  }
}