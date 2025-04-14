import { User, InsertUser } from "@shared/schema";
import session from "express-session";
import { connectToDatabase } from "./db/mongodb";
import UserModel, { UserDocument } from "./db/models/user";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { IStorage } from "./storage";
import * as ConnectMongo from "connect-mongo";
import { log } from "./vite";
import createMemoryStore from "memorystore";

const MongoStore = ConnectMongo.default || ConnectMongo;

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export class MongoDBStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // Initialize MongoDB-based session store
    this.sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/careerpathAI',
      ttl: 14 * 24 * 60 * 60, // 14 days
      crypto: {
        secret: process.env.SESSION_SECRET || 'my-secret-key'
      },
      autoRemove: 'native', // Default
      touchAfter: 24 * 3600 // 24 hours
    });
  }

  async initialize() {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Check if there's a demo user, create one if not
    await this.seedDemoUser();
  }

  private async seedDemoUser() {
    try {
      // Check if demo user exists
      const existingUser = await UserModel.findOne({ email: "demo@careerpathAI.com" });
      
      if (!existingUser) {
        // Create demo user
        const demoUser = new UserModel({
          fullName: "Demo User",
          email: "demo@careerpathAI.com",
          password: await hashPassword("demo123456"),
        });
        
        await demoUser.save();
        log("Demo user created: demo@careerpathAI.com", "mongodb");
      }
    } catch (error) {
      log(`Error creating demo user: ${error}`, "mongodb");
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const user = await UserModel.findById(id).lean();
      if (!user) return undefined;
      
      return {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        password: user.password,
        createdAt: user.createdAt.toISOString()
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
      
      return {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        password: user.password,
        createdAt: user.createdAt.toISOString()
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
      
      return {
        id: savedUser._id.toString(),
        fullName: savedUser.fullName,
        email: savedUser.email,
        password: savedUser.password,
        createdAt: savedUser.createdAt.toISOString()
      };
    } catch (error) {
      log(`Error creating user: ${error}`, "mongodb");
      throw error;
    }
  }
}