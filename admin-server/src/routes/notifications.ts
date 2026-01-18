import express from 'express';
import { authenticateAdmin, requirePermission, auditLog } from '../middleware/rbac.js';
import { PERMISSIONS } from '../permissions.js';
import { NotificationTemplate, NotificationBroadcast } from '../types.js';

const router = express.Router();

// Get notification templates
router.get('/templates',
  authenticateAdmin,
  requirePermission(PERMISSIONS.NOTIFICATIONS_TEMPLATES),
  async (req, res) => {
    try {
      const { type, audience, isActive } = req.query;

      // Mock notification templates
      const templates: NotificationTemplate[] = [
        {
          id: 1,
          name: 'Driver Verification Approved',
          type: 'push',
          audience: 'drivers',
          title: 'Welcome to TowApp!',
          message: 'Your driver application has been approved. You can now start accepting tow requests.',
          isActive: true,
          createdBy: 1,
          createdAt: '2024-01-10T10:00:00Z'
        },
        {
          id: 2,
          name: 'System Maintenance Alert',
          type: 'push',
          audience: 'all',
          title: 'Scheduled Maintenance',
          message: 'TowApp will be undergoing maintenance from 2:00 AM to 4:00 AM. Service may be temporarily unavailable.',
          isActive: true,
          createdBy: 1,
          createdAt: '2024-01-12T15:30:00Z'
        },
        {
          id: 3,
          name: 'Payment Reminder',
          type: 'sms',
          audience: 'users',
          title: '',
          message: 'Hi {name}, your payment for tow service #{jobId} is still pending. Please complete payment to avoid service interruption.',
          isActive: true,
          createdBy: 1,
          createdAt: '2024-01-14T09:00:00Z'
        },
        {
          id: 4,
          name: 'Weekly Driver Report',
          type: 'email',
          audience: 'drivers',
          title: 'Your Weekly Performance Report',
          message: 'Hi {driverName}, here\'s your performance summary for this week: {completedJobs} jobs completed, {earnings} earned, {rating} average rating.',
          isActive: false,
          createdBy: 1,
          createdAt: '2024-01-08T12:00:00Z'
        }
      ];

      res.json({ templates });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notification templates' });
    }
  }
);

// Create notification template
router.post('/templates',
  authenticateAdmin,
  requirePermission(PERMISSIONS.NOTIFICATIONS_TEMPLATES),
  auditLog('create_notification_template', 'notification'),
  async (req, res) => {
    try {
      const { name, type, audience, title, message } = req.body;
      const admin = (req as any).admin;

      // Validation
      if (!name || !type || !audience || !message) {
        return res.status(400).json({ 
          error: 'Name, type, audience, and message are required' 
        });
      }

      const validTypes = ['push', 'sms', 'email'];
      const validAudiences = ['drivers', 'users', 'all'];

      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid notification type' });
      }

      if (!validAudiences.includes(audience)) {
        return res.status(400).json({ error: 'Invalid audience' });
      }

      // Mock template creation
      const newTemplate: NotificationTemplate = {
        id: Date.now(),
        name: name.trim(),
        type,
        audience,
        title: title?.trim() || '',
        message: message.trim(),
        isActive: true,
        createdBy: admin.id,
        createdAt: new Date().toISOString()
      };

      console.log('Creating notification template:', newTemplate);

      res.json({ 
        success: true, 
        template: newTemplate,
        message: 'Notification template created successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create notification template' });
    }
  }
);

// Update notification template
router.put('/templates/:id',
  authenticateAdmin,
  requirePermission(PERMISSIONS.NOTIFICATIONS_TEMPLATES),
  auditLog('update_notification_template', 'notification'),
  async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const updates = req.body;

      // Mock template update
      console.log(`Updating notification template ${templateId}:`, updates);

      res.json({ 
        success: true, 
        message: 'Notification template updated successfully',
        templateId,
        updates
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update notification template' });
    }
  }
);

// Toggle template status
router.put('/templates/:id/toggle',
  authenticateAdmin,
  requirePermission(PERMISSIONS.NOTIFICATIONS_TEMPLATES),
  auditLog('toggle_notification_template', 'notification'),
  async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const { isActive } = req.body;

      // Mock status toggle
      console.log(`Toggling notification template ${templateId} to active: ${isActive}`);

      res.json({ 
        success: true, 
        message: `Template ${isActive ? 'activated' : 'deactivated'} successfully`,
        templateId,
        isActive
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to toggle template status' });
    }
  }
);

// Send targeted notification
router.post('/send',
  authenticateAdmin,
  requirePermission(PERMISSIONS.NOTIFICATIONS_SEND),
  auditLog('send_notification', 'notification'),
  async (req, res) => {
    try {
      const { 
        templateId, 
        audience, 
        targetIds, 
        customMessage, 
        customTitle,
        scheduleFor 
      } = req.body;
      const admin = (req as any).admin;

      if (!templateId && !customMessage) {
        return res.status(400).json({ 
          error: 'Either template ID or custom message is required' 
        });
      }

      if (!audience) {
        return res.status(400).json({ error: 'Audience is required' });
      }

      // Mock notification sending
      const notification = {
        id: Date.now(),
        templateId,
        audience,
        targetIds,
        customMessage,
        customTitle,
        status: scheduleFor ? 'scheduled' : 'sent',
        scheduledFor: scheduleFor,
        sentAt: scheduleFor ? undefined : new Date().toISOString(),
        deliveryStats: {
          sent: targetIds?.length || 0,
          delivered: 0,
          failed: 0
        },
        createdBy: admin.id
      };

      console.log('Sending notification:', notification);

      res.json({ 
        success: true, 
        notification,
        message: scheduleFor ? 'Notification scheduled successfully' : 'Notification sent successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send notification' });
    }
  }
);

