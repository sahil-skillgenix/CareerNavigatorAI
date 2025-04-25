import mongoose, { Schema, Document } from "mongoose";

// Interface for SkillIndustry document
export interface SkillIndustryDocument extends Document {
  skillId: number;
  industryId: number;
  importance: string; // "critical", "important", "helpful"
  trendDirection: string; // "increasing", "stable", "decreasing"
  contextualApplication: string;
  createdAt: Date;
}

// Schema for SkillIndustry
const SkillIndustrySchema = new Schema<SkillIndustryDocument>(
  {
    skillId: { type: Number, ref: "Skill", required: true },
    industryId: { type: Number, ref: "Industry", required: true },
    importance: { 
      type: String, 
      required: true, 
      enum: ["critical", "important", "helpful"] 
    },
    trendDirection: { 
      type: String, 
      required: true, 
      enum: ["increasing", "stable", "decreasing"] 
    },
    contextualApplication: { type: String }
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

// Compound index for uniqueness
SkillIndustrySchema.index({ skillId: 1, industryId: 1 }, { unique: true });

// Ensure the model is only registered once
export default mongoose.models.SkillIndustry || mongoose.model<SkillIndustryDocument>("SkillIndustry", SkillIndustrySchema, "skillgenix_skillindustry");