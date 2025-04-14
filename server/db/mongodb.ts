import mongoose from 'mongoose';
import { log } from '../vite';

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/careerpathAI';

// Connect to MongoDB
export async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState === 1) {
      log('MongoDB is already connected', 'mongodb');
      return;
    }

    await mongoose.connect(MONGODB_URI);
    log('Connected to MongoDB', 'mongodb');
    
    // Handle connection errors after initial connection
    mongoose.connection.on('error', (err) => {
      log(`MongoDB connection error: ${err}`, 'mongodb');
    });
    
    // Handle disconnection
    mongoose.connection.on('disconnected', () => {
      log('MongoDB disconnected', 'mongodb');
    });
    
    // Handle reconnection
    mongoose.connection.on('reconnected', () => {
      log('MongoDB reconnected', 'mongodb');
    });
    
    // Gracefully close the connection when the process is terminated
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      log('MongoDB connection closed through app termination', 'mongodb');
      process.exit(0);
    });
    
  } catch (error) {
    log(`Error connecting to MongoDB: ${error}`, 'mongodb');
    throw error;
  }
}