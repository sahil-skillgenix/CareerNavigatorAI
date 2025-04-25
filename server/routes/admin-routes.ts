import { Router, Request, Response } from 'express';
import { requireAdmin, requireSuperAdmin, paginationMiddleware } from '../middleware/adminMiddleware';
import multer from 'multer';
import path from 'path';
import { 
  createNotification, 
  getNotificationsForAdmin, 
  deleteNotification 
} from '../models/NotificationModel';
import {
  createImportLog,
  getImportLogs,
  getImportLogById,
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
  updateFeatureLimit,
  initializeDefaultFeatureLimits
} from '../models/FeatureLimitsModel';

const router = Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/'); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Multer file filter - only accept CSV files
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'text/csv') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'));
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

// Ensure uploads directory exists
import fs from 'fs';
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads', { recursive: true });
}

// Initialize default feature limits on server startup
initializeDefaultFeatureLimits()
  .then(() => console.log('Default feature limits initialized'))
  .catch(err => console.error('Error initializing feature limits:', err));

/**
 * Admin dashboard overview
 * GET /api/admin/dashboard
 */
router.get('/dashboard', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Get error summary for last 30 days
    const errorSummary = await getErrorSummary(30);
    
    // Get usage stats for last 30 days
    const usageStats = await getAggregatedStats(30);
    
    // Return dashboard data
    res.json({
      errors: errorSummary,
      usage: usageStats
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

/**
 * Get all users with pagination and filtering
 * GET /api/admin/users
 */
router.get('/users', requireAdmin, paginationMiddleware, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const role = req.query.role as string;
    
    // Implement user filtering and pagination in your storage layer
    // This is a placeholder - implement this in your storage provider
    const { users, total } = { users: [], total: 0 }; // Your implementation here
    
    res.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

/**
 * Get a single user by ID
 * GET /api/admin/users/:id
 */
router.get('/users/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    
    // Get user details - implement in your storage layer
    const user = undefined; // Replace with your implementation
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's activity history
    
    // Return detailed user information
    res.json({
      user,
      // Include any other user-related data like activity history, feature usage, etc.
    });
  } catch (err) {
    console.error('Admin get user error:', err);
    res.status(500).json({ error: 'Failed to get user details' });
  }
});

/**
 * Update user status or restrictions
 * PATCH /api/admin/users/:id
 */
router.patch('/users/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { status, role, restrictions } = req.body;
    
    // Superadmin check for role changes
    if (role && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Only superadmins can change user roles' });
    }
    
    // Update user in database - implement in your storage layer
    const updatedUser = undefined; // Replace with your implementation
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user: updatedUser });
  } catch (err) {
    console.error('Admin update user error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * Get all notifications with pagination and filtering
 * GET /api/admin/notifications
 */
router.get('/notifications', requireAdmin, paginationMiddleware, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
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
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Admin notifications error:', err);
    res.status(500).json({ error: 'Failed to get notifications' });
  }
});

/**
 * Create a new notification
 * POST /api/admin/notifications
 */
