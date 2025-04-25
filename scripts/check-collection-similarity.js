/**
 * This script checks for collection name similarity to ensure all names are unique
 * and have less than 49% similarity with each other.
 */

import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';
dotenv.config();

// MongoDB URI - get from environment
const MONGODB_URI = process.env.DATABASE_URL || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('ERROR: No MongoDB URI provided. Set DATABASE_URL environment variable.');
  process.exit(1);
}

// Calculate Levenshtein distance between two strings
function calculateSimilarity(str1, str2) {
  // Convert both strings to lowercase 
  const a = str1.toLowerCase();
  const b = str2.toLowerCase();
  
  // Create matrix
  const matrix = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill(0));
  
  // Fill first row and column with incrementing values
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  
  // Fill the matrix
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  // Calculate max possible distance and current distance
  const maxDistance = Math.max(a.length, b.length);
  const distance = matrix[a.length][b.length];
  
  // Calculate similarity percentage (0-100%)
  const similarity = ((maxDistance - distance) / maxDistance) * 100;
  
  return similarity;
}

// Extract collection names from database
async function extractCollectionNames() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    
    // Get only non-system collections
    const collectionNames = collections
      .map(c => c.name)
      .filter(name => !name.startsWith('system.'));
    
    return collectionNames;
  } catch (error) {
    console.error('Error extracting collection names:', error);
    return [];
  } finally {
    await client.close();
  }
}

// Check collection name similarity
async function checkCollectionNameSimilarity() {
  try {
    console.log('Checking collection name similarity...');
    const collectionNames = await extractCollectionNames();
    
    if (collectionNames.length === 0) {
      console.log('No collections found in the database.');
      return;
    }
    
    console.log(`Found ${collectionNames.length} collections`);
    
    // Store pairs with similarity >= 49%
    const similarPairs = [];
    
    // Check each pair of collection names
    for (let i = 0; i < collectionNames.length; i++) {
      for (let j = i + 1; j < collectionNames.length; j++) {
        const name1 = collectionNames[i];
        const name2 = collectionNames[j];
        
        const similarity = calculateSimilarity(name1, name2);
        
        if (similarity >= 49) {
          similarPairs.push({
            name1,
            name2,
            similarity: similarity.toFixed(2)
          });
        }
      }
    }
    
    // Sort similar pairs by similarity (highest first)
    similarPairs.sort((a, b) => b.similarity - a.similarity);
    
    // Print results
    console.log('\n=== COLLECTION NAME SIMILARITY ANALYSIS ===\n');
    
    if (similarPairs.length === 0) {
      console.log('No collection names with ≥49% similarity found. Good job!');
    } else {
      console.log(`Found ${similarPairs.length} collection name pairs with ≥49% similarity:`);
      
      similarPairs.forEach(pair => {
        console.log(`- ${pair.name1} and ${pair.name2} = ${pair.similarity}% similar`);
      });
      
      console.log('\n=== RECOMMENDATIONS ===');
      console.log('Consider renaming these collections to ensure distinct names:');
      
      const recommendedPrefixes = ['userx_', 'rolex_', 'skillx_', 'indx_', 'systemx_', 'careerx_', 'apix_', 'learnx_'];
      
      similarPairs.forEach(pair => {
        console.log(`\n${pair.name1} and ${pair.name2} (${pair.similarity}% similar):`);
        
        // Suggest renaming based on collection content/purpose
        for (const name of [pair.name1, pair.name2]) {
          let suggestedPrefix = '';
          
          if (name.includes('user') || name.includes('profile')) {
            suggestedPrefix = 'userx_';
          } else if (name.includes('role')) {
            suggestedPrefix = 'rolex_';
          } else if (name.includes('skill')) {
            suggestedPrefix = 'skillx_';
          } else if (name.includes('industr')) {
            suggestedPrefix = 'indx_';
          } else if (name.includes('system') || name.includes('error') || name.includes('limit')) {
            suggestedPrefix = 'systemx_';
          } else if (name.includes('career') || name.includes('pathway')) {
            suggestedPrefix = 'careerx_';
          } else if (name.includes('api') || name.includes('request')) {
            suggestedPrefix = 'apix_';
          } else if (name.includes('learn') || name.includes('resource')) {
            suggestedPrefix = 'learnx_';
          }
          
          if (suggestedPrefix && !name.startsWith(suggestedPrefix)) {
            const baseName = name.replace(/^(userx_|rolex_|skillx_|indx_|systemx_|careerx_|apix_|learnx_|skillgenix_)/, '');
            console.log(`  - Rename ${name} to ${suggestedPrefix}${baseName}`);
          }
        }
      });
      
      // Create general naming guidelines
      console.log('\n=== NAMING GUIDELINES ===');
      console.log('To prevent similar collection names, follow these rules:');
      console.log('1. Use domain-specific prefixes for all collections:');
      recommendedPrefixes.forEach(prefix => {
        console.log(`   - ${prefix} for ${prefix.replace('x_', '')} related collections`);
      });
      console.log('2. Use descriptive, specific names for the collection purpose');
      console.log('3. Avoid pluralization variations (e.g., "logs" vs "log")');
      console.log('4. Use consistent casing (all lowercase recommended)');
      console.log('5. Run this similarity check before creating new collections');
    }
    
  } catch (error) {
    console.error('Error checking collection name similarity:', error);
  }
}

// Run the script
checkCollectionNameSimilarity();