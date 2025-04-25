import mongoose, { Document, Schema } from 'mongoose';
import { 
  NOTIFICATION_PRIORITIES, 
  NOTIFICATION_TYPES 
} from '../../shared/schema';

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
  seenAt?: Date;
  dismissedAt?: Date;
}

// Define notification schema
const NotificationSchema = new Schema<Notification>({
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  priority: { 
    type: String, 
    enum: NOTIFICATION_PRIORITIES,
    default: 'medium',
    required: true
  },
  type: { 
    type: String, 
    enum: NOTIFICATION_TYPES,
    default: 'system',
    required: true
  },
  forAllUsers: { 
    type: Boolean, 
    default: false 
  },
  userIds: [{ 
    type: String 
  }],
  expiresAt: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  createdBy: { 
    type: String 
  },
  dismissible: { 
    type: Boolean, 
    default: true 
  },
  actionLink: { 
    type: String 
  },
  actionText: { 
    type: String 
  }
});

// Define user notification status schema
const UserNotificationStatusSchema = new Schema<UserNotificationStatus>({
  userId: { 
    type: String, 
    required: true,
    index: true 
  },
  notificationId: { 
    type: String, 
    required: true,
    index: true 
  },
  seen: { 
    type: Boolean, 
    default: false 
  },
  dismissed: { 
    type: Boolean, 
    default: false 
  },
  seenAt: { 
    type: Date 
  },
  dismissedAt: { 
    type: Date 
  }
});

// Create compound index for faster lookups
UserNotificationStatusSchema.index({ userId: 1, notificationId: 1 }, { unique: true });

// Create notification models
export const NotificationModel = mongoose.model<Notification>('Notification', NotificationSchema);
export const UserNotificationStatusModel = mongoose.model<UserNotificationStatus>('UserNotificationStatus', UserNotificationStatusSchema);

/**
 * Create a new notification
 */
export async function createNotification(notificationData: Partial<Notification>): Promise<Notification> {
  try {
    const notification = new NotificationModel({
      ...notificationData,
      createdAt: new Date()
    });
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Get active notifications for a user
 * Returns notifications that haven't expired and either target all users or specifically this user
 */
export async function getActiveNotificationsForUser(userId: string): Promise<Notification[]> {
  try {
    const now = new Date();
    
    // Find notifications that:
    // 1. Haven't expired (no expiry date or expiry date is in the future)
    // 2. Target all users OR specifically include this user
    const notifications = await NotificationModel.find({
      $and: [
        { $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: now } }] },
        { $or: [{ forAllUsers: true }, { userIds: userId }] }
      ]
    }).sort({ priority: -1, createdAt: -1 }).exec();
    
    return notifications;
  } catch (error) {
    console.error('Error getting notifications for user:', error);
    return [];
  }
}

/**
 * Mark a notification as seen by a user
 */
export async function markNotificationSeen(userId: string, notificationId: string): Promise<boolean> {
  try {
    // Try to find an existing status record
    let status = await UserNotificationStatusModel.findOne({ 
      userId, 
      notificationId 
    });
    
    if (status) {
      // Update the existing record
      status.seen = true;
      status.seenAt = new Date();
      await status.save();
    } else {
      // Create a new status record
      status = new UserNotificationStatusModel({
        userId,
        notificationId,
        seen: true,
        seenAt: new Date(),
        dismissed: false
      });
      await status.save();
    }
    
    return true;
  } catch (error) {
    console.error('Error marking notification as seen:', error);
    return false;
  }
}

/**
 * Mark a notification as dismissed by a user
 */
export async function dismissNotification(userId: string, notificationId: string): Promise<boolean> {
  try {
    // Try to find an existing status record
    let status = await UserNotificationStatusModel.findOne({ 
      userId, 
      notificationId 
    });
    
    if (status) {
      // Update the existing record
      status.dismissed = true;
      status.dismissedAt = new Date();
      if (!status.seen) {
        status.seen = true;
        status.seenAt = new Date();
      }
      await status.save();
    } else {
      // Create a new status record
      status = new UserNotificationStatusModel({
        userId,
        notificationId,
        seen: true,
        seenAt: new Date(),
        dismissed: true,
        dismissedAt: new Date()
      });
      await status.save();
    }
    
    return true;
  } catch (error) {
    console.error('Error dismissing notification:', error);
    return false;
  }
}

/**
 * Get unseen notifications count for a user
 */
export async function getUnseenNotificationsCount(userId: string): Promise<number> {
  try {
    const activeNotifications = await getActiveNotificationsForUser(userId);
    
    if (activeNotifications.length === 0) {
      return 0;
    }
    
    const notificationIds = activeNotifications.map(n => n._id.toString());
    
    // Find statuses for these notifications
    const statuses = await UserNotificationStatusModel.find({
      userId,
      notificationId: { $in: notificationIds },
      $or: [{ seen: true }, { dismissed: true }]
    });
    
    // Notifications that don't have a matching status are unseen
    const seenNotificationIds = new Set(statuses.map(s => s.notificationId));
    const unseenCount = notificationIds.filter(id => !seenNotificationIds.has(id)).length;
    
    return unseenCount;
  } catch (error) {
    console.error('Error getting unseen notifications count:', error);
    return 0;
  }
}

/**
 * Get filtered notifications for admin view
 */
export async function getNotificationsForAdmin(
  page: number = 1,
  limit: number = 20,
  type?: string,
  priority?: string
): Promise<{ notifications: Notification[], total: number }> {
  try {
    const query: any = {};
    
    if (type) {
      query.type = type;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    const total = await NotificationModel.countDocuments(query);
    const notifications = await NotificationModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    
    return { notifications, total };
  } catch (error) {
    console.error('Error getting notifications for admin:', error);
    return { notifications: [], total: 0 };
  }
}

/**
 * Delete a notification (admin only)
 */
export async function deleteNotification(notificationId: string): Promise<boolean> {
  try {
    await NotificationModel.findByIdAndDelete(notificationId);
    
    // Also delete all associated status records
    await UserNotificationStatusModel.deleteMany({ notificationId });
    
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}