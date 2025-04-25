// Script to recreate the super admin user account
// This should be run only when there are issues with the super admin account
import mongoose from 'mongoose';
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

// Hash password function
async function hashPassword(password) {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

// Create or update the super admin user
async function recreateSuperAdmin() {
  try {
    // Get the User model
    const UserModel = mongoose.model('User', new mongoose.Schema({
      fullName: String,
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      status: { type: String, default: 'active' },
      role: { type: String, default: 'user' },
      createdAt: { type: Date, default: Date.now },
      securityQuestion: String,
      securityAnswer: String,
      location: String,
      phone: String,
      bio: String,
      currentRole: String,
      experience: Number,
      education: String,
      skills: [String],
      interests: [String],
      avatarUrl: String
    }), 'users');

    // First, check if super admin user exists
    const existingUser = await UserModel.findOne({ email: SUPERADMIN_EMAIL });
    
    if (existingUser) {
      console.log('Super admin account exists. Deleting it to recreate...');
      await UserModel.deleteOne({ email: SUPERADMIN_EMAIL });
    }

    // Hash the password
    const hashedPassword = await hashPassword(SUPERADMIN_PASSWORD);

    // Create a new super admin user
    const superAdmin = new UserModel({
      fullName: 'Super Admin',
      email: SUPERADMIN_EMAIL,
      password: hashedPassword,
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
      interests: ['Technology', 'Security', 'Administration']
    });

    await superAdmin.save();
    console.log('Super admin account has been successfully recreated!');
    
    // Verify the creation
    const verifiedUser = await UserModel.findOne({ email: SUPERADMIN_EMAIL });
    console.log('Verification:');
    console.log('- Email:', verifiedUser.email);
    console.log('- Role:', verifiedUser.role);
    console.log('- Status:', verifiedUser.status);
    
    return true;
  } catch (error) {
    console.error('Failed to recreate super admin:', error);
    return false;
  }
}

// Main function
async function main() {
  try {
    await connectToMongoDB();
    const result = await recreateSuperAdmin();
    if (result) {
      console.log('Super admin recreation completed successfully!');
    } else {
      console.log('Super admin recreation failed!');
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