import mongoose, { Document, Schema } from 'mongoose';

// Available import types
export type ImportType = 'skills' | 'roles' | 'industries' | 'learningResources';

// Import status values
export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface DataImportLog extends Document {
  importType: ImportType;
  filename: string;
  status: ImportStatus;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
  processedRecords?: number;
  totalRecords?: number;
  errors?: string[];
  notes?: string;
}

const DataImportLogSchema = new Schema<DataImportLog>({
  importType: { 
    type: String, 
    required: true, 
    enum: ['skills', 'roles', 'industries', 'learningResources'] 
  },
  filename: { type: String, required: true },
  status: { 
    type: String, 
    required: true, 
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  processedRecords: { type: Number },
  totalRecords: { type: Number },
  errors: [{ type: String }],
  notes: { type: String }
}, { 
  timestamps: { createdAt: true, updatedAt: false }, 
  collection: 'dataImportLogs' 
});

// Create indexes for efficient querying
DataImportLogSchema.index({ importType: 1, status: 1, createdAt: -1 });
DataImportLogSchema.index({ createdBy: 1, createdAt: -1 });

export const DataImportLogModel = mongoose.model<DataImportLog>('DataImportLog', DataImportLogSchema);

/**
 * Create a new import log
 */
export async function createImportLog(
  importType: ImportType,
  filename: string,
  createdBy: string
): Promise<DataImportLog> {
  const importLog = new DataImportLogModel({
    importType,
    filename,
    createdBy,
    status: 'pending'
  });
  
  await importLog.save();
  return importLog;
}

/**
 * Get an import log by ID
 */
export async function getImportLogById(id: string): Promise<DataImportLog | null> {
  return DataImportLogModel.findById(id);
}

/**
 * Update an import log status
 */
export async function updateImportStatus(
  id: string, 
  status: ImportStatus, 
  updates?: {
    processedRecords?: number;
    totalRecords?: number;
    errors?: string[];
    notes?: string;
  }
): Promise<DataImportLog | null> {
  const updateData: any = { status };
  
  // If status is completed or failed, set the completedAt date
  if (status === 'completed' || status === 'failed') {
    updateData.completedAt = new Date();
  }
  
  // Add any additional updates
  if (updates) {
    if (updates.processedRecords !== undefined) {
      updateData.processedRecords = updates.processedRecords;
    }
    
    if (updates.totalRecords !== undefined) {
      updateData.totalRecords = updates.totalRecords;
    }
    
    if (updates.errors !== undefined) {
      updateData.errors = updates.errors;
    }
    
    if (updates.notes !== undefined) {
      updateData.notes = updates.notes;
    }
  }
  
  return DataImportLogModel.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true }
  );
}

/**
 * Get all import logs with filtering and pagination
 */
export async function getImportLogs(
  page: number = 1,
  limit: number = 20,
  importType?: ImportType,
  status?: ImportStatus
): Promise<{ logs: DataImportLog[], total: number }> {
  const query: any = {};
  
  if (importType) {
    query.importType = importType;
  }
  
  if (status) {
    query.status = status;
  }
  
  // Get total count
  const total = await DataImportLogModel.countDocuments(query);
  
  // Get paginated logs
  const logs = await DataImportLogModel.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  
  return { logs, total };
}

/**
 * Get the most recent import log by type
 */
export async function getMostRecentImport(importType: ImportType): Promise<DataImportLog | null> {
  return DataImportLogModel.findOne({ importType })
    .sort({ createdAt: -1 })
    .limit(1);
}

/**
 * Get all import logs for a specific user
 */
export async function getUserImportLogs(
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ logs: DataImportLog[], total: number }> {
  // Get total count
  const total = await DataImportLogModel.countDocuments({ createdBy: userId });
  
  // Get paginated logs
  const logs = await DataImportLogModel.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  
  return { logs, total };
}