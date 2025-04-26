import mongoose, { Schema, Document } from "mongoose";

// Interface for Career Analysis result
interface CareerAnalysisResult {
  executiveSummary: string;
  skillMapping: any;
  skillGapAnalysis: any;
  careerPathway: any;
  developmentPlan: any;
  similarRoles: any[];
  socialSkills: any; // Renamed from socialSkillsDevelopment for consistency
  reviewNotes: any; // Renamed from qualityReview for consistency
  // Additional fields for explicit chart data
  chartData?: any;
  radarChartData?: any;
  barChartData?: any;
}

// Interface for Career Analysis document
export interface CareerAnalysisDocument extends Document {
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
  socialSkills: { type: Schema.Types.Mixed }, // Renamed from socialSkillsDevelopment
  reviewNotes: { type: Schema.Types.Mixed }, // Renamed from qualityReview
  // Additional fields for chart data
  chartData: { type: Schema.Types.Mixed },
  radarChartData: { type: Schema.Types.Mixed },
  barChartData: { type: Schema.Types.Mixed }
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
    // Use MongoDB's native _id without additional virtual fields
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString(); // Convert MongoDB ObjectId to string
        delete ret.__v;
        return ret;
      }
    },
    // IMPORTANT: This disables creating additional id fields
    id: false,
    // Disable the automatic id virtual getter/setter
    _id: true
  }
);

// Ensure the model is only registered once
export default mongoose.models.CareerAnalysis || mongoose.model<CareerAnalysisDocument>("CareerAnalysis", CareerAnalysisSchema, "skillgenix_careeranalysis");