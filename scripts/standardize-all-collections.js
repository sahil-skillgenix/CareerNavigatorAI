/**
 * This script standardizes all MongoDB collection names to use the 'skillgenix_' prefix
 * and removes duplicate collections based on a similarity check.
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function connectToMongoDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully!');
    return mongoose.connection.db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Simplified string similarity check (Levenshtein distance ratio)
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const longerStr = str1.length > str2.length ? str1 : str2;
  const shorterStr = str1.length > str2.length ? str2 : str1;
  
  if (longerStr.length === 0) return 1.0;
  
  // Levenshtein distance implementation
  const matrix = Array(shorterStr.length + 1).fill().map(() => Array(longerStr.length + 1).fill(0));
  
  for (let i = 0; i <= shorterStr.length; i++) {
    matrix[i][0] = i;
  }
  
  for (let j = 0; j <= longerStr.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= shorterStr.length; i++) {
    for (let j = 1; j <= longerStr.length; j++) {
      const cost = shorterStr[i - 1] === longerStr[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  // Calculate similarity ratio (0-1)
  return 1 - (matrix[shorterStr.length][longerStr.length] / Math.max(shorterStr.length, longerStr.length));
}

// Get standard name for a collection
function getStandardizedName(collectionName) {
  // Remove plural forms
  let standardName = collectionName
    .replace(/s$/, '')
    .replace(/es$/, '')
    .replace(/ies$/, 'y')
    .toLowerCase();
  
  // Remove common prefixes if they exist
  ['temp_', 'tmp_', 'old_', 'new_', 'test_', 'bak_'].forEach(prefix => {
    if (standardName.startsWith(prefix)) {
      standardName = standardName.slice(prefix.length);
    }
  });
  
  // Ensure camelCase
  standardName = standardName
    .replace(/_([a-z])/g, (_, char) => char.toUpperCase())
    .replace(/-([a-z])/g, (_, char) => char.toUpperCase());
  
  // Add standard prefix
  return `skillgenix_${standardName}`;
}

async function standardizeCollections() {
  try {
    const db = await connectToMongoDB();
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log(`Found ${collectionNames.length} collections in database.`);
    
    // Group potentially duplicate collections
    const similarityGroups = {};
    const processedCollections = new Set();
    
    // First group collections that are likely duplicates (similarity > 0.5)
    for (let i = 0; i < collectionNames.length; i++) {
      const name1 = collectionNames[i];
      
      if (processedCollections.has(name1)) continue;
      
      similarityGroups[name1] = [name1];
      processedCollections.add(name1);
      
      for (let j = i + 1; j < collectionNames.length; j++) {
        const name2 = collectionNames[j];
        
        if (processedCollections.has(name2)) continue;
        
        const similarity = calculateSimilarity(name1, name2);
        
        if (similarity > 0.5) {
          similarityGroups[name1].push(name2);
          processedCollections.add(name2);
        }
      }
    }
    
    // Process each group to standardize naming and remove duplicates
    for (const [primary, group] of Object.entries(similarityGroups)) {
      if (group.length === 1) {
        // Not a duplicate, just standardize the name if needed
        const standardName = getStandardizedName(primary);
        
        if (standardName !== primary && !collectionNames.includes(standardName)) {
          console.log(`Renaming single collection: ${primary} -> ${standardName}`);
          try {
            await db.collection(primary).rename(standardName, { dropTarget: false });
          } catch (error) {
            console.error(`Error renaming ${primary}:`, error.message);
          }
        }
        continue;
      }
      
      // Group has potential duplicates
      console.log(`Found potential duplicate group with ${group.length} collections:`, group);
      
      // Determine which collection in the group has the most documents
      let maxDocuments = -1;
      let primaryCollection = primary;
      
      for (const collName of group) {
        const count = await db.collection(collName).countDocuments();
        console.log(`Collection ${collName} has ${count} documents`);
        if (count > maxDocuments) {
          maxDocuments = count;
          primaryCollection = collName;
        }
      }
      
      // Standardize the name of the primary collection
      const standardName = getStandardizedName(primaryCollection);
      
      // Rename the primary collection if needed
      if (standardName !== primaryCollection && !collectionNames.includes(standardName)) {
        console.log(`Renaming primary collection: ${primaryCollection} -> ${standardName}`);
        try {
          await db.collection(primaryCollection).rename(standardName, { dropTarget: false });
        } catch (error) {
          console.error(`Error renaming ${primaryCollection}:`, error.message);
          continue;
        }
      }
      
      // Remove duplicate collections
      for (const collName of group) {
        if (collName !== primaryCollection) {
          console.log(`Dropping duplicate collection: ${collName} (keeping ${standardName})`);
          try {
            await db.collection(collName).drop();
          } catch (error) {
            console.error(`Error dropping ${collName}:`, error.message);
          }
        }
      }
    }
    
    // Log final results
    const updatedCollections = await db.listCollections().toArray();
    console.log(`Standardization complete. Database now has ${updatedCollections.length} collections.`);
    console.log('Collections after standardization:');
    updatedCollections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
  } catch (error) {
    console.error('Error standardizing collections:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

async function main() {
  try {
    await standardizeCollections();
    process.exit(0);
  } catch (error) {
    console.error('Error in main execution:', error);
    process.exit(1);
  }
}

main();