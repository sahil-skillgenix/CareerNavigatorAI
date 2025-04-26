import { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { IStorage, storage } from "./storage";
import { logUserActivity, getUserActivity } from "./services/activity-logger";
import { analyzeCareerPathway, CareerAnalysisInput, CareerAnalysisOutput } from "./openai-service-fixed";

// Additional types for the API
interface SkillToLearn {
  skillName: string;
  currentLevel?: string;
  targetLevel?: string;
}

interface OrganizationPathwayInput {
  organizationId: string;
  organizationSize?: string;
  industryType?: string;
  currentSkills?: string[];
  futureGoals?: string[];
}

/**
 * Register all the application routes
 * @param app Express application
 * @param customStorage Optional custom storage (used mainly for testing)
 * @returns HTTP server instance
 */
export async function registerRoutes(app: Express, customStorage?: IStorage): Promise<Server> {
  // Use provided storage or default to the global one
  const storageInstance = customStorage || storage;
  
  // Home route
  app.get('/api', (req: Request, res: Response) => {
    res.json({ message: 'Skillgenix Career API' });
  });
  
  // Activity history endpoint - returns user's recent activity
  app.get('/api/activity', async (req: Request & { user?: any }, res: Response) => {
    try {
      // Get user ID from session
      const userId = req.user?.id || req.body?.userId;
      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in to view activity'
        });
      }
      
      // Get the limit parameter or default to 10
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      // Get user activity
      const activities = await getUserActivity(userId.toString(), limit);
      
      return res.json(activities);
    } catch (error) {
      console.error('Error fetching activity:', error);
      return res.status(500).json({
        error: 'Failed to fetch activity',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });
  
  // Login history endpoint - returns user's login history
  app.get('/api/login-history', async (req: Request & { user?: any }, res: Response) => {
    try {
      // Get user ID from session
      const userId = req.user?.id || req.query.userId || req.body?.userId;
      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in to view login history'
        });
      }
      
      // Get login history from storage
      const loginHistory = await storageInstance.getUserLoginHistory(userId);
      
      return res.json(loginHistory);
    } catch (error) {
      console.error('Error fetching login history:', error);
      return res.status(500).json({
        error: 'Failed to fetch login history',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });
  
  /**
   * Career Analysis API - processes user input and generates career analysis using AI
   * This is a key feature of the application and should be handled with care
   */
  app.post('/api/career-analysis', async (req: Request, res: Response) => {
    console.log('Processing career analysis request');
    try {
      // Extract and validate input
      const input: CareerAnalysisInput = req.body;
      
      // Delegate to OpenAI service
      const result = await analyzeCareerPathway(input);
      
      console.log('Career analysis completed successfully');
      return res.json(result);
    } catch (error) {
      console.error('Error generating career analysis:', error);
      return res.status(500).json({
        error: 'Failed to generate career analysis',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });
  
  // Learning resources recommendation endpoint
  app.post('/api/learning-resources', async (req: Request & { user?: any }, res: Response) => {
    try {
      // Extract the skill to learn from request body
      const skillToLearn: SkillToLearn = req.body;
      
      // Get user ID from session
      const userId = req.user?.id || req.body?.userId;
      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in to get learning resources'
        });
      }
      
      // Log this activity
      await logUserActivity(userId.toString(), 'get_learning_resources', 'success', 'requested learning resources', {
        skillName: skillToLearn.skillName,
        currentLevel: skillToLearn.currentLevel
      });
      
      // Get learning resources from storage (or generate them with AI if needed)
      const resources = await storageInstance.getLearningResources(skillToLearn);
      
      return res.json(resources);
    } catch (error) {
      console.error('Error getting learning resources:', error);
      return res.status(500).json({
        error: 'Failed to get learning resources',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });
  
  // Learning path generation endpoint
  app.post('/api/learning-path', async (req: Request & { user?: any }, res: Response) => {
    try {
      // Extract the skill to learn from request body
      const skillToLearn: SkillToLearn = req.body;
      
      // Get user ID from session
      const userId = req.user?.id || req.body?.userId;
      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in to generate a learning path'
        });
      }
      
      // Log this activity
      await logUserActivity(userId.toString(), 'generate_learning_path', 'success', 'generated a learning path', {
        skillName: skillToLearn.skillName,
        targetLevel: skillToLearn.targetLevel
      });
      
      // Generate the learning path
      const learningPath = await storageInstance.generateLearningPath(skillToLearn);
      
      return res.json(learningPath);
    } catch (error) {
      console.error('Error generating learning path:', error);
      return res.status(500).json({
        error: 'Failed to generate learning path',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });
  
  // Organization pathway analysis endpoint
  app.post('/api/organization-pathway', async (req: Request & { user?: any }, res: Response) => {
    try {
      // Extract input from request body
      const input: OrganizationPathwayInput = req.body;
      
      // Get user ID from session
      const userId = req.user?.id || req.body?.userId;
      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in to analyze organization pathway'
        });
      }
      
      // Log this activity
      await logUserActivity(userId.toString(), 'analyze_organization_pathway', 'success', 'analyzed organization pathway', {
        organizationSize: input.organizationSize,
        industryType: input.industryType,
        currentSkills: input.currentSkills?.length,
        futureGoals: input.futureGoals?.length
      });
      
      // Generate the organization pathway analysis
      const result = await storageInstance.generateOrganizationPathway({
        organizationSize: input.organizationSize,
        industryType: input.industryType,
        userId: userId.toString()
      });
      
      return res.json(result);
    } catch (error) {
      console.error('Error analyzing organization pathway:', error);
      return res.status(500).json({
        error: 'Failed to analyze organization pathway',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });
  
  // OpenAI test endpoint - simple test for OpenAI connection
  app.get('/api/openai-test', async (req: Request, res: Response) => {
    try {
      return res.json({ message: "OpenAI connection test successful" });
    } catch (error) {
      console.error('OpenAI test error:', error);
      return res.status(500).json({
        error: 'OpenAI connection test failed',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });

  // Dashboard API endpoint
  app.get('/api/dashboard', async (req: Request & { user?: any }, res: Response) => {
    try {
      console.log('DASHBOARD - REQUEST HEADERS:', req.headers);
      
      // Get user ID from session or request body
      const userId = req.user?.id || req.query.userId || req.body?.userId;
      console.log('Dashboard - User ID:', userId);
      
      // If no userId, return unauthorized
      if (!userId) {
        console.log('User not authenticated when accessing dashboard');
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'You must be logged in to access dashboard data'
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
  app.post('/api/save-career-analysis', async (req: Request & { user?: any }, res: Response) => {
    try {
      console.log('SAVE ANALYSIS - REQUEST HEADERS:', req.headers);
      console.log('SAVE ANALYSIS - REQUEST BODY:', { 
        userId: req.body?.userId,
        desiredRole: req.body?.desiredRole,
        // Don't log the entire body as it's too large
      });
      
      // Get user ID from session or body
      const userId = req.user?.id || req.body?.userId;
      console.log('SAVE ANALYSIS - USER ID:', userId);
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