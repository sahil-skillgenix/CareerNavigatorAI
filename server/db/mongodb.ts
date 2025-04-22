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

export async function connectToDatabase() {
  if (isConnected) {
    // If already connected, return immediately
    return;
  }

  if (connectionAttempts >= MAX_RETRIES) {
    log("Maximum MongoDB connection attempts reached. Using memory storage instead.", "mongodb");
    return;
  }
  
  connectionAttempts++;

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
    connectionAttempts = 0; // Reset counter on successful connection
    
    log('MongoDB connected successfully', "mongodb");
    
    // Log information about the connection
    const databaseName = mongoose.connection.name;
    log(`Connected to database: ${databaseName}`, "mongodb");
    
    // Set up global connection error handler
    mongoose.connection.on('error', (err) => {
      log(`MongoDB connection error: ${err}`, "mongodb");
      isConnected = false;
    });
    
    // Handle graceful disconnection
    mongoose.connection.on('disconnected', () => {
      log('MongoDB disconnected', "mongodb");
      isConnected = false;
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
    log(`Error connecting to MongoDB: ${error}`, "mongodb");
    isConnected = false;
    
    // Try to reconnect after delay if we haven't exceeded max retries
    if (connectionAttempts < MAX_RETRIES) {
      log(`Retrying connection (attempt ${connectionAttempts}/${MAX_RETRIES})...`, "mongodb");
      setTimeout(() => connectToDatabase(), 3000); // Wait 3 seconds before retry
    } else {
      log("Failed to connect to MongoDB after multiple attempts. Using memory storage.", "mongodb");
    }
  }
}

export function getMongooseInstance() {
  return mongoose;
}

export function getDatabaseStatus() {
  return {
    isConnected,
    connectionState: mongoose.connection.readyState,
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  };
}