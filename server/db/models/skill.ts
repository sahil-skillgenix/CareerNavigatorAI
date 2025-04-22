import mongoose, { Schema, Document } from "mongoose";

// Interface for SFIA mapping
interface SfiaMapping {
  category: string;
  skill: string;
  level: number;
  description: string;
}

// Interface for DigComp mapping
interface DigCompMapping {
  area: string;
  competence: string;
  proficiencyLevel: number;
  description: string;
}

// Interface for leveling criteria
interface LevelingCriteria {
  level: number;
  description: string;
  examples: string[];
  assessmentMethods: string[];
}

// Interface for Skill document
export interface SkillDocument extends Document {
  id: number;
  name: string;
  category: string;
  description: string;
  sfiaMapping: SfiaMapping;
  digCompMapping: DigCompMapping;
  levelingCriteria: LevelingCriteria[];
  relatedSkills: number[];
  demandTrend: string;
  futureRelevance: string;
  learningDifficulty: string;
  prerequisites: number[];
  createdAt: Date;
  updatedAt: Date;
}

// Schema for SFIA mapping
const SfiaMappingSchema = new Schema<SfiaMapping>({
  category: { type: String, required: true },
  skill: { type: String, required: true },
  level: { type: Number, required: true, min: 1, max: 7 },
  description: { type: String, required: true }
});

// Schema for DigComp mapping
const DigCompMappingSchema = new Schema<DigCompMapping>({
  area: { type: String, required: true },
  competence: { type: String, required: true },
  proficiencyLevel: { type: Number, required: true, min: 1, max: 8 },
  description: { type: String, required: true }
});

// Schema for leveling criteria
const LevelingCriteriaSchema = new Schema<LevelingCriteria>({
  level: { type: Number, required: true },
  description: { type: String, required: true },
  examples: [{ type: String }],
  assessmentMethods: [{ type: String }]
});

// Schema for Skills
const SkillSchema = new Schema<SkillDocument>(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    sfiaMapping: { type: SfiaMappingSchema },
    digCompMapping: { type: DigCompMappingSchema },
    levelingCriteria: [LevelingCriteriaSchema],
    relatedSkills: [{ type: Number, ref: "Skill" }],
    demandTrend: { 
      type: String, 
      required: true, 
      enum: ["increasing", "stable", "decreasing"] 
    },
    futureRelevance: { type: String, required: true },
    learningDifficulty: { 
      type: String, 
      required: true, 
      enum: ["low", "medium", "high"]
    },
    prerequisites: [{ type: Number, ref: "Skill" }]
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
export default mongoose.models.Skill || mongoose.model<SkillDocument>("Skill", SkillSchema);