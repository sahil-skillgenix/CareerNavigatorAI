import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";

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

  const httpServer = createServer(app);

  return httpServer;
}
