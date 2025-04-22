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
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { 
  SFIA9_CATEGORIES, 
  DIGCOMP_AREAS, 
  INDUSTRY_CATEGORIES,
  SKILL_CATEGORIES,
  ROLE_CATEGORIES,
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

// Function to generate skill data using OpenAI
async function generateSkillData(category: string, count: number = 5) {
  console.log(`Generating ${count} skills for category: ${category}`);
  
  const prompt = `
Generate ${count} detailed technical skills for the category "${category}" with the following structure:
Each skill should include:
1. A specific name (not generic or category names)
2. A detailed description (at least 100 words)
3. SFIA 9 mapping with real specific skill and category from SFIA 9 framework (include category, skill name, level 1-7, and description)
4. DigComp 2.2 mapping with real area and competence (include area, competence, proficiency level 1-8, and description)
5. Learning difficulty (low, medium, high)
6. Future relevance description (50+ words on how this skill will evolve)
7. Three detailed leveling criteria for levels 1, 3, and 5, each with assessment methods

Format the response as a valid JSON array. Each skill should have proper fields with correct data types matching this TypeScript interface:
{
  name: string;
  description: string;
  category: string;
  sfiaMapping: {
    category: string;
    skill: string;
    level: number;
    description: string;
  };
  digCompMapping: {
    area: string;
    competence: string;
    proficiencyLevel: number;
    description: string;
  };
  demandTrend: "increasing" | "stable" | "decreasing";
  futureRelevance: string;
  learningDifficulty: "low" | "medium" | "high";
  levelingCriteria: Array<{
    level: number;
    description: string;
    examples: string[];
    assessmentMethods: string[];
  }>;
}

SFIA 9 categories to choose from: ${JSON.stringify(SFIA9_CATEGORIES)}
DigComp 2.2 areas to choose from: ${JSON.stringify(DIGCOMP_AREAS)}

Ensure all data is professionally written, realistic, and accurate.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
    console.error("Error generating skill data:", error);
    throw error;
  }
}

// Function to generate role data using OpenAI
async function generateRoleData(category: string, count: number = 3) {
  console.log(`Generating ${count} roles for category: ${category}`);
  
  const prompt = `
Generate ${count} detailed professional roles for the category "${category}" with the following structure:
Each role should include:
1. A specific title (real job title, not generic)
2. A detailed description (at least 150 words)
3. Average salary range (use realistic ranges with currency)
4. Education requirements (specific degrees/qualifications)
5. Experience requirements (specific years and types of experience)
6. Demand outlook ("high growth", "moderate growth", "stable", or "declining")

Format the response as a valid JSON array. Each role should have proper fields with correct data types matching this TypeScript interface:
{
  title: string;
  description: string;
  category: string;
  averageSalary: string;
  educationRequirements: string[];
  experienceRequirements: string[];
  demandOutlook: "high growth" | "moderate growth" | "stable" | "declining";
}

Ensure all data is professionally written, realistic, and accurate.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
    console.error("Error generating role data:", error);
    throw error;
  }
}

