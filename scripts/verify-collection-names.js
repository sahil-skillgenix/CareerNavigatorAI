/**
 * This script verifies the collection naming strategy is working
 * and all collections are properly renamed.
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

// Domain prefixes we expect to see
const VALID_PREFIXES = [
  'userx_',
  'rolex_',
  'skillx_',
  'indx_',
  'systemx_',
  'careerx_',
  'apix_',
  'learnx_'
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

// Function to get all collections
async function getAllCollections(db) {
  try {
    return await db.db.listCollections().toArray();
  } catch (error) {
    console.error('Error getting collections:', error);
    return [];
  }
}

// Function to calculate similarity between two strings
function calculateSimilarity(str1, str2) {
  // Convert to lowercase for case-insensitive comparison
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Matrix for Levenshtein distance calculation
  const matrix = [];
  
  // Initialize matrix
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill matrix
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  // Calculate similarity score (1 - normalized distance)
  const maxLength = Math.max(s1.length, s2.length);
  const distance = matrix[s1.length][s2.length];
  
  if (maxLength === 0) {
    return 1; // Both strings are empty, so they're identical
  }
  
  return 1 - (distance / maxLength);
}

// Function to verify collection names
async function verifyCollectionNames(db) {
  try {
    // Get all existing collections
    const collections = await getAllCollections(db);
    console.log(`Found ${collections.length} collections in the database`);
    
    let validPrefixCount = 0;
    let invalidPrefixCount = 0;
    const systemCollections = [];
    const similarCollections = [];
    
    // Check each collection
    for (const collection of collections) {
      const name = collection.name;
      
      // Skip system collections
      if (name.startsWith('system.')) {
        systemCollections.push(name);
        continue;
      }
      
      // Check for valid prefix
      const hasValidPrefix = VALID_PREFIXES.some(prefix => name.startsWith(prefix));
      
      if (hasValidPrefix) {
        validPrefixCount++;
        console.log(`✅ Collection ${name} has a valid domain-specific prefix`);
      } else {
        invalidPrefixCount++;
        console.log(`⚠️ Collection ${name} does not have a valid domain-specific prefix`);
      }
      
      // Check for similarity with other collections
      for (const otherCollection of collections) {
        const otherName = otherCollection.name;
        
        if (name !== otherName && !otherName.startsWith('system.')) {
          const similarity = calculateSimilarity(name, otherName);
          
          if (similarity > 0.49) {
            similarCollections.push({
              collection1: name,
              collection2: otherName,
              similarity: Math.round(similarity * 100)
            });
          }
        }
      }
    }
    
    // Report stats
    console.log(`\nCollection Status:`);
    console.log(`- Total collections: ${collections.length - systemCollections.length} (excluding ${systemCollections.length} system collections)`);
    console.log(`- Collections with valid domain-specific prefix: ${validPrefixCount}`);
    console.log(`- Collections without valid domain-specific prefix: ${invalidPrefixCount}`);
    
    // Report similarity issues (uniquify the pairs)
    if (similarCollections.length > 0) {
      // Remove duplicate pairs (A-B and B-A are the same pair)
      const uniquePairs = new Set();
      const uniqueSimilarCollections = [];
      
      for (const pair of similarCollections) {
        const sortedPair = [pair.collection1, pair.collection2].sort().join('|');
        
        if (!uniquePairs.has(sortedPair)) {
          uniquePairs.add(sortedPair);
          uniqueSimilarCollections.push(pair);
        }
      }
      
      console.log(`\n⚠️ Found ${uniqueSimilarCollections.length} collection name similarity issues:`);
      
      for (const pair of uniqueSimilarCollections) {
        console.log(`- ${pair.collection1} and ${pair.collection2} are ${pair.similarity}% similar`);
      }
    } else {
      console.log(`\n✅ No collection name similarity issues found`);
    }
    
    return {
      validPrefixCount,
      invalidPrefixCount,
      similarCollections
    };
  } catch (error) {
    console.error('Error verifying collection names:', error);
    return {
      validPrefixCount: 0,
      invalidPrefixCount: 0,
      similarCollections: []
    };
  }
}

// Function to verify model files
async function verifyModelFiles() {
  // Path to models directory
  const modelsDir = path.join(__dirname, '../server/db/models');
  
  try {
    // Get all model files
    const files = await fs.readdir(modelsDir);
    console.log(`\nChecking ${files.length} model files for valid collection names:`);
    
    let validModels = 0;
    let invalidModels = 0;
    
    for (const file of files) {
      if (!file.endsWith('.ts')) continue;
      
      const filePath = path.join(modelsDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Look for collection name in mongoose.model(..., ..., "collection_name")
      const collectionMatch = content.match(/mongoose\.model\([^,]+,[^,]+,\s*["']([^"']+)["']/);
      
      if (collectionMatch) {
        const collectionName = collectionMatch[1];
        const hasValidPrefix = VALID_PREFIXES.some(prefix => collectionName.startsWith(prefix));
        
        if (hasValidPrefix) {
          validModels++;
          console.log(`✅ Model ${file} uses valid collection name: ${collectionName}`);
        } else {
          invalidModels++;
          console.log(`⚠️ Model ${file} uses invalid collection name: ${collectionName}`);
        }
      } else {
        console.log(`⚠️ Could not determine collection name for model: ${file}`);
      }
    }
    
    console.log(`\nModel File Status:`);
    console.log(`- Models with valid collection names: ${validModels}`);
    console.log(`- Models with invalid collection names: ${invalidModels}`);
    
    return {
      validModels,
      invalidModels
    };
  } catch (error) {
    console.error('Error verifying model files:', error);
    return {
      validModels: 0,
      invalidModels: 0
    };
  }
}

// Main function
async function main() {
  try {
    // Connect to MongoDB
    const db = await connectToMongoDB();
    
    // Verify collection names in database
    console.log('Verifying database collection names...');
    const dbVerification = await verifyCollectionNames(db);
    
    // Verify model files
    console.log('\nVerifying model files...');
    const modelVerification = await verifyModelFiles();
    
    // Final summary
    console.log('\n=== FINAL VERIFICATION SUMMARY ===');
    
    if (dbVerification.invalidPrefixCount === 0 && dbVerification.similarCollections.length === 0) {
      console.log('✅ DATABASE COLLECTIONS: All collections have valid prefixes and no similarity issues');
    } else {
      console.log('⚠️ DATABASE COLLECTIONS: Issues found');
      console.log(`   - ${dbVerification.invalidPrefixCount} collections without valid prefix`);
      console.log(`   - ${dbVerification.similarCollections.length} collections with similarity issues`);
    }
    
    if (modelVerification.invalidModels === 0) {
      console.log('✅ MODEL FILES: All model files reference valid collection names');
    } else {
      console.log('⚠️ MODEL FILES: Issues found');
      console.log(`   - ${modelVerification.invalidModels} model files with invalid collection names`);
    }
    
    // Overall status
    if (dbVerification.invalidPrefixCount === 0 && 
        dbVerification.similarCollections.length === 0 && 
        modelVerification.invalidModels === 0) {
      console.log('\n🎉 VERIFICATION PASSED: All collections and models are properly standardized!');
    } else {
      console.log('\n⚠️ VERIFICATION FAILED: Some issues need to be addressed');
    }
    
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
main();