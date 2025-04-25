import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType = 'system' | 'security' | 'feature' | 'maintenance' | 'account';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Notification extends Document {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  forAllUsers: boolean;
  userIds: string[];
  createdAt: Date;
  expiresAt?: Date;
  dismissible: boolean;
  createdBy?: string;
  actionLink?: string;
  actionText?: string;
  readBy: string[];
  dismissedBy: string[];
}

const NotificationSchema = new Schema<Notification>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['system', 'security', 'feature', 'maintenance', 'account'] 
  },
  priority: { 
    type: String, 
    required: true, 
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  forAllUsers: { type: Boolean, default: false },
  userIds: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  dismissible: { type: Boolean, default: true },
  createdBy: { type: String },
  actionLink: { type: String },
  actionText: { type: String },
  readBy: [{ type: String }],
  dismissedBy: [{ type: String }]
}, {
  collection: 'notifications'
});

// Create indexes for faster querying
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 });
NotificationSchema.index({ forAllUsers: 1 });
NotificationSchema.index({ userIds: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ priority: 1 });

export const NotificationModel = mongoose.model<Notification>('Notification', NotificationSchema);

/**
 * Create a new notification
 */
export async function createNotification(
  notification: Partial<Notification>
): Promise<Notification> {
  const newNotification = new NotificationModel(notification);
  await newNotification.save();
  return newNotification;
}

/**
 * Get notifications for a specific user
 */
export async function getNotificationsForUser(
  userId: string
): Promise<Notification[]> {
  const now = new Date();
  
  // Get notifications that:
  // 1. Are for all users OR specifically for this user
  // 2. Haven't expired
  // 3. Haven't been dismissed by this user
  return NotificationModel.find({
    $and: [
      // Condition 1: For all users OR specifically for this user
      {
        $or: [
          { forAllUsers: true },
          { userIds: userId }
        ]
      },
      // Condition 2: Haven't expired
      {
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: null },
          { expiresAt: { $gt: now } }
        ]
      },
      // Condition 3: Not dismissed by this user
      { dismissedBy: { $ne: userId } }
    ]
  }).sort({ createdAt: -1 });
}

/**
 * Get notifications for admin with pagination and filtering
 */
export async function getNotificationsForAdmin(
  page: number = 1,
  limit: number = 20,
  type?: string,
  priority?: string
): Promise<{ notifications: Notification[], total: number }> {
  const query: any = {};
  
  // Add filters if provided
  if (type) {
    query.type = type;
  }
  
  if (priority) {
    query.priority = priority;
  }
  
  // Get total count for pagination
  const total = await NotificationModel.countDocuments(query);
  
  // Get paginated notifications
  const notifications = await NotificationModel.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  
  return { notifications, total };
}

/**
 * Mark a notification as read for a user
 */
export async function markNotificationAsRead(
  notificationId: string,
  userId: string
): Promise<boolean> {
  const result = await NotificationModel.updateOne(
    { _id: notificationId },
    { $addToSet: { readBy: userId } }
  );
  
  return result.modifiedCount > 0;
}

/**
 * Dismiss a notification for a user
 */
export async function dismissNotification(
  notificationId: string,
  userId: string
): Promise<boolean> {
  const result = await NotificationModel.updateOne(
    { _id: notificationId },
    { $addToSet: { dismissedBy: userId } }
  );
  
  return result.modifiedCount > 0;
}

/**
 * Delete a notification (admin only)
 */
export async function deleteNotification(
  notificationId: string
): Promise<boolean> {
  const result = await NotificationModel.deleteOne({ _id: notificationId });
  return result.deletedCount > 0;
}

/**
 * Get notification statistics
 */
export async function getNotificationStats(): Promise<{
  total: number;
  active: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}> {
  const now = new Date();
  
  // Get total count
  const total = await NotificationModel.countDocuments();
  
  // Get active count (not expired)
  const active = await NotificationModel.countDocuments({
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: now } }
    ]
  });
  
  // Get counts by type
  const typePromises = ['system', 'security', 'feature', 'maintenance', 'account'].map(
    type => NotificationModel.countDocuments({ type })
  );
  
  // Get counts by priority
  const priorityPromises = ['low', 'medium', 'high', 'critical'].map(
    priority => NotificationModel.countDocuments({ priority })
  );
  
  // Execute all count queries in parallel
  const [
    systemCount,
    securityCount,
    featureCount,
    maintenanceCount,
    accountCount,
    lowCount,
    mediumCount,
    highCount,
    criticalCount
  ] = await Promise.all([
    ...typePromises,
    ...priorityPromises
  ]);
  
  return {
    total,
    active,
    byType: {
      system: systemCount,
      security: securityCount,
      feature: featureCount,
      maintenance: maintenanceCount,
      account: accountCount
    },
    byPriority: {
      low: lowCount,
      medium: mediumCount,
      high: highCount,
      critical: criticalCount
    }
  };
}