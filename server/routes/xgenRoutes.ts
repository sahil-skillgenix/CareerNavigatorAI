/**
 * X-Gen AI Career Analysis Routes
 * 
 * These routes handle requests for generating and saving career analysis reports
 * using the X-Gen AI system with OpenAI integration.
 */
import { Router, Request, Response } from "express";
import { generateCareerAnalysis } from "../services/openaiService";
import { CareerAnalysisRequestData, SavedCareerAnalysis } from "../../shared/types/reportTypes";
import { getStorage, ObjectId } from "../config/mongodb";

const router = Router();

/**
 * Generate a career analysis report
 * POST /api/xgen/analyze
 */
router.post("/analyze", async (req: Request, res: Response) => {
  try {
    // Validate request data
    const requestData: CareerAnalysisRequestData = {
      professionalLevel: req.body.professionalLevel,
      currentSkills: req.body.currentSkills,
      educationalBackground: req.body.educationalBackground,
      careerHistory: req.body.careerHistory,
      desiredRole: req.body.desiredRole,
      state: req.body.state,
      country: req.body.country,
    };
    
    // Check for missing required fields
    const missingFields = Object.entries(requestData)
      .filter(([_, value]) => !value)
      .map(([key]) => key);
      
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }
    
    // Generate the career analysis report using OpenAI
    const report = await generateCareerAnalysis(requestData);
    
    // Return the report and request data to the client
    res.status(200).json({
      message: "Career analysis completed successfully",
      report,
      requestData,
    });
  } catch (error: any) {
    console.error("Error generating career analysis:", error);
    res.status(500).json({
      message: error.message || "Failed to generate career analysis",
    });
  }
});

/**
 * Save a career analysis report to the database
 * POST /api/xgen/save
 */
router.post("/save", async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        message: "Authentication required to save career analysis",
      });
    }
    
    const { report, requestData } = req.body;
    
    if (!report || !requestData) {
      return res.status(400).json({
        message: "Missing report or request data",
      });
    }
    
    // Get the MongoDB storage instance
    const storage = getStorage();
    
    // Get the collection for storing career analyses
    const collection = storage.db.collection("skillgenix_careeranalysis");
    
    // Create a document to save
    const careerAnalysis: SavedCareerAnalysis = {
      userId: req.user.id || (req.user._id ? req.user._id.toString() : ''),
      report,
      requestData,
      dateCreated: new Date(),
    };
    
    // Save the career analysis to the database
    const result = await collection.insertOne(careerAnalysis);
    
    res.status(201).json({
      message: "Career analysis saved successfully",
      id: result.insertedId,
    });
  } catch (error: any) {
    console.error("Error saving career analysis:", error);
    res.status(500).json({
      message: error.message || "Failed to save career analysis",
    });
  }
});

/**
 * Get all saved career analyses for the authenticated user
 * GET /api/xgen/analyses
 */
router.get("/analyses", async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        message: "Authentication required to access saved analyses",
      });
    }
    
    // Get the MongoDB storage instance
    const storage = getStorage();
    
    // Get the collection for storing career analyses
    const collection = storage.db.collection("skillgenix_careeranalysis");
    
    // Query the database for analyses belonging to the current user
    const analyses = await collection
      .find({ 
        userId: req.user.id || (req.user._id ? req.user._id.toString() : '')
      })
      .sort({ dateCreated: -1 }) // Sort by date, newest first
      .project({
        _id: 1,
        dateCreated: 1,
        "requestData.desiredRole": 1,
        "requestData.professionalLevel": 1,
        "requestData.state": 1,
        "requestData.country": 1,
      })
      .toArray();
    
    res.status(200).json(analyses);
  } catch (error: any) {
    console.error("Error retrieving saved analyses:", error);
    res.status(500).json({
      message: error.message || "Failed to retrieve saved analyses",
    });
  }
});

/**
 * Get a specific saved career analysis by ID
 * GET /api/xgen/analyses/:id
 */
router.get("/analyses/:id", async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        message: "Authentication required to access saved analysis",
      });
    }
    
    const analysisId = req.params.id;
    
    // Get the MongoDB storage instance
    const storage = getStorage();
    
    // Get the collection for storing career analyses
    const collection = storage.db.collection("skillgenix_careeranalysis");
    
    // Query the database for the specific analysis
    const analysis = await collection.findOne({
      _id: new ObjectId(analysisId),
      userId: req.user.id || (req.user._id ? req.user._id.toString() : ''), // Ensure user only accesses their own analyses
    });
    
    if (!analysis) {
      return res.status(404).json({
        message: "Career analysis not found",
      });
    }
    
    res.status(200).json(analysis);
  } catch (error: any) {
    console.error("Error retrieving saved analysis:", error);
    res.status(500).json({
      message: error.message || "Failed to retrieve saved analysis",
    });
  }
});

/**
 * Delete a saved career analysis by ID
 * DELETE /api/xgen/analyses/:id
 */
router.delete("/analyses/:id", async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        message: "Authentication required to delete saved analysis",
      });
    }
    
    const analysisId = req.params.id;
    
    // Get the MongoDB storage instance
    const storage = getStorage();
    
    // Get the collection for storing career analyses
    const collection = storage.db.collection("skillgenix_careeranalysis");
    
    // Delete the analysis from the database
    const result = await collection.deleteOne({
      _id: new ObjectId(analysisId),
      userId: req.user.id || (req.user._id ? req.user._id.toString() : ''), // Ensure user only deletes their own analyses
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Career analysis not found or not authorized to delete",
      });
    }
    
    res.status(200).json({
      message: "Career analysis deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting saved analysis:", error);
    res.status(500).json({
      message: error.message || "Failed to delete saved analysis",
    });
  }
});

export default router;