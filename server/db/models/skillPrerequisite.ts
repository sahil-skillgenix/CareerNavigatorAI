import mongoose, { Schema, Document } from "mongoose";

// Interface for SkillPrerequisite document
export interface SkillPrerequisiteDocument extends Document {
  skillId: number;
  prerequisiteId: number;
  importance: string; // "required", "recommended", "helpful"
  notes: string;
  createdAt: Date;
}

// Schema for SkillPrerequisite
const SkillPrerequisiteSchema = new Schema<SkillPrerequisiteDocument>(
  {
    skillId: { type: Number, ref: "Skill", required: true },
    prerequisiteId: { type: Number, ref: "Skill", required: true },
    importance: { 
      type: String, 
      required: true, 
      enum: ["required", "recommended", "helpful"] 
    },
    notes: { type: String }
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
SkillPrerequisiteSchema.index({ skillId: 1, prerequisiteId: 1 }, { unique: true });

// Ensure the model is only registered once
export default mongoose.models.SkillPrerequisite || mongoose.model<SkillPrerequisiteDocument>("SkillPrerequisite", SkillPrerequisiteSchema, "skillgenix_skillprerequisite");