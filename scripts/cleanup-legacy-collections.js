/**
 * This script cleans up legacy collections after migration.
 * 
 * Usage: DATABASE_URL=mongodb+srv://... node cleanup-legacy-collections.js
 */

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();

// Legacy collections to remove (after migration)
const COLLECTIONS_TO_REMOVE = [
  // Activity logs
  'useractivitylogs', 
  'skillgenix_useractivitylog', 
  'skillgenix_useractivitylogs',
  'userActivity',
  'adminActivity',
  'superAdminActivity',
  
  // Error logs
  'errorlogs',
  'systemerrorlogs',
  'skillgenix_systemerrorlog',
  'skillgenix_errorlog',
  'systemErrorLog',
  
  // Feature limits
  'featurelimits',
  'featureLimit',
  'skillgenix_featurelimit',
  'skillgenix_applimits',
  'userFeatureOverride',
  
  // Other unused collections
  'apiRequestLog',
  'apirequestlogs',
  'careerAnalysis',
  'careerPathway',
  'careeranalyses',
  'careerpathways',
  'dataImportLog',
  'dataimportlogs',
  'industries',
  'learningResource',
  'learningresources',
  'notifications',
  'roleIndustry',
  'roleSkill',
  'roleindustries',
  'roles',
  'roleskills',
  'sessions',
  'skillIndustry',
  'skillPrerequisite',
  'skillgenix_careeranalysis',
  'skillgenix_careerpathway',
  'skillgenix_industry',
  'skillgenix_learningresource',
  'skillgenix_role',
  'skillgenix_roleindustry',
  'skillgenix_roleskill',
  'skillgenix_skill',
  'skillgenix_skillindustry',
  'skillgenix_skillprerequisite',
  'skillgenix_user',
  'skillgenix_useractivity',
  'skillgenix_userbadge',
  'skillgenix_userprogress',
  'skillindustries',
  'skillprerequisites',
  'skills',
  'systemNotification',
  'systemUsageStat',
  'systemnotifications',
  'systemusagestats',
  'test',
  'userBadge',
  'userProgress',
  'useractivities',
  'userbadges',
  'userprogresses',
  'users'
];

// MongoDB URI - get from environment
const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: No MongoDB URI provided. Set DATABASE_URL environment variable.');
  process.exit(1);
}

async function cleanupCollections() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const collectionNames = (await db.listCollections().toArray()).map(c => c.name);
    
    console.log(`Found ${collectionNames.length} collections in the database`);
    console.log('\n=== STARTING CLEANUP ===\n');
    
    let droppedCount = 0;
    let notFoundCount = 0;
    let errorCount = 0;
    
    // Drop collections in series to avoid overwhelming the database
    for (const collection of COLLECTIONS_TO_REMOVE) {
      if (collectionNames.includes(collection)) {
        try {
          await db.collection(collection).drop();
          console.log(`✅ Dropped: ${collection}`);
          droppedCount++;
        } catch (err) {
          console.error(`❌ Error dropping ${collection}: ${err.message}`);
          errorCount++;
        }
      } else {
        console.log(`⚠️ Collection not found: ${collection}`);
        notFoundCount++;
      }
    }
    
    // Print cleanup summary
    console.log('\n=== CLEANUP SUMMARY ===');
    console.log(`Collections dropped: ${droppedCount}`);
    console.log(`Collections not found: ${notFoundCount}`);
    console.log(`Errors encountered: ${errorCount}`);
    
    // Check which collections still remain
    const remainingCollections = (await db.listCollections().toArray()).map(c => c.name);
    
    console.log(`\nRemaining collections (${remainingCollections.length}):`);
    remainingCollections.sort().forEach(name => {
      console.log(`- ${name}`);
    });
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the script
cleanupCollections();