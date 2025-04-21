import mongoose, { Document, Schema } from 'mongoose';
import { CareerAnalysis } from '@shared/schema';

// Define Career Analysis document interface extending Document
export interface CareerAnalysisDocument extends Document {
  userId: mongoose.Types.ObjectId | string;
  professionalLevel: string;
  currentSkills: string;
  educationalBackground: string;
  careerHistory: string;
  desiredRole: string;
  state?: string;
  country?: string;
  result: any; // Stores the complete analysis JSON
  progress: number;
  badges: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Define Career Analysis schema
const careerAnalysisSchema = new Schema<CareerAnalysisDocument>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    professionalLevel: { type: String, required: true },
    currentSkills: { type: String, required: true },
    educationalBackground: { type: String, required: true },
    careerHistory: { type: String, required: true },
    desiredRole: { type: String, required: true },
    state: { type: String },
    country: { type: String },
    result: { type: Schema.Types.Mixed, required: true },
    progress: { type: Number, default: 0 },
    badges: [{ type: String }],
  },
  { 
    timestamps: true, 
    versionKey: false 
  }
);

// Create the Career Analysis model
const CareerAnalysisModel = mongoose.models.CareerAnalysis || 
  mongoose.model<CareerAnalysisDocument>('CareerAnalysis', careerAnalysisSchema);

export default CareerAnalysisModel;