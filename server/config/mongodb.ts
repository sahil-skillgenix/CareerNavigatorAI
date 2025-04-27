/**
 * MongoDB Configuration
 * 
 * This file provides centralized access to the MongoDB connection
 * and utility functions for the MongoDB database.
 */
import { MongoClient, ObjectId } from 'mongodb';
import { storage } from '../storage';
import { MongoDBStorage } from '../mongodb-storage';

// Export ObjectId for use in routes
export { ObjectId };

/**
 * Get the MongoDB storage instance
 * Used to access the MongoDB client and database
 * 
 * @returns The MongoDB storage instance
 */
export function getStorage(): MongoDBStorage {
  // Cast the storage to MongoDBStorage to access MongoDB-specific properties
  return storage as MongoDBStorage;
}

/**
 * Create a new ObjectId instance
 * Utility function to create MongoDB ObjectId from string
 * 
 * @param id String ID to convert to ObjectId
 * @returns MongoDB ObjectId
 */
export function createObjectId(id: string): ObjectId {
  try {
    return new ObjectId(id);
  } catch (error) {
    console.error(`Invalid ObjectId format: ${id}`);
    throw new Error(`Invalid ObjectId format: ${id}`);
  }
}

/**
 * Ensure user has access to a resource
 * Utility function to verify ownership of a resource
 * 
 * @param userId User ID from request
 * @param resourceUserId User ID from resource
 * @returns Boolean indicating if user has access
 */
export function hasAccess(userId: string, resourceUserId: string): boolean {
  return userId === resourceUserId;
}