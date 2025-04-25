// Script to specifically drop duplicate collections with incorrect case naming
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

// Collections to drop (exact names of collections to remove)
const COLLECTIONS_TO_DROP = [
  "apirequestlogs",
  "careeranalyses",
  "careerpathways",
  "dataimportlogs",
  "errorlogs",
  "learningresources",
  "roleindustries",
  "roleskills",
  "skillindustries",
  "skillprerequisites",
  "systemerrorlogs",
  "systemnotifications",
  "systemusagestats",
  "useractivities",
  "userbadges",
  "userprogresses"
];

// Drop duplicate collections
async function dropDuplicateCollections() {
  try {
    const db = mongoose.connection.db;
    
    // Get list of all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('Current collections in database:', collectionNames.sort());
    
    // Drop each duplicate collection
    for (const collectionName of COLLECTIONS_TO_DROP) {
      if (collectionNames.includes(collectionName)) {
        console.log(`Dropping collection: ${collectionName}`);
        try {
          await db.dropCollection(collectionName);
          console.log(`- Successfully dropped ${collectionName}`);
        } catch (error) {
          console.error(`- Error dropping ${collectionName}: ${error.message}`);
        }
      } else {
        console.log(`Collection ${collectionName} does not exist, nothing to drop.`);
      }
    }
    
    // Final check
    const updatedCollections = await db.listCollections().toArray();
    const updatedCollectionNames = updatedCollections.map(c => c.name).sort();
    
    console.log('\nCollections after cleanup:');
    updatedCollectionNames.forEach(name => console.log(`- ${name}`));
    
    // Check if any duplicate collections still exist
    const remainingDuplicates = COLLECTIONS_TO_DROP.filter(name => 
      updatedCollectionNames.includes(name)
    );
    
    if (remainingDuplicates.length > 0) {
      console.log('\n⚠️ Warning: The following duplicate collections could not be dropped:');
      remainingDuplicates.forEach(name => console.log(`- ${name}`));
      return false;
    } else {
      console.log('\n✅ Successfully dropped all duplicate collections!');
      return true;
    }
  } catch (error) {
    console.error('Error dropping duplicate collections:', error);
    return false;
  }
}

// Main function
async function main() {
  try {
    await connectToMongoDB();
    const result = await dropDuplicateCollections();
    if (result) {
      console.log('\nDuplicate collection cleanup completed successfully!');
    } else {
      console.log('\nDuplicate collection cleanup encountered some issues.');
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