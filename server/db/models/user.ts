import mongoose, { Schema, Document } from "mongoose";

// Interface for User document
export interface UserDocument extends Document {
  fullName: string;
  email: string;
  password: string;
  role: string;
  status: string;
  securityQuestion?: string;
  securityAnswer?: string;
  createdAt: Date;
  updatedAt: Date;
  location?: string;
  phone?: string;
  bio?: string;
  currentRole?: string;
  experience?: string[];
  education?: string[];
  skills?: string[];
  interests?: string[];
  avatarUrl?: string;
}

// Schema for User
const UserSchema = new Schema<UserDocument>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    status: { type: String, enum: ['active', 'restricted', 'suspended', 'deleted'], default: 'active' },
    securityQuestion: { type: String },
    securityAnswer: { type: String },
    location: { type: String },
    phone: { type: String },
    bio: { type: String },
    currentRole: { type: String },
    experience: { type: [String] },
    education: { type: [String] },
    skills: { type: [String] },
    interests: { type: [String] },
    avatarUrl: { type: String }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id.toString(); // Convert MongoDB ObjectId to string
        delete ret.__v;
        delete ret.password; // Don't expose password in JSON
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
export default mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);