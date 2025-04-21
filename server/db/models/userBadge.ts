import mongoose, { Document, Schema } from 'mongoose';
import { UserBadge } from '@shared/schema';

// Define User Badge document interface extending Document
export interface UserBadgeDocument extends Document {
  userId: mongoose.Types.ObjectId | string;
  name: string;
  description: string;
  category: string;
  level: number;
  icon?: string;
  earnedAt: Date;
}

// Define User Badge schema
const userBadgeSchema = new Schema<UserBadgeDocument>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    level: { type: Number, default: 1 },
    icon: { type: String },
    earnedAt: { type: Date, default: Date.now }
  },
  { 
    versionKey: false 
  }
);

// Create the User Badge model
const UserBadgeModel = mongoose.models.UserBadge || 
  mongoose.model<UserBadgeDocument>('UserBadge', userBadgeSchema);

export default UserBadgeModel;