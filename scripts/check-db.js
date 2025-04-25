import 'dotenv/config';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sahil:L12So8uUyN7TyNZy@skillgenix.4lthw6g.mongodb.net/careerpathAI?retryWrites=true&w=majority';

async function checkDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    console.log('Connected to MongoDB');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(coll => console.log(` - ${coll.name}`));
    
    // Check users collection
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`\nFound ${users.length} users:`);
    
    // Check user roles
    for (const user of users) {
      console.log(` - ${user.email}: role=${user.role || 'undefined'}, _id=${user._id}`);
    }
    
    // Check if there are any role-related collections
    const roleCollections = collections.filter(coll => 
      coll.name.toLowerCase().includes('role') || 
      coll.name.toLowerCase().includes('permission')
    );
    
    if (roleCollections.length > 0) {
      console.log('\nRole-related collections:');
      roleCollections.forEach(coll => console.log(` - ${coll.name}`));
    } else {
      console.log('\nNo separate role collections found. Roles are likely embedded in user documents.');
    }
    
    // Examine the superadmin user
    const superAdmin = await mongoose.connection.db.collection('users').findOne({ email: 'super-admin@skillgenix.com' });
    if (superAdmin) {
      console.log('\nSuperadmin user details:');
      console.log(` - ID: ${superAdmin._id}`);
      console.log(` - Role: ${superAdmin.role || 'undefined'}`);
      console.log(` - All fields: ${Object.keys(superAdmin).join(', ')}`);
    } else {
      console.log('\nSuperadmin user not found');
    }
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabase();