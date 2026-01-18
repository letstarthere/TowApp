import express from 'express';
import { authenticateAdmin, requirePermission, requireSensitivePermission, auditLog } from '../middleware/rbac.js';
import { PERMISSIONS } from '../permissions.js';
import { SystemHealth, SystemConfig, AdminAction } from '../types.js';

const router = express.Router();

// Get system health status
router.get('/health',
  authenticateAdmin,
  requirePermission(PERMISSIONS.SYSTEM_HEALTH_VIEW),
  async (req, res) => {
    try {
      // Mock system health data
      const health: SystemHealth = {
        apiUptime: 99.8,
        websocketStatus: 'connected',
        notificationDelivery: 95.9,
        activeConnections: 1247,
        errorRate: 0.2,
        responseTime: 145, // milliseconds
        lastUpdated: new Date().toISOString()
      };

      // Additional system metrics
      const metrics = {
        database: {
          status: 'healthy',
          connections: 45,
          queryTime: 12, // ms
          diskUsage: 68.5 // percentage
        },
        services: {
          mobileApi: { status: 'healthy', responseTime: 120 },
          adminApi: { status: 'healthy', responseTime: 95 },
          notifications: { status: 'healthy', queueSize: 23 },
          payments: { status: 'healthy', responseTime: 340 }
        },
        infrastructure: {
          cpuUsage: 45.2,
          memoryUsage: 62.8,
          diskUsage: 34.1,
          networkLatency: 8 // ms
        }
      };

      res.json({ health, metrics });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch system health' });
    }
  }
);

// Get system configuration
router.get('/config',
  authenticateAdmin,
  requirePermission(PERMISSIONS.SYSTEM_CONFIG_VIEW),
  async (req, res) => {
    try {
      const { category } = req.query;

      // Mock system configuration
      const configs: SystemConfig[] = [
        {
          id: 'job_timeout_pending',
          value: 300, // 5 minutes
          description: 'Time in seconds before a pending job is marked as stuck',
          category: 'timeouts',
          updatedBy: 1,
          updatedAt: '2024-01-10T10:00:00Z'
        },
        {
          id: 'job_timeout_assigned',
          value: 1800, // 30 minutes
          description: 'Time in seconds before an assigned job is marked as stuck',
          category: 'timeouts',
          updatedBy: 1,
          updatedAt: '2024-01-10T10:00:00Z'
        },
        {
          id: 'max_driver_distance',
          value: 25, // 25 km
          description: 'Maximum distance in km to search for available drivers',
          category: 'limits',
          updatedBy: 1,
          updatedAt: '2024-01-12T14:30:00Z'
        },
        {
          id: 'surge_pricing_enabled',
          value: true,
          description: 'Enable dynamic surge pricing during high demand',
          category: 'features',
          updatedBy: 1,
          updatedAt: '2024-01-15T09:00:00Z'
        },
        {
          id: 'emergency_shutdown',
          value: false,
          description: 'Emergency system shutdown - disables all new job requests',
          category: 'emergency',
          updatedBy: 1,
          updatedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'maintenance_mode',
          value: false,
          description: 'Maintenance mode - shows maintenance message to users',
          category: 'emergency',
          updatedBy: 1,
          updatedAt: '2024-01-01T00:00:00Z'
        }
      ];

      const filteredConfigs = category 
        ? configs.filter(config => config.category === category)
        : configs;

      res.json({ configs: filteredConfigs });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch system configuration' });
    }
  }
);

// Update system configuration
router.put('/config/:id',
  ...requireSensitivePermission(PERMISSIONS.SYSTEM_CONFIG_EDIT),
  auditLog('update_system_config', 'system'),
  async (req, res) => {
    try {
      const configId = req.params.id;
      const { value } = req.body;
      const admin = (req as any).admin;

      if (value === undefined) {
        return res.status(400).json({ error: 'Configuration value is required' });
      }

      // Validate critical configurations
      const criticalConfigs = ['emergency_shutdown', 'maintenance_mode'];
      if (criticalConfigs.includes(configId) && typeof value !== 'boolean') {
        return res.status(400).json({ error: 'Emergency configurations must be boolean values' });
      }

      // Mock configuration update
      console.log(`Updating system config ${configId} to:`, value, `by admin ${admin.id}`);

      res.json({ 
        success: true, 
        message: 'System configuration updated successfully',
        configId,
        newValue: value,
        updatedBy: admin.id,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update system configuration' });
    }
  }
);

// Emergency shutdown
router.post('/emergency/shutdown',
  ...requireSensitivePermission(PERMISSIONS.SYSTEM_EMERGENCY),
  auditLog('emergency_shutdown', 'system'),
  async (req, res) => {
    try {
      const { reason } = req.body;
      const admin = (req as any).admin;

      if (!reason) {
        return res.status(400).json({ error: 'Shutdown reason is required' });
      }

      // Mock emergency shutdown
      console.log(`EMERGENCY SHUTDOWN initiated by ${admin.name} (${admin.id}). Reason: ${reason}`);

      res.json({ 
        success: true, 
        message: 'Emergency shutdown activated',
        reason,
        activatedBy: admin.id,
        activatedAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to activate emergency shutdown' });
    }
  }
);

// Restore from emergency shutdown
router.post('/emergency/restore',
  ...requireSensitivePermission(PERMISSIONS.SYSTEM_EMERGENCY),
  auditLog('emergency_restore', 'system'),
  async (req, res) => {
    try {
      const admin = (req as any).admin;

      // Mock emergency restore
      console.log(`EMERGENCY RESTORE initiated by ${admin.name} (${admin.id})`);

      res.json({ 
        success: true, 
        message: 'System restored from emergency shutdown',
        restoredBy: admin.id,
        restoredAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to restore from emergency shutdown' });
    }
  }
);

// Enable maintenance mode
router.post('/maintenance/enable',
  ...requireSensitivePermission(PERMISSIONS.SYSTEM_CONFIG_EDIT),
  auditLog('enable_maintenance_mode', 'system'),
  async (req, res) => {
    try {
      const { message, estimatedDuration } = req.body;
      const admin = (req as any).admin;

      // Mock maintenance mode activation
      console.log(`Maintenance mode enabled by ${admin.name}. Message: ${message}, Duration: ${estimatedDuration}`);

      res.json({ 
        success: true, 
        message: 'Maintenance mode enabled',
        maintenanceMessage: message,
        estimatedDuration,
        enabledBy: admin.id,
        enabledAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to enable maintenance mode' });
    }
  }
);

// Disable maintenance mode
router.post('/maintenance/disable',
  ...requireSensitivePermission(PERMISSIONS.SYSTEM_CONFIG_EDIT),
  auditLog('disable_maintenance_mode', 'system'),
  async (req, res) => {
    try {
      const admin = (req as any).admin;

      // Mock maintenance mode deactivation
      console.log(`Maintenance mode disabled by ${admin.name}`);

      res.json({ 
        success: true, 
        message: 'Maintenance mode disabled',
        disabledBy: admin.id,
        disabledAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to disable maintenance mode' });
    }
  }
);

// Get audit logs
router.get('/audit',
  authenticateAdmin,
  requirePermission(PERMISSIONS.AUDIT_VIEW),
  async (req, res) => {
    try {
      const { 
        adminId, 
        action, 
        targetType, 
        sensitive,
        startDate,
        endDate,
        page = 1, 
        limit = 50 
      } = req.query;

      // Mock audit logs
      const auditLogs: AdminAction[] = [
        {
          id: 1,
          adminId: 1,
          adminName: 'Super Admin',
          action: 'driver_approve',
          targetType: 'driver',
          targetId: 201,
          details: JSON.stringify({ driverId: 201, reason: 'All documents verified' }),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: '2024-01-15T10:30:00Z',
          sensitive: false
        },
        {
          id: 2,
          adminId: 1,
          adminName: 'Super Admin',
          action: 'payout_adjustment',
          targetType: 'driver',
          targetId: 202,
          details: JSON.stringify({ payoutId: 123, adjustment: -5000, reason: 'Dispute resolution' }),
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: '2024-01-15T14:45:00Z',
          sensitive: true
        },
        {
          id: 3,
          adminId: 2,
          adminName: 'Operations Admin',
          action: 'job_reassign',
          targetType: 'job',
          targetId: 456,
          details: JSON.stringify({ jobId: 456, fromDriver: 201, toDriver: 203, reason: 'Driver unavailable' }),
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: '2024-01-15T16:20:00Z',
          sensitive: false
        }
      ];

      res.json({
        auditLogs,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: auditLogs.length,
          pages: Math.ceil(auditLogs.length / parseInt(limit as string))
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  }
);

// Export audit logs
router.get('/audit/export',
  authenticateAdmin,
  requirePermission(PERMISSIONS.AUDIT_EXPORT),
  auditLog('export_audit_logs', 'system'),
  async (req, res) => {
    try {
      const { format = 'csv', startDate, endDate } = req.query;

      // Mock CSV export
      const csvData = `Timestamp,Admin,Action,Target Type,Target ID,Details,IP Address,Sensitive
2024-01-15T10:30:00Z,Super Admin,driver_approve,driver,201,"All documents verified",192.168.1.100,false
2024-01-15T14:45:00Z,Super Admin,payout_adjustment,driver,202,"Dispute resolution - R50 deduction",192.168.1.100,true
2024-01-15T16:20:00Z,Operations Admin,job_reassign,job,456,"Driver unavailable - reassigned",192.168.1.101,false`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit_logs_${Date.now()}.csv"`);
      res.send(csvData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to export audit logs' });
    }
  }
);

// Get system statistics
router.get('/stats',
  authenticateAdmin,
  requirePermission(PERMISSIONS.SYSTEM_HEALTH_VIEW),
  async (req, res) => {
    try {
      const { period = 'day' } = req.query;

      // Mock system statistics
      const stats = {
        requests: {
          total: 15420,
          successful: 14876,
          failed: 544,
          successRate: 96.5
        },
        performance: {
          avgResponseTime: 145,
          p95ResponseTime: 320,
          p99ResponseTime: 850
        },
        errors: {
          total: 544,
          byType: {
            '4xx': 312,
            '5xx': 232
          },
          topErrors: [
            { error: 'Driver not found', count: 89 },
            { error: 'Invalid coordinates', count: 67 },
            { error: 'Payment processing failed', count: 45 }
          ]
        },
        usage: {
          peakHour: '18:00',
          peakRequests: 1247,
          avgConcurrentUsers: 342
        },
        period
      };

      res.json({ stats });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch system statistics' });
    }
  }
);

export default router;