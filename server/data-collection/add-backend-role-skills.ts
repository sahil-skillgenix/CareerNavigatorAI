/**
 * Script to add role-skill relationships for the Backend Developer role
 * Run with: npx tsx server/data-collection/add-backend-role-skills.ts
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

async function addBackendRoleSkillRelationships() {
  try {
    console.log('Adding role-skill relationships for the Backend Developer role...');
    
    // Connect to the database
    await connectToDatabase();
    
    // Backend Developer role
    const backendRole = await RoleModel.findOne({ title: "Backend Developer" });
    if (!backendRole) {
      console.log('Backend Developer role not found.');
      return;
    }
    
    console.log(`Found Backend Developer role with ID ${backendRole.id}`);
    
    // Find required skills
    const nodeSkill = await SkillModel.findOne({ name: "Node.js Backend Development" });
    const dbSkill = await SkillModel.findOne({ name: "Database Management" });
    const jsSkill = await SkillModel.findOne({ name: "JavaScript Programming" });
    
    console.log('Creating Backend Developer role-skill relationships...');
    const relationships = [];
    
    // Backend Developer relationships
    if (nodeSkill) {
      console.log(`Found Node.js skill with ID ${nodeSkill.id}`);
      relationships.push({
        roleId: backendRole.id,
        skillId: nodeSkill.id,
        importance: "critical",
        levelRequired: 4,
        context: "Node.js is critical for Backend Developer at level 4."
      });
    }
    
    if (dbSkill) {
      console.log(`Found Database Management skill with ID ${dbSkill.id}`);
      relationships.push({
        roleId: backendRole.id,
        skillId: dbSkill.id,
        importance: "critical", 
        levelRequired: 3,
        context: "Database Management is critical for Backend Developer at level 3."
      });
    }
    
    if (jsSkill) {
      console.log(`Found JavaScript skill with ID ${jsSkill.id}`);
      relationships.push({
        roleId: backendRole.id,
        skillId: jsSkill.id,
        importance: "important",
        levelRequired: 3,
        context: "JavaScript is important for Backend Developer at level 3."
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
    
    console.log(`Created ${relationships.length} role-skill relationships for the Backend Developer role.`);
    return relationships.length;
  } catch (error) {
    console.error('Error adding Backend Developer role-skill relationships:', error);
    throw error;
  }
}

// Run the function
addBackendRoleSkillRelationships()
  .then((count) => {
    console.log(`Backend Developer role-skill relationship creation completed. Created ${count} relationships.`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in Backend Developer role-skill relationship creation:', error);
    process.exit(1);
  });