/**
 * Error logging service for centralized error tracking
 */

import { SystemErrorLog } from '../db/models/index.js';

/**
 * Log a system error
 * @param {Error|string} error Error object or message
 * @param {Object} options Additional options
 * @param {string} options.component Component where the error occurred
 * @param {string} options.severity Error severity
 * @param {Object} options.context Additional context data
 * @param {string|Object} options.userId User ID if in user context
 * @param {Object} options.request Request data if in API context
 * @returns {Promise<Object>} Created error log entry
 */
export async function logError(error, options = {}) {
  try {
    const {
      component = 'general',
      severity = 'ERROR',
      context = {},
      userId = null,
      request = null
    } = options;
    
    // Extract error properties
    const errorObj = error instanceof Error ? error : new Error(error);
    const { message, stack, name, code } = errorObj;
    
    // Create error log entry
    const errorLog = new SystemErrorLog({
      message: message || String(error),
      code: code || name,
      stack,
      component,
      context,
      severity,
      userId,
      request,
      environment: process.env.NODE_ENV || 'development'
    });
    
    return await errorLog.save();
  } catch (internalError) {
    // Fallback to console if database logging fails
    console.error('Error in error logging service:', internalError);
    console.error('Original error:', error);
    return null;
  }
}

/**
 * Express middleware for global error handling
 * @param {Object} options Middleware options
 * @returns {Function} Express error middleware
 */
export function errorHandler(options = {}) {
  const {
    logErrors = true,
    showStack = process.env.NODE_ENV !== 'production'
  } = options;
  
  return async (err, req, res, next) => {
    // Log the error if enabled
    if (logErrors) {
      try {
        await logError(err, {
          component: 'express',
          context: {
            path: req.path,
            method: req.method
          },
          userId: req.user ? req.user._id : null,
          request: {
            url: req.originalUrl,
            method: req.method,
            headers: req.headers,
            query: req.query,
            body: req.body
          }
        });
      } catch (loggingError) {
        console.error('Error in error handler middleware:', loggingError);
      }
    }
    
    // Determine status code
    const statusCode = err.statusCode || err.status || 500;
    
    // Send response
    res.status(statusCode).json({
      error: {
        message: err.message || 'Internal Server Error',
        code: err.code || 'INTERNAL_ERROR',
        ...(showStack && err.stack ? { stack: err.stack } : {})
      }
    });
  };
}

/**
 * Get recent system errors
 * @param {Object} options Query options
 * @param {string} options.component Filter by component
 * @param {string} options.severity Filter by severity
 * @param {Date} options.startDate Filter errors after this date
 * @param {Date} options.endDate Filter errors before this date
 * @param {number} options.limit Maximum number of results
 * @param {number} options.skip Number of results to skip
 * @returns {Promise<Array>} Array of error logs
 */
export async function getRecentErrors(options = {}) {
  try {
    const {
      component,
      severity,
      startDate,
      endDate,
      limit = 50,
      skip = 0
    } = options;
    
    let query = SystemErrorLog.find();
    
    // Apply filters
    if (component) query = query.byComponent(component);
    if (severity) query = query.bySeverity(severity);
    if (startDate && endDate) query = query.timeRange(startDate, endDate);
    
    // Execute query with pagination
    return await query
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  } catch (error) {
    console.error('Error retrieving system errors:', error);
    return [];
  }
}

/**
 * Delete old error logs
 * @param {Object} options Options for deletion
 * @param {number} options.olderThanDays Delete logs older than this many days
 * @returns {Promise<number>} Number of deleted logs
 */
export async function purgeOldErrorLogs(options = {}) {
  try {
    const { olderThanDays = 90 } = options;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const result = await SystemErrorLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });
    
    return result.deletedCount;
  } catch (error) {
    console.error('Error purging old error logs:', error);
    return 0;
  }
}