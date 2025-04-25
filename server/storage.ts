import { 
  type User, 
  type InsertUser, 
  type CareerAnalysis, 
  type InsertCareerAnalysis,
  type UserBadge,
  type InsertUserBadge,
  type UserProgress,
  type InsertUserProgress,
  type CareerAnalysisWithStringDates,
  type UserBadgeWithStringDates,
  type UserProgressWithStringDates
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User management
  getUser(id: string | number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<InsertUser, "confirmPassword">): Promise<User>;
  updateUserPassword(id: string | number, newPassword: string): Promise<User | undefined>;
  updateUser(id: string | number, userData: Partial<User>): Promise<User | undefined>;
  
  // Career analysis management
  saveCareerAnalysis(analysis: InsertCareerAnalysis): Promise<CareerAnalysisWithStringDates>;
  getCareerAnalysisById(id: string | number): Promise<CareerAnalysisWithStringDates | undefined>;
  getUserCareerAnalyses(userId: string | number): Promise<CareerAnalysisWithStringDates[]>;
  updateCareerAnalysisProgress(id: string | number, progress: number): Promise<CareerAnalysisWithStringDates>;
  
  // Badge management
  getUserBadges(userId: string | number): Promise<UserBadgeWithStringDates[]>;
  createUserBadge(badge: InsertUserBadge): Promise<UserBadgeWithStringDates>;
  
  // Progress tracking
  getUserProgress(userId: string | number): Promise<UserProgressWithStringDates[]>;
  getProgressItemById(id: string | number): Promise<UserProgressWithStringDates | undefined>;
  updateUserProgress(id: string | number, progress: number, notes?: string): Promise<UserProgressWithStringDates>;
  createUserProgress(progressItem: InsertUserProgress): Promise<UserProgressWithStringDates>;
  
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
  private users: Map<string, User & { id: string }>;
  private careerAnalyses: Map<string, CareerAnalysis & { id: string }>;
  private userBadges: Map<string, UserBadge & { id: string }>;
  private userProgress: Map<string, UserProgress & { id: string }>;
  
  // Type guard to ensure ID exists and is a string
  private ensureStringId(obj: any): obj is { id: string } {
    return obj && typeof obj.id === 'string';
  }
  
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
    
    const idNum = this.userId++;
    const id = idNum.toString();
    const user: User & { id: string } = { 
      ...demoUser, 
      id,
      createdAt: new Date().toISOString() 
    };
    this.users.set(id, user);
    console.log("Demo user created:", user.email);
  }

  // User Management
  async getUser(id: string | number): Promise<User | undefined> {
    const stringId = id.toString();
    return this.users.get(stringId);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: Omit<InsertUser, "confirmPassword">): Promise<User> {
    const idNum = this.userId++;
    const id = idNum.toString();
    const user: User & { id: string } = { 
      ...insertUser, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserPassword(id: string | number, newPassword: string): Promise<User | undefined> {
    const stringId = id.toString();
    const user = this.users.get(stringId);
    
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { 
      ...user, 
      password: newPassword 
    };
    
    this.users.set(stringId, updatedUser);
    return updatedUser;
  }
  
  async updateUser(id: string | number, userData: Partial<User>): Promise<User | undefined> {
    const stringId = id.toString();
    const user = this.users.get(stringId);
    
    if (!user) {
      return undefined;
    }
    
    // Create updated user object, preserving existing fields
    const updatedUser = { 
      ...user,
      ...userData,
      id: user.id // Ensure ID doesn't change
    };
    
    this.users.set(stringId, updatedUser);
    return updatedUser;
  }
  
  // Career Analysis Management
  async saveCareerAnalysis(analysis: InsertCareerAnalysis): Promise<CareerAnalysisWithStringDates> {
    const idNum = this.analysisId++;
    const id = idNum.toString();
    const now = new Date().toISOString();
    
    const newAnalysis: CareerAnalysisWithStringDates = {
      ...analysis,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    this.careerAnalyses.set(id, newAnalysis as any);
    return newAnalysis;
  }
  
  async getCareerAnalysisById(id: string | number): Promise<CareerAnalysisWithStringDates | undefined> {
    const stringId = id.toString();
    const analysis = this.careerAnalyses.get(stringId);
    return analysis as unknown as CareerAnalysisWithStringDates;
  }
  
  async getUserCareerAnalyses(userId: string | number): Promise<CareerAnalysisWithStringDates[]> {
    const stringUserId = userId.toString();
    return Array.from(this.careerAnalyses.values())
      .filter(analysis => analysis.userId === stringUserId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }) as unknown as CareerAnalysisWithStringDates[]; // Most recent first
  }
  
  async updateCareerAnalysisProgress(id: string | number, progress: number): Promise<CareerAnalysisWithStringDates> {
    const stringId = id.toString();
    const analysis = this.careerAnalyses.get(stringId);
    
    if (!analysis) {
      throw new Error(`Analysis with ID ${stringId} not found`);
    }
    
    const updatedAnalysis: CareerAnalysisWithStringDates = {
      ...analysis as unknown as CareerAnalysisWithStringDates,
      progress,
      updatedAt: new Date().toISOString()
    };
    
    this.careerAnalyses.set(stringId, updatedAnalysis as any);
    return updatedAnalysis;
  }
  
  // Badge Management
  async getUserBadges(userId: string | number): Promise<UserBadgeWithStringDates[]> {
    const stringUserId = userId.toString();
    return Array.from(this.userBadges.values())
      .filter(badge => badge.userId === stringUserId)
      .sort((a, b) => {
        const dateA = a.earnedAt ? new Date(a.earnedAt).getTime() : 0;
        const dateB = b.earnedAt ? new Date(b.earnedAt).getTime() : 0;
        return dateB - dateA;
      }) as unknown as UserBadgeWithStringDates[]; // Most recent first
  }
  
  async createUserBadge(badge: InsertUserBadge): Promise<UserBadgeWithStringDates> {
    const idNum = this.badgeId++;
    const id = idNum.toString();
    
    const newBadge: UserBadgeWithStringDates = {
      ...badge,
      id,
      earnedAt: new Date().toISOString()
    };
    
    this.userBadges.set(id, newBadge as any);
    return newBadge;
  }
  
  // Progress Tracking
  async getUserProgress(userId: string | number): Promise<UserProgressWithStringDates[]> {
    const stringUserId = userId.toString();
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === stringUserId)
      .sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      }) as unknown as UserProgressWithStringDates[]; // Most recent first
  }
  
  async getProgressItemById(id: string | number): Promise<UserProgressWithStringDates | undefined> {
    const stringId = id.toString();
    const item = this.userProgress.get(stringId);
    return item as unknown as UserProgressWithStringDates;
  }
  
  async updateUserProgress(id: string | number, progress: number, notes?: string): Promise<UserProgressWithStringDates> {
    const stringId = id.toString();
    const progressItem = this.userProgress.get(stringId);
    
    if (!progressItem) {
      throw new Error(`Progress item with ID ${stringId} not found`);
    }
    
    const updatedProgress: UserProgressWithStringDates = {
      ...progressItem as unknown as UserProgressWithStringDates,
      progress,
      notes: notes || progressItem.notes,
      updatedAt: new Date().toISOString()
    };
    
    this.userProgress.set(stringId, updatedProgress as any);
    return updatedProgress;
  }
  
  async createUserProgress(progressItem: InsertUserProgress): Promise<UserProgressWithStringDates> {
    const idNum = this.progressId++;
    const id = idNum.toString();
    
    const newProgressItem: UserProgressWithStringDates = {
      ...progressItem,
      id,
      updatedAt: new Date().toISOString()
    };
    
    this.userProgress.set(id, newProgressItem as any);
    return newProgressItem;
  }
}

export const storage = new MemStorage();
