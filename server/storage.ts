import { 
  users, 
  careerAnalyses, 
  userBadges, 
  userProgress,
  type User, 
  type InsertUser, 
  type CareerAnalysis, 
  type InsertCareerAnalysis,
  type UserBadge,
  type InsertUserBadge,
  type UserProgress,
  type InsertUserProgress
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<InsertUser, "confirmPassword">): Promise<User>;
  
  // Career analysis management
  saveCareerAnalysis(analysis: InsertCareerAnalysis): Promise<CareerAnalysis>;
  getCareerAnalysisById(id: number): Promise<CareerAnalysis | undefined>;
  getUserCareerAnalyses(userId: number): Promise<CareerAnalysis[]>;
  updateCareerAnalysisProgress(id: number, progress: number): Promise<CareerAnalysis>;
  
  // Badge management
  getUserBadges(userId: number): Promise<UserBadge[]>;
  createUserBadge(badge: InsertUserBadge): Promise<UserBadge>;
  
  // Progress tracking
  getUserProgress(userId: number): Promise<UserProgress[]>;
  getProgressItemById(id: number): Promise<UserProgress | undefined>;
  updateUserProgress(id: number, progress: number, notes?: string): Promise<UserProgress>;
  createUserProgress(progressItem: InsertUserProgress): Promise<UserProgress>;
  
  // Session management
  sessionStore: any; // Using any to avoid type conflicts between different session store implementations
}

const MemoryStore = createMemoryStore(session);
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private careerAnalyses: Map<number, CareerAnalysis>;
  private userBadges: Map<number, UserBadge>;
  private userProgress: Map<number, UserProgress>;
  
  private userId: number = 1;
  private analysisId: number = 1;
  private badgeId: number = 1;
  private progressId: number = 1;
  
  sessionStore: any; // Using any to avoid type conflicts

  constructor() {
    this.users = new Map();
    this.careerAnalyses = new Map();
    this.userBadges = new Map();
    this.userProgress = new Map();
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Create a demo user
    this.seedDemoUser();
  }
  
  private async seedDemoUser() {
    const demoUser = {
      fullName: "Demo User",
      email: "demo@skillgenix.com",
      password: await hashPassword("demo123456")
    };
    
    const id = this.userId++;
    const user: User = { 
      ...demoUser, 
      id,
      createdAt: new Date().toISOString() 
    };
    this.users.set(id, user);
    console.log("Demo user created:", user.email);
  }

  // User Management
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: Omit<InsertUser, "confirmPassword">): Promise<User> {
    const id = this.userId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.users.set(id, user);
    return user;
  }
  
  // Career Analysis Management
  async saveCareerAnalysis(analysis: InsertCareerAnalysis): Promise<CareerAnalysis> {
    const id = this.analysisId++;
    const now = new Date();
    
    const newAnalysis: CareerAnalysis = {
      ...analysis,
      id,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    
    this.careerAnalyses.set(id, newAnalysis);
    return newAnalysis;
  }
  
  async getCareerAnalysisById(id: number): Promise<CareerAnalysis | undefined> {
    return this.careerAnalyses.get(id);
  }
  
  async getUserCareerAnalyses(userId: number): Promise<CareerAnalysis[]> {
    return Array.from(this.careerAnalyses.values())
      .filter(analysis => analysis.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Most recent first
  }
  
  async updateCareerAnalysisProgress(id: number, progress: number): Promise<CareerAnalysis> {
    const analysis = this.careerAnalyses.get(id);
    
    if (!analysis) {
      throw new Error(`Analysis with ID ${id} not found`);
    }
    
    const updatedAnalysis: CareerAnalysis = {
      ...analysis,
      progress,
      updatedAt: new Date().toISOString()
    };
    
    this.careerAnalyses.set(id, updatedAnalysis);
    return updatedAnalysis;
  }
  
  // Badge Management
  async getUserBadges(userId: number): Promise<UserBadge[]> {
    return Array.from(this.userBadges.values())
      .filter(badge => badge.userId === userId)
      .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()); // Most recent first
  }
  
  async createUserBadge(badge: InsertUserBadge): Promise<UserBadge> {
    const id = this.badgeId++;
    
    const newBadge: UserBadge = {
      ...badge,
      id,
      earnedAt: new Date().toISOString()
    };
    
    this.userBadges.set(id, newBadge);
    return newBadge;
  }
  
  // Progress Tracking
  async getUserProgress(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()); // Most recent first
  }
  
  async getProgressItemById(id: number): Promise<UserProgress | undefined> {
    return this.userProgress.get(id);
  }
  
  async updateUserProgress(id: number, progress: number, notes?: string): Promise<UserProgress> {
    const progressItem = this.userProgress.get(id);
    
    if (!progressItem) {
      throw new Error(`Progress item with ID ${id} not found`);
    }
    
    const updatedProgress: UserProgress = {
      ...progressItem,
      progress,
      notes: notes || progressItem.notes,
      updatedAt: new Date().toISOString()
    };
    
    this.userProgress.set(id, updatedProgress);
    return updatedProgress;
  }
  
  async createUserProgress(progressItem: InsertUserProgress): Promise<UserProgress> {
    const id = this.progressId++;
    
    const newProgressItem: UserProgress = {
      ...progressItem,
      id,
      updatedAt: new Date().toISOString()
    };
    
    this.userProgress.set(id, newProgressItem);
    return newProgressItem;
  }
}

export const storage = new MemStorage();
