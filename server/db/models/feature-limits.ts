import mongoose from 'mongoose';

export interface FeatureLimitsDocument extends mongoose.Document {
  maxCareerAnalysesPerUser: number;
  maxSkillsPerAnalysis: number;
  enableAIRecommendations: boolean;
  enablePdfExport: boolean;
  enableBulkImport: boolean;
  maxLearningResourcesPerSkill: number;
  maxConcurrentUsers: number;
  lastUpdatedBy?: string;
  lastUpdatedAt: Date;
}

const featureLimitsSchema = new mongoose.Schema({
  maxCareerAnalysesPerUser: {
    type: Number,
    required: true,
    default: 5,
    min: 1,
    max: 100
  },
  maxSkillsPerAnalysis: {
    type: Number,
    required: true,
    default: 20,
    min: 5,
    max: 50
  },
  enableAIRecommendations: {
    type: Boolean,
    required: true,
    default: true
  },
  enablePdfExport: {
    type: Boolean,
    required: true,
    default: true
  },
  enableBulkImport: {
    type: Boolean,
    required: true,
    default: false
  },
  maxLearningResourcesPerSkill: {
    type: Number,
    required: true,
    default: 10,
    min: 1,
    max: 30
  },
  maxConcurrentUsers: {
    type: Number,
    required: true,
    default: 100,
    min: 10,
    max: 1000
  },
  lastUpdatedBy: {
    type: String,
    required: false
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }
});

// Use standardized collection name with clear prefix
export const FeatureLimitsModel = mongoose.model('FeatureLimits', featureLimitsSchema, 'skillgenix_featurelimit');