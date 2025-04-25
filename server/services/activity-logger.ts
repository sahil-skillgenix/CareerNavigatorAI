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
      activityType: action, // Map action to activityType for compatibility
      details: typeof details === 'string' ? { message: details } : details || {}, // Convert string to object if needed
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
    // Query using the new activityType field instead of action
    const activities = await UserActivityModel.find({ 
      userId, 
      activityType: { $in: ['login_success', 'register'] } // Include both login and register events
    })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    return activities.map((doc: any) => ({
      id: doc._id.toString(),
      timestamp: doc.timestamp,
      ipAddress: doc.ipAddress || 'unknown',
      userAgent: doc.userAgent || 'unknown',
      action: doc.activityType, // Include the activity type as 'action' for API compatibility
      metadata: doc.metadata || {},
      details: doc.details || {},
      // For enhanced device information
      device: extractDeviceInfo(doc.userAgent || ''),
      location: doc.metadata?.location || 'unknown',
    }));
  } catch (error) {
    console.error('Error getting user login history:', error);
    return [];
  }
}

// Helper function to extract device information from user agent
function extractDeviceInfo(userAgent: string): { type: string; browser: string } {
  try {
    let type = 'Unknown';
    let browser = 'Unknown';
    
    // Simple device type detection
    if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) {
      type = 'Mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      type = 'Tablet';
    } else {
      type = 'Desktop';
    }
    
    // Simple browser detection
    if (/chrome/i.test(userAgent)) {
      browser = 'Chrome';
    } else if (/firefox/i.test(userAgent)) {
      browser = 'Firefox';
    } else if (/safari/i.test(userAgent)) {
      browser = 'Safari';
    } else if (/edge/i.test(userAgent)) {
      browser = 'Edge';
    } else if (/msie|trident/i.test(userAgent)) {
      browser = 'Internet Explorer';
    }
    
    return { type, browser };
  } catch (error) {
    console.error('Error extracting device info:', error);
    return { type: 'Unknown', browser: 'Unknown' };
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
    // Build query with activityType field instead of action
    const query: any = { userId };
    
    if (actionTypes && actionTypes.length > 0) {
      query.activityType = { $in: actionTypes };
    }
    
    const activities = await UserActivityModel.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    return activities.map((doc: any) => ({
      id: doc._id.toString(),
      // Return both fields for maximum compatibility during transition
      action: doc.activityType, // Return activityType as action for backward compatibility
      activityType: doc.activityType, // Also provide the native field
      details: doc.details || {}, // Always return an object
      timestamp: doc.timestamp,
      ipAddress: doc.ipAddress || 'unknown',
      userAgent: doc.userAgent || 'unknown',
      metadata: doc.metadata || {},
      // Enhanced information
      device: extractDeviceInfo(doc.userAgent || ''),
      location: doc.metadata?.location || 'unknown',
      // Format the timestamp for display
      formattedTime: formatTimestamp(doc.timestamp),
    }));
  } catch (error) {
    console.error('Error getting user activity:', error);
    return [];
  }
}

// Helper function to format timestamps in a user-friendly way
function formatTimestamp(timestamp: Date): string {
  try {
    const now = new Date();
    const date = new Date(timestamp);
    
    // Check if invalid date
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    // Format for today's activities
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Format for yesterday's activities
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Format for activities within the past week
    const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `${days[date.getDay()]} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Default format for older activities
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return String(timestamp);
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
    
    // Create a complete log with default values that will be updated
    const apiLog = new APIRequestLogModel({
      method: req.method,
      path: req.originalUrl,
      statusCode: 200, // Default value, will be updated when response is sent
      timestamp: new Date(),
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      query: req.method === 'GET' && Object.keys(req.query).length > 0 ? req.query : undefined,
      body: req.method !== 'GET' ? req.body : undefined
    });
    
    // Function to complete the log with response data
    const finalizeLog = (statusCode: number) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Update with actual values
      apiLog.statusCode = statusCode;
      apiLog.responseTime = responseTime;
      
      // Save asynchronously - don't block response
      apiLog.save().catch(error => {
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