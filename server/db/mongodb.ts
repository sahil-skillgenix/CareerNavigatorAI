import mongoose from 'mongoose';
import { log } from '../vite';
import { MongoMemoryServer } from 'mongodb-memory-server';

// In-memory MongoDB server instance
let mongoServer: MongoMemoryServer | null = null;

// Connect to MongoDB (uses in-memory server for development)
export async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState === 1) {
      log('MongoDB is already connected', 'mongodb');
      return;
    }

    // Create in-memory MongoDB instance
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    log(`Starting in-memory MongoDB server at ${mongoUri}`, 'mongodb');

    // Connect to the in-memory MongoDB
    await mongoose.connect(mongoUri);
    log('Connected to in-memory MongoDB', 'mongodb');
    
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
      if (mongoServer) {
        await mongoServer.stop();
        log('In-memory MongoDB server stopped', 'mongodb');
      }
      log('MongoDB connection closed through app termination', 'mongodb');
      process.exit(0);
    });
    
  } catch (error) {
    log(`Error connecting to MongoDB: ${error}`, 'mongodb');
    throw error;
  }
}