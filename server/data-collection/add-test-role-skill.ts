/**
 * Script to add role-skill relationships for the test role
 * This is a simplified version focused only on the test role
 * Run with: npx tsx server/data-collection/add-test-role-skill.ts
 */

import dotenv from 'dotenv';
import { connectToDatabase } from '../db/mongodb';
import { 
  RoleModel,
  SkillModel,
  RoleSkillModel
} from '../db/models';

// Initialize environment variables
dotenv.config();

async function addTestRoleSkillRelationships() {
  try {
    console.log('Adding role-skill relationships for the test role...');
    
    // Connect to the database
    await connectToDatabase();
    
    // Test role
    const testRole = await RoleModel.findOne({ id: 999 }); // Test Software Developer
    if (!testRole) {
      console.log('Test role not found. Please run add-test-role.ts first.');
      return;
    }
    
    // Test skill
    const testSkill = await SkillModel.findOne({ id: 999 }); // Test Skill
    if (!testSkill) {
      console.log('Test skill not found. Please run add-test-skill.ts first.');
      return;
    }
    
    // Basic Programming skill
    const basicProgrammingSkill = await SkillModel.findOne({ id: 1001 }); // Basic Programming
    if (!basicProgrammingSkill) {
      console.log('Basic Programming skill not found.');
      return;
    }
    
    // Computer Science Fundamentals skill
    const csSkill = await SkillModel.findOne({ name: "Computer Science Fundamentals" });
    if (!csSkill) {
      console.log('Computer Science Fundamentals skill not found.');
      return;
    }
    
    console.log('Creating test role-skill relationships...');
    const relationships = [];
    
    // Test role relationships
    relationships.push({
      roleId: testRole.id,
      skillId: testSkill.id,
      importance: "critical",
      levelRequired: 4,
      context: "Test skill is critical for test role at level 4."
    });
    
    relationships.push({
      roleId: testRole.id,
      skillId: basicProgrammingSkill.id,
      importance: "important",
      levelRequired: 3,
      context: "Basic Programming is important for test role at level 3."
    });
    
    if (csSkill) {
      relationships.push({
        roleId: testRole.id,
        skillId: csSkill.id,
        importance: "helpful",
        levelRequired: 2,
        context: "Computer Science Fundamentals is helpful for test role at level 2."
      });
    }
    
    // Save relationships to database
    for (const relationship of relationships) {
      await RoleSkillModel.findOneAndUpdate(
        { roleId: relationship.roleId, skillId: relationship.skillId },
        relationship,
        { upsert: true, new: true }
      );
    }
    
    console.log(`Created ${relationships.length} role-skill relationships for the test role.`);
    return relationships.length;
  } catch (error) {
    console.error('Error adding test role-skill relationships:', error);
    throw error;
  }
}

// Run the function
addTestRoleSkillRelationships()
  .then((count) => {
    console.log(`Test role-skill relationship creation completed. Created ${count} relationships.`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in test role-skill relationship creation:', error);
    process.exit(1);
  });