import { featureFlags } from './featureFlags.js';

export interface DomainContract<TInput, TOutput> {
  domain: string;
  input: TInput;
  output: TOutput;
  dependencies: string[];
  version: string;
}

export abstract class DomainPartition<TInput, TOutput> {
  protected domain: string;
  protected version: string;
  protected dependencies: string[];

  constructor(domain: string, version: string = '1.0.0', dependencies: string[] = []) {
    this.domain = domain;
    this.version = version;
    this.dependencies = dependencies;
  }

  protected checkDomainEnabled(): void {
    if (!featureFlags.isDomainEnabled(this.domain)) {
      throw new Error(`Domain ${this.domain} is disabled in current test phase`);
    }
  }

  protected checkDependencies(): void {
    for (const dep of this.dependencies) {
      if (!featureFlags.isDomainEnabled(dep)) {
        throw new Error(`Domain ${this.domain} requires ${dep} which is disabled`);
      }
    }
  }

  abstract execute(input: TInput): Promise<TOutput>;

  async safeExecute(input: TInput): Promise<TOutput> {
    this.checkDomainEnabled();
    this.checkDependencies();
    
    const startTime = Date.now();
    try {
      const result = await this.execute(input);
      this.logExecution(input, result, Date.now() - startTime, true);
      return result;
    } catch (error) {
      this.logExecution(input, error, Date.now() - startTime, false);
      throw error;
    }
  }

  private logExecution(input: TInput, output: any, duration: number, success: boolean) {
    if (featureFlags.isEnabled('DEBUG_LOGGING')) {
      console.log(`[DOMAIN_${this.domain.toUpperCase()}] ${success ? 'SUCCESS' : 'ERROR'} | ${duration}ms | Phase: ${featureFlags.getCurrentPhase()}`);
    }
  }

  getContract(): Partial<DomainContract<TInput, TOutput>> {
    return {
      domain: this.domain,
      dependencies: this.dependencies,
      version: this.version
    };
  }
}

// Authentication & Accounts Domain
export interface AuthInput {
  email: string;
  password: string;
  userType: 'user' | 'driver' | 'admin';
}

export interface AuthOutput {
  token: string;
  userId: number;
  userType: 'user' | 'driver' | 'admin';
  verified: boolean;
}

export class AuthDomain extends DomainPartition<AuthInput, AuthOutput> {
  constructor() {
    super('auth', '1.0.0', []);
  }

  async execute(input: AuthInput): Promise<AuthOutput> {
    // Isolated authentication logic
    if (featureFlags.isEnabled('MOCK_USERS') && input.userType !== 'admin') {
      return {
        token: `mock_token_${Date.now()}`,
        userId: Math.floor(Math.random() * 1000),
        userType: input.userType,
        verified: true
      };
    }

    // Real authentication logic here
    throw new Error('Real auth not implemented in test mode');
  }
}

// Driver State & Location Domain
export interface DriverInput {
  driverId: number;
  action: 'updateLocation' | 'setStatus' | 'getState';
  data?: {
    latitude?: number;
    longitude?: number;
    status?: 'online' | 'offline' | 'busy';
  };
}

export interface DriverOutput {
  driverId: number;
  location?: { latitude: number; longitude: number };
  status: 'online' | 'offline' | 'busy';
  lastUpdate: string;
}

export class DriverDomain extends DomainPartition<DriverInput, DriverOutput> {
  constructor() {
    super('driver', '1.0.0', ['auth']);
  }

  async execute(input: DriverInput): Promise<DriverOutput> {
    if (featureFlags.isEnabled('FAKE_LOCATIONS')) {
      return {
        driverId: input.driverId,
        location: {
          latitude: -33.9249 + (Math.random() - 0.5) * 0.1,
          longitude: 18.4241 + (Math.random() - 0.5) * 0.1
        },
        status: 'online',
        lastUpdate: new Date().toISOString()
      };
    }

    // Real driver logic here
    throw new Error('Real driver logic not implemented in test mode');
  }
}

// User Core & Vehicle Details Domain
export interface UserInput {
  userId: number;
  action: 'getProfile' | 'updateVehicle' | 'getHistory';
  data?: {
    vehicleType?: string;
    vehicleModel?: string;
    licensePlate?: string;
  };
}

