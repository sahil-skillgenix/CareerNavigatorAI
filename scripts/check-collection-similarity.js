/**
 * This script checks for collection name similarity to ensure all names are unique
 * and have less than 49% similarity with each other.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to check similarity between strings
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

// Function to extract collection names from model files
async function extractCollectionNames() {
  // Path to models directory
  const modelsDir = path.join(__dirname, '../server/db/models');
  
  try {
    // Get all model files
    const files = await fs.readdir(modelsDir);
    console.log(`Found ${files.length} model files`);
    
    const collectionNames = [];
    
    for (const file of files) {
      if (!file.endsWith('.ts')) continue;
      
      const filePath = path.join(modelsDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Extract collection name using different regex patterns
      
      // Pattern 1: mongoose.model(X, Y, "collection_name")
      const collectionMatch1 = content.match(/mongoose\.model\([^,]+,[^,]+,\s*["']([^"']+)["']/);
      
      // Pattern 2: mongoose.model('collection_name', schema)
      const collectionMatch2 = content.match(/mongoose\.model\(["']([^"']+)["'],\s*\w+Schema\)/);
      
      // Pattern 3: mongoose.models.Model || mongoose.model
      const modelRefMatch = content.match(/mongoose\.models\.(\w+)\s*\|\|\s*mongoose\.model/);
      
      if (collectionMatch1) {
        collectionNames.push({
          file,
          collectionName: collectionMatch1[1]
        });
      } else if (collectionMatch2) {
        // If the model uses the name as collection, add 'skillgenix_' prefix for consistency check
        const name = collectionMatch2[1];
        collectionNames.push({
          file,
          collectionName: name.startsWith('skillgenix_') ? name : `skillgenix_${name.toLowerCase()}`
        });
      } else if (modelRefMatch) {
        // For models that use the mongoose.models.X syntax, infer the collection name
        const modelName = modelRefMatch[1];
        collectionNames.push({
          file,
          collectionName: `skillgenix_${modelName.toLowerCase()}`,
          inferred: true
        });
      }
    }
    
    return collectionNames;
  } catch (error) {
    console.error('Error extracting collection names:', error);
    return [];
  }
}

// Function to check collection name similarity
async function checkCollectionNameSimilarity() {
  try {
    // Extract collection names
    const collections = await extractCollectionNames();
    console.log(`Extracted ${collections.length} collection names`);
    
    if (collections.length === 0) {
      console.log('No collection names found to check');
      return;
    }
    
    // Check for similarity issues
    const similarityIssues = [];
    
    for (let i = 0; i < collections.length; i++) {
      const collection1 = collections[i];
      
      // Check for non-standardized prefix
      if (!collection1.collectionName.startsWith('skillgenix_')) {
        console.log(`⚠️ Collection ${collection1.collectionName} in ${collection1.file} does not use the standardized 'skillgenix_' prefix`);
      }
      
      // Check for uppercase
      if (collection1.collectionName !== collection1.collectionName.toLowerCase()) {
        console.log(`⚠️ Collection ${collection1.collectionName} in ${collection1.file} contains uppercase characters`);
      }
      
      // Check for similarity with other collections
      for (let j = i + 1; j < collections.length; j++) {
        const collection2 = collections[j];
        
        const similarity = calculateSimilarity(collection1.collectionName, collection2.collectionName);
        
        if (similarity > 0.49) {
          similarityIssues.push({
            collection1: collection1.collectionName,
            file1: collection1.file,
            collection2: collection2.collectionName,
            file2: collection2.file,
            similarity: Math.round(similarity * 100)
          });
        }
      }
    }
    
    // Report similarity issues
    if (similarityIssues.length > 0) {
      console.log('\n⚠️ Found collection name similarity issues:');
      
      for (const issue of similarityIssues) {
        console.log(`- ${issue.collection1} (${issue.file1}) and ${issue.collection2} (${issue.file2}) are ${issue.similarity}% similar`);
      }
    } else {
      console.log('\n✅ No collection name similarity issues found');
    }
    
    // Print all collection names for reference
    console.log('\nCurrent collection names:');
    collections.forEach(c => {
      console.log(`- ${c.collectionName} (${c.file})`);
    });
    
  } catch (error) {
    console.error('Error checking collection name similarity:', error);
  }
}

// Run the check
checkCollectionNameSimilarity();