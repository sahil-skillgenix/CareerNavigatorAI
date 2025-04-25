import { Router, Request, Response } from 'express';
import { requireAdmin, requireSuperAdmin, paginationMiddleware } from '../middleware/adminMiddleware';
import { UserModel } from '../db/models';
import { 
  NotificationModel, 
  createNotification,
  getNotificationsForAdmin,
  deleteNotification
} from '../models/NotificationModel';
import {
  DataImportLogModel,
  createImportLog,
  getImportLogs,
  getImportLogById
} from '../models/DataImportLogModel';
import {
  SystemUsageStatsModel,
  getStatsForDateRange,
  getStatsSummary
} from '../models/SystemUsageStatsModel';
import {
  SystemErrorLogModel,
  getErrorLogs,
  getErrorSummary
} from '../models/SystemErrorLogModel';
import {
  FeatureLimitsModel,
  getAllFeatureLimits,
  updateFeatureLimit,
  seedFeatureLimits
} from '../models/FeatureLimitsModel';
import { UserActivityModel, getUserActivity } from '../models/UserActivityModel';
import { CareerAnalysisModel } from '../db/models';
import * as z from 'zod';
import { 
  notificationSchema, 
  USER_ROLES, 
  USER_STATUS,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_TYPES
} from '../../shared/schema';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ObjectId } from 'mongodb';

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'import-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only CSV and JSON files
    const validFileTypes = ['.csv', '.json', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname);
    
    if (validFileTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only CSV, JSON, and Excel files are allowed.'));
    }
  }
});

const router = Router();

// Initialize feature limits on startup
seedFeatureLimits().catch(err => console.error('Error seeding feature limits:', err));

// ===== Dashboard Statistics =====

/**
 * Get admin dashboard summary statistics
 * GET /api/admin/dashboard
 */
router.get('/dashboard', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Calculate date ranges
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];
    
    // Get user counts
    const totalUsers = await UserModel.countDocuments();
    const newUsersLast30Days = await UserModel.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    const activeUsers = await UserModel.countDocuments({
      status: 'active'
    });
    
    // Get career analysis stats
    const totalAnalyses = await CareerAnalysisModel.countDocuments();
    const recentAnalyses = await CareerAnalysisModel.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Get users with multiple analyses
    const userAnalysisCounts = await CareerAnalysisModel.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $count: 'usersWithMultipleAnalyses' }
    ]);
    
    const usersWithMultipleAnalyses = userAnalysisCounts.length > 0 
      ? userAnalysisCounts[0].usersWithMultipleAnalyses 
      : 0;
    
    // Get error summary
    const errorSummary = await getErrorSummary(30);
    
    // Get usage stats
    const usageStats = await getStatsSummary(startDate, endDate);
    
    // Return combined dashboard data
    res.json({
      users: {
        total: totalUsers,
        newLast30Days: newUsersLast30Days,
        active: activeUsers
      },
      analyses: {
        total: totalAnalyses,
        last30Days: recentAnalyses,
        usersWithMultiple: usersWithMultipleAnalyses
      },
      errors: errorSummary,
      usageStats
    });
  } catch (error) {
    console.error('Error getting admin dashboard data:', error);
    res.status(500).json({ error: 'Failed to retrieve dashboard data' });
  }
});

// ===== User Management =====

/**
 * Get all users with pagination and filtering
 * GET /api/admin/users
 */
