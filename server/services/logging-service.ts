import mongoose from 'mongoose';
import { UserActivityModel } from '../db/models';
import SystemErrorLogModel, { type SystemErrorLog } from '../models/SystemErrorLogModel';
import APIRequestLogModel, { type APIRequestLog } from '../models/APIRequestLogModel';

// Define UserActivity type
export interface UserActivity {
  _id?: string;
  userId: string;
  action: UserActivityType;
  details?: string;
  timestamp: Date;
  targetUserId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Define UserActivityType
export type UserActivityType = 
  | 'login_success' 
  | 'login_failure' 
  | 'logout' 
  | 'register' 
  | 'password_reset' 
  | 'password_change' 
  | 'security_question_update' 
  | 'profile_update' 
  | 'admin_access' 
  | 'admin_action' 
  | 'feature_usage' 
  | 'account_lock' 
  | 'account_unlock' 
  | 'api_key_generate' 
  | 'api_key_revoke' 
  | 'view_all_users'
  | 'view_error_logs'
  | 'view_feature_limits'
  | 'update_feature_limits'
  | 'view_system_notifications'
  | 'view_data_imports'
  | 'view_dashboard_summary'
  | 'admin_access_denied'
  | 'superadmin_access_denied'
  | 'other';

// Interface for the log user activity function
export interface UserActivityLog {
  userId: string;
  action: UserActivityType;
  details?: string;
  targetUserId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Log user activity for auditing and monitoring
 * 
 * @param params Activity parameters
 * @returns The saved activity log
 */
export async function logUserActivityWithParams(params: UserActivityLog) {
  try {
    const {
      userId,
      action,
      details,
      targetUserId,
      metadata,
      ipAddress,
      userAgent
    } = params;

    // Create the activity log with proper field mapping
    const activityLog = new UserActivityModel({
      userId: userId,
      activityType: action, // Map action to activityType for compatibility
      details: typeof details === 'string' ? { message: details } : details || {}, // Convert string to object if needed
      timestamp: new Date(),
      ipAddress: ipAddress,
      userAgent: userAgent,
      ...(metadata && { metadata }) // Add metadata if provided
    });

    // Save and return the log
    return await activityLog.save();
  } catch (error) {
    console.error('Error logging user activity:', error);
    // Don't throw, just log the error - activity logging should never block application flow
    return null;
  }
}

/**
 * Get user activity logs with pagination
 * 
 * @param userId User ID to filter by (optional)
 * @param page Page number (starting from 1)
 * @param limit Number of items per page
 * @param actions Array of action types to filter by (optional)
 * @param startDate Start date to filter by (optional)
 * @param endDate End date to filter by (optional)
 * @returns Object with logs array and total count
 */
export async function getUserActivityLogs(
  userId?: string,
  page: number = 1,
  limit: number = 20,
  actions?: UserActivityType[],
  startDate?: Date,
  endDate?: Date
) {
  try {
    // Build filter
    const filter: any = {};
    
    if (userId) {
      filter.userId = userId;
    }
    
    if (actions && actions.length > 0) {
      filter.activityType = { $in: actions };
    }
    
    // Add date range filter if provided
    if (startDate || endDate) {
      filter.timestamp = {};
      
      if (startDate) {
        filter.timestamp.$gte = startDate;
      }
      
      if (endDate) {
        filter.timestamp.$lte = endDate;
      }
    }
    
    // Calculate skip value for pagination
    const skip = (Math.max(1, page) - 1) * limit;
    
    // Get total count
    const total = await UserActivityModel.countDocuments(filter);
    
    // Get paginated logs
    const logs = await UserActivityModel.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    return {
      logs,
      total
    };
  } catch (error) {
    console.error('Error getting user activity logs:', error);
    return {
      logs: [],
      total: 0
    };
  }
}

/**
 * Get activity summary for a user
 * 
 * @param userId User ID
 * @param days Number of days to look back
 * @returns Summary of user activities
 */
export async function getUserActivitySummary(userId: string, days: number = 30) {
  try {
    // Calculate date threshold
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Aggregation pipeline
    const summary = await UserActivityModel.aggregate([
      {
        $match: {
          userId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
          lastActivity: { $max: '$timestamp' }
        }
      },
      {
        $sort: { lastActivity: -1 }
      }
    ]);
    
    // Count total activities
    const totalActivities = await UserActivityModel.countDocuments({
      userId,
      timestamp: { $gte: startDate }
    });
    
    // Format response
    return {
      userId,
      period: `Last ${days} days`,
      totalActivities,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      activityBreakdown: summary.map((item: any) => ({
        activityType: item._id, // Use activityType instead of action
        count: item.count,
        lastActivity: item.lastActivity.toISOString()
      }))
    };
  } catch (error) {
    console.error('Error getting user activity summary:', error);
    const errorStartDate = new Date();
    errorStartDate.setDate(errorStartDate.getDate() - days);
    return {
      userId,
      period: `Last ${days} days`,
      totalActivities: 0,
      startDate: errorStartDate.toISOString(),
      endDate: new Date().toISOString(),
      activityBreakdown: [],
      error: 'Failed to retrieve activity summary'
    };
  }
}

/**
 * Legacy function to support existing auth.ts implementation
 * 
 * @param userId The user ID
 * @param action The action type
 * @param status 'success' or 'failure'
 * @param req Express request object (for IP and user agent)
 * @param metadata Additional data to log
 * @returns The saved activity log
 */
export async function logUserActivity(
  userId: string,
  action: string,
  status: 'success' | 'failure',
  req: any,
  metadata: Record<string, any> = {}
) {
  // Map old action format to new UserActivityType
  let activityType: UserActivityType = 'other';
  
  if (action === 'register') activityType = 'login_success';
  if (action === 'login') activityType = 'login_success';
  if (action === 'login_attempt' && status === 'failure') activityType = 'login_failure';
  if (action === 'logout') activityType = 'logout';
  if (action === 'password_reset_complete') activityType = 'password_reset';
  if (action === 'security_answer_verification') activityType = 'security_question_update';
  
  try {
    const activityLog = new UserActivityModel({
      userId: userId,
      activityType: activityType, // Use activityType field instead of action
      details: { 
        message: `${action}: ${status}`,
        ...metadata,
        status,
        originalAction: action // Store original action as reference
      },
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: metadata // Include metadata in its dedicated field too
    });

    // Save and return the log
    return await activityLog.save();
  } catch (error) {
    console.error('Error logging user activity:', error);
    // Don't throw, just log the error - activity logging should never block application flow
    return null;
  }
}

/**
 * Get user activity history for a specific user
 * 
 * @param userId User ID
 * @param limit Number of records to return
 * @returns Array of user activity logs
 */
export async function getUserActivityHistory(userId: string, limit: number = 20) {
  try {
    return await UserActivityModel.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  } catch (error) {
    console.error('Error fetching user activity history:', error);
    return [];
  }
}

// Define error severity and category types
export type ErrorSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ErrorCategory = 'security' | 'database' | 'api' | 'authentication' | 'authorization' | 'validation' | 'system' | 'other';

// Interface for error log parameters
export interface ErrorLogParams {
  message: string;
  stack?: string;
  code?: string;
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  endpoint?: string;
  method?: string;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

/**
 * Log a system error
 * 
 * @param params Error parameters
 * @returns The saved error log
 */
export async function logError(params: ErrorLogParams) {
  try {
    const {
      message,
      stack,
      code,
      severity = 'medium',
      category = 'other',
      endpoint,
      method,
      userId,
      userAgent,
      ipAddress,
      metadata
    } = params;

    // Create the error log
    const errorLog = new SystemErrorLogModel({
      message,
      stack,
      code,
      timestamp: new Date(),
      severity,
      category,
      endpoint,
      method,
      userId,
      userAgent,
      ipAddress,
      resolved: false,
      metadata: metadata || {}
    });

    // Save and return the log
    return await errorLog.save();
  } catch (error) {
    console.error('Error logging system error:', error);
    // Don't throw, just log to console - error logging should never fail
    return null;
  }
}

// Interface for error log query parameters
export interface ErrorLogQueryParams {
  page?: number;
  limit?: number;
  severity?: ErrorSeverity[];
  category?: ErrorCategory[];
  resolved?: boolean;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  searchTerm?: string;
}

/**
 * Get error logs with pagination and filtering
 * 
 * @param params Query parameters
 * @returns Object with logs array and total count
 */
export async function getErrorLogs(params: ErrorLogQueryParams = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      severity,
      category,
      resolved,
      userId,
      startDate,
      endDate,
      searchTerm
    } = params;

