import mongoose, { Document, Schema } from 'mongoose';

// Error level type
export const SYSTEM_ERROR_LEVELS = ['debug', 'info', 'warning', 'error', 'critical'] as const;
export type ErrorLevel = typeof SYSTEM_ERROR_LEVELS[number];

export interface SystemErrorLog extends Document {
  level: ErrorLevel;
  message: string;
  stack?: string;
  userId?: string;
  request?: Record<string, any>;
  timestamp: Date;
}

const SystemErrorLogSchema = new Schema<SystemErrorLog>({
  level: {
    type: String,
    required: true,
    enum: SYSTEM_ERROR_LEVELS,
    default: 'error'
  },
  message: { type: String, required: true },
  stack: { type: String },
  userId: { type: String },
  request: { type: Schema.Types.Mixed }, // Store details about the request
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: { createdAt: 'timestamp', updatedAt: false },
  collection: 'systemErrorLogs'
});

// Create indexes for efficient querying
SystemErrorLogSchema.index({ level: 1, timestamp: -1 });
SystemErrorLogSchema.index({ userId: 1, timestamp: -1 });

export const SystemErrorLogModel = mongoose.model<SystemErrorLog>('SystemErrorLog', SystemErrorLogSchema);

/**
 * Sanitize request data to remove sensitive information
 */
function sanitizeRequest(req: any): Record<string, any> {
  if (!req) return {};
  
  const sanitized: Record<string, any> = {
    method: req.method,
    url: req.url,
    path: req.path,
    query: req.query,
    headers: {
      ...req.headers,
      // Remove sensitive headers
      authorization: req.headers?.authorization ? '[REDACTED]' : undefined,
      cookie: req.headers?.cookie ? '[REDACTED]' : undefined
    },
    ip: req.ip
  };
  
  // Remove sensitive body fields if present
  if (req.body) {
    sanitized.body = { ...req.body };
    // Redact sensitive fields
    if (sanitized.body.password) sanitized.body.password = '[REDACTED]';
    if (sanitized.body.securityAnswer) sanitized.body.securityAnswer = '[REDACTED]';
    if (sanitized.body.token) sanitized.body.token = '[REDACTED]';
  }
  
  return sanitized;
}

/**
 * Log a system error
 */
export async function logSystemError(
  level: ErrorLevel,
  message: string,
  options?: {
    error?: Error;
    userId?: string;
    request?: any;
  }
): Promise<SystemErrorLog> {
  const errorData: Partial<SystemErrorLog> = {
    level,
    message,
    stack: options?.error?.stack,
    userId: options?.userId,
    request: options?.request ? sanitizeRequest(options.request) : undefined
  };
  
  const errorLog = new SystemErrorLogModel(errorData);
  await errorLog.save();
  return errorLog;
}

/**
 * Get error logs with pagination and filtering
 */
export async function getErrorLogs(
  page: number = 1,
  limit: number = 50,
  level?: ErrorLevel,
  userId?: string,
  startDate?: Date,
  endDate?: Date
): Promise<{ logs: SystemErrorLog[], total: number }> {
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
  
  // Get total count
  const total = await SystemErrorLogModel.countDocuments(query);
  
  // Get paginated logs
  const logs = await SystemErrorLogModel.find(query)
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  
  return { logs, total };
}

/**
 * Get error logs for a specific user
 */
export async function getUserErrorLogs(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ logs: SystemErrorLog[], total: number }> {
  // Get total count
  const total = await SystemErrorLogModel.countDocuments({ userId });
  
  // Get paginated logs
  const logs = await SystemErrorLogModel.find({ userId })
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  
  return { logs, total };
}

/**
 * Get critical errors
 */
export async function getCriticalErrors(
  limit: number = 20
): Promise<SystemErrorLog[]> {
  return SystemErrorLogModel.find({ level: 'critical' })
    .sort({ timestamp: -1 })
    .limit(limit);
}

/**
 * Get error summary for admin dashboard
 */
export async function getErrorSummary(
  days: number = 30
): Promise<{
  byLevel: Record<ErrorLevel, number>;
  recent: SystemErrorLog[];
  total: number;
}> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  // Count errors by level
  const byLevelAggregation = await SystemErrorLogModel.aggregate([
    { $match: { timestamp: { $gte: cutoffDate } } },
    { $group: { _id: '$level', count: { $sum: 1 } } }
  ]);
  
  // Transform to object with level as key
  const byLevel = byLevelAggregation.reduce((acc, item) => {
    acc[item._id as ErrorLevel] = item.count;
    return acc;
  }, {} as Record<ErrorLevel, number>);
  
  // Add missing levels with 0 count
  SYSTEM_ERROR_LEVELS.forEach(level => {
    if (!byLevel[level]) {
      byLevel[level] = 0;
    }
  });
  
  // Get most recent errors
  const recent = await SystemErrorLogModel.find()
    .sort({ timestamp: -1 })
    .limit(10);
  
  // Get total count in period
  const total = await SystemErrorLogModel.countDocuments({
    timestamp: { $gte: cutoffDate }
  });
  
  return { byLevel, recent, total };
}