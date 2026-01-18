import express from 'express';
import { authenticateAdmin, requirePermission, auditLog } from '../middleware/rbac.js';
import { PERMISSIONS } from '../permissions.js';
import { Campaign, PricingRule, CampaignRule } from '../types.js';

const router = express.Router();

// Get all campaigns
router.get('/',
  authenticateAdmin,
  requirePermission(PERMISSIONS.CAMPAIGNS_VIEW),
  async (req, res) => {
    try {
      const { status, type, page = 1, limit = 20 } = req.query;

      // Mock campaigns data
      const campaigns: Campaign[] = [
        {
          id: 1,
          name: 'New Driver Bonus',
          type: 'driver_incentive',
          status: 'active',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-03-31T23:59:59Z',
          rules: [
            {
              condition: 'first_10_jobs',
              value: 10,
              reward: 5000, // R50 bonus per job
              rewardType: 'fixed'
            }
          ],
          targetAudience: 'new_drivers',
          budget: 500000, // R5,000 budget
          spent: 125000,  // R1,250 spent
          createdBy: 1
        },
        {
          id: 2,
          name: 'Weekend Surge',
          type: 'surge_pricing',
          status: 'active',
          startDate: '2024-01-01T00:00:00Z',
          endDate: '2024-12-31T23:59:59Z',
          rules: [
            {
              condition: 'weekend_hours',
              value: { days: ['saturday', 'sunday'], hours: ['18:00', '02:00'] },
              reward: 150, // 1.5x multiplier
              rewardType: 'percentage'
            }
          ],
          targetAudience: 'all',
          spent: 0,
          createdBy: 1
        },
        {
          id: 3,
          name: 'First Ride Discount',
          type: 'user_discount',
          status: 'paused',
          startDate: '2024-01-15T00:00:00Z',
          endDate: '2024-02-15T23:59:59Z',
          rules: [
            {
              condition: 'first_ride',
              value: 1,
              reward: 5000, // R50 discount
              rewardType: 'fixed'
            }
          ],
          targetAudience: 'users',
          budget: 100000, // R1,000 budget
          spent: 35000,   // R350 spent
          createdBy: 1
        }
      ];

      res.json({
        campaigns,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: campaigns.length,
          pages: Math.ceil(campaigns.length / parseInt(limit as string))
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch campaigns' });
    }
  }
);

// Get campaign details
router.get('/:id',
  authenticateAdmin,
  requirePermission(PERMISSIONS.CAMPAIGNS_VIEW),
  async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);

      // Mock campaign details with performance metrics
      const campaign = {
        id: campaignId,
        name: 'New Driver Bonus',
        type: 'driver_incentive',
        status: 'active',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-03-31T23:59:59Z',
        rules: [
          {
            condition: 'first_10_jobs',
            value: 10,
            reward: 5000,
            rewardType: 'fixed'
          }
        ],
        targetAudience: 'new_drivers',
        budget: 500000,
        spent: 125000,
        createdBy: 1,
        performance: {
          participatingDrivers: 25,
          totalRewards: 125000,
          avgRewardPerDriver: 5000,
          completionRate: 68.0,
          roi: 2.4
        }
      };

      res.json({ campaign });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch campaign details' });
    }
  }
);

// Create new campaign
router.post('/',
  authenticateAdmin,
  requirePermission(PERMISSIONS.CAMPAIGNS_CREATE),
  auditLog('create_campaign', 'campaign'),
  async (req, res) => {
    try {
      const { 
        name, 
        type, 
        startDate, 
        endDate, 
        rules, 
        targetAudience, 
        budget 
      } = req.body;
      const admin = (req as any).admin;

      // Validation
      if (!name || !type || !startDate || !endDate || !rules || !targetAudience) {
        return res.status(400).json({ 
          error: 'Name, type, dates, rules, and target audience are required' 
        });
      }

      const validTypes = ['driver_incentive', 'user_discount', 'surge_pricing'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid campaign type' });
      }

      // Mock campaign creation
      const newCampaign: Campaign = {
        id: Date.now(),
        name: name.trim(),
        type,
        status: 'active',
        startDate,
        endDate,
        rules,
        targetAudience,
        budget: budget || 0,
        spent: 0,
        createdBy: admin.id
      };

      console.log('Creating campaign:', newCampaign);

      res.json({ 
        success: true, 
        campaign: newCampaign,
        message: 'Campaign created successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create campaign' });
    }
  }
);

// Update campaign
router.put('/:id',
  authenticateAdmin,
  requirePermission(PERMISSIONS.CAMPAIGNS_EDIT),
  auditLog('update_campaign', 'campaign'),
  async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const updates = req.body;

      // Mock campaign update
      console.log(`Updating campaign ${campaignId}:`, updates);

      res.json({ 
        success: true, 
        message: 'Campaign updated successfully',
        campaignId,
        updates
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update campaign' });
    }
  }
);