    // Build filter
    const filter: any = {};

    if (severity && severity.length > 0) {
      filter.severity = { $in: severity };
    }

    if (category && category.length > 0) {
      filter.category = { $in: category };
    }

    if (resolved !== undefined) {
      filter.resolved = resolved;
    }

    if (userId) {
      filter.userId = userId;
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      filter.timestamp = {};
      
      if (startDate) {
        filter.timestamp.$gte = startDate;
      }
      
      if (endDate) {
        filter.timestamp.$lte = endDate;
      }
    }

    // Add text search if provided
    if (searchTerm) {
      filter.$or = [
        { message: { $regex: searchTerm, $options: 'i' } },
        { code: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Calculate skip value for pagination
    const skip = (Math.max(1, page) - 1) * limit;
    
    // Get total count
    const total = await SystemErrorLogModel.countDocuments(filter);
    
    // Get paginated logs
    const logs = await SystemErrorLogModel.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    return {
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    };
  } catch (error) {
    console.error('Error getting error logs:', error);
    return {
      logs: [],
      total: 0,
      page: 1,
      pages: 0,
      limit: 20
    };
  }
}

// Define request status type
export type RequestStatus = 'success' | 'warning' | 'error' | 'info';

// Interface for API request log query parameters
export interface APIRequestLogQueryParams {
  page?: number;
  limit?: number;
  status?: number[];
  requestStatus?: RequestStatus[];
  userId?: string;
  endpoint?: string;
  method?: string;
  startDate?: Date;
  endDate?: Date;
  minDuration?: number;
  maxDuration?: number;
}

/**
 * Get API request logs with pagination and filtering
 * 
 * @param params Query parameters
 * @returns Object with logs array and total count
 */
export async function getAPIRequestLogs(params: APIRequestLogQueryParams = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      requestStatus,
      userId,
      endpoint,
      method,
      startDate,
      endDate,
      minDuration,
      maxDuration
    } = params;

    // Build filter
    const filter: any = {};

    if (status && status.length > 0) {
      filter.status = { $in: status };
    }

    if (requestStatus && requestStatus.length > 0) {
      filter.requestStatus = { $in: requestStatus };
    }

    if (userId) {
      filter.userId = userId;
    }

    if (endpoint) {
      filter.endpoint = { $regex: endpoint, $options: 'i' };
    }

    if (method) {
      filter.method = method.toUpperCase();
    }

    // Add date range filter if provided
    if (startDate || endDate) {
      filter.timestamp = {};
      
      if (startDate) {
        filter.timestamp.$gte = startDate;
      }
      
      if (endDate) {
        filter.timestamp.$lte = endDate;
      }
    }

    // Add duration filter if provided
    if (minDuration !== undefined || maxDuration !== undefined) {
      filter.duration = {};
      
      if (minDuration !== undefined) {
        filter.duration.$gte = minDuration;
      }
      
      if (maxDuration !== undefined) {
        filter.duration.$lte = maxDuration;
      }
    }

    // Calculate skip value for pagination
    const skip = (Math.max(1, page) - 1) * limit;
    
    // Get total count
    const total = await APIRequestLogModel.countDocuments(filter);
    
    // Get paginated logs
    const logs = await APIRequestLogModel.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    return {
      logs,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    };
  } catch (error) {
    console.error('Error getting API request logs:', error);
    return {
      logs: [],
      total: 0,
      page: 1,
      pages: 0,
      limit: 20
    };
  }
}

/**
 * Get error summary statistics for a given time period
 * 
 * @param days Number of days to look back (default: 30)
 * @returns Object with error count by severity, category, and daily trend
 */
export async function getErrorSummary(days: number = 30) {
  try {
    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Base query for the date range
    const dateQuery = { timestamp: { $gte: startDate } };
    
    // Get total error count
    const totalCount = await SystemErrorLogModel.countDocuments(dateQuery);
    
    // Get count by severity
    const countBySeverity = await SystemErrorLogModel.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get count by category
    const countByCategory = await SystemErrorLogModel.aggregate([
      { $match: dateQuery },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get daily trend
    const dailyTrend = await SystemErrorLogModel.aggregate([
      { $match: dateQuery },
      { 
        $group: { 
          _id: { 
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            day: { $dayOfMonth: '$timestamp' }
          },
          count: { $sum: 1 },
          criticalCount: { 
            $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] }
          } 
        } 
      },
      { 
        $project: {
          _id: 0,
          date: { 
            $dateFromParts: { 
              year: '$_id.year', 
              month: '$_id.month', 
              day: '$_id.day'
            } 
          },
          count: 1,
          criticalCount: 1
        }
      },
      { $sort: { date: 1 } }
    ]);
    
    // Get resolved vs. unresolved count
    const resolvedCount = await SystemErrorLogModel.countDocuments({ 
      ...dateQuery, 
      resolved: true 
    });
    
    const unresolvedCount = totalCount - resolvedCount;
    
    // Return summary object
    return {
      totalCount,
      countBySeverity: countBySeverity.map(item => ({
        severity: item._id,
        count: item.count
      })),
      countByCategory: countByCategory.map(item => ({
        category: item._id,
        count: item.count
      })),
      dailyTrend,
      resolvedCount,
      unresolvedCount
    };
  } catch (error) {
    console.error('Error getting error summary:', error);
    return {
      totalCount: 0,
      countBySeverity: [],
      countByCategory: [],
      dailyTrend: [],
      resolvedCount: 0,
      unresolvedCount: 0
    };
  }
}