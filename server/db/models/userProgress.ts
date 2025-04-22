import mongoose, { Schema, Document } from "mongoose";

// Interface for UserProgress document
export interface UserProgressDocument extends Document {
  id: string;
  userId: string;
  analysisId: string;
  skillId: string;
  currentLevel: string;
  targetLevel: string;
  progress: number;
  notes: string;
  updatedAt: Date;
}

// Schema for UserProgress
const UserProgressSchema = new Schema<UserProgressDocument>(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, ref: "User" },
    analysisId: { type: String, ref: "CareerAnalysis" },
    skillId: { type: String, ref: "Skill" },
    currentLevel: { type: String },
    targetLevel: { type: String },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    notes: { type: String },
    updatedAt: { type: Date, default: Date.now }
  },
  { 
    timestamps: { createdAt: false, updatedAt: true },
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
export default mongoose.models.UserProgress || mongoose.model<UserProgressDocument>("UserProgress", UserProgressSchema);