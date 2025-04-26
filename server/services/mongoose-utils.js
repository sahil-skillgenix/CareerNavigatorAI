/**
 * Utilities for working with Mongoose that enforce collection naming standards
 */

import mongoose from 'mongoose';
import { getStandardizedName, PREFIXES } from './verify-collection-name.js';

// Original mongoose.model function
const originalModel = mongoose.model.bind(mongoose);

/**
 * Create a mongoose model with standardized collection name.
 * Will override the mongoose.model method to ensure all collection
 * names follow the standardized naming conventions.
 * 
 * @param {string} name Model name
 * @param {mongoose.Schema} schema Schema for the model
 * @param {string} [collectionName] Optional explicit collection name
 * @returns {mongoose.Model} Mongoose model
 */
export async function createStandardizedModel(name, schema, collectionName) {
  try {
    // If a collection name is explicitly provided, standardize it
    if (collectionName) {
      const standardName = await getStandardizedName(collectionName);
      
      if (standardName !== collectionName) {
        console.warn(`Collection name '${collectionName}' standardized to '${standardName}'`);
      }
      
      return originalModel(name, schema, standardName);
    }
    
    // If no collection name is provided, infer one from the model name
    const inferredName = name.toLowerCase();
    
    // Determine appropriate prefix from model name
    let prefix = PREFIXES.SYSTEM; // Default prefix
    
    if (inferredName.includes('user') || inferredName.includes('profile')) {
      prefix = PREFIXES.USER;
    } else if (inferredName.includes('role') || inferredName.includes('job')) {
      prefix = PREFIXES.ROLE;
    } else if (inferredName.includes('skill') || inferredName.includes('competency')) {
      prefix = PREFIXES.SKILL;
    } else if (inferredName.includes('industr') || inferredName.includes('sector')) {
      prefix = PREFIXES.INDUSTRY;
    } else if (inferredName.includes('career') || inferredName.includes('pathway')) {
      prefix = PREFIXES.CAREER;
    } else if (inferredName.includes('api') || inferredName.includes('request')) {
      prefix = PREFIXES.API;
    } else if (inferredName.includes('learn') || inferredName.includes('resource')) {
      prefix = PREFIXES.LEARNING;
    } else if (inferredName.includes('error') || inferredName.includes('log') || 
              inferredName.includes('system') || inferredName.includes('limit')) {
      prefix = PREFIXES.SYSTEM;
    }
    
    // Construct standardized name and create model
    const standardName = `${prefix}${inferredName}`;
    
    console.log(`Creating model '${name}' with standardized collection name '${standardName}'`);
    return originalModel(name, schema, standardName);
  } catch (error) {
    console.error(`Error creating standardized model '${name}':`, error);
    
    // Fall back to original behavior if standardization fails
    return originalModel(name, schema, collectionName);
  }
}

/**
 * Monkey-patch mongoose.model to use our standardized version
 * Call this function once at application startup to override the default behavior
 */
export function enableStandardizedCollections() {
  // Only patch if not already patched
  if (!mongoose.model._isPatched) {
    // Save original function
    mongoose.model._original = mongoose.model;
    
    // Override with our version
    mongoose.model = async function(name, schema, collectionName) {
      // Only apply standardization if a schema is provided (new model creation)
      if (schema) {
        return await createStandardizedModel(name, schema, collectionName);
      }
      
      // Otherwise it's a model retrieval, use original behavior
      return mongoose.model._original(name);
    };
    
    // Mark as patched
    mongoose.model._isPatched = true;
    
    console.log('Enabled standardized collection names for Mongoose');
  }
}

/**
 * Restore the original mongoose.model function
 */
export function disableStandardizedCollections() {
  if (mongoose.model._isPatched) {
    mongoose.model = mongoose.model._original;
    delete mongoose.model._isPatched;
    delete mongoose.model._original;
    
    console.log('Disabled standardized collection names for Mongoose');
  }
}