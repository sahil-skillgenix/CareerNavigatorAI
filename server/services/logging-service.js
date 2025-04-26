/**
 * Centralized logging service for the Skillgenix application
 * Provides functionality to log user activities, system errors, and other events
 */

import UserActivityLog from '../db/models/user-activity-log.js';

/**
 * Log a user activity
 * @param {Object} activityData Activity data to log
 * @param {string} activityData.userId User ID (required)
 * @param {string} activityData.action Action performed (required)
 * @param {string} activityData.category Category of activity (default: USER)
 * @param {Object} activityData.details Additional details about the activity
 * @param {string} activityData.ipAddress IP address (optional)
 * @param {string} activityData.userAgent User agent information (optional)
 * @param {string} activityData.status Status of activity (default: SUCCESS)
 * @returns {Promise<Object>} The created log entry
 */
export async function logUserActivity(activityData) {
  try {
    // Support both old and new field names for backward compatibility
    const { 
      userId, 
      action = activityData.activityType,
      category = activityData.activityCategory || 'USER',
      details = activityData.data,
      ipAddress,
      userAgent,
      status = 'SUCCESS' 
    } = activityData;
    
    if (!userId) {
      console.error('User ID is required for activity logging');
      return null;
    }
    
    if (!action) {
      console.error('Action is required for activity logging');
      return null;
    }
    
    // Create standardized log entry
    const activityLog = new UserActivityLog({
      userId,
      action,
      category,
      details,
      ipAddress,
      userAgent,
      status,
      // Also set old field names for backward compatibility
      activityType: action,
      activityCategory: category,
      data: details
    });
    
    return await activityLog.save();
  } catch (error) {
    console.error('Error logging user activity:', error);
    return null;
  }
}

/**
 * Express middleware to log API requests
 * @param {Object} options Options for the middleware
 * @returns {Function} Express middleware function
 */
export function apiRequestLogger(options = {}) {
  const {
    excludePaths = ['/api/health', '/api/status'],
    logBody = false
  } = options;
  
  return async (req, res, next) => {
    // Skip excluded paths
    if (excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }
    
    const startTime = Date.now();
    
    // Capture original end method
    const originalEnd = res.end;
    
    // Override end method to capture response
    res.end = function(chunk, encoding) {
      res.end = originalEnd;
      res.end(chunk, encoding);
      
      const responseTime = Date.now() - startTime;
      
      // Log the request
      try {
        const logData = {
          userId: req.user ? req.user._id : null,
          action: 'API_REQUEST',
          category: 'API',
          details: {
            method: req.method,
            path: req.path,
            query: req.query,
            body: logBody ? req.body : undefined,
            status: res.statusCode,
            responseTime,
            contentLength: res.getHeader('content-length')
          },
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          status: res.statusCode >= 400 ? 'FAILURE' : 'SUCCESS'
        };
        
        // Log asynchronously - don't await
        logUserActivity(logData).catch(err => {
          console.error('Error in API request logger:', err);
        });
      } catch (error) {
        console.error('Error in API request logger:', error);
      }
    };
    
    next();
  };
}

/**
 * Get recent user activities
 * @param {Object} options Query options
 * @param {string} options.userId Filter by user ID
 * @param {string} options.action Filter by action
 * @param {string} options.category Filter by category
 * @param {Date} options.startDate Filter activities after this date
 * @param {Date} options.endDate Filter activities before this date
 * @param {number} options.limit Maximum number of results to return
 * @param {number} options.skip Number of results to skip
 * @returns {Promise<Array>} Array of activity logs
 */
export async function getUserActivities(options = {}) {
  try {
    const {
      userId,
      action,
      category,
      startDate,
      endDate,
      limit = 50,
      skip = 0
    } = options;
    
    let query = UserActivityLog.find();
    
    // Apply filters
    if (userId) query = query.byUser(userId);
    if (action) query = query.byAction(action);
    if (category) query = query.byCategory(category);
    if (startDate && endDate) query = query.timeRange(startDate, endDate);
    
    // Execute query with pagination
    return await query
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  } catch (error) {
    console.error('Error retrieving user activities:', error);
    return [];
  }
}

/**
 * Count user activities
 * @param {Object} options Query options
 * @returns {Promise<number>} Count of matching activities
 */
export async function countUserActivities(options = {}) {
  try {
    const {
      userId,
      action,
      category,
      startDate,
      endDate
    } = options;
    
    let query = UserActivityLog.find();
    
    // Apply filters
    if (userId) query = query.byUser(userId);
    if (action) query = query.byAction(action);
    if (category) query = query.byCategory(category);
    if (startDate && endDate) query = query.timeRange(startDate, endDate);
    
    return await query.countDocuments();
  } catch (error) {
    console.error('Error counting user activities:', error);
    return 0;
  }
}

/**
 * Delete old activity logs
 * @param {Object} options Options for deletion
 * @param {number} options.olderThanDays Delete logs older than this many days
 * @returns {Promise<number>} Number of deleted logs
 */
export async function purgeOldActivityLogs(options = {}) {
  try {
    const { olderThanDays = 90 } = options;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
    
    const result = await UserActivityLog.deleteMany({
      timestamp: { $lt: cutoffDate }
    });
    
    return result.deletedCount;
  } catch (error) {
    console.error('Error purging old activity logs:', error);
    return 0;
  }
}