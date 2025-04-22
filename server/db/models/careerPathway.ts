import mongoose, { Schema, Document } from "mongoose";

// Interface for pathway steps
interface PathwayStep {
  step: number;
  roleId: number;
  timeframe: string;
  description: string;
  requiredSkills: number[];
}

// Interface for Career Pathway document
export interface CareerPathwayDocument extends Document {
  id: number;
  name: string;
  description: string;
  startingRoleId: number;
  targetRoleId: number;
  estimatedTimeYears: number;
  steps: PathwayStep[];
  alternativeRoutes: {
    name: string;
    description: string;
    steps: PathwayStep[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema for pathway steps
const PathwayStepSchema = new Schema<PathwayStep>({
  step: { type: Number, required: true },
  roleId: { type: Number, ref: "Role", required: true },
  timeframe: { type: String, required: true },
  description: { type: String, required: true },
  requiredSkills: [{ type: Number, ref: "Skill" }]
});

// Schema for alternative routes
const AlternativeRouteSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  steps: [PathwayStepSchema]
});

// Schema for Career Pathways
const CareerPathwaySchema = new Schema<CareerPathwayDocument>(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    startingRoleId: { type: Number, ref: "Role", required: true },
    targetRoleId: { type: Number, ref: "Role", required: true },
    estimatedTimeYears: { type: Number, required: true },
    steps: [PathwayStepSchema],
    alternativeRoutes: [AlternativeRouteSchema]
  },
  { 
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Ensure the model is only registered once
export default mongoose.models.CareerPathway || mongoose.model<CareerPathwayDocument>("CareerPathway", CareerPathwaySchema);