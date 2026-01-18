import express from 'express';
import { authenticateAdmin, requirePermission, requireSensitivePermission, auditLog } from '../middleware/rbac.js';
import { PERMISSIONS } from '../permissions.js';
import { Dispute, DisputeNote, DisputeEvidence } from '../types.js';

const router = express.Router();

// Get all disputes with filtering
router.get('/',
  authenticateAdmin,
  requirePermission(PERMISSIONS.DISPUTES_VIEW),
  async (req, res) => {
    try {
      const { 
        status, 
        type, 
        priority, 
        reportedBy,
        page = 1, 
        limit = 20 
      } = req.query;

      // Mock disputes data
      const disputes: Dispute[] = [
        {
          id: 1,
          jobId: 123,
          reportedBy: 'user',
          type: 'payment',
          description: 'Driver charged more than estimated price without explanation',
          status: 'open',
          priority: 'medium',
          createdAt: '2024-01-15T14:30:00Z',
          evidence: [
            {
              id: 1,
              type: 'image',
              url: '/uploads/receipt_123.jpg',
              uploadedBy: 'user',
              uploadedAt: '2024-01-15T14:32:00Z'
            }
          ],
          notes: [
            {
              id: 1,
              adminId: 1,
              adminName: 'Admin User',
              note: 'Reviewing payment discrepancy. Checking driver GPS logs.',
              timestamp: '2024-01-15T15:00:00Z'
            }
          ]
        },
        {
          id: 2,
          jobId: 124,
          reportedBy: 'driver',
          type: 'behavior',
          description: 'User was aggressive and refused to pay after service completion',
          status: 'investigating',
          priority: 'high',
          createdAt: '2024-01-15T16:45:00Z',
          evidence: [
            {
              id: 2,
              type: 'audio',
              url: '/uploads/recording_124.mp3',
              uploadedBy: 'driver',
              uploadedAt: '2024-01-15T16:47:00Z'
            }
          ],
          notes: []
        }
      ];

      res.json({
        disputes,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: disputes.length,
          pages: Math.ceil(disputes.length / parseInt(limit as string))
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch disputes' });
    }
  }
);

// Get dispute details
router.get('/:id',
  authenticateAdmin,
  requirePermission(PERMISSIONS.DISPUTES_VIEW),
  async (req, res) => {
    try {
      const disputeId = parseInt(req.params.id);

      // Mock dispute details with full job context
      const dispute: Dispute & { job: any } = {
        id: disputeId,
        jobId: 123,
        reportedBy: 'user',
        type: 'payment',
        description: 'Driver charged R450 instead of estimated R350. No explanation provided.',
        status: 'open',
        priority: 'medium',
        createdAt: '2024-01-15T14:30:00Z',
        evidence: [
          {
            id: 1,
            type: 'image',
            url: '/uploads/receipt_123.jpg',
            uploadedBy: 'user',
            uploadedAt: '2024-01-15T14:32:00Z'
          }
        ],
        notes: [
          {
            id: 1,
            adminId: 1,
            adminName: 'Admin User',
            note: 'Reviewing payment discrepancy. Driver claims additional distance due to road closure.',
            timestamp: '2024-01-15T15:00:00Z'
          }
        ],
        job: {
          id: 123,
          pickupAddress: '123 Main St, Cape Town',
          dropoffAddress: '456 Oak Ave, Cape Town',
          estimatedPrice: 'R350',
          actualPrice: 'R450',
          distance: '12.5 km',
          duration: '35 minutes',
          user: { name: 'John Smith', phone: '+27123456789' },
          driver: { name: 'Mike Johnson', phone: '+27987654321' }
        }
      };

      res.json({ dispute });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dispute details' });
    }
  }
);

// Add note to dispute
router.post('/:id/notes',
  authenticateAdmin,
  requirePermission(PERMISSIONS.DISPUTES_ADD_NOTES),
  auditLog('dispute_add_note', 'dispute'),
  async (req, res) => {
    try {
      const disputeId = parseInt(req.params.id);
      const { note } = req.body;
      const admin = (req as any).admin;

      if (!note || note.trim().length === 0) {
        return res.status(400).json({ error: 'Note content is required' });
      }

      // Mock note creation
      const newNote: DisputeNote = {
        id: Date.now(),
        adminId: admin.id,
        adminName: admin.name,
        note: note.trim(),
        timestamp: new Date().toISOString()
      };

      console.log(`Adding note to dispute ${disputeId}:`, newNote);

      res.json({ 
        success: true, 
        note: newNote,
        message: 'Note added successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to add note' });
    }
  }
);

// Upload evidence to dispute
router.post('/:id/evidence',
  authenticateAdmin,
  requirePermission(PERMISSIONS.DISPUTES_ADD_NOTES),
  auditLog('dispute_add_evidence', 'dispute'),
  async (req, res) => {
    try {
      const disputeId = parseInt(req.params.id);
      const { type, url, description } = req.body;

      if (!type || !url) {
        return res.status(400).json({ error: 'Evidence type and URL are required' });
      }

      // Mock evidence upload
      const newEvidence: DisputeEvidence = {
        id: Date.now(),
        type,
        url,
        uploadedBy: 'admin',
        uploadedAt: new Date().toISOString()
      };

      console.log(`Adding evidence to dispute ${disputeId}:`, newEvidence);

      res.json({ 
        success: true, 
        evidence: newEvidence,
        message: 'Evidence uploaded successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to upload evidence' });
    }
  }
);

// Resolve dispute
router.put('/:id/resolve',
  authenticateAdmin,
  requirePermission(PERMISSIONS.DISPUTES_RESOLVE),
  auditLog('dispute_resolve', 'dispute'),
  async (req, res) => {
    try {
      const disputeId = parseInt(req.params.id);
      const { resolution, payoutAdjustment, refundAmount } = req.body;
      const admin = (req as any).admin;

      if (!resolution) {
        return res.status(400).json({ error: 'Resolution details are required' });
      }

      // Mock dispute resolution
      console.log(`Resolving dispute ${disputeId}:`, {
        resolution,
        payoutAdjustment,
        refundAmount,
        resolvedBy: admin.id
      });

      res.json({ 
        success: true, 
        message: 'Dispute resolved successfully',
        disputeId,
        resolution,
        payoutAdjustment,
        refundAmount
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to resolve dispute' });
    }
  }
);

// Adjust payout for dispute
router.put('/:id/adjust-payout',
  ...requireSensitivePermission(PERMISSIONS.DISPUTES_ADJUST_PAYOUT),
  auditLog('dispute_adjust_payout', 'dispute'),
  async (req, res) => {
    try {
      const disputeId = parseInt(req.params.id);
      const { adjustment, reason } = req.body;
      const admin = (req as any).admin;

      if (typeof adjustment !== 'number') {
        return res.status(400).json({ error: 'Adjustment amount must be a number' });
      }

      if (!reason) {
        return res.status(400).json({ error: 'Adjustment reason is required' });
      }

      // Mock payout adjustment
      console.log(`Adjusting payout for dispute ${disputeId}:`, {
        adjustment,
        reason,
        adjustedBy: admin.id
      });

      res.json({ 
        success: true, 
        message: 'Payout adjusted successfully',
        disputeId,
        adjustment,
        reason
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to adjust payout' });
    }
  }
);

// Update dispute priority
router.put('/:id/priority',
  authenticateAdmin,
  requirePermission(PERMISSIONS.DISPUTES_VIEW),
  auditLog('dispute_update_priority', 'dispute'),
  async (req, res) => {
    try {
      const disputeId = parseInt(req.params.id);
      const { priority } = req.body;

      const validPriorities = ['low', 'medium', 'high', 'critical'];
      if (!validPriorities.includes(priority)) {
        return res.status(400).json({ error: 'Invalid priority level' });
      }

      // Mock priority update
      console.log(`Updating dispute ${disputeId} priority to: ${priority}`);

      res.json({ 
        success: true, 
        message: 'Dispute priority updated',
        disputeId,
        newPriority: priority
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update dispute priority' });
    }
  }
);

// Get dispute statistics
router.get('/stats/summary',
  authenticateAdmin,
  requirePermission(PERMISSIONS.DISPUTES_VIEW),
  async (req, res) => {
    try {
      const { period = 'month' } = req.query;

      // Mock dispute statistics
      const stats = {
        total: 45,
        open: 12,
        investigating: 8,
        resolved: 23,
        closed: 2,
        byType: {
          payment: 18,
          service: 12,
          behavior: 10,
          damage: 3,
          other: 2
        },
        avgResolutionTime: 2.5, // days
        payoutAdjustments: 8500, // cents
        refundsIssued: 12400, // cents
        period
      };

      res.json({ stats });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dispute statistics' });
    }
  }
);

export default router;