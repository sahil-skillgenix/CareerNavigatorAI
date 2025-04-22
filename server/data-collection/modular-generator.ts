/**
 * Modular career data generator
 * This version allows generating each type of data independently
 * Run with: npx tsx server/data-collection/modular-generator.ts [skills|roles|industries|relationships|all]
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { connectToDatabase } from '../db/mongodb';
import OpenAI from 'openai';
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
import { 
  SFIA9_CATEGORIES, 
  DIGCOMP_AREAS, 
  INDUSTRY_CATEGORIES,
  SKILL_CATEGORIES,
  ROLE_CATEGORIES,
  SKILL_LEVELS,
  GROWTH_OUTLOOK,
  IMPORTANCE_LEVELS,
  PREVALENCE_LEVELS,
  DEMAND_TRENDS
} from '@shared/schema';

// Initialize environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Cache directory for storing generated data
const CACHE_DIR = path.join(process.cwd(), 'cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Cache file paths
const SKILL_CACHE = path.join(CACHE_DIR, 'skills.json');
const ROLE_CACHE = path.join(CACHE_DIR, 'roles.json');
const INDUSTRY_CACHE = path.join(CACHE_DIR, 'industries.json');

// Helper function to read from cache
function readCache(cachePath: string): any[] {
  if (fs.existsSync(cachePath)) {
    try {
      const data = fs.readFileSync(cachePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.warn(`Failed to read cache from ${cachePath}:`, error);
    }
  }
  return [];
}

// Helper function to write to cache
function writeCache(cachePath: string, data: any[]): void {
  try {
    fs.writeFileSync(cachePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.warn(`Failed to write cache to ${cachePath}:`, error);
  }
}

// Function to generate skill data using OpenAI
async function generateSkillBatch(categories: string[], countPerCategory: number = 1) {
  console.log(`Generating ${countPerCategory} skills for ${categories.length} categories in a batch`);
  
  const prompt = `
Generate ${countPerCategory} detailed technical skills for EACH of the following categories: ${categories.join(', ')}
with the following structure:

Each skill should include:
1. A specific name (not generic or category names)
2. A detailed description (at least 100 words)
3. SFIA 9 mapping with real specific skill from SFIA 9 framework (include category, skill name, level 1-7, and description)
4. DigComp 2.2 mapping with real area and competence (include area, competence, proficiency level 1-8, and description)
5. Learning difficulty (low, medium, high)
6. Future relevance description (50+ words on how this skill will evolve)
7. Three detailed leveling criteria for levels 1, 3, and 5, each with assessment methods

Format the response as a valid JSON array where each item has these properties:
{
  "name": string,
  "category": string, // MUST be one of the categories specified above
  "description": string,
  "sfiaMapping": {
    "category": string,
    "skill": string,
    "level": number,
    "description": string
  },
  "digCompMapping": {
    "area": string,
    "competence": string,
    "proficiencyLevel": number,
    "description": string
  },
  "demandTrend": "increasing" | "stable" | "decreasing",
  "futureRelevance": string,
  "learningDifficulty": "low" | "medium" | "high",
  "levelingCriteria": [
    {
      "level": number,
      "description": string,
      "examples": string[],
      "assessmentMethods": string[]
    }
  ]
}

SFIA 9 categories to choose from: ${JSON.stringify(SFIA9_CATEGORIES)}
DigComp 2.2 areas to choose from: ${JSON.stringify(DIGCOMP_AREAS)}

Ensure all data is professionally written, realistic, and accurate. The returned array MUST contain ${categories.length * countPerCategory} skills (${countPerCategory} for each category).
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const parsedData = JSON.parse(content);
    return parsedData.skills || parsedData;
  } catch (error) {
    console.error("Error generating skill batch:", error);
    throw error;
  }
}

// Function to generate role data using OpenAI
async function generateRoleBatch(categories: string[], countPerCategory: number = 1) {
  console.log(`Generating ${countPerCategory} roles for ${categories.length} categories in a batch`);
  
  const prompt = `
Generate ${countPerCategory} detailed professional roles for EACH of the following categories: ${categories.join(', ')}
with the following structure:

Each role should include:
1. A specific title (real job title, not generic)
2. A detailed description (at least 150 words)
3. Average salary range (use realistic ranges with currency)
4. Education requirements (specific degrees/qualifications)
5. Experience requirements (specific years and types of experience)
6. Demand outlook ("high growth", "moderate growth", "stable", or "declining")

Format the response as a valid JSON array where each item has these properties:
{
  "title": string,
  "category": string, // MUST be one of the categories specified above
  "description": string,
  "averageSalary": string,
  "educationRequirements": string[],
  "experienceRequirements": string[],
  "demandOutlook": "high growth" | "moderate growth" | "stable" | "declining"
}

Ensure all data is professionally written, realistic, and accurate. The returned array MUST contain ${categories.length * countPerCategory} roles (${countPerCategory} for each category).
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const parsedData = JSON.parse(content);
    return parsedData.roles || parsedData;
  } catch (error) {
    console.error("Error generating role batch:", error);
    throw error;
  }
}

// Function to generate industry data using OpenAI
async function generateIndustryBatch(categories: string[], countPerCategory: number = 1) {
  console.log(`Generating ${countPerCategory} industries for ${categories.length} categories in a batch`);
  
  const prompt = `
Generate ${countPerCategory} detailed industries for EACH of the following categories: ${categories.join(', ')}
with the following structure:

Each industry should include:
1. A specific name (not the category itself)
2. A detailed description (at least 150 words)
3. Trend description (at least 100 words about current trends)
4. Growth outlook ("high growth", "moderate growth", "stable", or "declining")
5. Disruptive technologies (list of 3-5 technologies impacting this industry)
6. Regulations (list of 3-5 major regulations affecting this industry)

Format the response as a valid JSON array where each item has these properties:
{
  "name": string,
  "category": string, // MUST be one of the categories specified above
  "description": string,
  "trendDescription": string,
  "growthOutlook": "high growth" | "moderate growth" | "stable" | "declining",
  "disruptiveTechnologies": string[],
  "regulations": string[]
}

Ensure all data is professionally written, realistic, and accurate. The returned array MUST contain ${categories.length * countPerCategory} industries (${countPerCategory} for each category).
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const parsedData = JSON.parse(content);
    return parsedData.industries || parsedData;
  } catch (error) {
    console.error("Error generating industry batch:", error);
    throw error;
  }
}

// Helper function to get random elements from an array
function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

// Helper function to get a random element from an array
function getRandomElement<T>(array: readonly T[] | T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to generate skills
export async function generateSkills() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if we already have skills
    const skillCount = await SkillModel.countDocuments();
    if (skillCount > 0) {
      console.log(`Skills already exist in database (${skillCount} found). Skipping generation.`);
      return;
    }
    
    console.log('Starting skill generation...');
    
    // Check cache first
    let allSkills = readCache(SKILL_CACHE);
    
    // Generate skills if not in cache
    if (allSkills.length === 0) {
      // Use smaller subset of categories for testing
      const targetSkillCategories = SKILL_CATEGORIES.slice(0, 3);
      
      // Batch API calls by processing 2 categories at once with 1 skill per category
      for (let i = 0; i < targetSkillCategories.length; i += 2) {
        const batch = targetSkillCategories.slice(i, i + 2);
        if (batch.length > 0) {
          try {
            const batchSkills = await generateSkillBatch(batch, 1);
            allSkills = [...allSkills, ...batchSkills];
            
            // Update cache after each batch
            writeCache(SKILL_CACHE, allSkills);
            console.log(`Generated and cached ${batchSkills.length} skills for categories: ${batch.join(', ')}`);
          } catch (error) {
            console.error(`Error generating skills batch for categories ${batch.join(', ')}:`, error);
          }
        }
      }
    } else {
      console.log(`Using ${allSkills.length} skills from cache`);
    }
    
    // Save skills to database
    let skillId = 1;
    for (const skillData of allSkills) {
      try {
        console.log(`Saving skill: ${skillData.name}`);
        await SkillModel.findOneAndUpdate(
          { name: skillData.name }, 
          { ...skillData, id: skillId++ },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error(`Error saving skill ${skillData.name}:`, error);
      }
    }
    
    console.log(`Saved ${allSkills.length} skills to database`);
    return allSkills.length;
  } catch (error) {
    console.error('Error generating skills:', error);
    throw error;
  }
}

// Function to generate roles
export async function generateRoles() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if we already have roles
    const roleCount = await RoleModel.countDocuments();
    if (roleCount > 0) {
      console.log(`Roles already exist in database (${roleCount} found). Skipping generation.`);
      return;
    }
    
    console.log('Starting role generation...');
    
    // Check cache first
    let allRoles = readCache(ROLE_CACHE);
    
    // Generate roles if not in cache
    if (allRoles.length === 0) {
      // Use smaller subset of categories for testing
      const targetRoleCategories = ROLE_CATEGORIES.slice(0, 1); // Only use 1 category
      
      try {
        console.log(`Generating roles for categories: ${targetRoleCategories.join(', ')}`);
        const roles = await generateRoleBatch(targetRoleCategories, 1);
        allRoles = [...allRoles, ...roles];
        
        // Cache roles
        writeCache(ROLE_CACHE, allRoles);
        console.log(`Generated and cached ${roles.length} roles`);
      } catch (error) {
        console.error('Error generating roles batch:', error);
      }
    } else {
      console.log(`Using ${allRoles.length} roles from cache`);
    }
    
    // Save roles to database
    let roleId = 1;
    for (const roleData of allRoles) {
      try {
        console.log(`Saving role: ${roleData.title}`);
        await RoleModel.findOneAndUpdate(
          { title: roleData.title },
          { 
            ...roleData, 
            id: roleId++,
            careerPath: {
              next: [],
              previous: []
            }
          },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error(`Error saving role ${roleData.title}:`, error);
      }
    }
    
    console.log(`Saved ${allRoles.length} roles to database`);
    return allRoles.length;
  } catch (error) {
    console.error('Error generating roles:', error);
    throw error;
  }
}

// Function to generate industries
export async function generateIndustries() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if we already have industries
    const industryCount = await IndustryModel.countDocuments();
    if (industryCount > 1) { // Allow for test industry
      console.log(`Industries already exist in database (${industryCount} found). Skipping generation.`);
      return;
    }
    
    console.log('Starting industry generation...');
    
    // Check cache first
    let allIndustries = readCache(INDUSTRY_CACHE);
    
    // Generate industries if not in cache
    if (allIndustries.length === 0) {
      // Use smaller subset of categories for testing
      const targetIndustryCategories = INDUSTRY_CATEGORIES.slice(0, 1); // Only use 1 category
      
      try {
        console.log(`Generating industries for categories: ${targetIndustryCategories.join(', ')}`);
        const industries = await generateIndustryBatch(targetIndustryCategories, 1);
        allIndustries = [...allIndustries, ...industries];
        
        // Cache industries
        writeCache(INDUSTRY_CACHE, allIndustries);
        console.log(`Generated and cached ${industries.length} industries`);
      } catch (error) {
        console.error('Error generating industries batch:', error);
      }
    } else {
      console.log(`Using ${allIndustries.length} industries from cache`);
    }
    
    // Save industries to database
    let industryId = 1;
    for (const industryData of allIndustries) {
      try {
        console.log(`Saving industry: ${industryData.name}`);
        await IndustryModel.findOneAndUpdate(
          { name: industryData.name },
          { ...industryData, id: industryId++ },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error(`Error saving industry ${industryData.name}:`, error);
      }
    }
    
    console.log(`Saved ${allIndustries.length} industries to database`);
    return allIndustries.length;
  } catch (error) {
    console.error('Error generating industries:', error);
    throw error;
  }
}

// Function to generate relationships
export async function generateRelationships() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if we already have relationships
    const relationshipCount = await RoleSkillModel.countDocuments();
    if (relationshipCount > 0) {
      console.log(`Relationships already exist in database (${relationshipCount} found). Skipping generation.`);
      return;
    }
    
    console.log('Starting relationship generation...');
    
    // Get all model IDs
    const savedSkills = await SkillModel.find({}, 'id name');
    const savedRoles = await RoleModel.find({}, 'id title');
    const savedIndustries = await IndustryModel.find({}, 'id name');
    
    if (savedSkills.length === 0 || savedRoles.length === 0 || savedIndustries.length === 0) {
      console.error('Cannot generate relationships: Missing skills, roles, or industries');
      return;
    }
    
    const savedSkillIds = savedSkills.map(s => s.id);
    const savedRoleIds = savedRoles.map(r => r.id);
    const savedIndustryIds = savedIndustries.map(i => i.id);
    
    console.log(`Found ${savedSkillIds.length} skills, ${savedRoleIds.length} roles, and ${savedIndustryIds.length} industries`);
    
    // Generate role-skill relationships
    for (const roleId of savedRoleIds) {
      try {
        const role = await RoleModel.findOne({ id: roleId });
        if (!role) continue;
        
        // Each role gets 2-3 skills
        const numSkills = Math.floor(Math.random() * 2) + 2;
        const selectedSkillIds = getRandomElements(savedSkillIds, numSkills);
        
        for (const skillId of selectedSkillIds) {
          const importance = getRandomElement(IMPORTANCE_LEVELS);
          const levelRequired = Math.floor(Math.random() * 3) + 1; // 1-3
          
          await RoleSkillModel.findOneAndUpdate(
            { roleId, skillId },
            { 
              roleId, 
              skillId, 
              importance, 
              levelRequired, 
              context: `This skill is ${importance} for the role of ${role.title}.` 
            },
            { upsert: true, new: true }
          );
        }
        console.log(`Created ${numSkills} skill relationships for role: ${role.title}`);
      } catch (error) {
        console.error(`Error creating role-skill relationships for role ID ${roleId}:`, error);
      }
    }
    
    // Generate role-industry relationships
    for (const roleId of savedRoleIds) {
      try {
        const role = await RoleModel.findOne({ id: roleId });
        if (!role) continue;
        
        // Each role appears in 1-2 industries
        const numIndustries = Math.floor(Math.random() * 2) + 1;
        const selectedIndustryIds = getRandomElements(savedIndustryIds, numIndustries);
        
        for (const industryId of selectedIndustryIds) {
          const industry = await IndustryModel.findOne({ id: industryId });
          if (!industry) continue;
          
          const prevalence = getRandomElement(PREVALENCE_LEVELS);
          
          await RoleIndustryModel.findOneAndUpdate(
            { roleId, industryId },
            { 
              roleId, 
              industryId, 
              prevalence, 
              notes: `This role has ${prevalence} prevalence in the ${industry.name} industry.`,
              specializations: `${role.title} in ${industry.name}`
            },
            { upsert: true, new: true }
          );
        }
        console.log(`Created ${numIndustries} industry relationships for role: ${role.title}`);
      } catch (error) {
        console.error(`Error creating role-industry relationships for role ID ${roleId}:`, error);
      }
    }
    
    // Generate skill-industry relationships
    for (const skillId of savedSkillIds) {
      try {
        const skill = await SkillModel.findOne({ id: skillId });
        if (!skill) continue;
        
        // Each skill is relevant to 1-2 industries
        const numIndustries = Math.floor(Math.random() * 2) + 1;
        const selectedIndustryIds = getRandomElements(savedIndustryIds, numIndustries);
        
        for (const industryId of selectedIndustryIds) {
          const industry = await IndustryModel.findOne({ id: industryId });
          if (!industry) continue;
          
          const importance = getRandomElement(IMPORTANCE_LEVELS);
          const trendDirection = getRandomElement(DEMAND_TRENDS);
          
          await SkillIndustryModel.findOneAndUpdate(
            { skillId, industryId },
            { 
              skillId, 
              industryId, 
              importance, 
              trendDirection,
              contextualApplication: `${skill.name} is ${importance} in ${industry.name} with a ${trendDirection} demand trend.`
            },
            { upsert: true, new: true }
          );
        }
        console.log(`Created ${numIndustries} industry relationships for skill: ${skill.name}`);
      } catch (error) {
        console.error(`Error creating skill-industry relationships for skill ID ${skillId}:`, error);
      }
    }
    
    console.log('Relationship generation completed successfully');
    return true;
  } catch (error) {
    console.error('Error generating relationships:', error);
    throw error;
  }
}

// Function to generate learning resources
export async function generateLearningResources() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if we already have learning resources
    const existingResourceCount = await LearningResourceModel.countDocuments();
    if (existingResourceCount > 0) {
      console.log(`Learning resources already exist in database (${existingResourceCount} found). Skipping generation.`);
      return;
    }
    
    console.log('Starting learning resource generation...');
    
    // Get all skills
    const savedSkills = await SkillModel.find({}, 'id name category');
    
    if (savedSkills.length === 0) {
      console.error('Cannot generate learning resources: No skills found');
      return;
    }
    
    console.log(`Generating learning resources for ${savedSkills.length} skills...`);
    
    const resourceTypes = ["course", "book", "tutorial", "video"];
    const difficulties = ["beginner", "intermediate", "advanced"];
    const costTypes = ["free", "paid", "subscription"];
    
    let totalResourceCount = 0;
    
    for (const skill of savedSkills) {
      try {
        // Generate 1-2 resources per skill
        const numResources = Math.floor(Math.random() * 2) + 1;
        
        for (let i = 0; i < numResources; i++) {
          const type = getRandomElement(resourceTypes);
          const difficulty = getRandomElement(difficulties);
          const costType = getRandomElement(costTypes);
          
          const resourceId = `res-${skill.id}-${i}`;
          const rating = (Math.random() * 2) + 3; // 3.0 - 5.0
          const reviewCount = Math.floor(Math.random() * 100) + 10;
          
          // Create learning resource
          await LearningResourceModel.findOneAndUpdate(
            { id: resourceId },
            {
              id: resourceId,
              title: `Learn ${skill.name} - ${type.charAt(0).toUpperCase() + type.slice(1)}`,
              type,
              provider: ["Udemy", "Coursera", "edX", "Pluralsight"][Math.floor(Math.random() * 4)],
              url: `https://example.com/${type}/${skill.id}/${i}`,
              description: `A comprehensive ${type} on ${skill.name} designed for ${difficulty} learners.`,
              skillId: skill.id,
              difficulty,
              estimatedHours: Math.floor(Math.random() * 15) + 5,
              costType,
              cost: costType === "free" ? "0" : `$${Math.floor(Math.random() * 100) + 20}`,
              tags: [skill.category, difficulty, skill.name.toLowerCase()],
              rating,
              reviewCount,
              relevanceScore: Math.floor(Math.random() * 5) + 5, // 5-10
              matchReason: `This ${type} is designed to help you master ${skill.name}.`
            },
            { upsert: true, new: true }
          );
          
          totalResourceCount++;
        }
        
        console.log(`Created ${numResources} learning resources for skill: ${skill.name}`);
      } catch (error) {
        console.error(`Error creating learning resources for skill ${skill.name}:`, error);
      }
    }
    
    console.log(`Learning resource generation completed: Created ${totalResourceCount} resources`);
    return totalResourceCount;
  } catch (error) {
    console.error('Error generating learning resources:', error);
    throw error;
  }
}

// Function to generate career pathways
export async function generateCareerPathways() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if we already have career pathways
    const pathwayCount = await CareerPathwayModel.countDocuments();
    if (pathwayCount > 0) {
      console.log(`Career pathways already exist in database (${pathwayCount} found). Skipping generation.`);
      return;
    }
    
    console.log('Starting career pathway generation...');
    
    // Get all roles
    const savedRoles = await RoleModel.find({}, 'id title');
    
    if (savedRoles.length < 2) {
      console.error('Cannot generate career pathways: Need at least 2 roles');
      return;
    }
    
    // Get all skills
    const savedSkills = await SkillModel.find({}, 'id name');
    const savedSkillIds = savedSkills.map(s => s.id);
    
    console.log(`Generating career pathways using ${savedRoles.length} roles...`);
    
    // Generate a simple career pathway
    try {
      const startRole = savedRoles[0];
      const endRole = savedRoles[savedRoles.length - 1];
      
      const pathwayId = 'cp-1';
      const pathwayName = `From ${startRole.title} to ${endRole.title}`;
      
      await CareerPathwayModel.findOneAndUpdate(
        { id: pathwayId },
        {
          id: pathwayId,
          name: pathwayName,
          description: `A career pathway showing progression from ${startRole.title} to ${endRole.title}`,
          startingRoleId: startRole.id,
          targetRoleId: endRole.id,
          estimatedTimeYears: 3,
          steps: [
            {
              step: 1,
              roleId: startRole.id,
              timeframe: "1-2 years",
              description: `Build foundational experience as a ${startRole.title}`,
              requiredSkills: savedSkillIds.slice(0, 2)
            },
            {
              step: 2,
              roleId: endRole.id,
              timeframe: "2-3 years",
              description: `Advance to the ${endRole.title} position`,
              requiredSkills: savedSkillIds.slice(2, 4)
            }
          ]
        },
        { upsert: true, new: true }
      );
      
      console.log(`Created career pathway: ${pathwayName}`);
      return 1;
    } catch (error) {
      console.error('Error creating career pathway:', error);
    }
  } catch (error) {
    console.error('Error generating career pathways:', error);
    throw error;
  }
}

// Main function to generate all career data
export async function generateAllCareerData() {
  try {
    await connectToDatabase();
    
    console.log('=== STARTING MODULAR CAREER DATA GENERATION ===');
    
    // Generate core data
    await generateSkills();
    await generateRoles();
    await generateIndustries();
    
    // Generate relationships and additional data
    await generateRelationships();
    await generateLearningResources();
    await generateCareerPathways();
    
    console.log('=== MODULAR CAREER DATA GENERATION COMPLETED ===');
  } catch (error) {
    console.error('Error in modular career data generation:', error);
    throw error;
  }
}

// Run the generator directly if needed
async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0] || 'all';
  
  try {
    switch (command) {
      case 'skills':
        await generateSkills();
        break;
      case 'roles':
        await generateRoles();
        break;
      case 'industries':
        await generateIndustries();
        break;
      case 'relationships':
        await generateRelationships();
        break;
      case 'resources':
        await generateLearningResources();
        break;
      case 'pathways':
        await generateCareerPathways();
        break;
      case 'all':
      default:
        await generateAllCareerData();
        break;
    }
    
    console.log(`Modular data generation for '${command}' completed successfully.`);
    process.exit(0);
  } catch (error) {
    console.error(`Modular data generation for '${command}' failed:`, error);
    process.exit(1);
  }
}

// Run the main function if this file is executed directly
if (process.argv[1] === import.meta.url) {
  main();
}