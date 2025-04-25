import mongoose, { Document, Schema } from 'mongoose';

export interface SystemUsageStats extends Document {
  date: string; // ISO date string YYYY-MM-DD
  registeredUsers: number;
  activeUsers: number;
  careerAnalysisCount: number;
  learningResourcesAccessed: number;
  loginCount: number;
  apiRequestCount: number;
  avgResponseTime?: number;
  errorCount: number;
}

// Define system usage stats schema
const SystemUsageStatsSchema = new Schema<SystemUsageStats>({
  date: { 
    type: String, 
    required: true,
    unique: true
  },
  registeredUsers: { 
    type: Number, 
    default: 0 
  },
  activeUsers: { 
    type: Number, 
    default: 0 
  },
  careerAnalysisCount: { 
    type: Number, 
    default: 0 
  },
  learningResourcesAccessed: { 
    type: Number, 
    default: 0 
  },
  loginCount: { 
    type: Number, 
    default: 0 
  },
  apiRequestCount: { 
    type: Number, 
    default: 0 
  },
  avgResponseTime: { 
    type: Number 
  },
  errorCount: { 
    type: Number, 
    default: 0 
  }
});

// Create date index for faster lookups
SystemUsageStatsSchema.index({ date: 1 });

// Create system usage stats model
export const SystemUsageStatsModel = mongoose.model<SystemUsageStats>('SystemUsageStats', SystemUsageStatsSchema);

/**
 * Update or create usage stats for today
 */
export async function updateTodayStats(statsUpdate: Partial<SystemUsageStats>): Promise<SystemUsageStats> {
  try {
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    // Find today's stats document
    let todayStats = await SystemUsageStatsModel.findOne({ date: today });
    
    if (todayStats) {
      // Update existing document with increments
      Object.keys(statsUpdate).forEach(key => {
        if (key !== 'date' && typeof statsUpdate[key] === 'number') {
          todayStats[key] += statsUpdate[key];
        }
      });
      
      await todayStats.save();
    } else {
      // Create new document for today
      todayStats = new SystemUsageStatsModel({
        date: today,
        ...statsUpdate
      });
      
      await todayStats.save();
    }
    
    return todayStats;
  } catch (error) {
    console.error('Error updating today stats:', error);
    throw error;
  }
}

/**
 * Increment specific stat counters for today
 */
export async function incrementStats(
  stats: {
    registeredUsers?: number;
    activeUsers?: number;
    careerAnalysisCount?: number;
    learningResourcesAccessed?: number;
    loginCount?: number;
    apiRequestCount?: number;
    errorCount?: number;
  }
): Promise<void> {
  try {
    await updateTodayStats(stats);
  } catch (error) {
    console.error('Error incrementing stats:', error);
  }
}

/**
 * Record API response time and calculate new average
 */
export async function recordApiResponseTime(responseTimeMs: number): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Find today's stats document
    let todayStats = await SystemUsageStatsModel.findOne({ date: today });
    
    if (todayStats) {
      // Update average response time
      if (todayStats.avgResponseTime) {
        // Calculate new average
        todayStats.avgResponseTime = 
          (todayStats.avgResponseTime * todayStats.apiRequestCount + responseTimeMs) / 
          (todayStats.apiRequestCount + 1);
      } else {
        // First response time of the day
        todayStats.avgResponseTime = responseTimeMs;
      }
      
      // Increment API request count
      todayStats.apiRequestCount += 1;
      
      await todayStats.save();
    } else {
      // Create new document for today
      todayStats = new SystemUsageStatsModel({
        date: today,
        apiRequestCount: 1,
        avgResponseTime: responseTimeMs
      });
      
      await todayStats.save();
    }
  } catch (error) {
    console.error('Error recording API response time:', error);
  }
}

/**
 * Get usage stats for a date range
 */
export async function getStatsForDateRange(
  startDate: string, // YYYY-MM-DD format
  endDate: string // YYYY-MM-DD format
): Promise<SystemUsageStats[]> {
  try {
    return await SystemUsageStatsModel.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 }).exec();
  } catch (error) {
    console.error('Error getting stats for date range:', error);
    return [];
  }
}

/**
 * Get usage stats summary for a date range
 */
export async function getStatsSummary(
  startDate: string, // YYYY-MM-DD format
  endDate: string // YYYY-MM-DD format
): Promise<{
  totalActiveUsers: number;
  totalCareerAnalyses: number;
  totalLogins: number;
  totalErrors: number;
  avgDailyActiveUsers: number;
  dailyStats: SystemUsageStats[];
}> {
  try {
    const dailyStats = await getStatsForDateRange(startDate, endDate);
    
    if (dailyStats.length === 0) {
      return {
        totalActiveUsers: 0,
        totalCareerAnalyses: 0,
        totalLogins: 0,
        totalErrors: 0,
        avgDailyActiveUsers: 0,
        dailyStats: []
      };
    }
    
    // Calculate totals
    const totalActiveUsers = dailyStats.reduce((sum, day) => sum + day.activeUsers, 0);
    const totalCareerAnalyses = dailyStats.reduce((sum, day) => sum + day.careerAnalysisCount, 0);
    const totalLogins = dailyStats.reduce((sum, day) => sum + day.loginCount, 0);
    const totalErrors = dailyStats.reduce((sum, day) => sum + day.errorCount, 0);
    
    // Calculate averages
    const avgDailyActiveUsers = totalActiveUsers / dailyStats.length;
    
    return {
      totalActiveUsers,
      totalCareerAnalyses,
      totalLogins,
      totalErrors,
      avgDailyActiveUsers,
      dailyStats
    };
  } catch (error) {
    console.error('Error getting stats summary:', error);
    return {
      totalActiveUsers: 0,
      totalCareerAnalyses: 0,
      totalLogins: 0,
      totalErrors: 0,
      avgDailyActiveUsers: 0,
      dailyStats: []
    };
  }
}

/**
 * Get latest registered users count
 */
export async function getLatestRegisteredUsersCount(): Promise<number> {
  try {
    const latestStats = await SystemUsageStatsModel.findOne().sort({ date: -1 });
    return latestStats?.registeredUsers || 0;
  } catch (error) {
    console.error('Error getting latest registered users count:', error);
    return 0;
  }
}

/**
 * Set absolute value for a specific stat (not incremental)
 */
export async function setAbsoluteStatValue(
  statName: keyof SystemUsageStats,
  value: number
): Promise<void> {
  try {
    if (statName === 'date') return;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Find or create today's stats document
    let todayStats = await SystemUsageStatsModel.findOne({ date: today });
    
    if (todayStats) {
      // Set the absolute value
      todayStats[statName] = value;
      await todayStats.save();
    } else {
      // Create new document with this stat
      const newStats: Partial<SystemUsageStats> = { date: today };
      newStats[statName] = value;
      
      todayStats = new SystemUsageStatsModel(newStats);
      await todayStats.save();
    }
  } catch (error) {
    console.error(`Error setting absolute stat value for ${statName}:`, error);
  }
}