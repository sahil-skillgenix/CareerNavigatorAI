import mongoose, { Document, Schema } from 'mongoose';

export interface FeatureLimit {
  _id?: string;
  name: string;
  description: string;
  defaultLimit: number;
  defaultFrequency: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

const FeatureLimitSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    unique: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  defaultLimit: { 
    type: Number, 
    required: true 
  },
  defaultFrequency: { 
    type: String, 
    required: true 
  },
  active: { 
    type: Boolean, 
    default: true, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  createdBy: { 
    type: String,
    ref: 'User', 
    required: true 
  },
  updatedBy: { 
    type: String,
    ref: 'User', 
    required: true 
  }
}, {
  versionKey: false
});

// Export model methods
export const find = (query: any = {}) => mongoose.models.FeatureLimit?.find(query) || [];
export const findOne = (query: any = {}) => mongoose.models.FeatureLimit?.findOne(query) || null;
export const findById = (id: string) => mongoose.models.FeatureLimit?.findById(id) || null;
export const countDocuments = (query: any = {}) => mongoose.models.FeatureLimit?.countDocuments(query) || 0;
export const findOneAndUpdate = (query: any, update: any, options: any = {}) => 
  mongoose.models.FeatureLimit?.findOneAndUpdate(query, update, options) || null;
export const deleteOne = (query: any) => mongoose.models.FeatureLimit?.deleteOne(query) || null;

// Use the mongoose model constructor and define it
const FeatureLimitModel = mongoose.models.FeatureLimit || 
  mongoose.model<FeatureLimit & Document>('FeatureLimit', FeatureLimitSchema);

export default FeatureLimitModel;