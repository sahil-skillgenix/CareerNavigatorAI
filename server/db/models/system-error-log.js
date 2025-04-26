/**
 * System Error Log model for storing application errors
 */

import mongoose from 'mongoose';
import { PREFIXES } from '../../services/verify-collection-name.js';

// Define schema
const systemErrorLogSchema = new mongoose.Schema({
  // Error message
  message: {
    type: String,
    required: true,
    description: 'Error message'
  },
  
  // Error code (if available)
  code: {
    type: String,
    description: 'Error code'
  },
  
  // Error stack trace
  stack: {
    type: String,
    description: 'Stack trace of the error'
  },
  
  // Component where the error occurred
  component: {
    type: String,
    description: 'System component where the error occurred',
    index: true
  },
  
  // Metadata/context for the error
  context: {
    type: mongoose.Schema.Types.Mixed,
    description: 'Additional context information for the error'
  },
  
  // Severity level
  severity: {
    type: String,
    enum: ['CRITICAL', 'ERROR', 'WARNING', 'INFO'],
    default: 'ERROR',
    index: true,
    description: 'Severity level of the error'
  },
  
  // When the error occurred
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
    description: 'When the error occurred'
  },
  
  // User ID (if error occurred in user context)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    description: 'User ID if error occurred in user context'
  },
  
  // Request information
  request: {
    type: mongoose.Schema.Types.Mixed,
    description: 'Request information if error occurred during API call'
  },
  
  // Environment information
  environment: {
    type: String,
    enum: ['production', 'staging', 'development', 'test'],
    default: process.env.NODE_ENV || 'development',
    description: 'Environment where the error occurred'
  }
}, {
  timestamps: true,
  collection: PREFIXES.SYSTEM + 'errorlogs' // Use standardized collection name
});

// Add indices for common queries
systemErrorLogSchema.index({ timestamp: -1 });
systemErrorLogSchema.index({ severity: 1, timestamp: -1 });
systemErrorLogSchema.index({ component: 1, timestamp: -1 });

// Create query helpers
systemErrorLogSchema.query.byComponent = function(component) {
  return this.where({ component });
};

systemErrorLogSchema.query.bySeverity = function(severity) {
  return this.where({ severity });
};

systemErrorLogSchema.query.recent = function(limit = 50) {
  return this.sort({ timestamp: -1 }).limit(limit);
};

systemErrorLogSchema.query.timeRange = function(startDate, endDate) {
  return this.where({
    timestamp: {
      $gte: startDate,
      $lte: endDate
    }
  });
};

// Create the model
const SystemErrorLog = mongoose.model('SystemErrorLog', systemErrorLogSchema);

export default SystemErrorLog;