// Function to generate industry data using OpenAI
async function generateIndustryData(category: string, count: number = 2) {
  console.log(`Generating ${count} industries for category: ${category}`);
  
  const prompt = `
Generate ${count} detailed industries for the category "${category}" with the following structure:
Each industry should include:
1. A specific name (not the category itself)
2. A detailed description (at least 150 words)
3. Trend description (at least 100 words about current trends)
4. Growth outlook ("high growth", "moderate growth", "stable", or "declining")
5. Disruptive technologies (list of 3-5 technologies impacting this industry)
6. Regulations (list of 3-5 major regulations affecting this industry)

Format the response as a valid JSON array. Each industry should have proper fields with correct data types matching this TypeScript interface:
{
  name: string;
  description: string;
  category: string;
  trendDescription: string;
  growthOutlook: "high growth" | "moderate growth" | "stable" | "declining";
  disruptiveTechnologies: string[];
  regulations: string[];
}

Ensure all data is professionally written, realistic, and accurate.
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
    console.error("Error generating industry data:", error);
    throw error;
  }
}

// Function to generate relationships between skills, roles and industries
async function generateRelationships(skillIds: number[], roleIds: number[], industryIds: number[]) {
  console.log("Generating relationships between skills, roles, and industries");
  
  // Generate role-skill relationships
  for (const roleId of roleIds) {
    const role = await RoleModel.findOne({ id: roleId });
    if (!role) continue;
    
    // Each role gets 3-7 skills
    const numSkills = Math.floor(Math.random() * 5) + 3;
    const selectedSkillIds = getRandomElements(skillIds, numSkills);
    
    for (const skillId of selectedSkillIds) {
      const importance = getRandomElement(IMPORTANCE_LEVELS);
      const levelRequired = Math.floor(Math.random() * 5) + 1; // 1-5
      
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
  }
  
  // Generate role-industry relationships
  for (const roleId of roleIds) {
    const role = await RoleModel.findOne({ id: roleId });
    if (!role) continue;
    
    // Each role appears in 1-3 industries
    const numIndustries = Math.floor(Math.random() * 3) + 1;
    const selectedIndustryIds = getRandomElements(industryIds, numIndustries);
    
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
  }
  
  // Generate skill-industry relationships
  for (const skillId of skillIds) {
    const skill = await SkillModel.findOne({ id: skillId });
    if (!skill) continue;
    
    // Each skill is relevant to 1-4 industries
    const numIndustries = Math.floor(Math.random() * 4) + 1;
    const selectedIndustryIds = getRandomElements(industryIds, numIndustries);
    
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
  }
  
  // Generate skill prerequisite relationships
  for (const skillId of skillIds) {
    // Only advanced skills have prerequisites
    const skill = await SkillModel.findOne({ id: skillId });
    if (!skill || skill.learningDifficulty !== "high") continue;
    
    // Each advanced skill has 1-3 prerequisites
    const numPrereqs = Math.floor(Math.random() * 3) + 1;
    
    // Filter out the current skill from potential prerequisites
    const potentialPrereqs = skillIds.filter(id => id !== skillId);
    const selectedPrereqIds = getRandomElements(potentialPrereqs, numPrereqs);
    
    for (const prerequisiteId of selectedPrereqIds) {
      const prereq = await SkillModel.findOne({ id: prerequisiteId });
      if (!prereq) continue;
      
      const importance = Math.random() > 0.3 ? "required" : "recommended";
      
      await SkillPrerequisiteModel.findOneAndUpdate(
        { skillId, prerequisiteId },
        { 
          skillId, 
          prerequisiteId, 
          importance, 
          notes: `${prereq.name} is ${importance} before learning ${skill.name}.`
        },
        { upsert: true, new: true }
      );
    }
  }
}

// Function to generate learning resources for skills
async function generateLearningResources(skillIds: number[]) {
  console.log("Generating learning resources for skills");
  
  const resourceTypes = ["course", "book", "tutorial", "video", "podcast", "article", "practice", "certification"];
  const difficulties = ["beginner", "intermediate", "advanced", "expert"];
  const costTypes = ["free", "freemium", "paid", "subscription"];
  
  for (const skillId of skillIds) {
    const skill = await SkillModel.findOne({ id: skillId });
    if (!skill) continue;
    
    // Generate 2-5 resources per skill
    const numResources = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < numResources; i++) {
      const type = getRandomElement(resourceTypes);
      const difficulty = getRandomElement(difficulties);
      const costType = getRandomElement(costTypes);
      
      const resourceId = `res-${skillId}-${i}`;
      const rating = (Math.random() * 2) + 3; // 3.0 - 5.0
      const reviewCount = Math.floor(Math.random() * 500) + 20;
      const relevanceScore = Math.floor(Math.random() * 5) + 5; // 5-10
      
      // Resource-specific details based on type
      let title, provider, description, estimatedHours, cost;
      
      switch (type) {
        case "course":
          title = `Complete ${skill.name} Masterclass`;
          provider = ["Udemy", "Coursera", "edX", "Pluralsight", "LinkedIn Learning"][Math.floor(Math.random() * 5)];
          description = `A comprehensive course on ${skill.name} designed for ${difficulty} learners. This course covers all aspects needed to master this skill in a practical setting.`;
          estimatedHours = Math.floor(Math.random() * 20) + 10;
          cost = costType === "free" ? "0" : `$${Math.floor(Math.random() * 150) + 50}`;
          break;
          
        case "book":
          title = `${skill.name}: A Complete Guide`;
          provider = ["O'Reilly", "Packt", "Wiley", "Manning", "Apress"][Math.floor(Math.random() * 5)];
          description = `This definitive book on ${skill.name} provides both theoretical knowledge and practical examples for ${difficulty} practitioners.`;
          estimatedHours = Math.floor(Math.random() * 30) + 15;
          cost = costType === "free" ? "0" : `$${Math.floor(Math.random() * 40) + 20}`;
          break;
          
        case "tutorial":
          title = `${skill.name} Tutorial for ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}s`;
          provider = ["YouTube", "FreeCodeCamp", "W3Schools", "MDN", "TutorialsPoint"][Math.floor(Math.random() * 5)];
          description = `A hands-on tutorial series that teaches ${skill.name} through practical examples and exercises suitable for ${difficulty} learners.`;
          estimatedHours = Math.floor(Math.random() * 10) + 2;
          cost = costType === "free" ? "0" : `$${Math.floor(Math.random() * 30) + 10}`;
          break;
          
        default:
          title = `Learning ${skill.name}: ${type.charAt(0).toUpperCase() + type.slice(1)}`;
          provider = ["Various", "Online Platform", "Industry Expert", "Leading Provider"][Math.floor(Math.random() * 4)];
          description = `This ${type} provides valuable insights into ${skill.name} with a focus on practical applications for ${difficulty} users.`;
          estimatedHours = Math.floor(Math.random() * 15) + 1;
          cost = costType === "free" ? "0" : `$${Math.floor(Math.random() * 50) + 10}`;
      }
      
      // Create or update the learning resource
      await LearningResourceModel.findOneAndUpdate(
        { id: resourceId },
        {
          id: resourceId,
          title,
          type,
          provider,
          url: `https://example.com/${type}/${skillId}/${i}`,
          description,
          skillId,
          difficulty,
          estimatedHours,
          costType,
          cost,
          tags: [skill.category, difficulty, skill.name.toLowerCase()],
          rating,
          reviewCount,
          relevanceScore,
          matchReason: `This ${type} is highly relevant to building your ${skill.name} skills at the ${difficulty} level.`
        },
        { upsert: true, new: true }
      );
    }
  }
}

