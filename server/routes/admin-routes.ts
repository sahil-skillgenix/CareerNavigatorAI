import { Router, Request, Response } from 'express';
import { isAdmin, isSuperAdmin } from '../middleware/adminMiddleware';
import { logUserActivityWithParams } from '../services/logging-service';
import mongoose from 'mongoose';
import { FeatureLimitsModel, UserActivityLogModel, SystemErrorLogModel, UserModel } from '../db/models';

const router = Router();

// Middleware to ensure admin access for all routes
router.use(isAdmin);

// Get all users for user management
router.get('/user-management/users', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    const users = await UserModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await UserModel.countDocuments();
    
    // Log activity
    logUserActivityWithParams({
      userId: req.user?.id || 'unknown',
      category: 'ADMIN',
      action: 'view_all_users',
      details: 'Admin viewed user management',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      metadata: {
        method: req.method,
        path: req.path,
        page, 
        limit
      }
    });
    
    res.json({
      users: users.map(user => ({
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get system errors for admin dashboard
router.get('/errors', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    
    const errors = await SystemErrorLogModel.find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await SystemErrorLogModel.countDocuments();
    
    // Log activity
    logUserActivityWithParams({
      userId: req.user?.id || 'unknown',
      category: 'ADMIN',
      action: 'view_error_logs',
      details: 'Admin viewed system errors',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      metadata: {
        method: req.method,
        path: req.path,
        page,
        limit
      }
    });
    
    res.json({
      errors,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching system errors:', error);
    res.status(500).json({ error: 'Failed to fetch system errors' });
  }
});

// Get feature limits
router.get('/feature-limits', async (req: Request, res: Response) => {
  try {
    // Get all feature limits from DB
    const featureLimits = await FeatureLimitsModel.findOne();
    
    // If no feature limits exist yet, create default ones
    if (!featureLimits) {
      const defaultLimits = new FeatureLimitsModel({
        maxCareerAnalysesPerUser: 5,
        maxSkillsPerAnalysis: 20,
        enableAIRecommendations: true,
        enablePdfExport: true,
        enableBulkImport: false,
        maxLearningResourcesPerSkill: 10,
        maxConcurrentUsers: 100
      });
      
      await defaultLimits.save();
      
      return res.json(defaultLimits);
    }
    
    // Log activity
    logUserActivityWithParams({
      userId: req.user?.id || 'unknown',
      category: 'ADMIN',
      action: 'view_feature_limits',
      details: 'Admin viewed feature limits',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      metadata: {
        method: req.method,
        path: req.path
      }
    });
    
    res.json(featureLimits);
  } catch (error) {
    console.error('Error fetching feature limits:', error);
    res.status(500).json({ error: 'Failed to fetch feature limits' });
  }
});

// Update feature limits - Super Admin only
router.post('/feature-limits', isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const updatedLimits = req.body;
    
    // Validate the incoming data
    if (updatedLimits.maxCareerAnalysesPerUser !== undefined && 
        (updatedLimits.maxCareerAnalysesPerUser < 1 || updatedLimits.maxCareerAnalysesPerUser > 100)) {
      return res.status(400).json({ error: 'Max career analyses must be between 1 and 100' });
    }
    
    if (updatedLimits.maxSkillsPerAnalysis !== undefined && 
        (updatedLimits.maxSkillsPerAnalysis < 5 || updatedLimits.maxSkillsPerAnalysis > 50)) {
      return res.status(400).json({ error: 'Max skills per analysis must be between 5 and 50' });
    }
    
    if (updatedLimits.maxLearningResourcesPerSkill !== undefined && 
        (updatedLimits.maxLearningResourcesPerSkill < 1 || updatedLimits.maxLearningResourcesPerSkill > 30)) {
      return res.status(400).json({ error: 'Max learning resources per skill must be between 1 and 30' });
    }
    
    if (updatedLimits.maxConcurrentUsers !== undefined && 
        (updatedLimits.maxConcurrentUsers < 10 || updatedLimits.maxConcurrentUsers > 1000)) {
      return res.status(400).json({ error: 'Max concurrent users must be between 10 and 1000' });
    }
    
    // Find existing limits or create new ones
    let featureLimits = await FeatureLimitsModel.findOne();
    
    if (!featureLimits) {
      featureLimits = new FeatureLimitsModel(updatedLimits);
    } else {
      // Update only the provided fields
      Object.keys(updatedLimits).forEach(key => {
        if (updatedLimits[key] !== undefined) {
          featureLimits[key] = updatedLimits[key];
        }
      });
    }
    
    await featureLimits.save();
    
    // Log activity
    logUserActivityWithParams({
      userId: req.user?.id || 'unknown',
      category: 'ADMIN',
      action: 'update_feature_limits',
      details: 'Super admin updated feature limits',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      metadata: {
        method: req.method,
        path: req.path,
        updates: updatedLimits
      }
    });
    
    res.json(featureLimits);
  } catch (error) {
    console.error('Error updating feature limits:', error);
    res.status(500).json({ error: 'Failed to update feature limits' });
  }
});

// Get admin notifications
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    // This would typically fetch from a notifications collection
    // For now, return some sample notifications
    const notifications = [
      {
        id: '1',
        type: 'system',
        message: 'System maintenance scheduled for tomorrow at 2 AM UTC',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        read: false
      },
      {
        id: '2',
        type: 'alert',
        message: 'High error rate detected in API requests',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        read: true
      },
      {
        id: '3',
        type: 'user',
        message: 'New superadmin user created',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        read: true
      }
    ];
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get data import/export status - Super Admin only
router.get('/imports', isSuperAdmin, async (req: Request, res: Response) => {
  try {
    // This would typically fetch from an imports/exports collection
    // For now, return some sample import data
    const imports = [
      {
        id: '1',
        type: 'skills',
        status: 'completed',
        totalRecords: 500,
        processedRecords: 500,
        failedRecords: 0,
        startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        type: 'industries',
        status: 'completed',
        totalRecords: 200,
        processedRecords: 198,
        failedRecords: 2,
        startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: 'roles',
        status: 'in_progress',
        totalRecords: 350,
        processedRecords: 200,
        failedRecords: 5,
        startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        completedAt: null
      }
    ];
    
    res.json(imports);
  } catch (error) {
    console.error('Error fetching imports:', error);
    res.status(500).json({ error: 'Failed to fetch imports' });
  }
});

// Get admin dashboard summary data
router.get('/dashboard/summary', async (req: Request, res: Response) => {
  try {
    // Get total user count
    const totalSignups = await UserModel.countDocuments();
    
    // Get active user count
    const activeUsers = await UserModel.countDocuments({ status: 'active' });
    
    // Get total login count
    const totalLogins = await UserActivityLogModel.countDocuments({ 
      activityType: 'login' 
    });
    
    // Get API request count
    const apiRequests = await UserActivityLogModel.countDocuments({
      category: 'API'
    });
    
    // Get API success rate
    const successfulRequests = await UserActivityLogModel.countDocuments({
      category: 'API',
      metadata: { status: { $lt: 400 } }
    });
    
    const apiSuccessRate = apiRequests > 0 
      ? (successfulRequests / apiRequests * 100).toFixed(2)
      : 100;
    
    // Get average response time
    const avgResponseTimeResult = await UserActivityLogModel.aggregate([
      { $match: { category: 'API' } },
      { $group: {
          _id: null,
          avgResponseTime: { $avg: '$metadata.responseTime' }
        }
      }
    ]);
    
    const avgResponseTime = avgResponseTimeResult.length > 0 
      ? Math.round(avgResponseTimeResult[0].avgResponseTime || 0) 
      : 0;
    
    // Get latest system stats
    const latestStats = {
      cpuUsage: Math.random() * 60 + 10, // Simulated 10-70% CPU usage
      memoryUsage: Math.random() * 40 + 30, // Simulated 30-70% memory usage
      diskUsage: Math.random() * 20 + 40, // Simulated 40-60% disk usage
      activeConnections: Math.floor(Math.random() * 50) + 5, // Simulated 5-55 connections
      lastUpdated: new Date().toISOString()
    };
    
    // Get feature usage
    const featureUsage = await UserActivityLogModel.aggregate([
      { $match: { category: 'FEATURE' } },
      { $group: {
          _id: '$activityType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    const featureUsageMap: Record<string, number> = {};
    featureUsage.forEach(item => {
      if (item._id) {
        featureUsageMap[item._id.toString()] = item.count;
      }
    });
    
    // Get error rates
    const criticalErrors = await SystemErrorLogModel.countDocuments({ severity: 'critical' });
    const errors = await SystemErrorLogModel.countDocuments({ severity: 'high' });
    const warnings = await SystemErrorLogModel.countDocuments({ severity: 'medium' });
    
    // Log activity
    logUserActivityWithParams({
      userId: req.user?.id || 'unknown',
      category: 'ADMIN',
      action: 'view_dashboard_summary',
      details: 'Admin viewed dashboard summary',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      metadata: {
        method: req.method,
        path: req.path
      }
    });
    
    res.json({
      usageStats: {
        totalSignups,
        activeUsers,
        totalLogins,
        apiRequests,
        apiSuccessRate,
        avgResponseTime,
        featureUsage: featureUsageMap,
        errorRates: {
          critical: criticalErrors,
          error: errors,
          warning: warnings
        }
      },
      systemStats: latestStats
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

export default router;