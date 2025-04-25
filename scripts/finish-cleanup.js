/**
 * This script completes the cleanup of remaining legacy collections.
 * 
 * Usage: DATABASE_URL=mongodb+srv://... node finish-cleanup.js
 */

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();

// Valid collections to keep
const VALID_COLLECTIONS = [
  'systemx_errorlogs',
  'systemx_featurelimits',
  'userx_activitylogs'
];

// MongoDB URI - get from environment
const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: No MongoDB URI provided. Set DATABASE_URL environment variable.');
  process.exit(1);
}

async function finishCleanup() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name).filter(name => !name.startsWith('system.'));
    
    console.log(`Found ${collectionNames.length} non-system collections in the database`);
    
    // Identify collections to drop (all except valid ones)
    const collectionsToRemove = collectionNames.filter(name => !VALID_COLLECTIONS.includes(name));
    
    console.log(`\nWill keep these collections (${VALID_COLLECTIONS.length}):`);
    VALID_COLLECTIONS.forEach(name => {
      if (collectionNames.includes(name)) {
        console.log(`- ${name}`);
      } else {
        console.log(`- ${name} (not found - will be created if needed)`);
      }
    });
    
    console.log(`\nWill drop these collections (${collectionsToRemove.length}):`);
    collectionsToRemove.forEach(name => {
      console.log(`- ${name}`);
    });
    
    // Perform cleanup
    console.log('\n=== PERFORMING FINAL CLEANUP ===');
    
    let droppedCount = 0;
    let errorCount = 0;
    
    for (const name of collectionsToRemove) {
      try {
        await db.collection(name).drop();
        console.log(`✅ Dropped: ${name}`);
        droppedCount++;
      } catch (err) {
        console.error(`❌ Error dropping ${name}: ${err.message}`);
        errorCount++;
      }
    }
    
    // Print summary
    console.log('\n=== CLEANUP SUMMARY ===');
    console.log(`Collections dropped: ${droppedCount}`);
    console.log(`Errors encountered: ${errorCount}`);
    
    // Verify final state
    const remainingCollections = (await db.listCollections().toArray())
      .map(c => c.name)
      .filter(name => !name.startsWith('system.'));
    
    console.log(`\nFinal state: ${remainingCollections.length} collections remaining`);
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
finishCleanup();