router.get('/users', requireAdmin, paginationMiddleware, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as string;
    const status = req.query.status as string;
    const search = req.query.search as string;
    
    // Build query
    const query: any = {};
    
    if (role && USER_ROLES.includes(role as any)) {
      query.role = role;
    }
    
    if (status && USER_STATUS.includes(status as any)) {
      query.status = status;
    }
    
    if (search) {
      // Search by name or email
      query.$or = [
        { fullName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    
    // Get total count
    const total = await UserModel.countDocuments(query);
    
    // Get paginated users
    const users = await UserModel.find(query)
      .select('-password -securityAnswer') // Exclude sensitive fields
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

/**
 * Get a single user by ID
 * GET /api/admin/users/:id
 */
router.get('/users/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    
    if (!userId || !ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const user = await UserModel.findById(userId).select('-password -securityAnswer');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's activity history
    const activities = await UserActivityModel.find({ userId })
      .sort({ timestamp: -1 })
      .limit(20);
    
    // Get user's career analyses
    const analyses = await CareerAnalysisModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      user,
      activities,
      analyses
    });
  } catch (error) {
    console.error('Error getting user details:', error);
    res.status(500).json({ error: 'Failed to retrieve user details' });
  }
});

/**
 * Update user status or restrictions
 * PATCH /api/admin/users/:id
 */
router.patch('/users/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    
    if (!userId || !ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // Check if trying to edit a superadmin
    const targetUser = await UserModel.findById(userId);
    
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Only superadmins can modify other admins/superadmins
    if (
      (targetUser.role === 'admin' || targetUser.role === 'superadmin') && 
      req.user.role !== 'superadmin'
    ) {
      return res.status(403).json({ 
        error: 'Insufficient permissions to modify admin accounts' 
      });
    }
    
    // Validate update data
    const updateData: any = {};
    
    // Status update
    if (req.body.status && USER_STATUS.includes(req.body.status)) {
      updateData.status = req.body.status;
    }
    
    // Role update (superadmin only)
    if (req.body.role && USER_ROLES.includes(req.body.role) && req.user.role === 'superadmin') {
      updateData.role = req.body.role;
    }
    
    // Feature limits update
    if (req.body.restrictions) {
      updateData.restrictions = {
        ...targetUser.restrictions,
        ...req.body.restrictions
      };
    }
    
    // If no valid updates, return error
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid update fields provided' });
    }
    
    // Update user
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password -securityAnswer');
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// ===== Notifications =====

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
    
    // Validate filter values
    let validatedType = undefined;
    let validatedPriority = undefined;
    
    if (type && NOTIFICATION_TYPES.includes(type as any)) {
      validatedType = type;
    }
    
    if (priority && NOTIFICATION_PRIORITIES.includes(priority as any)) {
      validatedPriority = priority;
    }
    
    const { notifications, total } = await getNotificationsForAdmin(
      page,
      limit,
      validatedType,
      validatedPriority
    );
    
    res.json({
      notifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

/**
 * Create a new notification
 * POST /api/admin/notifications
 */
router.post('/notifications', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Validate notification data
    const validationResult = notificationSchema.omit({ id: true, createdAt: true }).safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: 'Invalid notification data', 
        details: validationResult.error.flatten() 
      });
    }
    
    // Create notification
    const notification = await createNotification({
      ...validationResult.data,
      createdBy: req.user.id
    });
    
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
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
    
    if (!notificationId || !ObjectId.isValid(notificationId)) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }
    
    const success = await deleteNotification(notificationId);
    
    if (!success) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// ===== Data Import =====

/**
 * Upload data file and create import log
 * POST /api/admin/import/:type
 */
router.post('/import/:type', requireSuperAdmin, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const importType = req.params.type;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Validate import type
    const validImportTypes = ['skills', 'roles', 'industries', 'learningResources'];
    
    if (!validImportTypes.includes(importType)) {
      return res.status(400).json({ 
        error: 'Invalid import type', 
        validTypes: validImportTypes 
      });
    }
    
    // Create import log
    const importLog = await createImportLog(
      importType as any,
      file.filename,
      req.user.id
    );
    
    // Note: Actual data processing would happen asynchronously
    // We'll just return the import log here
    
    res.status(201).json({
      importLog,
      message: 'File uploaded successfully. Import process will start shortly.'
    });
  } catch (error) {
    console.error('Error processing import:', error);
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
    const type = req.query.type as string;
    const status = req.query.status as string;
    
    const { logs, total } = await getImportLogs(
      page,
      limit,
      type as any,
      status as any
    );
    
    res.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting import logs:', error);
    res.status(500).json({ error: 'Failed to retrieve import logs' });
  }
});

