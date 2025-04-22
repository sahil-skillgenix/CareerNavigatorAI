import { 
  User, 
  InsertUser, 
  CareerAnalysis, 
  InsertCareerAnalysis,
  UserBadge,
  InsertUserBadge,
  UserProgress,
  InsertUserProgress
} from "@shared/schema";
import session from "express-session";
import { connectToDatabase } from "./db/mongodb";
import { 
  UserModel, 
  CareerAnalysisModel,
  UserBadgeModel,
  UserProgressModel,
  type UserDocument,
  type CareerAnalysisDocument,
  type UserBadgeDocument,
  type UserProgressDocument
} from "./db/models";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { IStorage } from "./storage";
import MongoStore from "connect-mongo";
import { log } from "./vite";
import mongoose from "mongoose";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export class MongoDBStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Use a memory store initially - we'll connect to MongoDB later
    this.sessionStore = new session.MemoryStore();
  }

  async initialize() {
    // Connect to MongoDB first
    await connectToDatabase();
    
    // Now that MongoDB is connected, update the session store
    // Using the mongoose client directly
    this.sessionStore = MongoStore.create({
      client: mongoose.connection.getClient(),
      ttl: 14 * 24 * 60 * 60, // 14 days
      crypto: {
        secret: process.env.SESSION_SECRET || 'my-secret-key'
      },
      autoRemove: 'native',
      touchAfter: 24 * 3600 // 24 hours
    });
    
    // Check if there's a demo user, create one if not
    await this.seedDemoUser();
  }

  private async seedDemoUser() {
    try {
      // Check if demo user exists
      const existingUser = await UserModel.findOne({ email: "demo@skillgenix.com" });
      
      if (!existingUser) {
        // Create demo user
        const demoUser = new UserModel({
          fullName: "Demo User",
          email: "demo@skillgenix.com",
          password: await hashPassword("demo123456"),
        });
        
        await demoUser.save();
        log("Demo user created: demo@skillgenix.com", "mongodb");
      }
    } catch (error) {
      log(`Error creating demo user: ${error}`, "mongodb");
    }
  }

  async getUser(id: string | number): Promise<User | undefined> {
    try {
      const user = await UserModel.findById(id).lean();
      if (!user) return undefined;
      
      const userDoc = user as any;
      return {
        id: userDoc._id.toString(),
        fullName: userDoc.fullName,
        email: userDoc.email,
        password: userDoc.password,
        createdAt: userDoc.createdAt.toISOString()
      };
    } catch (error) {
      log(`Error getting user by ID: ${error}`, "mongodb");
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ email }).lean();
      if (!user) return undefined;
      
      const userDoc = user as any;
      return {
        id: userDoc._id.toString(),
        fullName: userDoc.fullName,
        email: userDoc.email,
        password: userDoc.password,
        createdAt: userDoc.createdAt.toISOString()
      };
    } catch (error) {
      log(`Error getting user by email: ${error}`, "mongodb");
      return undefined;
    }
  }

  async createUser(insertUser: Omit<InsertUser, "confirmPassword">): Promise<User> {
    try {
      const newUser = new UserModel({
        fullName: insertUser.fullName,
        email: insertUser.email,
        password: insertUser.password,
      });
      
      const savedUser = await newUser.save();
      const userDoc = savedUser as any;
      
      return {
        id: userDoc._id.toString(),
        fullName: userDoc.fullName,
        email: userDoc.email,
        password: userDoc.password,
        createdAt: userDoc.createdAt.toISOString()
      };
    } catch (error) {
      log(`Error creating user: ${error}`, "mongodb");
      throw error;
    }
  }

  // Career Analysis Management

  async saveCareerAnalysis(analysis: InsertCareerAnalysis): Promise<CareerAnalysis> {
    try {
      const newAnalysis = new CareerAnalysisModel({
        userId: analysis.userId,
        professionalLevel: analysis.professionalLevel,
        currentSkills: analysis.currentSkills,
        educationalBackground: analysis.educationalBackground,
        careerHistory: analysis.careerHistory,
        desiredRole: analysis.desiredRole,
        state: analysis.state,
        country: analysis.country,
        result: analysis.result,
        progress: analysis.progress || 0,
        badges: analysis.badges || []
      });
      
      const savedAnalysis = await newAnalysis.save();
      const doc = savedAnalysis.toObject();
      
      return {
        id: doc._id.toString(),
        userId: parseInt(doc.userId.toString()),
        professionalLevel: doc.professionalLevel,
        currentSkills: doc.currentSkills,
        educationalBackground: doc.educationalBackground,
        careerHistory: doc.careerHistory,
        desiredRole: doc.desiredRole,
        state: doc.state,
        country: doc.country,
        result: doc.result,
        progress: doc.progress,
        badges: doc.badges,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString()
      };
    } catch (error) {
      log(`Error saving career analysis: ${error}`, "mongodb");
      throw error;
    }
  }
  
  async getCareerAnalysisById(id: number): Promise<CareerAnalysis | undefined> {
    try {
      const analysis = await CareerAnalysisModel.findById(id).lean();
      if (!analysis) return undefined;
      
      const doc = analysis as any;
      return {
        id: doc._id.toString(),
        userId: parseInt(doc.userId.toString()),
        professionalLevel: doc.professionalLevel,
        currentSkills: doc.currentSkills,
        educationalBackground: doc.educationalBackground,
        careerHistory: doc.careerHistory,
        desiredRole: doc.desiredRole,
        state: doc.state,
        country: doc.country,
        result: doc.result,
        progress: doc.progress,
        badges: doc.badges,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString()
      };
    } catch (error) {
      log(`Error getting career analysis: ${error}`, "mongodb");
      return undefined;
    }
  }
  
  async getUserCareerAnalyses(userId: number): Promise<CareerAnalysis[]> {
    try {
      const analyses = await CareerAnalysisModel.find({ userId })
        .sort({ createdAt: -1 }) // Most recent first
        .lean();
      
      return analyses.map((doc: any) => ({
        id: doc._id.toString(),
        userId: parseInt(doc.userId.toString()),
        professionalLevel: doc.professionalLevel,
        currentSkills: doc.currentSkills,
        educationalBackground: doc.educationalBackground,
        careerHistory: doc.careerHistory,
        desiredRole: doc.desiredRole,
        state: doc.state,
        country: doc.country,
        result: doc.result,
        progress: doc.progress,
        badges: doc.badges,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString()
      }));
    } catch (error) {
      log(`Error getting user career analyses: ${error}`, "mongodb");
      return [];
    }
  }
  
  async updateCareerAnalysisProgress(id: number, progress: number): Promise<CareerAnalysis> {
    try {
      const updatedAnalysis = await CareerAnalysisModel.findByIdAndUpdate(
        id,
        {
          $set: { 
            progress,
            updatedAt: new Date()
          }
        },
        { new: true } // Return the updated document
      ).lean();
      
      if (!updatedAnalysis) {
        throw new Error(`Career analysis with ID ${id} not found`);
      }
      
      const doc = updatedAnalysis as any;
      return {
        id: doc._id.toString(),
        userId: parseInt(doc.userId.toString()),
        professionalLevel: doc.professionalLevel,
        currentSkills: doc.currentSkills,
        educationalBackground: doc.educationalBackground,
        careerHistory: doc.careerHistory,
        desiredRole: doc.desiredRole,
        state: doc.state,
        country: doc.country,
        result: doc.result,
        progress: doc.progress,
        badges: doc.badges,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString()
      };
    } catch (error) {
      log(`Error updating career analysis progress: ${error}`, "mongodb");
      throw error;
    }
  }
  
  // Badge Management
  
  async getUserBadges(userId: number): Promise<UserBadge[]> {
    try {
      const badges = await UserBadgeModel.find({ userId })
        .sort({ earnedAt: -1 }) // Most recent first
        .lean();
      
      return badges.map((doc: any) => ({
        id: doc._id.toString(),
        userId: parseInt(doc.userId.toString()),
        name: doc.name,
        description: doc.description,
        category: doc.category,
        level: doc.level,
        icon: doc.icon,
        earnedAt: doc.earnedAt.toISOString()
      }));
    } catch (error) {
      log(`Error getting user badges: ${error}`, "mongodb");
      return [];
    }
  }
  
  async createUserBadge(badge: InsertUserBadge): Promise<UserBadge> {
    try {
      const newBadge = new UserBadgeModel({
        userId: badge.userId,
        name: badge.name,
        description: badge.description,
        category: badge.category,
        level: badge.level || 1,
        icon: badge.icon
      });
      
      const savedBadge = await newBadge.save();
      const doc = savedBadge.toObject();
      
      return {
        id: doc._id.toString(),
        userId: parseInt(doc.userId.toString()),
        name: doc.name,
        description: doc.description,
        category: doc.category,
        level: doc.level,
        icon: doc.icon,
        earnedAt: doc.earnedAt.toISOString()
      };
    } catch (error) {
      log(`Error creating user badge: ${error}`, "mongodb");
      throw error;
    }
  }
  
  // Progress Tracking
  
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    try {
      const progressItems = await UserProgressModel.find({ userId })
        .sort({ updatedAt: -1 }) // Most recent first
        .lean();
      
      return progressItems.map((doc: any) => ({
        id: doc._id.toString(),
        userId: parseInt(doc.userId.toString()),
        analysisId: doc.analysisId ? parseInt(doc.analysisId.toString()) : undefined,
        skillId: doc.skillId ? parseInt(doc.skillId.toString()) : undefined,
        currentLevel: doc.currentLevel,
        targetLevel: doc.targetLevel,
        progress: doc.progress,
        notes: doc.notes,
        updatedAt: doc.updatedAt.toISOString()
      }));
    } catch (error) {
      log(`Error getting user progress: ${error}`, "mongodb");
      return [];
    }
  }
  
  async getProgressItemById(id: number): Promise<UserProgress | undefined> {
    try {
      const progressItem = await UserProgressModel.findById(id).lean();
      if (!progressItem) return undefined;
      
      const doc = progressItem as any;
      return {
        id: doc._id.toString(),
        userId: parseInt(doc.userId.toString()),
        analysisId: doc.analysisId ? parseInt(doc.analysisId.toString()) : undefined,
        skillId: doc.skillId ? parseInt(doc.skillId.toString()) : undefined,
        currentLevel: doc.currentLevel,
        targetLevel: doc.targetLevel,
        progress: doc.progress,
        notes: doc.notes,
        updatedAt: doc.updatedAt.toISOString()
      };
    } catch (error) {
      log(`Error getting progress item: ${error}`, "mongodb");
      return undefined;
    }
  }
  
  async updateUserProgress(id: number, progress: number, notes?: string): Promise<UserProgress> {
    try {
      const updateData: any = { 
        progress,
        updatedAt: new Date()
      };
      
      if (notes !== undefined) {
        updateData.notes = notes;
      }
      
      const updatedProgress = await UserProgressModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true } // Return the updated document
      ).lean();
      
      if (!updatedProgress) {
        throw new Error(`Progress item with ID ${id} not found`);
      }
      
      const doc = updatedProgress as any;
      return {
        id: doc._id.toString(),
        userId: parseInt(doc.userId.toString()),
        analysisId: doc.analysisId ? parseInt(doc.analysisId.toString()) : undefined,
        skillId: doc.skillId ? parseInt(doc.skillId.toString()) : undefined,
        currentLevel: doc.currentLevel,
        targetLevel: doc.targetLevel,
        progress: doc.progress,
        notes: doc.notes,
        updatedAt: doc.updatedAt.toISOString()
      };
    } catch (error) {
      log(`Error updating user progress: ${error}`, "mongodb");
      throw error;
    }
  }
  
  async createUserProgress(progressItem: InsertUserProgress): Promise<UserProgress> {
    try {
      const newProgress = new UserProgressModel({
        userId: progressItem.userId,
        analysisId: progressItem.analysisId,
        skillId: progressItem.skillId,
        currentLevel: progressItem.currentLevel,
        targetLevel: progressItem.targetLevel,
        progress: progressItem.progress || 0,
        notes: progressItem.notes
      });
      
      const savedProgress = await newProgress.save();
      const doc = savedProgress.toObject();
      
      return {
        id: doc._id.toString(),
        userId: parseInt(doc.userId.toString()),
        analysisId: doc.analysisId ? parseInt(doc.analysisId.toString()) : undefined,
        skillId: doc.skillId ? parseInt(doc.skillId.toString()) : undefined,
        currentLevel: doc.currentLevel,
        targetLevel: doc.targetLevel,
        progress: doc.progress,
        notes: doc.notes,
        updatedAt: doc.updatedAt.toISOString()
      };
    } catch (error) {
      log(`Error creating user progress: ${error}`, "mongodb");
      throw error;
    }
  }
}