import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { log } from "../vite";

// Load environment variables to ensure MONGODB_URI is available
dotenv.config();

// Try the standard MongoDB URI, DATABASE_URL, or fall back to a local MongoDB
const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/skillgenix';

// Log connection URI (without password) for debugging
log(`MongoDB connection URI: ${MONGODB_URI?.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@')}`, "mongodb");

// Global variable to track connection status
let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRIES = 3;

/**
 * CRITICAL FIX: Repairs problematic indexes in the MongoDB collections
 * Drops any problematic 'id' indexes that are causing duplicate key errors
 * This is needed because we're using both _id (MongoDB's native ID) and id (virtual getter)
 */
async function repairProblematicIndexes() {
  try {
    log("Starting problematic index repair...", "mongodb");
    
    // Collections that might have problematic indexes
    const collectionsToCheck = [
      'careeranalyses',
      'userbadges',
      'userprogresses',
      'users'
    ];
    
    if (!mongoose.connection || !mongoose.connection.db) {
      log("Database connection not available for index repair", "mongodb");
      return;
    }
    
    const db = mongoose.connection.db;
    
    // First option: Try to fix documents with null id instead of deleting them
    for (const collectionName of collectionsToCheck) {
      try {
        // Check if the collection exists
        const collections = await db.listCollections({ name: collectionName }).toArray();
        if (collections.length === 0) {
          log(`Collection ${collectionName} does not exist yet, skipping cleanup`, "mongodb");
          continue;
        }
        
        // Get the collection
        const collection = db.collection(collectionName);
        
        // PRESERVE DATA: Instead of deleting documents with null id, update them to have a valid id
        const documentsToFix = await collection.find({ id: null }).toArray();
        let fixedCount = 0;
        
        for (const doc of documentsToFix) {
          // Generate a valid id from the _id
          await collection.updateOne(
            { _id: doc._id },
            { $set: { id: doc._id.toString() } }
          );
          fixedCount++;
        }
        
        if (fixedCount > 0) {
          log(`Fixed ${fixedCount} documents with null id in ${collectionName}`, "mongodb");
        }
        
        // NEVER drop the users collection to preserve user data
        // Fix problematic collections without dropping them
        if (collectionName === 'userbadges' || collectionName === 'careeranalyses') {
          // Only fix indexes for non-user collections
          if (collectionName !== 'users') {
            log(`Fixing problematic collection ${collectionName} indexes`, "mongodb");
          }
        }
        
        // Get all indexes
        const indexes = await collection.indexes();
        log(`Found ${indexes.length} indexes in ${collectionName}`, "mongodb");
        
        // Loop through all indexes and drop any that might be problematic
        for (const idx of indexes) {
          if (idx.name !== '_id_' && (idx.name === 'id_1' || (idx.key && idx.key.id))) {
            log(`Dropping index ${idx.name} from ${collectionName}`, "mongodb");
            try {
              // Ensure idx.name is always a string
              const indexName = idx.name ? String(idx.name) : '_id_';
              await collection.dropIndex(indexName);
              log(`Successfully dropped index ${indexName} from ${collectionName}`, "mongodb");
            } catch (indexError) {
              log(`Error dropping index ${idx.name}: ${indexError}`, "mongodb");
            }
          }
        }
      } catch (collectionError) {
        log(`Error cleaning collection ${collectionName}: ${collectionError}`, "mongodb");
        // Continue with next collection even if this one fails
      }
    }
    
    log("Problematic index repair completed without data loss", "mongodb");
  } catch (error) {
    log(`Error during problematic index repair: ${error}`, "mongodb");
    // Continue execution even if repair fails
  }
}

/**
 * Connection monitoring information
 */
export interface ConnectionStats {
  lastConnected: Date | null;
  lastDisconnected: Date | null;
  connectionAttempts: number;
  connectionErrors: string[];
  isConnected: boolean;
}

