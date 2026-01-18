import express from 'express';
import { authenticateAdmin, requirePermission, requireSensitivePermission, auditLog } from '../middleware/rbac.js';
import { PERMISSIONS } from '../permissions.js';
import { FinancialSummary, DriverPayout, Refund, PayoutAdjustment } from '../types.js';

const router = express.Router();

// Get financial summary
router.get('/summary',
  authenticateAdmin,
  requirePermission(PERMISSIONS.FINANCE_VIEW),
  async (req, res) => {
    try {
      const { period = 'month' } = req.query;

      // Mock financial summary
      const summary: FinancialSummary = {
        totalRevenue: 2450000, // R24,500 in cents
        driverPayouts: 1960000, // R19,600 in cents (80%)
        platformFee: 490000,   // R4,900 in cents (20%)
        pendingPayouts: 125000, // R1,250 in cents
        refundsIssued: 35000,   // R350 in cents
        period: period as string
      };

      res.json({ summary });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch financial summary' });
    }
  }
);

// Get driver payouts
router.get('/payouts',
  authenticateAdmin,
  requirePermission(PERMISSIONS.FINANCE_PAYOUTS),
  async (req, res) => {
    try {
      const { 
        status, 
        driverId, 
        page = 1, 
        limit = 20,
        startDate,
        endDate 
      } = req.query;

      // Mock payouts data
      const payouts: DriverPayout[] = [
        {
          id: 1,
          driverId: 201,
          amount: 280000, // R2,800 in cents
          status: 'processed',
          jobIds: [123, 124, 125],
          createdAt: '2024-01-15T10:00:00Z',
          processedAt: '2024-01-15T14:30:00Z',
          adjustments: [
            {
              id: 1,
              amount: -5000, // -R50 adjustment
              reason: 'Dispute resolution - partial refund to user',
              adjustedBy: 1,
              timestamp: '2024-01-15T12:00:00Z'
            }
          ]
        },
        {
          id: 2,
          driverId: 202,
          amount: 450000, // R4,500 in cents
          status: 'pending',
          jobIds: [126, 127, 128, 129],
          createdAt: '2024-01-15T16:00:00Z',
          adjustments: []
        }
      ];

      res.json({
        payouts,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: payouts.length,
          pages: Math.ceil(payouts.length / parseInt(limit as string))
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch payouts' });
    }
  }
);

// Process pending payouts
router.post('/payouts/process',
  ...requireSensitivePermission(PERMISSIONS.FINANCE_PAYOUTS),
  auditLog('process_payouts', 'finance'),
  async (req, res) => {
    try {
      const { payoutIds } = req.body;
      const admin = (req as any).admin;

      if (!Array.isArray(payoutIds) || payoutIds.length === 0) {
        return res.status(400).json({ error: 'Payout IDs array is required' });
      }

      // Mock payout processing
      console.log(`Processing payouts: ${payoutIds.join(', ')} by admin ${admin.id}`);

      res.json({ 
        success: true, 
        message: `${payoutIds.length} payouts processed successfully`,
        processedPayouts: payoutIds,
        processedBy: admin.id,
        processedAt: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process payouts' });
    }
  }
);

// Manual payout adjustment
router.post('/payouts/:id/adjust',
  ...requireSensitivePermission(PERMISSIONS.FINANCE_ADJUSTMENTS),
  auditLog('payout_adjustment', 'finance'),
  async (req, res) => {
    try {
      const payoutId = parseInt(req.params.id);
      const { amount, reason } = req.body;
      const admin = (req as any).admin;

      if (typeof amount !== 'number') {
        return res.status(400).json({ error: 'Adjustment amount must be a number' });
      }

      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({ error: 'Adjustment reason is required' });
      }

      // Mock payout adjustment
      const adjustment: PayoutAdjustment = {
        id: Date.now(),
        amount,
        reason: reason.trim(),
        adjustedBy: admin.id,
        timestamp: new Date().toISOString()
      };

      console.log(`Adjusting payout ${payoutId}:`, adjustment);

      res.json({ 
        success: true, 
        message: 'Payout adjusted successfully',
        payoutId,
        adjustment
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to adjust payout' });
    }
  }
);

// Get refunds
router.get('/refunds',
  authenticateAdmin,
  requirePermission(PERMISSIONS.FINANCE_REFUNDS),
  async (req, res) => {
    try {
      const { 
        status, 
        userId, 
        page = 1, 
        limit = 20 
      } = req.query;

      // Mock refunds data
      const refunds: Refund[] = [
        {
          id: 1,
          jobId: 123,
          userId: 101,
          amount: 35000, // R350 in cents
          reason: 'Service not completed - driver vehicle breakdown',
          status: 'processed',
          processedBy: 1,
          createdAt: '2024-01-15T11:00:00Z',
          processedAt: '2024-01-15T11:30:00Z'
        },
        {
          id: 2,
          jobId: 124,
          userId: 102,
          amount: 17500, // R175 in cents (partial refund)
          reason: 'Dispute resolution - overcharge adjustment',
          status: 'pending',
          processedBy: 1,
          createdAt: '2024-01-15T15:00:00Z'
        }
      ];

      res.json({
        refunds,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: refunds.length,
          pages: Math.ceil(refunds.length / parseInt(limit as string))
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch refunds' });
    }
  }
);

// Process refund
router.post('/refunds',
  ...requireSensitivePermission(PERMISSIONS.FINANCE_REFUNDS),
  auditLog('process_refund', 'finance'),
  async (req, res) => {
    try {
      const { jobId, userId, amount, reason } = req.body;
      const admin = (req as any).admin;

      if (!jobId || !userId || !amount || !reason) {
        return res.status(400).json({ 
          error: 'Job ID, User ID, amount, and reason are required' 
        });
      }

      if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Amount must be a positive number' });
      }

      // Mock refund processing
      const refund: Refund = {
        id: Date.now(),
        jobId,
        userId,
        amount,
        reason: reason.trim(),
        status: 'pending',
        processedBy: admin.id,
        createdAt: new Date().toISOString()
      };

      console.log('Processing refund:', refund);

      res.json({ 
        success: true, 
        message: 'Refund initiated successfully',
        refund
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to process refund' });
    }
  }
);

// Get earnings by driver
router.get('/earnings/drivers',
  authenticateAdmin,
  requirePermission(PERMISSIONS.FINANCE_VIEW),
  async (req, res) => {
    try {
      const { period = 'month', page = 1, limit = 20 } = req.query;

      // Mock driver earnings data
      const driverEarnings = [
        {
          driverId: 201,
          driverName: 'Mike Johnson',
          totalEarnings: 1250000, // R12,500 in cents
          totalJobs: 45,
          avgEarningPerJob: 27777, // R277.77 in cents
          completionRate: 95.5,
          period
        },
        {
          driverId: 202,
          driverName: 'Sarah Wilson',
          totalEarnings: 980000, // R9,800 in cents
          totalJobs: 38,
          avgEarningPerJob: 25789, // R257.89 in cents
          completionRate: 92.1,
          period
        }
      ];

      res.json({
        driverEarnings,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: driverEarnings.length,
          pages: Math.ceil(driverEarnings.length / parseInt(limit as string))
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch driver earnings' });
    }
  }
);

// Export financial report
router.get('/reports/export',
  authenticateAdmin,
  requirePermission(PERMISSIONS.FINANCE_REPORTS),
  auditLog('export_financial_report', 'finance'),
  async (req, res) => {
    try {
      const { 
        type = 'summary', 
        format = 'csv', 
        startDate, 
        endDate 
      } = req.query;

      // Mock CSV generation
      const csvData = `Date,Type,Amount,Description
2024-01-15,Revenue,350.00,Job #123 - Completed
2024-01-15,Payout,-280.00,Driver payout - Mike Johnson
2024-01-15,Platform Fee,70.00,20% platform fee
2024-01-15,Refund,-35.00,Refund to user - Job #124`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="financial_report_${type}_${Date.now()}.csv"`);
      res.send(csvData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to export financial report' });
    }
  }
);

// Get financial analytics
router.get('/analytics',
  authenticateAdmin,
  requirePermission(PERMISSIONS.FINANCE_VIEW),
  async (req, res) => {
    try {
      const { period = 'month' } = req.query;

      // Mock financial analytics
      const analytics = {
        revenueGrowth: 12.5, // percentage
        payoutRatio: 80.0, // percentage
        avgJobValue: 32500, // R325 in cents
        refundRate: 1.4, // percentage
        topEarningDrivers: [
          { name: 'Mike Johnson', earnings: 1250000 },
          { name: 'Sarah Wilson', earnings: 980000 },
          { name: 'David Brown', earnings: 875000 }
        ],
        monthlyTrend: [
          { month: 'Nov', revenue: 2100000 },
          { month: 'Dec', revenue: 2300000 },
          { month: 'Jan', revenue: 2450000 }
        ],
        period
      };

      res.json({ analytics });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch financial analytics' });
    }
  }
);

export default router;