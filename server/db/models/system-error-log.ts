import mongoose from 'mongoose';

// Define severity levels
const ERROR_SEVERITY = ['low', 'medium', 'high', 'critical'] as const;
type ErrorSeverity = typeof ERROR_SEVERITY[number];

// Error categories
const ERROR_CATEGORIES = [
  'database', 
  'authentication', 
  'authorization', 
  'api', 
  'network', 
  'system', 
  'unknown'
] as const;
type ErrorCategory = typeof ERROR_CATEGORIES[number];

export interface SystemErrorLogDocument extends mongoose.Document {
  timestamp: Date;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  source?: string;
  request?: any;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
  metadata?: Record<string, any>;
}

const systemErrorLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  message: {
    type: String,
    required: true
  },
  stack: {
    type: String,
    required: false
  },
  severity: {
    type: String,
    enum: ERROR_SEVERITY,
    required: true,
    default: 'medium'
  },
  category: {
    type: String,
    enum: ERROR_CATEGORIES,
    required: true,
    default: 'unknown'
  },
  source: {
    type: String,
    required: false
  },
  request: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  userId: {
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
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date,
    required: false
  },
  resolvedBy: {
    type: String,
    required: false
  },
  resolution: {
    type: String,
    required: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    required: false,
    default: {}
  }
});

// Index for faster searching and filtering
systemErrorLogSchema.index({ timestamp: -1 });
systemErrorLogSchema.index({ severity: 1 });
systemErrorLogSchema.index({ category: 1 });
systemErrorLogSchema.index({ userId: 1 });
systemErrorLogSchema.index({ resolved: 1 });

export const SystemErrorLogModel = mongoose.model('systemErrorLog', systemErrorLogSchema);