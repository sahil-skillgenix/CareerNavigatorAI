/**
 * This script updates all mongoose model exports to use standardized collection names
 * with the 'skillgenix_' prefix to match the standardized database structure.
 */

const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// Map of model names to their standardized collection names
const MODEL_TO_COLLECTION_MAP = {
  'UserModel': 'skillgenix_user',
  'UserActivityModel': 'skillgenix_userActivity',
  'UserActivityLogModel': 'skillgenix_userActivityLog',
  'SystemErrorLogModel': 'skillgenix_systemErrorLog',
  'FeatureLimitsModel': 'skillgenix_featureLimits',
  'SkillModel': 'skillgenix_skill',
  'RoleModel': 'skillgenix_role',
  'IndustryModel': 'skillgenix_industry',
  'CareerPathwayModel': 'skillgenix_careerPathway',
  'LearningResourceModel': 'skillgenix_learningResource',
  'UserAnalysisModel': 'skillgenix_userAnalysis',
  // Add more models as needed
};

async function findModelFiles(dir) {
  const modelFiles = [];
  
  async function walkDir(currentDir) {
    const files = await fs.readdir(currentDir);
    
    for (const file of files) {
      const filePath = path.join(currentDir, file);
      const stat = await fs.stat(filePath);
      
      if (stat.isDirectory()) {
        await walkDir(filePath);
      } else if (
        (file.endsWith('.js') || file.endsWith('.ts')) && 
        !file.includes('node_modules') &&
        !file.includes('dist') &&
        !file.includes('.git')
      ) {
        const content = await fs.readFile(filePath, 'utf8');
        
        // Check if file contains mongoose model export
        if (
          content.includes('mongoose.model') || 
          content.includes('Schema') || 
          content.includes('model(')
        ) {
          modelFiles.push(filePath);
        }
      }
    }
  }
  
  await walkDir(dir);
  return modelFiles;
}

async function updateModelFiles(files) {
  let updatedCount = 0;
  
  for (const file of files) {
    let content = await fs.readFile(file, 'utf8');
    let original = content;
    
    // Find and replace mongoose.model calls
    for (const [modelName, collectionName] of Object.entries(MODEL_TO_COLLECTION_MAP)) {
      // Different patterns for model exports
      const patterns = [
        // mongoose.model('users', userSchema)
        new RegExp(`mongoose\\.model\\(['\"]\\w+['\"]`, 'g'),
        
        // mongoose.model(modelName, schema)
        new RegExp(`mongoose\\.model\\(\\s*['\"]${modelName}['\"]`, 'g'),
        
        // model('users', schema)
        new RegExp(`model\\(['\"]\\w+['\"]`, 'g')
      ];
      
      for (const pattern of patterns) {
        content = content.replace(pattern, (match) => {
          // Check if this is for the specific model
          if (match.includes(modelName) || match.includes(modelName.replace('Model', ''))) {
            return match.replace(/['"](\w+)['"]/, `'${collectionName}'`);
          }
          return match;
        });
      }
    }
    
    // If the content was modified, update the file
    if (content !== original) {
      await fs.writeFile(file, content, 'utf8');
      updatedCount++;
      console.log(`Updated model export in file: ${file}`);
    }
  }
  
  return updatedCount;
}

async function main() {
  try {
    console.log('Starting model export standardization...');
    
    // Find all potential model files
    const modelFiles = await findModelFiles('.');
    console.log(`Found ${modelFiles.length} potential model files to check.`);
    
    // Update model exports to use standardized collection names
    const updatedCount = await updateModelFiles(modelFiles);
    console.log(`Updated ${updatedCount} files with standardized collection names.`);
    
    console.log('Model export standardization completed successfully!');
  } catch (error) {
    console.error('Error standardizing model exports:', error);
    process.exit(1);
  }
}

main();