/**
 * Script to generate unique data for skill gap analysis
 * Run with: npx tsx server/data-collection/generate-unique-data.ts
 */

import dotenv from 'dotenv';
import { connectToDatabase } from '../db/mongodb';
import { 
  SkillModel, 
  RoleModel,
  IndustryModel,
  RoleSkillModel,
  SkillPrerequisiteModel
} from '../db/models';

// Initialize environment variables
dotenv.config();

// Starting IDs for our entities (using higher IDs to avoid conflicts)
const SKILL_ID_START = 5000; // Much higher to avoid conflicts
const ROLE_ID_START = 5000;  // Much higher to avoid conflicts
const INDUSTRY_ID_START = 5000; // Much higher to avoid conflicts

/**
 * Generate unique data for skill gap analysis
 */
async function generateUniqueData() {
  try {
    console.log('Generating unique data for skill gap analysis...');
    
    // Connect to the database
    await connectToDatabase();
    
    // Create unique skills with different names
    const uniqueSkills = [
      {
        id: SKILL_ID_START,
        name: "Python Programming",
        category: "Software Development",
        description: "Ability to write clean, efficient Python code for various applications including data analysis, web development, automation, and AI.",
        demandTrend: "increasing",
        futureRelevance: "Python will continue to be a dominant language for AI, data science, and general-purpose programming.",
        learningDifficulty: "low",
        sfiaMapping: {
          category: "Development and implementation",
          skill: "Programming/software development",
          level: 3,
          description: "Designs, codes, tests, corrects and documents moderate modifications to Python applications in accordance with specifications."
        },
        digCompMapping: {
          area: "Digital content creation",
          competence: "Programming",
          proficiencyLevel: 5,
          description: "Can solve complex problems using Python and relevant libraries and frameworks."
        }
      },
      {
        id: SKILL_ID_START + 1,
        name: "Django Web Framework",
        category: "Web Development",
        description: "Proficiency in building web applications using Django, including models, views, templates, forms, authentication, and REST APIs.",
        demandTrend: "stable",
        futureRelevance: "Django will remain a popular choice for rapid web development with Python.",
        learningDifficulty: "medium",
        sfiaMapping: {
          category: "Development and implementation",
          skill: "Programming/software development",
          level: 4,
          description: "Designs, codes, tests, corrects and documents complex web applications using Django and related technologies."
        },
        digCompMapping: {
          area: "Digital content creation",
          competence: "Programming",
          proficiencyLevel: 6,
          description: "Can create solutions to complex web development problems using Django."
        }
      },
      {
        id: SKILL_ID_START + 2,
        name: "AWS Cloud Services",
        category: "Cloud Computing",
        description: "Knowledge of AWS services and architecture, including EC2, S3, RDS, Lambda, and best practices for secure and scalable cloud applications.",
        demandTrend: "increasing",
        futureRelevance: "AWS will continue to dominate the cloud market, making this skill increasingly valuable.",
        learningDifficulty: "high",
        sfiaMapping: {
          category: "Development and implementation",
          skill: "Systems development",
          level: 4,
          description: "Designs, codes, tests, corrects and documents complex systems integration components in AWS cloud environments."
        },
        digCompMapping: {
          area: "Problem solving",
          competence: "Identifying technological needs",
          proficiencyLevel: 6,
          description: "Can assess needs and make appropriate choices of AWS services for various business requirements."
        }
      },
      {
        id: SKILL_ID_START + 3,
        name: "Docker Containerization",
        category: "DevOps",
        description: "Ability to create, deploy, and manage containers using Docker, including writing Dockerfiles, managing images, and orchestrating containers.",
        demandTrend: "increasing",
        futureRelevance: "Containerization will remain a key skill as microservices architecture continues to grow in popularity.",
        learningDifficulty: "medium",
        sfiaMapping: {
          category: "Development and implementation",
          skill: "Systems integration",
          level: 4,
          description: "Creates and maintains container-based solutions to enable consistent deployment across environments."
        },
        digCompMapping: {
          area: "Problem solving",
          competence: "Technical problem solving",
          proficiencyLevel: 6,
          description: "Can implement containerization strategies to solve complex deployment challenges."
        }
      },
      {
        id: SKILL_ID_START + 4,
        name: "Deep Learning",
        category: "Artificial Intelligence",
        description: "Understanding of neural networks, architectures like CNNs and RNNs, frameworks like TensorFlow and PyTorch, and applications in various domains.",
        demandTrend: "increasing",
        futureRelevance: "Deep learning will continue to drive advances in AI across numerous industries.",
        learningDifficulty: "high",
        sfiaMapping: {
          category: "Development and implementation",
          skill: "Data science",
          level: 5,
          description: "Designs and implements deep learning models to solve complex problems and extract insights from data."
        },
        digCompMapping: {
          area: "Problem solving",
          competence: "Programming",
          proficiencyLevel: 7,
          description: "Can create sophisticated deep learning solutions to complex problems."
        }
      }
    ];
    
    // Create unique roles
    const uniqueRoles = [
      {
        id: ROLE_ID_START,
        title: "Python Developer",
        category: "Software Development",
        description: "Specializes in developing applications using Python. Creates, maintains, and optimizes Python code for various use cases including web applications, data analysis, automation, and AI systems.",
        averageSalary: "$85,000 - $130,000",
        educationRequirements: ["Bachelor's degree in Computer Science or related field", "Python certification"],
        experienceRequirements: ["2+ years of Python development experience", "Experience with relevant Python frameworks"],
        demandOutlook: "high growth",
        careerPath: {
          next: [],
          previous: []
        }
      },
      {
        id: ROLE_ID_START + 1,
        title: "Cloud Solutions Architect",
        category: "Cloud Computing",
        description: "Designs and oversees the implementation of cloud infrastructure and applications. Ensures that cloud solutions are scalable, secure, cost-effective, and aligned with business requirements.",
        averageSalary: "$120,000 - $180,000",
        educationRequirements: ["Bachelor's degree in Computer Science or related field", "AWS/Azure/GCP certification"],
        experienceRequirements: ["5+ years of IT experience", "3+ years of experience with cloud platforms"],
        demandOutlook: "high growth",
        careerPath: {
          next: [],
          previous: []
        }
      },
      {
        id: ROLE_ID_START + 2,
        title: "DevOps Engineer",
        category: "DevOps",
        description: "Bridges the gap between development and operations. Implements CI/CD pipelines, automates deployment processes, and maintains infrastructure to enable faster and more reliable software delivery.",
        averageSalary: "$110,000 - $160,000",
        educationRequirements: ["Bachelor's degree in Computer Science or related field"],
        experienceRequirements: ["3+ years of experience in software development or IT operations", "Experience with containerization and orchestration"],
        demandOutlook: "high growth",
        careerPath: {
          next: [],
          previous: []
        }
      },
      {
        id: ROLE_ID_START + 3,
        title: "AI/ML Engineer",
        category: "Artificial Intelligence",
        description: "Develops and implements AI and machine learning models for various applications. Combines software engineering skills with data science knowledge to create efficient AI solutions.",
        averageSalary: "$120,000 - $180,000",
        educationRequirements: ["Master's or PhD in Computer Science, Mathematics, or related field"],
        experienceRequirements: ["3+ years of experience in machine learning or related field", "Strong understanding of deep learning frameworks"],
        demandOutlook: "high growth",
        careerPath: {
          next: [],
          previous: []
        }
      }
    ];
    
    // Create unique industries
    const uniqueIndustries = [
      {
        id: INDUSTRY_ID_START,
        name: "Artificial Intelligence",
        category: "Technology",
        description: "The artificial intelligence industry focuses on developing intelligent systems that can perform tasks requiring human-like intelligence, including computer vision, natural language processing, speech recognition, and decision making.",
        trendDescription: "AI is one of the fastest-growing technology sectors, driven by advances in deep learning, increased computing power, and the availability of large datasets.",
        growthOutlook: "high growth",
        disruptiveTechnologies: ["Deep Learning", "Reinforcement Learning", "Generative AI", "Edge AI", "Federated Learning"],
        regulations: ["EU AI Act", "NIST AI Risk Management Framework", "GDPR"]
      },
      {
        id: INDUSTRY_ID_START + 1,
        name: "Cloud Services",
        category: "Technology",
        description: "The cloud services industry provides on-demand computing resources, including storage, processing power, and applications, delivered over the internet on a pay-as-you-go basis.",
        trendDescription: "Cloud computing continues to experience strong growth as organizations of all sizes migrate their IT infrastructure to the cloud for greater scalability, flexibility, and cost-efficiency.",
        growthOutlook: "high growth",
        disruptiveTechnologies: ["Serverless Computing", "Kubernetes", "Multi-cloud", "Edge Computing", "Cloud-native Development"],
        regulations: ["GDPR", "CCPA", "FedRAMP", "ISO 27017"]
      }
    ];
    
    // Save unique skills to database
    console.log('Saving unique skills to database...');
    for (const skillData of uniqueSkills) {
      // Check if skill with same name already exists
      const existingSkill = await SkillModel.findOne({ name: skillData.name });
      if (existingSkill) {
        console.log(`Skill "${skillData.name}" already exists with ID ${existingSkill.id}. Skipping.`);
        continue;
      }
      
      await SkillModel.findOneAndUpdate(
        { id: skillData.id },
        skillData,
        { upsert: true, new: true }
      );
    }
    console.log(`Saved unique skills to database.`);
    
    // Save unique roles to database
    console.log('Saving unique roles to database...');
    for (const roleData of uniqueRoles) {
      // Check if role with same title already exists
      const existingRole = await RoleModel.findOne({ title: roleData.title });
      if (existingRole) {
        console.log(`Role "${roleData.title}" already exists with ID ${existingRole.id}. Skipping.`);
        continue;
      }
      
      await RoleModel.findOneAndUpdate(
        { id: roleData.id },
        roleData,
        { upsert: true, new: true }
      );
    }
    console.log(`Saved unique roles to database.`);
    
    // Save unique industries to database
    console.log('Saving unique industries to database...');
    for (const industryData of uniqueIndustries) {
      // Check if industry with same name already exists
      const existingIndustry = await IndustryModel.findOne({ name: industryData.name });
      if (existingIndustry) {
        console.log(`Industry "${industryData.name}" already exists with ID ${existingIndustry.id}. Skipping.`);
        continue;
      }
      
      await IndustryModel.findOneAndUpdate(
        { id: industryData.id },
        industryData,
        { upsert: true, new: true }
      );
    }
    console.log(`Saved unique industries to database.`);
    
    // Create skill prerequisites
    console.log('Creating skill prerequisites...');
    const skillPrerequisites = [
      // Django Web Framework prerequisites
      { skillId: SKILL_ID_START + 1, prerequisiteId: SKILL_ID_START, importance: "critical" }, // Django requires Python
      
      // Deep Learning prerequisites
      { skillId: SKILL_ID_START + 4, prerequisiteId: SKILL_ID_START, importance: "important" }, // Deep Learning benefits from Python
    ];
    
    for (const prerequisite of skillPrerequisites) {
      await SkillPrerequisiteModel.findOneAndUpdate(
        { skillId: prerequisite.skillId, prerequisiteId: prerequisite.prerequisiteId },
        prerequisite,
        { upsert: true, new: true }
      );
    }
    console.log(`Created ${skillPrerequisites.length} skill prerequisites.`);
    
    // Create role-skill relationships
    console.log('Creating role-skill relationships...');
    const roleSkillRelationships = [
      // Python Developer skills
      { roleId: ROLE_ID_START, skillId: SKILL_ID_START, importance: "critical", levelRequired: 4 }, // Python Developer needs Python (high level)
      { roleId: ROLE_ID_START, skillId: SKILL_ID_START + 1, importance: "important", levelRequired: 3 }, // Python Developer benefits from Django
      
      // Cloud Solutions Architect skills
      { roleId: ROLE_ID_START + 1, skillId: SKILL_ID_START + 2, importance: "critical", levelRequired: 4 }, // Cloud Architect needs AWS (high level)
      { roleId: ROLE_ID_START + 1, skillId: SKILL_ID_START + 3, importance: "important", levelRequired: 3 }, // Cloud Architect benefits from Docker
      
      // DevOps Engineer skills
      { roleId: ROLE_ID_START + 2, skillId: SKILL_ID_START + 3, importance: "critical", levelRequired: 4 }, // DevOps needs Docker (high level)
      { roleId: ROLE_ID_START + 2, skillId: SKILL_ID_START + 2, importance: "important", levelRequired: 3 }, // DevOps benefits from AWS
      
      // AI/ML Engineer skills
      { roleId: ROLE_ID_START + 3, skillId: SKILL_ID_START + 4, importance: "critical", levelRequired: 4 }, // AI/ML Engineer needs Deep Learning (high level)
      { roleId: ROLE_ID_START + 3, skillId: SKILL_ID_START, importance: "critical", levelRequired: 3 }, // AI/ML Engineer needs Python
    ];
    
    for (const relationship of roleSkillRelationships) {
      await RoleSkillModel.findOneAndUpdate(
        { roleId: relationship.roleId, skillId: relationship.skillId },
        {
          ...relationship,
          context: `This skill is ${relationship.importance} for this role at level ${relationship.levelRequired}.`
        },
        { upsert: true, new: true }
      );
    }
    console.log(`Created ${roleSkillRelationships.length} role-skill relationships.`);
    
    console.log('Unique data generation completed successfully!');
    return {
      skills: uniqueSkills.length,
      roles: uniqueRoles.length,
      industries: uniqueIndustries.length,
      skillPrerequisites: skillPrerequisites.length,
      roleSkillRelationships: roleSkillRelationships.length
    };
  } catch (error) {
    console.error('Error generating unique data:', error);
    throw error;
  }
}

// Run the function
generateUniqueData()
  .then((stats) => {
    console.log('Unique data generation completed with the following statistics:');
    console.table(stats);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in unique data generation:', error);
    process.exit(1);
  });