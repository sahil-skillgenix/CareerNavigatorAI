/**
 * Script to create relationships between test entities
 * Run with: npx tsx server/data-collection/create-test-relationships.ts
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
  LearningResourceModel
} from '../db/models';

// Initialize environment variables
dotenv.config();

async function createTestRelationships() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get our test entities
    const skill = await SkillModel.findOne({ id: 999 });
    const role = await RoleModel.findOne({ id: 999 });
    const industry = await IndustryModel.findOne({ name: "Information Technology" });
    
    if (!skill || !role || !industry) {
      console.error('Missing test entities:');
      console.log(`Skill exists: ${!!skill}`);
      console.log(`Role exists: ${!!role}`);
      console.log(`Industry exists: ${!!industry}`);
      return;
    }
    
    console.log('Found all test entities:');
    console.log(`Skill: ${skill.name} (ID: ${skill.id})`);
    console.log(`Role: ${role.title} (ID: ${role.id})`);
    console.log(`Industry: ${industry.name} (ID: ${industry.id || 'undefined'})`);
    
    // Create industry ID if it doesn't exist
    if (!industry.id) {
      industry.id = 999;
      await industry.save();
      console.log(`Updated industry with ID: ${industry.id}`);
    }
    
    // 1. Create Role-Skill relationship
    const roleSkill = await RoleSkillModel.findOneAndUpdate(
      { roleId: role.id, skillId: skill.id },
      { 
        roleId: role.id, 
        skillId: skill.id, 
        importance: 'critical', 
        levelRequired: 3,
        context: `${skill.name} is critical for the role of ${role.title}.` 
      },
      { upsert: true, new: true }
    );
    
    console.log('Created Role-Skill relationship:');
    console.log(JSON.stringify(roleSkill, null, 2));
    
    // 2. Create Role-Industry relationship
    const roleIndustry = await RoleIndustryModel.findOneAndUpdate(
      { roleId: role.id, industryId: industry.id },
      { 
        roleId: role.id, 
        industryId: industry.id, 
        prevalence: 'high',
        notes: `${role.title} has high prevalence in the ${industry.name} industry.`,
        specializations: `${role.title} in ${industry.name}`
      },
      { upsert: true, new: true }
    );
    
    console.log('Created Role-Industry relationship:');
    console.log(JSON.stringify(roleIndustry, null, 2));
    
    // 3. Create Skill-Industry relationship
    const skillIndustry = await SkillIndustryModel.findOneAndUpdate(
      { skillId: skill.id, industryId: industry.id },
      { 
        skillId: skill.id, 
        industryId: industry.id, 
        importance: 'critical',
        trendDirection: 'increasing',
        contextualApplication: `${skill.name} is critical in ${industry.name} with an increasing demand trend.`
      },
      { upsert: true, new: true }
    );
    
    console.log('Created Skill-Industry relationship:');
    console.log(JSON.stringify(skillIndustry, null, 2));
    
    // 4. Create a learning resource for the skill
    const resourceId = `res-${skill.id}-test`;
    const learningResource = await LearningResourceModel.findOneAndUpdate(
      { id: resourceId },
      {
        id: resourceId,
        title: `Learn ${skill.name} - Course`,
        type: 'course',
        provider: 'Skillgenix Academy',
        url: `https://skillgenix.com/courses/${skill.id}`,
        description: `A comprehensive course on ${skill.name} designed for all skill levels.`,
        skillId: skill.id,
        difficulty: 'intermediate',
        estimatedHours: 10,
        costType: 'free',
        cost: '0',
        tags: [skill.category, 'intermediate', skill.name.toLowerCase()],
        rating: 4.5,
        reviewCount: 25,
        relevanceScore: 9,
        matchReason: `This course is designed to help you master ${skill.name}.`
      },
      { upsert: true, new: true }
    );
    
    console.log('Created Learning Resource:');
    console.log(JSON.stringify(learningResource, null, 2));
    
    console.log('\nAll test relationships created successfully!');
    
  } catch (error) {
    console.error('Error creating test relationships:', error);
  }
}

// Run the function
createTestRelationships()
  .then(() => {
    console.log('Test relationship creation completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in test relationship creation:', error);
    process.exit(1);
  });