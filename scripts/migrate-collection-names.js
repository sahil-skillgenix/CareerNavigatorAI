/**
 * This script migrates all collections to use the new domain-specific naming convention
 * and removes redundant collections.
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

// Collection name mapping (old → new)
const COLLECTION_MAPPING = {
  // Core entity collections
  'skillgenix_user': 'userx_profiles',
  'users': 'userx_profiles',
  'user': 'userx_profiles',
  
  'skillgenix_role': 'rolex_definitions',
  'roles': 'rolex_definitions',
  'role': 'rolex_definitions',
  
  'skillgenix_skill': 'skillx_definitions',
  'skills': 'skillx_definitions',
  'skill': 'skillx_definitions',
  
  'skillgenix_industry': 'indx_definitions',
  'industries': 'indx_definitions',
  'industry': 'indx_definitions',
  
  // User-related collections
  'skillgenix_useractivity': 'userx_activities',
  'useractivity': 'userx_activities',
  'useractivities': 'userx_activities',
  'userActivity': 'userx_activities',
  
  'skillgenix_useractivitylog': 'userx_activitylogs',
  'useractivitylog': 'userx_activitylogs',
  'useractivitylogs': 'userx_activitylogs',
  'userActivityLog': 'userx_activitylogs',
  
  'skillgenix_userbadge': 'userx_achievements',
  'userbadge': 'userx_achievements',
  'userbadges': 'userx_achievements',
  'userBadge': 'userx_achievements',
  
  'skillgenix_userprogress': 'userx_progressdata',
  'userprogress': 'userx_progressdata',
  'userprogresses': 'userx_progressdata',
  'userProgress': 'userx_progressdata',
  
  // Career-related collections
  'skillgenix_careeranalysis': 'careerx_analyses',
  'careeranalysis': 'careerx_analyses',
  'careeranalyses': 'careerx_analyses',
  'careerAnalysis': 'careerx_analyses',
  
  'skillgenix_careerpathway': 'careerx_pathways',
  'careerpathway': 'careerx_pathways',
  'careerpathways': 'careerx_pathways',
  'careerPathway': 'careerx_pathways',
  
  // Relationship collections
  'skillgenix_roleskill': 'rolex_skillmaps',
  'roleskill': 'rolex_skillmaps',
  'roleskills': 'rolex_skillmaps',
  'roleSkill': 'rolex_skillmaps',
  
  'skillgenix_roleindustry': 'rolex_industrymaps',
  'roleindustry': 'rolex_industrymaps',
  'roleindustries': 'rolex_industrymaps',
  'roleIndustry': 'rolex_industrymaps',
  
  'skillgenix_skillindustry': 'skillx_industrymaps',
  'skillindustry': 'skillx_industrymaps',
  'skillindustries': 'skillx_industrymaps',
  'skillIndustry': 'skillx_industrymaps',
  
  'skillgenix_skillprerequisite': 'skillx_prerequisites',
  'skillprerequisite': 'skillx_prerequisites',
  'skillprerequisites': 'skillx_prerequisites',
  'skillPrerequisite': 'skillx_prerequisites',
  
  // System and logging collections
  'skillgenix_systemerrorlog': 'systemx_errorlogs',
  'systemerrorlog': 'systemx_errorlogs',
  'systemerrorlogs': 'systemx_errorlogs',
  'systemErrorLog': 'systemx_errorlogs',
  
  'skillgenix_errorlog': 'systemx_generalerrors',
  'errorlog': 'systemx_generalerrors',
  'errorlogs': 'systemx_generalerrors',
  'errorLog': 'systemx_generalerrors',
  
  'skillgenix_apirequestlog': 'apix_requestlogs',
  'apirequestlog': 'apix_requestlogs',
  'apirequestlogs': 'apix_requestlogs',
  'apiRequestLog': 'apix_requestlogs',
  
  // Feature/system collections
  'skillgenix_applimits': 'systemx_featurelimits',
  'skillgenix_featurelimit': 'systemx_featurelimits',
  'featurelimit': 'systemx_featurelimits',
  'featurelimits': 'systemx_featurelimits',
  'featureLimit': 'systemx_featurelimits',
  'featureLimits': 'systemx_featurelimits',
  
  // Learning resources
  'skillgenix_learningresource': 'learnx_resources',
  'learningresource': 'learnx_resources',
  'learningresources': 'learnx_resources',
  'learningResource': 'learnx_resources',
  
  // Sessions
  'sessions': 'systemx_sessions'
};

// Required collections - we will keep only these
const REQUIRED_COLLECTIONS = new Set(Object.values(COLLECTION_MAPPING));

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

// Migrate collection names and data
async function migrateCollections(db) {
  try {
    // Get all existing collections
    const collections = await getAllCollections(db);
    console.log(`Found ${collections.length} collections in the database`);
    
    // Track what we've done
    const processed = new Set();
    const migratedCollections = [];
    const droppedCollections = [];
    
    // First pass: Migrate all old collections to their new names
    for (const collection of collections) {
      const oldName = collection.name;
      
      // Skip system collections
      if (oldName.startsWith('system.')) {
        continue;
      }
      
      // Check if this collection needs migration
      const newName = COLLECTION_MAPPING[oldName];
      
      if (newName && newName !== oldName) {
        try {
          // Check if the target collection already exists
          const targetExists = collections.some(c => c.name === newName);
          
          if (targetExists) {
            console.log(`⚠️ Target collection ${newName} already exists, merging data...`);
            
            // Get all documents from the source collection
            const documents = await db.db.collection(oldName).find({}).toArray();
            
            if (documents.length > 0) {
              console.log(`   - Migrating ${documents.length} documents to ${newName}`);
              
              // Insert documents one by one to avoid duplicate key errors
              for (const doc of documents) {
                try {
                  await db.db.collection(newName).insertOne(doc);
                } catch (err) {
                  // Skip duplicate key errors
                  if (!err.message.includes('duplicate key')) {
                    console.error(`   - Error inserting document: ${err.message}`);
                  }
                }
              }
            }
            
            // Drop the old collection
            await db.db.collection(oldName).drop();
            console.log(`   - Dropped source collection ${oldName} after migration`);
            droppedCollections.push(oldName);
          } else {
            // Rename the collection
            await db.db.collection(oldName).rename(newName);
            console.log(`✅ Renamed collection ${oldName} to ${newName}`);
            migratedCollections.push({ from: oldName, to: newName });
          }
          
          processed.add(oldName);
          processed.add(newName);
        } catch (error) {
          console.error(`❌ Error migrating collection ${oldName} to ${newName}: ${error.message}`);
        }
      } else if (newName === oldName) {
        console.log(`✅ Collection ${oldName} already has the correct name`);
        processed.add(oldName);
      } else {
        console.log(`⚠️ Collection ${oldName} is not in the migration map`);
      }
    }
    
    // Second pass: Remove unnecessary collections
    // Get fresh collection list after migrations
    const updatedCollections = await getAllCollections(db);
    
    for (const collection of updatedCollections) {
      const name = collection.name;
      
      // Skip system collections
      if (name.startsWith('system.')) {
        continue;
      }
      
      // If not in required collections and not already processed, drop it
      if (!REQUIRED_COLLECTIONS.has(name) && !processed.has(name)) {
        try {
          await db.db.collection(name).drop();
          console.log(`✅ Dropped unnecessary collection: ${name}`);
          droppedCollections.push(name);
        } catch (error) {
          console.error(`❌ Error dropping collection ${name}: ${error.message}`);
        }
      }
    }
    
    // Return summary
    return {
      migratedCollections,
      droppedCollections
    };
  } catch (error) {
    console.error('Error migrating collections:', error);
    return {
      migratedCollections: [],
      droppedCollections: []
    };
  }
}

// Function to update model files
async function updateModelFiles() {
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
      for (const [oldName, newName] of Object.entries(COLLECTION_MAPPING)) {
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
    return updatedCount;
  } catch (error) {
    console.error('Error updating model files:', error);
    return 0;
  }
}

// Main function
async function main() {
  try {
    // Connect to MongoDB
    const db = await connectToMongoDB();
    
    // Migrate collections
    console.log('Migrating collections to new naming convention...');
    const migrationResult = await migrateCollections(db);
    
    // Update model files
    console.log('\nUpdating model files with new collection names...');
    const updatedFilesCount = await updateModelFiles();
    
    // Print summary
    console.log('\n=== MIGRATION SUMMARY ===');
    console.log(`Migrated collections: ${migrationResult.migratedCollections.length}`);
    migrationResult.migratedCollections.forEach(({ from, to }) => {
      console.log(`  - ${from} → ${to}`);
    });
    
    console.log(`\nDropped collections: ${migrationResult.droppedCollections.length}`);
    migrationResult.droppedCollections.forEach(name => {
      console.log(`  - ${name}`);
    });
    
    console.log(`\nUpdated model files: ${updatedFilesCount}`);
    
    console.log('\n🎉 Collection migration completed!');
    console.log('Run the verify-collection-names.js script to verify the results.');
    
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
main();