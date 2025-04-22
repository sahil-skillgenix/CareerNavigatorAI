import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables to ensure MONGODB_URI is available
dotenv.config();

// MongoDB connection URL - use Atlas URI for both dev and prod
const MONGODB_URI = process.env.MONGODB_URI;

// Log connection URI (without password)
console.log(`MongoDB connection URI: ${MONGODB_URI?.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@')}`);

// Check if MongoDB URI is available
if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not defined!');
  // Don't default to localhost as it likely doesn't exist in the container
}

// Global variable to track connection status
let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) {
    // If already connected, return immediately
    return;
  }

  try {
    // Ensure MONGODB_URI is available
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined!');
    }
    
    // Set a connection timeout
    const connectPromise = mongoose.connect(MONGODB_URI, {
      // Set a shorter serverSelectionTimeoutMS to avoid hanging
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    // Add a timeout for the connection attempt
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('MongoDB connection timeout - taking too long to connect'));
      }, 5000);
    });
    
    // Race the connection against the timeout
    const db = await Promise.race([connectPromise, timeoutPromise]) as mongoose.Mongoose;
    
    isConnected = true;
    
    console.log('MongoDB connected successfully');
    
    // Log information about the connection
    const databaseName = db.connection.name;
    console.log(`Connected to database: ${databaseName}`);
    
    // Set up global connection error handler
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });
    
    // Handle graceful disconnection
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });
    
    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    isConnected = false;
    throw error;
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