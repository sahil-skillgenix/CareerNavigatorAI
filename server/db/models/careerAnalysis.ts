import mongoose, { Schema, Document } from "mongoose";

// Interface for Career Analysis result
interface CareerAnalysisResult {
  executiveSummary: string;
  skillMapping: any;
  skillGapAnalysis: any;
  careerPathway: any;
  developmentPlan: any;
  similarRoles: any[];
  socialSkillsDevelopment: any;
  qualityReview: string;
}

// Interface for Career Analysis document
export interface CareerAnalysisDocument extends Document {
  id: string;
  userId: string;
  professionalLevel: string;
  currentSkills: string;
  educationalBackground: string;
  careerHistory: string;
  desiredRole: string;
  state: string;
  country: string;
  result: CareerAnalysisResult;
  progress: number;
  badges: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema for Career Analysis result
const CareerAnalysisResultSchema = new Schema({
  executiveSummary: { type: String },
  skillMapping: { type: Schema.Types.Mixed },
  skillGapAnalysis: { type: Schema.Types.Mixed },
  careerPathway: { type: Schema.Types.Mixed },
  developmentPlan: { type: Schema.Types.Mixed },
  similarRoles: [{ type: Schema.Types.Mixed }],
  socialSkillsDevelopment: { type: Schema.Types.Mixed },
  qualityReview: { type: String }
});

// Schema for Career Analysis
const CareerAnalysisSchema = new Schema<CareerAnalysisDocument>(
  {
    userId: { type: String, required: true, ref: "User" },
    professionalLevel: { type: String, required: true },
    currentSkills: { type: String, required: true },
    educationalBackground: { type: String, required: true },
    careerHistory: { type: String, required: true },
    desiredRole: { type: String, required: true },
    state: { type: String },
    country: { type: String },
    result: { type: CareerAnalysisResultSchema },
    progress: { type: Number, default: 0 },
    badges: [{ type: String }]
  },
  { 
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Ensure the model is only registered once
export default mongoose.models.CareerAnalysis || mongoose.model<CareerAnalysisDocument>("CareerAnalysis", CareerAnalysisSchema);