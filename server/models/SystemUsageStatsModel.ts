import mongoose, { Document, Schema } from 'mongoose';

export interface SystemUsageStats {
  date: Date;
  users: {
    signups: number;
    activeUsers: number;
    loginCount: number;
  };
  api: {
    totalRequests: number;
    successCount: number;
    errorCount: number;
    avgResponseTime: number;
  };
  features: {
    careerAnalysisCount: number;
    careerPathwayCount: number;
    organizationPathwayCount: number;
    skillSearchCount: number;
    roleSearchCount: number;
    industrySearchCount: number;
    learningResourcesCount: number;
  };
  errors: {
    criticalCount: number;
    errorCount: number;
    warningCount: number;
  };
  _id?: any;
}

// Define a Document type that avoids the conflict
export interface SystemUsageStatsDocument extends SystemUsageStats, Omit<Document, 'errors'> {
  // This interface just combines the fields while avoiding the conflict
}

const SystemUsageStatsSchema = new Schema<SystemUsageStats>({
  date: { type: Date, required: true, default: Date.now, index: true },
  
  users: {
    signups: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    loginCount: { type: Number, default: 0 }
  },
  
  api: {
    totalRequests: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 }
  },
  
  features: {
    careerAnalysisCount: { type: Number, default: 0 },
    careerPathwayCount: { type: Number, default: 0 },
    organizationPathwayCount: { type: Number, default: 0 },
    skillSearchCount: { type: Number, default: 0 },
    roleSearchCount: { type: Number, default: 0 },
    industrySearchCount: { type: Number, default: 0 },
    learningResourcesCount: { type: Number, default: 0 }
  },
  
  errors: {
    criticalCount: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 },
    warningCount: { type: Number, default: 0 }
  }
}, {
  collection: 'systemUsageStats'
});

export const SystemUsageStatsModel = mongoose.model<SystemUsageStats>('SystemUsageStats', SystemUsageStatsSchema);

/**
 * Increment a specific usage statistic
 */
export async function incrementUsageStat(
  statPath: string,
  incrementBy: number = 1
): Promise<boolean> {
  // Get today's date with time set to midnight for consistent day tracking
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Find or create today's stats record
  let todayStats = await SystemUsageStatsModel.findOne({ date: today });
  
  if (!todayStats) {
    todayStats = new SystemUsageStatsModel({ date: today });
    await todayStats.save();
  }
  
  // Construct update object with the nested path
  const updateObj: any = {};
  updateObj[statPath] = incrementBy;
  
  // Update the specified statistic
  const result = await SystemUsageStatsModel.updateOne(
    { _id: todayStats._id },
    { $inc: updateObj }
  );
  
  return result.modifiedCount > 0;
}

/**
 * Record user signup
 */
export async function recordSignup(): Promise<boolean> {
  return incrementUsageStat('users.signups');
}

/**
 * Record active user login
 */
export async function recordLogin(): Promise<boolean> {
  // Increment both active users and login count
  await incrementUsageStat('users.activeUsers');
  return incrementUsageStat('users.loginCount');
}

/**
 * Record API request
 */
export async function recordApiRequest(
  success: boolean,
  responseTime: number
): Promise<boolean> {
  // Update total requests
  await incrementUsageStat('api.totalRequests');
  
  // Update success or error count
  if (success) {
    await incrementUsageStat('api.successCount');
  } else {
    await incrementUsageStat('api.errorCount');
  }
  
  // Update average response time
  // This is an approximation as a proper average would require more complex calculations
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const stats = await SystemUsageStatsModel.findOne({ date: today });
  if (stats) {
    const currentAvg = stats.api.avgResponseTime;
    const currentTotal = stats.api.totalRequests;
    
    // Calculate new average: ((currentAvg * (totalRequests-1)) + newValue) / totalRequests
    const newAvg = ((currentAvg * (currentTotal - 1)) + responseTime) / currentTotal;
    
    await SystemUsageStatsModel.updateOne(
      { _id: stats._id },
      { $set: { 'api.avgResponseTime': newAvg } }
    );
  }
  
  return true;
}

/**
 * Record feature usage
 */
export async function recordFeatureUsage(
  feature: keyof SystemUsageStats['features']
): Promise<boolean> {
  return incrementUsageStat(`features.${feature}`);
}

