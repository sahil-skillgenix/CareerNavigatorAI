import mongoose, { Document, Schema } from 'mongoose';

export interface FeatureLimits extends Document {
  featureName: string;
  defaultLimit: number;
  description: string;
  updatedAt: Date;
  updatedBy?: string;
}

// Define feature limits schema
const FeatureLimitsSchema = new Schema<FeatureLimits>({
  featureName: { 
    type: String, 
    required: true,
    unique: true 
  },
  defaultLimit: { 
    type: Number, 
    required: true,
    min: 0
  },
  description: { 
    type: String, 
    required: true 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedBy: { 
    type: String 
  }
});

// Create indices for faster lookups
FeatureLimitsSchema.index({ featureName: 1 });

// Create feature limits model
export const FeatureLimitsModel = mongoose.model<FeatureLimits>('FeatureLimits', FeatureLimitsSchema);

// Default feature limits
const DEFAULT_FEATURE_LIMITS = [
  {
    featureName: 'careerPathway',
    defaultLimit: 10,
    description: 'Number of career pathway analyses a user can generate'
  },
  {
    featureName: 'organizationPathway',
    defaultLimit: 5,
    description: 'Number of organization pathway analyses a user can generate'
  },
  {
    featureName: 'learningResources',
    defaultLimit: 20,
    description: 'Number of learning resource recommendations a user can generate'
  },
  {
    featureName: 'skillAssessment',
    defaultLimit: 15,
    description: 'Number of skill assessments a user can perform'
  },
  {
    featureName: 'pdfExport',
    defaultLimit: 10,
    description: 'Number of PDF exports a user can generate'
  }
];

/**
 * Seed the feature limits collection with default values if empty
 */
export async function seedFeatureLimits(): Promise<void> {
  try {
    // Check if collection is empty
    const count = await FeatureLimitsModel.countDocuments();
    
    if (count === 0) {
      // Insert default feature limits
      await FeatureLimitsModel.insertMany(
        DEFAULT_FEATURE_LIMITS.map(limit => ({
          ...limit,
          updatedAt: new Date()
        }))
      );
      
      console.log('Feature limits seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding feature limits:', error);
  }
}

/**
 * Get all feature limits
 */
export async function getAllFeatureLimits(): Promise<FeatureLimits[]> {
  try {
    return await FeatureLimitsModel.find().sort({ featureName: 1 }).exec();
  } catch (error) {
    console.error('Error getting feature limits:', error);
    return [];
  }
}

/**
 * Get feature limit by name
 */
export async function getFeatureLimit(featureName: string): Promise<FeatureLimits | null> {
  try {
    return await FeatureLimitsModel.findOne({ featureName });
  } catch (error) {
    console.error(`Error getting feature limit for ${featureName}:`, error);
    return null;
  }
}

/**
 * Update feature limit
 */
export async function updateFeatureLimit(
  featureName: string,
  newLimit: number,
  description: string,
  updatedBy: string
): Promise<FeatureLimits | null> {
  try {
    // Ensure limit is not negative
    const safeLimit = Math.max(0, newLimit);
    
    const updated = await FeatureLimitsModel.findOneAndUpdate(
      { featureName },
      {
        defaultLimit: safeLimit,
        description,
        updatedAt: new Date(),
        updatedBy
      },
      { new: true, upsert: true }
    );
    
    return updated;
  } catch (error) {
    console.error(`Error updating feature limit for ${featureName}:`, error);
    return null;
  }
}

/**
 * Get user's limit for a specific feature
 * Takes into account both global defaults and user-specific restrictions
 */
export async function getUserFeatureLimit(
  userId: string,
  featureName: string,
  getUserFunc: (id: string) => Promise<any>
): Promise<number> {
  try {
    // Get global feature limit
    const featureLimit = await getFeatureLimit(featureName);
    const globalLimit = featureLimit?.defaultLimit || 0;
    
    // Get user details to check for restrictions
    const user = await getUserFunc(userId);
    
    if (!user) {
      return 0; // User not found
    }
    
    // If user has specific restrictions, use those instead
    if (user.restrictions && typeof user.restrictions[`${featureName}Limit`] === 'number') {
      return user.restrictions[`${featureName}Limit`];
    }
    
    // Otherwise return global limit
    return globalLimit;
  } catch (error) {
    console.error(`Error getting user feature limit for ${featureName}:`, error);
    return 0;
  }
}