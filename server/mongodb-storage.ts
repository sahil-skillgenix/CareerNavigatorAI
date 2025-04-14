import { User, InsertUser } from "@shared/schema";
import session from "express-session";
import { connectToDatabase } from "./db/mongodb";
import UserModel, { UserDocument } from "./db/models/user";
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
}