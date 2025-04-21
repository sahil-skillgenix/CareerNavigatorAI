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
import { seedDatabase } from "./seed-data";
import * as CareerDataService from "./career-data-service";

export async function registerRoutes(app: Express, customStorage?: IStorage): Promise<Server> {
  // Use provided storage or fallback to in-memory storage
  const storageInstance = customStorage || storage;
  
  // Setup authentication
  setupAuth(app, storageInstance);

  // Seed database with initial data (will only run if database is empty)
  try {
    await seedDatabase();
    console.log('Database check/seed completed');
  } catch (error) {
    console.error('Error seeding database:', error);
  }

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

  // Career Data API Endpoints

  // Skills endpoints
  app.get('/api/skills', async (req: Request, res: Response) => {
    try {
      const { query, category } = req.query;
      
      let skills;
      if (query) {
        skills = await CareerDataService.searchSkills(query as string);
      } else if (category) {
        skills = await CareerDataService.getSkillsByCategory(category as string);
      } else {
        skills = await CareerDataService.getAllSkills();
      }
      
      res.json(skills);
    } catch (error) {
      console.error('Error fetching skills:', error);
      res.status(500).json({ 
        error: 'Failed to fetch skills', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/skills/popular', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const skills = await CareerDataService.getPopularSkills(limit);
      res.json(skills);
    } catch (error) {
      console.error('Error fetching popular skills:', error);
      res.status(500).json({ 
        error: 'Failed to fetch popular skills', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/skills/:id', async (req: Request, res: Response) => {
    try {
      const skillId = parseInt(req.params.id);
      if (isNaN(skillId)) {
        return res.status(400).json({ error: 'Invalid skill ID' });
      }
      
      const skill = await CareerDataService.getSkillById(skillId);
      if (!skill) {
        return res.status(404).json({ error: 'Skill not found' });
      }
      
      res.json(skill);
    } catch (error) {
      console.error('Error fetching skill:', error);
      res.status(500).json({ 
        error: 'Failed to fetch skill', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/skills/:id/profile', async (req: Request, res: Response) => {
    try {
      const skillId = parseInt(req.params.id);
      if (isNaN(skillId)) {
        return res.status(400).json({ error: 'Invalid skill ID' });
      }
      
      const skillProfile = await CareerDataService.getCompleteSkillProfile(skillId);
      if (!skillProfile) {
        return res.status(404).json({ error: 'Skill not found' });
      }
      
      res.json(skillProfile);
    } catch (error) {
      console.error('Error fetching skill profile:', error);
      res.status(500).json({ 
        error: 'Failed to fetch skill profile', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/skills/:id/learning-path', async (req: Request, res: Response) => {
    try {
      const skillId = parseInt(req.params.id);
      if (isNaN(skillId)) {
        return res.status(400).json({ error: 'Invalid skill ID' });
      }
      
      const learningPath = await CareerDataService.getSkillAcquisitionPathway(skillId);
      if (!learningPath) {
        return res.status(404).json({ error: 'Skill not found' });
      }
      
      res.json(learningPath);
    } catch (error) {
      console.error('Error fetching skill learning path:', error);
      res.status(500).json({ 
        error: 'Failed to fetch skill learning path', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Roles endpoints
  app.get('/api/roles', async (req: Request, res: Response) => {
    try {
      const { query, category } = req.query;
      
      let roles;
      if (query) {
        roles = await CareerDataService.searchRoles(query as string);
      } else if (category) {
        roles = await CareerDataService.getRolesByCategory(category as string);
      } else {
        roles = await CareerDataService.getAllRoles();
      }
      
      res.json(roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ 
        error: 'Failed to fetch roles', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/roles/popular', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const roles = await CareerDataService.getPopularRoles(limit);
      res.json(roles);
    } catch (error) {
      console.error('Error fetching popular roles:', error);
      res.status(500).json({ 
        error: 'Failed to fetch popular roles', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/roles/:id', async (req: Request, res: Response) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ error: 'Invalid role ID' });
      }
      
      const role = await CareerDataService.getRoleById(roleId);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }
      
      res.json(role);
    } catch (error) {
      console.error('Error fetching role:', error);
      res.status(500).json({ 
        error: 'Failed to fetch role', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/roles/:id/profile', async (req: Request, res: Response) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ error: 'Invalid role ID' });
      }
      
      const roleProfile = await CareerDataService.getCompleteRoleProfile(roleId);
      if (!roleProfile) {
        return res.status(404).json({ error: 'Role not found' });
      }
      
      res.json(roleProfile);
    } catch (error) {
      console.error('Error fetching role profile:', error);
      res.status(500).json({ 
        error: 'Failed to fetch role profile', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/roles/:id/skills', async (req: Request, res: Response) => {
    try {
      const roleId = parseInt(req.params.id);
      if (isNaN(roleId)) {
        return res.status(400).json({ error: 'Invalid role ID' });
      }
      
      const skills = await CareerDataService.getSkillsForRole(roleId);
      res.json(skills);
    } catch (error) {
      console.error('Error fetching role skills:', error);
      res.status(500).json({ 
        error: 'Failed to fetch role skills', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Industries endpoints
  app.get('/api/industries', async (req: Request, res: Response) => {
    try {
      const { query, category } = req.query;
      
      let industries;
      if (query) {
        industries = await CareerDataService.searchIndustries(query as string);
      } else if (category) {
        industries = await CareerDataService.getIndustryByCategory(category as string);
      } else {
        industries = await CareerDataService.getAllIndustries();
      }
      
      res.json(industries);
    } catch (error) {
      console.error('Error fetching industries:', error);
      res.status(500).json({ 
        error: 'Failed to fetch industries', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/industries/popular', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const industries = await CareerDataService.getPopularIndustries(limit);
      res.json(industries);
    } catch (error) {
      console.error('Error fetching popular industries:', error);
      res.status(500).json({ 
        error: 'Failed to fetch popular industries', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/industries/:id', async (req: Request, res: Response) => {
    try {
      const industryId = parseInt(req.params.id);
      if (isNaN(industryId)) {
        return res.status(400).json({ error: 'Invalid industry ID' });
      }
      
      const industry = await CareerDataService.getIndustryById(industryId);
      if (!industry) {
        return res.status(404).json({ error: 'Industry not found' });
      }
      
      res.json(industry);
    } catch (error) {
      console.error('Error fetching industry:', error);
      res.status(500).json({ 
        error: 'Failed to fetch industry', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/industries/:id/profile', async (req: Request, res: Response) => {
    try {
      const industryId = parseInt(req.params.id);
      if (isNaN(industryId)) {
        return res.status(400).json({ error: 'Invalid industry ID' });
      }
      
      const industryProfile = await CareerDataService.getCompleteIndustryProfile(industryId);
      if (!industryProfile) {
        return res.status(404).json({ error: 'Industry not found' });
      }
      
      res.json(industryProfile);
    } catch (error) {
      console.error('Error fetching industry profile:', error);
      res.status(500).json({ 
        error: 'Failed to fetch industry profile', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Career pathway endpoints
  app.get('/api/pathways', async (req: Request, res: Response) => {
    try {
      const pathways = await CareerDataService.getAllCareerPathways();
      res.json(pathways);
    } catch (error) {
      console.error('Error fetching career pathways:', error);
      res.status(500).json({ 
        error: 'Failed to fetch career pathways', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/pathways/:id', async (req: Request, res: Response) => {
    try {
      const pathwayId = parseInt(req.params.id);
      if (isNaN(pathwayId)) {
        return res.status(400).json({ error: 'Invalid pathway ID' });
      }
      
      const pathway = await CareerDataService.getCareerPathwayById(pathwayId);
      if (!pathway) {
        return res.status(404).json({ error: 'Career pathway not found' });
      }
      
      res.json(pathway);
    } catch (error) {
      console.error('Error fetching career pathway:', error);
      res.status(500).json({ 
        error: 'Failed to fetch career pathway', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/career-transition', async (req: Request, res: Response) => {
    try {
      const fromRoleId = parseInt(req.query.fromRole as string);
      const toRoleId = parseInt(req.query.toRole as string);
      
      if (isNaN(fromRoleId) || isNaN(toRoleId)) {
        return res.status(400).json({ error: 'Invalid role IDs. Both fromRole and toRole must be valid numbers.' });
      }
      
      const transitionPath = await CareerDataService.getCareerTransitionPathway(fromRoleId, toRoleId);
      if (!transitionPath) {
        return res.status(404).json({ error: 'One or both roles not found' });
      }
      
      res.json(transitionPath);
    } catch (error) {
      console.error('Error fetching career transition pathway:', error);
      res.status(500).json({ 
        error: 'Failed to fetch career transition pathway', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Search across all entities
  app.get('/api/search', async (req: Request, res: Response) => {
    try {
      const { query } = req.query;
      
      console.log('Search query received:', query);
      
      if (!query || typeof query !== 'string' || query.trim() === '') {
        return res.status(400).json({ error: 'Query parameter is required' });
      }
      
      const results = await CareerDataService.searchAll(query as string);
      console.log('Search results:', JSON.stringify(results));
      res.json(results);
    } catch (error) {
      console.error('Error performing search:', error);
      res.status(500).json({ 
        error: 'Failed to perform search', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
