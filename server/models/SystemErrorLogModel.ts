import mongoose, { Document, Schema } from 'mongoose';
import { SYSTEM_ERROR_LEVELS } from '../../shared/schema';
import { incrementStats } from './SystemUsageStatsModel';

export interface SystemErrorLog extends Document {
  level: typeof SYSTEM_ERROR_LEVELS[number];
  message: string;
  stack?: string;
  userId?: string;
  request?: Record<string, any>;
  timestamp: Date;
}

// Define system error log schema
const SystemErrorLogSchema = new Schema<SystemErrorLog>({
  level: { 
    type: String, 
    enum: SYSTEM_ERROR_LEVELS,
    required: true
  },
  message: { 
    type: String, 
    required: true 
  },
  stack: { 
    type: String 
  },
  userId: { 
    type: String 
  },
  request: { 
    type: Schema.Types.Mixed 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// Create indices for faster lookups
SystemErrorLogSchema.index({ level: 1, timestamp: -1 });
SystemErrorLogSchema.index({ userId: 1, timestamp: -1 });

// Create system error log model
export const SystemErrorLogModel = mongoose.model<SystemErrorLog>('SystemErrorLog', SystemErrorLogSchema);

/**
 * Sanitize request data to remove sensitive information
 */
function sanitizeRequest(req: any): Record<string, any> {
  if (!req) return {};
  
  // Create a safe copy of the request object
  const sanitized: Record<string, any> = {
    method: req.method,
    url: req.url,
    path: req.path,
    params: req.params || {},
    query: req.query || {},
    headers: { ...req.headers }
  };
  
  // Remove sensitive headers
  const sensitiveHeaders = [
    'authorization', 
    'cookie', 
    'set-cookie'
  ];
  
  sensitiveHeaders.forEach(header => {
    if (sanitized.headers[header]) {
      sanitized.headers[header] = '[REDACTED]';
    }
  });
  
  // Remove password and sensitive fields from body
  if (req.body) {
    sanitized.body = { ...req.body };
    const sensitiveFields = [
      'password',
      'confirmPassword',
      'newPassword',
      'secret',
      'token',
      'apiKey',
      'securityAnswer'
    ];
    
    sensitiveFields.forEach(field => {
      if (typeof sanitized.body[field] !== 'undefined') {
        sanitized.body[field] = '[REDACTED]';
      }
    });
  }
  
  return sanitized;
}

/**
 * Log a system error
 */
export async function logSystemError(
  level: typeof SYSTEM_ERROR_LEVELS[number],
  message: string,
  options?: {
    stack?: string;
    userId?: string;
    req?: any;
  }
): Promise<SystemErrorLog> {
  try {
    // Create new error log record
    const errorLog = new SystemErrorLogModel({
      level,
      message,
      stack: options?.stack,
      userId: options?.userId,
      request: options?.req ? sanitizeRequest(options.req) : undefined,
      timestamp: new Date()
    });
    
    await errorLog.save();
    
    // Increment error count in stats
    await incrementStats({ errorCount: 1 });
    
    return errorLog;
  } catch (error) {
    console.error('Error logging system error:', error);
    
    // Failsafe - create minimally viable error log
    const fallbackLog = new SystemErrorLogModel({
      level: 'critical',
      message: 'Error logging system error: ' + error,
      timestamp: new Date()
    });
    
    try {
      await fallbackLog.save();
    } catch (innerError) {
      console.error('Failed to save fallback error log:', innerError);
    }
    
    return fallbackLog;
  }
}

/**
 * Get error logs with pagination and filtering
 */
export async function getErrorLogs(
  page: number = 1,
  limit: number = 50,
  level?: typeof SYSTEM_ERROR_LEVELS[number],
  userId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<{ logs: SystemErrorLog[], total: number }> {
  try {
    const query: any = {};
    
    if (level) {
      query.level = level;
    }
    
    if (userId) {
      query.userId = userId;
    }
    
    if (startDate || endDate) {
      query.timestamp = {};
      
      if (startDate) {
        query.timestamp.$gte = startDate;
      }
      
      if (endDate) {
        query.timestamp.$lte = endDate;
      }
    }
    
    const total = await SystemErrorLogModel.countDocuments(query);
    const logs = await SystemErrorLogModel.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    
    return { logs, total };
  } catch (error) {
    console.error('Error getting error logs:', error);
    return { logs: [], total: 0 };
  }
}

/**
 * Get error logs for a specific user
 */
export async function getUserErrorLogs(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ logs: SystemErrorLog[], total: number }> {
  return getErrorLogs(page, limit, undefined, userId);
}

/**
 * Get critical errors
 */
export async function getCriticalErrors(
  page: number = 1,
  limit: number = 20
): Promise<{ logs: SystemErrorLog[], total: number }> {
  return getErrorLogs(page, limit, 'critical');
}

/**
 * Get error summary for admin dashboard
 */
export async function getErrorSummary(
  days: number = 7
): Promise<{
  total: number;
  byLevel: Record<string, number>;
  recentErrors: SystemErrorLog[];
}> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Count total errors in the period
    const total = await SystemErrorLogModel.countDocuments({
      timestamp: { $gte: startDate }
    });
    
    // Count errors by level
    const byLevelPipeline = [
      { 
        $match: { 
          timestamp: { $gte: startDate } 
        } 
      },
      { 
        $group: { 
          _id: '$level', 
          count: { $sum: 1 } 
        } 
      }
    ];
    
    const byLevelResults = await SystemErrorLogModel.aggregate(byLevelPipeline);
    
    const byLevel: Record<string, number> = {};
    byLevelResults.forEach(result => {
      byLevel[result._id] = result.count;
    });
    
    // Get most recent errors
    const recentErrors = await SystemErrorLogModel.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .exec();
    
    return { total, byLevel, recentErrors };
  } catch (error) {
    console.error('Error getting error summary:', error);
    return { total: 0, byLevel: {}, recentErrors: [] };
  }
}