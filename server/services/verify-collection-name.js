/**
 * This utility verifies and standardizes collection names to ensure they follow naming conventions
 * and don't have high similarity with existing collections.
 */

import { MongoClient } from 'mongodb';

// Known valid prefixes for different domains
const DOMAIN_PREFIXES = {
  USER: 'userx_',       // User-related collections (profiles, activities, etc.)
  ROLE: 'rolex_',       // Role-related collections
  SKILL: 'skillx_',     // Skill-related collections
  INDUSTRY: 'indx_',    // Industry-related collections
  SYSTEM: 'systemx_',   // System-related collections (errors, logs, limits, etc.)
  CAREER: 'careerx_',   // Career-related collections (pathways, analyses)
  API: 'apix_',         // API-related collections (logs, keys, etc.)
  LEARNING: 'learnx_'   // Learning resource-related collections
};

// Existing standard collections
const STANDARD_COLLECTIONS = [
  'systemx_errorlogs',
  'systemx_featurelimits',
  'userx_activitylogs'
];

// Cache for collection names to avoid repeated DB calls
let collectionsCache = null;
let cacheTTL = 0;
const CACHE_LIFETIME = 60 * 60 * 1000; // 1 hour

/**
 * Calculate similarity between two strings (0-100%)
 * @param {string} str1 First string
 * @param {string} str2 Second string
 * @returns {number} Similarity percentage
 */
function calculateSimilarity(str1, str2) {
  // Convert both strings to lowercase
  const a = str1.toLowerCase();
  const b = str2.toLowerCase();
  
  // Create matrix
  const matrix = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill(0));
  
  // Fill first row and column
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  
  // Fill matrix
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,       // deletion
        matrix[i][j - 1] + 1,       // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  // Calculate percentage
  const maxDistance = Math.max(a.length, b.length);
  const distance = matrix[a.length][b.length];
  const similarity = ((maxDistance - distance) / maxDistance) * 100;
  
  return similarity;
}

/**
 * Get all collection names from the database
 * @param {string} [dbUrl] MongoDB connection string
 * @returns {Promise<string[]>} Array of collection names
 */
async function getCollectionNames(dbUrl) {
  // Use cache if available and not expired
  const now = Date.now();
  if (collectionsCache && cacheTTL > now) {
    return collectionsCache;
  }
  
  // Get database URL
  const MONGODB_URI = dbUrl || process.env.DATABASE_URL || process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('No MongoDB URI provided for collection name verification');
    return STANDARD_COLLECTIONS; // Return known collections as fallback
  }
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    
    const db = client.db();
    const collections = await db.listCollections().toArray();
    const collectionNames = collections
      .map(c => c.name)
      .filter(name => !name.startsWith('system.'));
    
    // Update cache
    collectionsCache = collectionNames;
    cacheTTL = now + CACHE_LIFETIME;
    
    return collectionNames;
  } catch (error) {
    console.error('Error getting collection names:', error);
    return STANDARD_COLLECTIONS; // Return known collections as fallback
  } finally {
    await client.close();
  }
}

/**
 * Verify if a collection name is valid and doesn't clash with existing collections
 * @param {string} name Collection name to verify
 * @param {object} options Options for verification
 * @returns {Promise<{valid: boolean, reason?: string, suggestion?: string}>} Validation result
 */
