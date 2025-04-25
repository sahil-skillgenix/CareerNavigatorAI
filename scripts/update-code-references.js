// Script to analyze MongoDB collection references in the codebase
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the root directory
const rootDir = path.resolve(__dirname, '..');

// Maps old collection names to new standardized names
const COLLECTION_NAME_MAPPING = {
  'users': 'users', // No change
  'roles': 'roles', // No change
  'skills': 'skills', // No change
  'industries': 'industries', // No change
  'sessions': 'sessions', // No change
  'notifications': 'notifications', // No change
  
  // Changed collection names
  'useractivities': 'userActivity',
  'userActivities': 'userActivity',
  'userprogresses': 'userProgress',
  'userProgresses': 'userProgress',
  'userbadges': 'userBadge',
  'userBadges': 'userBadge',
  'userFeatureOverrides': 'userFeatureOverride',
  'adminActivities': 'adminActivity',
  'superadminActivities': 'superAdminActivity',
  'featurelimits': 'featureLimit',
  'featureLimits': 'featureLimit',
  'systemerrorlogs': 'systemErrorLog',
  'systemErrorLogs': 'systemErrorLog',
  'systemusagestats': 'systemUsageStat',
  'systemUsageStats': 'systemUsageStat',
  'systemnotifications': 'systemNotification',
  'systemNotifications': 'systemNotification',
  'apirequestlogs': 'apiRequestLog',
  'apiRequestLogs': 'apiRequestLog',
  'dataimportlogs': 'dataImportLog',
  'dataImportLogs': 'dataImportLog',
  'careeranalyses': 'careerAnalysis',
  'careerAnalyses': 'careerAnalysis',
  'careerpathways': 'careerPathway',
  'careerPathways': 'careerPathway',
  'learningresources': 'learningResource',
  'learningResources': 'learningResource',
  'roleskills': 'roleSkill',
  'roleSkills': 'roleSkill',
  'roleindustries': 'roleIndustry',
  'roleIndustries': 'roleIndustry',
  'skillindustries': 'skillIndustry',
  'skillIndustries': 'skillIndustry',
  'skillprerequisites': 'skillPrerequisite',
  'skillPrerequisites': 'skillPrerequisite',
  'tests': 'test',
  'errorlogs': 'systemErrorLog',
  'errorLogs': 'systemErrorLog',
  'userNotificationStatuses': 'userFeatureOverride'
};

// File extensions to check
const EXTENSIONS_TO_CHECK = ['.js', '.jsx', '.ts', '.tsx'];

// Directories to exclude
const EXCLUDE_DIRS = ['node_modules', '.git', 'scripts'];

// Function to recursively walk a directory
function walkDirectory(dir, callback) {
  if (EXCLUDE_DIRS.includes(path.basename(dir))) return;
  
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath, callback);
    } else if (stat.isFile() && EXTENSIONS_TO_CHECK.includes(path.extname(filePath))) {
      callback(filePath);
    }
  });
}

// Function to check a file for MongoDB collection references
function checkFileForCollectionReferences(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const referencesFound = [];
  
  // Different patterns to check for collection references
  const patterns = [
    // db.collection('name')
    /db\.collection\(['"]([^'"]+)['"]\)/g,
    // mongoose.model('Name', schema, 'collection_name')
    /mongoose\.model\(['"][^'"]+['"],\s*[^,]+,\s*['"]([^'"]+)['"]\)/g,
    // collection: 'name'
    /collection:\s*['"]([^'"]+)['"]/g,
    // db.createCollection('name')
    /db\.createCollection\(['"]([^'"]+)['"]\)/g,
    // db.name.find() - collection name as property
    /db\.([a-zA-Z0-9_]+)\./g,
    // 'collectionName'
    /['"]([a-zA-Z0-9_]+)['"]/g,
    // MongoDBStorage references
    /const\s+([a-zA-Z0-9_]+)\s*=\s*db\.collection\(['"]([^'"]+)['"]\)/g,
    // Direct string references
    /'([a-zA-Z0-9]+[A-Z][a-zA-Z0-9]+)'/g,
    /"([a-zA-Z0-9]+[A-Z][a-zA-Z0-9]+)"/g
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      // The collection name could be in different capture groups depending on the pattern
      let collectionName;
      
      if (match.length > 2 && match[2]) {
        // For patterns with multiple capture groups
        collectionName = match[2];
      } else if (match.length > 1) {
        // For patterns with a single capture group
        collectionName = match[1];
      } else {
        continue;
      }
      
      if (COLLECTION_NAME_MAPPING[collectionName] && 
          COLLECTION_NAME_MAPPING[collectionName] !== collectionName) {
        referencesFound.push({
          line: content.substring(0, match.index).split('\n').length,
          oldName: collectionName,
          newName: COLLECTION_NAME_MAPPING[collectionName],
          context: content.substring(Math.max(0, match.index - 40), match.index + match[0].length + 40).trim()
        });
      }
    }
  }
  
  return referencesFound;
}

// Main function
async function main() {
  console.log('=== ANALYZING CODE FOR MONGODB COLLECTION REFERENCES ===');
  
  const allReferences = [];
  
  console.log('Scanning files...');
  walkDirectory(rootDir, (filePath) => {
    const references = checkFileForCollectionReferences(filePath);
    if (references.length > 0) {
      allReferences.push({
        file: path.relative(rootDir, filePath),
        references
      });
    }
  });
  
  console.log(`\nFound ${allReferences.length} files with collection references that need updating:\n`);
  
  for (const fileRef of allReferences) {
    console.log(`File: ${fileRef.file}`);
    for (const ref of fileRef.references) {
      console.log(`  Line ${ref.line}: Replace '${ref.oldName}' with '${ref.newName}'`);
      console.log(`  Context: ${ref.context}`);
      console.log();
    }
  }
  
  console.log('=== ANALYSIS COMPLETE ===');
  console.log('\nPlease update these references manually or implement an automatic fix.');
}

// Run the main function
main();