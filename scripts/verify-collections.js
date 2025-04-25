// Script to verify all collection names follow the standardized naming convention
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

// Standard collection naming convention
const STANDARD_COLLECTIONS = [
  // Core entities - lowercase
  'users',
  'roles',
  'skills',
  'industries',
  'sessions',
  'notifications',
  'tests',
  
  // Multi-word collections - camelCase
  'adminActivities',
  'superadminActivities',
  'userActivities',
  'apiRequestLogs',
  'systemUsageStats',
  'systemErrorLogs',
  'systemNotifications',
  'dataImportLogs',
  'careerAnalyses',
  'careerPathways',
  'userBadges',
  'userProgresses',
  'userFeatureOverrides',
  'userNotificationStatuses',
  'learningResources',
  'errorLogs',
  'featureLimits',
  
  // Relationship collections - camelCase
  'roleSkills',
  'roleIndustries',
  'skillIndustries',
  'skillPrerequisites'
];

// Verify collection names
async function verifyCollections() {
  try {
    const db = mongoose.connection.db;
    
    // Get list of all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name).sort();
    
    console.log('Current collections in database:');
    collectionNames.forEach(name => console.log(`- ${name}`));
    
    // Find non-standard collections
    const nonStandardCollections = collectionNames.filter(name => !STANDARD_COLLECTIONS.includes(name));
    
    if (nonStandardCollections.length > 0) {
      console.log('\n⚠️ Found non-standard collections:');
      nonStandardCollections.forEach(name => console.log(`- ${name}`));
      
      // Check for potential case-sensitivity issues
      const potentialDuplicates = [];
      for (const nonStandard of nonStandardCollections) {
        const lowerNonStandard = nonStandard.toLowerCase();
        for (const standard of STANDARD_COLLECTIONS) {
          const lowerStandard = standard.toLowerCase();
          if (lowerNonStandard === lowerStandard && nonStandard !== standard) {
            potentialDuplicates.push({
              nonStandard,
              standard,
              issue: 'Case sensitivity'
            });
          }
        }
      }
      
      if (potentialDuplicates.length > 0) {
        console.log('\n❌ Found case sensitivity issues:');
        potentialDuplicates.forEach(dup => {
          console.log(`- "${dup.nonStandard}" should be "${dup.standard}" (${dup.issue})`);
        });
      }
    } else {
      console.log('\n✅ All collections follow the standard naming convention!');
    }
    
    // Check for missing standard collections
    const missingCollections = STANDARD_COLLECTIONS.filter(name => !collectionNames.includes(name));
    
    if (missingCollections.length > 0) {
      console.log('\nℹ️ Some standard collections do not exist yet (normal if not using that feature):');
      missingCollections.forEach(name => console.log(`- ${name}`));
    }
    
    return nonStandardCollections.length === 0;
  } catch (error) {
    console.error('Error verifying collections:', error);
    return false;
  }
}

// Main function
async function main() {
  try {
    await connectToMongoDB();
    const result = await verifyCollections();
    if (result) {
      console.log('\nCollection verification completed successfully!');
    } else {
      console.log('\nCollection verification found issues that need to be addressed.');
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