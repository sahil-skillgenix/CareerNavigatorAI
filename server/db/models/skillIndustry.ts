import mongoose, { Document, Schema } from 'mongoose';
import { SkillIndustry } from '@shared/schema';

// Define SkillIndustry document interface that extends Document
export interface SkillIndustryDocument extends Document {
  skillId: mongoose.Types.ObjectId;
  industryId: mongoose.Types.ObjectId;
  importance: string;
  trendDirection: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define SkillIndustry schema
const skillIndustrySchema = new Schema<SkillIndustryDocument>(
  {
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    industryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: true },
    importance: { type: String, required: true },
    trendDirection: { type: String, required: true },
  },
  { 
    timestamps: true, 
    versionKey: false 
  }
);

// Create compound index for unique skill-industry pairs
skillIndustrySchema.index({ skillId: 1, industryId: 1 }, { unique: true });

// Create the SkillIndustry model
const SkillIndustryModel = mongoose.models.SkillIndustry || mongoose.model<SkillIndustryDocument>('SkillIndustry', skillIndustrySchema);

export default SkillIndustryModel;