// Interface for pathway step
interface PathwayStep {
  step: number;
  roleId: number;
  timeframe: string;
  description: string;
  requiredSkills: number[];
}

// Interface for alternative route
interface AlternativeRoute {
  name: string;
  description: string;
  steps: PathwayStep[];
}

// Function to generate career pathways
async function generateCareerPathways(roleIds: number[]) {
  console.log("Generating career pathways");
  
  // Generate 5-10 career pathways
  const numPathways = Math.floor(Math.random() * 6) + 5;
  
  for (let i = 0; i < numPathways; i++) {
    // Select random start and target roles
    let startingRoleId, targetRoleId;
    do {
      startingRoleId = getRandomElement(roleIds);
      targetRoleId = getRandomElement(roleIds);
    } while (startingRoleId === targetRoleId);
    
    const startingRole = await RoleModel.findOne({ id: startingRoleId });
    const targetRole = await RoleModel.findOne({ id: targetRoleId });
    
    if (!startingRole || !targetRole) continue;
    
    // Generate a realistic pathway with 2-4 steps
    const numSteps = Math.floor(Math.random() * 3) + 2;
    const estimatedTimeYears = numSteps * 2; // Rough estimate
    
    const pathwayId = i + 1;
    
    // Create pathway steps
    const steps: PathwayStep[] = [];
    
    // First step is always the starting role
    steps.push({
      step: 1,
      roleId: startingRoleId,
      timeframe: "0-1 years",
      description: `Begin as a ${startingRole.title} to build foundational skills and experience.`,
      requiredSkills: [] // Will be populated with actual skill IDs
    });
    
    // Intermediate steps - find or create middle roles
    const middleRoleIds: number[] = [];
    for (let j = 0; j < numSteps - 2; j++) {
      let middleRoleId;
      do {
        middleRoleId = getRandomElement(roleIds);
      } while (
        middleRoleId === startingRoleId || 
        middleRoleId === targetRoleId || 
        middleRoleIds.includes(middleRoleId)
      );
      
      middleRoleIds.push(middleRoleId);
      
      const middleRole = await RoleModel.findOne({ id: middleRoleId });
      if (!middleRole) continue;
      
      steps.push({
        step: j + 2,
        roleId: middleRoleId,
        timeframe: `${(j+1)*2}-${(j+2)*2} years`,
        description: `Progress to a ${middleRole.title} position to expand expertise and responsibilities.`,
        requiredSkills: [] // Will be populated with actual skill IDs
      });
    }
    
    // Final step is always the target role
    steps.push({
      step: numSteps,
      roleId: targetRoleId,
      timeframe: `${estimatedTimeYears-2}-${estimatedTimeYears} years`,
      description: `Advance to the role of ${targetRole.title} after gaining sufficient experience and skills.`,
      requiredSkills: [] // Will be populated with actual skill IDs
    });
    
    // Add required skills to each step
    for (let step of steps) {
      const roleSkills = await RoleSkillModel.find({ roleId: step.roleId });
      step.requiredSkills = roleSkills.slice(0, 3).map(rs => rs.skillId);
    }
    
    // Create an alternative route (simpler version with different middle step if applicable)
    let alternativeRoutes: AlternativeRoute[] = [];
    
    if (numSteps > 2) {
      // Find a different middle role
      let altMiddleRoleId;
      do {
        altMiddleRoleId = getRandomElement(roleIds);
      } while (
        altMiddleRoleId === startingRoleId || 
        altMiddleRoleId === targetRoleId || 
        middleRoleIds.includes(altMiddleRoleId)
      );
      
      const altMiddleRole = await RoleModel.findOne({ id: altMiddleRoleId });
      if (altMiddleRole) {
        const altSteps: PathwayStep[] = [
          {
            step: 1,
            roleId: startingRoleId,
            timeframe: "0-1 years",
            description: `Begin as a ${startingRole.title} to build foundational skills and experience.`,
            requiredSkills: [] // Will be populated with actual skill IDs
          },
          {
            step: 2,
            roleId: altMiddleRoleId,
            timeframe: `2-4 years`,
            description: `Take an alternative path as a ${altMiddleRole.title} to gain different perspective and skills.`,
            requiredSkills: [] // Will be populated with actual skill IDs
          },
          {
            step: 3,
            roleId: targetRoleId,
            timeframe: `4-6 years`,
            description: `Transition to the target role of ${targetRole.title} with your unique background.`,
            requiredSkills: [] // Will be populated with actual skill IDs
          }
        ];
        
        // Add required skills to each alternative step
        for (let step of altSteps) {
          const roleSkills = await RoleSkillModel.find({ roleId: step.roleId });
          step.requiredSkills = roleSkills.slice(0, 3).map(rs => rs.skillId);
        }
        
        alternativeRoutes = [{
          name: `Alternative Path via ${altMiddleRole.title}`,
          description: `This alternative pathway reaches the same destination role of ${targetRole.title} but passes through a ${altMiddleRole.title} position, offering different skill development opportunities.`,
          steps: altSteps
        }];
      }
    }
    
    // Create or update the career pathway
    await CareerPathwayModel.findOneAndUpdate(
      { id: pathwayId },
      {
        id: pathwayId,
        name: `From ${startingRole.title} to ${targetRole.title}`,
        description: `A structured career progression pathway from a ${startingRole.title} position to becoming a ${targetRole.title} over approximately ${estimatedTimeYears} years.`,
        startingRoleId,
        targetRoleId,
        estimatedTimeYears,
        steps,
        alternativeRoutes
      },
      { upsert: true, new: true }
    );
  }
}

