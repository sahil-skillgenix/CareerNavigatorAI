/**
 * Script to check existing data in the database
 * Run with: npx tsx server/data-collection/check-existing-data.ts
 */

import dotenv from 'dotenv';
import { connectToDatabase } from '../db/mongodb';
import { 
  SkillModel, 
  RoleModel, 
  IndustryModel,
  RoleSkillModel,
  SkillPrerequisiteModel,
  CareerPathwayModel
} from '../db/models';

// Initialize environment variables
dotenv.config();

async function checkExistingData() {
  try {
    console.log('Checking existing data in the database...');
    
    // Connect to the database
    await connectToDatabase();
    
    // Check skills
    const skills = await SkillModel.find({}).sort({ id: 1 });
    console.log(`Found ${skills.length} skills in the database.`);
    console.log('Sample skills:');
    skills.slice(0, 5).forEach(skill => {
      console.log(`  - ${skill.name} (ID: ${skill.id}), Category: ${skill.category}`);
    });
    
    // Check roles
    const roles = await RoleModel.find({}).sort({ id: 1 });
    console.log(`\nFound ${roles.length} roles in the database.`);
    console.log('Sample roles:');
    roles.slice(0, 5).forEach(role => {
      console.log(`  - ${role.title} (ID: ${role.id}), Category: ${role.category}`);
    });
    
    // Check industries
    const industries = await IndustryModel.find({}).sort({ id: 1 });
    console.log(`\nFound ${industries.length} industries in the database.`);
    console.log('Sample industries:');
    industries.slice(0, 5).forEach(industry => {
      console.log(`  - ${industry.name} (ID: ${industry.id}), Category: ${industry.category}`);
    });
    
    // Check role-skill relationships
    const roleSkills = await RoleSkillModel.find({});
    console.log(`\nFound ${roleSkills.length} role-skill relationships in the database.`);
    
    // Check skill prerequisites
    const skillPrerequisites = await SkillPrerequisiteModel.find({});
    console.log(`Found ${skillPrerequisites.length} skill prerequisites in the database.`);
    
    // Check career pathways
    const careerPathways = await CareerPathwayModel.find({});
    console.log(`Found ${careerPathways.length} career pathways in the database.`);
    
    return {
      skills: skills.length,
      roles: roles.length,
      industries: industries.length,
      roleSkills: roleSkills.length,
      skillPrerequisites: skillPrerequisites.length,
      careerPathways: careerPathways.length
    };
  } catch (error) {
    console.error('Error checking existing data:', error);
    throw error;
  }
}

// Run the function
checkExistingData()
  .then(stats => {
    console.log('\nSummary of existing data:');
    console.table(stats);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in data check:', error);
    process.exit(1);
  });