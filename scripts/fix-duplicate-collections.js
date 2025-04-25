// Script to fix duplicate collections with similar names (case differences)

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

// Collection mappings - first is the CORRECT one, second should be merged and removed
const COLLECTION_MAPPINGS = [
  { correct: 'dataImportLogs', duplicate: 'dataimportlogs' },
  { correct: 'featureLimits', duplicate: 'featurelimits' },
  { correct: 'tests', duplicate: 'test' }
];

// Function to merge collections and remove the duplicates
async function fixDuplicateCollections() {
  try {
    const db = mongoose.connection.db;
    
    // Get list of all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('Collections in database:', collectionNames);
    
    // Process each mapping
    for (const mapping of COLLECTION_MAPPINGS) {
      console.log(`\nProcessing mapping: ${mapping.correct} (keep) and ${mapping.duplicate} (merge & remove)`);
      
      // Check if both collections exist
      if (collectionNames.includes(mapping.correct) && collectionNames.includes(mapping.duplicate)) {
        console.log(`Both collections exist. Merging ${mapping.duplicate} into ${mapping.correct}...`);
        
        // Get both collections
        const correctCollection = db.collection(mapping.correct);
        const duplicateCollection = db.collection(mapping.duplicate);
        
        // Get count of documents in each collection
        const correctCount = await correctCollection.countDocuments();
        const duplicateCount = await duplicateCollection.countDocuments();
        
        console.log(`- ${mapping.correct} has ${correctCount} documents`);
        console.log(`- ${mapping.duplicate} has ${duplicateCount} documents`);
        
        if (duplicateCount > 0) {
          // Get all documents from the duplicate collection
          const duplicateDocs = await duplicateCollection.find({}).toArray();
          
          // Insert them into the correct collection if they don't already exist
          // Handle potential duplicate key errors and null values
          let insertedCount = 0;
          for (const doc of duplicateDocs) {
            try {
              // Remove MongoDB's _id to avoid duplicate key errors
              const { _id, ...docWithoutId } = doc;
              
              // Fix null values that may be causing unique index violations
              // For featureLimits collection specifically
              if (mapping.correct === 'featureLimits' && (docWithoutId.name === null || docWithoutId.name === undefined)) {
                docWithoutId.name = `feature_${Math.random().toString(36).substring(2, 9)}`;
                console.log(`  - Fixed null name in featureLimits document`);
              }
              
              // Build a more precise matching query
              const matchQuery = Object.entries(docWithoutId)
                .filter(([key, value]) => 
                  typeof value !== 'object' && // Skip nested objects
                  value !== null && // Skip null values
                  key !== 'password' // Skip password as it might have different hash formats
                )
                .reduce((obj, [key, value]) => {
                  obj[key] = value;
                  return obj;
                }, {});
              
              // Skip empty match queries to avoid matching everything
              const exists = Object.keys(matchQuery).length > 0 
                ? await correctCollection.findOne(matchQuery)
                : true; // Assume it exists if we can't properly match
              
              if (!exists) {
                // Insert the document with a new ID
                await correctCollection.insertOne(docWithoutId);
                insertedCount++;
              }
            } catch (error) {
              console.log(`  - Error processing document: ${error.message}`);
              // Continue with the next document
            }
          }
          
          console.log(`- Merged ${insertedCount} documents from ${mapping.duplicate} to ${mapping.correct}`);
        }
        
        // Drop the duplicate collection
        await db.dropCollection(mapping.duplicate);
        console.log(`- Dropped collection ${mapping.duplicate}`);
      } else if (!collectionNames.includes(mapping.correct) && collectionNames.includes(mapping.duplicate)) {
        console.log(`Only duplicate collection exists. Renaming ${mapping.duplicate} to ${mapping.correct}...`);
        await db.renameCollection(mapping.duplicate, mapping.correct);
        console.log(`- Renamed collection ${mapping.duplicate} to ${mapping.correct}`);
      } else if (collectionNames.includes(mapping.correct) && !collectionNames.includes(mapping.duplicate)) {
        console.log(`Only correct collection exists. No action needed for ${mapping.correct}.`);
      } else {
        console.log(`Neither collection exists. Skipping this mapping.`);
      }
    }
    
    // Create standardized collection list
    const userCollections = {
      users: 'All users including admin, superadmin and regular users',
      adminActivities: 'Admin activities',
      superadminActivities: 'Super admin activities',
      userActivities: 'Regular user activities',
    };
    
    // Check if we need to create any of these collections
    for (const [collection, description] of Object.entries(userCollections)) {
      if (!collectionNames.includes(collection)) {
        console.log(`\nCreating standard collection: ${collection}`);
        await db.createCollection(collection);
        console.log(`Created collection: ${collection} (${description})`);
      }
    }
    
    // Get updated collections
    const updatedCollections = await db.listCollections().toArray();
    const updatedCollectionNames = updatedCollections.map(c => c.name);
    
    console.log('\nAfter cleanup, collections in database:', updatedCollectionNames);
    return true;
  } catch (error) {
    console.error('Error fixing duplicate collections:', error);
    return false;
  }
}

// Main function
async function main() {
  try {
    await connectToMongoDB();
    const result = await fixDuplicateCollections();
    if (result) {
      console.log('\nDatabase collection cleanup completed successfully!');
    } else {
      console.log('\nDatabase collection cleanup failed!');
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