import mongoose, { Document, Schema } from 'mongoose';

export interface SystemNotification {
  _id?: string;
  title: string;
  message: string;
  type: 'maintenance' | 'announcement' | 'alert' | 'warning' | 'info';
  priority: 'critical' | 'high' | 'medium' | 'low';
  forAllUsers: boolean;
  targetUsers?: string[];
  readBy?: string[];
  createdAt: Date;
  expiresAt?: Date;
  createdBy: string;
}

interface SystemNotificationDocument extends SystemNotification, Omit<Document<any, any, any>, 'errors'> {}

const SystemNotificationSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['maintenance', 'announcement', 'alert', 'warning', 'info'], 
    default: 'info', 
    required: true 
  },
  priority: { 
    type: String, 
    enum: ['critical', 'high', 'medium', 'low'], 
    default: 'medium', 
    required: true 
  },
  forAllUsers: { 
    type: Boolean, 
    default: true, 
    required: true 
  },
  targetUsers: [{ 
    type: String, 
    ref: 'User' 
  }],
  readBy: [{ 
    type: String, 
    ref: 'User' 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now, 
    required: true 
  },
  expiresAt: { 
    type: Date 
  },
  createdBy: { 
    type: String,
    ref: 'User', 
    required: true 
  }
}, {
  versionKey: false
});

export const find = (query: any = {}) => mongoose.models.SystemNotification?.find(query) || [];
export const findOne = (query: any = {}) => mongoose.models.SystemNotification?.findOne(query) || null;
export const findById = (id: string) => mongoose.models.SystemNotification?.findById(id) || null;
export const countDocuments = (query: any = {}) => mongoose.models.SystemNotification?.countDocuments(query) || 0;
export const findOneAndUpdate = (query: any, update: any, options: any = {}) => 
  mongoose.models.SystemNotification?.findOneAndUpdate(query, update, options) || null;
export const deleteOne = (query: any) => mongoose.models.SystemNotification?.deleteOne(query) || null;

export default mongoose.models.SystemNotification || 
  mongoose.model<SystemNotificationDocument>('SystemNotification', SystemNotificationSchema);