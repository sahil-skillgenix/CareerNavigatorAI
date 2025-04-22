/**
 * Script to check what data has been generated in the database
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

// Initialize environment variables
dotenv.config();

async function checkDatabaseContent() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Count all model entries
    const skillCount = await SkillModel.countDocuments();
    const roleCount = await RoleModel.countDocuments();
    const industryCount = await IndustryModel.countDocuments();
    const roleSkillCount = await RoleSkillModel.countDocuments();
    const roleIndustryCount = await RoleIndustryModel.countDocuments();
    const skillIndustryCount = await SkillIndustryModel.countDocuments();
    const skillPrerequisiteCount = await SkillPrerequisiteModel.countDocuments();
    const learningResourceCount = await LearningResourceModel.countDocuments();
    const pathwayCount = await CareerPathwayModel.countDocuments();
    
    console.log('=== DATABASE CONTENT SUMMARY ===');
    console.log(`Skills: ${skillCount}`);
    console.log(`Roles: ${roleCount}`);
    console.log(`Industries: ${industryCount}`);
    console.log(`Role-Skill relationships: ${roleSkillCount}`);
    console.log(`Role-Industry relationships: ${roleIndustryCount}`);
    console.log(`Skill-Industry relationships: ${skillIndustryCount}`);
    console.log(`Skill prerequisites: ${skillPrerequisiteCount}`);
    console.log(`Learning resources: ${learningResourceCount}`);
    console.log(`Career pathways: ${pathwayCount}`);
    
    // Sample a few records if available
    if (skillCount > 0) {
      const sampleSkill = await SkillModel.findOne();
      console.log('\n=== SAMPLE SKILL ===');
      console.log(JSON.stringify(sampleSkill, null, 2));
    }
    
    if (roleCount > 0) {
      const sampleRole = await RoleModel.findOne();
      console.log('\n=== SAMPLE ROLE ===');
      console.log(JSON.stringify(sampleRole, null, 2));
    }
    
    if (industryCount > 0) {
      const sampleIndustry = await IndustryModel.findOne();
      console.log('\n=== SAMPLE INDUSTRY ===');
      console.log(JSON.stringify(sampleIndustry, null, 2));
    }
    
    if (roleSkillCount > 0) {
      const sampleRoleSkill = await RoleSkillModel.findOne();
      console.log('\n=== SAMPLE ROLE-SKILL RELATIONSHIP ===');
      console.log(JSON.stringify(sampleRoleSkill, null, 2));
    }
    
    if (learningResourceCount > 0) {
      const sampleResource = await LearningResourceModel.findOne();
      console.log('\n=== SAMPLE LEARNING RESOURCE ===');
      console.log(JSON.stringify(sampleResource, null, 2));
    }
    
  } catch (error) {
    console.error('Error checking database content:', error);
  }
}

// Run the function
checkDatabaseContent()
  .then(() => {
    console.log('Database content check completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error checking database content:', error);
    process.exit(1);
  });