// Track connection statistics
const connectionStats: ConnectionStats = {
  lastConnected: null,
  lastDisconnected: null,
  connectionAttempts: 0,
  connectionErrors: [],
  isConnected: false
};

export async function connectToDatabase() {
  if (isConnected) {
    // If already connected, return immediately
    return;
  }

  if (connectionAttempts >= MAX_RETRIES) {
    const errorMsg = "Maximum MongoDB connection attempts reached. Using memory storage instead.";
    log(errorMsg, "mongodb");
    
    // Store the error in statistics
    connectionStats.connectionErrors.push(errorMsg);
    if (connectionStats.connectionErrors.length > 10) {
      connectionStats.connectionErrors.shift(); // Keep only the last 10 errors
    }
    
    return;
  }
  
  connectionAttempts++;
  connectionStats.connectionAttempts = connectionAttempts;

  try {
    // Configure MongoDB connection options
    mongoose.set('strictQuery', false);
    
    // Set more robust connection options
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    isConnected = true;
    connectionStats.isConnected = true;
    connectionStats.lastConnected = new Date();
    connectionAttempts = 0; // Reset counter on successful connection
    connectionStats.connectionAttempts = 0;
    
    log('MongoDB connected successfully', "mongodb");
    
    // Log information about the connection
    const databaseName = mongoose.connection.name;
    log(`Connected to database: ${databaseName}`, "mongodb");
    
    // CRITICAL FIX: Repair problematic indexes
    await repairProblematicIndexes();
    
    // Set up global connection error handler
    mongoose.connection.on('error', (err) => {
      const errorMsg = `MongoDB connection error: ${err}`;
      log(errorMsg, "mongodb");
      
      // Store the error in statistics
      connectionStats.connectionErrors.push(errorMsg);
      if (connectionStats.connectionErrors.length > 10) {
        connectionStats.connectionErrors.shift(); // Keep only the last 10 errors
      }
      
      isConnected = false;
      connectionStats.isConnected = false;
    });
    
    // Handle graceful disconnection
    mongoose.connection.on('disconnected', () => {
      log('MongoDB disconnected', "mongodb");
      isConnected = false;
      connectionStats.isConnected = false;
      connectionStats.lastDisconnected = new Date();
    });
    
    // Reconnect on disconnection
    mongoose.connection.on('disconnected', async () => {
      if (connectionAttempts < MAX_RETRIES) {
        log('Attempting to reconnect to MongoDB...', "mongodb");
        setTimeout(() => connectToDatabase(), 5000); // Wait 5 seconds before reconnecting
      }
    });
    
    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      log('MongoDB connection closed due to app termination', "mongodb");
      process.exit(0);
    });
    
  } catch (error) {
    const errorMsg = `Error connecting to MongoDB: ${error}`;
    log(errorMsg, "mongodb");
    
    // Store the error in statistics
    connectionStats.connectionErrors.push(errorMsg);
    if (connectionStats.connectionErrors.length > 10) {
      connectionStats.connectionErrors.shift(); // Keep only the last 10 errors
    }
    
    isConnected = false;
    connectionStats.isConnected = false;
    
    // Try to reconnect after delay if we haven't exceeded max retries
    if (connectionAttempts < MAX_RETRIES) {
      log(`Retrying connection (attempt ${connectionAttempts}/${MAX_RETRIES})...`, "mongodb");
      setTimeout(() => connectToDatabase(), 3000); // Wait 3 seconds before retry
    } else {
      const finalErrorMsg = "Failed to connect to MongoDB after multiple attempts. Using memory storage.";
      log(finalErrorMsg, "mongodb");
      connectionStats.connectionErrors.push(finalErrorMsg);
    }
  }
}

export function getMongooseInstance() {
  return mongoose;
}

export function getDatabaseStatus() {
  return {
    ...connectionStats,
    connectionState: mongoose.connection.readyState,
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    readyState: mongoose.connection.readyState,
    databaseName: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
  };
}