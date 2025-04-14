import mongoose from 'mongoose';
import { log } from '../vite';

// Default to MongoDB's default connection string if not provided
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerpathAI';

// Connection options
const options: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s default
};

// Initialize MongoDB connection
export async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    log('MongoDB connection already established', 'mongodb');
    return;
  }

  try {
    log(`Connecting to MongoDB at ${MONGODB_URI.split('@').pop()}`, 'mongodb');
    await mongoose.connect(MONGODB_URI, options);
    log('MongoDB connection established successfully', 'mongodb');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      log(`MongoDB connection error: ${err}`, 'mongodb');
    });
    
    mongoose.connection.on('disconnected', () => {
      log('MongoDB disconnected', 'mongodb');
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      log('MongoDB connection closed due to application termination', 'mongodb');
      process.exit(0);
    });
    
  } catch (error) {
    log(`MongoDB connection error: ${error}`, 'mongodb');
    throw error;
  }
}

export default mongoose;