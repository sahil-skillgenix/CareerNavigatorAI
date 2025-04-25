import mongoose, { Document, Schema } from 'mongoose';

export interface SystemUsageStats {
  _id?: string;
  timestamp: Date;
  signups: number;
  logins: number;
  pathwaysGenerated: number;
  skillsQueried: number;
  rolesQueried: number;
  resourcesRequested: number;
  analysesCreated: number;
  totalActiveUsers: number;
  apiUsage: {
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
    errorsCount: number;
  };
  topSearchQueries: {
    query: string;
    count: number;
  }[];
  topFeatures: {
    feature: string;
    usageCount: number;
  }[];
  period: 'day' | 'week' | 'month';
}

interface SystemUsageStatsDocument extends SystemUsageStats, Omit<Document<unknown, any, any>, 'errors'> {}

const SystemUsageStatsSchema = new Schema({
  timestamp: { 
    type: Date, 
    default: Date.now, 
    required: true 
  },
  signups: { 
    type: Number, 
    default: 0, 
    required: true 
  },
  logins: { 
    type: Number, 
    default: 0, 
    required: true 
  },
  pathwaysGenerated: { 
    type: Number, 
    default: 0, 
    required: true 
  },
  skillsQueried: { 
    type: Number, 
    default: 0, 
    required: true 
  },
  rolesQueried: { 
    type: Number, 
    default: 0, 
    required: true 
  },
  resourcesRequested: { 
    type: Number, 
    default: 0, 
    required: true 
  },
  analysesCreated: { 
    type: Number, 
    default: 0, 
    required: true 
  },
  totalActiveUsers: { 
    type: Number, 
    default: 0, 
    required: true 
  },
  apiUsage: {
    totalRequests: { 
      type: Number, 
      default: 0, 
      required: true 
    },
    successRate: { 
      type: Number, 
      default: 100, 
      required: true 
    },
    averageResponseTime: { 
      type: Number, 
      default: 0, 
      required: true 
    },
    errorsCount: { 
      type: Number, 
      default: 0, 
      required: true 
    }
  },
  topSearchQueries: [{
    query: { 
      type: String, 
      required: true 
    },
    count: { 
      type: Number, 
      required: true 
    }
  }],
  topFeatures: [{
    feature: { 
      type: String, 
      required: true 
    },
    usageCount: { 
      type: Number, 
      required: true 
    }
  }],
  period: { 
    type: String, 
    enum: ['day', 'week', 'month'], 
    default: 'day', 
    required: true 
  }
}, {
  versionKey: false
});

export const find = (query: any = {}) => mongoose.models.SystemUsageStats?.find(query) || [];
export const findOne = (query: any = {}) => mongoose.models.SystemUsageStats?.findOne(query) || null;
export const findById = (id: string) => mongoose.models.SystemUsageStats?.findById(id) || null;
export const countDocuments = (query: any = {}) => mongoose.models.SystemUsageStats?.countDocuments(query) || 0;
export const findOneAndUpdate = (query: any, update: any, options: any = {}) => 
  mongoose.models.SystemUsageStats?.findOneAndUpdate(query, update, options) || null;
export const deleteOne = (query: any) => mongoose.models.SystemUsageStats?.deleteOne(query) || null;

export default mongoose.models.SystemUsageStats || 
  mongoose.model<SystemUsageStatsDocument>('SystemUsageStats', SystemUsageStatsSchema);