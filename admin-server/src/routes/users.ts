import express from 'express';
import { verifyAdminToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = express.Router();

interface UserSignup {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  userType: 'user';
  signupDate: string;
  status: 'active' | 'suspended';
}

// Get user signups from localStorage
const getUserSignups = (): UserSignup[] => {
  try {
    const stored = localStorage.getItem('user_signups');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveUserSignups = (users: UserSignup[]) => {
  localStorage.setItem('user_signups', JSON.stringify(users));
};

// Get all user signups
router.get('/signups', verifyAdminToken, (req: AuthenticatedRequest, res) => {
  const users = getUserSignups();
  res.json(users);
});

// Get specific user
router.get('/:id', verifyAdminToken, (req: AuthenticatedRequest, res) => {
  const users = getUserSignups();
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// Suspend user
router.post('/:id/suspend', verifyAdminToken, (req: AuthenticatedRequest, res) => {
  const { reason } = req.body;
  const users = getUserSignups();
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.status = 'suspended';
  saveUserSignups(users);
  
  res.json({ message: 'User suspended successfully', reason });
});

// Reactivate user
router.post('/:id/activate', verifyAdminToken, (req: AuthenticatedRequest, res) => {
  const users = getUserSignups();
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.status = 'active';
  saveUserSignups(users);
  
  res.json({ message: 'User reactivated successfully' });
});

export default router;