// Script to fix the super admin password
// This is needed because bcrypt and crypto scrypt hashes are not compatible

import mongoose from 'mongoose';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
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

// Super admin credentials
const SUPERADMIN_EMAIL = 'super-admin@skillgenix.com';
const SUPERADMIN_PASSWORD = 'SuperAdmin1234!';

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

// Using crypto's scrypt for hashing (same as in auth.ts)
const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64));
  return `${buf.toString("hex")}.${salt}`;
}

// Fix the super admin's password
async function fixSuperAdminPassword() {
  try {
    const db = mongoose.connection.db;
    const userCollection = db.collection('users');
    
    // Find the super admin user
    const superAdmin = await userCollection.findOne({ email: SUPERADMIN_EMAIL });
    
    if (!superAdmin) {
      console.log('Super admin account not found! Please run recreate-superadmin.js first.');
      return false;
    }
    
    console.log('Super admin account found. Current password format:', superAdmin.password.includes('.') ? 'crypto' : 'bcrypt');
    
    // Hash the password using the same method as in auth.ts
    const hashedPassword = await hashPassword(SUPERADMIN_PASSWORD);
    
    // Update the user with the new password
    const result = await userCollection.updateOne(
      { email: SUPERADMIN_EMAIL },
      { $set: { password: hashedPassword } }
    );
    
    if (result.modifiedCount === 1) {
      console.log('Super admin password has been successfully updated!');
      
      // Verify the update
      const updatedAdmin = await userCollection.findOne({ email: SUPERADMIN_EMAIL });
      console.log('Verification:');
      console.log('- Email:', updatedAdmin.email);
      console.log('- Role:', updatedAdmin.role);
      console.log('- Password format:', updatedAdmin.password.includes('.') ? 'crypto (correct)' : 'bcrypt (incorrect)');
      
      return true;
    } else {
      console.log('Failed to update super admin password.');
      return false;
    }
  } catch (error) {
    console.error('Error fixing super admin password:', error);
    return false;
  }
}

// Main function
async function main() {
  try {
    await connectToMongoDB();
    const result = await fixSuperAdminPassword();
    if (result) {
      console.log('Super admin password fix completed successfully!');
    } else {
      console.log('Super admin password fix failed!');
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