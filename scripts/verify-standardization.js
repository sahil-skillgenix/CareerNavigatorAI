/**
 * This script verifies that all MongoDB collections follow the standardization rules:
 * 1. All collections have 'skillgenix_' prefix
 * 2. All collection names are lowercase
 * 3. No collections have >49% similarity
 * 4. Checks that all model files reference the correct standardized collection names
 */

const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

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

// Function to check similarity between strings (for collection names)
function calculateSimilarity(str1, str2) {
  // Normalize strings for comparison
  const normalizedStr1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalizedStr2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Simple similarity measure - number of matching characters divided by max length
  let matches = 0;
  const maxLength = Math.max(normalizedStr1.length, normalizedStr2.length);
  
  for (let i = 0; i < Math.min(normalizedStr1.length, normalizedStr2.length); i++) {
    if (normalizedStr1[i] === normalizedStr2[i]) {
      matches++;
    }
  }
  
  return matches / maxLength;
}

// Function to verify standardization
async function verifyStandardization(db) {
  // Get all collections
  const collections = await getAllCollections(db);
  console.log(`Found ${collections.length} collections in the database`);
  
  // Track issues
  const issues = {
    missingPrefix: [],
    uppercase: [],
    similarNames: []
  };
  
  // Get all collection names for similarity check
  const collectionNames = collections.map(c => c.name);
  
  // Check each collection
  for (const collection of collections) {
    const name = collection.name;
    
    // Check prefix
    if (!name.startsWith('skillgenix_')) {
      issues.missingPrefix.push(name);
    }
    
    // Check for uppercase
    if (name !== name.toLowerCase()) {
      issues.uppercase.push(name);
    }
    
    // Check for similarity with other collections
    for (const otherName of collectionNames) {
      if (name === otherName) continue;
      
      const similarity = calculateSimilarity(name, otherName);
      if (similarity > 0.49) {
        issues.similarNames.push({
          name1: name,
          name2: otherName,
          similarity: Math.round(similarity * 100) + '%'
        });
      }
    }
  }
  
  // Report issues
  console.log('\n=== Collection Standardization Verification Results ===');
  
  if (issues.missingPrefix.length > 0) {
    console.log('\nCollections missing "skillgenix_" prefix:');
    issues.missingPrefix.forEach(name => console.log(`- ${name}`));
  } else {
    console.log('\n✓ All collections have "skillgenix_" prefix');
  }
  
  if (issues.uppercase.length > 0) {
    console.log('\nCollections with uppercase characters:');
    issues.uppercase.forEach(name => console.log(`- ${name}`));
  } else {
    console.log('✓ All collections use lowercase naming');
  }
  
  if (issues.similarNames.length > 0) {
    console.log('\nSimilar collection names (>49% similarity):');
    issues.similarNames.forEach(({name1, name2, similarity}) => {
      console.log(`- ${name1} and ${name2} (${similarity} similar)`);
    });
  } else {
    console.log('✓ No collections with >49% similarity');
  }
  
  // Overall assessment
  if (issues.missingPrefix.length === 0 && 
      issues.uppercase.length === 0 && 
      issues.similarNames.length === 0) {
    console.log('\n✓ All collections meet standardization requirements!');
    return true;
  } else {
    console.log('\n✗ Some collections do not meet standardization requirements.');
    return false;
  }
}

// Function to verify model files reference the correct collection names
async function verifyModelFiles(db) {
  // Path to models directory
  const modelsDir = path.join(__dirname, '../server/db/models');
  
  // Get all collections for verification
  const collections = await getAllCollections(db);
  const collectionNames = collections.map(c => c.name);
  
  try {
    // Get all model files
    const files = await fs.readdir(modelsDir);
    console.log(`\nVerifying ${files.length} model files...`);
    
    // Track issues
    const issues = {
      missingCollectionName: [],
      incorrectCollectionName: []
    };
    
    for (const file of files) {
      if (!file.endsWith('.ts')) continue;
      
      const filePath = path.join(modelsDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Check if file specifies a collection name
      const collectionMatch = content.match(/mongoose\.model\([^,]+,[^,]+,\s*["']([^"']+)["']/);
      
      if (collectionMatch) {
        const specifiedCollection = collectionMatch[1];
        
        // Check if specified collection follows standards
        if (!specifiedCollection.startsWith('skillgenix_')) {
          issues.incorrectCollectionName.push({
            file,
            specified: specifiedCollection,
            issue: 'Missing skillgenix_ prefix'
          });
        } else if (specifiedCollection !== specifiedCollection.toLowerCase()) {
          issues.incorrectCollectionName.push({
            file,
            specified: specifiedCollection,
            issue: 'Contains uppercase characters'
          });
        }
        
        // Check if specified collection exists in database
        if (!collectionNames.includes(specifiedCollection)) {
          issues.incorrectCollectionName.push({
            file,
            specified: specifiedCollection,
            issue: 'Collection does not exist in database'
          });
        }
      } else {
        // Check if file uses mongoose.model without specifying collection name
        const modelMatch = content.match(/mongoose\.model\([^,]+,[^,]+\)/);
        if (modelMatch) {
          issues.missingCollectionName.push(file);
        }
      }
    }
    
    // Report issues
    console.log('\n=== Model File Verification Results ===');
    
    if (issues.missingCollectionName.length > 0) {
      console.log('\nModel files missing collection name specification:');
      issues.missingCollectionName.forEach(file => console.log(`- ${file}`));
    } else {
      console.log('\n✓ All model files specify collection names');
    }
    
    if (issues.incorrectCollectionName.length > 0) {
      console.log('\nModel files with incorrect collection names:');
      issues.incorrectCollectionName.forEach(({file, specified, issue}) => {
        console.log(`- ${file}: "${specified}" (${issue})`);
      });
    } else {
      console.log('✓ All specified collection names are correct');
    }
    
    // Overall assessment
    if (issues.missingCollectionName.length === 0 && 
        issues.incorrectCollectionName.length === 0) {
      console.log('\n✓ All model files meet standardization requirements!');
      return true;
    } else {
      console.log('\n✗ Some model files do not meet standardization requirements.');
      return false;
    }
  } catch (error) {
    console.error('Error verifying model files:', error);
    return false;
  }
}

// Main function
async function main() {
  try {
    // Connect to MongoDB
    const db = await connectToMongoDB();
    
    // Verify collection standardization
    const collectionsStandardized = await verifyStandardization(db);
    
    // Verify model files
    const modelsCorrect = await verifyModelFiles(db);
    
    // Overall result
    console.log('\n=== Overall Verification Results ===');
    if (collectionsStandardized && modelsCorrect) {
      console.log('\n✓ SUCCESS: All collections and model files meet standardization requirements!');
    } else {
      console.log('\n✗ ISSUES FOUND: Some collections or model files need standardization.');
    }
  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the script
main();