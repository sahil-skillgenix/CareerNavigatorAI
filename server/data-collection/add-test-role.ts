/**
 * Script to add a test role to the database
 * Run with: npx tsx server/data-collection/add-test-role.ts
 */

import dotenv from 'dotenv';
import { connectToDatabase } from '../db/mongodb';
import { RoleModel } from '../db/models';

// Initialize environment variables
dotenv.config();

async function addTestRole() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    const testRole = {
      id: 999,
      title: "Test Software Developer",
      category: "Information Technology",
      description: "A test software developer role for verification purposes only. This role is responsible for writing, testing, and deploying code for software applications. The role requires strong analytical thinking, problem-solving abilities, and attention to detail. Software developers need to be proficient in one or more programming languages and understand software development methodologies.",
      averageSalary: "$80,000 - $120,000",
      demandOutlook: "high growth",
      educationRequirements: [
        "Bachelor's degree in Computer Science or related field",
        "Relevant certifications (e.g., AWS Developer)"
      ],
      experienceRequirements: [
        "2+ years of software development experience",
        "Experience with modern programming languages"
      ],
      skillRequirements: [],
      careerPath: {
        previous: [],
        next: []
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save the role to the database
    const savedRole = await RoleModel.findOneAndUpdate(
      { id: testRole.id },
      testRole,
      { upsert: true, new: true }
    );
    
    console.log('Test role added successfully:');
    console.log(JSON.stringify(savedRole, null, 2));
    
    return savedRole;
  } catch (error) {
    console.error('Error adding test role:', error);
    throw error;
  }
}

// Run the function
addTestRole()
  .then(() => {
    console.log('Test role creation completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in test role creation:', error);
    process.exit(1);
  });