// Broadcast notification to all users
router.post('/broadcast',
  authenticateAdmin,
  requirePermission(PERMISSIONS.NOTIFICATIONS_BROADCAST),
  auditLog('broadcast_notification', 'notification'),
  async (req, res) => {
    try {
      const { 
        title, 
        message, 
        audience, 
        type = 'push',
        scheduleFor 
      } = req.body;
      const admin = (req as any).admin;

      if (!title || !message || !audience) {
        return res.status(400).json({ 
          error: 'Title, message, and audience are required' 
        });
      }

      const validAudiences = ['drivers', 'users', 'all'];
      if (!validAudiences.includes(audience)) {
        return res.status(400).json({ error: 'Invalid audience' });
      }

      // Mock broadcast
      const broadcast: NotificationBroadcast = {
        id: Date.now(),
        templateId: 0, // Custom broadcast
        audience,
        status: scheduleFor ? 'scheduled' : 'sent',
        scheduledFor: scheduleFor,
        sentAt: scheduleFor ? undefined : new Date().toISOString(),
        deliveryStats: {
          sent: audience === 'all' ? 1250 : audience === 'drivers' ? 150 : 1100,
          delivered: 0,
          failed: 0
        },
        createdBy: admin.id
      };

      console.log('Broadcasting notification:', { title, message, audience, broadcast });

      res.json({ 
        success: true, 
        broadcast,
        message: scheduleFor ? 'Broadcast scheduled successfully' : 'Broadcast sent successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to broadcast notification' });
    }
  }
);

// Get broadcast history
router.get('/broadcasts',
  authenticateAdmin,
  requirePermission(PERMISSIONS.NOTIFICATIONS_SEND),
  async (req, res) => {
    try {
      const { status, audience, page = 1, limit = 20 } = req.query;

      // Mock broadcast history
      const broadcasts: NotificationBroadcast[] = [
        {
          id: 1,
          templateId: 2,
          audience: 'all',
          status: 'sent',
          sentAt: '2024-01-15T10:00:00Z',
          deliveryStats: {
            sent: 1250,
            delivered: 1198,
            failed: 52
          },
          createdBy: 1
        },
        {
          id: 2,
          templateId: 0, // Custom broadcast
          audience: 'drivers',
          status: 'scheduled',
          scheduledFor: '2024-01-16T08:00:00Z',
          deliveryStats: {
            sent: 0,
            delivered: 0,
            failed: 0
          },
          createdBy: 1
        }
      ];

      res.json({
        broadcasts,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: broadcasts.length,
          pages: Math.ceil(broadcasts.length / parseInt(limit as string))
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch broadcast history' });
    }
  }
);

// Get notification analytics
router.get('/analytics',
  authenticateAdmin,
  requirePermission(PERMISSIONS.NOTIFICATIONS_SEND),
  async (req, res) => {
    try {
      const { period = 'week' } = req.query;

      // Mock notification analytics
      const analytics = {
        totalSent: 5420,
        totalDelivered: 5198,
        totalFailed: 222,
        deliveryRate: 95.9, // percentage
        byType: {
          push: { sent: 4200, delivered: 4050, failed: 150 },
          sms: { sent: 800, delivered: 785, failed: 15 },
          email: { sent: 420, delivered: 363, failed: 57 }
        },
        byAudience: {
          drivers: { sent: 1200, delivered: 1156, failed: 44 },
          users: { sent: 3800, delivered: 3654, failed: 146 },
          all: { sent: 420, delivered: 388, failed: 32 }
        },
        topTemplates: [
          { name: 'Driver Verification Approved', sent: 45, deliveryRate: 97.8 },
          { name: 'Job Assignment', sent: 1250, deliveryRate: 96.2 },
          { name: 'Payment Reminder', sent: 320, deliveryRate: 94.1 }
        ],
        period
      };

      res.json({ analytics });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notification analytics' });
    }
  }
);

// Cancel scheduled notification
router.delete('/broadcasts/:id',
  authenticateAdmin,
  requirePermission(PERMISSIONS.NOTIFICATIONS_SEND),
  auditLog('cancel_scheduled_notification', 'notification'),
  async (req, res) => {
    try {
      const broadcastId = parseInt(req.params.id);

      // Mock cancellation
      console.log(`Cancelling scheduled broadcast ${broadcastId}`);

      res.json({ 
        success: true, 
        message: 'Scheduled notification cancelled successfully',
        broadcastId
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to cancel scheduled notification' });
    }
  }
);

// Test notification delivery
router.post('/test',
  authenticateAdmin,
  requirePermission(PERMISSIONS.NOTIFICATIONS_SEND),
  async (req, res) => {
    try {
      const { type, message, testTarget } = req.body;
      const admin = (req as any).admin;

      if (!type || !message || !testTarget) {
        return res.status(400).json({ 
          error: 'Type, message, and test target are required' 
        });
      }

      // Mock test notification
      console.log(`Sending test ${type} notification to ${testTarget}:`, message);

      res.json({ 
        success: true, 
        message: 'Test notification sent successfully',
        testTarget,
        deliveredAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send test notification' });
    }
  }
);

export default router;