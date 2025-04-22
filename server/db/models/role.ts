import mongoose, { Schema, Document } from "mongoose";

// Interface for skill requirements
interface SkillRequirement {
  skillId: number;
  importance: string;
  levelRequired: number;
}

// Interface for career path
interface CareerPath {
  next: number[];
  previous: number[];
}

// Interface for Role document
export interface RoleDocument extends Document {
  id: number;
  title: string;
  description: string;
  category: string;
  averageSalary: string;
  educationRequirements: string[];
  experienceRequirements: string[];
  skillRequirements: SkillRequirement[];
  careerPath: CareerPath;
  demandOutlook: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for skill requirements
const SkillRequirementSchema = new Schema<SkillRequirement>({
  skillId: { type: Number, required: true, ref: "Skill" },
  importance: { type: String, required: true, enum: ["high", "medium", "low"] },
  levelRequired: { type: Number, required: true, min: 1, max: 5 }
});

// Schema for career path
const CareerPathSchema = new Schema<CareerPath>({
  next: [{ type: Number, ref: "Role" }],
  previous: [{ type: Number, ref: "Role" }]
});

// Schema for Roles
const RoleSchema = new Schema<RoleDocument>(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    averageSalary: { type: String, required: true },
    educationRequirements: [{ type: String }],
    experienceRequirements: [{ type: String }],
    skillRequirements: [SkillRequirementSchema],
    careerPath: { type: CareerPathSchema, required: true },
    demandOutlook: { type: String, required: true }
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
export default mongoose.models.Role || mongoose.model<RoleDocument>("Role", RoleSchema);