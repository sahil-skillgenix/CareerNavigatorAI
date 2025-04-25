import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { IStorage, storage } from "./storage";
import { setupAuth } from "./auth";
import { hashPassword } from "./mongodb-storage";
import { analyzeCareerPathway, CareerAnalysisInput } from "./openai-service";
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
import { UserActivityModel } from "./db/models";
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

  // Rest of the routes file continues...
  // ... (original routes implementation) ...

  const httpServer = createServer(app);
  return httpServer;
}