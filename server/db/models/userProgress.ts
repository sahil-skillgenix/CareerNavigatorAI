import mongoose, { Document, Schema } from 'mongoose';
import { UserProgress } from '@shared/schema';

// Define User Progress document interface extending Document
export interface UserProgressDocument extends Document {
  userId: mongoose.Types.ObjectId | string;
  analysisId?: mongoose.Types.ObjectId | string;
  skillId?: mongoose.Types.ObjectId | string;
  currentLevel?: string;
  targetLevel?: string;
  progress: number;
  notes?: string;
  updatedAt: Date;
}

// Define User Progress schema
const userProgressSchema = new Schema<UserProgressDocument>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    analysisId: { 
      type: Schema.Types.ObjectId, 
      ref: 'CareerAnalysis' 
    },
    skillId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Skill' 
    },
    currentLevel: { type: String },
    targetLevel: { type: String },
    progress: { type: Number, default: 0 },
    notes: { type: String },
    updatedAt: { type: Date, default: Date.now }
  },
  { 
    timestamps: { createdAt: false, updatedAt: true },
    versionKey: false 
  }
);

// Create the User Progress model
const UserProgressModel = mongoose.models.UserProgress || 
  mongoose.model<UserProgressDocument>('UserProgress', userProgressSchema);

export default UserProgressModel;