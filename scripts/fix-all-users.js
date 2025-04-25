import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sahil:L12So8uUyN7TyNZy@skillgenix.4lthw6g.mongodb.net/careerpathAI?retryWrites=true&w=majority';

async function fixAllUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('Connected to MongoDB');
    
    // Get all users
    const usersCollection = mongoose.connection.db.collection('users');
    const users = await usersCollection.find({}).toArray();
    
    console.log(`Found ${users.length} users to process`);
    
    // Process each user
    for (const user of users) {
      // Check if role is undefined/missing
      if (!user.role) {
        const defaultRole = user.email === 'super-admin@skillgenix.com' ? 'superadmin' : 'user';
        
        console.log(`Fixing user ${user.email}: Setting role to ${defaultRole}`);
        
        // Update user with default role
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { role: defaultRole } }
        );
      } else {
        console.log(`User ${user.email} already has role: ${user.role}`);
      }
      
      // Check if status is undefined/missing
      if (!user.status) {
        console.log(`Fixing user ${user.email}: Setting status to active`);
        
        // Update user with default status
        await usersCollection.updateOne(
          { _id: user._id },
          { $set: { status: 'active' } }
        );
      }
    }
    
    // Verify fixes
    console.log('\nVerifying updates:');
    const updatedUsers = await usersCollection.find({}).toArray();
    for (const user of updatedUsers) {
      console.log(`- ${user.email}: role=${user.role || 'undefined'}, status=${user.status || 'undefined'}`);
    }
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    console.log('User role and status repair completed successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
}

fixAllUsers();