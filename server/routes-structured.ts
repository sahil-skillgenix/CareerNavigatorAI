import { Express, Request, Response } from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import { createServer, Server } from "http";
import { storage } from "./storage";
import { analyzeCareerPathway, CareerAnalysisInput } from "./openai-service-structured";
import { CareerAnalysisReport } from "../shared/reportSchema";

// JWT secret for token generation and validation
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key';
// JWT token expiration time (in seconds)
const JWT_EXPIRES_IN = 7200; // 2 hours

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

/**
 * Register all API routes
 * @param app Express application instance
 * @returns HTTP server instance
 */
export function registerStructuredRoutes(app: Express): Server {
  // Career Pathway Analysis endpoint - uses the structured report format
  app.post('/api/career-pathway-analysis-structured', async (req: Request & { user?: any }, res: Response) => {
    console.log('Career analysis request received with structured output format');
    
    try {
      // Extract and validate input
      const input: CareerAnalysisInput = req.body;
      
      // Delegate to structured OpenAI service
      const result: CareerAnalysisReport = await analyzeCareerPathway(input);
      
      console.log('Career analysis completed successfully with structured format');
      
      // If the user is authenticated, save the analysis to their account
      if (req.user) {
        try {
          const userId = req.user.id;
          console.log(`Saving analysis for user: ${userId}`);
          
          // Save the analysis using storage interface
          await storage.saveCareerAnalysis({
            userId,
            ...input,
            result
          });
          
          console.log('Analysis saved successfully');
        } catch (saveError) {
          console.error('Error saving analysis:', saveError);
          // We don't want to fail the response if only the save failed
        }
      }
      
      return res.json(result);
    } catch (error) {
      console.error('Error generating structured career analysis:', error);
      return res.status(500).json({
        error: 'Failed to generate career analysis',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });
  
  return createServer(app);
}