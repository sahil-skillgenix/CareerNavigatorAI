import mongoose, { Schema, Document } from "mongoose";

// Interface for APIRequestLog document
export interface APIRequestLogDocument extends Document {
  endpoint: string;
  method: string;
  userId?: string;
  statusCode: number;
  responseTimeMs: number;
  userAgent?: string;
  ipAddress?: string;
  queryParams?: Record<string, any>;
  requestBody?: Record<string, any>;
  timestamp: Date;
}

// Schema for APIRequestLog
const APIRequestLogSchema = new Schema<APIRequestLogDocument>(
  {
    endpoint: { type: String, required: true },
    method: { type: String, required: true },
    userId: { type: String, ref: "User" },
    statusCode: { type: Number, required: true },
    responseTimeMs: { type: Number, required: true },
    userAgent: { type: String },
    ipAddress: { type: String },
    queryParams: { type: Schema.Types.Mixed },
    requestBody: { type: Schema.Types.Mixed },
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

// Create indexes for faster queries
APIRequestLogSchema.index({ endpoint: 1, timestamp: -1 });
APIRequestLogSchema.index({ userId: 1, timestamp: -1 });
APIRequestLogSchema.index({ statusCode: 1, timestamp: -1 });

// Create TTL index to automatically delete API logs after 30 days
APIRequestLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Ensure the model is only registered once
export default mongoose.models.APIRequestLog || mongoose.model<APIRequestLogDocument>("APIRequestLog", APIRequestLogSchema);