import { Request, Response } from 'express';
import { ErrorLogModel, UserActivityModel, APIRequestLogModel } from '../db/models';
import { log } from '../vite';

/**
 * Logs error information to both console and database
 */
export async function logError(options: {
  level: "error" | "warn" | "info" | "debug";
  message: string;
  stack?: string;
  context?: Record<string, any>;
  req?: Request;
}) {
  const { level, message, stack, context, req } = options;
  
  try {
    // Log to console first
    log(`${level.toUpperCase()}: ${message}${stack ? '\n' + stack : ''}`, "error");
    
    // Create structured log object
    const errorLog = {
      level,
      message,
      stack,
      context,
      timestamp: new Date()
    };
    
    // Add request information if available
    if (req) {
      Object.assign(errorLog, {
        userId: req.user?.id,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        endpoint: req.originalUrl,
        requestMethod: req.method,
        requestBody: req.body,
      });
    }
    
    // Save to database asynchronously
    await ErrorLogModel.create(errorLog);
  } catch (error) {
    // Fallback to console-only logging if database insertion fails
    log(`Failed to save error log to database: ${error}`, "error");
    log(`Original error: ${message}${stack ? '\n' + stack : ''}`, "error");
  }
}

/**
 * Logs user activity to database
 */
export async function logUserActivity(options: {
  userId: string;
  activityType: string;
  details?: Record<string, any>;
  req?: Request;
}) {
  const { userId, activityType, details, req } = options;
  
  try {
    // Create structured log object
    const activityLog = {
      userId,
      activityType,
      details,
      timestamp: new Date()
    };
    
    // Add request information if available
    if (req) {
      Object.assign(activityLog, {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      });
    }
    
    // Save to database asynchronously
    await UserActivityModel.create(activityLog);
  } catch (error) {
    // Log error but don't disrupt the user's flow
    log(`Failed to log user activity: ${error}`, "error");
  }
}

/**
 * Logs API request details to database
 */
export async function logAPIRequest(options: {
  req: Request;
  res: Response;
  responseTimeMs: number;
}) {
  const { req, res, responseTimeMs } = options;
  
  try {
    // Create structured log object
    const apiLog = {
      endpoint: req.originalUrl,
      method: req.method,
      userId: req.user?.id,
      statusCode: res.statusCode,
      responseTimeMs,
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      queryParams: req.query,
      requestBody: req.method !== 'GET' ? req.body : undefined,
      timestamp: new Date()
    };
    
    // Save to database asynchronously - don't await to avoid impacting response time
    APIRequestLogModel.create(apiLog).catch(error => {
      log(`Failed to log API request: ${error}`, "error");
    });
  } catch (error) {
    // Log error but don't disrupt the response
    log(`Failed to log API request: ${error}`, "error");
  }
}

/**
 * Express middleware to log API requests
 */
export function apiRequestLogger() {
  return (req: Request, res: Response, next: Function) => {
    // Record request start time
    const startTime = Date.now();
    
    // Once the response is finished, log the API request
    res.on('finish', () => {
      const responseTimeMs = Date.now() - startTime;
      logAPIRequest({ req, res, responseTimeMs });
    });
    
    next();
  };
}

/**
 * Express error handling middleware that logs errors
 */
export function errorLogger() {
  return (err: any, req: Request, res: Response, next: Function) => {
    // Log the error
    logError({
      level: 'error',
      message: err.message || 'Unknown error occurred',
      stack: err.stack,
      context: { originalUrl: req.originalUrl },
      req
    });
    
    // Continue to the next error handler
    next(err);
  };
}

/**
 * Express middleware that logs user authentication events
 */
export function authEventLogger() {
  return (req: Request, res: Response, next: Function) => {
    // Store original methods
    const originalLogin = req.login;
    const originalLogout = req.logout;
    
    // Override login method to log successful logins
    // Handle all the function overloads
    req.login = function(user: any, optionsOrDone?: any, done?: any) {
      let options: any;
      let callback: (err: any) => void;
      
      // Handle different call signatures
      if (typeof optionsOrDone === 'function') {
        options = {};
        callback = optionsOrDone;
      } else {
        options = optionsOrDone || {};
        callback = done;
      }
      
      // Call original login method
      return originalLogin.call(this, user, options, (err: any) => {
        if (!err && user) {
          // Log successful login
          const userId = user.id?.toString() || '';
          if (userId) {
            logUserActivity({
              userId,
              activityType: 'login',
              req
            });
          }
        }
        
        // Continue with original callback
        if (callback) return callback(err);
      });
    };
    
    // Override logout method to log logouts
    req.logout = function(done?: any) {
      // Get user ID before logout
      const userId = req.user?.id?.toString() || '';
      
      // Passport.js expects a callback function
      if (typeof done !== 'function') {
        done = (err: any) => {
          if (err) console.error("Error during logout:", err);
        };
      }
      
      // Call original logout method with appropriate argument
      return originalLogout.call(this, (err: any) => {
        if (!err && userId) {
          // Log successful logout
          logUserActivity({
            userId,
            activityType: 'logout',
            req
          }).catch(e => console.error("Error logging logout:", e));
        }
        
        // Continue with original callback
        return done(err);
      });
    };
    
    next();
  };
}

/**
 * Gets the most recent user activities for a specific user
 */
export async function getUserActivityHistory(userId: string, limit: number = 50) {
  try {
    return await UserActivityModel.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit);
  } catch (error) {
    log(`Failed to fetch user activity history: ${error}`, "error");
    return [];
  }
}

/**
 * Gets error logs filtered by various criteria
 */
export async function getErrorLogs(options: {
  level?: string;
  userId?: string;
  endpoint?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const { level, userId, endpoint, startDate, endDate, limit = 100 } = options;
  
  // Build query filter
  const filter: any = {};
  if (level) filter.level = level;
  if (userId) filter.userId = userId;
  if (endpoint) filter.endpoint = { $regex: endpoint, $options: 'i' };
  
  // Add date range if provided
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) filter.timestamp.$gte = startDate;
    if (endDate) filter.timestamp.$lte = endDate;
  }
  
  try {
    return await ErrorLogModel.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit);
  } catch (error) {
    log(`Failed to fetch error logs: ${error}`, "error");
    return [];
  }
}

/**
 * Gets API request logs filtered by various criteria
 */
export async function getAPIRequestLogs(options: {
  endpoint?: string;
  method?: string;
  userId?: string;
  statusCode?: number;
  minResponseTime?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const { 
    endpoint, method, userId, statusCode, 
    minResponseTime, startDate, endDate, limit = 100 
  } = options;
  
  // Build query filter
  const filter: any = {};
  if (endpoint) filter.endpoint = { $regex: endpoint, $options: 'i' };
  if (method) filter.method = method;
  if (userId) filter.userId = userId;
  if (statusCode) filter.statusCode = statusCode;
  if (minResponseTime) filter.responseTimeMs = { $gte: minResponseTime };
  
  // Add date range if provided
  if (startDate || endDate) {
    filter.timestamp = {};
    if (startDate) filter.timestamp.$gte = startDate;
    if (endDate) filter.timestamp.$lte = endDate;
  }
  
  try {
    return await APIRequestLogModel.find(filter)
      .sort({ timestamp: -1 })
      .limit(limit);
  } catch (error) {
    log(`Failed to fetch API request logs: ${error}`, "error");
    return [];
  }
}