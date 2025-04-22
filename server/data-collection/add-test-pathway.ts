/**
 * Script to add a test career pathway to the database
 * Run with: npx tsx server/data-collection/add-test-pathway.ts
 */

import dotenv from 'dotenv';
import { connectToDatabase } from '../db/mongodb';
import { 
  CareerPathwayModel, 
  RoleModel, 
  SkillModel 
} from '../db/models';

// Initialize environment variables
dotenv.config();

async function addTestPathway() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get test role and skill
    const role = await RoleModel.findOne({ id: 999 });
    const skill = await SkillModel.findOne({ id: 999 });
    
    if (!role || !skill) {
      console.error('Missing test entities:');
      console.log(`Role exists: ${!!role}`);
      console.log(`Skill exists: ${!!skill}`);
      return;
    }
    
    // Create a hypothetical senior role
    const seniorRoleId = 1000;
    
    // Create a test career pathway
    const testPathway = {
      id: 999,
      name: `From ${role.title} to Senior ${role.title}`,
      description: `A career pathway showing progression from ${role.title} to Senior ${role.title} position.`,
      startingRoleId: role.id,
      targetRoleId: seniorRoleId,
      estimatedTimeYears: 3,
      steps: [
        {
          step: 1,
          roleId: role.id,
          timeframe: "1-2 years",
          description: `Build foundational experience as a ${role.title}`,
          requiredSkills: [skill.id]
        },
        {
          step: 2,
          roleId: seniorRoleId,
          timeframe: "2-3 years",
          description: `Advance to the Senior ${role.title} position`,
          requiredSkills: [skill.id]
        }
      ]
    };
    
    // Save to database
    const savedPathway = await CareerPathwayModel.findOneAndUpdate(
      { id: testPathway.id },
      testPathway,
      { upsert: true, new: true }
    );
    
    console.log('Test career pathway added successfully:');
    console.log(JSON.stringify(savedPathway, null, 2));
    
    return savedPathway;
  } catch (error) {
    console.error('Error adding test career pathway:', error);
    throw error;
  }
}

// Run the function
addTestPathway()
  .then(() => {
    console.log('Test career pathway creation completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in test career pathway creation:', error);
    process.exit(1);
  });