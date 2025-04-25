// Script to completely rebuild the database structure
// This script will:
// 1. Back up essential data (users, etc.)
// 2. Drop ALL collections
// 3. Recreate ONLY the necessary collections with standardized names
// 4. Restore essential data

import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

// Get current file directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connection URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sahil:sahil123@skillgenix.4lthw6g.mongodb.net/careerpathAI?retryWrites=true&w=majority';

// Using crypto's scrypt for hashing (same as in auth.ts)
const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString("hex")}.${salt}`;
}

// Standard collection names - these are the ONLY collections we will recreate
const STANDARD_COLLECTIONS = [
  // Core entities
  'users',               // User accounts
  'roles',               // Career roles
  'skills',              // Professional skills
  'industries',          // Industries data
  
  // Session and notification
  'sessions',            // User sessions
  'notifications',       // User notifications
  
  // User related collections
  'userActivity',        // User activity logs
  'userProgress',        // User learning progress
  'userBadge',           // User achievement badges
  'userFeatureOverride', // User feature customizations
  
  // Admin related collections
  'adminActivity',       // Admin activity logs
  'superAdminActivity',  // Super admin activity logs
  'featureLimit',        // System feature limits
  
  // System collections
  'systemErrorLog',      // System error logs
  'systemUsageStat',     // System usage statistics
  'systemNotification',  // System notifications
  'apiRequestLog',       // API request logs
  'dataImportLog',       // Data import logs
  
  // Career data collections
  'careerAnalysis',      // User career analysis results
  'careerPathway',       // Career pathway definitions
  'learningResource',    // Learning resources
  
  // Relationship collections
  'roleSkill',           // Role to skill mappings
  'roleIndustry',        // Role to industry mappings
  'skillIndustry',       // Skill to industry mappings
  'skillPrerequisite',   // Skill prerequisites
  
  // Test collection
  'test'                 // For testing purposes
];

// Main function
async function main() {
  try {
    console.log('=== DATABASE REBUILD SCRIPT ===');
    console.log('WARNING: This script will drop all collections and recreate only the standard ones.');
    console.log('Connecting to MongoDB...');
    
    // Connect directly using MongoClient for more control
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB using direct client');
    
    // Get database name from connection string
    const dbName = MONGODB_URI.split('/').pop().split('?')[0];
    console.log(`Using database: ${dbName}`);
    
    const db = client.db(dbName);
    
    // Step 1: List all existing collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name).sort();
    
    console.log('\nCurrent collections in database:');
    collectionNames.forEach(name => console.log(`- ${name}`));
    
    // Step 2: Backup essential data
    console.log('\n=== BACKING UP ESSENTIAL DATA ===');
    
    // Backup users
    console.log('Backing up users collection...');
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({}).toArray();
    console.log(`Backed up ${users.length} users`);
    
    // Backup other essential collections if needed
    // ...
    
    // Step 3: Drop all collections
    console.log('\n=== DROPPING ALL COLLECTIONS ===');
    for (const collection of collectionNames) {
      try {
        await db.dropCollection(collection);
        console.log(`- Dropped collection: ${collection}`);
      } catch (error) {
        console.error(`- Error dropping ${collection}: ${error.message}`);
      }
    }
    
    // Step 4: Create standard collections
    console.log('\n=== CREATING STANDARD COLLECTIONS ===');
    for (const collection of STANDARD_COLLECTIONS) {
      try {
        await db.createCollection(collection);
        console.log(`- Created collection: ${collection}`);
      } catch (error) {
        console.error(`- Error creating ${collection}: ${error.message}`);
      }
    }
    
    // Step 5: Restore essential data
    console.log('\n=== RESTORING ESSENTIAL DATA ===');
    
    // Create the users collection
    console.log('Restoring users...');
    const newUsersCollection = db.collection('users');
    
    // Create default users if none exist
    if (users.length === 0) {
      console.log('No users found in backup. Creating default users...');
      
      // Create demo user
      const demoPassword = await hashPassword('demo123456');
      await newUsersCollection.insertOne({
        fullName: 'Demo User',
        email: 'demo@skillgenix.com',
        password: demoPassword,
        status: 'active',
        role: 'user',
        securityQuestion: 'What is your favorite color?',
        securityAnswer: 'Blue',
        location: 'Demo City',
        phone: '+1234567890',
        bio: 'Demo user account',
        currentRole: 'Student',
        experience: 2,
        education: 'Bachelor\'s Degree',
        skills: ['JavaScript', 'React', 'Node.js'],
        interests: ['Web Development', 'AI', 'Data Science'],
        createdAt: new Date()
      });
      console.log('- Created demo user: demo@skillgenix.com');
      
      // Create super admin
      const adminPassword = await hashPassword('SuperAdmin1234!');
      await newUsersCollection.insertOne({
        fullName: 'Super Admin',
        email: 'super-admin@skillgenix.com',
        password: adminPassword,
        status: 'active',
        role: 'superadmin',
        securityQuestion: 'What is your favorite color?',
        securityAnswer: 'Blue',
        location: 'Admin HQ',
        phone: '+1234567890',
        bio: 'System super administrator',
        currentRole: 'Super Administrator',
        experience: 10,
        education: 'System Administration',
        skills: ['System Administration', 'Security', 'User Management'],
        interests: ['Technology', 'Security', 'Administration'],
        createdAt: new Date()
      });
      console.log('- Created super admin: super-admin@skillgenix.com');
    } else {
      // Insert the backed up users with the correct password format
      for (const user of users) {
        // Remove MongoDB's _id to avoid duplicate key errors
        const { _id, ...userWithoutId } = user;
        
        // Make sure password is in correct format
        if (!userWithoutId.password || !userWithoutId.password.includes('.')) {
          console.log(`- Fixing password format for ${userWithoutId.email}`);
          
          // Use default passwords for known accounts
          if (userWithoutId.email === 'demo@skillgenix.com') {
            userWithoutId.password = await hashPassword('demo123456');
          } else if (userWithoutId.email === 'super-admin@skillgenix.com') {
            userWithoutId.password = await hashPassword('SuperAdmin1234!');
          } else if (userWithoutId.email === 'test@skillgenix.com') {
            userWithoutId.password = await hashPassword('test123456');
          } else {
            // Generate random password for other users
            userWithoutId.password = await hashPassword(`Reset${Math.random().toString(36).substring(2, 10)}!`);
            userWithoutId.passwordResetRequired = true;
          }
        }
        
        await newUsersCollection.insertOne(userWithoutId);
      }
      console.log(`- Restored ${users.length} users`);
    }
    
    // Create indexes on users collection
    await newUsersCollection.createIndex({ email: 1 }, { unique: true });
    console.log('- Created unique index on users.email');
    
    // Create other indexes and restore other data if needed
    // ...
    
    // Check final state
    const finalCollections = await db.listCollections().toArray();
    const finalCollectionNames = finalCollections.map(c => c.name).sort();
    
    console.log('\n=== DATABASE REBUILD COMPLETE ===');
    console.log('Final collections in database:');
    finalCollectionNames.forEach(name => console.log(`- ${name}`));
    
    // Create an index of what each collection is for
    console.log('\n=== COLLECTION GUIDE ===');
    STANDARD_COLLECTIONS.forEach(name => {
      let description = 'No description';
      
      // Add descriptions for each collection
      switch(name) {
        case 'users': description = 'User accounts and profiles'; break;
        case 'roles': description = 'Career role definitions'; break;
        case 'skills': description = 'Professional skills data'; break;
        case 'industries': description = 'Industry sector information'; break;
        case 'sessions': description = 'User session data'; break;
        case 'notifications': description = 'User notifications'; break;
        case 'userActivity': description = 'User activity logs'; break;
        case 'userProgress': description = 'User learning progress tracking'; break;
        case 'userBadge': description = 'User achievement badges'; break;
        case 'userFeatureOverride': description = 'User feature customizations'; break;
        case 'adminActivity': description = 'Admin activity logs'; break;
        case 'superAdminActivity': description = 'Super admin activity logs'; break;
        case 'featureLimit': description = 'System feature limits'; break;
        case 'systemErrorLog': description = 'System error logs'; break;
        case 'systemUsageStat': description = 'System usage statistics'; break;
        case 'systemNotification': description = 'System notifications'; break;
        case 'apiRequestLog': description = 'API request logs'; break;
        case 'dataImportLog': description = 'Data import logs'; break;
        case 'careerAnalysis': description = 'User career analysis results'; break;
        case 'careerPathway': description = 'Career pathway definitions'; break;
        case 'learningResource': description = 'Learning resources'; break;
        case 'roleSkill': description = 'Role to skill mappings'; break;
        case 'roleIndustry': description = 'Role to industry mappings'; break;
        case 'skillIndustry': description = 'Skill to industry mappings'; break;
        case 'skillPrerequisite': description = 'Skill prerequisites'; break;
        case 'test': description = 'Test collection'; break;
      }
      
      console.log(`- ${name}: ${description}`);
    });
    
    await client.close();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error rebuilding database:', error);
  }
}

// Run the main function
main();