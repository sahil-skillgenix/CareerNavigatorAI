/**
 * Script to generate skill relationships for skill gap analysis
 * Run with: npx tsx server/data-collection/generate-skill-relationships.ts
 */

import dotenv from 'dotenv';
import { connectToDatabase } from '../db/mongodb';
import { 
  RoleSkillModel,
  SkillPrerequisiteModel
} from '../db/models';

// Initialize environment variables
dotenv.config();

// Starting IDs for our entities (using higher IDs to avoid conflicts)
const SKILL_ID_START = 3000;
const ROLE_ID_START = 3000;

/**
 * Generate skill relationships for skill gap analysis
 */
async function generateSkillRelationships() {
  try {
    console.log('Generating skill relationships for skill gap analysis...');
    
    // Connect to the database
    await connectToDatabase();
    
    // Create skill prerequisites
    console.log('Creating skill prerequisites...');
    const skillPrerequisites = [
      // React Development prerequisites
      { skillId: SKILL_ID_START + 1, prerequisiteId: SKILL_ID_START, importance: "critical" }, // React requires JavaScript
      
      // Node.js Backend Development prerequisites
      { skillId: SKILL_ID_START + 2, prerequisiteId: SKILL_ID_START, importance: "critical" }, // Node.js requires JavaScript
      { skillId: SKILL_ID_START + 2, prerequisiteId: SKILL_ID_START + 3, importance: "important" }, // Node.js benefits from Database Management
      
      // Machine Learning prerequisites
      { skillId: SKILL_ID_START + 5, prerequisiteId: SKILL_ID_START + 6, importance: "important" }, // ML benefits from Data Analysis
      
      // Data Visualization prerequisites
      { skillId: SKILL_ID_START + 8, prerequisiteId: SKILL_ID_START + 6, importance: "critical" }, // Data Viz requires Data Analysis
    ];
    
    for (const prerequisite of skillPrerequisites) {
      await SkillPrerequisiteModel.findOneAndUpdate(
        { skillId: prerequisite.skillId, prerequisiteId: prerequisite.prerequisiteId },
        prerequisite,
        { upsert: true, new: true }
      );
    }
    console.log(`Created ${skillPrerequisites.length} skill prerequisites.`);
    
    // Create role-skill relationships
    console.log('Creating role-skill relationships...');
    const roleSkillRelationships = [
      // Frontend Developer skills
      { roleId: ROLE_ID_START, skillId: SKILL_ID_START, importance: "critical", levelRequired: 4 }, // Frontend needs JavaScript (high level)
      { roleId: ROLE_ID_START, skillId: SKILL_ID_START + 1, importance: "critical", levelRequired: 4 }, // Frontend needs React (high level)
      
      // Backend Developer skills
      { roleId: ROLE_ID_START + 1, skillId: SKILL_ID_START, importance: "important", levelRequired: 3 }, // Backend needs JavaScript (medium level)
      { roleId: ROLE_ID_START + 1, skillId: SKILL_ID_START + 2, importance: "critical", levelRequired: 4 }, // Backend needs Node.js (high level)
      { roleId: ROLE_ID_START + 1, skillId: SKILL_ID_START + 3, importance: "critical", levelRequired: 3 }, // Backend needs Database Management
      
      // Full Stack Developer skills
      { roleId: ROLE_ID_START + 2, skillId: SKILL_ID_START, importance: "critical", levelRequired: 4 }, // Full stack needs JavaScript (high level)
      { roleId: ROLE_ID_START + 2, skillId: SKILL_ID_START + 1, importance: "critical", levelRequired: 3 }, // Full stack needs React
      { roleId: ROLE_ID_START + 2, skillId: SKILL_ID_START + 2, importance: "critical", levelRequired: 3 }, // Full stack needs Node.js
      { roleId: ROLE_ID_START + 2, skillId: SKILL_ID_START + 3, importance: "important", levelRequired: 3 }, // Full stack needs Database Management
      
      // Data Analyst skills
      { roleId: ROLE_ID_START + 3, skillId: SKILL_ID_START + 6, importance: "critical", levelRequired: 4 }, // Data Analyst needs Data Analysis
      { roleId: ROLE_ID_START + 3, skillId: SKILL_ID_START + 7, importance: "critical", levelRequired: 3 }, // Data Analyst needs SQL
      { roleId: ROLE_ID_START + 3, skillId: SKILL_ID_START + 8, importance: "critical", levelRequired: 3 }, // Data Analyst needs Data Visualization
      
      // Data Scientist skills
      { roleId: ROLE_ID_START + 4, skillId: SKILL_ID_START + 6, importance: "critical", levelRequired: 4 }, // Data Scientist needs Data Analysis
      { roleId: ROLE_ID_START + 4, skillId: SKILL_ID_START + 5, importance: "critical", levelRequired: 4 }, // Data Scientist needs Machine Learning
      { roleId: ROLE_ID_START + 4, skillId: SKILL_ID_START + 7, importance: "important", levelRequired: 3 }, // Data Scientist needs SQL
    ];
    
    for (const relationship of roleSkillRelationships) {
      await RoleSkillModel.findOneAndUpdate(
        { roleId: relationship.roleId, skillId: relationship.skillId },
        {
          ...relationship,
          context: `This skill is ${relationship.importance} for this role at level ${relationship.levelRequired}.`
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Created ${roleSkillRelationships.length} role-skill relationships.`);
    
    console.log('Skill relationship generation completed successfully!');
    return {
      skillPrerequisites: skillPrerequisites.length,
      roleSkillRelationships: roleSkillRelationships.length
    };
  } catch (error) {
    console.error('Error generating skill relationships:', error);
    throw error;
  }
}

// Run the function
generateSkillRelationships()
  .then((stats) => {
    console.log('Skill relationship generation completed with the following statistics:');
    console.table(stats);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in skill relationship generation:', error);
    process.exit(1);
  });