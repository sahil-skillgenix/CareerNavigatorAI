import express from 'express';
import { isAdmin, isSuperAdmin } from '../middleware/adminMiddleware';
import { logUserActivityWithParams } from '../services/logging-service';

const router = express.Router();

// Access check endpoint
router.get('/check-access', isAdmin, (req, res) => {
  try {
    // Return admin access information
    res.json({
      access: 'granted',
      role: req.user?.role || 'unknown',
      permissions: req.user?.role === 'superadmin' ? ['all'] : ['limited']
    });
  } catch (error) {
    console.error('Admin access check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users - accessible to admins and superadmins
router.get('/user-management/users', isAdmin, async (req, res) => {
  try {
    // Mock data until full implementation
    res.json({
      users: [
        {
          id: '507f1f77bcf86cd799439011',
          fullName: 'Demo User',
          email: 'demo@skillgenix.com',
          status: 'active',
          role: 'user'
        },
        {
          id: '603f1f77bcf86cd799439022',
          fullName: 'Test User',
          email: 'test@skillgenix.com',
          status: 'active',
          role: 'user'
        },
        {
          id: '60a71f77bcf86cd799439033',
          fullName: 'Super Admin',
          email: 'super-admin@skillgenix.com',
          status: 'active',
          role: 'superadmin'
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Error logs - accessible to admins and superadmins
router.get('/errors', isAdmin, (req, res) => {
  try {
    // Mock data until full implementation
    res.json({
      summary: {
        criticalErrors: 2,
        totalErrors: 15,
        unresolvedErrors: 5
      },
      errors: [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          message: 'Database connection timeout',
          category: 'database',
          severity: 'high',
          resolved: false
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          message: 'API rate limit exceeded',
          category: 'api',
          severity: 'medium',
          resolved: true
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          message: 'Authentication service unavailable',
          category: 'auth',
          severity: 'critical',
          resolved: false
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching error logs:', error);
    res.status(500).json({ error: 'Failed to fetch error logs' });
  }
});

// Feature limits - accessible to admins and superadmins
router.get('/feature-limits', isAdmin, (req, res) => {
  try {
    // Mock data until full implementation
    res.json([
      {
        name: 'Career Pathway Generation',
        description: 'Number of career pathway analyses per day',
        defaultLimit: 5,
        defaultFrequency: 'daily',
        active: true
      },
      {
        name: 'Learning Resource Recommendations',
        description: 'Number of learning resource requests per day',
        defaultLimit: 10,
        defaultFrequency: 'daily',
        active: true
      },
      {
        name: 'Organization Pathway Analysis',
        description: 'Number of organization pathway analyses per week',
        defaultLimit: 3,
        defaultFrequency: 'weekly',
        active: true
      }
    ]);
  } catch (error) {
    console.error('Error fetching feature limits:', error);
    res.status(500).json({ error: 'Failed to fetch feature limits' });
  }
});

// Notifications - accessible to admins and superadmins
router.get('/notifications', isAdmin, (req, res) => {
  try {
    // Mock data until full implementation
    res.json({
      notifications: [
        {
          id: '1',
          title: 'System Maintenance',
          message: 'The system will be undergoing maintenance on Saturday from 2AM to 4AM UTC.',
          createdAt: new Date().toISOString(),
          type: 'maintenance',
          priority: 'medium',
          forAllUsers: true,
          readBy: ['user1', 'user2']
        },
        {
          id: '2',
          title: 'New Feature: Organization Pathway',
          message: 'We\'ve just launched a new feature for analyzing organizational career pathways. Check it out!',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          type: 'feature',
          priority: 'low',
          forAllUsers: true,
          readBy: ['user1']
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// System statistics - accessible to admins and superadmins
router.get('/statistics', isAdmin, (req, res) => {
  try {
    // Mock data until full implementation
    res.json({
      users: {
        total: 152,
        active: 126,
        inactive: 26,
        newThisMonth: 18
      },
      pathways: {
        total: 531,
        thisMonth: 87,
        avgTimeToComplete: '5 minutes'
      },
      resources: {
        recommended: 1247,
        saved: 485,
        mostPopularCategory: 'Technical Skills'
      },
      usage: {
        dailyActiveUsers: 78,
        monthlyActiveUsers: 126,
        avgSessionDuration: '12 minutes'
      },
      skills: {
        total: 2145,
        mostSearched: ['Machine Learning', 'Cloud Computing', 'Data Analysis', 'Cybersecurity', 'UX Design']
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Super admin only routes
router.get('/super-admin-check', isSuperAdmin, (req, res) => {
  try {
    res.json({
      access: 'granted',
      message: 'Super admin access confirmed'
    });
  } catch (error) {
    console.error('Super admin check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;