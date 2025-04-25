import mongoose, { Document, Schema } from 'mongoose';

export interface DataImportLog {
  _id?: string;
  importType: 'skills' | 'roles' | 'industries' | 'pathway' | 'users' | 'other';
  filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processedRecords?: number;
  totalRecords?: number;
  errors?: { 
    message: string;
    record?: any;
    line?: number; 
  }[];
  createdAt: Date;
  completedAt?: Date;
  createdBy: string;
  metadata?: Record<string, any>;
}

interface DataImportLogDocument extends DataImportLog, Omit<Document<unknown, any, any>, 'errors'> {}

const DataImportLogSchema = new Schema({
  importType: { 
    type: String, 
    enum: ['skills', 'roles', 'industries', 'pathway', 'users', 'other'], 
    required: true 
  },
  filename: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending', 
    required: true 
  },
  processedRecords: { 
    type: Number, 
    default: 0 
  },
  totalRecords: { 
    type: Number 
  },
  errors: [{ 
    message: { type: String, required: true },
    record: { type: Schema.Types.Mixed },
    line: { type: Number }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now, 
    required: true 
  },
  completedAt: { 
    type: Date 
  },
  createdBy: { 
    type: String,
    ref: 'User', 
    required: true 
  },
  metadata: { 
    type: Schema.Types.Mixed 
  }
}, {
  versionKey: false
});

export const find = (query: any = {}) => mongoose.models.DataImportLog?.find(query) || [];
export const findOne = (query: any = {}) => mongoose.models.DataImportLog?.findOne(query) || null;
export const findById = (id: string) => mongoose.models.DataImportLog?.findById(id) || null;
export const countDocuments = (query: any = {}) => mongoose.models.DataImportLog?.countDocuments(query) || 0;
export const findOneAndUpdate = (query: any, update: any, options: any = {}) => 
  mongoose.models.DataImportLog?.findOneAndUpdate(query, update, options) || null;
export const deleteOne = (query: any) => mongoose.models.DataImportLog?.deleteOne(query) || null;

export default mongoose.models.DataImportLog || 
  mongoose.model<DataImportLogDocument>('DataImportLog', DataImportLogSchema);