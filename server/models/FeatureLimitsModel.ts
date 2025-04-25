import mongoose, { Document, Schema } from 'mongoose';

export interface FeatureLimits extends Document {
  name: string;
  description: string;
  defaultLimit: number;
  defaultFrequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'total';
  userTiers: {
    free: number;
    basic: number;
    premium: number;
    enterprise: number;
  };
  overridable: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFeatureOverride extends Document {
  userId: string;
  featureName: string;
  limit: number;
  reason: string;
  expiresAt?: Date;
  createdAt: Date;
  createdBy: string;
}

const FeatureLimitsSchema = new Schema<FeatureLimits>({
  name: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  defaultLimit: { type: Number, required: true },
  defaultFrequency: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'total']
  },
  userTiers: {
    free: { type: Number, required: true },
    basic: { type: Number, required: true },
    premium: { type: Number, required: true },
    enterprise: { type: Number, required: true }
  },
  overridable: { type: Boolean, default: true },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  collection: 'featureLimits'
});

const UserFeatureOverrideSchema = new Schema<UserFeatureOverride>({
  userId: { type: String, required: true },
  featureName: { type: String, required: true },
  limit: { type: Number, required: true },
  reason: { type: String, required: true },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'userFeatureOverrides'
});

// Create a compound index for userId + featureName for fast lookups
UserFeatureOverrideSchema.index({ userId: 1, featureName: 1 }, { unique: true });

export const FeatureLimitsModel = mongoose.model<FeatureLimits>('FeatureLimits', FeatureLimitsSchema);
export const UserFeatureOverrideModel = mongoose.model<UserFeatureOverride>('UserFeatureOverride', UserFeatureOverrideSchema);

/**
 * Get all feature limits
 */
export async function getAllFeatureLimits(): Promise<FeatureLimits[]> {
  return FeatureLimitsModel.find().sort({ name: 1 });
}

/**
 * Get a feature limit by name
 */
export async function getFeatureLimit(name: string): Promise<FeatureLimits | null> {
  return FeatureLimitsModel.findOne({ name });
}

/**
 * Update a feature limit
 */
export async function updateFeatureLimit(
  name: string,
  updates: Partial<FeatureLimits>
): Promise<FeatureLimits | null> {
  // Add updatedAt date
  if (!updates.updatedAt) {
    updates.updatedAt = new Date();
  }
  
  return FeatureLimitsModel.findOneAndUpdate(
    { name },
    { $set: updates },
    { new: true }
  );
}

/**
 * Create a new feature limit
 */
export async function createFeatureLimit(
  data: Omit<FeatureLimits, 'createdAt' | 'updatedAt' | '_id'>
): Promise<FeatureLimits> {
  const featureLimit = new FeatureLimitsModel(data);
  await featureLimit.save();
  return featureLimit;
}

/**
 * Get user's limit for a specific feature
 */
export async function getUserFeatureLimit(
  userId: string,
  featureName: string,
  userTier: 'free' | 'basic' | 'premium' | 'enterprise' = 'free'
): Promise<number> {
  // First check if there's a user-specific override
  const override = await UserFeatureOverrideModel.findOne({
    userId,
    featureName,
    // Only get overrides that haven't expired
    $or: [
      { expiresAt: { $gt: new Date() } },
      { expiresAt: null }
    ]
  });
  
  if (override) {
    return override.limit;
  }
  
  // No override, get the default limit for the user's tier
  const featureLimit = await FeatureLimitsModel.findOne({ name: featureName });
  
  if (!featureLimit) {
    // Feature not found, return a default high limit
    return 1000;
  }
  
  // Return the limit for the user's tier
  return featureLimit.userTiers[userTier];
}

/**
 * Add a user-specific feature limit override
 */
export async function setUserFeatureOverride(
  userId: string,
  featureName: string,
  limit: number,
  reason: string,
  adminId: string,
  expiresAt?: Date
): Promise<UserFeatureOverride> {
  // Find existing override or create a new one
  const override = await UserFeatureOverrideModel.findOneAndUpdate(
    { userId, featureName },
    {
      $set: {
        limit,
        reason,
        expiresAt,
        createdBy: adminId,
        createdAt: new Date()
      }
    },
    { upsert: true, new: true }
  );
  
  if (!override) {
    // If no document was returned, create a new one manually 
    // (this should not happen because of upsert, but just in case)
    const newOverride = new UserFeatureOverrideModel({
      userId,
      featureName,
      limit,
      reason,
      expiresAt,
      createdBy: adminId
    });
    await newOverride.save();
    return newOverride;
  }
  
  return override;
}

/**
 * Remove a user-specific feature limit override
 */
export async function removeUserFeatureOverride(
  userId: string,
  featureName: string
): Promise<boolean> {
  const result = await UserFeatureOverrideModel.deleteOne({
    userId,
    featureName
  });
  
  return result.deletedCount > 0;
}

/**
 * Initialize default feature limits if they don't exist
 */
export async function initializeDefaultFeatureLimits(): Promise<void> {
  const defaultLimits = [
    {
      name: 'careerAnalysis',
      description: 'Number of career analyses a user can generate',
      defaultLimit: 3,
      defaultFrequency: 'monthly' as const,
      userTiers: {
        free: 3,
        basic: 10,
        premium: 30,
        enterprise: 100
      },
      overridable: true,
      active: true
    },
    {
      name: 'careerPathway',
      description: 'Number of career pathways a user can generate',
      defaultLimit: 5,
      defaultFrequency: 'monthly' as const,
      userTiers: {
        free: 5,
        basic: 15,
        premium: 50,
        enterprise: 150
      },
      overridable: true,
      active: true
    },
    {
      name: 'organizationPathway',
      description: 'Number of organization pathways a user can generate',
      defaultLimit: 2,
      defaultFrequency: 'monthly' as const,
      userTiers: {
        free: 2,
        basic: 5,
        premium: 15,
        enterprise: 50
      },
      overridable: true,
      active: true
    },
    {
      name: 'learningResources',
      description: 'Number of learning resource recommendations a user can generate',
      defaultLimit: 10,
      defaultFrequency: 'monthly' as const,
      userTiers: {
        free: 10,
        basic: 30,
        premium: 100,
        enterprise: 250
      },
      overridable: true,
      active: true
    }
  ];

  // Loop through default limits and create or update them
  for (const limit of defaultLimits) {
    const existing = await FeatureLimitsModel.findOne({ name: limit.name });
    
    if (!existing) {
      await createFeatureLimit(limit);
    }
  }
}