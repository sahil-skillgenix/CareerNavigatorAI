import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { IStorage, storage } from "./storage";
import { setupAuth } from "./auth";
import { hashPassword } from "./mongodb-storage";
// Import the fixed OpenAI service
import { analyzeCareerPathway, CareerAnalysisInput } from "./openai-service-fixed";
import { analyzeOrganizationPathway, OrganizationPathwayInput } from "./organization-service";
import { jwtAuthMiddleware } from "./services/jwt-service";
import { 
  getResourceRecommendations, 
  generateLearningPath, 
  SkillToLearn,
  LearningResource,
  LearningPathRecommendation
} from "./learning-resources-service";
import { seedDatabase } from "./seed-data";
import * as CareerDataService from "./mongodb-career-data-service";
import { 
  getUserActivityLogs, 
  getUserActivitySummary, 
  getUserActivityHistory,
  getErrorLogs,
  getAPIRequestLogs,
  logUserActivity,
  logUserActivityWithParams
} from "./services/logging-service";
import { UserActivityLogModel } from "./db/models";
import { getUserLoginHistory, getUserActivity } from "./services/activity-logger";
import { getDatabaseStatus } from "./db/mongodb";
import adminRoutes from "./routes/admin-routes";

export async function registerRoutes(app: Express, customStorage?: IStorage): Promise<Server> {
  // Use provided storage or fallback to in-memory storage
  const storageInstance = customStorage || storage;
  
  // Setup authentication
  setupAuth(app, storageInstance);

  // Mount admin routes
  app.use('/api/admin', adminRoutes);
  console.log('Admin routes mounted at /api/admin');

  // User activity API endpoint
  app.get('/api/activity', jwtAuthMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const userActivity = await getUserActivity(req.user.id);
      res.json(userActivity);
      
      // Log this API request
      await logUserActivityWithParams({
        userId: req.user.id,
        action: 'feature_usage',
        category: 'USER',
        details: 'User viewed their activity history',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string
      });
    } catch (error) {
      console.error('Error fetching user activity:', error);
      res.status(500).json({ error: 'Failed to fetch activity history' });
    }
  });

  // User login history API endpoint
  app.get('/api/login-history', jwtAuthMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const loginHistory = await getUserLoginHistory(req.user.id);
      res.json(loginHistory);
    } catch (error) {
      console.error('Error fetching login history:', error);
      res.status(500).json({ error: 'Failed to fetch login history' });
    }
  });

  // Career analysis API endpoint
  app.post('/api/career-analysis', async (req: Request, res: Response) => {
    try {
      // Skip authentication check for now to isolate the API issue
      // Access the input directly from the request body
      const input: CareerAnalysisInput = req.body;
      
      if (!input.professionalLevel || !input.currentSkills || 
          !input.educationalBackground || !input.careerHistory || !input.desiredRole) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          message: 'Please provide all required career information'
        });
      }

      console.log('Processing career analysis request');
      
      // Use dynamic import to ensure we're using the fixed version with ESM compatibility
      const { analyzeCareerPathway } = await import('./openai-service-fixed');
      
      // Call OpenAI service to analyze career pathway
      const result = await analyzeCareerPathway(input);
      
      // Log basic info about the request without requiring user ID
      console.log('Career analysis completed successfully');
      
      // Return result directly
      return res.json(result);
    } catch (error) {
      console.error('Error analyzing career pathway:', error);
      return res.status(500).json({ 
        error: 'Failed to analyze career pathway',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });

  // Learning resources recommendations API endpoint
  app.post('/api/learning-resources', jwtAuthMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const skillToLearn: SkillToLearn = req.body;
      
      if (!skillToLearn.skill || !skillToLearn.currentLevel || !skillToLearn.targetLevel) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const resources = await getResourceRecommendations(skillToLearn);
      
      // Log this API request
      await logUserActivityWithParams({
        userId: req.user.id,
        action: 'get_learning_resources',
        category: 'FEATURE',
        details: 'User requested learning resources',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
        metadata: {
          skill: skillToLearn.skill,
          currentLevel: skillToLearn.currentLevel,
          targetLevel: skillToLearn.targetLevel
        }
      });
      
      res.json(resources);
    } catch (error) {
      console.error('Error getting resource recommendations:', error);
      res.status(500).json({ error: 'Failed to get learning resources' });
    }
  });

  // Learning path generation API endpoint
  app.post('/api/learning-path', jwtAuthMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const skillToLearn: SkillToLearn = req.body;
      
      if (!skillToLearn.skill || !skillToLearn.currentLevel || !skillToLearn.targetLevel) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const learningPath = await generateLearningPath(skillToLearn);
      
      // Log this API request
      await logUserActivityWithParams({
        userId: req.user.id,
        action: 'generate_learning_path',
        category: 'FEATURE',
        details: 'User generated a learning path',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
        metadata: {
          skill: skillToLearn.skill,
          currentLevel: skillToLearn.currentLevel,
          targetLevel: skillToLearn.targetLevel
        }
      });
      
      res.json(learningPath);
    } catch (error) {
      console.error('Error generating learning path:', error);
      res.status(500).json({ error: 'Failed to generate learning path' });
    }
  });

  // Organization pathway analysis API endpoint
  app.post('/api/organization-pathway', jwtAuthMiddleware, async (req: Request, res: Response) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const input: OrganizationPathwayInput = req.body;
      
      if (!input.organizationSize || !input.industryType || !input.currentSkills || !input.futureGoals) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      const result = await analyzeOrganizationPathway(input);
      
      // Log this API request
      await logUserActivityWithParams({
        userId: req.user.id,
        action: 'analyze_organization_pathway',
        category: 'FEATURE',
        details: 'User analyzed organization pathway',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
        metadata: {
          organizationSize: input.organizationSize,
          industryType: input.industryType
        }
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error analyzing organization pathway:', error);
      res.status(500).json({ error: 'Failed to analyze organization pathway' });
    }
  });

  // Simple OpenAI test endpoint 
  app.get('/api/openai-test', async (req: Request, res: Response) => {
    try {
      // Use our separate test service
      const { testOpenAI } = await import('./openai-service-test');
      
      const message = await testOpenAI();
      return res.json({ success: true, message });
    } catch (error) {
      console.error('OpenAI test error:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'OpenAI API error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Dashboard API endpoint
  app.get('/api/dashboard', jwtAuthMiddleware, async (req: Request & { jwtUser?: any, user?: any }, res: Response) => {
    try {
      // Ensure user is authenticated - check both jwtUser (JWT auth) and user (session auth)
      if (!req.jwtUser && !req.user) {
        console.log('User not authenticated when accessing dashboard');
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in to access dashboard data'
        });
      }

      // Get user ID from either JWT or session
      console.log('Dashboard - Auth info:', { 
        hasJwtUser: !!req.jwtUser, 
        jwtUserId: req.jwtUser?.userId,
        hasUser: !!req.user,
        userId: req.user?.id
      });
      
      const userId = req.jwtUser?.userId || req.user?.id;
      if (!userId) {
        return res.status(400).json({
          error: 'Invalid user ID',
          message: 'Could not determine user ID from authentication'
        });
      }
      
      console.log(`Fetching dashboard data for user: ${userId}`);
      
      // Get career analyses for the user
      const careerAnalyses = await storageInstance.getUserCareerAnalyses(userId);
      console.log(`Found ${careerAnalyses.length} career analyses for user ${userId}`);
      
      // Get user progress items
      const progressItems = await storageInstance.getUserProgress(userId);
      
      // Get user badges
      const badges = await storageInstance.getUserBadges(userId);
      
      // Get user activity
      const recentActivity = await getUserActivity(userId.toString(), 5);

      return res.json({
        careerAnalyses,
        progressItems,
        badges,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return res.status(500).json({
        error: 'Failed to fetch dashboard data',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });
  
  // Route to save career analysis to database
  app.post('/api/save-career-analysis', jwtAuthMiddleware, async (req: Request & { jwtUser?: any, user?: any }, res: Response) => {
    try {
      // Ensure user is authenticated - check both jwtUser (JWT auth) and user (session auth)
      if (!req.jwtUser && !req.user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in to save an analysis'
        });
      }
      
      // Get user ID from either JWT or session
      console.log('Save Analysis - Auth info:', { 
        hasJwtUser: !!req.jwtUser, 
        jwtUserId: req.jwtUser?.userId,
        hasUser: !!req.user,
        userId: req.user?.id
      });
      
      const userId = req.jwtUser?.userId || req.user?.id;
      if (!userId) {
        return res.status(400).json({
          error: 'Invalid user ID',
          message: 'Could not determine user ID from authentication'
        });
      }
      
      console.log(`Saving career analysis for user: ${userId}`);
      
      // Extract data from the request body
      const { 
        professionalLevel, 
        currentSkills, 
        educationalBackground, 
        careerHistory, 
        desiredRole, 
        state = '', 
        country = '', 
        result 
      } = req.body;
      
      // Validate required fields
      if (!professionalLevel || !currentSkills || !educationalBackground || !careerHistory || !desiredRole) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Please provide all required fields to save the analysis'
        });
      }
      
      // Create new career analysis record
      const analysis = await storageInstance.saveCareerAnalysis({
        userId,
        professionalLevel,
        currentSkills,
        educationalBackground,
        careerHistory,
        desiredRole,
        state: state || '',  // Ensure we have a string value
        country: country || '',  // Ensure we have a string value
        result,
        progress: 0
      });
      
      // Log the activity
      await logUserActivity(userId.toString(), 'save_career_analysis', 'success', 'saved a career analysis', {
        analysisId: analysis.id,
        desiredRole
      });
      
      console.log(`Successfully saved career analysis with ID: ${analysis.id}`);
      
      return res.status(201).json(analysis);
    } catch (error) {
      console.error('Error saving career analysis:', error);
      return res.status(500).json({
        error: 'Failed to save career analysis',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}