/**
 * Script to create role-skill relationships for skill gap analysis
 * Run with: npx tsx server/data-collection/create-role-skill-relationships.ts
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

async function createRoleSkillRelationships() {
  try {
    console.log('Creating role-skill relationships for skill gap analysis...');
    
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
    const csSkill = await SkillModel.findOne({ id: 1002 }); // Computer Science Fundamentals
    if (!csSkill) {
      console.log('Computer Science Fundamentals skill not found.');
      return;
    }
    
    // Find frontend, backend, and fullstack roles
    const frontendRole = await RoleModel.findOne({ title: "Frontend Developer" });
    const backendRole = await RoleModel.findOne({ title: "Backend Developer" });
    const fullstackRole = await RoleModel.findOne({ title: "Full Stack Developer" });
    
    // Find JavaScript, React, Node.js, and Database skills
    const jsSkill = await SkillModel.findOne({ name: "JavaScript Programming" });
    const reactSkill = await SkillModel.findOne({ name: "React Development" });
    const nodeSkill = await SkillModel.findOne({ name: "Node.js Backend Development" });
    const dbSkill = await SkillModel.findOne({ name: "Database Management" });
    
    console.log('Creating role-skill relationships...');
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
    
    relationships.push({
      roleId: testRole.id,
      skillId: csSkill.id,
      importance: "helpful",
      levelRequired: 2,
      context: "Computer Science Fundamentals is helpful for test role at level 2."
    });
    
    // Frontend Developer relationships
    if (frontendRole && jsSkill && reactSkill) {
      relationships.push({
        roleId: frontendRole.id,
        skillId: jsSkill.id,
        importance: "critical",
        levelRequired: 4,
        context: "JavaScript is critical for Frontend Developer at level 4."
      });
      
      relationships.push({
        roleId: frontendRole.id,
        skillId: reactSkill.id,
        importance: "critical",
        levelRequired: 4,
        context: "React is critical for Frontend Developer at level 4."
      });
    }
    
    // Backend Developer relationships
    if (backendRole && nodeSkill && dbSkill && jsSkill) {
      relationships.push({
        roleId: backendRole.id,
        skillId: nodeSkill.id,
        importance: "critical",
        levelRequired: 4,
        context: "Node.js is critical for Backend Developer at level 4."
      });
      
      relationships.push({
        roleId: backendRole.id,
        skillId: dbSkill.id,
        importance: "critical",
        levelRequired: 3,
        context: "Database Management is critical for Backend Developer at level 3."
      });
      
      relationships.push({
        roleId: backendRole.id,
        skillId: jsSkill.id,
        importance: "important",
        levelRequired: 3,
        context: "JavaScript is important for Backend Developer at level 3."
      });
    }
    
    // Full Stack Developer relationships
    if (fullstackRole && jsSkill && reactSkill && nodeSkill && dbSkill) {
      relationships.push({
        roleId: fullstackRole.id,
        skillId: jsSkill.id,
        importance: "critical",
        levelRequired: 4,
        context: "JavaScript is critical for Full Stack Developer at level 4."
      });
      
      relationships.push({
        roleId: fullstackRole.id,
        skillId: reactSkill.id,
        importance: "critical",
        levelRequired: 3,
        context: "React is critical for Full Stack Developer at level 3."
      });
      
      relationships.push({
        roleId: fullstackRole.id,
        skillId: nodeSkill.id,
        importance: "critical",
        levelRequired: 3,
        context: "Node.js is critical for Full Stack Developer at level 3."
      });
      
      relationships.push({
        roleId: fullstackRole.id,
        skillId: dbSkill.id,
        importance: "important",
        levelRequired: 3,
        context: "Database Management is important for Full Stack Developer at level 3."
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
    
    console.log(`Created ${relationships.length} role-skill relationships.`);
    return relationships.length;
  } catch (error) {
    console.error('Error creating role-skill relationships:', error);
    throw error;
  }
}

// Run the function
createRoleSkillRelationships()
  .then((count) => {
    console.log(`Role-skill relationship creation completed. Created ${count} relationships.`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in role-skill relationship creation:', error);
    process.exit(1);
  });