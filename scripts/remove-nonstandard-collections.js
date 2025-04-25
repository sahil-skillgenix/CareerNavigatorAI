// Script to remove non-standard collections
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

// Standard collection names
const STANDARD_COLLECTIONS = [
  'users',
  'roles',
  'skills',
  'industries',
  'sessions',
  'notifications',
  'userActivity',
  'userProgress',
  'userBadge',
  'userFeatureOverride',
  'adminActivity',
  'superAdminActivity',
  'featureLimit',
  'systemErrorLog',
  'systemUsageStat',
  'systemNotification',
  'apiRequestLog',
  'dataImportLog',
  'careerAnalysis',
  'careerPathway',
  'learningResource',
  'roleSkill',
  'roleIndustry',
  'skillIndustry',
  'skillPrerequisite',
  'test'
];

// Main function
async function main() {
  try {
    console.log('=== REMOVING NON-STANDARD COLLECTIONS ===');
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get current collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name).sort();
    
    console.log('\nCurrent collections in database:');
    collectionNames.forEach(name => console.log(`- ${name}`));
    
    // Find non-standard collections
    const nonStandardCollections = collectionNames.filter(name => !STANDARD_COLLECTIONS.includes(name));
    
    console.log('\nFound non-standard collections:');
    nonStandardCollections.forEach(name => console.log(`- ${name}`));
    
    // Drop non-standard collections
    console.log('\nDropping non-standard collections...');
    for (const collection of nonStandardCollections) {
      try {
        await db.dropCollection(collection);
        console.log(`- Dropped collection: ${collection}`);
      } catch (error) {
        console.error(`- Error dropping ${collection}: ${error.message}`);
      }
    }
    
    // Check final state
    const finalCollections = await db.listCollections().toArray();
    const finalCollectionNames = finalCollections.map(c => c.name).sort();
    
    console.log('\n=== NON-STANDARD COLLECTION REMOVAL COMPLETE ===');
    console.log('Final collections in database:');
    finalCollectionNames.forEach(name => console.log(`- ${name}`));
    
    // Verify all remaining collections are standard
    const remainingNonStandard = finalCollectionNames.filter(name => !STANDARD_COLLECTIONS.includes(name));
    if (remainingNonStandard.length > 0) {
      console.log('\n⚠️ Warning: Some non-standard collections could not be removed:');
      remainingNonStandard.forEach(name => console.log(`- ${name}`));
    } else {
      console.log('\n✅ All collections now follow the standard naming convention!');
    }
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error removing non-standard collections:', error);
  }
}

// Run the main function
main();