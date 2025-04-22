/**
 * Script to create test relationships between entities in the database
 * Run with: npx tsx server/data-collection/create-test-relationships.ts
 */

import dotenv from 'dotenv';
import { connectToDatabase } from '../db/mongodb';
import { 
  RoleModel, 
  SkillModel, 
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
    
    // Get the test entities
    const role = await RoleModel.findOne({ id: 999 });
    const skill = await SkillModel.findOne({ id: 999 });
    const industry = await IndustryModel.findOne({ id: 999 });
    
    if (!role || !skill || !industry) {
      console.error('Test entities not found. Please create test entities first.');
      return;
    }
    
    console.log(`Found test entities: Role ${role.title}, Skill ${skill.name}, Industry ${industry.name}`);
    
    // Create Role-Skill relationship
    const roleSkill = await RoleSkillModel.findOneAndUpdate(
      { roleId: role.id, skillId: skill.id },
      {
        roleId: role.id,
        skillId: skill.id,
        importance: 'critical',
        levelRequired: 3,
        context: `${skill.name} is critical for the role of ${role.title}.`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log('Role-Skill relationship created:');
    console.log(JSON.stringify(roleSkill, null, 2));
    
    // Create Role-Industry relationship
    const roleIndustry = await RoleIndustryModel.findOneAndUpdate(
      { roleId: role.id, industryId: industry.id },
      {
        roleId: role.id,
        industryId: industry.id,
        prevalence: 'high',
        context: `The role of ${role.title} is highly prevalent in the ${industry.name} industry.`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log('Role-Industry relationship created:');
    console.log(JSON.stringify(roleIndustry, null, 2));
    
    // Create Skill-Industry relationship
    const skillIndustry = await SkillIndustryModel.findOneAndUpdate(
      { skillId: skill.id, industryId: industry.id },
      {
        skillId: skill.id,
        industryId: industry.id,
        importance: 'high',
        trendDirection: 'increasing',
        context: `${skill.name} is increasingly important in the ${industry.name} industry.`,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log('Skill-Industry relationship created:');
    console.log(JSON.stringify(skillIndustry, null, 2));
    
    // Create a learning resource for the skill
    const learningResource = await LearningResourceModel.findOneAndUpdate(
      { id: 'res-999-test' },
      {
        id: 'res-999-test',
        title: `Learn ${skill.name} - Course`,
        skillId: skill.id,
        type: 'course',
        provider: 'Skillgenix Academy',
        url: `https://skillgenix.com/courses/${skill.id}`,
        description: `A comprehensive course on ${skill.name} designed for all skill levels.`,
        estimatedHours: 10,
        difficulty: 'intermediate',
        costType: 'free',
        cost: '0',
        tags: [skill.category, 'intermediate', skill.name.toLowerCase()],
        relevanceScore: 9,
        matchReason: `This course is designed to help you master ${skill.name}.`,
        rating: 4.5,
        reviewCount: 25,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      { upsert: true, new: true }
    );
    
    console.log('Learning resource created:');
    console.log(JSON.stringify(learningResource, null, 2));
    
    console.log('All test relationships created successfully.');
    
  } catch (error) {
    console.error('Error creating test relationships:', error);
    throw error;
  }
}

// Run the function
createTestRelationships()
  .then(() => {
    console.log('Test relationships creation completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in test relationships creation:', error);
    process.exit(1);
  });