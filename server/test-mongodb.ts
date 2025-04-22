/**
 * Simple MongoDB connection test
 * Run with: npx tsx server/test-mongodb.ts
 */
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI environment variable is not defined!');
  process.exit(1);
}

async function testMongoDBConnection() {
  console.log(`Testing MongoDB connection to: ${MONGODB_URI.replace(/\/\/([^:]+):[^@]+@/, '//$1:****@')}`);
  
  try {
    // Set connection timeout options
    const options = {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    };
    
    await mongoose.connect(MONGODB_URI, options);
    
    console.log('Connected to MongoDB successfully!');
    console.log(`Database name: ${mongoose.connection.name}`);
    console.log(`Connection state: ${mongoose.connection.readyState}`);
    
    // Create a simple model to test
    const TestSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.models.Test || mongoose.model('Test', TestSchema);
    
    // Count documents
    const count = await TestModel.countDocuments();
    console.log(`Test collection has ${count} documents`);
    
    // Close connection
    await mongoose.connection.close();
    console.log('Connection closed gracefully');
    
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return false;
  }
}

// Run the test
testMongoDBConnection()
  .then(success => {
    console.log(`Test ${success ? 'passed' : 'failed'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });