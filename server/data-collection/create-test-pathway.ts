/**
 * Script to create a test career pathway
 * Run with: npx tsx server/data-collection/create-test-pathway.ts
 */

import dotenv from 'dotenv';
import { connectToDatabase } from '../db/mongodb';
import { 
  CareerPathwayModel
} from '../db/models';

// Initialize environment variables
dotenv.config();

async function createTestPathway() {
  try {
    console.log('Creating test career pathway...');
    
    // Connect to the database
    await connectToDatabase();
    
    // Create a simple career pathway
    const testPathway = {
      id: 10000,
      name: "Test Career Pathway",
      description: "A test career pathway for skill gap analysis",
      startingRoleId: 999, // Test Software Developer
      targetRoleId: 1000, // Senior Test Software Developer
      estimatedTimeYears: 3,
      steps: [
        {
          step: 1,
          roleId: 999, // Test Software Developer
          timeframe: "0-18 months",
          description: "Build foundational skills and experience",
          requiredSkills: [999, 1001] // Test Skill & Basic Programming
        },
        {
          step: 2,
          roleId: 1000, // Senior Test Software Developer
          timeframe: "18-36 months",
          description: "Advance to senior position",
          requiredSkills: [999, 1001, 1002] // Add Computer Science Fundamentals
        }
      ]
    };
    
    // Save to database
    await CareerPathwayModel.findOneAndUpdate(
      { id: testPathway.id },
      testPathway,
      { upsert: true, new: true }
    );
    
    console.log(`Created test career pathway with ID ${testPathway.id}.`);
    return testPathway;
  } catch (error) {
    console.error('Error creating test career pathway:', error);
    throw error;
  }
}

// Run the function
createTestPathway()
  .then(() => {
    console.log('Test career pathway created successfully.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in test career pathway creation:', error);
    process.exit(1);
  });