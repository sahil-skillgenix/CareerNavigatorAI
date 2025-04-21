import mongoose, { Document, Schema } from 'mongoose';
import { LearningResource } from '@shared/schema';

// Define LearningResource document interface that extends Document
export interface LearningResourceDocument extends Document {
  skillId: mongoose.Types.ObjectId;
  title: string;
  provider: string;
  type: string;
  url: string;
  description: string;
  estimatedHours: number;
  difficulty: string;
  costType: string;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

// Define LearningResource schema
const learningResourceSchema = new Schema<LearningResourceDocument>(
  {
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    title: { type: String, required: true },
    provider: { type: String, required: true },
    type: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String, required: true },
    estimatedHours: { type: Number, required: true },
    difficulty: { type: String, required: true },
    costType: { type: String, required: true },
    rating: { type: Number, required: true, default: 0 },
  },
  { 
    timestamps: true, 
    versionKey: false 
  }
);

// Create the LearningResource model
const LearningResourceModel = mongoose.models.LearningResource || 
  mongoose.model<LearningResourceDocument>('LearningResource', learningResourceSchema);

export default LearningResourceModel;