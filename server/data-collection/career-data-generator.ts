import OpenAI from "openai";
import { Skill, Role, Industry } from "@shared/schema";
import mongoose from "mongoose";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Logger function
const log = (message: string, context: string = "career-data-generator") => {
  console.log(`${new Date().toLocaleTimeString()} [${context}] ${message}`);
};

// SFIA 9 categories for skill organization
const SFIA9_CATEGORIES = [
  "Strategy and architecture",
  "Change and transformation",
  "Development and implementation",
  "Delivery and operation",
  "Skills and quality",
  "Relationships and engagement",
];

// DigComp 2.2 competence areas
const DIGCOMP_AREAS = [
  "Information and data literacy",
  "Communication and collaboration",
  "Digital content creation",
  "Safety",
  "Problem solving",
];

// Industry categories
const INDUSTRY_CATEGORIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Media and Entertainment",
  "Government",
  "Energy and Utilities",
  "Transportation and Logistics",
];

// Role categories
const ROLE_CATEGORIES = [
  "Engineering",
  "Design",
  "Management",
  "Analysis",
  "Support",
  "Sales and Marketing",
  "Research",
  "Operations",
  "Human Resources",
  "Legal and Compliance",
];

/**
 * Generate skills based on SFIA 9 and DigComp 2.2 frameworks
 */
async function generateSkills(): Promise<Skill[]> {
  try {
    log("Generating skills data using OpenAI...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: 
            "You are a career data expert specializing in skills taxonomies including SFIA 9 and DigComp 2.2. " +
            "Generate comprehensive and realistic skill data for a career development platform."
        },
        {
          role: "user",
          content: 
            `Create 50 realistic skill entries based on SFIA 9 and DigComp 2.2 frameworks. 
            For each skill, provide:
            1. id (numeric, starting from 1)
            2. name (skill name)
            3. description (detailed description of the skill)
            4. framework (either "SFIA 9" or "DigComp 2.2")
            5. category (one of: ${SFIA9_CATEGORIES.join(", ")} for SFIA 9 skills OR ${DIGCOMP_AREAS.join(", ")} for DigComp 2.2 skills)
            6. levelDescriptions (array of objects with level [1-5] and corresponding description of proficiency at that level)
            7. demandTrend ("increasing", "stable", or "decreasing")
            8. prerequisites (array of skill IDs that are prerequisites, can be empty)
            9. relatedSkills (array of skill IDs that are related, can be empty)
            
            Return as a properly formatted JSON array with a property called "skills".`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }
    
    const data = JSON.parse(content);
    return data.skills || [];
  } catch (error) {
    log(`Error generating skills: ${error}`);
    throw error;
  }
}

/**
 * Generate roles data with realistic descriptions and requirements
 */
async function generateRoles(): Promise<Role[]> {
  try {
    log("Generating roles data using OpenAI...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: 
            "You are a career data expert specializing in job roles and career pathways. " +
            "Generate comprehensive and realistic role data for a career development platform."
        },
        {
          role: "user",
          content: 
            `Create 30 realistic job role entries for a career development platform. 
            For each role, provide:
            1. id (numeric, starting from 1)
            2. title (job title)
            3. description (detailed description of the role)
            4. category (one of: ${ROLE_CATEGORIES.join(", ")})
            5. averageSalary (realistic salary range as a string, e.g., "$80,000 - $120,000")
            6. educationRequirements (array of education requirements)
            7. experienceRequirements (array of experience requirements)
            8. skillRequirements (array of objects with skillId, importance ["high", "medium", "low"], and levelRequired [1-5])
            9. careerPath (object with next [array of role ids that could come next] and previous [array of role ids that could precede this role])
            10. demandOutlook (string describing future demand)
            
            Return as a properly formatted JSON array with a property called "roles".`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }
    
    const data = JSON.parse(content);
    return data.roles || [];
  } catch (error) {
    log(`Error generating roles: ${error}`);
    throw error;
  }
}

/**
 * Generate industries data with comprehensive information
 */
