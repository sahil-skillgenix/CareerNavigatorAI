import express, { Router, Request, Response } from 'express';
import { requireAdmin, requireSuperAdmin, paginationMiddleware } from '../middleware/adminMiddleware';
import mongoose from 'mongoose';

// Import admin models
import { 
  getNotificationsForAdmin, 
  createNotification, 
  deleteNotification, 
  getNotificationStats 
} from '../models/NotificationModel';
import { 
  getImportLogs,
  createImportLog,
  updateImportStatus
} from '../models/DataImportLogModel';
import { 
  getErrorLogs,
  getErrorSummary
} from '../models/SystemErrorLogModel';
import {
  getAggregatedStats
} from '../models/SystemUsageStatsModel';
import {
  getAllFeatureLimits,
  getFeatureLimit,
  updateFeatureLimit,
  setUserFeatureOverride,
  removeUserFeatureOverride,
  getUserFeatureLimit,
  initializeDefaultFeatureLimits
} from '../models/FeatureLimitsModel';

// Import any other necessary services or models
// ...

const adminRouter: Router = express.Router();

// Apply middleware to all routes
adminRouter.use(requireAdmin);

// Add pagination middleware to routes that need pagination
adminRouter.use([
  '/notifications',
  '/imports',
  '/errors',
  '/users'
], paginationMiddleware);

// Dashboard summary route
adminRouter.get('/dashboard/summary', async (req: Request, res: Response) => {
  try {
    // Get date range - default to last 30 days
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
    
    // Get usage stats
    const usageStats = await getAggregatedStats(days);
    
    // Get notification stats
    const notificationStats = await getNotificationStats();
    
    // Get error summary
    const errorSummary = await getErrorSummary(days);
    
    // Return comprehensive dashboard data
    res.json({
      usageStats,
      notificationStats,
      errorSummary
    });
  } catch (error) {
    console.error('Error getting admin dashboard summary:', error);
    res.status(500).json({ error: 'Failed to get dashboard summary' });
  }
});

// Notification routes
adminRouter.get('/notifications', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const type = req.query.type as string;
    const priority = req.query.priority as string;
    
    const { notifications, total } = await getNotificationsForAdmin(
      page,
      limit,
      type,
      priority
    );
    
    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

adminRouter.post('/notifications', async (req: Request, res: Response) => {
  try {
    const { title, message, type, priority, forAllUsers, userIds, expiresAt, dismissible, actionLink, actionText } = req.body;
    
    // Validate required fields
    if (!title || !message || !type) {
      return res.status(400).json({ error: 'Title, message, and type are required' });
    }
    
    // Create notification with admin info
    const notification = await createNotification({
      title,
      message,
      type,
      priority: priority || 'low',
      forAllUsers: Boolean(forAllUsers),
      userIds: userIds || [],
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      dismissible: dismissible !== false, // default to true
      createdBy: req.user?.id || 'unknown',
      actionLink,
      actionText,
      readBy: [],
      dismissedBy: []
    });
    
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

adminRouter.delete('/notifications/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }
    
    const success = await deleteNotification(id);
    
    if (success) {
      res.status(200).json({ message: 'Notification deleted successfully' });
    } else {
      res.status(404).json({ error: 'Notification not found' });
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Data import routes
adminRouter.get('/imports', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const importType = req.query.type as any; // Type to filter by
    const status = req.query.status as any; // Status to filter by
    
    const { logs, total } = await getImportLogs(
      page,
      limit,
      importType,
      status
    );
    
    res.json({
      imports: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting import logs:', error);
    res.status(500).json({ error: 'Failed to get import logs' });
  }
});

adminRouter.post('/imports', async (req: Request, res: Response) => {
  try {
    const { importType, filename } = req.body;
    
    // Validate required fields
    if (!importType || !filename) {
      return res.status(400).json({ error: 'Import type and filename are required' });
    }
    
    // Create import log
    const importLog = await createImportLog(
      importType,
      filename,
      req.user?.id || 'unknown'
    );
    
    res.status(201).json(importLog);
  } catch (error) {
    console.error('Error creating import log:', error);
    res.status(500).json({ error: 'Failed to create import log' });
  }
});

adminRouter.put('/imports/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, processedRecords, totalRecords, errors, notes } = req.body;
    
    // Validate required fields
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    // Update import status
    const importLog = await updateImportStatus(
      id,
      status,
      {
        processedRecords,
        totalRecords,
        errors,
        notes
      }
    );
    
    if (importLog) {
      res.json(importLog);
    } else {
      res.status(404).json({ error: 'Import log not found' });
    }
  } catch (error) {
    console.error('Error updating import status:', error);
    res.status(500).json({ error: 'Failed to update import status' });
  }
});

// Error logs routes
adminRouter.get('/errors', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '50', 10);
    const level = req.query.level as any;
    const userId = req.query.userId as string;
    
    // Parse date ranges if provided
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    
    if (req.query.startDate) {
      startDate = new Date(req.query.startDate as string);
    }
    
    if (req.query.endDate) {
      endDate = new Date(req.query.endDate as string);
    }
    
    const { logs, total } = await getErrorLogs(
      page,
      limit,
      level,
      userId,
      startDate,
      endDate
    );
    
    res.json({
      errors: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting error logs:', error);
    res.status(500).json({ error: 'Failed to get error logs' });
  }
});

adminRouter.get('/errors/summary', async (req: Request, res: Response) => {
  try {
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
    const summary = await getErrorSummary(days);
    res.json(summary);
  } catch (error) {
    console.error('Error getting error summary:', error);
    res.status(500).json({ error: 'Failed to get error summary' });
  }
});

// Feature limits routes
adminRouter.get('/feature-limits', async (req: Request, res: Response) => {
  try {
    const limits = await getAllFeatureLimits();
    res.json(limits);
  } catch (error) {
    console.error('Error getting feature limits:', error);
    res.status(500).json({ error: 'Failed to get feature limits' });
  }
});

adminRouter.get('/feature-limits/:name', async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const limit = await getFeatureLimit(name);
    
    if (limit) {
      res.json(limit);
    } else {
      res.status(404).json({ error: 'Feature limit not found' });
    }
  } catch (error) {
    console.error('Error getting feature limit:', error);
    res.status(500).json({ error: 'Failed to get feature limit' });
  }
});

adminRouter.put('/feature-limits/:name', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const { description, defaultLimit, defaultFrequency, userTiers, overridable, active } = req.body;
    
    // Update feature limit
    const limit = await updateFeatureLimit(name, {
      description,
      defaultLimit,
      defaultFrequency,
      userTiers,
      overridable,
      active
    });
    
    if (limit) {
      res.json(limit);
    } else {
      res.status(404).json({ error: 'Feature limit not found' });
    }
  } catch (error) {
    console.error('Error updating feature limit:', error);
    res.status(500).json({ error: 'Failed to update feature limit' });
  }
});

