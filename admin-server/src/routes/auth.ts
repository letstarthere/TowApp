import express from 'express';
import bcrypt from 'bcrypt';
import { generateAdminToken } from '../middleware/auth.js';

const router = express.Router();

// Mock admin users - in production, store in database
const adminUsers = [
  {
    id: 1,
    email: 'admin@towapp.co.za',
    password: '$2b$12$vu5oDgzpzfMmvk41kVEyMeS3uVCkGw9Qxo8yoGss4EDhLcNxqy/yG', // password: admin123
    role: 'super_admin' as const,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    email: 'support@towapp.co.za',
    password: '$2b$12$vu5oDgzpzfMmvk41kVEyMeS3uVCkGw9Qxo8yoGss4EDhLcNxqy/yG', // password: admin123
    role: 'support_admin' as const,
    createdAt: new Date().toISOString()
  }
];

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const admin = adminUsers.find(u => u.email === email);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const adminData = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt,
      lastLogin: new Date().toISOString()
    };

    const token = generateAdminToken(adminData);

    res.json({
      admin: adminData,
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;