// Admin Roles & Permissions
export type AdminRole = 'super_admin' | 'operations_admin' | 'support_admin' | 'finance_admin';

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: AdminRole;
  permissions: AdminPermission[];
  createdAt: string;
  lastLogin?: string;
  sessionTimeout: number;
  requiresReauth: boolean;
}

export interface AdminPermission {
  resource: string;
  actions: string[];
}

// Driver Management
export interface DriverApplication {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  towTruckType: string;
  vehicleRegistration: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
  rejectionReason?: string;
  documents: {
    driverLicenseFront?: string;
    driverLicenseBack?: string;
    vehicleRegistrationDoc?: string;
    profilePhoto?: string;
  };
}

export interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended' | 'pending_verification' | 'offline';
  reliabilityScore: number;
  acceptanceRate: number;
  cancellationRate: number;
  totalJobs: number;
  completedJobs: number;
  earnings: number;
  lastLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: string;
  };
  verificationDate?: string;
  suspensionReason?: string;
  performanceMetrics: {
    avgResponseTime: number;
    customerRating: number;
    onTimeRate: number;
  };
}

// User Management
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended' | 'banned';
  totalJobs: number;
  cancellationRate: number;
  flagged: boolean;
  flagReason?: string;
  createdAt: string;
  lastActivity: string;
}

// Job Management
export interface TowRequest {
  id: number;
  userId: number;
  driverId?: number;
  status: 'pending' | 'assigned' | 'accepted' | 'en_route' | 'in_progress' | 'completed' | 'cancelled';
  pickupAddress: string;
  dropoffAddress: string;
  estimatedPrice: string;
  actualPrice?: string;
  createdAt: string;
  assignedAt?: string;
  acceptedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  timeline: JobTimelineEvent[];
  user: {
    name: string;
    email: string;
    phone: string;
  };
  driver?: {
    name: string;
    email: string;
    phone: string;
  };
  isStuck: boolean;
  priority: 'normal' | 'high' | 'urgent';
}

export interface JobTimelineEvent {
  status: string;
  timestamp: string;
  details?: string;
}

// Disputes & Incidents
export interface Dispute {
  id: number;
  jobId: number;
  reportedBy: 'user' | 'driver';
  type: 'payment' | 'service' | 'behavior' | 'damage' | 'other';
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: number;
  resolution?: string;
  evidence: DisputeEvidence[];
  notes: DisputeNote[];
  payoutAdjustment?: number;
}

export interface DisputeEvidence {
  id: number;
  type: 'image' | 'document' | 'audio' | 'video';
  url: string;
  uploadedBy: 'user' | 'driver' | 'admin';
  uploadedAt: string;
}

export interface DisputeNote {
  id: number;
  adminId: number;
  note: string;
  timestamp: string;
  adminName: string;
}

// Financial Management
export interface FinancialSummary {
  totalRevenue: number;
  driverPayouts: number;
  platformFee: number;
  pendingPayouts: number;
  refundsIssued: number;
  period: string;
}

export interface DriverPayout {
  id: number;
  driverId: number;
  amount: number;
  status: 'pending' | 'processed' | 'failed';
  jobIds: number[];
  createdAt: string;
  processedAt?: string;
  adjustments: PayoutAdjustment[];
}

export interface PayoutAdjustment {
  id: number;
  amount: number;
  reason: string;
  adjustedBy: number;
  timestamp: string;
}

export interface Refund {
  id: number;
  jobId: number;
  userId: number;
  amount: number;
  reason: string;
  status: 'pending' | 'processed' | 'failed';
  processedBy: number;
  createdAt: string;
  processedAt?: string;
}

// Campaigns & Pricing
export interface Campaign {
  id: number;
  name: string;
  type: 'driver_incentive' | 'user_discount' | 'surge_pricing';
  status: 'active' | 'paused' | 'ended';
  startDate: string;
  endDate: string;
  rules: CampaignRule[];
  targetAudience: 'all' | 'new_drivers' | 'active_drivers' | 'users';
  budget?: number;
  spent: number;
  createdBy: number;
}

export interface CampaignRule {
  condition: string;
  value: any;
  reward: number;
  rewardType: 'fixed' | 'percentage';
}

export interface PricingRule {
  id: number;
  region: string;
  basePrice: number;
  perKmRate: number;
  surgeMultiplier: number;
  minimumFare: number;
  isActive: boolean;
  validFrom: string;
  validTo?: string;
}

// System Management
export interface SystemHealth {
  apiUptime: number;
  websocketStatus: 'connected' | 'disconnected' | 'degraded';
  notificationDelivery: number;
  activeConnections: number;
  errorRate: number;
  responseTime: number;
  lastUpdated: string;
}

export interface SystemConfig {
  id: string;
  value: any;
  description: string;
  category: 'features' | 'timeouts' | 'limits' | 'emergency';
  updatedBy: number;
  updatedAt: string;
}

// Notifications
export interface NotificationTemplate {
  id: number;
  name: string;
  type: 'push' | 'sms' | 'email';
  audience: 'drivers' | 'users' | 'all';
  title: string;
  message: string;
  isActive: boolean;
  createdBy: number;
  createdAt: string;
}

export interface NotificationBroadcast {
  id: number;
  templateId: number;
  audience: 'drivers' | 'users' | 'all';
  targetIds?: number[];
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledFor?: string;
  sentAt?: string;
  deliveryStats: {
    sent: number;
    delivered: number;
    failed: number;
  };
  createdBy: number;
}

// Audit & Compliance
export interface AdminAction {
  id: number;
  adminId: number;
  adminName: string;
  action: string;
  targetType: 'driver' | 'user' | 'job' | 'dispute' | 'campaign' | 'system';
  targetId: number;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  sensitive: boolean;
}

// Dashboard Stats
export interface DashboardStats {
  liveStats: {
    activeJobs: number;
    unassignedJobs: number;
    stuckJobs: number;
    activeDrivers: number;
    onlineUsers: number;
  };
  todayStats: {
    completedJobs: number;
    revenue: number;
    newDrivers: number;
    newUsers: number;
  };
  systemHealth: SystemHealth;
  recentActivity: AdminAction[];
}