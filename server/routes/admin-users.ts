import { Router, Request, Response } from 'express';
import { MongoDBStorage } from '../mongodb-storage';
import { isAdmin, isSuperAdmin } from '../middleware/adminMiddleware';
import { logUserActivityWithParams } from '../services/logging-service';
import { UserModel } from '../db/models';
import { storage } from '../storage';

const router = Router();

// Middleware to ensure admin access for all routes
router.use(isAdmin);

// Get all users - Admin only
router.get('/users', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const users = await storage.getAllUsers(limit, offset);
    
    // Log activity
    logUserActivityWithParams({
      userId: req.user?.id || 'unknown',
      category: 'ADMIN',
      activityType: 'view_all_users',
      details: 'Admin viewed all users',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      metadata: {
        method: req.method,
        path: req.path,
        params: req.params,
        limit,
        offset
      }
    });
    
    res.json({ users, total: users.length });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID - Admin only
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Log activity
    logUserActivityWithParams({
      userId: req.user?.id || 'unknown',
      category: 'ADMIN',
      activityType: 'view_user_details',
      details: `Admin viewed user details for ${user.email}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      metadata: {
        method: req.method,
        path: req.path,
        params: req.params,
        targetUserId: userId
      }
    });
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user status - Admin only
router.patch('/users/:id/status', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['active', 'suspended', 'restricted', 'deleted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    // Get user before update
    const userBefore = await storage.getUser(userId);
    if (!userBefore) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prevent modifying super admin unless you're also super admin
    if (userBefore.role === 'superadmin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ error: 'Cannot modify a super admin account' });
    }
    
    // Update user status
    const updatedUser = await storage.updateUser(userId, { status });
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found or update failed' });
    }
    
    // Log activity
    logUserActivityWithParams({
      userId: req.user?.id || 'unknown',
      category: 'ADMIN',
      activityType: 'update_user_status',
      details: `Admin updated user status for ${updatedUser.email} from ${userBefore.status} to ${status}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      metadata: {
        method: req.method,
        path: req.path,
        params: req.params,
        targetUserId: userId,
        oldStatus: userBefore.status,
        newStatus: status
      }
    });
    
    res.json({ message: 'User status updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Delete user - Super Admin only
router.delete('/users/:id', isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    
    // Get user before deletion
    const userBefore = await storage.getUser(userId);
    if (!userBefore) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prevent deleting another super admin
    if (userBefore.role === 'superadmin' && userBefore.id !== req.user?.id) {
      return res.status(403).json({ error: 'Cannot delete another super admin account' });
    }
    
    // Mark as deleted instead of actual deletion
    const updatedUser = await storage.updateUser(userId, { 
      status: 'deleted',
      email: `deleted-${userBefore.email}-${Date.now()}` // Prevent email reuse
    });
    
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found or delete operation failed' });
    }
    
    // Log activity
    logUserActivityWithParams({
      userId: req.user?.id || 'unknown',
      category: 'ADMIN',
      activityType: 'delete_user',
      details: `Admin deleted user ${userBefore.email}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      metadata: {
        method: req.method,
        path: req.path,
        params: req.params,
        targetUserId: userId,
        userEmail: userBefore.email
      }
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Send password reset link - Admin only
router.post('/reset-password/:id', async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    
    // Get user
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Prevent modifying super admin unless you're also super admin
    if (user.role === 'superadmin' && req.user?.role !== 'superadmin') {
      return res.status(403).json({ error: 'Cannot reset password for a super admin account' });
    }
    
    // In a real implementation, this would generate a token and send an email
    // For now, we'll just log that this happened
    
    // Log activity
    logUserActivityWithParams({
      userId: req.user?.id || 'unknown',
      category: 'ADMIN',
      activityType: 'send_password_reset',
      details: `Admin requested password reset for ${user.email}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      metadata: {
        method: req.method,
        path: req.path,
        params: req.params,
        targetUserId: userId,
        userEmail: user.email
      }
    });
    
    res.json({ message: 'Password reset link sent successfully' });
  } catch (error) {
    console.error('Error sending password reset:', error);
    res.status(500).json({ error: 'Failed to send password reset link' });
  }
});

export default router;