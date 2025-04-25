import 'dotenv/config';
import mongoose from 'mongoose';

// Connect to MongoDB using the explicit URI
async function connectToMongoDB() {
  try {
    // Use MONGODB_URI environment variable instead of DATABASE_URL
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sahil:L12So8uUyN7TyNZy@skillgenix.4lthw6g.mongodb.net/careerpathAI?retryWrites=true&w=majority';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Connection error:', error);
    return false;
  }
}

// Update the superadmin user
async function fixSuperAdminUser() {
  try {
    // First, get the users collection directly without the model
    const usersCollection = mongoose.connection.db.collection('users');
    
    // Find the superadmin user
    const superAdmin = await usersCollection.findOne({ email: 'super-admin@skillgenix.com' });
    
    if (!superAdmin) {
      console.log('Super admin user not found');
      return false;
    }
    
    console.log('Found super admin user:', superAdmin.email);
    console.log('Current role:', superAdmin.role);
    
    // Update the role to superadmin
    const result = await usersCollection.updateOne(
      { email: 'super-admin@skillgenix.com' },
      { $set: { role: 'superadmin' } }
    );
    
    console.log('Update result:', result);
    
    // Verify the update
    const updatedUser = await usersCollection.findOne({ email: 'super-admin@skillgenix.com' });
    console.log('Updated role:', updatedUser.role);
    
    return true;
  } catch (error) {
    console.error('Error updating super admin:', error);
    return false;
  }
}

// Main function
async function main() {
  const connected = await connectToMongoDB();
  
  if (connected) {
    await fixSuperAdminUser();
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main();