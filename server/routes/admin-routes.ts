import { Router, Request, Response } from 'express';
import { MongoDBStorage } from '../mongodb-storage';
import { isAdmin, isSuperAdmin } from '../middleware/adminMiddleware';
import { logUserActivityWithParams } from '../services/logging-service';
import SystemErrorLogModel from '../models/SystemErrorLogModel';
import { UserActivityModel } from '../db/models';
import FeatureLimitsModel from '../models/FeatureLimitsModel';
import DataImportLogModel from '../models/DataImportLogModel';
import SystemNotificationModel from '../models/SystemNotificationModel';
import SystemUsageStatsModel from '../models/SystemUsageStatsModel';
import APIRequestLogModel from '../models/APIRequestLogModel';

const router = Router();
const storage = new MongoDBStorage();

// Middleware to ensure admin access for all routes
router.use(isAdmin);

// Get all users - Admin only
router.get('/user-management/users', async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    
    // Log activity
    logUserActivityWithParams({
      userId: req.user?.id || 'unknown',
      action: 'view_all_users',
      details: 'Admin viewed all users',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      metadata: {
        method: req.method,
        path: req.path
      }
    });
    
    res.json({ users });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get system error logs - Admin only
router.get('/errors', async (req: Request, res: Response) => {
  try {
    const { severity, limit = 20, resolved, category, fromDate, toDate } = req.query;
    
    const queryParams: any = {};
    
    if (severity) queryParams.severity = severity;
    if (resolved) queryParams.resolved = resolved === 'true';
    if (category) queryParams.category = category;
    if (fromDate) queryParams.timestamp = { $gte: new Date(fromDate as string) };
    if (toDate) {
      if (queryParams.timestamp) {
        queryParams.timestamp.$lte = new Date(toDate as string);
      } else {
        queryParams.timestamp = { $lte: new Date(toDate as string) };
      }
    }
    
    const errors = await SystemErrorLogModel.find(queryParams)
      .sort({ timestamp: -1 })
      .limit(Number(limit));
    
    // Get summary counts
    const criticalErrors = await SystemErrorLogModel.countDocuments({ severity: 'critical', resolved: false });
    const totalErrors = await SystemErrorLogModel.countDocuments();
    const unresolvedErrors = await SystemErrorLogModel.countDocuments({ resolved: false });
    
    // Log activity
    logUserActivityWithParams({
      userId: req.user?.id || 'unknown',
      action: 'view_error_logs',
      details: 'Admin viewed error logs',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      metadata: {
        method: req.method,
        path: req.path,
        queryParams
      }
    });
    
    res.json({ 
      errors,
      summary: {
        criticalErrors,
        totalErrors,
        unresolvedErrors
      }
    });
  } catch (error) {
    console.error('Error fetching error logs:', error);
    res.status(500).json({ error: 'Failed to fetch error logs' });
  }
});

// Get feature limits - Admin only
router.get('/feature-limits', async (req: Request, res: Response) => {
  try {
    const featureLimits = await FeatureLimitsModel.find({}).sort({ name: 1 });
    
    // Log activity
    logUserActivityWithParams({
      userId: req.user?.id || 'unknown',
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

// Create/update feature limits - Super Admin only
router.post('/feature-limits', isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { featureLimits } = req.body;
    
    if (!Array.isArray(featureLimits)) {
      return res.status(400).json({ error: 'Invalid feature limits data' });
    }
    
    const results = [];
    
    for (const limit of featureLimits) {
      const { name, defaultLimit, defaultFrequency, active } = limit;
      
      const existingLimit = await FeatureLimitsModel.findOne({ name });
      
      if (existingLimit) {
        const updated = await FeatureLimitsModel.findOneAndUpdate(
          { name },
          { 
            defaultLimit, 
            defaultFrequency, 
            active, 
            updatedAt: new Date(),
            updatedBy: req.user?.id
          },
          { new: true }
        );
        results.push(updated);
      } else {
        const newLimit = new FeatureLimitsModel({
          name,
          description: limit.description || `Limit for ${name} feature`,
          defaultLimit,
          defaultFrequency,
          active: active !== undefined ? active : true,
          createdBy: req.user?.id,
          updatedBy: req.user?.id
        });
        
        await newLimit.save();
        results.push(newLimit);
      }
    }
    
    // Log activity
    logUserActivityWithParams({
      userId: req.user?.id || 'unknown',
      action: 'update_feature_limits',
      details: 'Super admin updated feature limits',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      metadata: {
        method: req.method,
        path: req.path,
        featureLimitCount: featureLimits.length
      }
    });
    
    res.json(results);
  } catch (error) {
    console.error('Error updating feature limits:', error);
    res.status(500).json({ error: 'Failed to update feature limits' });
  }
});

// Get system notifications - Admin only
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const notifications = await SystemNotificationModel.find({})
      .sort({ createdAt: -1 })
      .limit(20);
    
    // Log activity
    logUserActivityWithParams({
      userId: req.user?.id || 'unknown',
      action: 'view_system_notifications',
      details: 'Admin viewed system notifications',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      metadata: {
        method: req.method,
        path: req.path
      }
    });
    
    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get data import logs - Super Admin only
router.get('/imports', isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const imports = await DataImportLogModel.find({})
      .sort({ createdAt: -1 })
      .limit(20);
    
    // Log activity
    logUserActivityWithParams({
      userId: req.user?.id || 'unknown',
      action: 'view_data_imports',
      details: 'Super admin viewed data imports',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      metadata: {
        method: req.method,
        path: req.path
      }
    });
    
    res.json({ imports });
  } catch (error) {
    console.error('Error fetching import logs:', error);
    res.status(500).json({ error: 'Failed to fetch import logs' });
  }
});

// Get dashboard summary statistics - Admin only
router.get('/dashboard/summary', async (req: Request, res: Response) => {
  try {
    // Get system usage stats
    const latestStats = await SystemUsageStatsModel.findOne({})
      .sort({ timestamp: -1 });
    
    // Calculate usage metrics
    const totalSignups = await storage.getUserCount();
    const totalLogins = await UserActivityModel.countDocuments({ action: 'LOGIN' });
    const activeUsers = await storage.getActiveUserCount();
    
    // Get API success rate
    const apiRequests = await APIRequestLogModel.countDocuments({});
    const apiSuccessful = await APIRequestLogModel.countDocuments({ statusCode: { $lt: 400 } });
    const apiSuccessRate = apiRequests > 0 ? (apiSuccessful / apiRequests) * 100 : 100;
    
    // Get average response time
    const avgResponseTimeResult = await APIRequestLogModel.aggregate([
      { $match: { responseTime: { $exists: true } } },
      { $group: { _id: null, avgResponseTime: { $avg: '$responseTime' } } }
    ]);
    const avgResponseTime = avgResponseTimeResult.length > 0 ? avgResponseTimeResult[0].avgResponseTime : 0;
    
    // Get feature usage statistics
    const featureUsage = await UserActivityModel.aggregate([
      { $match: { category: 'FEATURE_USAGE' } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
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