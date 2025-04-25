// Script to standardize collection names (Batch 3)
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

// Collection mapping for batch 3
const COLLECTION_MAPPING = {
  roleSkills: ['roleskills'],
  roleIndustries: ['roleindustries'],
  skillIndustries: ['skillindustries'],
  skillPrerequisites: ['skillprerequisites'],
  careerPathways: ['careerpathways'],
  errorLogs: ['errorlogs']
};

// Standardize collection names
async function standardizeCollections() {
  try {
    const db = mongoose.connection.db;
    
    // Get list of all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('Current collections in database:', collectionNames.sort());
    
    // Process each correct collection name
    for (const [correctName, duplicateNames] of Object.entries(COLLECTION_MAPPING)) {
      console.log(`\nProcessing collection: ${correctName}`);
      
      // Does the correct collection exist?
      const correctExists = collectionNames.includes(correctName);
      
      // Find duplicates that exist
      const existingDuplicates = duplicateNames.filter(dup => collectionNames.includes(dup));
      
      if (existingDuplicates.length === 0) {
        if (correctExists) {
          console.log(`- Collection ${correctName} exists in correct form. No duplicates found.`);
        } else {
          console.log(`- Collection ${correctName} doesn't exist yet. It will be created when needed.`);
        }
        continue;
      }
      
      // Handle each duplicate
      for (const duplicateName of existingDuplicates) {
        if (correctExists) {
          // Both exist, need to merge duplicate into correct
          console.log(`- Both ${correctName} and ${duplicateName} exist. Merging data...`);
          
          // Get both collections
          const correctCollection = db.collection(correctName);
          const duplicateCollection = db.collection(duplicateName);
          
          // Get count of documents in each
          const correctCount = await correctCollection.countDocuments();
          const duplicateCount = await duplicateCollection.countDocuments();
          
          console.log(`  - ${correctName} has ${correctCount} documents`);
          console.log(`  - ${duplicateName} has ${duplicateCount} documents`);
          
          if (duplicateCount > 0) {
            // Copy all documents from duplicate to correct
            const duplicateDocs = await duplicateCollection.find({}).toArray();
            
            let insertedCount = 0;
            for (const doc of duplicateDocs) {
              try {
                // Remove MongoDB's _id to avoid duplicate key errors
                const { _id, ...docWithoutId } = doc;
                
                // Insert with a new _id
                await correctCollection.insertOne(docWithoutId);
                insertedCount++;
              } catch (error) {
                console.log(`  - Error copying document: ${error.message}`);
                // Continue with next document
              }
            }
            
            console.log(`  - Copied ${insertedCount} documents from ${duplicateName} to ${correctName}`);
          }
          
          // Drop the duplicate collection
          await db.dropCollection(duplicateName);
          console.log(`  - Dropped collection ${duplicateName}`);
        } else {
          // Only duplicate exists, rename it to correct name
          console.log(`- Only ${duplicateName} exists. Renaming to ${correctName}...`);
          await db.renameCollection(duplicateName, correctName);
          console.log(`  - Renamed collection ${duplicateName} to ${correctName}`);
        }
      }
    }
    
    // Final check - get all collections again
    const finalCollections = await db.listCollections().toArray();
    const finalCollectionNames = finalCollections.map(c => c.name).sort();
    
    console.log('\nFinal collections in database:');
    for (const name of finalCollectionNames) {
      if (Object.keys(COLLECTION_MAPPING).includes(name)) {
        console.log(`- ${name} ✓`);
      } else if (Object.values(COLLECTION_MAPPING).flat().includes(name)) {
        console.log(`- ${name} ⚠️ Still exists as duplicate`);
      }
    }
    
    // Log a complete list of standardized collection names for reference
    console.log('\nCompleted standardized collection list:');
    const standardizedCollections = [
      'users',
      'roles',
      'skills',
      'industries',
      'userActivities',
      'apiRequestLogs',
      'systemUsageStats',
      'systemErrorLogs',
      'systemNotifications',
      'dataImportLogs',
      'careerAnalyses',
      'learningResources',
      'userBadges',
      'userProgresses',
      'roleSkills',
      'roleIndustries',
      'skillIndustries',
      'skillPrerequisites',
      'careerPathways',
      'errorLogs',
      'sessions',
      'notifications',
      'tests',
      'adminActivities',
      'superadminActivities',
      'userFeatureOverrides',
      'userNotificationStatuses',
      'featureLimits'
    ];
    console.log(standardizedCollections.sort().join('\n'));
    
    return true;
  } catch (error) {
    console.error('Error standardizing collections:', error);
    return false;
  }
}

// Main function
async function main() {
  try {
    await connectToMongoDB();
    const result = await standardizeCollections();
    if (result) {
      console.log('\nBatch 3 collection standardization completed successfully!');
    } else {
      console.log('\nBatch 3 collection standardization failed!');
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