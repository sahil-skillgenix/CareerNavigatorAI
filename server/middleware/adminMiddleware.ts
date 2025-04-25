import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to ensure the user is authenticated and has admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // First check authentication
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }

  // Then check for admin role
  const user = req.user;
  if (user.role !== 'admin' && user.role !== 'superadmin') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You do not have permission to access this resource'
    });
  }

  // User is authenticated and has admin role, proceed
  next();
}

/**
 * Middleware to ensure the user is authenticated and has superadmin role
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  // First check authentication
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'You must be logged in to access this resource'
    });
  }

  // Then check for superadmin role
  const user = req.user;
  if (user.role !== 'superadmin') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You need superadmin privileges to access this resource'
    });
  }

  // User is authenticated and has superadmin role, proceed
  next();
}

/**
 * Middleware to sanitize and validate pagination parameters
 */
export function paginationMiddleware(req: Request, res: Response, next: NextFunction) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  
  // Sanitize page and limit
  req.query.page = Math.max(1, page).toString();
  req.query.limit = Math.min(100, Math.max(1, limit)).toString();
  
  next();
}