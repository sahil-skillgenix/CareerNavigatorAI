// Script to standardize password formats across all users
// Fixes the issue where some users have bcrypt passwords and others have crypto scrypt passwords

import mongoose from 'mongoose';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connection URL
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sahil:sahil123@skillgenix.4lthw6g.mongodb.net/careerpathAI?retryWrites=true&w=majority';

// Using crypto's scrypt for hashing (same as in auth.ts)
const scryptAsync = promisify(scrypt);

// This simulates the hashPassword function from auth.ts
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString("hex")}.${salt}`;
}

// This checks if a password is in bcrypt format
function isBcryptHash(hash) {
  return /^\$2[ayb]\$[0-9]{2}\$[A-Za-z0-9./]{53}$/.test(hash);
}

// This checks if a password is in crypto scrypt format
function isCryptoScryptHash(hash) {
  return hash.includes('.') && hash.split('.').length === 2;
}

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Fix all users' passwords
async function fixAllUsers() {
  try {
    const db = mongoose.connection.db;
    const userCollection = db.collection('users');
    
    // Get all users
    const users = await userCollection.find({}).toArray();
    console.log(`Found ${users.length} users`);
    
    let fixedCount = 0;
    let alreadyCorrectCount = 0;
    
    // Create a mapping of email to default password for demo and test users
    const defaultPasswords = {
      'demo@skillgenix.com': 'demo123456',
      'test@skillgenix.com': 'test123456',
      'super-admin@skillgenix.com': 'SuperAdmin1234!'
    };
    
    // Loop through all users
    for (const user of users) {
      console.log(`Processing user: ${user.email}, role: ${user.role}`);
      
      // Check if the password is already in the correct format
      if (isCryptoScryptHash(user.password)) {
        console.log(`- Password for ${user.email} is already in crypto scrypt format. No action needed.`);
        alreadyCorrectCount++;
        continue;
      }
      
      // Check if this is a user with a known default password
      if (defaultPasswords[user.email]) {
        console.log(`- Found known user: ${user.email}. Resetting to default password.`);
        const newPassword = await hashPassword(defaultPasswords[user.email]);
        
        await userCollection.updateOne(
          { _id: user._id },
          { $set: { password: newPassword } }
        );
        
        console.log(`- Updated password for ${user.email} to default`);
        fixedCount++;
      } else {
        // For other users, we don't know their passwords
        // Set a temporary password and mark for reset
        const tempPassword = await hashPassword(`Temp${Math.random().toString(36).substring(2, 10)}!`);
        
        await userCollection.updateOne(
          { _id: user._id },
          { 
            $set: { 
              password: tempPassword,
              passwordResetRequired: true 
            } 
          }
        );
        
        console.log(`- Set temporary password for ${user.email} and marked for reset`);
        fixedCount++;
      }
    }
    
    console.log(`\nSummary:`);
    console.log(`- Total users processed: ${users.length}`);
    console.log(`- Users with correct password format: ${alreadyCorrectCount}`);
    console.log(`- Users with fixed password format: ${fixedCount}`);
    
    return {
      totalUsers: users.length,
      alreadyCorrect: alreadyCorrectCount,
      fixed: fixedCount
    };
  } catch (error) {
    console.error('Error fixing users:', error);
    return false;
  }
}

// Main function
async function main() {
  try {
    await connectToMongoDB();
    const result = await fixAllUsers();
    if (result) {
      console.log('\nUser password standardization completed successfully!');
      console.log(result);
    } else {
      console.log('\nUser password standardization failed!');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the main function
main();