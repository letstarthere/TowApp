import express from 'express';
import { verifyAdminToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

// Dashboard stats - get real data from localStorage
router.get('/stats', verifyAdminToken, (req: AuthenticatedRequest, res) => {
  // Get real application data
  const applications = JSON.parse(localStorage.getItem('driver_applications') || '[]');
  const pendingApps = applications.filter((app: any) => app.status === 'pending').length;
  const approvedApps = applications.filter((app: any) => app.status === 'approved').length;
  
  // Get user signups
  const userSignups = JSON.parse(localStorage.getItem('user_signups') || '[]');
  const totalUsers = userSignups.length;
  const activeUsers = userSignups.filter((user: any) => user.status === 'active').length;
  
  const stats = {
    activeDrivers: approvedApps,
    pendingApplications: pendingApps,
    totalUsers: totalUsers,
    activeUsers: activeUsers,
    activeTowRequests: 0,
    completedJobsToday: 0,
    failedJobsToday: 0,
    totalRevenue: 0
  };

  res.json(stats);
});

// Get recent activity
router.get('/activity', verifyAdminToken, (req: AuthenticatedRequest, res) => {
  const activities = [
    {
      id: 1,
      type: 'job_completed',
      description: 'Tow job completed by Mike Johnson',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      details: { jobId: 123, driverId: 1, amount: 350 }
    },
    {
      id: 2,
      type: 'driver_application',
      description: 'New driver application from Sarah Wilson',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      details: { applicationId: 4 }
    },
    {
      id: 3,
      type: 'job_cancelled',
      description: 'Tow job cancelled - customer no-show',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      details: { jobId: 122, reason: 'customer_no_show' }
    }
  ];

  res.json(activities);
});

export default router;