import mongoose, { Schema, Document } from "mongoose";

// Interface for key skills
interface KeySkill {
  skillId: number;
  importance: string;
}

// Interface for top roles
interface TopRole {
  roleId: number;
  prevalence: string;
}

// Interface for Industry document
export interface IndustryDocument extends Document {
  id: number;
  name: string;
  description: string;
  category: string;
  trendDescription: string;
  growthOutlook: string;
  keySkills: KeySkill[];
  topRoles: TopRole[];
  disruptiveTechnologies: string[];
  regulations: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema for key skills
const KeySkillSchema = new Schema<KeySkill>({
  skillId: { type: Number, required: true, ref: "Skill" },
  importance: { type: String, required: true, enum: ["critical", "important", "helpful"] }
});

// Schema for top roles
const TopRoleSchema = new Schema<TopRole>({
  roleId: { type: Number, required: true, ref: "Role" },
  prevalence: { type: String, required: true, enum: ["high", "medium", "low"] }
});

// Schema for Industries
const IndustrySchema = new Schema<IndustryDocument>(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    trendDescription: { type: String, required: true },
    growthOutlook: { 
      type: String, 
      required: true, 
      enum: ["high growth", "moderate growth", "stable", "declining"] 
    },
    keySkills: [KeySkillSchema],
    topRoles: [TopRoleSchema],
    disruptiveTechnologies: [{ type: String }],
    regulations: [{ type: String }]
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

// Ensure the model is only registered once with standardized collection name
export default mongoose.models.Industry || mongoose.model<IndustryDocument>("Industry", IndustrySchema, "skillgenix_industry");