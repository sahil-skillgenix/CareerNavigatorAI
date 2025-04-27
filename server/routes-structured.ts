/**
 * Structured Career Pathway Routes
 * 
 * This file contains the routes for career pathway analysis
 * using the structured report format, including the new X-Gen AI Career Analysis.
 */

import { Express, Request, Response } from "express";
import { createServer, Server } from "http";
import { storage } from "./storage";
import { analyzeCareerPathway, CareerAnalysisInput } from "./openai-service-structured";
import { CareerAnalysisReport } from "../shared/reportSchema";
import xgenRoutes from "./routes/xgenRoutes";

/**
 * Register structured API routes for career pathway analysis
 * @param app Express application instance
 * @returns HTTP server instance
 */
export function registerStructuredRoutes(app: Express): Server {
  // Register X-Gen AI Career Analysis routes
  app.use('/api/xgen', xgenRoutes);
  
  // Career Pathway Analysis endpoint with structured report format
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
          console.log(`Saving structured analysis for user: ${userId}`);
          
          // Save the analysis using storage interface with progress set to 100%
          await storage.saveCareerAnalysis({
            userId,
            ...input,
            result,
            progress: 100 // Analysis is complete
          });
          
          console.log('Structured analysis saved successfully');
        } catch (saveError) {
          console.error('Error saving structured analysis:', saveError);
          // We don't want to fail the response if only the save failed
        }
      }
      
      return res.json(result);
    } catch (error) {
      console.error('Error generating structured career analysis:', error);
      return res.status(500).json({
        error: 'Failed to generate structured career analysis',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  });
  
  return createServer(app);
}