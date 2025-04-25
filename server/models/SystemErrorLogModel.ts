import mongoose from 'mongoose';

// System error log schema definition
const systemErrorLogSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['info', 'warning', 'error', 'critical'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  stack: {
    type: String,
    required: false
  },
  category: {
    type: String,
    default: 'general'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedBy: {
    type: String,
    ref: 'User',
    required: false
  },
  resolvedAt: {
    type: Date,
    required: false
  },
  resolutionNotes: {
    type: String,
    required: false
  },
  userId: {
    type: String,
    ref: 'User',
    required: false
  },
  request: {
    type: Object,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { 
  collection: 'systemErrorLog', // Standardized collection name (singular)
  timestamps: { createdAt: 'timestamp', updatedAt: false } // Use timestamp as createdAt
});

// Create the Mongoose model
const SystemErrorLogModel = mongoose.model('SystemErrorLog', systemErrorLogSchema);

export default SystemErrorLogModel;