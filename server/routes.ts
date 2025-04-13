import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { analyzeCareerPathway, CareerAnalysisInput } from "./openai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'CareerPathAI server is running' });
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
        desiredRole 
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
        desiredRole
      };
      
      const analysisResult = await analyzeCareerPathway(input);
      res.json(analysisResult);
    } catch (error) {
      console.error('Error in career analysis:', error);
      res.status(500).json({ 
        error: 'Failed to analyze career pathway', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
