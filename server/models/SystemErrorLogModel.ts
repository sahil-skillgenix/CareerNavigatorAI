import mongoose, { Document, Schema } from 'mongoose';

export interface SystemErrorLog {
  _id?: string;
  message: string;
  stack?: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  metadata?: Record<string, any>;
}

const SystemErrorLogSchema = new Schema({
  message: { 
    type: String, 
    required: true 
  },
  stack: { 
    type: String
  },
  category: { 
    type: String, 
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['critical', 'high', 'medium', 'low'], 
    default: 'medium', 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now, 
    required: true 
  },
  resolved: { 
    type: Boolean, 
    default: false, 
    required: true 
  },
  resolvedAt: { 
    type: Date 
  },
  resolvedBy: { 
    type: String,
    ref: 'User'
  },
  metadata: { 
    type: Schema.Types.Mixed 
  }
}, {
  versionKey: false
});

// Export model methods
export const find = (query: any = {}) => mongoose.models.SystemErrorLog?.find(query) || [];
export const findOne = (query: any = {}) => mongoose.models.SystemErrorLog?.findOne(query) || null;
export const findById = (id: string) => mongoose.models.SystemErrorLog?.findById(id) || null;
export const countDocuments = (query: any = {}) => mongoose.models.SystemErrorLog?.countDocuments(query) || 0;
export const findOneAndUpdate = (query: any, update: any, options: any = {}) => 
  mongoose.models.SystemErrorLog?.findOneAndUpdate(query, update, options) || null;
export const deleteOne = (query: any) => mongoose.models.SystemErrorLog?.deleteOne(query) || null;

// Use the mongoose model constructor and define it
const SystemErrorLogModel = mongoose.models.SystemErrorLog || 
  mongoose.model<SystemErrorLog & Document>('SystemErrorLog', SystemErrorLogSchema);

export default SystemErrorLogModel;