import { Request, Response, NextFunction } from 'express';
import { logUserActivity } from '../services/logging-service';

// Middleware to check if user is admin or superadmin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = req.user;
    
    if (!user) {
      logUserActivity({
        userId: req.user?.id || 'unknown',
        action: 'admin_access_denied',
        category: 'security',
        description: 'Admin access denied - user not found',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: { path: req.path }
      });
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      logUserActivity({
        userId: user.id,
        action: 'admin_access_denied',
        category: 'security',
        description: `Admin access denied - insufficient privileges (role: ${user.role})`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: { path: req.path }
      });
      return res.status(403).json({ error: 'Insufficient privileges' });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Middleware to check if user is superadmin
export const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = req.user;
    
    if (!user) {
      logUserActivity({
        userId: req.user?.id || 'unknown',
        action: 'superadmin_access_denied',
        category: 'security',
        description: 'Superadmin access denied - user not found',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: { path: req.path }
      });
      return res.status(401).json({ error: 'User not found' });
    }

    if (user.role !== 'superadmin') {
      logUserActivity({
        userId: user.id,
        action: 'superadmin_access_denied',
        category: 'security',
        description: `Superadmin access denied - insufficient privileges (role: ${user.role})`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: { path: req.path }
      });
      return res.status(403).json({ error: 'Insufficient privileges' });
    }

    next();
  } catch (error) {
    console.error('Superadmin middleware error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};