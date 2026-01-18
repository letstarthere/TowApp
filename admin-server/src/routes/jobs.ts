import express from 'express';
import { authenticateAdmin, requirePermission, auditLog } from '../middleware/rbac.js';
import { PERMISSIONS } from '../permissions.js';
import { TowRequest, JobTimelineEvent } from '../types.js';

const router = express.Router();

// Get all jobs with filtering and pagination
router.get('/', 
  authenticateAdmin,
  requirePermission(PERMISSIONS.JOBS_VIEW),
  async (req, res) => {
    try {
      const { 
        status, 
        driverId, 
        userId, 
        page = 1, 
        limit = 50,
        startDate,
        endDate,
        isStuck,
        priority
      } = req.query;

      // Mock data - replace with actual database query
      const jobs: TowRequest[] = [
        {
          id: 1,
          userId: 101,
          driverId: 201,
          status: 'in_progress',
          pickupAddress: '123 Main St, Cape Town',
          dropoffAddress: '456 Oak Ave, Cape Town',
          estimatedPrice: 'R350',
          actualPrice: 'R350',
          createdAt: '2024-01-15T10:30:00Z',
          assignedAt: '2024-01-15T10:32:00Z',
          acceptedAt: '2024-01-15T10:35:00Z',
          timeline: [
            { status: 'pending', timestamp: '2024-01-15T10:30:00Z' },
            { status: 'assigned', timestamp: '2024-01-15T10:32:00Z', details: 'Auto-assigned to nearest driver' },
            { status: 'accepted', timestamp: '2024-01-15T10:35:00Z' },
            { status: 'en_route', timestamp: '2024-01-15T10:40:00Z' }
          ],
          user: {
            name: 'John Smith',
            email: 'john@example.com',
            phone: '+27123456789'
          },
          driver: {
            name: 'Mike Johnson',
            email: 'mike@towapp.co.za',
            phone: '+27987654321'
          },
          isStuck: false,
          priority: 'normal'
        }
      ];

      res.json({
        jobs,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: jobs.length,
          pages: Math.ceil(jobs.length / parseInt(limit as string))
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  }
);

// Get live jobs (active/in-progress)
router.get('/live',
  authenticateAdmin,
  requirePermission(PERMISSIONS.JOBS_VIEW_LIVE),
  async (req, res) => {
    try {
      // Mock live jobs data
      const liveJobs = [
        {
          id: 1,
          status: 'in_progress',
          pickupAddress: '123 Main St, Cape Town',
          driver: { name: 'Mike Johnson', location: { lat: -33.9249, lng: 18.4241 } },
          user: { name: 'John Smith', location: { lat: -33.9249, lng: 18.4241 } },
          estimatedCompletion: '2024-01-15T11:30:00Z',
          priority: 'normal'
        }
      ];

      res.json({ liveJobs });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch live jobs' });
    }
  }
);

// Get stuck jobs (timeouts)
router.get('/stuck',
  authenticateAdmin,
  requirePermission(PERMISSIONS.JOBS_VIEW),
  async (req, res) => {
    try {
      // Mock stuck jobs - jobs that haven't progressed in expected timeframe
      const stuckJobs = [
        {
          id: 2,
          status: 'assigned',
          assignedAt: '2024-01-15T09:00:00Z',
          stuckReason: 'Driver not responding for 30+ minutes',
          pickupAddress: '789 Pine St, Cape Town',
          driver: { name: 'Sarah Wilson', phone: '+27555123456' },
          user: { name: 'Alice Brown', phone: '+27555987654' }
        }
      ];

      res.json({ stuckJobs });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stuck jobs' });
    }
  }
);

// Get job details
router.get('/:id',
  authenticateAdmin,
  requirePermission(PERMISSIONS.JOBS_VIEW),
  async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      
      // Mock job details
      const job: TowRequest = {
        id: jobId,
        userId: 101,
        driverId: 201,
        status: 'completed',
        pickupAddress: '123 Main St, Cape Town',
        dropoffAddress: '456 Oak Ave, Cape Town',
        estimatedPrice: 'R350',
        actualPrice: 'R350',
        createdAt: '2024-01-15T10:30:00Z',
        assignedAt: '2024-01-15T10:32:00Z',
        acceptedAt: '2024-01-15T10:35:00Z',
        completedAt: '2024-01-15T11:15:00Z',
        timeline: [
          { status: 'pending', timestamp: '2024-01-15T10:30:00Z' },
          { status: 'assigned', timestamp: '2024-01-15T10:32:00Z', details: 'Auto-assigned to nearest driver' },
          { status: 'accepted', timestamp: '2024-01-15T10:35:00Z' },
          { status: 'en_route', timestamp: '2024-01-15T10:40:00Z' },
          { status: 'in_progress', timestamp: '2024-01-15T10:55:00Z' },
          { status: 'completed', timestamp: '2024-01-15T11:15:00Z' }
        ],
        user: {
          name: 'John Smith',
          email: 'john@example.com',
          phone: '+27123456789'
        },
        driver: {
          name: 'Mike Johnson',
          email: 'mike@towapp.co.za',
          phone: '+27987654321'
        },
        isStuck: false,
        priority: 'normal'
      };

      res.json({ job });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch job details' });
    }
  }
);

// Override job state
router.put('/:id/override',
  authenticateAdmin,
  requirePermission(PERMISSIONS.JOBS_OVERRIDE),
  auditLog('job_override', 'job'),
  async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const { status, reason } = req.body;

      // Validate status
      const validStatuses = ['pending', 'assigned', 'accepted', 'en_route', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      // Mock job state override
      console.log(`Overriding job ${jobId} to status: ${status}, reason: ${reason}`);

      res.json({ 
        success: true, 
        message: `Job ${jobId} status overridden to ${status}`,
        jobId,
        newStatus: status,
        reason
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to override job state' });
    }
  }
);

// Reassign job to different driver
router.put('/:id/reassign',
  authenticateAdmin,
  requirePermission(PERMISSIONS.JOBS_REASSIGN),
  auditLog('job_reassign', 'job'),
  async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const { driverId, reason } = req.body;

      if (!driverId) {
        return res.status(400).json({ error: 'Driver ID is required' });
      }

      // Mock job reassignment
      console.log(`Reassigning job ${jobId} to driver ${driverId}, reason: ${reason}`);

      res.json({ 
        success: true, 
        message: `Job ${jobId} reassigned to driver ${driverId}`,
        jobId,
        newDriverId: driverId,
        reason
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to reassign job' });
    }
  }
);

// Cancel job
router.put('/:id/cancel',
  authenticateAdmin,
  requirePermission(PERMISSIONS.JOBS_CANCEL),
  auditLog('job_cancel', 'job'),
  async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const { reason, refundUser } = req.body;

      if (!reason) {
        return res.status(400).json({ error: 'Cancellation reason is required' });
      }

      // Mock job cancellation
      console.log(`Cancelling job ${jobId}, reason: ${reason}, refund: ${refundUser}`);

      res.json({ 
        success: true, 
        message: `Job ${jobId} cancelled`,
        jobId,
        reason,
        refundIssued: refundUser
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to cancel job' });
    }
  }
);

// Get job statistics
router.get('/stats/summary',
  authenticateAdmin,
  requirePermission(PERMISSIONS.JOBS_VIEW),
  async (req, res) => {
    try {
      const { period = 'today' } = req.query;

      // Mock job statistics
      const stats = {
        total: 156,
        completed: 142,
        cancelled: 8,
        inProgress: 6,
        completionRate: 91.0,
        avgCompletionTime: 45, // minutes
        revenue: 52800, // cents
        period
      };

      res.json({ stats });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch job statistics' });
    }
  }
);

export default router;