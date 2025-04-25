import mongoose, { Document, Schema } from 'mongoose';

export const SYSTEM_ERROR_LEVELS = ['debug', 'info', 'warning', 'error', 'critical'] as const;
export type ErrorLevel = typeof SYSTEM_ERROR_LEVELS[number];

export interface SystemErrorLog {
  level: ErrorLevel;
  message: string;
  stack?: string;
  userId?: string;
  request?: Record<string, any>;
  timestamp: Date;
}

// Extend the Document interface but avoid conflict with 'errors' property
export interface SystemErrorLogDocument extends SystemErrorLog, Omit<Document, 'errors'> {
  // This is safe because we're explicitly removing the 'errors' property from Document
  // MongoDB Document has an 'errors' property that conflicts with our schema
}

const SystemErrorLogSchema = new Schema<SystemErrorLogDocument>({
  level: { 
    type: String, 
    required: true, 
    enum: SYSTEM_ERROR_LEVELS,
    index: true
  },
  message: { type: String, required: true },
  stack: { type: String },
  userId: { type: String, index: true },
  request: { type: Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  collection: 'systemErrorLogs'
});

export const SystemErrorLogModel = mongoose.model<SystemErrorLogDocument>('SystemErrorLog', SystemErrorLogSchema);

/**
 * Sanitize request data to remove sensitive information
 */
function sanitizeRequest(req: any): Record<string, any> {
  if (!req) return {};
  
  const sanitized: Record<string, any> = {
    url: req.url || req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.headers?.['user-agent'],
    referer: req.headers?.referer,
  };
  
  // Add query params but sanitize any sensitive fields
  if (req.query) {
    sanitized.query = { ...req.query };
    // Remove sensitive fields
    delete sanitized.query.password;
    delete sanitized.query.token;
    delete sanitized.query.accessToken;
    delete sanitized.query.refreshToken;
    delete sanitized.query.secret;
  }
  
  // Add request body but sanitize any sensitive fields
  if (req.body) {
    sanitized.body = { ...req.body };
    // Remove sensitive fields
    delete sanitized.body.password;
    delete sanitized.body.token;
    delete sanitized.body.accessToken;
    delete sanitized.body.refreshToken;
    delete sanitized.body.secret;
    delete sanitized.body.securityAnswer;
    // Remove any password fields like newPassword, confirmPassword, etc.
    Object.keys(sanitized.body).forEach(key => {
      if (key.toLowerCase().includes('password')) {
        delete sanitized.body[key];
      }
    });
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
    req?: any; // Express request object or similar
    userId?: string;
    error?: Error;
  }
): Promise<SystemErrorLogDocument> {
  // Create the error log
  const errorLog = new SystemErrorLogModel({
    level,
    message,
    stack: options?.error?.stack,
    userId: options?.userId,
    request: options?.req ? sanitizeRequest(options.req) : undefined,
    timestamp: new Date()
  });
  
  // Save to database
  await errorLog.save();
  
  // Also log to console for critical and error levels
  if (level === 'critical' || level === 'error') {
    console.error(`[${level.toUpperCase()}] ${message}`, 
      options?.error ? `\n${options.error.stack || options.error.message}` : ''
    );
  }
  
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
): Promise<{ logs: SystemErrorLogDocument[], total: number }> {
  const query: Record<string, any> = {};
  
  // Add filters if provided
  if (level) {
    query.level = level;
  }
  
  if (userId) {
    query.userId = userId;
  }
  
  // Add date range filter if provided
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) {
      query.timestamp.$gte = startDate;
    }
    if (endDate) {
      query.timestamp.$lte = endDate;
    }
  }
  
  // Get total count for pagination
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
  limit: number = 50
): Promise<SystemErrorLogDocument[]> {
  return SystemErrorLogModel.find({ userId })
    .sort({ timestamp: -1 })
    .limit(limit);
}

/**
 * Get critical errors
 */
export async function getCriticalErrors(
  limit: number = 20
): Promise<SystemErrorLogDocument[]> {
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
  counts: Record<ErrorLevel, number>;
  recent: SystemErrorLogDocument[];
  dailyCounts: Array<{ date: string; count: number }>;
}> {
  // Calculate date for filtering
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  cutoffDate.setHours(0, 0, 0, 0);
  
  // Get counts by level
  const countPromises = SYSTEM_ERROR_LEVELS.map(level => 
    SystemErrorLogModel.countDocuments({ 
      level, 
      timestamp: { $gte: cutoffDate } 
    })
  );
  
  // Get recent critical errors
  const recentErrorsPromise = SystemErrorLogModel.find({ 
    level: { $in: ['critical', 'error'] },
    timestamp: { $gte: cutoffDate }
  })
    .sort({ timestamp: -1 })
    .limit(10);
  
  // Execute all promises in parallel
  const results = await Promise.all([
    ...countPromises,
    recentErrorsPromise
  ]);
  
  // Extract the results
  const debugCount = results[0] as number;
  const infoCount = results[1] as number;
  const warningCount = results[2] as number;
  const errorCount = results[3] as number;
  const criticalCount = results[4] as number;
  const recentErrors = results[5] as SystemErrorLogDocument[];
  
  // Get daily error counts
  const dailyCounts: Array<{ date: string; count: number }> = [];
  
  // Create array of last N days
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    // Count errors for this day
    const count = await SystemErrorLogModel.countDocuments({
      timestamp: { $gte: date, $lt: nextDate }
    });
    
    dailyCounts.push({
      date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      count
    });
  }
  
  // Sort by date ascending
  dailyCounts.sort((a, b) => a.date.localeCompare(b.date));
  
  return {
    counts: {
      debug: debugCount,
      info: infoCount,
      warning: warningCount,
      error: errorCount,
      critical: criticalCount
    },
    recent: recentErrors,
    dailyCounts
  };
}