adminRouter.post('/feature-limits/initialize', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    await initializeDefaultFeatureLimits();
    const limits = await getAllFeatureLimits();
    res.json({ 
      message: 'Default feature limits initialized successfully',
      limits 
    });
  } catch (error) {
    console.error('Error initializing feature limits:', error);
    res.status(500).json({ error: 'Failed to initialize feature limits' });
  }
});

// User feature overrides routes
adminRouter.post('/users/:userId/feature-overrides', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { featureName, limit, reason, expiresAt } = req.body;
    
    // Validate required fields
    if (!featureName || limit === undefined || !reason) {
      return res.status(400).json({ error: 'Feature name, limit, and reason are required' });
    }
    
    // Create or update override
    const override = await setUserFeatureOverride(
      userId,
      featureName,
      limit,
      reason,
      req.user?.id || 'unknown',
      expiresAt ? new Date(expiresAt) : undefined
    );
    
    res.status(201).json(override);
  } catch (error) {
    console.error('Error setting user feature override:', error);
    res.status(500).json({ error: 'Failed to set user feature override' });
  }
});

adminRouter.delete('/users/:userId/feature-overrides/:featureName', async (req: Request, res: Response) => {
  try {
    const { userId, featureName } = req.params;
    
    const success = await removeUserFeatureOverride(userId, featureName);
    
    if (success) {
      res.status(200).json({ message: 'Feature override removed successfully' });
    } else {
      res.status(404).json({ error: 'Feature override not found' });
    }
  } catch (error) {
    console.error('Error removing user feature override:', error);
    res.status(500).json({ error: 'Failed to remove user feature override' });
  }
});

adminRouter.get('/users/:userId/feature-limits/:featureName', async (req: Request, res: Response) => {
  try {
    const { userId, featureName } = req.params;
    const userTier = req.query.tier as any || 'free';
    
    const limit = await getUserFeatureLimit(userId, featureName, userTier);
    
    res.json({ 
      userId,
      featureName,
      userTier,
      limit
    });
  } catch (error) {
    console.error('Error getting user feature limit:', error);
    res.status(500).json({ error: 'Failed to get user feature limit' });
  }
});

export default adminRouter;