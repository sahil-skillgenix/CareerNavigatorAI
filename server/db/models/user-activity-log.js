/**
 * User Activity Log model for tracking all user actions in the system
 */

import mongoose from 'mongoose';
import { PREFIXES } from '../../services/verify-collection-name.js';

// Define schema
const userActivityLogSchema = new mongoose.Schema({
  // Required fields
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true, 
    description: 'User ID for the activity' 
  },
  
  // Action performed (required)
  action: { 
    type: String, 
    required: true,
    index: true,
    description: 'Action/event type performed by the user'
  },
  
  // For backward compatibility (old field name)
  activityType: {
    type: String,
    description: 'Legacy field for action (backward compatibility)',
    set: function(val) {
      // Also set the new 'action' field if it's not already set
      if (val && !this.action) this.action = val;
      return val;
    }
  },
  
  // Category of activity
  category: {
    type: String,
    enum: ['ADMIN', 'USER', 'AUTH', 'API', 'FEATURE', 'SYSTEM'],
    default: 'USER',
    index: true,
    description: 'Category of activity (for filtering)'
  },
  
  // For backward compatibility (old field name)
  activityCategory: {
    type: String,
    description: 'Legacy field for category (backward compatibility)',
    set: function(val) {
      // Also set the new 'category' field if it's not already set
      if (val && !this.category) this.category = val;
      return val;
    }
  },
  
  // Timestamp when action occurred
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
    description: 'When the activity occurred'
  },
  
  // For backward compatibility (old field name)
  createdAt: {
    type: Date,
    description: 'Legacy field for timestamp (backward compatibility)',
    set: function(val) {
      // Also set the new 'timestamp' field if it's not already set
      if (val && !this.timestamp) this.timestamp = val;
      return val;
    }
  },
  
  // Details/payload of the activity
  details: {
    type: mongoose.Schema.Types.Mixed,
    description: 'Additional details or payload for the activity'
  },
  
  // For backward compatibility (old field names)
  data: {
    type: mongoose.Schema.Types.Mixed,
    description: 'Legacy field for details (backward compatibility)',
    set: function(val) {
      // Also set the new 'details' field if it's not already set
      if (val && !this.details) this.details = val;
      return val;
    }
  },
  
  // IP address (optional)
  ipAddress: {
    type: String,
    description: 'IP address from which the activity originated'
  },
  
  // User agent (optional)
  userAgent: {
    type: String,
    description: 'User agent information'
  },
  
  // Activity status
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'WARNING', 'INFO'],
    default: 'SUCCESS',
    description: 'Status of the activity'
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: PREFIXES.USER + 'activitylogs' // Use standardized collection name
});

// Add indices for common queries
userActivityLogSchema.index({ userId: 1, timestamp: -1 });
userActivityLogSchema.index({ action: 1, timestamp: -1 });
userActivityLogSchema.index({ category: 1, timestamp: -1 });

// Create query helpers
userActivityLogSchema.query.byUser = function(userId) {
  return this.where({ userId });
};

userActivityLogSchema.query.byAction = function(action) {
  return this.where({ action });
};

userActivityLogSchema.query.byCategory = function(category) {
  return this.where({ category });
};

userActivityLogSchema.query.recent = function(limit = 50) {
  return this.sort({ timestamp: -1 }).limit(limit);
};

userActivityLogSchema.query.timeRange = function(startDate, endDate) {
  return this.where({
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

// Add backwards compatibility for querying either old or new field names
const originalFind = userActivityLogSchema.query.find;
userActivityLogSchema.query.find = function(conditions, ...args) {
  // Map old field names to new ones in queries
  if (conditions) {
    if (conditions.activityType && !conditions.action) {
      conditions.action = conditions.activityType;
    }
    if (conditions.activityCategory && !conditions.category) {
      conditions.category = conditions.activityCategory;
    }
    if (conditions.createdAt && !conditions.timestamp) {
      conditions.timestamp = conditions.createdAt;
    }
    if (conditions.data && !conditions.details) {
      conditions.details = conditions.data;
    }
  }
  
  return originalFind.call(this, conditions, ...args);
};

// Create the model
const UserActivityLog = mongoose.model('UserActivityLog', userActivityLogSchema);

export default UserActivityLog;