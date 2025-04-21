import mongoose, { Document, Schema } from 'mongoose';
import { Industry } from '@shared/schema';

// Define Industry document interface that extends Document
export interface IndustryDocument extends Document {
  name: string;
  category: string;
  description: string;
  growthRate: number;
  averageSalary: number;
  jobCount: number;
  entryLevelPercentage: number;
  topCompanies: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Define Industry schema
const industrySchema = new Schema<IndustryDocument>(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    growthRate: { type: Number, required: true, default: 0 },
    averageSalary: { type: Number, required: true, default: 0 },
    jobCount: { type: Number, required: true, default: 0 },
    entryLevelPercentage: { type: Number, required: true, default: 0 },
    topCompanies: [{ type: String }],
  },
  { 
    timestamps: true, 
    versionKey: false 
  }
);

// Create the Industry model
const IndustryModel = mongoose.models.Industry || mongoose.model<IndustryDocument>('Industry', industrySchema);

export default IndustryModel;