export interface UserOutput {
  userId: number;
  profile: {
    name: string;
    email: string;
    phone: string;
  };
  vehicle?: {
    type: string;
    model: string;
    licensePlate: string;
  };
}

export class UserDomain extends DomainPartition<UserInput, UserOutput> {
  constructor() {
    super('user', '1.0.0', ['auth']);
  }

  async execute(input: UserInput): Promise<UserOutput> {
    if (featureFlags.isEnabled('MOCK_USERS')) {
      return {
        userId: input.userId,
        profile: {
          name: `Test User ${input.userId}`,
          email: `user${input.userId}@test.com`,
          phone: `+2712345${input.userId.toString().padStart(4, '0')}`
        },
        vehicle: {
          type: 'sedan',
          model: 'Toyota Corolla',
          licensePlate: `TEST${input.userId}`
        }
      };
    }

    // Real user logic here
    throw new Error('Real user logic not implemented in test mode');
  }
}

// Service Request Lifecycle Domain
export interface RequestInput {
  action: 'create' | 'broadcast' | 'accept' | 'decline' | 'complete' | 'cancel';
  requestId?: number;
  userId?: number;
  driverId?: number;
  data?: {
    pickupLocation?: { latitude: number; longitude: number };
    dropoffLocation?: { latitude: number; longitude: number };
    vehicleType?: string;
    estimatedPrice?: number;
  };
}

export interface RequestOutput {
  requestId: number;
  status: 'pending' | 'broadcast' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  userId: number;
  driverId?: number;
  timeline: Array<{
    status: string;
    timestamp: string;
    details?: string;
  }>;
  estimatedPrice?: number;
}

export class RequestLifecycleDomain extends DomainPartition<RequestInput, RequestOutput> {
  private static requests = new Map<number, RequestOutput>();
  private static nextId = 1;

  constructor() {
    super('request_lifecycle', '1.0.0', ['auth', 'user', 'driver']);
  }

  async execute(input: RequestInput): Promise<RequestOutput> {
    if (!featureFlags.isEnabled('SERVICE_REQUEST_FLOW')) {
      throw new Error('Service request flow is disabled');
    }

    switch (input.action) {
      case 'create':
        return this.createRequest(input);
      case 'broadcast':
        return this.broadcastRequest(input.requestId!);
      case 'accept':
        return this.acceptRequest(input.requestId!, input.driverId!);
      case 'decline':
        return this.declineRequest(input.requestId!, input.driverId!);
      case 'complete':
        return this.completeRequest(input.requestId!);
      case 'cancel':
        return this.cancelRequest(input.requestId!);
      default:
        throw new Error(`Unknown action: ${input.action}`);
    }
  }

  private createRequest(input: RequestInput): RequestOutput {
    const requestId = RequestLifecycleDomain.nextId++;
    const request: RequestOutput = {
      requestId,
      status: 'pending',
      userId: input.userId!,
      timeline: [{
        status: 'pending',
        timestamp: new Date().toISOString(),
        details: 'Request created'
      }],
      estimatedPrice: input.data?.estimatedPrice
    };

    RequestLifecycleDomain.requests.set(requestId, request);
    return request;
  }

  private broadcastRequest(requestId: number): RequestOutput {
    const request = RequestLifecycleDomain.requests.get(requestId);
    if (!request) throw new Error('Request not found');

    request.status = 'broadcast';
    request.timeline.push({
      status: 'broadcast',
      timestamp: new Date().toISOString(),
      details: 'Request broadcast to nearby drivers'
    });

    // Simulate deterministic driver responses in test mode
    if (featureFlags.isEnabled('MOCK_DRIVERS')) {
      setTimeout(() => {
        if (Math.random() > 0.3) { // 70% acceptance rate
          this.acceptRequest(requestId, Math.floor(Math.random() * 100) + 1);
        }
      }, 2000); // 2 second delay
    }

    return request;
  }

  private acceptRequest(requestId: number, driverId: number): RequestOutput {
    const request = RequestLifecycleDomain.requests.get(requestId);
    if (!request) throw new Error('Request not found');

    request.status = 'accepted';
    request.driverId = driverId;
    request.timeline.push({
      status: 'accepted',
      timestamp: new Date().toISOString(),
      details: `Accepted by driver ${driverId}`
    });

    return request;
  }

