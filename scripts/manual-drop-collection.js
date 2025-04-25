// Script to manually drop a collection using low-level MongoDB driver methods
import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
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

// Collection to drop
const COLLECTION_NAME = "apirequestlogs";

// Main function
async function main() {
  console.log(`Attempting to drop collection ${COLLECTION_NAME} using direct MongoDB driver...`);
  
  let client;
  try {
    // Connect directly using MongoClient
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB using direct client');
    
    // Get database name from connection string
    const dbName = MONGODB_URI.split('/').pop().split('?')[0];
    console.log(`Using database: ${dbName}`);
    
    const db = client.db(dbName);
    
    // List collections before
    const collections = await db.listCollections().toArray();
    console.log('Collections before:', collections.map(c => c.name).sort());
    
    // Try multiple methods to drop the collection
    try {
      console.log(`\nMethod 1: Using db.dropCollection()`);
      await db.dropCollection(COLLECTION_NAME);
      console.log(`- Success! Dropped ${COLLECTION_NAME}`);
    } catch (error1) {
      console.log(`- Failed: ${error1.message}`);
      
      try {
        console.log(`\nMethod 2: Using collection.drop()`);
        const collection = db.collection(COLLECTION_NAME);
        await collection.drop();
        console.log(`- Success! Dropped ${COLLECTION_NAME}`);
      } catch (error2) {
        console.log(`- Failed: ${error2.message}`);
        
        try {
          console.log(`\nMethod 3: Using db.command()`);
          await db.command({ drop: COLLECTION_NAME });
          console.log(`- Success! Dropped ${COLLECTION_NAME}`);
        } catch (error3) {
          console.log(`- Failed: ${error3.message}`);
          
          try {
            console.log(`\nMethod 4: Rename and then drop`);
            const tempName = `temp_${Date.now()}`;
            await db.admin().command({ renameCollection: `${dbName}.${COLLECTION_NAME}`, to: `${dbName}.${tempName}` });
            console.log(`- Renamed ${COLLECTION_NAME} to ${tempName}`);
            await db.collection(tempName).drop();
            console.log(`- Dropped ${tempName}`);
          } catch (error4) {
            console.log(`- Failed: ${error4.message}`);
            
            try {
              console.log(`\nMethod 5: Delete all documents`);
              const collection = db.collection(COLLECTION_NAME);
              const result = await collection.deleteMany({});
              console.log(`- Deleted ${result.deletedCount} documents from ${COLLECTION_NAME}`);
            } catch (error5) {
              console.log(`- Failed: ${error5.message}`);
            }
          }
        }
      }
    }
    
    // List collections after
    const collectionsAfter = await db.listCollections().toArray();
    console.log('\nCollections after:', collectionsAfter.map(c => c.name).sort());
    
    // Check if collection was dropped
    const stillExists = collectionsAfter.some(c => c.name === COLLECTION_NAME);
    if (stillExists) {
      console.log(`\n❌ Collection ${COLLECTION_NAME} still exists.`);
    } else {
      console.log(`\n✅ Collection ${COLLECTION_NAME} was successfully dropped!`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('Disconnected from MongoDB');
    }
  }
}

main();