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
import * as CareerDataService from "./mongodb-career-data-service";

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
  
  // User details endpoint
  app.get('/api/user/details', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    try {
      // Return all user details except password
      const user = req.user;
      
      // Return additional user details if needed
      res.json({
        ...user,
        location: user.location || '',
        phone: user.phone || '',
        bio: user.bio || '',
        currentRole: user.currentRole || '',
        experience: user.experience || '',
        education: user.education || '',
        skills: user.skills || '',
        interests: user.interests || '',
        avatarUrl: user.avatarUrl || ''
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user details', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
  
  // Update user details endpoint
  app.post('/api/user/details', (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    try {
      // Get updatable fields from request body
      const { 
        fullName, 
        location, 
        phone, 
        bio, 
        currentRole,
        experience,
        education,
        skills,
        interests
      } = req.body;
      
      // Update user in session (in a real app, this would update the database)
      const user = req.user;
      
      // Update fields if they were provided
      if (fullName) user.fullName = fullName;
      if (location !== undefined) user.location = location;
      if (phone !== undefined) user.phone = phone;
      if (bio !== undefined) user.bio = bio;
      if (currentRole !== undefined) user.currentRole = currentRole;
      if (experience !== undefined) user.experience = experience;
      if (education !== undefined) user.education = education;
      if (skills !== undefined) user.skills = skills;
      if (interests !== undefined) user.interests = interests;
      
      // In a real implementation, we would call something like:
      // await storageInstance.updateUser(user.id, { fullName, location, phone, bio, etc });
      
      // Return updated user details
      res.json({
        ...user,
        location: user.location || '',
        phone: user.phone || '',
        bio: user.bio || '',
        currentRole: user.currentRole || '',
        experience: user.experience || '',
        education: user.education || '',
        skills: user.skills || '',
        interests: user.interests || '',
        avatarUrl: user.avatarUrl || ''
      });
    } catch (error) {
      console.error('Error updating user details:', error);
      res.status(500).json({ 
        error: 'Failed to update user details', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });
  
  // Protected routes - require authentication
  app.get('/api/dashboard', async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    try {
      // Get the user's saved career analyses
      const analyses = await storageInstance.getUserCareerAnalyses(req.user!.id);
      
      // Get the user's progress data
      const progressItems = await storageInstance.getUserProgress(req.user!.id);
      
      // Get the user's earned badges
      const badges = await storageInstance.getUserBadges(req.user!.id);
      
      // Get popular skills, roles and industries for recommendations
      const popularSkills = await CareerDataService.getPopularSkills(5);
      const popularRoles = await CareerDataService.getPopularRoles(5);
      
      res.json({ 
        user: req.user,
        careerAnalyses: analyses,
        progressItems,
        badges,
        recommendations: {
          skills: popularSkills,
          roles: popularRoles
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      res.status(500).json({ 
        error: 'Failed to fetch dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
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
      
      // Save the analysis result to the database
      try {
        console.log('Attempting to save career analysis with these details:');
        console.log(`User ID: ${req.user!.id}`);
        console.log(`Professional Level: ${professionalLevel}`);
        console.log(`Desired Role: ${desiredRole}`);
        
        // Create a new entry in the careerAnalyses table
        const savedAnalysis = await storageInstance.saveCareerAnalysis({
          userId: req.user!.id,
          professionalLevel,
          currentSkills,
          educationalBackground,
          careerHistory,
          desiredRole,
          state: state || null,
          country: country || null,
          result: analysisResult,
          progress: 0, // Initial progress is 0%
          badges: [] // No badges yet
        });
        
        console.log(`Career analysis saved successfully. Analysis ID: ${savedAnalysis.id}`);
        
        // Check if this is the user's first career analysis
        const userAnalyses = await storageInstance.getUserCareerAnalyses(req.user!.id);
        console.log(`User has ${userAnalyses.length} saved analyses`);
        
        if (userAnalyses.length === 1) { // If we just saved the first analysis
          // Create a skill journey progress item for the user
          try {
            console.log('Creating badge for first analysis...');
            // Create a badge for the first analysis
            const badge = await storageInstance.createUserBadge({
              userId: req.user!.id,
              name: "Career Explorer",
              description: "Completed your first career analysis",
              category: "achievement",
              level: 1,
              icon: "zap"
            });
            console.log(`Badge created with ID: ${badge.id}`);
            
            console.log('Creating progress tracker...');
            // Create a progress tracking item for the career pathway
            const progress = await storageInstance.createUserProgress({
              userId: req.user!.id,
              type: "career_pathway",
              title: `Career Pathway: ${desiredRole}`,
              description: "Track your progress towards your desired career role",
              relatedItemId: savedAnalysis.id,
              progress: 0,
              milestones: [
                "Complete career analysis",
                "Review skill gap analysis",
                "Start learning recommended skills",
                "Complete at least one course",
                "Apply new skills in a project",
                "Update your resume with new skills",
                "Start networking in your target field"
              ]
            });
            console.log(`Progress tracker created with ID: ${progress.id}`);
            
            console.log(`Created first analysis badge and progress tracker for user ${req.user!.id}`);
          } catch (error) {
            console.error('Error creating badges or progress:', error);
            console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
            // Continue even if badge/progress creation fails
          }
        }
      } catch (saveError) {
        console.error('Error saving career analysis:', saveError);
        console.error('Error details:', saveError instanceof Error ? saveError.message : 'Unknown error');
        // Continue even if saving fails - don't block the user from seeing their results
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

  // Career Analysis - User History & Progress Endpoints
  
  // Get all analyses for current user
  // Career analyses endpoint  
  app.get('/api/career-analyses', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const analyses = await storageInstance.getUserCareerAnalyses(req.user!.id);
      res.json(analyses);
    } catch (error) {
      console.error('Error fetching user career analyses:', error);
      res.status(500).json({
        error: 'Failed to fetch career analyses',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Get specific analysis by ID
  app.get('/api/career-analyses/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const analysisId = req.params.id;
      const analysis = await storageInstance.getCareerAnalysisById(analysisId);
      
      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }
      
      // Verify this analysis belongs to the current user
      if (analysis.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      res.json(analysis);
    } catch (error) {
      console.error('Error fetching career analysis:', error);
      res.status(500).json({
        error: 'Failed to fetch career analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Get analysis as PDF
  app.get('/api/career-analyses/:id/pdf', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const analysisId = parseInt(req.params.id);
      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }
      
      const analysis = await storageInstance.getCareerAnalysisById(analysisId);
      
      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }
      
      // Verify this analysis belongs to the current user
      if (analysis.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Create PDF 
      try {
        const jsPDF = await import('jspdf');
        const autoTable = await import('jspdf-autotable');
        
        const doc = new jsPDF.default();
        // Set document metadata
        doc.setProperties({
          title: `Career Analysis - ${analysis.desiredRole}`,
          subject: 'Career Pathway Analysis',
          author: 'Skillgenix',
          creator: 'Skillgenix Platform'
        });
        
        // Add header with logo and title
        doc.setFontSize(22);
        doc.setTextColor(28, 59, 130); // Primary color
        doc.text('Skillgenix', 15, 20);
        doc.setFontSize(18);
        doc.setTextColor(163, 29, 82); // Secondary color
        doc.text('Career Analysis Report', 15, 30);
        
        // Add timestamp
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on ${new Date().toLocaleString()}`, 15, 38);
        
        // Add a divider
        doc.setDrawColor(200, 200, 200);
        doc.line(15, 42, 195, 42);
        
        // Add user information
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Desired Role: ${analysis.desiredRole}`, 15, 50);
        doc.text(`Professional Level: ${analysis.professionalLevel}`, 15, 58);
        if (analysis.state && analysis.country) {
          doc.text(`Location: ${analysis.state}, ${analysis.country}`, 15, 66);
        }
        
        // Executive Summary
        if (analysis.result?.executiveSummary) {
          doc.setFontSize(16);
          doc.setTextColor(28, 59, 130);
          doc.text('Executive Summary', 15, 80);
          doc.setFontSize(11);
          doc.setTextColor(60, 60, 60);
          
          const splitSummary = doc.splitTextToSize(analysis.result.executiveSummary, 180);
          doc.text(splitSummary, 15, 90);
        }
        
        let yPosition = 130; // Starting Y position for the next section
        
        // Skill Gap Analysis
        if (analysis.result?.skillGapAnalysis) {
          doc.setFontSize(16);
          doc.setTextColor(28, 59, 130);
          doc.text('Skill Gap Analysis', 15, yPosition);
          yPosition += 10;
          
          // Add gaps table if available
          if (analysis.result.skillGapAnalysis.gaps && analysis.result.skillGapAnalysis.gaps.length > 0) {
            yPosition += 5;
            
            autoTable.default(doc, {
              head: [['Skill Gap', 'Importance', 'Description']],
              body: analysis.result.skillGapAnalysis.gaps.map((gap: any) => [
                gap.skill,
                gap.importance,
                gap.description
              ]),
              startY: yPosition,
              theme: 'striped',
              headStyles: { fillColor: [28, 59, 130], textColor: [255, 255, 255] },
              margin: { top: 10 }
            });
            
            yPosition = (doc as any).lastAutoTable.finalY + 15;
          }
          
          // Add strengths table if available
          if (analysis.result.skillGapAnalysis.strengths && analysis.result.skillGapAnalysis.strengths.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(28, 59, 130);
            doc.text('Strengths', 15, yPosition);
            yPosition += 10;
            
            autoTable.default(doc, {
              head: [['Skill', 'Level', 'Relevance']],
              body: analysis.result.skillGapAnalysis.strengths.map((strength: any) => [
                strength.skill,
                strength.level,
                strength.relevance
              ]),
              startY: yPosition,
              theme: 'striped',
              headStyles: { fillColor: [163, 29, 82], textColor: [255, 255, 255] },
              margin: { top: 10 }
            });
            
            yPosition = (doc as any).lastAutoTable.finalY + 15;
          }
        }
        
        // Add new page if needed
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Career Pathway
        if (analysis.result?.careerPathway) {
          doc.setFontSize(16);
          doc.setTextColor(28, 59, 130);
          doc.text('Career Pathway', 15, yPosition);
          yPosition += 10;
          
          // Check page limit and add a new page if needed
          if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Pathway with degree
          if (analysis.result.careerPathway.withDegree && analysis.result.careerPathway.withDegree.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(28, 59, 130);
            doc.text('Pathway with Degree', 15, yPosition);
            yPosition += 10;
            
            // Create pathway table
            autoTable.default(doc, {
              head: [['Step', 'Role', 'Timeframe', 'Key Skills']],
              body: analysis.result.careerPathway.withDegree.map((step: any) => [
                step.step,
                step.role,
                step.timeframe,
                step.keySkillsNeeded ? step.keySkillsNeeded.join(', ') : ''
              ]),
              startY: yPosition,
              theme: 'striped',
              headStyles: { fillColor: [28, 59, 130], textColor: [255, 255, 255] },
              margin: { top: 10 }
            });
            
            yPosition = (doc as any).lastAutoTable.finalY + 15;
          }
          
          // Check page limit and add a new page if needed
          if (yPosition > 240) {
            doc.addPage();
            yPosition = 20;
          }
          
          // Pathway without degree
          if (analysis.result.careerPathway.withoutDegree && analysis.result.careerPathway.withoutDegree.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(28, 59, 130);
            doc.text('Alternative Pathway (Without Degree)', 15, yPosition);
            yPosition += 10;
            
            // Create pathway table
            autoTable.default(doc, {
              head: [['Step', 'Role', 'Timeframe', 'Key Skills']],
              body: analysis.result.careerPathway.withoutDegree.map((step: any) => [
                step.step,
                step.role,
                step.timeframe,
                step.keySkillsNeeded ? step.keySkillsNeeded.join(', ') : ''
              ]),
              startY: yPosition,
              theme: 'striped',
              headStyles: { fillColor: [163, 29, 82], textColor: [255, 255, 255] },
              margin: { top: 10 }
            });
            
            yPosition = (doc as any).lastAutoTable.finalY + 15;
          }
        }
        
        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.setTextColor(150, 150, 150);
          doc.text(`Skillgenix Career Analysis Report - Page ${i} of ${pageCount}`, 15, 285);
          doc.text('Generated by Skillgenix AI - Confidential', 120, 285);
        }
        
        // Set the filename using the desired role
        const sanitizedRole = analysis.desiredRole.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `skillgenix_${sanitizedRole}_analysis.pdf`;
        
        // Set the appropriate headers for a PDF file
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        
        // Send the PDF as a buffer
        const pdfBuffer = doc.output('arraybuffer');
        res.send(Buffer.from(pdfBuffer));
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError);
        res.status(500).json({
          error: 'Failed to generate PDF',
          message: 'There was a problem generating the PDF. Please try again.'
        });
      }
    } catch (error) {
      console.error('Error fetching career analysis for PDF:', error);
      res.status(500).json({
        error: 'Failed to fetch career analysis',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Update analysis progress
  app.patch('/api/career-analyses/:id/progress', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const analysisId = parseInt(req.params.id);
      if (isNaN(analysisId)) {
        return res.status(400).json({ error: 'Invalid analysis ID' });
      }
      
      const { progress } = req.body;
      
      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return res.status(400).json({ 
          error: 'Invalid progress value',
          message: 'Progress must be a number between 0 and 100'
        });
      }
      
      const analysis = await storageInstance.getCareerAnalysisById(analysisId);
      
      if (!analysis) {
        return res.status(404).json({ error: 'Analysis not found' });
      }
      
      // Verify this analysis belongs to the current user
      if (analysis.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const updatedAnalysis = await storageInstance.updateCareerAnalysisProgress(
        analysisId, 
        progress
      );
      
      res.json(updatedAnalysis);
    } catch (error) {
      console.error('Error updating career analysis progress:', error);
      res.status(500).json({
        error: 'Failed to update progress',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // User Badges Endpoints
  
  // Get all badges for current user
  app.get('/api/badges', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const badges = await storageInstance.getUserBadges(req.user!.id);
      res.json(badges);
    } catch (error) {
      console.error('Error fetching user badges:', error);
      res.status(500).json({
        error: 'Failed to fetch badges',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // User Progress Tracking Endpoints
  
  // Get all progress items for current user
  app.get('/api/progress', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const progressItems = await storageInstance.getUserProgress(req.user!.id);
      res.json(progressItems);
    } catch (error) {
      console.error('Error fetching user progress:', error);
      res.status(500).json({
        error: 'Failed to fetch progress',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Update user skill progress
  app.patch('/api/progress/:id', async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const progressId = parseInt(req.params.id);
      if (isNaN(progressId)) {
        return res.status(400).json({ error: 'Invalid progress ID' });
      }
      
      const { progress, notes } = req.body;
      
      if (typeof progress !== 'number' || progress < 0 || progress > 100) {
        return res.status(400).json({ 
          error: 'Invalid progress value',
          message: 'Progress must be a number between 0 and 100'
        });
      }
      
      const progressItem = await storageInstance.getProgressItemById(progressId);
      
      if (!progressItem) {
        return res.status(404).json({ error: 'Progress item not found' });
      }
      
      // Verify this progress item belongs to the current user
      if (progressItem.userId !== req.user!.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // If progress is reaching 100% for the first time, create a completion badge
      if (progress === 100 && progressItem.progress < 100) {
        try {
          // Create a badge for completing a skill journey
          await storageInstance.createUserBadge({
            userId: req.user!.id,
            name: progressItem.type === "career_pathway" ? "Pathway Master" : "Skill Champion",
            description: `Completed the ${progressItem.title} journey`,
            category: "achievement",
            level: 2,
            icon: progressItem.type === "career_pathway" ? "trophy" : "star"
          });
          console.log(`Created completion badge for user ${req.user!.id}`);
        } catch (badgeError) {
          console.error('Error creating badge:', badgeError);
          // Continue even if badge creation fails
        }
      }
      
      const updatedProgress = await storageInstance.updateUserProgress(
        progressId, 
        progress,
        notes
      );
      
      res.json(updatedProgress);
    } catch (error) {
      console.error('Error updating user progress:', error);
      res.status(500).json({
        error: 'Failed to update progress',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
