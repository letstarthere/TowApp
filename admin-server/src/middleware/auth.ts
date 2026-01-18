import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { AdminUser } from '../types.js';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'admin-secret';

export interface AuthenticatedRequest extends Request {
  admin?: AdminUser;
}

export const verifyAdminToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AdminUser;
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid admin token' });
  }
};

export const requireRole = (role: 'super_admin' | 'support_admin') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }
    
    if (role === 'super_admin' && req.admin.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' });
    }
    
    next();
  };
};

export const generateAdminToken = (admin: AdminUser): string => {
  return jwt.sign(admin, JWT_SECRET, { expiresIn: '8h' });
};