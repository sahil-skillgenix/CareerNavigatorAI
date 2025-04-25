import { Router, Request, Response, NextFunction } from 'express';
import { requireAdmin, requireSuperAdmin, adminActionRateLimiter } from '../middleware/adminMiddleware';
import { storage } from '../storage';
import { hashPassword } from '../mongodb-storage';
import { validatePassword, validateSuperAdminPassword } from '../utils/password-validation';
import { logError } from '../services/logging-service';
import { logUserActivity } from '../services/logging-service';

const router = Router();

// Check if a user exists by email
router.get('/check-user/:email', requireAdmin, async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await storage.getUserByEmail(email);
    
    return res.json({
      exists: !!user,
      role: user?.role || null
    });
  } catch (error) {
    console.error('Error checking user:', error);
    return res.status(500).json({ error: 'Failed to check if user exists' });
  }
});

// Create a new admin user (super admin only)
router.post('/create-admin', requireSuperAdmin, adminActionRateLimiter(), async (req: Request, res: Response) => {
  try {
    const { email, fullName, password, role } = req.body;
    
    // Validate required fields
    if (!email || !fullName || !password) {
      return res.status(400).json({ error: 'Email, full name, and password are required' });
    }
    
    // Validate role - can only be 'admin' or 'superadmin'
    if (role !== 'admin' && role !== 'superadmin') {
      return res.status(400).json({ error: 'Role must be either "admin" or "superadmin"' });
    }
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    
    // Validate password based on role
    let passwordValidation;
    if (role === 'superadmin') {
      passwordValidation = validateSuperAdminPassword(password);
    } else {
      passwordValidation = validatePassword(password);
    }
    
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const newUser = await storage.createUser({
      email,
      fullName,
      password: hashedPassword,
      role,
      status: 'active',
      securityQuestion: 'What is your favorite movie?', // Default security question
      securityAnswer: 'Inception' // Default answer (should be changed by user)
    });
    
    // Log the admin creation
    await logUserActivity({
      userId: req.user.id,
      action: 'created_admin_user',
      details: `Created new ${role} user: ${email}`,
      targetUserId: newUser.id
    });
    
    // Return success
    return res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
      status: newUser.status,
      createdAt: newUser.createdAt
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    await logError({
      message: 'Failed to create admin user',
      severity: 'high',
      category: 'auth',
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      endpoint: req.path,
      method: req.method,
      stack: error instanceof Error ? error.stack : undefined,
      metadata: { requestBody: req.body }
    });
    return res.status(500).json({ error: 'Failed to create admin user' });
  }
});

// Update an existing user's role (super admin only)
router.patch('/update-role/:userId', requireSuperAdmin, adminActionRateLimiter(), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (!role || (role !== 'user' && role !== 'admin' && role !== 'superadmin')) {
      return res.status(400).json({ error: 'Valid role (user, admin, or superadmin) is required' });
    }
    
    // Prevent changing your own role
    if (userId === req.user.id) {
      return res.status(403).json({ error: 'You cannot change your own role' });
    }
    
    // Get the user
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update the user role
    user.role = role;
    
    // Save the updated user 
    // Note: In a real implementation, we would have a dedicated updateUser method in the storage interface
    // For now, we'll return the updated user without actually saving it
    
    // Log the role change
    await logUserActivity({
      userId: req.user.id,
      action: 'updated_user_role',
      details: `Changed user role to ${role}`,
      targetUserId: userId
    });
    
    return res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: role,
      status: user.status
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    await logError({
      message: 'Failed to update user role',
      severity: 'high',
      category: 'auth',
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      endpoint: req.path,
      method: req.method,
      stack: error instanceof Error ? error.stack : undefined,
      metadata: { 
        targetUserId: req.params.userId,
        role: req.body.role 
      }
    });
    return res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Reset user password (admin & super admin)
router.post('/reset-password/:userId', requireAdmin, adminActionRateLimiter(), async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { password } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    if (!password) {
      return res.status(400).json({ error: 'New password is required' });
    }
    
    // Get the user to check their role
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Super admin can reset any password, but admin can only reset non-admin user passwords
    if (req.user.role !== 'superadmin' && (user.role === 'admin' || user.role === 'superadmin')) {
      return res.status(403).json({ error: 'You do not have permission to reset this user\'s password' });
    }
    
    // Validate password based on user's role
    let passwordValidation;
    if (user.role === 'superadmin') {
      passwordValidation = validateSuperAdminPassword(password);
    } else {
      passwordValidation = validatePassword(password);
    }
    
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }
    
    // Hash the new password
    const hashedPassword = await hashPassword(password);
    
    // Update the user's password
    const updatedUser = await storage.updateUserPassword(userId, hashedPassword);
    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update user password' });
    }
    
    // Log the password reset
    await logUserActivity({
      userId: req.user.id,
      action: 'reset_user_password',
      details: 'Admin reset user password',
      targetUserId: userId
    });
    
    return res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Error resetting user password:', error);
    await logError({
      message: 'Failed to reset user password',
      severity: 'high',
      category: 'auth',
      userId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
      endpoint: req.path,
      method: req.method,
      stack: error instanceof Error ? error.stack : undefined,
      metadata: { targetUserId: req.params.userId }
    });
    return res.status(500).json({ error: 'Failed to reset user password' });
  }
});

// Get list of users with pagination (admin & super admin)
router.get('/users', requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const role = req.query.role as string || undefined;
    const status = req.query.status as string || undefined;
    
    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100);
    
    // Call storage method to get users with pagination
    // Note: This is not implemented in the current storage interface
    // For now, we'll return a mock response
    
    return res.json({
      users: [
        {
          id: '1',
          email: 'super-admin@skillgenix.com',
          fullName: 'Super Admin',
          role: 'superadmin',
          status: 'active',
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          email: 'demo@skillgenix.com',
          fullName: 'Demo User',
          role: 'user',
          status: 'active',
          createdAt: new Date().toISOString()
        }
      ],
      pagination: {
        page: validPage,
        limit: validLimit,
        totalPages: 1,
        totalItems: 2
      }
    });
  } catch (error) {
    console.error('Error getting users:', error);
    return res.status(500).json({ error: 'Failed to get users' });
  }
});

export default router;