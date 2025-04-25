/**
 * This script implements a new naming strategy for MongoDB collections
 * to ensure uniqueness and prevent >49% similarity between names.
 * It also cleans up unnecessary collections.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sahil:sahil123@skillgenix.4lthw6g.mongodb.net/careerpathAI?retryWrites=true&w=majority';

// New naming strategy
const NEW_COLLECTION_NAMES = {
  // Core entity collections - using uniquely identifiable prefixes
  'skillgenix_user': 'userx_profiles',
  'skillgenix_role': 'rolex_definitions',
  'skillgenix_skill': 'skillx_definitions',
  'skillgenix_industry': 'indx_definitions',
  
  // User activity and progress collections
  'skillgenix_useractivity': 'userx_activities',
  'skillgenix_useractivitylog': 'userx_activitylogs',
  'skillgenix_userbadge': 'userx_achievements', 
  'skillgenix_userprogress': 'userx_progressdata',
  
  // Career-related collections
  'skillgenix_careeranalysis': 'careerx_analyses',
  'skillgenix_careerpathway': 'careerx_pathways',
  
  // Relationship collections
  'skillgenix_roleskill': 'rolex_skillmaps',
  'skillgenix_roleindustry': 'rolex_industrymaps',
  'skillgenix_skillindustry': 'skillx_industrymaps',
  'skillgenix_skillprerequisite': 'skillx_prerequisites',
  
  // System and error collections
  'skillgenix_systemerrorlog': 'systemx_errorlogs',
  'skillgenix_apirequestlog': 'apix_requestlogs',
  'skillgenix_errorlog': 'systemx_generalerrors',
  
  // Other collections
  'skillgenix_applimits': 'systemx_featurelimits',
  'skillgenix_learningresource': 'learnx_resources',
  
  // Sessions
  'sessions': 'systemx_sessions'
};

// Function to connect to MongoDB
async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Function to get all collections
async function getAllCollections(db) {
  try {
    return await db.db.listCollections().toArray();
  } catch (error) {
    console.error('Error getting collections:', error);
    return [];
  }
}

// Function to update collection names in database
async function updateCollectionNames(db) {
  try {
    // Get all existing collections
    const collections = await getAllCollections(db);
    console.log(`Found ${collections.length} collections in the database`);
    
    // Track collections that were renamed
    const renamedCollections = [];
    
    // Collections to keep (both old names and new names)
    const collectionsToKeep = new Set([
      ...Object.keys(NEW_COLLECTION_NAMES),
      ...Object.values(NEW_COLLECTION_NAMES)
    ]);
    
    // First rename collections to their new names
    for (const collection of collections) {
      const oldName = collection.name;
      
      // Skip if collection is already using the new naming convention
      if (Object.values(NEW_COLLECTION_NAMES).includes(oldName)) {
        console.log(`✅ Collection ${oldName} already has the new naming format`);
        continue;
      }
      
      // Find the new name for this collection
      const newName = NEW_COLLECTION_NAMES[oldName];
      
      if (newName) {
        try {
          // Check if the target collection already exists
          const targetExists = collections.some(c => c.name === newName);
          
          if (targetExists) {
            console.log(`⚠️ Target collection ${newName} already exists, merging data...`);
            
            // Get all documents from the source collection
            const documents = await db.db.collection(oldName).find({}).toArray();
            
            if (documents.length > 0) {
              console.log(`   - Migrating ${documents.length} documents to ${newName}`);
              await db.db.collection(newName).insertMany(documents);
            }
            
            // Mark for deletion instead of renaming
            console.log(`   - Source collection ${oldName} marked for deletion`);
          } else {
            // Rename the collection
            await db.db.collection(oldName).rename(newName, { dropTarget: false });
            console.log(`✅ Renamed collection ${oldName} to ${newName}`);
            renamedCollections.push({ oldName, newName });
          }
        } catch (error) {
          console.error(`Error processing collection ${oldName}:`, error.message);
        }
      } else if (!collectionsToKeep.has(oldName)) {
        console.log(`⚠️ Collection ${oldName} is not in the rename map and is not needed`);
      }
    }
    
    // Now remove unnecessary collections
    const currentCollections = await getAllCollections(db);
    
    for (const collection of currentCollections) {
      const name = collection.name;
      
      if (!collectionsToKeep.has(name) && !name.startsWith('system.')) {
        try {
          await db.db.collection(name).drop();
          console.log(`✅ Dropped unnecessary collection: ${name}`);
        } catch (error) {
          console.error(`Error dropping collection ${name}:`, error.message);
        }
      }
    }
    
    return renamedCollections;
  } catch (error) {
    console.error('Error updating collection names:', error);
    return [];
  }
}

// Function to update model files with new collection names
async function updateModelFiles(renamedCollections) {
  // Path to models directory
  const modelsDir = path.join(__dirname, '../server/db/models');
  
  try {
    // Get all model files
    const files = await fs.readdir(modelsDir);
    console.log(`\nUpdating ${files.length} model files with new collection names`);
    
    let updatedCount = 0;
    
    for (const file of files) {
      if (!file.endsWith('.ts')) continue;
      
      const filePath = path.join(modelsDir, file);
      let content = await fs.readFile(filePath, 'utf8');
      let updated = false;
      
      // Update each model file with new collection names
      for (const [oldName, newName] of Object.entries(NEW_COLLECTION_NAMES)) {
        // Different patterns to replace
        const patterns = [
          // Pattern 1: mongoose.model(X, Y, "oldName")
          {
            regex: new RegExp(`mongoose\\.model\\([^,]+,[^,]+,\\s*["']${oldName}["']\\)`, 'g'),
            replacement: (match) => match.replace(`"${oldName}"`, `"${newName}"`).replace(`'${oldName}'`, `'${newName}'`)
          },
          // Pattern 2: mongoose.model("oldName", schema)
          {
            regex: new RegExp(`mongoose\\.model\\(["']${oldName}["'],\\s*\\w+Schema\\)`, 'g'),
            replacement: (match) => match.replace(`"${oldName}"`, `"${newName}"`).replace(`'${oldName}'`, `'${newName}'`)
          }
        ];
        
        // Apply each pattern
        for (const { regex, replacement } of patterns) {
          if (regex.test(content)) {
            content = content.replace(regex, replacement);
            updated = true;
          }
        }
      }
      
      // Update the file if changes were made
      if (updated) {
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`✅ Updated model file: ${file} with new collection names`);
        updatedCount++;
      }
    }
    
    console.log(`\nUpdated ${updatedCount} model files with new collection names`);
  } catch (error) {
    console.error('Error updating model files:', error);
  }
}

// Main function
async function main() {
  try {
    // Connect to MongoDB
    const db = await connectToMongoDB();
    
    // Update collection names in database
    const renamedCollections = await updateCollectionNames(db);
    
    // Update model files with new collection names
    await updateModelFiles(renamedCollections);
    
    console.log('\nCollection name implementation completed!');
  } catch (error) {
    console.error('Error during collection name implementation:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
main();