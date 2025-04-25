import mongoose, { Schema, Document } from "mongoose";

// Interface for RoleIndustry document
export interface RoleIndustryDocument extends Document {
  roleId: number;
  industryId: number;
  prevalence: string; // "high", "medium", "low"
  notes: string;
  specializations: string;
  createdAt: Date;
}

// Schema for RoleIndustry
const RoleIndustrySchema = new Schema<RoleIndustryDocument>(
  {
    roleId: { type: Number, ref: "Role", required: true },
    industryId: { type: Number, ref: "Industry", required: true },
    prevalence: { 
      type: String, 
      required: true, 
      enum: ["high", "medium", "low"] 
    },
    notes: { type: String },
    specializations: { type: String }
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
RoleIndustrySchema.index({ roleId: 1, industryId: 1 }, { unique: true });

// Ensure the model is only registered once
export default mongoose.models.RoleIndustry || mongoose.model<RoleIndustryDocument>("RoleIndustry", RoleIndustrySchema, "skillgenix_roleindustry");