async function generateIndustries(): Promise<Industry[]> {
  try {
    log("Generating industries data using OpenAI...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: 
            "You are a career data expert specializing in industry analysis and trends. " +
            "Generate comprehensive and realistic industry data for a career development platform."
        },
        {
          role: "user",
          content: 
            `Create 20 realistic industry entries for a career development platform. 
            For each industry, provide:
            1. id (numeric, starting from 1)
            2. name (industry name)
            3. description (detailed description of the industry)
            4. category (one of: ${INDUSTRY_CATEGORIES.join(", ")})
            5. trendDescription (description of current trends)
            6. growthOutlook ("high growth", "moderate growth", "stable", "declining")
            7. keySkills (array of objects with skillId and importance ["critical", "important", "helpful"])
            8. topRoles (array of objects with roleId and prevalence ["high", "medium", "low"])
            9. disruptiveTechnologies (array of technologies disrupting this industry)
            10. regulations (array of relevant regulations or compliance frameworks)
            
            Return as a properly formatted JSON array with a property called "industries".`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }
    
    const data = JSON.parse(content);
    return data.industries || [];
  } catch (error) {
    log(`Error generating industries: ${error}`);
    throw error;
  }
}

/**
 * Store generated skills in MongoDB
 */
async function storeSkills(skills: Skill[]): Promise<void> {
  try {
    log(`Storing ${skills.length} skills in MongoDB...`);
    
    // Get the model
    const SkillModel = mongoose.model("Skill");
    
    // Clear existing skills if any
    await SkillModel.deleteMany({});
    
    // Insert all skills
    await SkillModel.insertMany(skills.map(skill => ({
      ...skill,
      _id: skill.id
    })));
    
    log(`Successfully stored ${skills.length} skills`);
  } catch (error) {
    log(`Error storing skills: ${error}`);
    throw error;
  }
}

/**
 * Store generated roles in MongoDB
 */
async function storeRoles(roles: Role[]): Promise<void> {
  try {
    log(`Storing ${roles.length} roles in MongoDB...`);
    
    // Get the model
    const RoleModel = mongoose.model("Role");
    
    // Clear existing roles if any
    await RoleModel.deleteMany({});
    
    // Insert all roles
    await RoleModel.insertMany(roles.map(role => ({
      ...role,
      _id: role.id
    })));
    
    log(`Successfully stored ${roles.length} roles`);
  } catch (error) {
    log(`Error storing roles: ${error}`);
    throw error;
  }
}

/**
 * Store generated industries in MongoDB
 */
async function storeIndustries(industries: Industry[]): Promise<void> {
  try {
    log(`Storing ${industries.length} industries in MongoDB...`);
    
    // Get the model
    const IndustryModel = mongoose.model("Industry");
    
    // Clear existing industries if any
    await IndustryModel.deleteMany({});
    
    // Insert all industries
    await IndustryModel.insertMany(industries.map(industry => ({
      ...industry,
      _id: industry.id
    })));
    
    log(`Successfully stored ${industries.length} industries`);
  } catch (error) {
    log(`Error storing industries: ${error}`);
    throw error;
  }
}

/**
 * Generate and store all career data
 */
export async function generateAndStoreCareerData(): Promise<void> {
  try {
    log("Starting career data generation...");
    
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    
    // Generate data
    const skills = await generateSkills();
    const roles = await generateRoles();
    const industries = await generateIndustries();
    
    // Store data
    await storeSkills(skills);
    await storeRoles(roles);
    await storeIndustries(industries);
    
    log("Career data generation and storage complete!");
  } catch (error) {
    log(`Error in generateAndStoreCareerData: ${error}`);
    throw error;
  }
}

/**
 * Check if career data exists in the database
 */
export async function hasCareerData(): Promise<boolean> {
  try {
    const SkillModel = mongoose.model("Skill");
    const RoleModel = mongoose.model("Role");
    const IndustryModel = mongoose.model("Industry");
    
    const skillCount = await SkillModel.countDocuments();
    const roleCount = await RoleModel.countDocuments();
    const industryCount = await IndustryModel.countDocuments();
    
    return skillCount > 0 && roleCount > 0 && industryCount > 0;
  } catch (error) {
    log(`Error checking career data: ${error}`);
    return false;
  }
}