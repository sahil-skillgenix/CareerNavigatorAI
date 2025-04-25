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
  timestamp: Date;
  category: ActivityCategory;
  action: string; // Using action instead of activityType for consistent naming
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

const userActivityLogSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
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

// Use standardized collection name with clear prefix to avoid duplicates (all lowercase)
export const UserActivityLogModel = mongoose.model('UserActivityLog', userActivityLogSchema, 'skillgenix_useractivitylog');