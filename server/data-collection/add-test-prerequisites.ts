/**
 * Script to add test prerequisites for skills
 * Run with: npx tsx server/data-collection/add-test-prerequisites.ts
 */

import dotenv from 'dotenv';
import { connectToDatabase } from '../db/mongodb';
import { 
  SkillModel,
  SkillPrerequisiteModel
} from '../db/models';

// Initialize environment variables
dotenv.config();

async function addTestPrerequisites() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get test skill
    const testSkill = await SkillModel.findOne({ id: 999 });
    
    if (!testSkill) {
      console.error('Missing test skill!');
      return;
    }
    
    console.log(`Adding prerequisites for skill: ${testSkill.name} (ID: ${testSkill.id})`);
    
    // Create prerequisite skills if they don't exist
    const prerequisite1 = await SkillModel.findOneAndUpdate(
      { id: 1001 },
      {
        id: 1001,
        name: "Basic Programming",
        category: "Technical",
        description: "Fundamental understanding of programming concepts including variables, control structures, functions, and basic data structures.",
        demandTrend: "stable",
        futureRelevance: "Basic programming will remain a foundational skill for all technical roles.",
        learningDifficulty: "low",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    const prerequisite2 = await SkillModel.findOneAndUpdate(
      { id: 1002 },
      {
        id: 1002,
        name: "Computer Science Fundamentals",
        category: "Technical",
        description: "Core computer science concepts including algorithms, data structures, and computational thinking.",
        demandTrend: "stable",
        futureRelevance: "Computer science fundamentals will remain essential for technical roles.",
        learningDifficulty: "medium",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log(`Created/updated prerequisite skills:`);
    console.log(`- ${prerequisite1.name} (ID: ${prerequisite1.id})`);
    console.log(`- ${prerequisite2.name} (ID: ${prerequisite2.id})`);
    
    // Create prerequisite relationships
    const prerequisiteRel1 = await SkillPrerequisiteModel.findOneAndUpdate(
      { skillId: testSkill.id, prerequisiteId: prerequisite1.id },
      {
        skillId: testSkill.id,
        prerequisiteId: prerequisite1.id,
        importance: "critical",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    const prerequisiteRel2 = await SkillPrerequisiteModel.findOneAndUpdate(
      { skillId: testSkill.id, prerequisiteId: prerequisite2.id },
      {
        skillId: testSkill.id,
        prerequisiteId: prerequisite2.id,
        importance: "critical",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log(`Created/updated prerequisite relationships:`);
    console.log(`- ${testSkill.name} requires ${prerequisite1.name} (Importance: ${prerequisiteRel1.importance})`);
    console.log(`- ${testSkill.name} requires ${prerequisite2.name} (Importance: ${prerequisiteRel2.importance})`);
    
    return [prerequisiteRel1, prerequisiteRel2];
  } catch (error) {
    console.error('Error adding test prerequisites:', error);
    throw error;
  }
}

// Run the function
addTestPrerequisites()
  .then(() => {
    console.log('Test prerequisites creation completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in test prerequisites creation:', error);
    process.exit(1);
  });