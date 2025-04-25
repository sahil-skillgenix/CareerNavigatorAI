import { Request, Response, NextFunction } from 'express';
import APIRequestLogModel, { APIRequestLog } from '../models/APIRequestLogModel';
import { UserActivityModel } from '../db/models';
import { logError, type UserActivityType, type RequestStatus } from './logging-service';

/**
 * Log a user activity 
 * @param activity User activity to log
 */
export async function logUserActivity({
  userId,
  action,
  details,
  targetUserId,
  metadata = {},
  ipAddress,
  userAgent
}: {
  userId: string;
  action: UserActivityType;
  details?: string;
  targetUserId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    const activity = new UserActivityModel({
      userId,
      action,
      details,
      targetUserId,
      metadata,
      ipAddress,
      userAgent,
      timestamp: new Date()
    });
    
    await activity.save();
  } catch (error) {
    console.error(`Error logging user activity (${action}):`, error);
    
    // Don't rethrow - logging should never break application flow
  }
}

/**
 * Function to get user login history
 * @param userId User ID to get login history for
 * @param limit Maximum number of records to return
 */
export async function getUserLoginHistory(userId: string, limit: number = 10): Promise<any[]> {
  try {
    const activities = await UserActivityModel.find({ 
      userId, 
      action: 'login_success' 
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    return activities.map((doc: any) => ({
      id: doc._id.toString(),
      timestamp: doc.timestamp,
      ipAddress: doc.ipAddress,
      userAgent: doc.userAgent,
      metadata: doc.metadata || {}
    }));
  } catch (error) {
    console.error('Error getting user login history:', error);
    return [];
  }
}

/**
 * Function to get all user activity
 * @param userId User ID to get activity for
 * @param limit Maximum number of records to return
 * @param actionTypes Filter by specific action types
 */
export async function getUserActivity(
  userId: string, 
  limit: number = 20,
  actionTypes?: UserActivityType[]
): Promise<any[]> {
  try {
    const query: any = { userId };
    
    if (actionTypes && actionTypes.length > 0) {
      query.action = { $in: actionTypes };
    }
    
    const activities = await UserActivityModel.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    return activities.map((doc: any) => ({
      id: doc._id.toString(),
      action: doc.action,
      details: doc.details,
      timestamp: doc.timestamp,
      targetUserId: doc.targetUserId,
      ipAddress: doc.ipAddress,
      userAgent: doc.userAgent,
      metadata: doc.metadata || {}
    }));
  } catch (error) {
    console.error('Error getting user activity:', error);
    return [];
  }
}

/**
 * Middleware to log API requests
 * 
 * @returns Express middleware function
 */
export function apiRequestLogger() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Record request details
    const requestData = {
      method: req.method,
      endpoint: req.originalUrl,
      ip: req.ip,
      userId: req.user?.id,
      userAgent: req.get('User-Agent'),
      requestBody: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
      queryParams: Object.keys(req.query).length > 0 ? JSON.stringify(req.query) : undefined,
      timestamp: new Date(),
      requestStatus: 'pending' as RequestStatus
    };
    
    // Create log document without response data yet
    const requestLog = new APIRequestLogModel(requestData);
    
    // Function to complete the log with response data
    const finalizeLog = (statusCode: number) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      requestLog.duration = duration;
      requestLog.status = statusCode;
      // Map HTTP status to our RequestStatus enum
      requestLog.requestStatus = statusCode < 400 ? 'success' : 'error';
      
      // Save asynchronously - don't block response
      requestLog.save().catch(error => {
        console.error('Error saving API request log:', error);
      });
    };
    
    // Intercept response to add status code
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any, callback?: any) {
      finalizeLog(res.statusCode);
      return originalEnd.call(this, chunk, encoding, callback);
    };
    
    // Continue with request
    next();
  };
}

/**
 * Middleware to log auth events
 * 
 * @returns Express middleware function
 */
export function authEventLogger() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only apply to auth routes
    if (!req.path.startsWith('/api/auth') && 
        !req.path.startsWith('/api/login') && 
        !req.path.startsWith('/api/logout') && 
        !req.path.startsWith('/api/register')) {
      return next();
    }

    // Store original status for response interception
    const originalSend = res.send;
    
    // Handle login attempts
    if (req.path.startsWith('/api/login')) {
      res.send = function(body) {
        // Check status code to determine if login was successful
        const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
        
        // Log the auth event
        const userId = isSuccess && req.user ? req.user.id : undefined;
        const action = isSuccess ? 'login_success' : 'login_failure';
        const details = isSuccess ? `User logged in successfully` : `Failed login attempt for ${req.body?.email || 'unknown email'}`;
        
        if (userId || action === 'login_failure') {
          logUserActivity({
            userId: userId || 'anonymous',
            action: action as UserActivityType,
            details,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string,
            metadata: {
              method: 'password', // standard password login
              email: req.body?.email,
              statusCode: res.statusCode
            }
          }).catch(error => {
            console.error('Error logging auth event:', error);
          });
        }
        
        // Continue with the original response
        return originalSend.apply(res, [body]);
      };
    }
    
    // Handle logout
    else if (req.path.startsWith('/api/logout')) {
      res.send = function(body) {
        // Log successful logout
        if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
          logUserActivity({
            userId: req.user?.id || 'anonymous',
            action: 'logout',
            details: 'User logged out',
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string
          }).catch(error => {
            console.error('Error logging logout event:', error);
          });
        }
        
        // Continue with the original response
        return originalSend.apply(res, [body]);
      };
    }
    
    // Handle registration
    else if (req.path.startsWith('/api/register')) {
      res.send = function(body) {
        // Check if registration was successful
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // For successful registration, the user should be available in req.user due to automatic login
          const userId = req.user?.id;
          
          if (userId) {
            logUserActivity({
              userId,
              action: 'login_success',
              details: 'New user registered and logged in',
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'] as string,
              metadata: {
                email: req.body?.email,
                method: 'registration'
              }
            }).catch(error => {
              console.error('Error logging registration event:', error);
            });
          }
        }
        
        // Continue with the original response
        return originalSend.apply(res, [body]);
      };
    }

    // Continue processing
    next();
  };
}

/**
 * Middleware to log and handle errors
 * 
 * @returns Express middleware function
 */
export function errorLogger() {
  return (err: any, req: Request, res: Response, next: NextFunction) => {
    // Skip if headers already sent
    if (res.headersSent) {
      return next(err);
    }
    
    // Determine error severity based on status code
    const status = err.status || err.statusCode || 500;
    const severity = status >= 500 ? 'high' : status >= 400 ? 'medium' : 'low';
    
    // Log the error
    logError({
      message: err.message || 'Internal server error',
      stack: err.stack,
      code: err.code || String(status),
      severity: severity as any,
      category: 'api',
      endpoint: req.originalUrl,
      method: req.method,
      userId: req.user?.id,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      metadata: {
        query: req.query,
        params: req.params,
        body: req.method !== 'GET' ? req.body : undefined
      }
    }).catch(logError => {
      console.error('Error logging error:', logError);
    });
    
    // Continue to error handler
    next(err);
  };
}