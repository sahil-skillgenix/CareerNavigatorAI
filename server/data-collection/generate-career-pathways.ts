/**
 * Script to generate career pathways for skill gap analysis
 * Run with: npx tsx server/data-collection/generate-career-pathways.ts
 */

import dotenv from 'dotenv';
import { connectToDatabase } from '../db/mongodb';
import { 
  RoleModel,
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
    
    // Create career pathways
    console.log('Creating career pathways...');
    const pathways = [];
    
    if (frontendRole && fullstackRole) {
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
            requiredSkills: ["JavaScript Programming", "React Development"]
          },
          {
            step: 2,
            roleId: fullstackRole.id,
            timeframe: "12-24 months",
            description: "Develop backend skills and integrate with frontend knowledge",
            requiredSkills: ["Node.js Backend Development", "Database Management"]
          }
        ]
      });
    }
    
    if (backendRole && fullstackRole) {
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
            requiredSkills: ["Node.js Backend Development", "Database Management"]
          },
          {
            step: 2,
            roleId: fullstackRole.id,
            timeframe: "9-18 months",
            description: "Develop frontend skills and integrate with backend knowledge",
            requiredSkills: ["JavaScript Programming", "React Development"]
          }
        ]
      });
    }
    
    if (dataAnalystRole && dataScientistRole) {
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
            requiredSkills: ["Data Analysis", "SQL Programming", "Data Visualization"]
          },
          {
            step: 2,
            roleId: dataScientistRole.id,
            timeframe: "15-30 months",
            description: "Develop machine learning skills and apply to complex problems",
            requiredSkills: ["Machine Learning", "Python Programming"]
          }
        ]
      });
    }
    
    if (pythonRole && aiRole) {
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
            requiredSkills: ["Python Programming", "Data Analysis"]
          },
          {
            step: 2,
            roleId: aiRole.id,
            timeframe: "12-24 months",
            description: "Develop deep learning skills and apply to complex problems",
            requiredSkills: ["Deep Learning", "Machine Learning"]
          }
        ]
      });
    }
    
    if (devopsRole && cloudRole) {
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
            requiredSkills: ["Docker Containerization", "AWS Cloud Services"]
          },
          {
            step: 2,
            roleId: cloudRole.id,
            timeframe: "12-24 months",
            description: "Develop advanced cloud architecture skills and solutions design expertise",
            requiredSkills: ["AWS Cloud Services", "Cloud Architecture"]
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