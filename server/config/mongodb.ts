/**
 * MongoDB Configuration Utility
 * 
 * This file provides access to the MongoDB connection and database instance
 * for use in API routes and services.
 */
import { MongoClient, Db, ObjectId } from 'mongodb';
import { MongoDBStorage } from '../mongodb-storage';

let client: MongoClient | null = null;
let db: Db | null = null;
let storage: MongoDBStorage | null = null;

/**
 * Get the MongoDB storage instance
 * @returns MongoDB storage instance
 */
export function getStorage(): MongoDBStorage {
  if (!storage) {
    throw new Error('MongoDB storage not initialized');
  }
  return storage;
}

/**
 * Initialize the MongoDB connection and storage
 */
export async function initMongoDB(): Promise<void> {
  if (storage) return; // Already initialized
  
  try {
    // Create and initialize MongoDB storage
    storage = new MongoDBStorage();
    await storage.initialize();
    
    // Store references for direct access if needed
    client = storage.client;
    db = storage.db;
    
    console.log('MongoDB initialized successfully');
  } catch (error) {
    console.error('Error initializing MongoDB:', error);
    throw error;
  }
}

/**
 * Get the MongoDB database instance
 * @returns MongoDB database instance
 */
export function getDb(): Db {
  if (!db) {
    throw new Error('MongoDB database not initialized');
  }
  return db;
}

/**
 * Export ObjectId for use in routes
 */
export { ObjectId };