import mongoose, { Schema, Document } from "mongoose";

// Interface for RoleSkill document
export interface RoleSkillDocument extends Document {
  roleId: number;
  skillId: number;
  importance: string; // "high", "medium", "low"
  levelRequired: number; // 1-5
  context: string;
  createdAt: Date;
}

// Schema for RoleSkill
const RoleSkillSchema = new Schema<RoleSkillDocument>(
  {
    roleId: { type: Number, ref: "Role", required: true },
    skillId: { type: Number, ref: "Skill", required: true },
    importance: { 
      type: String, 
      required: true, 
      enum: ["high", "medium", "low"] 
    },
    levelRequired: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5 
    },
    context: { type: String }
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
RoleSkillSchema.index({ roleId: 1, skillId: 1 }, { unique: true });

// Ensure the model is only registered once
export default mongoose.models.RoleSkill || mongoose.model<RoleSkillDocument>("RoleSkill", RoleSkillSchema, "skillgenix_roleskill");