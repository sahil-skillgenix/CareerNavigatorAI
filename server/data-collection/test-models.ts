/**
 * This is a simple test script to verify MongoDB models are correctly set up.
 * Run with: npx tsx server/data-collection/test-models.ts
 */

import dotenv from 'dotenv';
import { connectToDatabase } from '../db/mongodb';
import { 
  SkillModel, 
  RoleModel, 
  IndustryModel,
  CareerPathwayModel 
} from '../db/models';

// Load environment variables
dotenv.config();

// Main test function
async function testModels() {
  try {
    console.log('Connecting to MongoDB...');
    await connectToDatabase();
    
    console.log('Testing model connections:');
    
    // Test Skill model
    console.log('Testing Skill model...');
    const skillCount = await SkillModel.countDocuments();
    console.log(`- Found ${skillCount} skills in the database`);
    
    // Test Role model
    console.log('Testing Role model...');
    const roleCount = await RoleModel.countDocuments();
    console.log(`- Found ${roleCount} roles in the database`);
    
    // Test Industry model
    console.log('Testing Industry model...');
    const industryCount = await IndustryModel.countDocuments();
    console.log(`- Found ${industryCount} industries in the database`);
    
    // Test CareerPathway model
    console.log('Testing CareerPathway model...');
    const pathwayCount = await CareerPathwayModel.countDocuments();
    console.log(`- Found ${pathwayCount} career pathways in the database`);
    
    // Create a simple test skill if none exist
    if (skillCount === 0) {
      console.log('Creating a test skill...');
      const testSkill = new SkillModel({
        id: 999,
        name: 'Test Skill',
        category: 'Technical',
        description: 'This is a test skill for verification purposes only.',
        demandTrend: 'increasing',
        futureRelevance: 'This skill will remain relevant for testing purposes.',
        learningDifficulty: 'low'
      });
      
      await testSkill.save();
      console.log('Test skill created successfully');
    }
    
    console.log('All model tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error testing models:', error);
    process.exit(1);
  }
}

// Run the test
testModels();