/**
 * Record error occurrence
 */
export async function recordError(
  level: 'critical' | 'error' | 'warning'
): Promise<boolean> {
  return incrementUsageStat(`errors.${level}Count`);
}

/**
 * Get usage stats for a date range
 */
export async function getUsageStats(
  startDate: Date,
  endDate: Date
): Promise<SystemUsageStats[]> {
  return SystemUsageStatsModel.find({
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
}

/**
 * Get aggregated usage stats for a time period
 */
export async function getAggregatedStats(
  days: number = 30
): Promise<{
  totalSignups: number;
  activeUsers: number;
  totalLogins: number;
  apiRequests: number;
  apiSuccessRate: number;
  avgResponseTime: number;
  featureUsage: Record<string, number>;
  errorRates: {
    critical: number;
    error: number;
    warning: number;
  };
  dailyStats: Array<{
    date: string;
    signups: number;
    activeUsers: number;
  }>;
}> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  cutoffDate.setHours(0, 0, 0, 0);
  
  // Get all stats for the period
  const stats = await SystemUsageStatsModel.find({
    date: { $gte: cutoffDate }
  }).sort({ date: 1 });
  
  if (stats.length === 0) {
    return {
      totalSignups: 0,
      activeUsers: 0,
      totalLogins: 0,
      apiRequests: 0,
      apiSuccessRate: 0,
      avgResponseTime: 0,
      featureUsage: {
        careerAnalysisCount: 0,
        careerPathwayCount: 0,
        organizationPathwayCount: 0,
        skillSearchCount: 0,
        roleSearchCount: 0,
        industrySearchCount: 0,
        learningResourcesCount: 0
      },
      errorRates: {
        critical: 0,
        error: 0,
        warning: 0
      },
      dailyStats: []
    };
  }
  
  // Calculate totals
  let totalSignups = 0;
  let activeUsers = 0;
  let totalLogins = 0;
  let apiRequests = 0;
  let apiSuccess = 0;
  let apiErrors = 0;
  let responseTimeSum = 0;
  let responseTimeCount = 0;
  
  const featureUsage = {
    careerAnalysisCount: 0,
    careerPathwayCount: 0,
    organizationPathwayCount: 0,
    skillSearchCount: 0,
    roleSearchCount: 0,
    industrySearchCount: 0,
    learningResourcesCount: 0
  };
  
  const errorRates = {
    critical: 0,
    error: 0,
    warning: 0
  };
  
  const dailyStats: Array<{
    date: string;
    signups: number;
    activeUsers: number;
  }> = [];
  
  // Sum up all the data
  stats.forEach(day => {
    totalSignups += day.users.signups;
    activeUsers = Math.max(activeUsers, day.users.activeUsers); // Use highest active user count
    totalLogins += day.users.loginCount;
    
    apiRequests += day.api.totalRequests;
    apiSuccess += day.api.successCount;
    apiErrors += day.api.errorCount;
    
    if (day.api.avgResponseTime > 0 && day.api.totalRequests > 0) {
      responseTimeSum += day.api.avgResponseTime * day.api.totalRequests;
      responseTimeCount += day.api.totalRequests;
    }
    
    // Feature usage
    Object.keys(featureUsage).forEach(key => {
      featureUsage[key as keyof typeof featureUsage] += day.features[key as keyof typeof featureUsage];
    });
    
    // Error rates
    errorRates.critical += day.errors.criticalCount;
    errorRates.error += day.errors.errorCount;
    errorRates.warning += day.errors.warningCount;
    
    // Daily stats for graphing
    dailyStats.push({
      date: day.date.toISOString().split('T')[0],
      signups: day.users.signups,
      activeUsers: day.users.activeUsers
    });
  });
  
  // Calculate success rate and average response time
  const apiSuccessRate = apiRequests > 0 ? (apiSuccess / apiRequests) * 100 : 0;
  const avgResponseTime = responseTimeCount > 0 ? responseTimeSum / responseTimeCount : 0;
  
  return {
    totalSignups,
    activeUsers,
    totalLogins,
    apiRequests,
    apiSuccessRate,
    avgResponseTime,
    featureUsage,
    errorRates,
    dailyStats
  };
}