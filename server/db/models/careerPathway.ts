import mongoose, { Document, Schema } from 'mongoose';
import { CareerPathway } from '@shared/schema';

// Define CareerPathway document interface that extends Document
export interface CareerPathwayDocument extends Document {
  name: string;
  description: string;
  startingRoleId: mongoose.Types.ObjectId;
  targetRoleId: mongoose.Types.ObjectId;
  estimatedTimeMonths: number;
  difficultyLevel: string;
  requiredEducation: string;
  stepsJson: string;
  popularity: number;
  createdAt: Date;
  updatedAt: Date;
}

// Define CareerPathway schema
const careerPathwaySchema = new Schema<CareerPathwayDocument>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    startingRoleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    targetRoleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    estimatedTimeMonths: { type: Number, required: true },
    difficultyLevel: { type: String, required: true },
    requiredEducation: { type: String, required: true },
    stepsJson: { type: String, required: true },
    popularity: { type: Number, required: true, default: 0 },
  },
  { 
    timestamps: true, 
    versionKey: false 
  }
);

// Create the CareerPathway model
const CareerPathwayModel = mongoose.models.CareerPathway || 
  mongoose.model<CareerPathwayDocument>('CareerPathway', careerPathwaySchema);

export default CareerPathwayModel;