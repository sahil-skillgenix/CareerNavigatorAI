// Script to create only the essential collections with standardized names
import mongoose from 'mongoose';
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

// Standard collection names with their descriptions
const STANDARD_COLLECTIONS = [
  { name: 'users', description: 'User accounts and profiles' },
  { name: 'roles', description: 'Career role definitions' },
  { name: 'skills', description: 'Professional skills data' },
  { name: 'industries', description: 'Industry sector information' },
  { name: 'sessions', description: 'User session data' },
  { name: 'notifications', description: 'User notifications' },
  { name: 'userActivity', description: 'User activity logs' },
  { name: 'userProgress', description: 'User learning progress tracking' },
  { name: 'userBadge', description: 'User achievement badges' },
  { name: 'userFeatureOverride', description: 'User feature customizations' },
  { name: 'adminActivity', description: 'Admin activity logs' },
  { name: 'superAdminActivity', description: 'Super admin activity logs' },
  { name: 'featureLimit', description: 'System feature limits' },
  { name: 'systemErrorLog', description: 'System error logs' },
  { name: 'systemUsageStat', description: 'System usage statistics' },
  { name: 'systemNotification', description: 'System notifications' },
  { name: 'apiRequestLog', description: 'API request logs' },
  { name: 'dataImportLog', description: 'Data import logs' },
  { name: 'careerAnalysis', description: 'User career analysis results' },
  { name: 'careerPathway', description: 'Career pathway definitions' },
  { name: 'learningResource', description: 'Learning resources' },
  { name: 'roleSkill', description: 'Role to skill mappings' },
  { name: 'roleIndustry', description: 'Role to industry mappings' },
  { name: 'skillIndustry', description: 'Skill to industry mappings' },
  { name: 'skillPrerequisite', description: 'Skill prerequisites' },
  { name: 'test', description: 'Test collection' }
];

// Main function
async function main() {
  try {
    console.log('=== CREATING ESSENTIAL COLLECTIONS ===');
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Get current collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name).sort();
    
    console.log('\nCurrent collections in database:');
    collectionNames.forEach(name => console.log(`- ${name}`));
    
    // Create missing collections
    console.log('\nCreating standard collections...');
    for (const collection of STANDARD_COLLECTIONS) {
      if (!collectionNames.includes(collection.name)) {
        try {
          await db.createCollection(collection.name);
          console.log(`- Created collection: ${collection.name} (${collection.description})`);
        } catch (error) {
          console.error(`- Error creating ${collection.name}: ${error.message}`);
        }
      } else {
        console.log(`- Collection ${collection.name} already exists`);
      }
    }
    
    // Create users if the collection is empty
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    
    if (userCount === 0) {
      console.log('\nCreating default users...');
      
      // Create demo user
      const demoPassword = await hashPassword('demo123456');
      await usersCollection.insertOne({
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
      await usersCollection.insertOne({
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
      
      // Create indexes on users collection
      await usersCollection.createIndex({ email: 1 }, { unique: true });
      console.log('- Created unique index on users.email');
    } else {
      console.log(`\nUsers collection already has ${userCount} documents, skipping default user creation`);
    }
    
    // Check final state
    const finalCollections = await db.listCollections().toArray();
    const finalCollectionNames = finalCollections.map(c => c.name).sort();
    
    console.log('\n=== COLLECTION CREATION COMPLETE ===');
    console.log('Final collections in database:');
    finalCollectionNames.forEach(name => {
      const collection = STANDARD_COLLECTIONS.find(c => c.name === name);
      if (collection) {
        console.log(`- ${name}: ${collection.description}`);
      } else {
        console.log(`- ${name} (Non-standard collection)`);
      }
    });
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error creating essential collections:', error);
  }
}

// Run the main function
main();