export async function verifyCollectionName(name, options = {}) {
  const {
    similarityThreshold = 49, // Max allowed similarity percentage
    dbUrl = null,             // Optional database URL
    autoFix = false           // Whether to return a fixed name or just validation
  } = options;
  
  // Basic validation
  if (!name) {
    return {
      valid: false,
      reason: 'Collection name cannot be empty',
      suggestion: null
    };
  }
  
  // Lowercase validation
  if (name !== name.toLowerCase()) {
    const suggestion = name.toLowerCase();
    return {
      valid: false,
      reason: 'Collection name must be lowercase',
      suggestion: autoFix ? suggestion : null
    };
  }
  
  // Prefix validation
  const hasValidPrefix = Object.values(DOMAIN_PREFIXES).some(prefix => name.startsWith(prefix));
  
  if (!hasValidPrefix) {
    // Determine the most appropriate prefix based on the name
    let bestPrefix = DOMAIN_PREFIXES.SYSTEM; // Default prefix
    
    if (name.includes('user') || name.includes('profile') || name.includes('account')) {
      bestPrefix = DOMAIN_PREFIXES.USER;
    } else if (name.includes('role') || name.includes('position') || name.includes('job')) {
      bestPrefix = DOMAIN_PREFIXES.ROLE;
    } else if (name.includes('skill') || name.includes('competency') || name.includes('ability')) {
      bestPrefix = DOMAIN_PREFIXES.SKILL;
    } else if (name.includes('industr') || name.includes('sector')) {
      bestPrefix = DOMAIN_PREFIXES.INDUSTRY;
    } else if (name.includes('career') || name.includes('pathway') || name.includes('path')) {
      bestPrefix = DOMAIN_PREFIXES.CAREER;
    } else if (name.includes('api') || name.includes('request') || name.includes('endpoint')) {
      bestPrefix = DOMAIN_PREFIXES.API;
    } else if (name.includes('learn') || name.includes('resource') || name.includes('course')) {
      bestPrefix = DOMAIN_PREFIXES.LEARNING;
    } else if (name.includes('error') || name.includes('log') || name.includes('system') || name.includes('limit')) {
      bestPrefix = DOMAIN_PREFIXES.SYSTEM;
    }
    
    // Remove any existing prefixes if present
    const baseNameMatch = name.match(/^(skillgenix_|userx_|rolex_|skillx_|indx_|systemx_|careerx_|apix_|learnx_)?(.+)$/);
    const baseName = baseNameMatch ? baseNameMatch[2] : name;
    
    const suggestion = `${bestPrefix}${baseName}`;
    
    return {
      valid: false,
      reason: `Collection name must start with a valid domain prefix (${Object.values(DOMAIN_PREFIXES).join(', ')})`,
      suggestion: autoFix ? suggestion : null
    };
  }
  
  // Similarity validation
  const existingCollections = await getCollectionNames(dbUrl);
  
  const similarCollections = existingCollections
    .filter(existing => existing !== name) // Skip self
    .map(existing => ({
      name: existing,
      similarity: calculateSimilarity(name, existing)
    }))
    .filter(result => result.similarity >= similarityThreshold);
  
  if (similarCollections.length > 0) {
    // Sort by similarity (highest first)
    similarCollections.sort((a, b) => b.similarity - a.similarity);
    
    const highestSimilarity = similarCollections[0];
    
    // If there's a similar collection, suggest a more distinct name
    let suggestion = null;
    
    if (autoFix) {
      // Extract the prefix and base name
      const prefixMatch = name.match(/^(userx_|rolex_|skillx_|indx_|systemx_|careerx_|apix_|learnx_)(.+)$/);
      
      if (prefixMatch) {
        const [_, prefix, baseName] = prefixMatch;
        
        // Generate a more distinctive name
        // Strategy 1: Add a numeric suffix
        suggestion = `${prefix}${baseName}_v2`;
        
        // Make sure our suggestion doesn't have high similarity with anything
        const suggestionSimilarity = existingCollections
          .map(existing => calculateSimilarity(suggestion, existing))
          .filter(sim => sim >= similarityThreshold);
        
        if (suggestionSimilarity.length > 0) {
          // Strategy 2: Be more explicit in naming
          suggestion = `${prefix}${baseName}_collection`;
        }
      }
    }
    
    return {
      valid: false,
      reason: `Collection name is ${highestSimilarity.similarity.toFixed(1)}% similar to existing collection '${highestSimilarity.name}' (threshold: ${similarityThreshold}%)`,
      similarTo: highestSimilarity.name,
      suggestion
    };
  }
  
  // All validations passed
  return {
    valid: true
  };
}

/**
 * Get a standardized collection name
 * @param {string} name Proposed collection name
 * @param {object} options Options for verification
 * @returns {Promise<string>} Standardized collection name
 */
export async function getStandardizedName(name, options = {}) {
  const result = await verifyCollectionName(name, { ...options, autoFix: true });
  
  if (!result.valid && result.suggestion) {
    return result.suggestion;
  }
  
  return name;
}

/**
 * Get the appropriate domain prefix for a collection based on its purpose
 * @param {string} domain Collection domain (USER, ROLE, SKILL, etc.)
 * @returns {string} The appropriate prefix
 */
export function getDomainPrefix(domain) {
  const upperDomain = (domain || '').toUpperCase();
  return DOMAIN_PREFIXES[upperDomain] || DOMAIN_PREFIXES.SYSTEM;
}

/**
 * List all available domain prefixes
 * @returns {object} Object mapping domain names to prefixes
 */
export function getAllDomainPrefixes() {
  return { ...DOMAIN_PREFIXES };
}

// Export domain prefixes as constants
export const PREFIXES = Object.freeze({ ...DOMAIN_PREFIXES });