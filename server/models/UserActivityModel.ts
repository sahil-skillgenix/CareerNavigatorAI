import mongoose, { Document } from 'mongoose';
import { UserActivityLogModel } from '../db/models';

// Possible user activity types
export type UserActivityType = 
  // Authentication activities
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'password_reset'
  | 'password_change'
  | 'email_update'
  | 'security_question_update'
  | 'profile_update'
  // Admin activities
  | 'created_admin_user'
  | 'updated_user_role'
  | 'reset_user_password'
  | 'suspended_user'
  | 'reactivated_user'
  | 'deleted_user'
  // Feature limit activities
  | 'set_feature_limit'
  | 'removed_feature_limit'
  // Career-related activities
  | 'created_career_analysis'
  | 'updated_career_progress'
  | 'completed_career_milestone'
  | 'downloaded_career_report'
  | 'searched_skills'
  | 'searched_roles'
  | 'searched_industries'
  // Data import/export activities
  | 'imported_data'
  | 'exported_data'
  // API related
  | 'api_request'
  | 'api_rate_limit_exceeded'
  // Other
  | 'other';

// User activity interface
export interface UserActivity {
  id: string;
  userId: string;
  action: UserActivityType;
  details?: string;
  timestamp: Date;
  targetUserId?: string;
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Mongoose document interface
export interface UserActivityDocument extends Omit<UserActivity, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// Mongoose schema
const userActivitySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      // Authentication
      'login_success',
      'login_failure',
      'logout',
      'password_reset',
      'password_change',
      'email_update',
      'security_question_update',
      'profile_update',
      // Admin
      'created_admin_user',
      'updated_user_role',
      'reset_user_password',
      'suspended_user',
      'reactivated_user',
      'deleted_user',
      // Feature limits
      'set_feature_limit',
      'removed_feature_limit',
      // Career-related
      'created_career_analysis',
      'updated_career_progress',
      'completed_career_milestone',
      'downloaded_career_report',
      'searched_skills',
      'searched_roles',
      'searched_industries',
      // Data import/export
      'imported_data',
      'exported_data',
      // API
      'api_request',
      'api_rate_limit_exceeded',
      // Other
      'other'
    ],
    index: true
  },
  details: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  targetUserId: {
    type: String,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
});

// Create indexes for efficient querying
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ action: 1, timestamp: -1 });

// Create model
export const UserActivityModel = mongoose.model<UserActivityDocument>(
  'UserActivity',
  userActivitySchema
);

// Function to get recent activity for a user
export async function getRecentUserActivity(
  userId: string,
  limit: number = 10
): Promise<UserActivity[]> {
  try {
    // Use the standardized UserActivityLogModel
    const activities = await UserActivityLogModel.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
    
    return activities.map((doc: any) => ({
      id: doc._id.toString(),
      userId: doc.userId,
      // Support both new and legacy field names
      action: doc.action || doc.activityType,
      details: typeof doc.details === 'string' ? doc.details : JSON.stringify(doc.details || {}),
      timestamp: doc.timestamp,
      targetUserId: doc.targetUserId,
      metadata: doc.metadata || {},
      ipAddress: doc.ipAddress || 'unknown',
      userAgent: doc.userAgent || 'unknown'
    }));
  } catch (error) {
    console.error('Error getting recent user activity:', error);
    return [];
  }
}

// Function to get activity count by type
export async function getUserActivityCount(
  userId: string,
  action?: UserActivityType,
  startDate?: Date,
  endDate?: Date
): Promise<number> {
  try {
    const query: any = { userId };
    
    if (action) {
      // Support both field names during transition
      query.$or = [
        { action: action },
        { activityType: action }
      ];
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
    
    // Use the standardized UserActivityLogModel
    return await UserActivityLogModel.countDocuments(query);
  } catch (error) {
    console.error('Error getting user activity count:', error);
    return 0;
  }
}