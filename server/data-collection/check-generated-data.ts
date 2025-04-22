/**
 * This script checks the data already generated in the MongoDB database.
 * It provides a summary of what's available without generating new data.
 * Run with: npx tsx server/data-collection/check-generated-data.ts
 */

import dotenv from 'dotenv';
import { connectToDatabase } from '../db/mongodb';
import { 
  SkillModel, 
  RoleModel, 
  IndustryModel,
  RoleSkillModel,
  RoleIndustryModel,
  SkillIndustryModel,
  SkillPrerequisiteModel,
  LearningResourceModel,
  CareerPathwayModel
} from '../db/models';

// Load environment variables
dotenv.config();

// Main function
async function checkGeneratedData() {
  try {
    console.log('Connecting to MongoDB...');
    await connectToDatabase();
    
    console.log('\n=== DATA GENERATION STATUS ===');
    
    // Check Skills
    const skillCount = await SkillModel.countDocuments();
    console.log(`\nSkills: ${skillCount} total`);
    if (skillCount > 0) {
      const skills = await SkillModel.find().limit(3);
      console.log('Sample skills:');
      skills.forEach(skill => {
        console.log(`- ${skill.name} (${skill.category}): ${skill.description?.substring(0, 50)}...`);
      });
    }
    
    // Check Roles
    const roleCount = await RoleModel.countDocuments();
    console.log(`\nRoles: ${roleCount} total`);
    if (roleCount > 0) {
      const roles = await RoleModel.find().limit(3);
      console.log('Sample roles:');
      roles.forEach(role => {
        console.log(`- ${role.title} (${role.category}): ${role.description?.substring(0, 50)}...`);
      });
    }
    
    // Check Industries
    const industryCount = await IndustryModel.countDocuments();
    console.log(`\nIndustries: ${industryCount} total`);
    if (industryCount > 0) {
      const industries = await IndustryModel.find().limit(3);
      console.log('Sample industries:');
      industries.forEach(industry => {
        console.log(`- ${industry.name} (${industry.category}): ${industry.description?.substring(0, 50)}...`);
      });
    }
    
    // Check Relationships
    const roleSkillCount = await RoleSkillModel.countDocuments();
    const roleIndustryCount = await RoleIndustryModel.countDocuments();
    const skillIndustryCount = await SkillIndustryModel.countDocuments();
    const skillPrereqCount = await SkillPrerequisiteModel.countDocuments();
    
    console.log('\nRelationships:');
    console.log(`- Role-Skill: ${roleSkillCount}`);
    console.log(`- Role-Industry: ${roleIndustryCount}`);
    console.log(`- Skill-Industry: ${skillIndustryCount}`);
    console.log(`- Skill-Prerequisite: ${skillPrereqCount}`);
    
    // Check Learning Resources
    const resourceCount = await LearningResourceModel.countDocuments();
    console.log(`\nLearning Resources: ${resourceCount} total`);
    
    // Check Career Pathways
    const pathwayCount = await CareerPathwayModel.countDocuments();
    console.log(`\nCareer Pathways: ${pathwayCount} total`);
    
    // Final assessment
    console.log('\n=== GENERATION SUMMARY ===');
    if (skillCount === 0 && roleCount === 0 && industryCount <= 1) {
      console.log('⚠️ Data generation not started or failed. No significant data found.');
    } else if (
      skillCount > 0 && roleCount > 0 && industryCount > 0 && 
      roleSkillCount > 0 && roleIndustryCount > 0 && skillIndustryCount > 0
    ) {
      console.log('✅ Data generation COMPLETE. All core data and relationships available.');
    } else {
      console.log('⏳ Data generation IN PROGRESS. Some data exists but generation is incomplete.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking generated data:', error);
    process.exit(1);
  }
}

// Run the function
checkGeneratedData();