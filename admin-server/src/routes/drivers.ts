import express from 'express';
import { verifyAdminToken, AuthenticatedRequest } from '../middleware/auth.js';
import { DriverApplication, Driver } from '../types.js';

const router = express.Router();

// Get applications from localStorage (shared with mobile app)
const getDriverApplications = (): DriverApplication[] => {
  try {
    const stored = localStorage.getItem('driver_applications');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveDriverApplications = (applications: DriverApplication[]) => {
  localStorage.setItem('driver_applications', JSON.stringify(applications));
};

const drivers: Driver[] = [
  {
    id: 1,
    name: 'Mike Johnson',
    email: 'driver1@towapp.com',
    phone: '+27123456700',
    status: 'active',
    reliabilityScore: 95,
    acceptanceRate: 88,
    totalJobs: 127,
    lastLocation: {
      latitude: -26.1956,
      longitude: 28.0342,
      updatedAt: new Date().toISOString()
    }
  }
];

// Get all driver applications
router.get('/applications', verifyAdminToken, (req: AuthenticatedRequest, res) => {
  const applications = getDriverApplications();
  res.json(applications);
});

// Get specific driver application
router.get('/applications/:id', verifyAdminToken, (req: AuthenticatedRequest, res) => {
  const applications = getDriverApplications();
  const application = applications.find(app => app.id === parseInt(req.params.id));
  if (!application) {
    return res.status(404).json({ error: 'Application not found' });
  }
  res.json(application);
});

// Approve driver application
router.post('/applications/:id/approve', verifyAdminToken, (req: AuthenticatedRequest, res) => {
  const applications = getDriverApplications();
  const application = applications.find(app => app.id === parseInt(req.params.id));
  if (!application) {
    return res.status(404).json({ error: 'Application not found' });
  }

  application.status = 'approved';
  application.reviewedAt = new Date().toISOString();
  application.reviewedBy = req.admin!.id;
  
  saveDriverApplications(applications);
  
  // Update driver verification status in mobile app
  localStorage.setItem('driver_verification_status', 'active');

  // Create active driver record
  const newDriver: Driver = {
    id: drivers.length + 1,
    name: application.fullName,
    email: application.email,
    phone: application.phone,
    status: 'active',
    reliabilityScore: 100,
    acceptanceRate: 0,
    totalJobs: 0
  };
  drivers.push(newDriver);

  res.json({ message: 'Driver approved successfully', driver: newDriver });
});

// Reject driver application
router.post('/applications/:id/reject', verifyAdminToken, (req: AuthenticatedRequest, res) => {
  const { reason } = req.body;
  const applications = getDriverApplications();
  const application = applications.find(app => app.id === parseInt(req.params.id));
  if (!application) {
    return res.status(404).json({ error: 'Application not found' });
  }

  application.status = 'rejected';
  application.reviewedAt = new Date().toISOString();
  application.reviewedBy = req.admin!.id;
  
  saveDriverApplications(applications);
  
  // Update driver verification status in mobile app
  localStorage.setItem('driver_verification_status', 'rejected');

  res.json({ message: 'Driver application rejected', reason });
});

// Get all active drivers
router.get('/', verifyAdminToken, (req: AuthenticatedRequest, res) => {
  res.json(drivers);
});

// Suspend driver
router.post('/:id/suspend', verifyAdminToken, (req: AuthenticatedRequest, res) => {
  const { reason } = req.body;
  const driver = drivers.find(d => d.id === parseInt(req.params.id));
  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  driver.status = 'suspended';
  res.json({ message: 'Driver suspended successfully', reason });
});

// Reactivate driver
router.post('/:id/activate', verifyAdminToken, (req: AuthenticatedRequest, res) => {
  const driver = drivers.find(d => d.id === parseInt(req.params.id));
  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }

  driver.status = 'active';
  res.json({ message: 'Driver reactivated successfully' });
});

export default router;