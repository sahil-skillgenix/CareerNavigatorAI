import mongoose, { Schema, Document } from "mongoose";

// Interface for UserProgress document
export interface UserProgressDocument extends Document {
  userId: string;
  type: string;
  title: string;
  description: string;
  relatedItemId?: string;
  analysisId?: string;
  skillId?: string;
  currentLevel?: string;
  targetLevel?: string;
  progress: number;
  milestones?: string[];
  notes?: string;
  updatedAt: Date;
}

// Schema for UserProgress
const UserProgressSchema = new Schema<UserProgressDocument>(
  {
    userId: { type: String, required: true, ref: "User" },
    type: { type: String, required: true, enum: ["career_pathway", "skill_acquisition", "learning_path", "goal"] },
    title: { type: String, required: true },
    description: { type: String, required: true },
    relatedItemId: { type: String },
    analysisId: { type: String, ref: "CareerAnalysis" },
    skillId: { type: String, ref: "Skill" },
    currentLevel: { type: String },
    targetLevel: { type: String },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    milestones: [{ type: String }],
    notes: { type: String },
    updatedAt: { type: Date, default: Date.now }
  },
  { 
    timestamps: { createdAt: true, updatedAt: true },
    // Don't use any virtual ID field or automatic ID creation
    // Just rely on MongoDB's native _id handling
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString(); // Convert MongoDB ObjectId to string
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Ensure the model is only registered once
export default mongoose.models.UserProgress || mongoose.model<UserProgressDocument>("UserProgress", UserProgressSchema);