/**
 * Main orchestrator for data generation
 * This script coordinates all data generation in the right sequence
 * Run with: npx tsx server/data-collection/main-generator.ts
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

// Helper function to check if collection is empty
async function isCollectionEmpty(model: any): Promise<boolean> {
  return await model.countDocuments() === 0;
}

// Main function to orchestrate data generation
async function orchestrateDataGeneration() {
  try {
    console.log('Starting orchestrated data generation...');
    
    // Connect to the database
    await connectToDatabase();
    
    // Step 1: Check what we need to generate
    const needSkills = await isCollectionEmpty(SkillModel);
    const needRoles = await isCollectionEmpty(RoleModel);
    const needIndustries = await isCollectionEmpty(IndustryModel);
    const needRoleSkills = await isCollectionEmpty(RoleSkillModel);
    const needRoleIndustries = await isCollectionEmpty(RoleIndustryModel);
    const needSkillIndustries = await isCollectionEmpty(SkillIndustryModel);
    const needSkillPrerequisites = await isCollectionEmpty(SkillPrerequisiteModel);
    const needLearningResources = await isCollectionEmpty(LearningResourceModel);
    const needCareerPathways = await isCollectionEmpty(CareerPathwayModel);
    
    console.log('Database status:');
    console.log(`Skills: ${needSkills ? 'EMPTY' : 'EXISTS'}`);
    console.log(`Roles: ${needRoles ? 'EMPTY' : 'EXISTS'}`);
    console.log(`Industries: ${needIndustries ? 'EMPTY' : 'EXISTS'}`);
    console.log(`Role-Skill relationships: ${needRoleSkills ? 'EMPTY' : 'EXISTS'}`);
    console.log(`Role-Industry relationships: ${needRoleIndustries ? 'EMPTY' : 'EXISTS'}`);
    console.log(`Skill-Industry relationships: ${needSkillIndustries ? 'EMPTY' : 'EXISTS'}`);
    console.log(`Skill prerequisites: ${needSkillPrerequisites ? 'EMPTY' : 'EXISTS'}`);
    console.log(`Learning resources: ${needLearningResources ? 'EMPTY' : 'EXISTS'}`);
    console.log(`Career pathways: ${needCareerPathways ? 'EMPTY' : 'EXISTS'}`);
    
    // Step 2: Generate base test data if needed
    if (needSkills || needRoles || needIndustries) {
      console.log('\nGenerating test base entities...');
      
      if (needSkills) {
        console.log('Adding test skill...');
        await runScript('./add-test-skill.ts');
      }
      
      if (needRoles) {
        console.log('Adding test role...');
        await runScript('./add-test-role.ts');
      }
      
      if (needIndustries) {
        console.log('Adding test industry...');
        await runScript('./add-test-industry.ts');
      }
    }
    
    // Step 3: Generate relationships if needed
    if (needRoleSkills || needRoleIndustries || needSkillIndustries) {
      console.log('\nGenerating test relationships...');
      await runScript('./create-test-relationships.ts');
    }
    
    // Step 4: Generate skill prerequisites if needed
    if (needSkillPrerequisites) {
      console.log('\nGenerating skill prerequisites...');
      await runScript('./add-skill-prerequisites.ts');
    }
    
    // Step 5: Generate career pathways if needed
    if (needCareerPathways) {
      console.log('\nGenerating career pathways...');
      await runScript('./add-test-pathway.ts');
    }
    
    // Step 6: Check the results
    console.log('\nValidating generated data...');
    await runScript('./check-generated-data.ts');
    
    console.log('\nOrchestrated data generation completed successfully!');
    
  } catch (error) {
    console.error('Error in orchestrated data generation:', error);
    throw error;
  }
}

// Helper function to run a script
async function runScript(scriptPath: string): Promise<void> {
  try {
    console.log(`Running script: ${scriptPath}...`);
    const script = await import(scriptPath);
    if (typeof script.default === 'function') {
      await script.default();
    } else {
      // Look for a main function or similar
      const mainFunction = Object.values(script).find((fn) => typeof fn === 'function');
      if (mainFunction) {
        await mainFunction();
      } else {
        console.warn(`No executable function found in ${scriptPath}`);
      }
    }
    console.log(`Script ${scriptPath} completed successfully.`);
  } catch (error) {
    console.error(`Error running script ${scriptPath}:`, error);
    throw error;
  }
}

// Helper function to create a test skill
async function addTestSkill() {
  try {
    const testSkill = {
      id: 999,
      name: "Test Skill",
      category: "Technical",
      description: "This is a test skill for verification purposes only.",
      demandTrend: "increasing",
      futureRelevance: "This skill will remain relevant for testing purposes.",
      learningDifficulty: "low",
      relatedSkills: [],
      prerequisites: [],
      levelingCriteria: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await SkillModel.findOneAndUpdate(
      { id: testSkill.id },
      testSkill,
      { upsert: true, new: true }
    );
    
    console.log('Test skill added successfully');
  } catch (error) {
    console.error('Error adding test skill:', error);
    throw error;
  }
}

// Run the orchestrator
orchestrateDataGeneration()
  .then(() => {
    console.log('Data generation orchestration completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in data generation orchestration:', error);
    process.exit(1);
  });