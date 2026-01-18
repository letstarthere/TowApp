import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AdminUser } from '../types.js';
import { hasPermission, requiresReauth } from '../permissions.js';

interface AuthenticatedRequest extends Request {
  admin?: AdminUser;
}

// JWT verification middleware
export function authenticateAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET!) as any;
    req.admin = decoded.admin;
    
    // Check session timeout
    const now = Date.now();
    const tokenAge = now - decoded.iat * 1000;
    const maxAge = req.admin.sessionTimeout || 8 * 60 * 60 * 1000; // 8 hours default
    
    if (tokenAge > maxAge) {
      return res.status(401).json({ error: 'Session expired' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Permission check middleware
export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    if (!hasPermission(req.admin.role, permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission,
        role: req.admin.role
      });
    }
    
    next();
  };
}

// Re-authentication check for sensitive actions
export function requireReauth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.admin) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const reauthToken = req.headers['x-reauth-token'];
  if (!reauthToken) {
    return res.status(403).json({ 
      error: 'Re-authentication required',
      requiresReauth: true
    });
  }
  
  try {
    const decoded = jwt.verify(reauthToken as string, process.env.ADMIN_JWT_SECRET!) as any;
    const tokenAge = Date.now() - decoded.iat * 1000;
    
    // Re-auth token valid for 5 minutes
    if (tokenAge > 5 * 60 * 1000) {
      return res.status(403).json({ 
        error: 'Re-authentication expired',
        requiresReauth: true
      });
    }
    
    if (decoded.adminId !== req.admin.id) {
      return res.status(403).json({ error: 'Invalid re-authentication' });
    }
    
    next();
  } catch (error) {
    return res.status(403).json({ 
      error: 'Invalid re-authentication token',
      requiresReauth: true
    });
  }
}

// Combined middleware for sensitive operations
export function requireSensitivePermission(permission: string) {
  return [
    authenticateAdmin,
    requirePermission(permission),
    (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (requiresReauth(permission)) {
        return requireReauth(req, res, next);
      }
      next();
    }
  ];
}

// Audit logging middleware
export function auditLog(action: string, targetType: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log successful actions (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        logAdminAction({
          adminId: req.admin!.id,
          adminName: req.admin!.name,
          action,
          targetType,
          targetId: req.params.id ? parseInt(req.params.id) : 0,
          details: JSON.stringify({
            method: req.method,
            path: req.path,
            body: req.body,
            query: req.query
          }),
          ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
          timestamp: new Date().toISOString(),
          sensitive: requiresReauth(action)
        });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
}

// Mock audit logging function (replace with actual database implementation)
function logAdminAction(action: any) {
  console.log('AUDIT LOG:', action);
  // TODO: Save to database
}