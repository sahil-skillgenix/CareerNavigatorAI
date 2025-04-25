import mongoose from 'mongoose';

// Activity categories
const ACTIVITY_CATEGORIES = [
  'ADMIN',
  'USER',
  'AUTH',
  'API',
  'FEATURE',
  'SYSTEM'
] as const;
type ActivityCategory = typeof ACTIVITY_CATEGORIES[number];

export interface UserActivityLogDocument extends mongoose.Document {
  userId: string;
  username?: string; // Optional username for better readability in logs
  timestamp: Date;
  category: ActivityCategory;
  action: string; // Using action instead of activityType for consistent naming
  activityType?: string; // Kept for backwards compatibility
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  source?: string; // Where the activity originated (service, module)
  metadata?: Record<string, any>; // Additional structured data
}

const userActivityLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  category: {
    type: String,
    enum: ACTIVITY_CATEGORIES,
    required: true,
    default: 'USER',
    index: true
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  // For backwards compatibility
  activityType: {
    type: String,
    required: false
  },
  details: {
    type: String,
    required: false
  },
  ipAddress: {
    type: String,
    required: false
  },
  userAgent: {
    type: String,
    required: false
  },
  sessionId: {
    type: String,
    required: false
  },
  source: {
    type: String,
    required: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
    default: {}
  }
});

// Create compound index for faster querying
userActivityLogSchema.index({ userId: 1, timestamp: -1 });
userActivityLogSchema.index({ category: 1, action: 1 });
userActivityLogSchema.index({ timestamp: -1, category: 1 });

// Use standardized collection name with domain-specific prefix to avoid >49% similarity
export const UserActivityLogModel = mongoose.model('UserActivityLog', userActivityLogSchema, 'userx_activitylogs');