/**
 * Get a single import log by ID
 * GET /api/admin/import/:id
 */
router.get('/import/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const importId = req.params.id;
    
    if (!importId || !ObjectId.isValid(importId)) {
      return res.status(400).json({ error: 'Invalid import ID' });
    }
    
    const importLog = await getImportLogById(importId);
    
    if (!importLog) {
      return res.status(404).json({ error: 'Import log not found' });
    }
    
    res.json(importLog);
  } catch (error) {
    console.error('Error getting import log:', error);
    res.status(500).json({ error: 'Failed to retrieve import log' });
  }
});

// ===== Error Logs =====

/**
 * Get all error logs with pagination and filtering
 * GET /api/admin/errors
 */
router.get('/errors', requireAdmin, paginationMiddleware, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const level = req.query.level as string;
    const userId = req.query.userId as string;
    
    // Parse date range if provided
    let startDate = undefined;
    let endDate = undefined;
    
    if (req.query.startDate) {
      startDate = new Date(req.query.startDate as string);
    }
    
    if (req.query.endDate) {
      endDate = new Date(req.query.endDate as string);
      // Set to end of day
      endDate.setHours(23, 59, 59, 999);
    }
    
    const { logs, total } = await getErrorLogs(
      page,
      limit,
      level as any,
      userId,
      startDate,
      endDate
    );
    
    res.json({
      logs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting error logs:', error);
    res.status(500).json({ error: 'Failed to retrieve error logs' });
  }
});

// ===== Feature Limits =====

/**
 * Get all feature limits
 * GET /api/admin/features
 */
router.get('/features', requireAdmin, async (req: Request, res: Response) => {
  try {
    const featureLimits = await getAllFeatureLimits();
    res.json(featureLimits);
  } catch (error) {
    console.error('Error getting feature limits:', error);
    res.status(500).json({ error: 'Failed to retrieve feature limits' });
  }
});

/**
 * Update feature limit
 * PATCH /api/admin/features/:name
 */
router.patch('/features/:name', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const featureName = req.params.name;
    
    // Validate request data
    const { limit, description } = req.body;
    
    if (typeof limit !== 'number' || limit < 0) {
      return res.status(400).json({ error: 'Limit must be a positive number' });
    }
    
    if (!description || typeof description !== 'string') {
      return res.status(400).json({ error: 'Description is required' });
    }
    
    // Update feature limit
    const updatedFeature = await updateFeatureLimit(
      featureName,
      limit,
      description,
      req.user.id
    );
    
    if (!updatedFeature) {
      return res.status(404).json({ error: 'Feature not found' });
    }
    
    res.json(updatedFeature);
  } catch (error) {
    console.error('Error updating feature limit:', error);
    res.status(500).json({ error: 'Failed to update feature limit' });
  }
});

// ===== User Activity =====

/**
 * Get activity logs for a specific user
 * GET /api/admin/activity/:userId
 */
router.get('/activity/:userId', requireAdmin, paginationMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit as string) || 50;
    
    if (!userId || !ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const activities = await getUserActivity(userId, limit);
    
    res.json(activities);
  } catch (error) {
    console.error('Error getting user activity:', error);
    res.status(500).json({ error: 'Failed to retrieve user activity' });
  }
});

// ===== System Stats =====

/**
 * Get system usage statistics for a date range
 * GET /api/admin/stats
 */
router.get('/stats', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Default to last 30 days if no date range provided
    const endDate = req.query.endDate as string || new Date().toISOString().split('T')[0];
    
    let startDate = req.query.startDate as string;
    if (!startDate) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      startDate = thirtyDaysAgo.toISOString().split('T')[0];
    }
    
    const summary = await getStatsSummary(startDate, endDate);
    
    res.json(summary);
  } catch (error) {
    console.error('Error getting system stats:', error);
    res.status(500).json({ error: 'Failed to retrieve system statistics' });
  }
});

export default router;