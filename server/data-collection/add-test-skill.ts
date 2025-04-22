/**
 * Script to add a test skill to the database
 * Run with: npx tsx server/data-collection/add-test-skill.ts
 */

import dotenv from 'dotenv';
import { connectToDatabase } from '../db/mongodb';
import { SkillModel } from '../db/models';

// Initialize environment variables
dotenv.config();

async function addTestSkill() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    const testSkill = {
      id: 999,
      name: "Test Skill",
      category: "Technical",
      description: "This is a test skill for verification purposes only.",
      demandTrend: "increasing",
      futureRelevance: "This skill will remain relevant for testing purposes.",
      learningDifficulty: "low",
      relatedSkills: [],
      prerequisites: [],
      levelingCriteria: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save the skill to the database
    const savedSkill = await SkillModel.findOneAndUpdate(
      { id: testSkill.id },
      testSkill,
      { upsert: true, new: true }
    );
    
    console.log('Test skill added successfully:');
    console.log(JSON.stringify(savedSkill, null, 2));
    
    return savedSkill;
  } catch (error) {
    console.error('Error adding test skill:', error);
    throw error;
  }
}

// Run the function
addTestSkill()
  .then(() => {
    console.log('Test skill creation completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in test skill creation:', error);
    process.exit(1);
  });