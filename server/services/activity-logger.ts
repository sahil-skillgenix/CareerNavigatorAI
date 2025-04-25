import { Request, Response, NextFunction } from 'express';
import { APIRequestLogModel, RequestStatus } from '../models/APIRequestLogModel';
import { logError } from './logging-service';

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