// Helper function to get random elements from an array
function getRandomElements<T>(array: readonly T[] | T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

// Helper function to get a random element from an array
function getRandomElement<T>(array: readonly T[] | T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Main function to generate all data
export async function generateCareerData() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if we already have data
    const skillCount = await SkillModel.countDocuments();
    const roleCount = await RoleModel.countDocuments();
    const industryCount = await IndustryModel.countDocuments();
    
    if (skillCount > 0 && roleCount > 0 && industryCount > 0) {
      console.log('Career data already exists. Skipping generation.');
      return;
    }
    
    console.log('Starting career data generation...');
    
    // Generate skills (2 skills for just 3 categories to test more quickly)
    let skillId = 1;
    const testSkillCategories = SKILL_CATEGORIES.slice(0, 3); // Just use first 3 categories
    for (const category of testSkillCategories) {
      console.log(`Generating skills for category: ${category}`);
      const skillsData = await generateSkillData(category, 1); // Just 1 per category for testing
      
      for (const skillData of skillsData) {
        console.log(`Creating skill: ${skillData.name}`);
        await SkillModel.create({
          ...skillData,
          id: skillId++
        });
      }
    }
    
    // Generate roles (1 for just 2 categories)
    let roleId = 1;
    const testRoleCategories = ROLE_CATEGORIES.slice(0, 2); // Just use first 2 categories
    for (const category of testRoleCategories) {
      console.log(`Generating roles for category: ${category}`);
      const rolesData = await generateRoleData(category, 1);
      
      for (const roleData of rolesData) {
        console.log(`Creating role: ${roleData.title}`);
        await RoleModel.create({
          ...roleData,
          id: roleId++,
          careerPath: {
            next: [],
            previous: []
          }
        });
      }
    }
    
    // Generate industries (1 for just 2 categories)
    let industryId = 1;
    const testIndustryCategories = INDUSTRY_CATEGORIES.slice(0, 2); // Just use first 2 categories
    for (const category of testIndustryCategories) {
      console.log(`Generating industries for category: ${category}`);
      const industriesData = await generateIndustryData(category, 1);
      
      for (const industryData of industriesData) {
        await IndustryModel.create({
          ...industryData,
          id: industryId++
        });
      }
    }
    
    // Get all IDs for creating relationships
    const allSkillIds = Array.from({ length: skillId - 1 }, (_, i) => i + 1);
    const allRoleIds = Array.from({ length: roleId - 1 }, (_, i) => i + 1);
    const allIndustryIds = Array.from({ length: industryId - 1 }, (_, i) => i + 1);
    
    // Generate relationships between entities
    await generateRelationships(allSkillIds, allRoleIds, allIndustryIds);
    
    // Generate learning resources for skills
    await generateLearningResources(allSkillIds);
    
    // Generate career pathways
    await generateCareerPathways(allRoleIds);
    
    console.log('Career data generation completed successfully.');
  } catch (error) {
    console.error('Error generating career data:', error);
    throw error;
  }
}

// In ES modules, there is no direct equivalent to require.main === module
// Instead, we use a separate main file (main-generator.ts) to run this code