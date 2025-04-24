import mongoose, { Schema, Document } from "mongoose";

// Interface for UserBadge document
export interface UserBadgeDocument extends Document {
  userId: string;
  name: string;
  description: string;
  category: string;
  level: number;
  icon: string;
  earnedAt: Date;
}

// Schema for UserBadge
const UserBadgeSchema = new Schema<UserBadgeDocument>(
  {
    userId: { type: String, required: true, ref: "User" },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: Number, default: 1 },
    icon: { type: String },
    earnedAt: { type: Date, default: Date.now }
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
    // IMPORTANT: This disables creating additional id fields
    id: false,
    // Disable the automatic id virtual getter/setter
    _id: true
  }
);

// Ensure the model is only registered once
export default mongoose.models.UserBadge || mongoose.model<UserBadgeDocument>("UserBadge", UserBadgeSchema);