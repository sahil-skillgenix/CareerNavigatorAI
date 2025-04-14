import mongoose, { Document, Schema } from 'mongoose';
import { User } from '@shared/schema';

// Define User document interface that extends Document
export interface UserDocument extends Document {
  fullName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define User schema
const userSchema = new Schema<UserDocument>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
  },
  { 
    timestamps: true, 
    versionKey: false 
  }
);

// Create the User model
const UserModel = mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);

export default UserModel;