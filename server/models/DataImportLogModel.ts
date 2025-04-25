import mongoose, { Document, Schema } from 'mongoose';
import { DATA_IMPORT_TYPES, DATA_IMPORT_STATUS } from '../../shared/schema';

export interface DataImportLog extends Document {
  importType: typeof DATA_IMPORT_TYPES[number];
  filename: string;
  status: typeof DATA_IMPORT_STATUS[number];
  recordsProcessed: number;
  recordsSucceeded: number;
  recordsFailed: number;
  errors?: string[];
  importedBy: string;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

// Define data import log schema
const DataImportLogSchema = new Schema<DataImportLog>({
  importType: { 
    type: String, 
    enum: DATA_IMPORT_TYPES,
    required: true
  },
  filename: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: DATA_IMPORT_STATUS,
    default: 'pending'
  },
  recordsProcessed: { 
    type: Number, 
    default: 0 
  },
  recordsSucceeded: { 
    type: Number, 
    default: 0 
  },
  recordsFailed: { 
    type: Number, 
    default: 0 
  },
  errors: [{ 
    type: String 
  }],
  importedBy: { 
    type: String, 
    required: true 
  },
  startedAt: { 
    type: Date 
  },
  completedAt: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Create indices for faster lookups
DataImportLogSchema.index({ importType: 1, createdAt: -1 });
DataImportLogSchema.index({ importedBy: 1, createdAt: -1 });
DataImportLogSchema.index({ status: 1 });

// Create data import log model
export const DataImportLogModel = mongoose.model<DataImportLog>('DataImportLog', DataImportLogSchema);

/**
 * Create a new data import log
 */
export async function createImportLog(
  importType: typeof DATA_IMPORT_TYPES[number],
  filename: string,
  importedBy: string
): Promise<DataImportLog> {
  try {
    const importLog = new DataImportLogModel({
      importType,
      filename,
      status: 'pending',
      recordsProcessed: 0,
      recordsSucceeded: 0,
      recordsFailed: 0,
      importedBy,
      createdAt: new Date()
    });
    
    await importLog.save();
    return importLog;
  } catch (error) {
    console.error('Error creating import log:', error);
    throw error;
  }
}

/**
 * Update import log status when import starts
 */
export async function markImportStarted(importId: string): Promise<DataImportLog | null> {
  try {
    const updatedLog = await DataImportLogModel.findByIdAndUpdate(
      importId,
      {
        status: 'in_progress',
        startedAt: new Date()
      },
      { new: true }
    );
    
    return updatedLog;
  } catch (error) {
    console.error('Error marking import as started:', error);
    return null;
  }
}

/**
 * Update import log status when import completes successfully
 */
export async function markImportCompleted(
  importId: string,
  recordsProcessed: number,
  recordsSucceeded: number,
  recordsFailed: number = 0,
  errors: string[] = []
): Promise<DataImportLog | null> {
  try {
    const updatedLog = await DataImportLogModel.findByIdAndUpdate(
      importId,
      {
        status: recordsFailed > 0 ? 'completed' : 'completed',
        recordsProcessed,
        recordsSucceeded,
        recordsFailed,
        errors,
        completedAt: new Date()
      },
      { new: true }
    );
    
    return updatedLog;
  } catch (error) {
    console.error('Error marking import as completed:', error);
    return null;
  }
}

/**
 * Update import log status when import fails
 */
export async function markImportFailed(
  importId: string,
  recordsProcessed: number = 0,
  recordsSucceeded: number = 0,
  recordsFailed: number = 0,
  errors: string[] = ['Unknown error occurred']
): Promise<DataImportLog | null> {
  try {
    const updatedLog = await DataImportLogModel.findByIdAndUpdate(
      importId,
      {
        status: 'failed',
        recordsProcessed,
        recordsSucceeded,
        recordsFailed,
        errors,
        completedAt: new Date()
      },
      { new: true }
    );
    
    return updatedLog;
  } catch (error) {
    console.error('Error marking import as failed:', error);
    return null;
  }
}

/**
 * Get recent import logs with pagination
 */
export async function getImportLogs(
  page: number = 1,
  limit: number = 20,
  importType?: typeof DATA_IMPORT_TYPES[number],
  status?: typeof DATA_IMPORT_STATUS[number]
): Promise<{ logs: DataImportLog[], total: number }> {
  try {
    const query: any = {};
    
    if (importType) {
      query.importType = importType;
    }
    
    if (status) {
      query.status = status;
    }
    
    const total = await DataImportLogModel.countDocuments(query);
    const logs = await DataImportLogModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    
    return { logs, total };
  } catch (error) {
    console.error('Error getting import logs:', error);
    return { logs: [], total: 0 };
  }
}

/**
 * Get recent import logs for a specific admin
 */
export async function getImportLogsByAdmin(
  adminId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ logs: DataImportLog[], total: number }> {
  try {
    const query = { importedBy: adminId };
    
    const total = await DataImportLogModel.countDocuments(query);
    const logs = await DataImportLogModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    
    return { logs, total };
  } catch (error) {
    console.error('Error getting import logs for admin:', error);
    return { logs: [], total: 0 };
  }
}

/**
 * Get a specific import log by ID
 */
export async function getImportLogById(importId: string): Promise<DataImportLog | null> {
  try {
    return await DataImportLogModel.findById(importId);
  } catch (error) {
    console.error('Error getting import log by ID:', error);
    return null;
  }
}