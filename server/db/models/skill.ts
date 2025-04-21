import mongoose, { Document, Schema } from 'mongoose';
import { Skill } from '@shared/schema';

// Define Skill document interface that extends Document
export interface SkillDocument extends Document {
  name: string;
  category: string;
  description: string;
  difficulty: string;
  timeToLearn: string;
  popularity: number;
  futureDemand: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define Skill schema
const skillSchema = new Schema<SkillDocument>(
  {
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, required: true },
    timeToLearn: { type: String, required: true },
    popularity: { type: Number, required: true, default: 0 },
    futureDemand: { type: String, required: true },
  },
  { 
    timestamps: true, 
    versionKey: false 
  }
);

// Create the Skill model
const SkillModel = mongoose.models.Skill || mongoose.model<SkillDocument>('Skill', skillSchema);

export default SkillModel;