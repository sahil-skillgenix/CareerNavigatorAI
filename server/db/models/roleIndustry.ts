import mongoose, { Document, Schema } from 'mongoose';
import { RoleIndustry } from '@shared/schema';

// Define RoleIndustry document interface that extends Document
export interface RoleIndustryDocument extends Document {
  roleId: mongoose.Types.ObjectId;
  industryId: mongoose.Types.ObjectId;
  prevalence: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define RoleIndustry schema
const roleIndustrySchema = new Schema<RoleIndustryDocument>(
  {
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    industryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: true },
    prevalence: { type: String, required: true },
  },
  { 
    timestamps: true, 
    versionKey: false 
  }
);

// Create compound index for unique role-industry pairs
roleIndustrySchema.index({ roleId: 1, industryId: 1 }, { unique: true });

// Create the RoleIndustry model
const RoleIndustryModel = mongoose.models.RoleIndustry || mongoose.model<RoleIndustryDocument>('RoleIndustry', roleIndustrySchema);

export default RoleIndustryModel;