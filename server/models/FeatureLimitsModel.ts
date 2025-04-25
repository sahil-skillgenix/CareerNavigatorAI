import mongoose from 'mongoose';

// Feature limits schema definition
const featureLimitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  defaultLimit: {
    type: Number,
    required: true,
    min: 0
  },
  defaultFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'per_account'],
    default: 'monthly'
  },
  active: {
    type: Boolean,
    default: true
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
    ref: 'User'
  },
  updatedBy: {
    type: String,
    ref: 'User'
  }
}, { 
  collection: 'featureLimit', // Standardized collection name (singular)
  timestamps: true // Automatically manages createdAt and updatedAt
});

// Create the Mongoose model
const FeatureLimitsModel = mongoose.model('FeatureLimit', featureLimitSchema);

export default FeatureLimitsModel;