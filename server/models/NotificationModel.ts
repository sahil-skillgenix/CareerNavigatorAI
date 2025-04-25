import mongoose, { Document, Schema } from 'mongoose';
import { notificationSchema, NOTIFICATION_PRIORITIES, NOTIFICATION_TYPES, userNotificationStatusSchema } from '../../shared/schema';
import { z } from 'zod';

export interface Notification extends Document {
  title: string;
  message: string;
  priority: typeof NOTIFICATION_PRIORITIES[number];
  type: typeof NOTIFICATION_TYPES[number];
  forAllUsers: boolean;
  userIds?: string[];
  expiresAt?: Date;
  createdAt: Date;
  createdBy?: string;
  dismissible: boolean;
  actionLink?: string;
  actionText?: string;
}

export interface UserNotificationStatus extends Document {
  userId: string;
  notificationId: string;
  seen: boolean;
  dismissed: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<Notification>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  priority: { 
    type: String, 
    required: true, 
    enum: NOTIFICATION_PRIORITIES,
    default: 'medium'
  },
  type: { 
    type: String, 
    required: true, 
    enum: NOTIFICATION_TYPES,
    default: 'system'
  },
  forAllUsers: { type: Boolean, default: false },
  userIds: [{ type: String }],
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String },
  dismissible: { type: Boolean, default: true },
  actionLink: { type: String },
  actionText: { type: String }
}, { 
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'notifications' 
});

const UserNotificationStatusSchema = new Schema<UserNotificationStatus>({
  userId: { type: String, required: true },
  notificationId: { type: String, required: true },
  seen: { type: Boolean, default: false },
  dismissed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { 
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'userNotificationStatuses' 
});

// Create compound index for userId + notificationId to ensure uniqueness
// and fast lookup of user's notification status
UserNotificationStatusSchema.index({ userId: 1, notificationId: 1 }, { unique: true });

// Create index for querying active notifications
NotificationSchema.index({ 
  expiresAt: 1, 
  forAllUsers: 1, 
  type: 1, 
  priority: 1 
});

export const NotificationModel = mongoose.model<Notification>('Notification', NotificationSchema);
export const UserNotificationStatusModel = mongoose.model<UserNotificationStatus>('UserNotificationStatus', UserNotificationStatusSchema);

/**
 * Create a new notification
 */
export async function createNotification(data: Partial<Notification>): Promise<Notification> {
  const notification = new NotificationModel(data);
  await notification.save();
  return notification;
}

/**
 * Get a notification by ID
 */
export async function getNotificationById(id: string): Promise<Notification | null> {
  return NotificationModel.findById(id);
}

/**
 * Get all active notifications for a specific user
 * This includes both user-specific notifications and all-user notifications
 * that haven't expired and haven't been dismissed by the user
 */
export async function getNotificationsForUser(userId: string): Promise<Notification[]> {
  const now = new Date();
  
  // Find all active notifications that are either for all users or specifically for this user
  const notifications = await NotificationModel.find({
    $and: [
      { $or: [
          { forAllUsers: true },
          { userIds: userId }
        ]
      },
      { $or: [
          { expiresAt: { $gt: now } },
          { expiresAt: null }
        ]
      }
    ]
  }).sort({ priority: -1, createdAt: -1 });
  
  if (notifications.length === 0) {
    return [];
  }
  
  // Get notification IDs to check status
  const notificationIds = notifications.map(n => n._id.toString());
  
  // Find notifications that the user has dismissed
  const userStatuses = await UserNotificationStatusModel.find({
    userId,
    notificationId: { $in: notificationIds },
    dismissed: true
  });
  
  // Create a set of dismissed notification IDs for faster lookup
  const dismissedIds = new Set(userStatuses.map(status => status.notificationId.toString()));
  
  // Filter out dismissed notifications
  return notifications.filter(notification => {
    const id = notification._id.toString();
    return !dismissedIds.has(id);
  });
}

/**
 * Get all notifications for admin panel
 */
export async function getNotificationsForAdmin(
  page: number = 1,
  limit: number = 20,
  type?: string,
  priority?: string
): Promise<{ notifications: Notification[], total: number }> {
  const query: any = {};
  
  if (type) {
    query.type = type;
  }
  
  if (priority) {
    query.priority = priority;
  }
  
  // Get total count
  const total = await NotificationModel.countDocuments(query);
  
  // Get paginated notifications
  const notifications = await NotificationModel.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  
  return { notifications, total };
}

/**
 * Mark a notification as seen by a user
 */
export async function markNotificationSeen(userId: string, notificationId: string): Promise<boolean> {
  const result = await UserNotificationStatusModel.updateOne(
    { userId, notificationId },
    { $set: { seen: true } },
    { upsert: true }
  );
  
  return result.acknowledged;
}

/**
 * Mark a notification as dismissed by a user
 */
export async function dismissNotification(userId: string, notificationId: string): Promise<boolean> {
  const result = await UserNotificationStatusModel.updateOne(
    { userId, notificationId },
    { $set: { dismissed: true } },
    { upsert: true }
  );
  
  return result.acknowledged;
}

/**
 * Delete a notification (admin only)
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  const result = await NotificationModel.deleteOne({ _id: notificationId });
  
  // If notification was deleted, also clean up user statuses
  if (result.deletedCount > 0) {
    await UserNotificationStatusModel.deleteMany({ notificationId });
    return true;
  }
  
  return false;
}