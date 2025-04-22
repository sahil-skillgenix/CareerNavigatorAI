/**
 * Script to generate career pathways for skill gap analysis
 * Run with: npx tsx server/data-collection/generate-career-pathways.ts
 */

import dotenv from 'dotenv';
import { connectToDatabase } from '../db/mongodb';
import { 
  RoleModel,
  SkillModel,
  CareerPathwayModel
} from '../db/models';

// Initialize environment variables
dotenv.config();

/**
 * Generate career pathways for skill gap analysis
 */
async function generateCareerPathways() {
  try {
    console.log('Generating career pathways for skill gap analysis...');
    
    // Connect to the database
    await connectToDatabase();
    
    // Look up existing roles
    const frontendRole = await RoleModel.findOne({ title: "Frontend Developer" });
    const backendRole = await RoleModel.findOne({ title: "Backend Developer" });
    const fullstackRole = await RoleModel.findOne({ title: "Full Stack Developer" });
    const dataAnalystRole = await RoleModel.findOne({ title: "Data Analyst" });
    const dataScientistRole = await RoleModel.findOne({ title: "Data Scientist" });
    const devopsRole = await RoleModel.findOne({ title: "DevOps Engineer" });
    const pythonRole = await RoleModel.findOne({ title: "Python Developer" });
    const aiRole = await RoleModel.findOne({ title: "AI/ML Engineer" });
    const cloudRole = await RoleModel.findOne({ title: "Cloud Solutions Architect" });
    
    // Look up existing skills
    console.log('Looking up skills...');
    const jsSkill = await SkillModel.findOne({ name: "JavaScript Programming" });
    const reactSkill = await SkillModel.findOne({ name: "React Development" });
    const nodeSkill = await SkillModel.findOne({ name: "Node.js Backend Development" });
    const dbSkill = await SkillModel.findOne({ name: "Database Management" });
    const dataAnalysisSkill = await SkillModel.findOne({ name: "Data Analysis" });
    const sqlSkill = await SkillModel.findOne({ name: "SQL Programming" });
    const dataVizSkill = await SkillModel.findOne({ name: "Data Visualization" });
    const mlSkill = await SkillModel.findOne({ name: "Machine Learning" });
    const pythonSkill = await SkillModel.findOne({ name: "Python Programming" });
    const deepLearningSkill = await SkillModel.findOne({ name: "Deep Learning" });
    const dockerSkill = await SkillModel.findOne({ name: "Docker Containerization" });
    const awsSkill = await SkillModel.findOne({ name: "AWS Cloud Services" });
    
    // Create career pathways
    console.log('Creating career pathways...');
    const pathways = [];
    
    // Log the skill IDs for debugging
    console.log('Found skills:');
    if (jsSkill) console.log(`JavaScript: ID ${jsSkill.id}`);
    if (reactSkill) console.log(`React: ID ${reactSkill.id}`);
    if (nodeSkill) console.log(`Node.js: ID ${nodeSkill.id}`);
    if (dbSkill) console.log(`Database: ID ${dbSkill.id}`);
    if (dataAnalysisSkill) console.log(`Data Analysis: ID ${dataAnalysisSkill.id}`);
    if (sqlSkill) console.log(`SQL: ID ${sqlSkill.id}`);
    if (dataVizSkill) console.log(`Data Viz: ID ${dataVizSkill.id}`);
    if (mlSkill) console.log(`Machine Learning: ID ${mlSkill.id}`);
    if (pythonSkill) console.log(`Python: ID ${pythonSkill.id}`);
    if (deepLearningSkill) console.log(`Deep Learning: ID ${deepLearningSkill.id}`);
    if (dockerSkill) console.log(`Docker: ID ${dockerSkill.id}`);
    if (awsSkill) console.log(`AWS: ID ${awsSkill.id}`);

    if (frontendRole && fullstackRole && jsSkill && reactSkill && nodeSkill && dbSkill) {
      pathways.push({
        id: 5000,
        name: "Frontend to Full Stack Developer Progression",
        description: "Career pathway from Frontend Developer to Full Stack Developer, focusing on acquiring backend skills while maintaining frontend expertise.",
        startingRoleId: frontendRole.id,
        targetRoleId: fullstackRole.id,
        estimatedTimeYears: 2,
        steps: [
          {
            step: 1,
            roleId: frontendRole.id,
            timeframe: "0-12 months",
            description: "Master advanced frontend concepts and begin learning backend fundamentals",
            requiredSkills: [jsSkill.id, reactSkill.id]
          },
          {
            step: 2,
            roleId: fullstackRole.id,
            timeframe: "12-24 months",
            description: "Develop backend skills and integrate with frontend knowledge",
            requiredSkills: [nodeSkill.id, dbSkill.id]
          }
        ]
      });
    }
    
    if (backendRole && fullstackRole && jsSkill && reactSkill && nodeSkill && dbSkill) {
      pathways.push({
        id: 5001,
        name: "Backend to Full Stack Developer Progression",
        description: "Career pathway from Backend Developer to Full Stack Developer, focusing on acquiring frontend skills while maintaining backend expertise.",
        startingRoleId: backendRole.id,
        targetRoleId: fullstackRole.id,
        estimatedTimeYears: 1.5,
        steps: [
          {
            step: 1,
            roleId: backendRole.id,
            timeframe: "0-9 months",
            description: "Master advanced backend concepts and begin learning frontend fundamentals",
            requiredSkills: [nodeSkill.id, dbSkill.id]
          },
          {
            step: 2,
            roleId: fullstackRole.id,
            timeframe: "9-18 months",
            description: "Develop frontend skills and integrate with backend knowledge",
            requiredSkills: [jsSkill.id, reactSkill.id]
          }
        ]
      });
    }
    
    if (dataAnalystRole && dataScientistRole && dataAnalysisSkill && sqlSkill && dataVizSkill && mlSkill && pythonSkill) {
      pathways.push({
        id: 5002,
        name: "Data Analyst to Data Scientist Progression",
        description: "Career pathway from Data Analyst to Data Scientist, focusing on advanced statistical methods and machine learning.",
        startingRoleId: dataAnalystRole.id,
        targetRoleId: dataScientistRole.id,
        estimatedTimeYears: 2.5,
        steps: [
          {
            step: 1,
            roleId: dataAnalystRole.id,
            timeframe: "0-15 months",
            description: "Master data analysis techniques and learn advanced statistics",
            requiredSkills: [dataAnalysisSkill.id, sqlSkill.id, dataVizSkill.id]
          },
          {
            step: 2,
            roleId: dataScientistRole.id,
            timeframe: "15-30 months",
            description: "Develop machine learning skills and apply to complex problems",
            requiredSkills: [mlSkill.id, pythonSkill.id]
          }
        ]
      });
    }
    
    if (pythonRole && aiRole && pythonSkill && dataAnalysisSkill && deepLearningSkill && mlSkill) {
      pathways.push({
        id: 5003,
        name: "Python Developer to AI Engineer Progression",
        description: "Career pathway from Python Developer to AI/ML Engineer, focusing on machine learning and deep learning skills.",
        startingRoleId: pythonRole.id,
        targetRoleId: aiRole.id,
        estimatedTimeYears: 2,
        steps: [
          {
            step: 1,
            roleId: pythonRole.id,
            timeframe: "0-12 months",
            description: "Master Python development and begin learning AI/ML fundamentals",
            requiredSkills: [pythonSkill.id, dataAnalysisSkill.id]
          },
          {
            step: 2,
            roleId: aiRole.id,
            timeframe: "12-24 months",
            description: "Develop deep learning skills and apply to complex problems",
            requiredSkills: [deepLearningSkill.id, mlSkill.id]
          }
        ]
      });
    }
    
    if (devopsRole && cloudRole && dockerSkill && awsSkill) {
      pathways.push({
        id: 5004,
        name: "DevOps to Cloud Architect Progression",
        description: "Career pathway from DevOps Engineer to Cloud Solutions Architect, focusing on advanced cloud architecture and solutions design.",
        startingRoleId: devopsRole.id,
        targetRoleId: cloudRole.id,
        estimatedTimeYears: 2,
        steps: [
          {
            step: 1,
            roleId: devopsRole.id,
            timeframe: "0-12 months",
            description: "Master DevOps practices and begin learning cloud architecture principles",
            requiredSkills: [dockerSkill.id, awsSkill.id]
          },
          {
            step: 2,
            roleId: cloudRole.id,
            timeframe: "12-24 months",
            description: "Develop advanced cloud architecture skills and solutions design expertise",
            requiredSkills: [awsSkill.id]
          }
        ]
      });
    }
    
    // Save career pathways to database
    for (const pathway of pathways) {
      await CareerPathwayModel.findOneAndUpdate(
        { id: pathway.id },
        pathway,
        { upsert: true, new: true }
      );
    }
    console.log(`Created ${pathways.length} career pathways.`);
    
    return {
      careerPathways: pathways.length
    };
  } catch (error) {
    console.error('Error generating career pathways:', error);
    throw error;
  }
}

// Run the function
generateCareerPathways()
  .then((stats) => {
    console.log('Career pathways generation completed with the following statistics:');
    console.table(stats);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in career pathways generation:', error);
    process.exit(1);
  });