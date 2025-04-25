/**
 * This script updates all model files to use standardized collection names.
 * It ensures that all mongoose.model calls specify the correct collection names
 * with the 'skillgenix_' prefix and lowercase naming.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapping of model names to their standardized collection names
const STANDARDIZED_COLLECTIONS = {
  // Core entities
  'Role': 'skillgenix_role',
  'Skill': 'skillgenix_skill',
  'Industry': 'skillgenix_industry',
  'User': 'skillgenix_user',
  
  // User related collections
  'UserActivity': 'skillgenix_useractivity', 
  'UserActivityLog': 'skillgenix_useractivitylog',
  'UserProgress': 'skillgenix_userprogress',
  'UserBadge': 'skillgenix_userbadge',
  'UserFeatureOverride': 'skillgenix_userfeatureoverride',
  
  // Admin related collections
  'AdminActivity': 'skillgenix_adminactivity',
  'SuperAdminActivity': 'skillgenix_superadminactivity',
  'FeatureLimits': 'skillgenix_featurelimit',
  
  // System collections
  'SystemErrorLog': 'skillgenix_systemerrorlog',
  'SystemUsageStat': 'skillgenix_systemusagestat',
  'SystemNotification': 'skillgenix_systemnotification',
  'APIRequestLog': 'skillgenix_apirequestlog',
  'ErrorLog': 'skillgenix_errorlog',
  'DataImportLog': 'skillgenix_dataimportlog',
  
  // Career data collections
  'CareerAnalysis': 'skillgenix_careeranalysis',
  'CareerPathway': 'skillgenix_careerpathway',
  'LearningResource': 'skillgenix_learningresource',
  
  // Relationship collections
  'RoleSkill': 'skillgenix_roleskill',
  'RoleIndustry': 'skillgenix_roleindustry',
  'SkillIndustry': 'skillgenix_skillindustry',
  'SkillPrerequisite': 'skillgenix_skillprerequisite'
};

// Function to update model files with standardized collection names
async function updateModelFiles() {
  // Path to models directory
  const modelsDir = path.join(__dirname, '../server/db/models');
  
  try {
    // Get all model files
    const files = await fs.readdir(modelsDir);
    console.log(`Found ${files.length} model files to update`);
    
    let updatedCount = 0;
    let alreadyStandardizedCount = 0;
    let skippedCount = 0;
    
    for (const file of files) {
      if (!file.endsWith('.ts')) {
        skippedCount++;
        continue;
      }
      
      const filePath = path.join(modelsDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Extract model name from file name
      const baseName = path.basename(file, '.ts');
      let modelName = '';
      
      // Handle kebab-case filenames
      if (baseName.includes('-')) {
        modelName = baseName.split('-').map(part => 
          part.charAt(0).toUpperCase() + part.slice(1)
        ).join('');
      } else {
        modelName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
      }
      
      // Find standardized collection name
      const collectionName = STANDARDIZED_COLLECTIONS[modelName];
      
      if (!collectionName) {
        console.log(`⚠️ No standardized collection name found for ${modelName} (${file}), skipping...`);
        skippedCount++;
        continue;
      }
      
      // Check if file already specifies the correct collection name
      if (content.includes(`"${collectionName}"`) || content.includes(`'${collectionName}'`)) {
        console.log(`✅ ${file} already uses standardized collection name ${collectionName}`);
        alreadyStandardizedCount++;
        continue;
      }
      
      // Different patterns to match and replace
      const patterns = [
        // Pattern 1: mongoose.model<ModelDocument>("Model", ModelSchema)
        {
          regex: new RegExp(`mongoose\\.model<${modelName}Document>\\(["']${modelName}["'],\\s*${modelName}Schema\\)`, 'g'),
          replacement: `mongoose.model<${modelName}Document>("${modelName}", ${modelName}Schema, "${collectionName}")`
        },
        // Pattern 2: mongoose.models.Model || mongoose.model<ModelDocument>("Model", ModelSchema)
        {
          regex: new RegExp(`mongoose\\.models\\.${modelName}\\s*\\|\\|\\s*mongoose\\.model<${modelName}Document>\\(["']${modelName}["'],\\s*${modelName}Schema\\)`, 'g'),
          replacement: `mongoose.models.${modelName} || mongoose.model<${modelName}Document>("${modelName}", ${modelName}Schema, "${collectionName}")`
        },
        // Pattern 3: mongoose.model("Model", ModelSchema)
        {
          regex: new RegExp(`mongoose\\.model\\(["']${modelName}["'],\\s*${modelName}Schema\\)`, 'g'),
          replacement: `mongoose.model("${modelName}", ${modelName}Schema, "${collectionName}")`
        },
        // Pattern 4: mongoose.model('modelName', modelSchema)
        {
          regex: new RegExp(`mongoose\\.model\\(["']${modelName.toLowerCase()}["'],\\s*${modelName.toLowerCase()}Schema\\)`, 'g'),
          replacement: `mongoose.model("${modelName.toLowerCase()}", ${modelName.toLowerCase()}Schema, "${collectionName}")`
        }
      ];
      
      let updatedContent = content;
      let updated = false;
      
      // Try each pattern
      for (const { regex, replacement } of patterns) {
        if (regex.test(updatedContent)) {
          updatedContent = updatedContent.replace(regex, replacement);
          updated = true;
          break;
        }
      }
      
      // Update the file if changes were made
      if (updated) {
        await fs.writeFile(filePath, updatedContent, 'utf8');
        console.log(`✅ Updated ${file} with collection name ${collectionName}`);
        updatedCount++;
      } else {
        console.log(`⚠️ Could not update ${file}, pattern not recognized`);
        skippedCount++;
      }
    }
    
    console.log(`\nSummary:`);
    console.log(`- Total files: ${files.length}`);
    console.log(`- Updated: ${updatedCount}`);
    console.log(`- Already standardized: ${alreadyStandardizedCount}`);
    console.log(`- Skipped/Not recognized: ${skippedCount}`);
    
  } catch (error) {
    console.error('Error updating model files:', error);
  }
}

// Main function
async function main() {
  try {
    await updateModelFiles();
    console.log('\nCollection name update process completed!');
  } catch (error) {
    console.error('Error during update process:', error);
  }
}

// Run the script
main();