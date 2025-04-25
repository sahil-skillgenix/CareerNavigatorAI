import { Request, Response, NextFunction } from 'express';
import { logUserActivityWithParams } from '../services/logging-service';

interface UserWithId {
  id: string;
  [key: string]: any;
}

// Middleware to check if user is admin or superadmin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('[admin-middleware] Checking admin access...');
    console.log('[admin-middleware] isAuthenticated:', req.isAuthenticated());
    console.log('[admin-middleware] User:', req.user);
    
    if (!req.isAuthenticated()) {
      console.log('[admin-middleware] Not authenticated');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = req.user;
    
    if (!user) {
      console.log('[admin-middleware] User not found');
      logUserActivityWithParams({
        userId: req.user?.id || 'unknown',
        category: 'ADMIN',
        action: 'admin_access_denied',
        details: 'Admin access denied - user not found',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
        metadata: { path: req.path }
      });
      return res.status(401).json({ error: 'User not found' });
    }

    // Check user role and print it for debugging
    const userRole = user.role || 'user';
    console.log('[admin-middleware] User role:', userRole);
    
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      console.log('[admin-middleware] Insufficient privileges');
      logUserActivityWithParams({
        userId: user.id || 'unknown',
        action: 'admin_access_denied',
        details: `Admin access denied - insufficient privileges (role: ${userRole})`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
        metadata: { path: req.path }
      });
      return res.status(403).json({ error: 'Insufficient privileges' });
    }

    console.log('[admin-middleware] Admin access granted for:', user.email);
    
    // Add role to response headers for debugging
    res.setHeader('X-User-Role', user.role || 'user');
    
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
      logUserActivityWithParams({
        userId: req.user?.id || 'unknown',
        action: 'superadmin_access_denied',
        details: 'Superadmin access denied - user not found',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
        metadata: { path: req.path }
      });
      return res.status(401).json({ error: 'User not found' });
    }

    const userRole = user.role || 'user';
    if (userRole !== 'superadmin') {
      logUserActivityWithParams({
        userId: user.id || 'unknown',
        action: 'superadmin_access_denied',
        details: `Superadmin access denied - insufficient privileges (role: ${userRole})`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
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