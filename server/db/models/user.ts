import mongoose, { Schema, Document } from "mongoose";

// Interface for User document
export interface UserDocument extends Document {
  id: string;
  fullName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for User
const UserSchema = new Schema<UserDocument>(
  {
    id: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        delete ret.password; // Don't expose password in JSON
        return ret;
      }
    }
  }
);

// Ensure the model is only registered once
export default mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);