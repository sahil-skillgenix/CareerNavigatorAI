/**
 * This script analyzes the MongoDB database to identify unused collections
 * by checking collection document counts and model file references.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';

// Convert exec to promise-based
const execAsync = promisify(exec);

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sahil:sahil123@skillgenix.4lthw6g.mongodb.net/careerpathAI?retryWrites=true&w=majority';

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

// Function to search code for collection references
async function findCollectionReferencesInCode(collections) {
  const rootDir = path.join(__dirname, '..');
  const collectionRefs = {};
  
  // Initialize all collections with zero references
  collections.forEach(collection => {
    collectionRefs[collection.name] = {
      references: 0,
      files: []
    };
  });
  
  // Search for collection references in all TypeScript and JavaScript files
  try {
    // Use grep to search for collection references in all files
    // This is much faster than walking the directory and reading each file
    for (const collection of collections) {
      const { stdout } = await execAsync(`grep -r --include="*.ts" --include="*.js" "${collection.name}" ${rootDir}/server ${rootDir}/shared || true`);
      
      if (stdout.trim()) {
        const lines = stdout.trim().split('\n');
        collectionRefs[collection.name].references = lines.length;
        collectionRefs[collection.name].files = lines.map(line => line.split(':')[0]);
      }
    }
    
    return collectionRefs;
  } catch (error) {
    console.error('Error searching for collection references:', error);
    return collectionRefs;
  }
}

// Function to check document counts in each collection
async function getCollectionDocumentCounts(db, collections) {
  const documentCounts = {};
  
  for (const collection of collections) {
    try {
      const count = await db.db.collection(collection.name).countDocuments();
      documentCounts[collection.name] = count;
    } catch (error) {
      console.error(`Error counting documents in ${collection.name}:`, error.message);
      documentCounts[collection.name] = 'Error';
    }
  }
  
  return documentCounts;
}

// Function to analyze MongoDB models for collection usage
async function analyzeModelFiles() {
  const modelsDir = path.join(__dirname, '../server/db/models');
  const usedCollections = [];
  
  try {
    const files = await fs.readdir(modelsDir);
    
    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.js')) continue;
      
      const filePath = path.join(modelsDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Extract collection name from mongoose.model(..., collection_name)
      const collectionMatches = content.match(/mongoose\.model\([^,]+,[^,]+,\s*["']([^"']+)["']/g);
      
      if (collectionMatches) {
        for (const match of collectionMatches) {
          const collectionName = match.match(/["']([^"']+)["']\)/)[1];
          if (collectionName) {
            usedCollections.push({
              name: collectionName,
              sourceFile: file
            });
          }
        }
      }
    }
    
    return usedCollections;
  } catch (error) {
    console.error('Error analyzing model files:', error);
    return [];
  }
}

// Function to identify unused collections
async function identifyUnusedCollections(db) {
  try {
    // Get all collections from the database
    const collections = await getAllCollections(db);
    console.log(`Found ${collections.length} collections in the database\n`);
    
    // Get document counts for each collection
    const documentCounts = await getCollectionDocumentCounts(db, collections);
    
    // Find code references to collections
    const collectionRefs = await findCollectionReferencesInCode(collections);
    
    // Get collections defined in model files
    const modelCollections = await analyzeModelFiles();
    const modelCollectionNames = new Set(modelCollections.map(c => c.name));
    
    // Analyze and categorize collections
    const emptyCollections = [];
    const unusedCollections = [];
    const usedCollections = [];
    const systemCollections = [];
    
    for (const collection of collections) {
      const name = collection.name;
      const documentCount = documentCounts[name];
      const references = collectionRefs[name].references;
      const isInModel = modelCollectionNames.has(name);
      
      // Skip system collections
      if (name.startsWith('system.')) {
        systemCollections.push({
          name,
          documentCount,
          references,
          isInModel
        });
        continue;
      }
      
      // Categories: 
      // 1. Empty collections (no documents)
      // 2. Unused collections (not in models, no code references)
      // 3. Used collections
      if (documentCount === 0) {
        emptyCollections.push({
          name,
          references,
          isInModel
        });
      } else if (references === 0 && !isInModel) {
        unusedCollections.push({
          name,
          documentCount,
          isInModel
        });
      } else {
        usedCollections.push({
          name,
          documentCount,
          references,
          isInModel
        });
      }
    }
    
    // Print results
    console.log('=== COLLECTION ANALYSIS ===\n');
    
    console.log('EMPTY COLLECTIONS:');
    if (emptyCollections.length === 0) {
      console.log('None');
    } else {
      for (const collection of emptyCollections) {
        console.log(`- ${collection.name} (Code refs: ${collection.references}, In model: ${collection.isInModel ? 'Yes' : 'No'})`);
      }
    }
    
    console.log('\nUNUSED COLLECTIONS (have data but no code references):');
    if (unusedCollections.length === 0) {
      console.log('None');
    } else {
      for (const collection of unusedCollections) {
        console.log(`- ${collection.name} (Documents: ${collection.documentCount}, In model: ${collection.isInModel ? 'Yes' : 'No'})`);
      }
    }
    
    console.log('\nUSED COLLECTIONS:');
    for (const collection of usedCollections) {
      console.log(`- ${collection.name} (Documents: ${collection.documentCount}, Code refs: ${collection.references}, In model: ${collection.isInModel ? 'Yes' : 'No'})`);
    }
    
    console.log('\nSYSTEM COLLECTIONS:');
    for (const collection of systemCollections) {
      console.log(`- ${collection.name} (Documents: ${collection.documentCount})`);
    }
    
    // Return collections for potential deletion
    return {
      emptyCollections,
      unusedCollections
    };
  } catch (error) {
    console.error('Error identifying unused collections:', error);
    return {
      emptyCollections: [],
      unusedCollections: []
    };
  }
}

// Function to create a cleanup script
async function createCleanupScript(result) {
  const { emptyCollections, unusedCollections } = result;
  
  // Create a list of collections to potentially delete
  const collectionsToDelete = [
    ...emptyCollections.filter(c => !c.isInModel && c.references === 0),
    ...unusedCollections.filter(c => !c.isInModel)
  ];
  
  if (collectionsToDelete.length === 0) {
    console.log('\nNo collections to delete.');
    return;
  }
  
  // Create a cleanup script
  const scriptPath = path.join(__dirname, 'cleanup-unused-collections.js');
  const scriptContent = `/**
 * This script deletes unused collections identified by the analysis.
 * PLEASE REVIEW CAREFULLY before running!
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sahil:sahil123@skillgenix.4lthw6g.mongodb.net/careerpathAI?retryWrites=true&w=majority';

// Collections to delete - REVIEW BEFORE RUNNING!
const COLLECTIONS_TO_DELETE = [
  ${collectionsToDelete.map(c => `  '${c.name}'`).join(',\n')}
];

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

// Function to delete collections
async function deleteUnusedCollections(db) {
  console.log('\\nDeleting unused collections:');
  
  for (const collectionName of COLLECTIONS_TO_DELETE) {
    try {
      // First check if collection exists
      const collections = await db.db.listCollections({ name: collectionName }).toArray();
      
      if (collections.length > 0) {
        await db.db.collection(collectionName).drop();
        console.log(\`✅ Deleted collection: \${collectionName}\`);
      } else {
        console.log(\`⚠️ Collection \${collectionName} does not exist\`);
      }
    } catch (error) {
      console.error(\`❌ Error deleting collection \${collectionName}: \${error.message}\`);
    }
  }
}

// Main function
async function main() {
  try {
    const db = await connectToMongoDB();
    
    console.log('COLLECTIONS TO DELETE:');
    for (const collection of COLLECTIONS_TO_DELETE) {
      console.log(\`- \${collection}\`);
    }
    
    // Prompt for confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    readline.question('\\nWARNING: This will permanently delete the collections listed above.\\nAre you sure you want to proceed? (yes/no): ', async (answer) => {
      if (answer.toLowerCase() === 'yes') {
        await deleteUnusedCollections(db);
        console.log('\\n✅ Cleanup completed!');
      } else {
        console.log('\\nOperation cancelled. No collections were deleted.');
      }
      
      // Close connections
      readline.close();
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    await mongoose.connection.close();
  }
}

// Run the script
main();
`;

  try {
    await fs.writeFile(scriptPath, scriptContent, 'utf8');
    console.log(`\nCreated cleanup script: ${scriptPath}`);
    console.log('IMPORTANT: Review this script carefully before running!');
    console.log('It will delete the following collections:');
    
    for (const collection of collectionsToDelete) {
      console.log(`- ${collection.name}`);
    }
  } catch (error) {
    console.error('Error creating cleanup script:', error);
  }
}

// Main function
async function main() {
  try {
    // Connect to MongoDB
    const db = await connectToMongoDB();
    
    // Identify unused collections
    console.log('Analyzing database collections...\n');
    const result = await identifyUnusedCollections(db);
    
    // Create a cleanup script
    await createCleanupScript(result);
    
  } catch (error) {
    console.error('Error identifying unused collections:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the script
main();