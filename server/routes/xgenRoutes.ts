/**
 * X-Gen AI Career Analysis API Routes
 * 
 * This file handles all API routes for the X-Gen AI Career Analysis feature,
 * including generating and saving reports.
 */
import express from 'express';
import { generateCareerAnalysis } from '../services/openaiService';
import { z } from 'zod';
import { CareerAnalysisRequestData } from '../../shared/types/reportTypes';
import { getStorage } from '../config/mongodb';

const router = express.Router();

// Schema for validating incoming career analysis requests
const careerAnalysisSchema = z.object({
  professionalLevel: z.string().min(1, 'Professional level is required'),
  currentSkills: z.string().min(1, 'Current skills are required'),
  educationalBackground: z.string().min(1, 'Educational background is required'),
  careerHistory: z.string().min(1, 'Career history is required'),
  desiredRole: z.string().min(1, 'Desired role is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
});

/**
 * POST /api/xgen/analyze
 * Generate a career analysis report using OpenAI
 */
router.post('/analyze', async (req, res) => {
  try {
    // Validate request data
    const result = careerAnalysisSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid input data',
        details: result.error.errors,
      });
    }

    const requestData: CareerAnalysisRequestData = result.data;
    
    // Generate the career analysis report
    const report = await generateCareerAnalysis(requestData);
    
    return res.status(200).json({ report, requestData });
  } catch (error) {
    console.error('Error generating career analysis:', error);
    return res.status(500).json({
      error: 'Failed to generate career analysis',
      message: (error as Error).message,
    });
  }
});

/**
 * POST /api/xgen/save
 * Save a generated career analysis report to MongoDB
 */
router.post('/save', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { report, requestData } = req.body;
    
    if (!report || !requestData) {
      return res.status(400).json({ error: 'Missing report or request data' });
    }

    const userId = req.user.id;
    const storage = getStorage();
    const careerAnalysisCollection = storage.db.collection('skillgenix_careeranalysis');
    
    // Save the career analysis to MongoDB
    const result = await careerAnalysisCollection.insertOne({
      userId,
      report,
      requestData,
      dateCreated: new Date(),
    });
    
    return res.status(201).json({
      message: 'Career analysis saved successfully',
      id: result.insertedId,
    });
  } catch (error) {
    console.error('Error saving career analysis:', error);
    return res.status(500).json({
      error: 'Failed to save career analysis',
      message: (error as Error).message,
    });
  }
});

/**
 * GET /api/xgen/analyses
 * Get all saved career analyses for the authenticated user
 */
router.get('/analyses', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id;
    const storage = getStorage();
    const careerAnalysisCollection = storage.db.collection('skillgenix_careeranalysis');
    
    // Fetch all career analyses for the current user
    const analyses = await careerAnalysisCollection
      .find({ userId })
      .sort({ dateCreated: -1 })
      .toArray();
    
    return res.status(200).json(analyses);
  } catch (error) {
    console.error('Error fetching career analyses:', error);
    return res.status(500).json({
      error: 'Failed to fetch career analyses',
      message: (error as Error).message,
    });
  }
});

/**
 * GET /api/xgen/analysis/:id
 * Get a specific career analysis by ID
 */
router.get('/analysis/:id', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userId = req.user.id;
    const analysisId = req.params.id;
    
    const storage = getStorage();
    const careerAnalysisCollection = storage.db.collection('skillgenix_careeranalysis');
    
    // MongoDB's ObjectId is needed for queries by ID
    const { ObjectId } = storage;
    
    // Fetch the specific career analysis
    const analysis = await careerAnalysisCollection.findOne({
      _id: new ObjectId(analysisId),
      userId, // Ensure the user can only access their own analyses
    });
    
    if (!analysis) {
      return res.status(404).json({ error: 'Career analysis not found' });
    }
    
    return res.status(200).json(analysis);
  } catch (error) {
    console.error('Error fetching career analysis:', error);
    return res.status(500).json({
      error: 'Failed to fetch career analysis',
      message: (error as Error).message,
    });
  }
});

export default router;