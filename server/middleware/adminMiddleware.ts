import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to require admin role for protected admin routes
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // First check if user is authenticated
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      error: 'Authentication required', 
      redirectTo: '/auth'
    });
  }
  
  // Then check if user has admin or superadmin role
  if (
    req.user?.role !== 'admin' && 
    req.user?.role !== 'superadmin' && 
    // Handle legacy admin access (in case role field not set yet)
    req.user?.email !== 'admin@skillgenix.com'
  ) {
    return res.status(403).json({ 
      error: 'Admin access required',
      message: 'You do not have permission to access this resource'
    });
  }
  
  // User is authenticated and has admin role
  next();
}

/**
 * Middleware to require superadmin role for highly protected admin routes
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  // First check if user is authenticated
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      error: 'Authentication required', 
      redirectTo: '/auth'
    });
  }
  
  // Then check if user has superadmin role
  if (
    req.user?.role !== 'superadmin' && 
    // Handle legacy admin access (in case role field not set yet)
    req.user?.email !== 'admin@skillgenix.com'
  ) {
    return res.status(403).json({ 
      error: 'Super admin access required',
      message: 'You do not have permission to access this resource'
    });
  }
  
  // User is authenticated and has superadmin role
  next();
}

/**
 * Middleware to handle pagination parameters
 */
export function paginationMiddleware(req: Request, res: Response, next: NextFunction) {
  // Set default values for pagination parameters
  req.query.page = req.query.page || '1';
  req.query.limit = req.query.limit || '20';
  
  // Validate pagination parameters
  const page = parseInt(req.query.page as string, 10);
  const limit = parseInt(req.query.limit as string, 10);
  
  if (isNaN(page) || page < 1) {
    req.query.page = '1';
  }
  
  if (isNaN(limit) || limit < 1 || limit > 100) {
    req.query.limit = '20';
  }
  
  next();
}

/**
 * Middleware to track API requests for monitoring
 */
export function requestTrackingMiddleware(req: Request, res: Response, next: NextFunction) {
  // Skip tracking for static assets
  if (req.path.startsWith('/static/') || req.path.startsWith('/assets/')) {
    return next();
  }
  
  // Set start time
  const startTime = Date.now();
  
  // Once response is finished, record the request
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const userId = req.user?.id || 'anonymous';
    
    // Log API request to database (implement using your SystemUsageStats or APIRequestLog model)
    // This is just a placeholder - implement according to your needs
    try {
      // Example call pattern - adapt to your actual implementation
      // recordApiRequest({
      //   endpoint: req.path,
      //   method: req.method,
      //   statusCode: res.statusCode,
      //   responseTime: duration,
      //   userId,
      //   userIP: req.ip,
      //   success: res.statusCode < 400
      // });
      
      // Log detailed request info for errors
      if (res.statusCode >= 400) {
        console.log(`API Request Error: ${req.method} ${req.path} - Status: ${res.statusCode} - User: ${userId} - Duration: ${duration}ms`);
      }
    } catch (err) {
      console.error('Error recording API request:', err);
    }
  });
  
  next();
}

/**
 * Middleware to rate limit API requests
 */
export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  // Implement rate limiting based on user ID or IP address
  // This is just a placeholder - implement according to your needs
  // You can use the FeatureLimits functionality for more complex limiting
  
  next();
}