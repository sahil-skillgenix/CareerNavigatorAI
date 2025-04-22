import mongoose, { Schema, Document } from "mongoose";

// Interface for LearningResource document
export interface LearningResourceDocument extends Document {
  id: string;
  title: string;
  type: string;
  provider: string;
  url: string;
  description: string;
  skillId: number;
  difficulty: string;
  estimatedHours: number;
  costType: string;
  cost: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  relevanceScore: number;
  matchReason: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for Learning Resources
const LearningResourceSchema = new Schema<LearningResourceDocument>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    type: { 
      type: String, 
      required: true,
      enum: [
        "course", 
        "book", 
        "tutorial", 
        "video", 
        "podcast", 
        "article", 
        "practice", 
        "certification"
      ] 
    },
    provider: { type: String, required: true },
    url: { type: String },
    description: { type: String, required: true },
    skillId: { type: Number, ref: "Skill", required: true },
    difficulty: { 
      type: String, 
      required: true, 
      enum: ["beginner", "intermediate", "advanced", "expert"] 
    },
    estimatedHours: { type: Number },
    costType: { 
      type: String, 
      required: true, 
      enum: ["free", "freemium", "paid", "subscription"] 
    },
    cost: { type: String },
    tags: [{ type: String }],
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 },
    relevanceScore: { type: Number, min: 1, max: 10, default: 5 },
    matchReason: { type: String }
  },
  { 
    timestamps: true,
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
export default mongoose.models.LearningResource || mongoose.model<LearningResourceDocument>("LearningResource", LearningResourceSchema);