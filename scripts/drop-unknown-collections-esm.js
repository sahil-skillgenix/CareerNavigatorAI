
/**
 * Script to drop unknown/unnecessary collections
 * IMPORTANT: Review carefully before running!
 */

import { MongoClient } from 'mongodb';
import readline from 'readline';
import * as dotenv from 'dotenv';
dotenv.config();

// Collections to drop
const COLLECTIONS_TO_DROP = [
    'adminActivity',
  'apiRequestLog',
  'apirequestlogs',
  'careerAnalysis',
  'careerPathway',
  'careeranalyses',
  'careerpathways',
  'dataImportLog',
  'dataimportlogs',
  'errorlogs',
  'featureLimit',
  'featurelimits',
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
  'skillgenix_errorlog',
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
  'skillgenix_useractivitylogs',
  'skillgenix_userbadge',
  'skillgenix_userprogress',
  'skillindustries',
  'skillprerequisites',
  'skills',
  'superAdminActivity',
  'systemErrorLog',
  'systemNotification',
  'systemUsageStat',
  'systemerrorlogs',
  'systemnotifications',
  'systemusagestats',
  'test',
  'userActivity',
  'userBadge',
  'userFeatureOverride',
  'userProgress',
  'useractivities',
  'useractivitylogs',
  'userbadges',
  'userprogresses',
  'users'
];

// MongoDB URI
const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: No MongoDB URI provided. Set DATABASE_URL environment variable.');
  process.exit(1);
}

async function dropCollections() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Confirm with user
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    console.log('The following collections will be dropped:');
    COLLECTIONS_TO_DROP.forEach(name => console.log(`- ${name}`));
    
    rl.question('\nWARNING: This will permanently delete these collections!\nAre you sure you want to proceed? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        for (const name of COLLECTIONS_TO_DROP) {
          try {
            await db.collection(name).drop();
            console.log(`✅ Dropped collection: ${name}`);
          } catch (error) {
            console.error(`❌ Error dropping collection ${name}: ${error.message}`);
          }
        }
        console.log('\nCleanup complete!');
      } else {
        console.log('Operation cancelled. No collections were dropped.');
      }
      
      rl.close();
      await client.close();
    });
  } catch (error) {
    console.error('Error:', error);
    await client.close();
  }
}

dropCollections();
