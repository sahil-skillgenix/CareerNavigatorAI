/**
 * Feature Limits model for controlling usage limits of features
 */

import mongoose from 'mongoose';
import { PREFIXES } from '../../services/verify-collection-name.js';

// Define schema
const featureLimitsSchema = new mongoose.Schema({
  // Feature key (unique identifier)
  featureKey: {
    type: String,
    required: true,
    unique: true,
    index: true,
    description: 'Unique identifier for the feature'
  },

  // User role or plan this limit applies to
  applicableTo: {
    type: String,
    required: true,
    enum: ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE', 'ADMIN', 'ALL'],
    default: 'ALL',
    description: 'User role or plan this limit applies to'
  },
  
  // Description of the feature
  description: {
    type: String,
    required: true,
    description: 'Description of the feature'
  },

  // Daily usage limit
  dailyLimit: {
    type: Number,
    default: -1, // -1 means unlimited
    description: 'Maximum daily usage (-1 for unlimited)'
  },

  // Monthly usage limit
  monthlyLimit: {
    type: Number,
    default: -1, // -1 means unlimited
    description: 'Maximum monthly usage (-1 for unlimited)'
  },

  // Total usage limit
  totalLimit: {
    type: Number,
    default: -1, // -1 means unlimited
    description: 'Maximum lifetime usage (-1 for unlimited)'
  },

  // Minimum time between uses (in seconds)
  throttleSeconds: {
    type: Number,
    default: 0,
    description: 'Minimum time between uses in seconds (0 for no throttling)'
  },

  // Whether the feature is enabled
  isEnabled: {
    type: Boolean,
    default: true,
    description: 'Whether the feature is enabled'
  },

  // Feature priority (lower number = higher priority)
  priority: {
    type: Number,
    default: 100,
    description: 'Priority of the feature (lower = higher priority)'
  },

  // Unit cost of usage (for billing or credit systems)
  unitCost: {
    type: Number,
    default: 0,
    description: 'Unit cost of using this feature (for billing)'
  },

  // When the feature limits were last updated
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    description: 'User who last updated this feature limit'
  }
}, {
  timestamps: true,
  collection: PREFIXES.SYSTEM + 'featurelimits' // Use standardized collection name
});

// Create query helpers
featureLimitsSchema.query.byFeature = function(featureKey) {
  return this.where({ featureKey });
};

featureLimitsSchema.query.forRole = function(role) {
  return this.where({
    $or: [
      { applicableTo: role },
      { applicableTo: 'ALL' }
    ]
  });
};

featureLimitsSchema.query.enabled = function() {
  return this.where({ isEnabled: true });
};

// Static methods
featureLimitsSchema.statics.getFeatureLimit = async function(featureKey, role) {
  const limits = await this.find({
    featureKey,
    $or: [
      { applicableTo: role },
      { applicableTo: 'ALL' }
    ],
    isEnabled: true
  }).sort({ priority: 1 }).limit(1);
  
  return limits.length > 0 ? limits[0] : null;
};

// Create the model
const FeatureLimits = mongoose.model('FeatureLimits', featureLimitsSchema);

export default FeatureLimits;