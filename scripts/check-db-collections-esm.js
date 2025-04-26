/**
 * This script checks for unnecessary collections in the MongoDB database
 * by comparing with our known valid collections.
 * 
 * Usage: DATABASE_URL=mongodb+srv://... node check-db-collections-esm.js
 */

import { MongoClient } from 'mongodb';
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

// Known collection names that we want to keep
const VALID_COLLECTIONS = [
  // New standardized collection names
  'systemx_featurelimits',
  'systemx_errorlogs',
  'userx_activitylogs',
  'userx_profiles',
  'rolex_definitions',
  'skillx_definitions',
  'indx_definitions',
  'userx_activities',
  'userx_achievements',
  'userx_progressdata',
  'careerx_analyses',
  'careerx_pathways',
  'rolex_skillmaps',
  'rolex_industrymaps',
  'skillx_industrymaps',
  'skillx_prerequisites',
  'systemx_generalerrors',
  'apix_requestlogs',
  'learnx_resources',
  'systemx_sessions',
  
  // Legacy names we might still be using
  'skillgenix_systemerrorlog',
  'skillgenix_useractivitylog',
  'skillgenix_applimits',
  'skillgenix_featurelimit'
];

// MongoDB URI - get from environment
const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: No MongoDB URI provided. Set DATABASE_URL environment variable.');
  process.exit(1);
}

async function checkCollections() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    
    console.log(`\nFound ${collections.length} collections in the database\n`);
    
    const validCollections = [];
    const unknownCollections = [];
    const systemCollections = [];
    
    // Sort collections into categories
    for (const collection of collections) {
      const name = collection.name;
      
      if (name.startsWith('system.')) {
        systemCollections.push(name);
        continue;
      }
      
      if (VALID_COLLECTIONS.includes(name)) {
        validCollections.push(name);
      } else {
        unknownCollections.push(name);
      }
    }
    
    // Print results
    console.log('VALID COLLECTIONS:');
    validCollections.sort().forEach(name => {
      console.log(`- ${name}`);
    });
    
    console.log('\nSYSTEM COLLECTIONS:');
    systemCollections.sort().forEach(name => {
      console.log(`- ${name}`);
    });
    
    console.log('\nUNKNOWN COLLECTIONS:');
    if (unknownCollections.length === 0) {
      console.log('None - all collections are recognized');
    } else {
      unknownCollections.sort().forEach(name => {
        console.log(`- ${name}`);
      });
    }
    
    if (unknownCollections.length > 0) {
      console.log('\n=== CLEANUP RECOMMENDATIONS ===');
      console.log('The following collections are not recognized and may be candidates for deletion:');
      unknownCollections.forEach(name => {
        console.log(`- ${name}`);
      });
      
      // Generate cleanup script
      const cleanupCode = `/**
 * Script to drop unknown/unnecessary collections
 * IMPORTANT: Review carefully before running!
 */

import { MongoClient } from 'mongodb';
import readline from 'readline';
import * as dotenv from 'dotenv';
dotenv.config();

// Collections to drop
const COLLECTIONS_TO_DROP = [
${unknownCollections.map(name => `  '${name}'`).join(',\n')}
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
    COLLECTIONS_TO_DROP.forEach(name => console.log('- ' + name));
    
    rl.question('\\nWARNING: This will permanently delete these collections!\\nAre you sure you want to proceed? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        for (const name of COLLECTIONS_TO_DROP) {
          try {
            await db.collection(name).drop();
            console.log('✅ Dropped collection: ' + name);
          } catch (error) {
            console.error('❌ Error dropping collection ' + name + ': ' + error.message);
          }
        }
        console.log('\\nCleanup complete!');
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
`;
      
      fs.writeFileSync('drop-unknown-collections-esm.js', cleanupCode);
      console.log('\nCreated drop-unknown-collections-esm.js script for removing unrecognized collections');
      console.log('IMPORTANT: Review the script carefully before running!');
    }
    
  } catch (error) {
    console.error('Error checking collections:', error);
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

checkCollections();