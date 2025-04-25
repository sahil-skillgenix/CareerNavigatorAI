// Script to forcefully drop the remaining problematic collection
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connection URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sahil:sahil123@skillgenix.4lthw6g.mongodb.net/careerpathAI?retryWrites=true&w=majority';

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Last collection to forcefully drop
const PROBLEMATIC_COLLECTION = "apirequestlogs";

// Drop the problematic collection using a different approach
async function dropProblematicCollection() {
  try {
    const db = mongoose.connection.db;
    
    // Get list of all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('Current collections in database:', collectionNames.sort());
    
    if (collectionNames.includes(PROBLEMATIC_COLLECTION)) {
      console.log(`\nAttempting to drop problematic collection ${PROBLEMATIC_COLLECTION}...`);
      
      // Try using the raw command
      try {
        await db.command({ drop: PROBLEMATIC_COLLECTION });
        console.log(`- Successfully dropped ${PROBLEMATIC_COLLECTION} using command`);
      } catch (cmdError) {
        console.log(`- Command method failed: ${cmdError.message}`);
        
        // Try an alternative approach
        try {
          // Rename first, then drop
          const tempName = `${PROBLEMATIC_COLLECTION}_temp_${Date.now()}`;
          await db.renameCollection(PROBLEMATIC_COLLECTION, tempName);
          console.log(`- Renamed ${PROBLEMATIC_COLLECTION} to ${tempName}`);
          
          await db.dropCollection(tempName);
          console.log(`- Dropped temporary collection ${tempName}`);
        } catch (altError) {
          console.error(`- Alternative method failed: ${altError.message}`);
          
          // Last resort - try to empty the collection
          try {
            const collection = db.collection(PROBLEMATIC_COLLECTION);
            await collection.deleteMany({});
            console.log(`- Could not drop collection, but emptied all documents from ${PROBLEMATIC_COLLECTION}`);
          } catch (emptyError) {
            console.error(`- Failed to empty collection: ${emptyError.message}`);
            return false;
          }
        }
      }
    } else {
      console.log(`Collection ${PROBLEMATIC_COLLECTION} does not exist, nothing to drop.`);
    }
    
    // Final check
    const updatedCollections = await db.listCollections().toArray();
    const updatedCollectionNames = updatedCollections.map(c => c.name).sort();
    
    console.log('\nCollections after cleanup:');
    updatedCollectionNames.forEach(name => console.log(`- ${name}`));
    
    // Check if problematic collection still exists
    if (updatedCollectionNames.includes(PROBLEMATIC_COLLECTION)) {
      console.log(`\n⚠️ Warning: The problematic collection ${PROBLEMATIC_COLLECTION} could not be dropped.`);
      return false;
    } else {
      console.log(`\n✅ Successfully dropped problematic collection ${PROBLEMATIC_COLLECTION}!`);
      return true;
    }
  } catch (error) {
    console.error('Error dropping problematic collection:', error);
    return false;
  }
}

// Main function
async function main() {
  try {
    await connectToMongoDB();
    const result = await dropProblematicCollection();
    if (result) {
      console.log('\nFinal cleanup completed successfully!');
    } else {
      console.log('\nFinal cleanup encountered issues.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the main function
main();