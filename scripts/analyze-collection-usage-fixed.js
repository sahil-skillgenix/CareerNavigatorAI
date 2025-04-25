/**
 * This script analyzes collection usage in the codebase without requiring database connection.
 * It extracts collection names from model files and checks for references in the codebase.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Function to extract collection names from model files
async function extractCollectionNames() {
  try {
    // Get all model files
    const modelsDir = path.join(rootDir, 'server/db/models');
    let files;
    
    try {
      files = await fs.readdir(modelsDir);
    } catch (error) {
      console.error(`Error reading models directory: ${error.message}`);
      // Try alternative path
      const altModelsDir = path.join(rootDir, 'server/models');
      try {
        files = await fs.readdir(altModelsDir);
        console.log(`Using alternative models directory: ${altModelsDir}`);
      } catch (altError) {
        console.error(`Error reading alternative models directory: ${altError.message}`);
        return [];
      }
    }
    
    console.log(`Found ${files.length} potential model files`);
    
    const collectionNames = [];
    const modelFiles = files.filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    
    for (const file of modelFiles) {
      try {
        const filePath = path.join(modelsDir, file);
        let content;
        
        try {
          content = await fs.readFile(filePath, 'utf8');
        } catch (error) {
          console.error(`Error reading file ${filePath}: ${error.message}`);
          continue;
        }
        
        // Extract collection names from mongoose.model calls
        // Pattern 1: mongoose.model(X, Y, "collection_name")
        const pattern1 = /mongoose\.model\([^,]+,[^,]+,\s*["']([^"']+)["']/g;
        let match1;
        while ((match1 = pattern1.exec(content)) !== null) {
          try {
            if (match1[1]) {
              collectionNames.push({
                file,
                collectionName: match1[1],
                pattern: 'explicit'
              });
            }
          } catch (err) {
            console.log(`Error parsing explicit collection in ${file}`);
          }
        }
        
        // Pattern 2: mongoose.model("ModelName", schema)
        const pattern2 = /mongoose\.model\(["']([^"']+)["'],\s*\w+Schema\)/g;
        let match2;
        while ((match2 = pattern2.exec(content)) !== null) {
          try {
            const modelName = match2[1];
            if (modelName) {
              // When the collection name is not explicit, MongoDB uses the model name
              const inferredName = modelName.toLowerCase() + 's';
              const standardizedName = `skillgenix_${modelName.toLowerCase()}`;
              
              collectionNames.push({
                file,
                collectionName: inferredName,
                pattern: 'inferred_plural'
              });
              
              collectionNames.push({
                file,
                collectionName: standardizedName,
                pattern: 'inferred_skillgenix'
              });
              
              // Add new domain-specific prefix options
              const domainPrefixes = ['userx_', 'rolex_', 'skillx_', 'indx_', 'systemx_', 'careerx_', 'apix_', 'learnx_'];
              for (const prefix of domainPrefixes) {
                collectionNames.push({
                  file,
                  collectionName: `${prefix}${modelName.toLowerCase()}`,
                  pattern: 'inferred_domainx'
                });
              }
            }
          } catch (err) {
            console.log(`Error parsing model name in ${file}`);
          }
        }
      } catch (error) {
        console.error(`Error processing file ${file}:`, error.message);
      }
    }
    
    return collectionNames;
  } catch (error) {
    console.error('Error extracting collection names:', error);
    return [];
  }
}

// Function to find code references to collections
function findCodeReferences(collectionNames) {
  const references = {};
  
  // Initialize reference count for each collection
  collectionNames.forEach(c => {
    references[c.collectionName] = {
      count: 0,
      files: [],
      modelFile: c.file,
      pattern: c.pattern
    };
  });
  
  // Search for references to each collection
  for (const collection of collectionNames) {
    const name = collection.collectionName;
    
    try {
      const output = execSync(`grep -r --include="*.ts" --include="*.js" "${name}" ${rootDir}/server ${rootDir}/shared || true`, { encoding: 'utf8' });
      
      if (output.trim()) {
        const lines = output.trim().split('\n');
        references[name].count = lines.length;
        references[name].files = lines.map(line => line.split(':')[0]);
      }
    } catch (error) {
      console.error(`Error searching for references to ${name}:`, error.message);
    }
  }
  
  return references;
}

// Function to sort and categorize collections
function categorizeCollections(references) {
  const explicitCollections = [];
  const inferredCollections = [];
  const unusedCollections = [];
  
  for (const [name, data] of Object.entries(references)) {
    const { count, files, modelFile, pattern } = data;
    
    if (count === 0) {
      unusedCollections.push({ name, modelFile, pattern });
    } else if (pattern === 'explicit') {
      explicitCollections.push({ name, count, files, modelFile });
    } else {
      inferredCollections.push({ name, count, files, modelFile, pattern });
    }
  }
  
  return { explicitCollections, inferredCollections, unusedCollections };
}

// Main function
async function main() {
  try {
    console.log('Extracting collection names from model files...');
    const collectionNames = await extractCollectionNames();
    
    if (collectionNames.length === 0) {
      console.error('No collection names found. Check the model files path.');
      return;
    }
    
    console.log(`Found ${collectionNames.length} collection names (explicit and inferred)`);
    
    console.log('\nSearching for code references...');
    const references = findCodeReferences(collectionNames);
    
    console.log('\nCategorizing collections...');
    const { explicitCollections, inferredCollections, unusedCollections } = categorizeCollections(references);
    
    // Display results
    console.log('\n=== COLLECTION ANALYSIS ===\n');
    
    console.log('EXPLICIT COLLECTIONS:');
    explicitCollections.sort((a, b) => b.count - a.count);
    explicitCollections.forEach(c => {
      console.log(`- ${c.name} (${c.count} references, defined in ${c.modelFile})`);
    });
    
    console.log('\nINFERRED COLLECTIONS WITH REFERENCES:');
    inferredCollections.sort((a, b) => b.count - a.count);
    inferredCollections.forEach(c => {
      console.log(`- ${c.name} (${c.count} references, pattern: ${c.pattern}, from ${c.modelFile})`);
    });
    
    console.log('\nPOTENTIALLY UNUSED COLLECTIONS:');
    if (unusedCollections.length === 0) {
      console.log('None - all collections appear to be referenced in the code');
    } else {
      unusedCollections.forEach(c => {
        console.log(`- ${c.name} (pattern: ${c.pattern}, from ${c.modelFile})`);
      });
    }
    
    // Generate recommendations
    console.log('\n=== RECOMMENDATIONS ===\n');
    
    // Recommend explicit collection names to standardize
    const nonStandardExplicit = explicitCollections.filter(c => 
      !c.name.startsWith('skillgenix_') && 
      !['userx_', 'rolex_', 'skillx_', 'indx_', 'systemx_', 'careerx_', 'apix_', 'learnx_'].some(prefix => c.name.startsWith(prefix))
    );
    
    if (nonStandardExplicit.length > 0) {
      console.log('COLLECTIONS TO STANDARDIZE:');
      nonStandardExplicit.forEach(c => {
        console.log(`- ${c.name} in ${c.modelFile} should be renamed to use a domain-specific prefix`);
      });
    }
    
    // Recommend collections to remove
    const unusedExplicit = unusedCollections.filter(c => c.pattern === 'explicit');
    if (unusedExplicit.length > 0) {
      console.log('\nCOLLECTIONS TO CONSIDER REMOVING:');
      unusedExplicit.forEach(c => {
        console.log(`- ${c.name} defined in ${c.modelFile} has no code references`);
      });
    }
    
    // Generate cleanup script
    if (unusedExplicit.length > 0) {
      const cleanupScript = `/**
 * Script to remove unused collection definitions
 * IMPORTANT: Review carefully before running!
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Collections identified as unused
const UNUSED_COLLECTIONS = [
${unusedExplicit.map(c => `  '${c.name}', // from ${c.modelFile}`).join('\n')}
];

async function dropUnusedCollections() {
  // This function uses MongoDB connection to drop collections
  // You'll need to add your connection code here
  
  console.log('Would drop these collections:');
  UNUSED_COLLECTIONS.forEach(name => console.log(\`- \${name}\`));
  
  // Uncomment this code when ready to execute
  /*
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    
    for (const collectionName of UNUSED_COLLECTIONS) {
      try {
        await mongoose.connection.db.dropCollection(collectionName);
        console.log(\`Dropped collection: \${collectionName}\`);
      } catch (error) {
        console.error(\`Error dropping \${collectionName}: \${error.message}\`);
      }
    }
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await mongoose.disconnect();
  }
  */
}

dropUnusedCollections();
`;
      
      await fs.writeFile(path.join(__dirname, 'remove-unused-collections.js'), cleanupScript);
      console.log('\nCreated remove-unused-collections.js script for removing unused collections');
      console.log('IMPORTANT: Review the script carefully before running!');
    }
    
  } catch (error) {
    console.error('Error analyzing collection usage:', error);
  }
}

// Run the script
main();