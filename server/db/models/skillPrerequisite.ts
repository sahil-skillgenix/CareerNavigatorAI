import mongoose, { Document, Schema } from 'mongoose';
import { SkillPrerequisite } from '@shared/schema';

// Define SkillPrerequisite document interface that extends Document
export interface SkillPrerequisiteDocument extends Document {
  skillId: mongoose.Types.ObjectId;
  prerequisiteId: mongoose.Types.ObjectId;
  importance: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define SkillPrerequisite schema
const skillPrerequisiteSchema = new Schema<SkillPrerequisiteDocument>(
  {
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    prerequisiteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    importance: { type: String, required: true },
  },
  { 
    timestamps: true, 
    versionKey: false 
  }
);

// Create compound index for unique skill-prerequisite pairs
skillPrerequisiteSchema.index({ skillId: 1, prerequisiteId: 1 }, { unique: true });

// Create the SkillPrerequisite model
const SkillPrerequisiteModel = mongoose.models.SkillPrerequisite || 
  mongoose.model<SkillPrerequisiteDocument>('SkillPrerequisite', skillPrerequisiteSchema);

export default SkillPrerequisiteModel;