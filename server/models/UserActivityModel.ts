import mongoose, { Document, Schema } from 'mongoose';

export interface UserActivity extends Document {
  userId: string;
  action: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  status: 'success' | 'failure' | 'warning' | 'info';
}

// Define user activity schema for MongoDB
const UserActivitySchema = new Schema<UserActivity>({
  userId: { 
    type: String, 
    required: true, 
    index: true 
  },
  action: { 
    type: String, 
    required: true,
    enum: [
      'login', 
      'login_attempt', 
      'logout', 
      'register', 
      'password_reset_request', 
      'password_reset_complete',
      'security_answer_verification',
      'account_update',
      'data_export'
    ]
  },
  timestamp: { 
    type: Date, 
    default: Date.now, 
    index: true 
  },
  ipAddress: { 
    type: String 
  },
  userAgent: { 
    type: String 
  },
  details: { 
    type: Schema.Types.Mixed 
  },
  status: { 
    type: String, 
    required: true,
    enum: ['success', 'failure', 'warning', 'info'],
    default: 'info' 
  }
});

// Create activity log model
export const UserActivityModel = mongoose.model<UserActivity>('UserActivity', UserActivitySchema);

/**
 * Create a new user activity log entry
 */
export async function logUserActivity(
  userId: string, 
  action: string, 
  status: 'success' | 'failure' | 'warning' | 'info', 
  req?: any, 
  details?: Record<string, any>
): Promise<UserActivity> {
  try {
    // Gather basic information
    const activityData: Partial<UserActivity> = {
      userId,
      action,
      timestamp: new Date(),
      status,
      details
    };

    // If request object is provided, extract IP and user agent
    if (req) {
      // Get IP address (accounting for proxies)
      activityData.ipAddress = req.headers['x-forwarded-for'] || 
                              req.connection?.remoteAddress || 
                              req.socket?.remoteAddress || 
                              req.ip || 
                              'unknown';
      
      // Get user agent
      activityData.userAgent = req.headers['user-agent'] || 'unknown';
    }

    // Create new activity record
    const activity = new UserActivityModel(activityData);
    await activity.save();
    
    return activity;
  } catch (error) {
    console.error('Error logging user activity:', error);
    // Create a new activity with minimal info if there was an error
    const fallbackActivity = new UserActivityModel({
      userId,
      action: 'log_error', // Mark that this was a logging error
      timestamp: new Date(),
      status: 'warning',
      details: { error: String(error) }
    });
    
    try {
      await fallbackActivity.save();
    } catch (innerError) {
      console.error('Failed to save fallback activity log:', innerError);
    }
    
    return fallbackActivity;
  }
}

/**
 * Get recent activity for a user
 */
export async function getUserActivity(
  userId: string, 
  limit: number = 50, 
  actionFilter?: string[]
): Promise<UserActivity[]> {
  try {
    let query = UserActivityModel.find({ userId });
    
    // Apply action filter if provided
    if (actionFilter && actionFilter.length > 0) {
      query = query.where('action').in(actionFilter);
    }
    
    // Sort by timestamp descending (newest first) and limit results
    return await query.sort({ timestamp: -1 }).limit(limit).exec();
  } catch (error) {
    console.error('Error getting user activity:', error);
    return [];
  }
}

/**
 * Get login history for a user
 */
export async function getUserLoginHistory(
  userId: string, 
  limit: number = 10
): Promise<UserActivity[]> {
  return getUserActivity(userId, limit, ['login', 'login_attempt']);
}