router.post('/notifications', requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      title,
      message,
      type,
      priority,
      forAllUsers,
      userIds,
      expiresAt,
      dismissible,
      actionLink,
      actionText
    } = req.body;
    
    // Validate required fields
    if (!title || !message || !type || !priority) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create notification
    const notification = await createNotification({
      title,
      message,
      type,
      priority,
      forAllUsers: !!forAllUsers,
      userIds: userIds || [],
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      dismissible: dismissible !== false,
      actionLink,
      actionText,
      createdBy: req.user?.id
    });
    
    res.status(201).json({ notification });
  } catch (err) {
    console.error('Admin create notification error:', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

/**
 * Delete a notification
 * DELETE /api/admin/notifications/:id
 */
router.delete('/notifications/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const notificationId = req.params.id;
    
    const deleted = await deleteNotification(notificationId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete notification error:', err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

/**
 * Import data from CSV
 * POST /api/admin/import/:type
 */
router.post('/import/:type', requireSuperAdmin, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Validate import type
    const validTypes = ['skills', 'roles', 'industries', 'learningResources'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid import type' });
    }
    
    // Create import log
    const importLog = await createImportLog(
      type as any, 
      file.filename, 
      req.user?.id as string
    );
    
    // Start import process asynchronously
    // This would typically be done in a background job, 
    // but for simplicity we'll update the status immediately
    // Your actual implementation would parse the CSV and import the data
    
    // Update import log with success status (this is a placeholder)
    await updateImportStatus(importLog.id, 'completed', {
      processedRecords: 100, // placeholder
      totalRecords: 100, // placeholder
      notes: 'Import completed successfully'
    });
    
    res.status(202).json({ 
      importId: importLog.id, 
      message: 'Import started' 
    });
  } catch (err) {
    console.error('Admin import error:', err);
    res.status(500).json({ error: 'Failed to process import' });
  }
});

/**
 * Get all import logs with pagination and filtering
 * GET /api/admin/import
 */
router.get('/import', requireAdmin, paginationMiddleware, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const type = req.query.type as any; // Cast to ImportType
    const status = req.query.status as any; // Cast to ImportStatus
    
    const { logs, total } = await getImportLogs(
      page,
      limit,
      type,
      status
    );
    
    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Admin import logs error:', err);
    res.status(500).json({ error: 'Failed to get import logs' });
  }
});

/**
 * Get a single import log by ID
 * GET /api/admin/import/:id
 */
router.get('/import/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const importId = req.params.id;
    
    const importLog = await getImportLogById(importId);
    
    if (!importLog) {
      return res.status(404).json({ error: 'Import log not found' });
    }
    
    res.json({ importLog });
  } catch (err) {
    console.error('Admin get import log error:', err);
    res.status(500).json({ error: 'Failed to get import log' });
  }
});

/**
 * Get error logs with pagination and filtering
 * GET /api/admin/errors
 */
router.get('/errors', requireAdmin, paginationMiddleware, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const level = req.query.level as any; // Cast to ErrorLevel
    const userId = req.query.userId as string;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
    
    const { logs, total } = await getErrorLogs(
      page,
      limit,
      level,
      userId,
      startDate,
      endDate
    );
    
    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Admin error logs error:', err);
    res.status(500).json({ error: 'Failed to get error logs' });
  }
});

/**
 * Get feature limits
 * GET /api/admin/features
 */
router.get('/features', requireAdmin, async (req: Request, res: Response) => {
  try {
    const featureLimits = await getAllFeatureLimits();
    
    res.json({ features: featureLimits });
  } catch (err) {
    console.error('Admin features error:', err);
    res.status(500).json({ error: 'Failed to get feature limits' });
  }
});

/**
 * Update feature limit
 * PATCH /api/admin/features/:name
 */
router.patch('/features/:name', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const updates = req.body;
    
    // Validate required fields
    if (!name || Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    
    // Update feature limit
    const updatedFeature = await updateFeatureLimit(name, updates);
    
    if (!updatedFeature) {
      return res.status(404).json({ error: 'Feature limit not found' });
    }
    
    res.json({ feature: updatedFeature });
  } catch (err) {
    console.error('Admin update feature error:', err);
    res.status(500).json({ error: 'Failed to update feature limit' });
  }
});

/**
 * Get activity history for a specific user
 * GET /api/admin/activity/:userId
 */
router.get('/activity/:userId', requireAdmin, paginationMiddleware, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    // Get user activity history - implement in your storage layer
    const { activities, total } = { activities: [], total: 0 }; // Your implementation here
    
    res.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Admin user activity error:', err);
    res.status(500).json({ error: 'Failed to get user activity' });
  }
});

/**
 * Get system stats
 * GET /api/admin/stats
 */
router.get('/stats', requireAdmin, async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    
    // Get usage statistics
    const stats = await getAggregatedStats(days);
    
    res.json({ stats });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to get system statistics' });
  }
});

export default router;