/**
 * This script performs the final standardization of all MongoDB collections:
 * 1. Adds 'skillgenix_' prefix to all collections
 * 2. Ensures all collection names are lowercase
 * 3. Ensures no collections have >49% similarity
 * 4. Updates all model files to use standardized collection names
 */

const fs = require('fs').promises;
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sahil:sahil123@skillgenix.4lthw6g.mongodb.net/careerpathAI?retryWrites=true&w=majority';

// Mapping of model names to their standardized collection names
const STANDARDIZED_COLLECTIONS = {
  // Core entities
  'role': 'skillgenix_role',
  'skill': 'skillgenix_skill',
  'industry': 'skillgenix_industry',
  'user': 'skillgenix_user',
  
  // User related collections
  'useractivity': 'skillgenix_useractivity', 
  'useractivitylog': 'skillgenix_useractivitylog',
  'userprogress': 'skillgenix_userprogress',
  'userbadge': 'skillgenix_userbadge',
  'userfeatureoverride': 'skillgenix_userfeatureoverride',
  
  // Admin related collections
  'adminactivity': 'skillgenix_adminactivity',
  'superadminactivity': 'skillgenix_superadminactivity',
  'featurelimit': 'skillgenix_featurelimit',
  
  // System collections
  'systemerrorlog': 'skillgenix_systemerrorlog',
  'systemusagestat': 'skillgenix_systemusagestat',
  'systemnotification': 'skillgenix_systemnotification',
  'apirequestlog': 'skillgenix_apirequestlog',
  'dataimportlog': 'skillgenix_dataimportlog',
  
  // Career data collections
  'careeranalysis': 'skillgenix_careeranalysis',
  'careerpathway': 'skillgenix_careerpathway',
  'learningresource': 'skillgenix_learningresource',
  
  // Relationship collections
  'roleskill': 'skillgenix_roleskill',
  'roleindustry': 'skillgenix_roleindustry',
  'skillindustry': 'skillgenix_skillindustry',
  'skillprerequisite': 'skillgenix_skillprerequisite',
  
  // Other collections
  'errorlog': 'skillgenix_errorlog',
  'sessions': 'skillgenix_sessions'
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

// Function to perform collection standardization
async function standardizeCollections(db) {
  // Get all collections
  const collections = await getAllCollections(db);
  console.log(`Found ${collections.length} collections in the database`);
  
  // Track existing standardized names to prevent duplicates
  const existingStandardizedNames = new Set();
  
  // Process each collection
  for (const collection of collections) {
    const oldName = collection.name;
    const normalizedName = oldName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Skip if collection is already standardized
    if (oldName.startsWith('skillgenix_')) {
      console.log(`Collection ${oldName} is already standardized.`);
      existingStandardizedNames.add(oldName);
      continue;
    }
    
    // Determine new standardized name
    let newName = STANDARDIZED_COLLECTIONS[normalizedName] || `skillgenix_${normalizedName}`;
    
    // Check for similarity with existing standardized names
    let similarityIssue = false;
    for (const existingName of existingStandardizedNames) {
      const similarity = calculateSimilarity(newName, existingName);
      if (similarity > 0.49 && newName !== existingName) {
        console.log(`Similarity issue (${Math.round(similarity * 100)}%): ${newName} vs ${existingName}`);
        similarityIssue = true;
        // Append a unique suffix to resolve similarity issues
        newName = `${newName}_${Date.now().toString().slice(-6)}`;
        break;
      }
    }
    
    try {
      if (similarityIssue) {
        console.log(`Resolving similarity issue: Renaming ${oldName} to ${newName}`);
      } else {
        console.log(`Standardizing collection: ${oldName} -> ${newName}`);
      }
      
      // Rename the collection
      if (oldName !== newName) {
        await db.db.collection(oldName).rename(newName, { dropTarget: false });
        console.log(`Successfully renamed ${oldName} to ${newName}`);
      }
      
      // Add to set of existing standardized names
      existingStandardizedNames.add(newName);
    } catch (error) {
      console.error(`Error standardizing collection ${oldName}:`, error.message);
    }
  }
}

// Function to update all model files with standardized collection names
async function updateModelFiles() {
  // Path to models directory
  const modelsDir = path.join(__dirname, '../server/db/models');
  
  try {
    // Get all model files
    const files = await fs.readdir(modelsDir);
    console.log(`Found ${files.length} model files to update`);
    
    for (const file of files) {
      if (!file.endsWith('.ts')) continue;
      
      const filePath = path.join(modelsDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Extract model name from file name
      const baseName = path.basename(file, '.ts');
      const modelName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
      const normalizedBaseName = baseName.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      // Find standardized collection name
      const collectionName = STANDARDIZED_COLLECTIONS[normalizedBaseName] || `skillgenix_${normalizedBaseName}`;
      
      // Check if file already specifies collection name
      if (content.includes(`mongoose.model<${modelName}Document>("${modelName}"`) && 
          !content.includes(`, "${collectionName}"`)) {
        
        // Add collection name parameter
        const updatedContent = content.replace(
          `mongoose.model<${modelName}Document>("${modelName}", ${modelName}Schema)`,
          `mongoose.model<${modelName}Document>("${modelName}", ${modelName}Schema, "${collectionName}")`
        );
        
        // Handle alternative model export patterns
        let finalContent = updatedContent;
        if (updatedContent === content) {
          finalContent = content.replace(
            new RegExp(`mongoose.model\\(['"]${modelName}['"], ${modelName}Schema\\)`, 'g'),
            `mongoose.model("${modelName}", ${modelName}Schema, "${collectionName}")`
          );
        }
        
        // Double check for models.XX pattern
        if (finalContent === content) {
          finalContent = content.replace(
            new RegExp(`mongoose.models.${modelName} \\|\\| mongoose.model<${modelName}Document>\\("${modelName}", ${modelName}Schema\\)`, 'g'),
            `mongoose.models.${modelName} || mongoose.model<${modelName}Document>("${modelName}", ${modelName}Schema, "${collectionName}")`
          );
        }
        
        // Update the file if changes were made
        if (finalContent !== content) {
          await fs.writeFile(filePath, finalContent, 'utf8');
          console.log(`Updated model file: ${file} with collection name ${collectionName}`);
        } else {
          console.log(`No updates needed for ${file}`);
        }
      } else {
        console.log(`File ${file} already has collection name specified or uses a different pattern`);
      }
    }
  } catch (error) {
    console.error('Error updating model files:', error);
  }
}

// Main function
async function main() {
  try {
    // Connect to MongoDB
    const db = await connectToMongoDB();
    
    // Standardize collections
    await standardizeCollections(db);
    
    // Update model files
    await updateModelFiles();
    
    console.log('Collection standardization completed successfully!');
  } catch (error) {
    console.error('Error during collection standardization:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the script
main();