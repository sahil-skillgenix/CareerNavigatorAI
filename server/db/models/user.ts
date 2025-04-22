import mongoose, { Schema, Document } from "mongoose";

// Interface for User document
export interface UserDocument extends Document {
  fullName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for User
const UserSchema = new Schema<UserDocument>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id; // Map _id to id for consistency with our schema
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