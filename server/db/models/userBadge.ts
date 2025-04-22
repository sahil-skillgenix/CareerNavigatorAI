import mongoose, { Schema, Document } from "mongoose";

// Interface for UserBadge document
export interface UserBadgeDocument extends Document {
  id: string;
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
    id: { type: String, required: true, unique: true },
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
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Ensure the model is only registered once
export default mongoose.models.UserBadge || mongoose.model<UserBadgeDocument>("UserBadge", UserBadgeSchema);