/**
 * This script migrates data from legacy collections to standardized collections
 * before dropping the old ones.
 * 
 * Usage: DATABASE_URL=mongodb+srv://... node migrate-and-cleanup-collections.js
 */

import { MongoClient } from 'mongodb';
import readline from 'readline';
import * as dotenv from 'dotenv';
dotenv.config();

// Target standardized collections with their legacy/duplicate equivalents
const MIGRATION_MAP = {
  // Activity logs
  'userx_activitylogs': [
    'useractivitylogs', 
    'skillgenix_useractivitylog', 
    'skillgenix_useractivitylogs',
    'userActivity',
    'adminActivity',
    'superAdminActivity'
  ],
  
  // Error logs
  'systemx_errorlogs': [
    'errorlogs',
    'systemerrorlogs',
    'skillgenix_systemerrorlog',
    'skillgenix_errorlog',
    'systemErrorLog'
  ],
  
  // Feature limits
  'systemx_featurelimits': [
    'featurelimits',
    'featureLimit',
    'skillgenix_featurelimit',
    'skillgenix_applimits',
    'userFeatureOverride'
  ]
};

// Other collections to remove (not needed for migration)
const COLLECTIONS_TO_REMOVE = [
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

// Standardized field names for collections
const FIELD_MAPPINGS = {
  'userx_activitylogs': {
    // Map old field names to new standardized names
    'activityType': 'action',
    'type': 'action',
    'activity': 'action',
    'actionType': 'action',
    'eventType': 'action',
    
    'activityCategory': 'category',
    'eventCategory': 'category',
    'logCategory': 'category',
    
    'timestamp': 'timestamp',
    'createdAt': 'timestamp',
    'date': 'timestamp',
    'loggedAt': 'timestamp',
    
    'userId': 'userId',
    'user': 'userId',
    'userIdentifier': 'userId',
    
    'details': 'details',
    'data': 'details',
    'metadata': 'details',
    'additionalInfo': 'details',
    'content': 'details'
  }
};

// MongoDB URI - get from environment
const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: No MongoDB URI provided. Set DATABASE_URL environment variable.');
  process.exit(1);
}

async function migrateAndCleanup() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const collectionNames = (await db.listCollections().toArray()).map(c => c.name);
    
    console.log('Found ' + collectionNames.length + ' collections in the database');
    
    // Create readline interface for user confirmation
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    // Confirm migration and cleanup
    rl.question('\nThis script will migrate data and drop old collections. Continue? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() !== 'yes') {
        console.log('Operation cancelled.');
        rl.close();
        await client.close();
        return;
      }
      
      // Perform migrations
      for (const [targetCollection, sourceCollections] of Object.entries(MIGRATION_MAP)) {
        console.log('\n== Processing migration to ' + targetCollection + ' ==');
        
        // Ensure target collection exists
        if (!collectionNames.includes(targetCollection)) {
          console.log('Creating target collection: ' + targetCollection);
          await db.createCollection(targetCollection);
        }
        
        // Get field mapping for this collection if available
        const fieldMapping = FIELD_MAPPINGS[targetCollection] || {};
        
        // Process each source collection
        for (const sourceCollection of sourceCollections) {
          if (collectionNames.includes(sourceCollection)) {
            try {
              // Count documents in source
              const sourceCount = await db.collection(sourceCollection).countDocuments();
              console.log('Migrating from ' + sourceCollection + ' (' + sourceCount + ' documents)...');
              
              if (sourceCount > 0) {
                // Get all documents from source
                const documents = await db.collection(sourceCollection).find({}).toArray();
                
                // Transform documents according to field mapping
                const transformedDocuments = documents.map(doc => {
                  const newDoc = { ...doc };
                  
                  // Apply field mappings if available
                  if (Object.keys(fieldMapping).length > 0) {
                    for (const [oldField, newField] of Object.entries(fieldMapping)) {
                      if (newDoc[oldField] !== undefined) {
                        // Only copy if field doesn't already exist with target name
                        if (newDoc[newField] === undefined) {
                          newDoc[newField] = newDoc[oldField];
                        }
                        
                        // Don't delete original fields to maintain backward compatibility
                        // This allows querying by both old and new field names
                      }
                    }
                  }
                  
                  return newDoc;
                });
                
                // Insert transformed documents into target collection
                if (transformedDocuments.length > 0) {
                  await db.collection(targetCollection).insertMany(transformedDocuments);
                  console.log('✅ Migrated ' + transformedDocuments.length + ' documents from ' + sourceCollection);
                }
              }
            } catch (err) {
              console.error('Error migrating from ' + sourceCollection + ': ' + err.message);
            }
          }
        }
      }
      
      // Wait for confirmation before dropping collections
      rl.question('\nMigration completed. Drop old collections now? (yes/no): ', async (dropAnswer) => {
        if (dropAnswer.toLowerCase() !== 'yes') {
          console.log('Collection deletion cancelled. Migration data has been preserved.');
          rl.close();
          await client.close();
          return;
        }
        
        // Build complete list of collections to drop
        const toDrop = new Set([
          ...COLLECTIONS_TO_REMOVE,
          ...Object.entries(MIGRATION_MAP).flatMap(([_, sources]) => sources)
        ]);
        
        // Drop collections
        console.log('\n== Dropping old collections ==');
        
        for (const collection of toDrop) {
          if (collectionNames.includes(collection)) {
            try {
              await db.collection(collection).drop();
              console.log('✅ Dropped: ' + collection);
            } catch (err) {
              console.error('❌ Error dropping ' + collection + ': ' + err.message);
            }
          }
        }
        
        console.log('\nCleanup completed!');
        rl.close();
        await client.close();
      });
    });
  } catch (error) {
    console.error('Database error:', error);
  }
}

migrateAndCleanup();