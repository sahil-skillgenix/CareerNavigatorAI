/**
 * Script to generate skills and roles for skill gap analysis
 * Run with: npx tsx server/data-collection/generate-skills-roles.ts
 */

import dotenv from 'dotenv';
import { connectToDatabase } from '../db/mongodb';
import { 
  SkillModel, 
  RoleModel
} from '../db/models';

// Initialize environment variables
dotenv.config();

// Starting IDs for our entities (to avoid conflicts with other test data)
const SKILL_ID_START = 2000;
const ROLE_ID_START = 2000;

/**
 * Generate skills and roles for skill gap analysis
 */
async function generateSkillsAndRoles() {
  try {
    console.log('Generating skills and roles for skill gap analysis...');
    
    // Connect to the database
    await connectToDatabase();
    
    // Create Tech Industry Skills
    const techSkills = [
      {
        id: SKILL_ID_START,
        name: "JavaScript Programming",
        category: "Web Development",
        description: "Ability to write efficient and maintainable JavaScript code for web applications, including understanding of ES6+ features, asynchronous programming, and DOM manipulation.",
        demandTrend: "increasing",
        futureRelevance: "JavaScript will remain a fundamental web technology for the foreseeable future, with increasing importance in full-stack development.",
        learningDifficulty: "medium",
        sfiaMapping: {
          category: "Development and implementation",
          skill: "Programming/software development",
          level: 3,
          description: "Designs, codes, tests, corrects and documents moderate modifications to and/or the creation of software components from supplied specifications in accordance with standards."
        },
        digCompMapping: {
          area: "Digital content creation",
          competence: "Programming",
          proficiencyLevel: 5,
          description: "Can solve complex problems using digital tools and programming languages."
        }
      },
      {
        id: SKILL_ID_START + 1,
        name: "React Development",
        category: "Web Development",
        description: "Proficiency in building interactive user interfaces using React.js, including component-based architecture, hooks, state management, and routing.",
        demandTrend: "increasing",
        futureRelevance: "React will continue to be a leading frontend framework with growing adoption in enterprise applications.",
        learningDifficulty: "medium",
        sfiaMapping: {
          category: "Development and implementation",
          skill: "Programming/software development",
          level: 4,
          description: "Designs, codes, tests, corrects and documents complex modifications and/or problems with software components from specifications."
        },
        digCompMapping: {
          area: "Digital content creation",
          competence: "Programming",
          proficiencyLevel: 6,
          description: "Can create solutions to complex problems using digital tools and programming languages."
        }
      },
      {
        id: SKILL_ID_START + 2,
        name: "Node.js Backend Development",
        category: "Web Development",
        description: "Ability to build scalable server-side applications using Node.js, including RESTful APIs, database integration, authentication, and server deployment.",
        demandTrend: "increasing",
        futureRelevance: "Node.js will remain important for JavaScript-based backend development, especially for real-time applications.",
        learningDifficulty: "medium",
        sfiaMapping: {
          category: "Development and implementation",
          skill: "Programming/software development",
          level: 4,
          description: "Designs, codes, tests, corrects and documents complex modifications and/or problems with software components from specifications."
        },
        digCompMapping: {
          area: "Digital content creation",
          competence: "Programming",
          proficiencyLevel: 6,
          description: "Can create solutions to complex problems using digital tools and programming languages."
        }
      },
      {
        id: SKILL_ID_START + 3,
        name: "Database Management",
        category: "Data Engineering",
        description: "Knowledge of database design, normalization, query optimization, and administration for both SQL and NoSQL databases.",
        demandTrend: "stable",
        futureRelevance: "Database skills will remain crucial as data volumes continue to grow across all industries.",
        learningDifficulty: "medium",
        sfiaMapping: {
          category: "Development and implementation",
          skill: "Database design",
          level: 3,
          description: "Develops and maintains specialist knowledge of database and data warehouse concepts, design principles, architectures, software and facilities."
        },
        digCompMapping: {
          area: "Digital content creation",
          competence: "Programming",
          proficiencyLevel: 5,
          description: "Can solve complex problems using digital tools and programming languages."
        }
      },
      {
        id: SKILL_ID_START + 4,
        name: "Cloud Computing",
        category: "DevOps",
        description: "Understanding of cloud service models (IaaS, PaaS, SaaS), deployment models, and major cloud platforms like AWS, Azure, or GCP.",
        demandTrend: "increasing",
        futureRelevance: "Cloud computing will continue to grow as organizations migrate more workloads to the cloud.",
        learningDifficulty: "high",
        sfiaMapping: {
          category: "Development and implementation",
          skill: "Systems development",
          level: 4,
          description: "Designs, codes, tests, corrects and documents complex systems integration components using appropriate methods and tools."
        },
        digCompMapping: {
          area: "Problem solving",
          competence: "Identifying technological needs",
          proficiencyLevel: 6,
          description: "Can assess own needs in terms of technological resources and make considered choices of tools according to technological needs."
        }
      },
      {
        id: SKILL_ID_START + 5,
        name: "Machine Learning",
        category: "Data Science",
        description: "Understanding of machine learning algorithms, model training, evaluation, and deployment in production environments.",
        demandTrend: "increasing",
        futureRelevance: "Machine learning will become increasingly important as AI adoption grows across industries.",
        learningDifficulty: "high",
        sfiaMapping: {
          category: "Development and implementation",
          skill: "Data science",
          level: 5,
          description: "Identifies opportunities for data-driven solutions. Creates predictive and machine learning models to identify patterns and make predictions about future events."
        },
        digCompMapping: {
          area: "Problem solving",
          competence: "Programming",
          proficiencyLevel: 7,
          description: "Can create complex digital solutions using programming languages and advanced AI techniques."
        }
      }
    ];
    
    // Create Data Industry Skills
    const dataSkills = [
      {
        id: SKILL_ID_START + 6,
        name: "Data Analysis",
        category: "Data Science",
        description: "Ability to collect, process, and analyze data to extract meaningful insights using statistical methods and visualization tools.",
        demandTrend: "increasing",
        futureRelevance: "Data analysis will be increasingly important as organizations become more data-driven.",
        learningDifficulty: "medium",
        sfiaMapping: {
          category: "Strategy and architecture",
          skill: "Data management",
          level: 4,
          description: "Analyses organisational processes and data, and makes recommendations for improvements."
        },
        digCompMapping: {
          area: "Information and data literacy",
          competence: "Evaluating data, information and digital content",
          proficiencyLevel: 6,
          description: "Can critically assess the credibility and reliability of sources of data, information and digital content."
        }
      },
      {
        id: SKILL_ID_START + 7,
        name: "SQL Programming",
        category: "Data Engineering",
        description: "Proficiency in writing complex SQL queries for data retrieval, manipulation, and optimization in relational database systems.",
        demandTrend: "stable",
        futureRelevance: "SQL will remain a fundamental skill for data professionals despite the rise of NoSQL databases.",
        learningDifficulty: "medium",
        sfiaMapping: {
          category: "Development and implementation",
          skill: "Database design",
          level: 3,
          description: "Translates logical data models into physical database designs."
        },
        digCompMapping: {
          area: "Digital content creation",
          competence: "Programming",
          proficiencyLevel: 5,
          description: "Can solve complex problems using SQL and database query languages."
        }
      },
      {
        id: SKILL_ID_START + 8,
        name: "Data Visualization",
        category: "Data Science",
        description: "Ability to create effective visual representations of data using tools like Tableau, Power BI, or programming libraries like D3.js.",
        demandTrend: "increasing",
        futureRelevance: "Data visualization will become more important as organizations need to communicate insights effectively.",
        learningDifficulty: "medium",
        sfiaMapping: {
          category: "Development and implementation",
          skill: "Information content authoring",
          level: 4,
          description: "Creates content to communicate complicated information clearly, concisely and accurately."
        },
        digCompMapping: {
          area: "Digital content creation",
          competence: "Developing content",
          proficiencyLevel: 6,
          description: "Can produce complex digital content in different formats and platforms."
        }
      }
    ];
    
    // All skills combined
    const allSkills = [...techSkills, ...dataSkills];
    
    // Create Tech Roles
    const techRoles = [
      {
        id: ROLE_ID_START,
        title: "Frontend Developer",
        category: "Software Development",
        description: "Responsible for implementing visual elements that users see and interact with in a web application. Works with designers to translate UI/UX design wireframes to actual code, and focuses on the client-side of development.",
        averageSalary: "$80,000 - $120,000",
        educationRequirements: ["Bachelor's degree in Computer Science or related field", "Frontend development bootcamp"],
        experienceRequirements: ["1-3 years of frontend development experience", "Portfolio of web projects"],
        demandOutlook: "high growth",
        careerPath: {
          next: [],
          previous: []
        }
      },
      {
        id: ROLE_ID_START + 1,
        title: "Backend Developer",
        category: "Software Development",
        description: "Focuses on server-side web application logic and integration. Writes backend services and APIs used by frontend developers and mobile application developers. Works with databases, caching, security, and architecture.",
        averageSalary: "$90,000 - $130,000",
        educationRequirements: ["Bachelor's degree in Computer Science or related field"],
        experienceRequirements: ["2+ years of backend development experience", "Experience with server-side technologies"],
        demandOutlook: "high growth",
        careerPath: {
          next: [],
          previous: []
        }
      },
      {
        id: ROLE_ID_START + 2,
        title: "Full Stack Developer",
        category: "Software Development",
        description: "Handles both frontend and backend development. Has comprehensive understanding of how the web works at each level and can develop complete web applications. Expert in multiple frontend and backend languages and frameworks.",
        averageSalary: "$100,000 - $150,000",
        educationRequirements: ["Bachelor's degree in Computer Science or related field", "Full stack development bootcamp"],
        experienceRequirements: ["3+ years of full stack development experience", "Experience with both frontend and backend technologies"],
        demandOutlook: "high growth",
        careerPath: {
          next: [],
          previous: []
        }
      }
    ];
    
    // Create Data Roles
    const dataRoles = [
      {
        id: ROLE_ID_START + 3,
        title: "Data Analyst",
        category: "Data Science",
        description: "Responsible for collecting, processing, and performing statistical analyses on large datasets. Creates visualizations and dashboards to help organizations make more informed business decisions.",
        averageSalary: "$70,000 - $100,000",
        educationRequirements: ["Bachelor's degree in Statistics, Mathematics, Economics, or related field"],
        experienceRequirements: ["1-2 years of experience in data analysis", "Proficiency in data analysis tools"],
        demandOutlook: "moderate growth",
        careerPath: {
          next: [],
          previous: []
        }
      },
      {
        id: ROLE_ID_START + 4,
        title: "Data Scientist",
        category: "Data Science",
        description: "Combines statistics, mathematics, and programming to extract meaningful insights from data. Builds predictive models and machine learning algorithms to solve complex business problems.",
        averageSalary: "$100,000 - $150,000",
        educationRequirements: ["Master's or PhD in Statistics, Mathematics, Computer Science, or related field"],
        experienceRequirements: ["3+ years of experience in data analysis or related field", "Strong background in statistics and programming"],
        demandOutlook: "high growth",
        careerPath: {
          next: [],
          previous: []
        }
      }
    ];
    
    // All roles combined
    const allRoles = [...techRoles, ...dataRoles];
    
    // Save skills to database
    console.log('Saving skills to database...');
    for (const skillData of allSkills) {
      await SkillModel.findOneAndUpdate(
        { id: skillData.id },
        skillData,
        { upsert: true, new: true }
      );
    }
    console.log(`Saved ${allSkills.length} skills to database.`);
    
    // Save roles to database
    console.log('Saving roles to database...');
    for (const roleData of allRoles) {
      await RoleModel.findOneAndUpdate(
        { id: roleData.id },
        roleData,
        { upsert: true, new: true }
      );
    }
    console.log(`Saved ${allRoles.length} roles to database.`);
    
    console.log('Skills and roles generation completed successfully!');
    return {
      skills: allSkills.length,
      roles: allRoles.length
    };
  } catch (error) {
    console.error('Error generating skills and roles:', error);
    throw error;
  }
}

// Run the function
generateSkillsAndRoles()
  .then((stats) => {
    console.log('Skills and roles generation completed with the following statistics:');
    console.table(stats);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in skills and roles generation:', error);
    process.exit(1);
  });