import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { IStorage, storage } from "./storage";
import { setupAuth } from "./auth";
import { analyzeCareerPathway, CareerAnalysisInput } from "./openai-service";
import { analyzeOrganizationPathway, OrganizationPathwayInput } from "./organization-service";
import { 
  getResourceRecommendations, 
  generateLearningPath, 
  SkillToLearn,
  LearningResource,
  LearningPathRecommendation
} from "./learning-resources-service";

export async function registerRoutes(app: Express, customStorage?: IStorage): Promise<Server> {
  // Use provided storage or fallback to in-memory storage
  const storageInstance = customStorage || storage;
  
  // Setup authentication
  setupAuth(app, storageInstance);

  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Skillgenix server is running' });
  });
  
  // Protected routes - require authentication
  app.get('/api/dashboard', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Mock dashboard data for initial implementation
    res.json({ 
      message: 'Welcome to your career planning dashboard',
      careerPaths: [
        { id: 1, title: 'Technical Career Path', progress: 35 },
        { id: 2, title: 'Management Career Path', progress: 20 },
        { id: 3, title: 'Creative Career Path', progress: 15 },
      ],
      suggestedSkills: [
        { id: 1, name: 'Leadership', category: 'Soft Skills' },
        { id: 2, name: 'JavaScript', category: 'Technical Skills' },
        { id: 3, name: 'Strategic Planning', category: 'Management' },
      ],
      upcomingMilestones: [
        { id: 1, title: 'Complete Leadership Course', dueDate: '2025-05-15' },
        { id: 2, title: 'Technical Certification', dueDate: '2025-06-30' },
      ]
    });
  });
  
  // Career Pathway Analysis Endpoint
  app.post('/api/career-analysis', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const { 
        professionalLevel, 
        currentSkills, 
        educationalBackground, 
        careerHistory, 
        desiredRole,
        state,
        country
      } = req.body;
      
      // Validate required fields
      if (!professionalLevel || !currentSkills || !educationalBackground || 
          !careerHistory || !desiredRole) {
        return res.status(400).json({ 
          error: 'Missing required fields. Please provide all career information.' 
        });
      }
      
      // Check if currentSkills exceeds max length (50)
      if (currentSkills.split(',').length > 50) {
        return res.status(400).json({ 
          error: 'Current skills exceed the maximum limit of 50 skills.'
        });
      }
      
      // Check if desiredRole exceeds 250 characters
      if (desiredRole.length > 250) {
        return res.status(400).json({ 
          error: 'Desired role exceeds the maximum limit of 250 characters.'
        });
      }
      
      const input: CareerAnalysisInput = {
        professionalLevel,
        currentSkills,
        educationalBackground,
        careerHistory,
        desiredRole,
        state,
        country
      };
      
      const analysisResult = await analyzeCareerPathway(input);
      
      // Verify that the response has all required sections
      const requiredSections = [
        'executiveSummary', 
        'skillMapping', 
        'skillGapAnalysis', 
        'careerPathway', 
        'developmentPlan', 
        'reviewNotes'
      ];
      
      // Cast to any to avoid TypeScript errors with dynamic property access
      const missingFields = requiredSections.filter(section => !(analysisResult as any)[section]);
      
      if (missingFields.length > 0) {
        console.error('Career analysis missing required fields:', missingFields);
        return res.status(500).json({
          error: 'Incomplete career analysis',
          message: 'The career analysis is missing required data. Please try again.',
          missingFields
        });
      }
      
      res.json(analysisResult);
    } catch (error) {
      console.error('Error in career analysis:', error);
      res.status(500).json({ 
        error: 'Failed to analyze career pathway', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
  
  // Learning Resources Recommendation Endpoint
  app.post('/api/learning-resources', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const { skills, preferredTypes, maxResults } = req.body;
      
      // Validate request
      if (!skills || !Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Please provide at least one skill to learn'
        });
      }
      
      // Validate each skill object has required properties
      const invalidSkills = skills.filter((skill: any) => 
        !skill.skill || !skill.currentLevel || !skill.targetLevel || !skill.context
      );
      
      if (invalidSkills.length > 0) {
        return res.status(400).json({
          error: 'Invalid skills data',
          message: 'Each skill must include: skill name, current level, target level, and context'
        });
      }
      
      const recommendations = await getResourceRecommendations(
        skills, 
        preferredTypes, 
        maxResults || 5
      );
      
      res.json(recommendations);
    } catch (error) {
      console.error('Error getting learning resources:', error);
      res.status(500).json({
        error: 'Failed to get learning resources',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Learning Path Generation Endpoint
  app.post('/api/learning-path', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const { skill, currentLevel, targetLevel, context, learningStyle } = req.body;
      
      // Validate request
      if (!skill || !currentLevel || !targetLevel || !context) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Please provide skill name, current level, target level, and context'
        });
      }
      
      const learningPath = await generateLearningPath(
        skill,
        currentLevel,
        targetLevel,
        context,
        learningStyle
      );
      
      res.json(learningPath);
    } catch (error) {
      console.error('Error generating learning path:', error);
      res.status(500).json({
        error: 'Failed to generate learning path',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Organization Pathway Analysis Endpoint
  app.post('/api/organization-pathway', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const { 
        organizationId,
        organizationName,
        currentRole,
        skills,
        desiredRole
      } = req.body;
      
      // Validate required fields
      if (!currentRole || !skills || !desiredRole) {
        return res.status(400).json({ 
          error: 'Missing required fields. Please provide current role, skills, and desired role.' 
        });
      }
      
      // Validate that at least one organization identifier is provided
      if (!organizationId && !organizationName) {
        return res.status(400).json({
          error: 'Either organization ID or organization name must be provided.'
        });
      }
      
      const input: OrganizationPathwayInput = {
        organizationId,
        organizationName,
        currentRole,
        skills,
        desiredRole
      };
      
      const analysisResult = await analyzeOrganizationPathway(input);
      
      res.json(analysisResult);
    } catch (error) {
      console.error('Error in organization pathway analysis:', error);
      res.status(500).json({ 
        error: 'Failed to analyze organization pathway', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
