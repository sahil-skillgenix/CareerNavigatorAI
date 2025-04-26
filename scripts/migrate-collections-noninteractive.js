/**
 * This script migrates data from legacy collections to standardized collections
 * in non-interactive mode (for use in automated environments).
 * 
 * Usage: DATABASE_URL=mongodb+srv://... node migrate-collections-noninteractive.js
 */

import { MongoClient } from 'mongodb';
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

// Flag to control if we should also drop collections after migration
// Set to true to perform cleanup, false to only do the migration
const PERFORM_CLEANUP = false;

async function migrateCollections() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const collectionNames = (await db.listCollections().toArray()).map(c => c.name);
    
    console.log('Found ' + collectionNames.length + ' collections in the database');
    
    // Perform migrations
    console.log('\n=== STARTING MIGRATION ===');
    
    // Create report objects to track results
    const migrationResults = {
      totalMigrated: 0,
      collectionsProcessed: 0,
      sourceCollections: 0,
      errors: []
    };
    
    for (const [targetCollection, sourceCollections] of Object.entries(MIGRATION_MAP)) {
      console.log('\n== Processing migration to ' + targetCollection + ' ==');
      
      // Ensure target collection exists
      if (!collectionNames.includes(targetCollection)) {
        console.log('Creating target collection: ' + targetCollection);
        await db.createCollection(targetCollection);
      }
      
      // Get field mapping for this collection if available
      const fieldMapping = FIELD_MAPPINGS[targetCollection] || {};
      
      // Track counts for this target collection
      let totalDocumentsMigrated = 0;
      let sourceCollectionsProcessed = 0;
      
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
                    }
                  }
                }
                
                return newDoc;
              });
              
              // Insert transformed documents into target collection
              if (transformedDocuments.length > 0) {
                await db.collection(targetCollection).insertMany(transformedDocuments);
                console.log('✅ Migrated ' + transformedDocuments.length + ' documents from ' + sourceCollection);
                totalDocumentsMigrated += transformedDocuments.length;
              }
            }
            
            sourceCollectionsProcessed++;
          } catch (err) {
            console.error('Error migrating from ' + sourceCollection + ': ' + err.message);
            migrationResults.errors.push(sourceCollection + ': ' + err.message);
          }
        }
      }
      
      console.log('Total documents migrated to ' + targetCollection + ': ' + totalDocumentsMigrated);
      migrationResults.totalMigrated += totalDocumentsMigrated;
      migrationResults.collectionsProcessed++;
      migrationResults.sourceCollections += sourceCollectionsProcessed;
    }
    
    // Print migration summary
    console.log('\n=== MIGRATION SUMMARY ===');
    console.log('Target collections processed: ' + migrationResults.collectionsProcessed);
    console.log('Source collections processed: ' + migrationResults.sourceCollections);
    console.log('Total documents migrated: ' + migrationResults.totalMigrated);
    
    if (migrationResults.errors.length > 0) {
      console.log('\nErrors encountered: ' + migrationResults.errors.length);
      migrationResults.errors.forEach(err => console.log('- ' + err));
    } else {
      console.log('\nNo errors encountered during migration');
    }
    
    // Generate script for dropping old collections if cleanup flag is true
    if (PERFORM_CLEANUP) {
      console.log('\n=== PERFORMING CLEANUP ===');
      
      // Build complete list of collections to drop
      const toDrop = new Set(Object.entries(MIGRATION_MAP).flatMap(([_, sources]) => sources));
      
      // Drop collections
      let droppedCount = 0;
      let errorCount = 0;
      
      for (const collection of toDrop) {
        if (collectionNames.includes(collection)) {
          try {
            await db.collection(collection).drop();
            console.log('✅ Dropped: ' + collection);
            droppedCount++;
          } catch (err) {
            console.error('❌ Error dropping ' + collection + ': ' + err.message);
            errorCount++;
          }
        }
      }
      
      console.log('\nCleanup completed: ' + droppedCount + ' collections dropped, ' + errorCount + ' errors');
    } else {
      console.log('\nCleanup not performed (PERFORM_CLEANUP flag is false)');
      console.log('To perform cleanup, set PERFORM_CLEANUP to true and run again');
    }
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the script
migrateCollections();