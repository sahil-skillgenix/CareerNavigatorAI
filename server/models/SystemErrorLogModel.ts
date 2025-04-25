import mongoose, { Document } from 'mongoose';

// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

// Error categories
export type ErrorCategory = 
  | 'auth'
  | 'database'
  | 'api'
  | 'client'
  | 'server'
  | 'security'
  | 'validation'
  | 'integration'
  | 'performance'
  | 'other';

// Error log interface
export interface SystemErrorLog {
  id?: string;
  message: string;
  stack?: string;
  code?: string;
  timestamp: Date;
  severity: ErrorSeverity;
  category: ErrorCategory;
  endpoint?: string;
  method?: string;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
  metadata: Record<string, any>;
}

// MongoDB document interface
export interface SystemErrorLogDocument extends Omit<SystemErrorLog, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// Schema definition
const SystemErrorLogSchema = new mongoose.Schema<SystemErrorLogDocument>({
  message: { type: String, required: true },
  stack: { type: String },
  code: { type: String },
  timestamp: { type: Date, default: Date.now, required: true },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium',
    required: true 
  },
  category: { 
    type: String, 
    enum: ['auth', 'database', 'api', 'client', 'server', 'security', 'validation', 'integration', 'performance', 'other'], 
    default: 'other',
    required: true 
  },
  endpoint: { type: String },
  method: { type: String },
  userId: { type: String },
  userAgent: { type: String },
  ipAddress: { type: String },
  resolved: { type: Boolean, default: false, required: true },
  resolvedAt: { type: Date },
  resolvedBy: { type: String },
  resolution: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, {
  timestamps: true
});

// Indexes for faster queries
SystemErrorLogSchema.index({ timestamp: -1 });
SystemErrorLogSchema.index({ severity: 1 });
SystemErrorLogSchema.index({ category: 1 });
SystemErrorLogSchema.index({ resolved: 1 });
SystemErrorLogSchema.index({ userId: 1 });

// Virtual for id
SystemErrorLogSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Model configuration
SystemErrorLogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
  }
});

// Create and export the model
export const SystemErrorLogModel = mongoose.model<SystemErrorLogDocument>(
  'SystemErrorLog', 
  SystemErrorLogSchema
);