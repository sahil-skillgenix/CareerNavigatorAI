import mongoose, { Document, Schema } from 'mongoose';
import { Role } from '@shared/schema';

// Define Role document interface that extends Document
export interface RoleDocument extends Document {
  title: string;
  category: string;
  description: string;
  averageSalary: number;
  entryLevelSalary: number;
  seniorLevelSalary: number;
  education: string;
  experience: string;
  popularity: number;
  createdAt: Date;
  updatedAt: Date;
}

// Define Role schema
const roleSchema = new Schema<RoleDocument>(
  {
    title: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    averageSalary: { type: Number, required: true, default: 0 },
    entryLevelSalary: { type: Number, required: true, default: 0 },
    seniorLevelSalary: { type: Number, required: true, default: 0 },
    education: { type: String, required: true },
    experience: { type: String, required: true },
    popularity: { type: Number, required: true, default: 0 },
  },
  { 
    timestamps: true, 
    versionKey: false 
  }
);

// Create the Role model
const RoleModel = mongoose.models.Role || mongoose.model<RoleDocument>('Role', roleSchema);

export default RoleModel;