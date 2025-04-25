import mongoose, { Document, Schema } from 'mongoose';

export interface APIRequestLog {
  _id?: string;
  method: string;
  path: string;
  userId?: string;
  timestamp: Date;
  statusCode: number;
  responseTime?: number;
  ipAddress?: string;
  userAgent?: string;
  query?: Record<string, any>;
  body?: Record<string, any>;
  error?: {
    message: string;
    stack?: string;
  };
}

const APIRequestLogSchema = new Schema({
  method: { 
    type: String, 
    required: true 
  },
  path: { 
    type: String, 
    required: true 
  },
  userId: { 
    type: String,
    ref: 'User' 
  },
  timestamp: { 
    type: Date, 
    default: Date.now, 
    required: true 
  },
  statusCode: { 
    type: Number, 
    required: true 
  },
  responseTime: { 
    type: Number 
  },
  ipAddress: { 
    type: String 
  },
  userAgent: { 
    type: String 
  },
  query: { 
    type: Schema.Types.Mixed 
  },
  body: { 
    type: Schema.Types.Mixed 
  },
  error: {
    message: { 
      type: String 
    },
    stack: { 
      type: String 
    }
  }
}, {
  versionKey: false
});

// Export model methods
export const find = (query: any = {}) => mongoose.models.APIRequestLog?.find(query) || [];
export const findOne = (query: any = {}) => mongoose.models.APIRequestLog?.findOne(query) || null;
export const findById = (id: string) => mongoose.models.APIRequestLog?.findById(id) || null;
export const countDocuments = (query: any = {}) => mongoose.models.APIRequestLog?.countDocuments(query) || 0;
export const findOneAndUpdate = (query: any, update: any, options: any = {}) => 
  mongoose.models.APIRequestLog?.findOneAndUpdate(query, update, options) || null;
export const deleteOne = (query: any) => mongoose.models.APIRequestLog?.deleteOne(query) || null;
export const aggregate = (pipeline: any[]) => mongoose.models.APIRequestLog?.aggregate(pipeline) || [];

// Use the mongoose model constructor and define it
const APIRequestLogModel = mongoose.models.APIRequestLog || 
  mongoose.model<APIRequestLog & Document>('APIRequestLog', APIRequestLogSchema);

export default APIRequestLogModel;