/**
 * Script to add skill prerequisites to test the skill acquisition pathway
 * Run with: npx tsx server/data-collection/add-skill-prerequisites.ts
 */

import dotenv from 'dotenv';
import { connectToDatabase } from '../db/mongodb';
import { 
  SkillModel, 
  SkillPrerequisiteModel
} from '../db/models';

// Initialize environment variables
dotenv.config();

async function addSkillPrerequisites() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get our test skill
    const testSkill = await SkillModel.findOne({ id: 999 });
    if (!testSkill) {
      console.error('Test skill not found');
      return;
    }
    
    console.log(`Found test skill: ${testSkill.name} (ID: ${testSkill.id})`);
    
    // Create two prerequisite skills
    const prerequisiteSkills = [
      {
        id: 1001,
        name: "Basic Programming",
        category: "Technical",
        description: "Understanding of basic programming concepts such as variables, control structures, functions, and data types.",
        demandTrend: "stable",
        futureRelevance: "Basic programming is a foundational skill that will remain relevant across all technical domains.",
        learningDifficulty: "low"
      },
      {
        id: 1002,
        name: "Computer Science Fundamentals",
        category: "Technical",
        description: "Understanding of fundamental computer science concepts including data structures, algorithms, and computational thinking.",
        demandTrend: "stable",
        futureRelevance: "Computer science fundamentals provide the theoretical basis for all technology development.",
        learningDifficulty: "medium"
      }
    ];
    
    // Save prerequisite skills to database
    for (const skillData of prerequisiteSkills) {
      await SkillModel.findOneAndUpdate(
        { id: skillData.id },
        {
          ...skillData,
          relatedSkills: [],
          prerequisites: [],
          levelingCriteria: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        { upsert: true, new: true }
      );
      console.log(`Created/updated prerequisite skill: ${skillData.name}`);
    }
    
    // Create skill prerequisite relationships
    for (const prerequisiteSkill of prerequisiteSkills) {
      // Create the relationship
      const prerequisite = await SkillPrerequisiteModel.findOneAndUpdate(
        { 
          skillId: testSkill.id, 
          prerequisiteId: prerequisiteSkill.id 
        },
        { 
          skillId: testSkill.id, 
          prerequisiteId: prerequisiteSkill.id,
          importance: "critical",
          description: `${prerequisiteSkill.name} is a critical prerequisite for ${testSkill.name}.`,
          acquisitionOrder: prerequisiteSkill.id === 1001 ? 1 : 2 // Basic Programming comes first
        },
        { upsert: true, new: true }
      );
      
      console.log(`Created skill prerequisite relationship: ${prerequisiteSkill.name} -> ${testSkill.name}`);
      console.log(JSON.stringify(prerequisite, null, 2));
    }
    
    console.log('All skill prerequisites created successfully!');
    
  } catch (error) {
    console.error('Error creating skill prerequisites:', error);
    throw error;
  }
}

// Run the function
addSkillPrerequisites()
  .then(() => {
    console.log('Skill prerequisites creation completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in skill prerequisites creation:', error);
    process.exit(1);
  });