import mongoose, { Schema, Document } from "mongoose";

// Interface for UserActivity document
export interface UserActivityDocument extends Document {
  userId: string;
  activityType: string;
  details?: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  timestamp: Date;
}

// Schema for UserActivity
const UserActivitySchema = new Schema<UserActivityDocument>(
  {
    userId: { type: String, required: true, ref: "User" },
    activityType: { 
      type: String, 
      required: true, 
      enum: [
        "login", 
        "logout", 
        "registration", 
        "password_reset", 
        "career_analysis_created",
        "career_analysis_viewed",
        "learning_resources_searched",
        "organization_pathway_searched",
        "profile_updated",
        "badge_earned",
        "progress_updated",
        "pdf_downloaded"
      ] 
    },
    details: { type: Schema.Types.Mixed },
    userAgent: { type: String },
    ipAddress: { type: String },
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

// Create index on userId and timestamp for faster queries
UserActivitySchema.index({ userId: 1, timestamp: -1 });

// Create TTL index to automatically delete activity logs after 90 days
UserActivitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Ensure the model is only registered once
export default mongoose.models.UserActivity || mongoose.model<UserActivityDocument>("UserActivity", UserActivitySchema);