  private declineRequest(requestId: number, driverId: number): RequestOutput {
    const request = RequestLifecycleDomain.requests.get(requestId);
    if (!request) throw new Error('Request not found');

    request.timeline.push({
      status: 'declined',
      timestamp: new Date().toISOString(),
      details: `Declined by driver ${driverId}`
    });

    return request;
  }

  private completeRequest(requestId: number): RequestOutput {
    const request = RequestLifecycleDomain.requests.get(requestId);
    if (!request) throw new Error('Request not found');

    request.status = 'completed';
    request.timeline.push({
      status: 'completed',
      timestamp: new Date().toISOString(),
      details: 'Service completed'
    });

    return request;
  }

  private cancelRequest(requestId: number): RequestOutput {
    const request = RequestLifecycleDomain.requests.get(requestId);
    if (!request) throw new Error('Request not found');

    request.status = 'cancelled';
    request.timeline.push({
      status: 'cancelled',
      timestamp: new Date().toISOString(),
      details: 'Request cancelled'
    });

    return request;
  }
}

// Notifications & Communication Domain
export interface NotificationInput {
  type: 'push' | 'sms' | 'email';
  recipient: number;
  recipientType: 'user' | 'driver';
  message: string;
  data?: any;
}

export interface NotificationOutput {
  notificationId: number;
  status: 'sent' | 'delivered' | 'failed';
  timestamp: string;
}

export class NotificationDomain extends DomainPartition<NotificationInput, NotificationOutput> {
  constructor() {
    super('notifications', '1.0.0', ['auth']);
  }

  async execute(input: NotificationInput): Promise<NotificationOutput> {
    if (!featureFlags.isEnabled('PUSH_NOTIFICATIONS')) {
      throw new Error('Notifications are disabled');
    }

    if (featureFlags.isEnabled('MOCK_NOTIFICATIONS')) {
      return {
        notificationId: Math.floor(Math.random() * 10000),
        status: Math.random() > 0.1 ? 'delivered' : 'failed',
        timestamp: new Date().toISOString()
      };
    }

    // Real notification logic here
    throw new Error('Real notification logic not implemented in test mode');
  }
}

// Admin Controls Domain
export interface AdminInput {
  adminId: number;
  action: 'approveDriver' | 'suspendUser' | 'overrideJob' | 'adjustPayout';
  targetId: number;
  data?: any;
}

export interface AdminOutput {
  actionId: number;
  success: boolean;
  timestamp: string;
  auditLog: string;
}

export class AdminDomain extends DomainPartition<AdminInput, AdminOutput> {
  constructor() {
    super('admin', '1.0.0', ['auth']);
  }

  async execute(input: AdminInput): Promise<AdminOutput> {
    if (!featureFlags.isEnabled('ADMIN_OVERRIDES')) {
      throw new Error('Admin overrides are disabled');
    }

    return {
      actionId: Math.floor(Math.random() * 10000),
      success: true,
      timestamp: new Date().toISOString(),
      auditLog: `Admin ${input.adminId} performed ${input.action} on ${input.targetId}`
    };
  }
}

// Domain Registry
export class DomainRegistry {
  private domains = new Map<string, DomainPartition<any, any>>();

  constructor() {
    this.domains.set('auth', new AuthDomain());
    this.domains.set('driver', new DriverDomain());
    this.domains.set('user', new UserDomain());
    this.domains.set('request_lifecycle', new RequestLifecycleDomain());
    this.domains.set('notifications', new NotificationDomain());
    this.domains.set('admin', new AdminDomain());
  }

  getDomain<TInput, TOutput>(name: string): DomainPartition<TInput, TOutput> {
    const domain = this.domains.get(name);
    if (!domain) {
      throw new Error(`Domain ${name} not found`);
    }
    return domain;
  }

  getEnabledDomains(): string[] {
    return Array.from(this.domains.keys()).filter(name => 
      featureFlags.isDomainEnabled(name)
    );
  }

  getLockedDomains(): string[] {
    return Array.from(this.domains.keys()).filter(name => 
      !featureFlags.isDomainEnabled(name)
    );
  }
}

export const domainRegistry = new DomainRegistry();