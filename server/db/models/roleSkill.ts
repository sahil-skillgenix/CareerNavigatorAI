import mongoose, { Document, Schema } from 'mongoose';
import { RoleSkill } from '@shared/schema';

// Define RoleSkill document interface that extends Document
export interface RoleSkillDocument extends Document {
  roleId: mongoose.Types.ObjectId;
  skillId: mongoose.Types.ObjectId;
  importance: string;
  levelRequired: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define RoleSkill schema
const roleSkillSchema = new Schema<RoleSkillDocument>(
  {
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
    skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
    importance: { type: String, required: true },
    levelRequired: { type: String, required: true },
  },
  { 
    timestamps: true, 
    versionKey: false 
  }
);

// Create compound index for unique role-skill pairs
roleSkillSchema.index({ roleId: 1, skillId: 1 }, { unique: true });

// Create the RoleSkill model
const RoleSkillModel = mongoose.models.RoleSkill || mongoose.model<RoleSkillDocument>('RoleSkill', roleSkillSchema);

export default RoleSkillModel;