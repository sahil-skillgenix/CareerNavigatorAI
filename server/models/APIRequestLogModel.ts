import mongoose, { Document } from 'mongoose';

// Request status types
export type RequestStatus = 'success' | 'error' | 'timeout' | 'invalid';

// API request log interface
export interface APIRequestLog {
  id?: string;
  endpoint: string;
  method: string;
  status: number;
  requestStatus: RequestStatus;
  userId?: string;
  timestamp: Date;
  duration: number; // in milliseconds
  requestSize?: number; // in bytes
  responseSize?: number; // in bytes
  userAgent?: string;
  ipAddress?: string;
  queryParams?: Record<string, any>;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

// MongoDB document interface
export interface APIRequestLogDocument extends Omit<APIRequestLog, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// Schema definition
const APIRequestLogSchema = new mongoose.Schema<APIRequestLogDocument>({
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  status: { type: Number, required: true },
  requestStatus: { 
    type: String, 
    enum: ['success', 'error', 'timeout', 'invalid'],
    required: true
  },
  userId: { type: String },
  timestamp: { type: Date, default: Date.now, required: true },
  duration: { type: Number, required: true }, // in milliseconds
  requestSize: { type: Number }, // in bytes
  responseSize: { type: Number }, // in bytes
  userAgent: { type: String },
  ipAddress: { type: String },
  queryParams: { type: mongoose.Schema.Types.Mixed },
  requestHeaders: { type: mongoose.Schema.Types.Mixed },
  responseHeaders: { type: mongoose.Schema.Types.Mixed },
  errorMessage: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true
});

// Indexes for faster queries
APIRequestLogSchema.index({ timestamp: -1 });
APIRequestLogSchema.index({ endpoint: 1 });
APIRequestLogSchema.index({ method: 1 });
APIRequestLogSchema.index({ status: 1 });
APIRequestLogSchema.index({ requestStatus: 1 });
APIRequestLogSchema.index({ userId: 1 });

// Virtual for id
APIRequestLogSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Model configuration
APIRequestLogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
  }
});

// Create and export the model
export const APIRequestLogModel = mongoose.model<APIRequestLogDocument>(
  'APIRequestLog', 
  APIRequestLogSchema
);