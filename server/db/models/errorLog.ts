import mongoose, { Schema, Document } from "mongoose";

// Interface for ErrorLog document
export interface ErrorLogDocument extends Document {
  level: string;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
  endpoint?: string;
  requestBody?: Record<string, any>;
  requestMethod?: string;
  statusCode?: number;
  responseTime?: number;
  timestamp: Date;
}

// Schema for ErrorLog
const ErrorLogSchema = new Schema<ErrorLogDocument>(
  {
    level: { type: String, required: true, enum: ["error", "warn", "info", "debug"] },
    message: { type: String, required: true },
    stack: { type: String },
    context: { type: Schema.Types.Mixed },
    userId: { type: String },
    userAgent: { type: String },
    ipAddress: { type: String },
    endpoint: { type: String },
    requestBody: { type: Schema.Types.Mixed },
    requestMethod: { type: String },
    statusCode: { type: Number },
    responseTime: { type: Number },
    timestamp: { type: Date, default: Date.now }
  },
  { 
    timestamps: false,
    // Use MongoDB's native _id without additional virtual fields
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString(); // Convert MongoDB ObjectId to string
        delete ret.__v;
        return ret;
      }
    },
    // Disable additional id fields
    id: false,
    _id: true
  }
);

// Create TTL index to automatically delete logs after 30 days
ErrorLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Ensure the model is only registered once
export default mongoose.models.ErrorLog || mongoose.model<ErrorLogDocument>("ErrorLog", ErrorLogSchema, "skillgenix_errorlog");