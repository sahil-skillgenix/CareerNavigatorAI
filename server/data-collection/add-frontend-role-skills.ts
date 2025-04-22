/**
 * Script to add role-skill relationships for the Frontend Developer role
 * Run with: npx tsx server/data-collection/add-frontend-role-skills.ts
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

async function addFrontendRoleSkillRelationships() {
  try {
    console.log('Adding role-skill relationships for the Frontend Developer role...');
    
    // Connect to the database
    await connectToDatabase();
    
    // Frontend Developer role
    const frontendRole = await RoleModel.findOne({ title: "Frontend Developer" });
    if (!frontendRole) {
      console.log('Frontend Developer role not found.');
      return;
    }
    
    console.log(`Found Frontend Developer role with ID ${frontendRole.id}`);
    
    // Find required skills
    const jsSkill = await SkillModel.findOne({ name: "JavaScript Programming" });
    const reactSkill = await SkillModel.findOne({ name: "React Development" });
    const htmlCssSkill = await SkillModel.findOne({ name: /HTML|CSS/i });
    
    console.log('Creating Frontend Developer role-skill relationships...');
    const relationships = [];
    
    // Frontend Developer relationships
    if (jsSkill) {
      console.log(`Found JavaScript skill with ID ${jsSkill.id}`);
      relationships.push({
        roleId: frontendRole.id,
        skillId: jsSkill.id,
        importance: "critical",
        levelRequired: 4,
        context: "JavaScript is critical for Frontend Developer at level 4."
      });
    }
    
    if (reactSkill) {
      console.log(`Found React skill with ID ${reactSkill.id}`);
      relationships.push({
        roleId: frontendRole.id,
        skillId: reactSkill.id,
        importance: "critical",
        levelRequired: 4,
        context: "React is critical for Frontend Developer at level 4."
      });
    }
    
    if (htmlCssSkill) {
      console.log(`Found HTML/CSS skill with ID ${htmlCssSkill.id}`);
      relationships.push({
        roleId: frontendRole.id,
        skillId: htmlCssSkill.id,
        importance: "critical",
        levelRequired: 3,
        context: "HTML/CSS is critical for Frontend Developer at level 3."
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
    
    console.log(`Created ${relationships.length} role-skill relationships for the Frontend Developer role.`);
    return relationships.length;
  } catch (error) {
    console.error('Error adding Frontend Developer role-skill relationships:', error);
    throw error;
  }
}

// Run the function
addFrontendRoleSkillRelationships()
  .then((count) => {
    console.log(`Frontend Developer role-skill relationship creation completed. Created ${count} relationships.`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in Frontend Developer role-skill relationship creation:', error);
    process.exit(1);
  });