// Toggle campaign status
router.put('/:id/toggle',
  authenticateAdmin,
  requirePermission(PERMISSIONS.CAMPAIGNS_EDIT),
  auditLog('toggle_campaign', 'campaign'),
  async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      const { status } = req.body;

      const validStatuses = ['active', 'paused', 'ended'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      // Mock status toggle
      console.log(`Toggling campaign ${campaignId} to status: ${status}`);

      res.json({ 
        success: true, 
        message: `Campaign ${status} successfully`,
        campaignId,
        newStatus: status
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to toggle campaign status' });
    }
  }
);

// Delete campaign
router.delete('/:id',
  authenticateAdmin,
  requirePermission(PERMISSIONS.CAMPAIGNS_DELETE),
  auditLog('delete_campaign', 'campaign'),
  async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);

      // Mock campaign deletion
      console.log(`Deleting campaign ${campaignId}`);

      res.json({ 
        success: true, 
        message: 'Campaign deleted successfully',
        campaignId
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete campaign' });
    }
  }
);

// Get pricing rules
router.get('/pricing/rules',
  authenticateAdmin,
  requirePermission(PERMISSIONS.PRICING_VIEW),
  async (req, res) => {
    try {
      const { region, isActive } = req.query;

      // Mock pricing rules
      const pricingRules: PricingRule[] = [
        {
          id: 1,
          region: 'Cape Town CBD',
          basePrice: 5000,     // R50 base price
          perKmRate: 1500,     // R15 per km
          surgeMultiplier: 1.0,
          minimumFare: 8000,   // R80 minimum
          isActive: true,
          validFrom: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          region: 'Cape Town Suburbs',
          basePrice: 4000,     // R40 base price
          perKmRate: 1200,     // R12 per km
          surgeMultiplier: 1.0,
          minimumFare: 6000,   // R60 minimum
          isActive: true,
          validFrom: '2024-01-01T00:00:00Z'
        },
        {
          id: 3,
          region: 'Weekend Surge - All Areas',
          basePrice: 5000,
          perKmRate: 1500,
          surgeMultiplier: 1.5, // 50% surge
          minimumFare: 8000,
          isActive: true,
          validFrom: '2024-01-01T00:00:00Z',
          validTo: '2024-12-31T23:59:59Z'
        }
      ];

      res.json({ pricingRules });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch pricing rules' });
    }
  }
);

// Create pricing rule
router.post('/pricing/rules',
  authenticateAdmin,
  requirePermission(PERMISSIONS.PRICING_EDIT),
  auditLog('create_pricing_rule', 'pricing'),
  async (req, res) => {
    try {
      const { 
        region, 
        basePrice, 
        perKmRate, 
        surgeMultiplier, 
        minimumFare,
        validFrom,
        validTo
      } = req.body;

      // Validation
      if (!region || !basePrice || !perKmRate || !minimumFare) {
        return res.status(400).json({ 
          error: 'Region, base price, per km rate, and minimum fare are required' 
        });
      }

      // Mock pricing rule creation
      const newRule: PricingRule = {
        id: Date.now(),
        region: region.trim(),
        basePrice,
        perKmRate,
        surgeMultiplier: surgeMultiplier || 1.0,
        minimumFare,
        isActive: true,
        validFrom: validFrom || new Date().toISOString(),
        validTo
      };

      console.log('Creating pricing rule:', newRule);

      res.json({ 
        success: true, 
        pricingRule: newRule,
        message: 'Pricing rule created successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create pricing rule' });
    }
  }
);

// Update pricing rule
router.put('/pricing/rules/:id',
  authenticateAdmin,
  requirePermission(PERMISSIONS.PRICING_EDIT),
  auditLog('update_pricing_rule', 'pricing'),
  async (req, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      const updates = req.body;

      // Mock pricing rule update
      console.log(`Updating pricing rule ${ruleId}:`, updates);

      res.json({ 
        success: true, 
        message: 'Pricing rule updated successfully',
        ruleId,
        updates
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update pricing rule' });
    }
  }
);

// Toggle pricing rule status
router.put('/pricing/rules/:id/toggle',
  authenticateAdmin,
  requirePermission(PERMISSIONS.PRICING_EDIT),
  auditLog('toggle_pricing_rule', 'pricing'),
  async (req, res) => {
    try {
      const ruleId = parseInt(req.params.id);
      const { isActive } = req.body;

      // Mock status toggle
      console.log(`Toggling pricing rule ${ruleId} to active: ${isActive}`);

      res.json({ 
        success: true, 
        message: `Pricing rule ${isActive ? 'activated' : 'deactivated'} successfully`,
        ruleId,
        isActive
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to toggle pricing rule status' });
    }
  }
);

// Get campaign analytics
router.get('/analytics',
  authenticateAdmin,
  requirePermission(PERMISSIONS.CAMPAIGNS_VIEW),
  async (req, res) => {
    try {
      const { period = 'month' } = req.query;

      // Mock campaign analytics
      const analytics = {
        totalCampaigns: 5,
        activeCampaigns: 3,
        totalSpent: 285000, // R2,850
        totalBudget: 800000, // R8,000
        budgetUtilization: 35.6, // percentage
        topPerformingCampaigns: [
          { name: 'New Driver Bonus', roi: 2.4, spent: 125000 },
          { name: 'Weekend Surge', roi: 1.8, spent: 0 },
          { name: 'First Ride Discount', roi: 1.2, spent: 35000 }
        ],
        period
      };

      res.json({ analytics });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch campaign analytics' });
    }
  }
);

export default router;