import { Request, Response, NextFunction } from 'express';
import { logError } from '../services/logging-service';

/**
 * Middleware to check if the user is authenticated and has admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // First check if the user is authenticated
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Then check if the user has admin or superadmin role
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
    // Log unauthorized access attempt
    logError({
      message: 'Unauthorized admin access attempt',
      severity: 'medium',
      category: 'security',
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      metadata: { path: req.path }
    }).catch(err => console.error('Error logging unauthorized access:', err));
    
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  
  // User is authenticated and has admin role
  next();
}

/**
 * Middleware to check if the user is authenticated and has superadmin role
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  // First check if the user is authenticated
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Then check if the user has superadmin role
  if (!req.user || req.user.role !== 'superadmin') {
    // Log unauthorized access attempt
    logError({
      message: 'Unauthorized superadmin access attempt',
      severity: 'high',
      category: 'security',
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      metadata: { path: req.path }
    }).catch(err => console.error('Error logging unauthorized access:', err));
    
    return res.status(403).json({ error: 'Access denied. Super admin privileges required.' });
  }
  
  // User is authenticated and has superadmin role
  next();
}

/**
 * Middleware to extract and normalize pagination parameters
 */
export function paginationMiddleware(req: Request, res: Response, next: NextFunction) {
  const page = parseInt(req.query.page as string || '1', 10);
  const limit = parseInt(req.query.limit as string || '20', 10);
  
  // Validate and set reasonable defaults/limits
  req.query.page = Math.max(1, page).toString();
  req.query.limit = Math.min(Math.max(1, limit), 100).toString();
  
  next();
}

/**
 * Custom error handler for admin routes
 */
export function adminErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  // Log the error
  logError({
    message: `Admin API error: ${err.message}`,
    severity: 'high',
    category: 'api',
    userId: req.user?.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] as string,
    endpoint: req.path,
    method: req.method,
    stack: err.stack,
    metadata: { error: err }
  }).catch(logErr => console.error('Error logging admin API error:', logErr));
  
  // Send appropriate error response
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message
  });
}

/**
 * Query parameter validation middleware
 */
export function validateQueryParams(
  allowedParams: string[]
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const queryParams = Object.keys(req.query);
    
    // Check if any query parameters are not in the allowed list
    const invalidParams = queryParams.filter(param => !allowedParams.includes(param));
    
    if (invalidParams.length > 0) {
      return res.status(400).json({
        error: 'Invalid query parameters',
        invalidParams
      });
    }
    
    next();
  };
}

/**
 * IP allowlist middleware
 */
export function ipAllowlist(allowedIPs: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    // Skip IP check in development environment
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    
    if (!clientIP || !allowedIPs.includes(clientIP)) {
      logError({
        message: 'Access attempt from unauthorized IP',
        severity: 'medium',
        category: 'security',
        userId: req.user?.id,
        ipAddress: clientIP,
        userAgent: req.headers['user-agent'] as string,
        endpoint: req.path,
        method: req.method,
        metadata: { allowedIPs }
      }).catch(err => console.error('Error logging IP access attempt:', err));
      
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address is not authorized to access this resource'
      });
    }
    
    next();
  };
}

/**
 * Rate limiting middleware for admin actions
 */
const adminActionRateLimit = new Map<string, { count: number, resetTime: number }>();

export function adminActionRateLimiter(
  maxActions: number = 100,
  windowMs: number = 60 * 60 * 1000 // 1 hour
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userId = req.user.id;
    const now = Date.now();
    
    // Initialize or get the user's rate limit data
    let userData = adminActionRateLimit.get(userId);
    
    if (!userData || userData.resetTime < now) {
      // Reset the counter if the time window has passed
      userData = { count: 0, resetTime: now + windowMs };
      adminActionRateLimit.set(userId, userData);
    }
    
    // Increment the counter
    userData.count += 1;
    
    // Check if the user has exceeded the rate limit
    if (userData.count > maxActions) {
      logError({
        message: 'Admin rate limit exceeded',
        severity: 'medium',
        category: 'security',
        userId: userId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
        endpoint: req.path,
        method: req.method,
        metadata: { maxActions, count: userData.count, windowMs }
      }).catch(err => console.error('Error logging rate limit:', err));
      
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'You have performed too many admin actions. Please try again later.',
        resetIn: Math.ceil((userData.resetTime - now) / 1000 / 60) + ' minutes'
      });
    }
    
    next();
  };
}