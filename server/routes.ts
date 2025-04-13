import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'CareerPathAI server is running' });
  });

  // Future API endpoints can be added here
  // Examples:
  // - User authentication
  // - Career path generation
  // - Skills assessment
  // - Learning recommendations

  const httpServer = createServer(app);

  return httpServer;
}
