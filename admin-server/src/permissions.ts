import { AdminRole, AdminPermission } from './types.js';

// Permission definitions
export const PERMISSIONS = {
  // Dashboard & Analytics
  DASHBOARD_VIEW: 'dashboard:view',
  ANALYTICS_VIEW: 'analytics:view',
  SYSTEM_HEALTH_VIEW: 'system:health:view',
  
  // Driver Management
  DRIVERS_VIEW: 'drivers:view',
  DRIVERS_APPROVE: 'drivers:approve',
  DRIVERS_REJECT: 'drivers:reject',
  DRIVERS_SUSPEND: 'drivers:suspend',
  DRIVERS_FORCE_OFFLINE: 'drivers:force_offline',
  DRIVERS_VIEW_LOCATION: 'drivers:view_location',
  
  // User Management
  USERS_VIEW: 'users:view',
  USERS_SUSPEND: 'users:suspend',
  USERS_BAN: 'users:ban',
  USERS_FLAG: 'users:flag',
  
  // Job Management
  JOBS_VIEW: 'jobs:view',
  JOBS_OVERRIDE: 'jobs:override',
  JOBS_REASSIGN: 'jobs:reassign',
  JOBS_CANCEL: 'jobs:cancel',
  JOBS_VIEW_LIVE: 'jobs:view_live',
  
  // Disputes & Incidents
  DISPUTES_VIEW: 'disputes:view',
  DISPUTES_RESOLVE: 'disputes:resolve',
  DISPUTES_ADJUST_PAYOUT: 'disputes:adjust_payout',
  DISPUTES_ADD_NOTES: 'disputes:add_notes',
  
  // Financial Management
  FINANCE_VIEW: 'finance:view',
  FINANCE_PAYOUTS: 'finance:payouts',
  FINANCE_REFUNDS: 'finance:refunds',
  FINANCE_ADJUSTMENTS: 'finance:adjustments',
  FINANCE_REPORTS: 'finance:reports',
  
  // Campaigns & Pricing
  CAMPAIGNS_VIEW: 'campaigns:view',
  CAMPAIGNS_CREATE: 'campaigns:create',
  CAMPAIGNS_EDIT: 'campaigns:edit',
  CAMPAIGNS_DELETE: 'campaigns:delete',
  PRICING_VIEW: 'pricing:view',
  PRICING_EDIT: 'pricing:edit',
  
  // Notifications
  NOTIFICATIONS_SEND: 'notifications:send',
  NOTIFICATIONS_BROADCAST: 'notifications:broadcast',
  NOTIFICATIONS_TEMPLATES: 'notifications:templates',
  
  // System Configuration
  SYSTEM_CONFIG_VIEW: 'system:config:view',
  SYSTEM_CONFIG_EDIT: 'system:config:edit',
  SYSTEM_EMERGENCY: 'system:emergency',
  
  // Audit & Compliance
  AUDIT_VIEW: 'audit:view',
  AUDIT_EXPORT: 'audit:export',
  
  // Admin Management
  ADMIN_MANAGE: 'admin:manage',
} as const;

// Role-based permission matrix
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  super_admin: [
    // Full access to everything
    ...Object.values(PERMISSIONS)
  ],
  
  operations_admin: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.SYSTEM_HEALTH_VIEW,
    PERMISSIONS.DRIVERS_VIEW,
    PERMISSIONS.DRIVERS_APPROVE,
    PERMISSIONS.DRIVERS_REJECT,
    PERMISSIONS.DRIVERS_SUSPEND,
    PERMISSIONS.DRIVERS_FORCE_OFFLINE,
    PERMISSIONS.DRIVERS_VIEW_LOCATION,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_SUSPEND,
    PERMISSIONS.USERS_FLAG,
    PERMISSIONS.JOBS_VIEW,
    PERMISSIONS.JOBS_OVERRIDE,
    PERMISSIONS.JOBS_REASSIGN,
    PERMISSIONS.JOBS_CANCEL,
    PERMISSIONS.JOBS_VIEW_LIVE,
    PERMISSIONS.DISPUTES_VIEW,
    PERMISSIONS.DISPUTES_RESOLVE,
    PERMISSIONS.DISPUTES_ADD_NOTES,
    PERMISSIONS.NOTIFICATIONS_SEND,
    PERMISSIONS.NOTIFICATIONS_BROADCAST,
    PERMISSIONS.AUDIT_VIEW,
  ],
  
  support_admin: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.DRIVERS_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_FLAG,
    PERMISSIONS.JOBS_VIEW,
    PERMISSIONS.DISPUTES_VIEW,
    PERMISSIONS.DISPUTES_ADD_NOTES,
    PERMISSIONS.NOTIFICATIONS_SEND,
    PERMISSIONS.AUDIT_VIEW,
  ],
  
  finance_admin: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.DRIVERS_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.JOBS_VIEW,
    PERMISSIONS.DISPUTES_VIEW,
    PERMISSIONS.DISPUTES_RESOLVE,
    PERMISSIONS.DISPUTES_ADJUST_PAYOUT,
    PERMISSIONS.FINANCE_VIEW,
    PERMISSIONS.FINANCE_PAYOUTS,
    PERMISSIONS.FINANCE_REFUNDS,
    PERMISSIONS.FINANCE_ADJUSTMENTS,
    PERMISSIONS.FINANCE_REPORTS,
    PERMISSIONS.AUDIT_VIEW,
    PERMISSIONS.AUDIT_EXPORT,
  ],
};

// Sensitive actions requiring re-authentication
export const SENSITIVE_ACTIONS = [
  PERMISSIONS.DRIVERS_SUSPEND,
  PERMISSIONS.USERS_BAN,
  PERMISSIONS.FINANCE_ADJUSTMENTS,
  PERMISSIONS.FINANCE_REFUNDS,
  PERMISSIONS.SYSTEM_CONFIG_EDIT,
  PERMISSIONS.SYSTEM_EMERGENCY,
  PERMISSIONS.ADMIN_MANAGE,
];

// Helper functions
export function hasPermission(userRole: AdminRole, permission: string): boolean {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
}

export function requiresReauth(permission: string): boolean {
  return SENSITIVE_ACTIONS.includes(permission);
}

export function getUserPermissions(role: AdminRole): AdminPermission[] {
  const permissions = ROLE_PERMISSIONS[role] || [];
  const grouped: Record<string, string[]> = {};
  
  permissions.forEach(permission => {
    const [resource, ...actions] = permission.split(':');
    if (!grouped[resource]) {
      grouped[resource] = [];
    }
    grouped[resource].push(actions.join(':'));
  });
  
  return Object.entries(grouped).map(([resource, actions]) => ({
    resource,
    actions
  }));
}