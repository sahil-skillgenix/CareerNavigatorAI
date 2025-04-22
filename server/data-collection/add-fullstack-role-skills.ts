/**
 * Script to add role-skill relationships for the Full Stack Developer role
 * Run with: npx tsx server/data-collection/add-fullstack-role-skills.ts
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

async function addFullstackRoleSkillRelationships() {
  try {
    console.log('Adding role-skill relationships for the Full Stack Developer role...');
    
    // Connect to the database
    await connectToDatabase();
    
    // Full Stack Developer role
    const fullstackRole = await RoleModel.findOne({ title: "Full Stack Developer" });
    if (!fullstackRole) {
      console.log('Full Stack Developer role not found.');
      return;
    }
    
    console.log(`Found Full Stack Developer role with ID ${fullstackRole.id}`);
    
    // Find required skills
    const jsSkill = await SkillModel.findOne({ name: "JavaScript Programming" });
    const reactSkill = await SkillModel.findOne({ name: "React Development" });
    const nodeSkill = await SkillModel.findOne({ name: "Node.js Backend Development" });
    const dbSkill = await SkillModel.findOne({ name: "Database Management" });
    
    console.log('Creating Full Stack Developer role-skill relationships...');
    const relationships = [];
    
    // Full Stack Developer relationships
    if (jsSkill) {
      console.log(`Found JavaScript skill with ID ${jsSkill.id}`);
      relationships.push({
        roleId: fullstackRole.id,
        skillId: jsSkill.id,
        importance: "critical",
        levelRequired: 4,
        context: "JavaScript is critical for Full Stack Developer at level 4."
      });
    }
    
    if (reactSkill) {
      console.log(`Found React skill with ID ${reactSkill.id}`);
      relationships.push({
        roleId: fullstackRole.id,
        skillId: reactSkill.id,
        importance: "critical", 
        levelRequired: 3,
        context: "React is critical for Full Stack Developer at level 3."
      });
    }
    
    if (nodeSkill) {
      console.log(`Found Node.js skill with ID ${nodeSkill.id}`);
      relationships.push({
        roleId: fullstackRole.id,
        skillId: nodeSkill.id,
        importance: "critical",
        levelRequired: 3,
        context: "Node.js is critical for Full Stack Developer at level 3."
      });
    }
    
    if (dbSkill) {
      console.log(`Found Database Management skill with ID ${dbSkill.id}`);
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
    
    console.log(`Created ${relationships.length} role-skill relationships for the Full Stack Developer role.`);
    return relationships.length;
  } catch (error) {
    console.error('Error adding Full Stack Developer role-skill relationships:', error);
    throw error;
  }
}

// Run the function
addFullstackRoleSkillRelationships()
  .then((count) => {
    console.log(`Full Stack Developer role-skill relationship creation completed. Created ${count} relationships.`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in Full Stack Developer role-skill relationship creation:', error);
    process.exit(1);
  });