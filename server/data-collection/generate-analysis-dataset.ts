/**
 * Script to generate a comprehensive dataset for skill gap analysis
 * This creates a complete interconnected dataset of skills, roles, and industries
 * Run with: npx tsx server/data-collection/generate-analysis-dataset.ts
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
import { 
  IMPORTANCE_LEVELS, 
  PREVALENCE_LEVELS, 
  DEMAND_TRENDS 
} from '@shared/schema';

// Initialize environment variables
dotenv.config();

// Starting IDs for our entities (to avoid conflicts with other test data)
const SKILL_ID_START = 2000;
const ROLE_ID_START = 2000;
const INDUSTRY_ID_START = 2000;

/**
 * Generate a comprehensive dataset for skill gap analysis
 */
async function generateAnalysisDataset() {
  try {
    console.log('Starting to generate comprehensive analysis dataset...');
    
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
      },
      {
        id: SKILL_ID_START + 9,
        name: "Statistical Analysis",
        category: "Data Science",
        description: "Understanding of statistical methods, hypothesis testing, regression analysis, and their application to real-world problems.",
        demandTrend: "stable",
        futureRelevance: "Statistical analysis will remain a core skill for data scientists and analysts.",
        learningDifficulty: "high",
        sfiaMapping: {
          category: "Development and implementation",
          skill: "Data science",
          level: 4,
          description: "Analyses complex data sets and identifies patterns to help solve organisational problems."
        },
        digCompMapping: {
          area: "Problem solving",
          competence: "Solving technical problems",
          proficiencyLevel: 6,
          description: "Can solve complex technical problems by analyzing data and applying statistical methods."
        }
      },
      {
        id: SKILL_ID_START + 10,
        name: "Big Data Technologies",
        category: "Data Engineering",
        description: "Knowledge of distributed computing frameworks like Hadoop and Spark, and tools for processing large-scale data.",
        demandTrend: "increasing",
        futureRelevance: "Big data technologies will become more important as data volumes continue to grow.",
        learningDifficulty: "high",
        sfiaMapping: {
          category: "Development and implementation",
          skill: "Database design",
          level: 5,
          description: "Designs, creates and maintains specialist data structures and associated components."
        },
        digCompMapping: {
          area: "Problem solving",
          competence: "Identifying technological needs",
          proficiencyLevel: 7,
          description: "Can solve highly complex problems involving big data using advanced technological solutions."
        }
      }
    ];
    
    // Create Business Skills
    const businessSkills = [
      {
        id: SKILL_ID_START + 11,
        name: "Project Management",
        category: "Business",
        description: "Ability to plan, execute, monitor, and close projects, including resource allocation, risk management, and stakeholder communication.",
        demandTrend: "stable",
        futureRelevance: "Project management will remain essential for coordinating complex initiatives across organizations.",
        learningDifficulty: "medium",
        sfiaMapping: {
          category: "Delivery and operation",
          skill: "Project management",
          level: 4,
          description: "Defines, documents and executes small projects or sub-projects, alone or with a small team."
        },
        digCompMapping: {
          area: "Problem solving",
          competence: "Creatively using digital technologies",
          proficiencyLevel: 5,
          description: "Can use digital tools to solve problems and manage projects effectively."
        }
      },
      {
        id: SKILL_ID_START + 12,
        name: "Business Analysis",
        category: "Business",
        description: "Ability to identify business needs, analyze requirements, and recommend solutions that deliver value to stakeholders.",
        demandTrend: "increasing",
        futureRelevance: "Business analysis will grow in importance as organizations need to adapt to changing market conditions.",
        learningDifficulty: "medium",
        sfiaMapping: {
          category: "Strategy and architecture",
          skill: "Business analysis",
          level: 4,
          description: "Investigates operational requirements, problems, and opportunities."
        },
        digCompMapping: {
          area: "Problem solving",
          competence: "Identifying needs and technological responses",
          proficiencyLevel: 5,
          description: "Can analyze business needs and identify appropriate technological solutions."
        }
      },
      {
        id: SKILL_ID_START + 13,
        name: "Digital Marketing",
        category: "Business",
        description: "Knowledge of digital marketing channels, strategies, analytics, and optimization techniques to drive customer acquisition and engagement.",
        demandTrend: "increasing",
        futureRelevance: "Digital marketing will continue to grow as businesses shift more marketing spend online.",
        learningDifficulty: "medium",
        sfiaMapping: {
          category: "Relationships and engagement",
          skill: "Marketing",
          level: 4,
          description: "Plans and conducts marketing activities for specific products, services or market segments."
        },
        digCompMapping: {
          area: "Communication and collaboration",
          competence: "Engaging in citizenship through digital technologies",
          proficiencyLevel: 5,
          description: "Can actively engage with audiences through various digital channels and marketing platforms."
        }
      }
    ];
    
    // All skills combined
    const allSkills = [...techSkills, ...dataSkills, ...businessSkills];
    
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
      },
      {
        id: ROLE_ID_START + 3,
        title: "DevOps Engineer",
        category: "IT Operations",
        description: "Combines software development and IT operations expertise to improve collaboration between development and operations teams. Implements continuous integration/continuous deployment pipelines, automates infrastructure, and maintains system reliability.",
        averageSalary: "$110,000 - $160,000",
        educationRequirements: ["Bachelor's degree in Computer Science or related field"],
        experienceRequirements: ["3+ years of experience in IT operations or development", "Experience with cloud platforms and automation tools"],
        demandOutlook: "high growth",
        careerPath: {
          next: [],
          previous: []
        }
      },
      {
        id: ROLE_ID_START + 4,
        title: "Machine Learning Engineer",
        category: "Artificial Intelligence",
        description: "Designs and implements machine learning systems, runs experiments, and improves algorithms. Focuses on taking theoretical data science models and helping scale them to production-level models that can handle terabytes of real-time data.",
        averageSalary: "$120,000 - $180,000",
        educationRequirements: ["Master's or PhD in Computer Science, Mathematics, or related field"],
        experienceRequirements: ["2+ years of experience in machine learning", "Strong understanding of algorithms and software engineering"],
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
        id: ROLE_ID_START + 5,
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
        id: ROLE_ID_START + 6,
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
      },
      {
        id: ROLE_ID_START + 7,
        title: "Data Engineer",
        category: "Data Science",
        description: "Focuses on building and maintaining data pipelines that collect, store, process, and analyze large datasets. Creates the infrastructure that data scientists use to perform their analyses.",
        averageSalary: "$90,000 - $140,000",
        educationRequirements: ["Bachelor's degree in Computer Science, Engineering, or related field"],
        experienceRequirements: ["2+ years of experience in software engineering or data engineering", "Experience with data pipelines and database systems"],
        demandOutlook: "high growth",
        careerPath: {
          next: [],
          previous: []
        }
      },
      {
        id: ROLE_ID_START + 8,
        title: "Business Intelligence Analyst",
        category: "Data Science",
        description: "Transforms data into insights that drive business value. Creates dashboards, reports, and visualizations to communicate findings to stakeholders at all levels of an organization.",
        averageSalary: "$80,000 - $110,000",
        educationRequirements: ["Bachelor's degree in Business, Statistics, Economics, or related field"],
        experienceRequirements: ["2+ years of experience in business intelligence or data analysis", "Experience with BI tools and SQL"],
        demandOutlook: "moderate growth",
        careerPath: {
          next: [],
          previous: []
        }
      }
    ];
    
    // Create Business Roles
    const businessRoles = [
      {
        id: ROLE_ID_START + 9,
        title: "Project Manager",
        category: "Management",
        description: "Responsible for planning, executing, and closing projects. Ensures that projects are completed on time, within scope, and within budget while meeting quality standards.",
        averageSalary: "$85,000 - $130,000",
        educationRequirements: ["Bachelor's degree in Business, Management, or related field", "Project Management Professional (PMP) certification"],
        experienceRequirements: ["3+ years of experience in project management", "Experience leading cross-functional teams"],
        demandOutlook: "stable",
        careerPath: {
          next: [],
          previous: []
        }
      },
      {
        id: ROLE_ID_START + 10,
        title: "Business Analyst",
        category: "Business",
        description: "Acts as a liaison between stakeholders and the development team. Gathers and documents requirements, analyzes business processes, and recommends solutions to improve efficiency and effectiveness.",
        averageSalary: "$75,000 - $110,000",
        educationRequirements: ["Bachelor's degree in Business, Finance, or related field"],
        experienceRequirements: ["2+ years of experience in business analysis", "Knowledge of business process modeling"],
        demandOutlook: "moderate growth",
        careerPath: {
          next: [],
          previous: []
        }
      },
      {
        id: ROLE_ID_START + 11,
        title: "Digital Marketing Manager",
        category: "Marketing",
        description: "Develops and implements digital marketing strategies to promote products or services. Manages campaigns across multiple channels, analyzes performance metrics, and optimizes for better results.",
        averageSalary: "$80,000 - $120,000",
        educationRequirements: ["Bachelor's degree in Marketing, Communications, or related field"],
        experienceRequirements: ["3+ years of experience in digital marketing", "Experience with marketing analytics and automation tools"],
        demandOutlook: "moderate growth",
        careerPath: {
          next: [],
          previous: []
        }
      }
    ];
    
    // All roles combined
    const allRoles = [...techRoles, ...dataRoles, ...businessRoles];
    
    // Create Industries
    const industries = [
      {
        id: INDUSTRY_ID_START,
        name: "Technology",
        category: "Information Technology",
        description: "The technology industry encompasses companies that research, develop, manufacture, or distribute digital technology including software, hardware, electronics, semiconductors, internet, telecom equipment, e-commerce, and AI.",
        trendDescription: "The technology industry is experiencing rapid growth driven by digital transformation across all sectors. Cloud computing, artificial intelligence, and cybersecurity are areas of particular expansion.",
        growthOutlook: "high growth",
        disruptiveTechnologies: ["Artificial Intelligence", "Blockchain", "Quantum Computing", "Edge Computing", "5G"],
        regulations: ["GDPR", "CCPA", "HIPAA", "PCI DSS"]
      },
      {
        id: INDUSTRY_ID_START + 1,
        name: "Data & Analytics",
        category: "Information Technology",
        description: "The data and analytics industry focuses on helping organizations collect, process, analyze, and derive insights from data to improve decision-making and create business value.",
        trendDescription: "Data-driven decision making is becoming crucial across all industries, driving growth in data analytics. Organizations are investing heavily in data infrastructure, analytics tools, and talent.",
        growthOutlook: "high growth",
        disruptiveTechnologies: ["Big Data", "Machine Learning", "Natural Language Processing", "Predictive Analytics", "Real-time Analytics"],
        regulations: ["GDPR", "CCPA", "Data Sovereignty Laws"]
      },
      {
        id: INDUSTRY_ID_START + 2,
        name: "Financial Services",
        category: "Finance",
        description: "The financial services industry encompasses a broad range of organizations that manage money, including banks, credit unions, insurance companies, investment funds, and fintech companies.",
        trendDescription: "Financial services are being transformed by technology, with traditional institutions facing competition from fintech startups. Automation, blockchain, and AI are reshaping how financial services are delivered.",
        growthOutlook: "moderate growth",
        disruptiveTechnologies: ["Blockchain", "Robotic Process Automation", "AI-powered Risk Assessment", "Digital Banking"],
        regulations: ["Basel III", "Dodd-Frank", "MiFID II", "PSD2"]
      }
    ];
    
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
    
    // Save industries to database
    console.log('Saving industries to database...');
    for (const industryData of industries) {
      await IndustryModel.findOneAndUpdate(
        { id: industryData.id },
        industryData,
        { upsert: true, new: true }
      );
    }
    console.log(`Saved ${industries.length} industries to database.`);
    
    // Create skill prerequisites
    console.log('Creating skill prerequisites...');
    const skillPrerequisites = [
      // React Development prerequisites
      { skillId: SKILL_ID_START + 1, prerequisiteId: SKILL_ID_START, importance: "critical" }, // React requires JavaScript
      
      // Node.js Backend Development prerequisites
      { skillId: SKILL_ID_START + 2, prerequisiteId: SKILL_ID_START, importance: "critical" }, // Node.js requires JavaScript
      { skillId: SKILL_ID_START + 2, prerequisiteId: SKILL_ID_START + 3, importance: "important" }, // Node.js benefits from Database Management
      
      // Machine Learning prerequisites
      { skillId: SKILL_ID_START + 5, prerequisiteId: SKILL_ID_START + 9, importance: "critical" }, // ML requires Statistical Analysis
      { skillId: SKILL_ID_START + 5, prerequisiteId: SKILL_ID_START + 6, importance: "important" }, // ML benefits from Data Analysis
      
      // Big Data Technologies prerequisites
      { skillId: SKILL_ID_START + 10, prerequisiteId: SKILL_ID_START + 3, importance: "critical" }, // Big Data requires Database Management
      { skillId: SKILL_ID_START + 10, prerequisiteId: SKILL_ID_START + 7, importance: "important" }, // Big Data benefits from SQL Programming
      
      // Data Visualization prerequisites
      { skillId: SKILL_ID_START + 8, prerequisiteId: SKILL_ID_START + 6, importance: "critical" }, // Data Viz requires Data Analysis
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
      // Frontend Developer skills
      { roleId: ROLE_ID_START, skillId: SKILL_ID_START, importance: "critical", levelRequired: 4 }, // Frontend needs JavaScript (high level)
      { roleId: ROLE_ID_START, skillId: SKILL_ID_START + 1, importance: "critical", levelRequired: 4 }, // Frontend needs React (high level)
      
      // Backend Developer skills
      { roleId: ROLE_ID_START + 1, skillId: SKILL_ID_START, importance: "important", levelRequired: 3 }, // Backend needs JavaScript (medium level)
      { roleId: ROLE_ID_START + 1, skillId: SKILL_ID_START + 2, importance: "critical", levelRequired: 4 }, // Backend needs Node.js (high level)
      { roleId: ROLE_ID_START + 1, skillId: SKILL_ID_START + 3, importance: "critical", levelRequired: 3 }, // Backend needs Database Management
      
      // Full Stack Developer skills
      { roleId: ROLE_ID_START + 2, skillId: SKILL_ID_START, importance: "critical", levelRequired: 4 }, // Full stack needs JavaScript (high level)
      { roleId: ROLE_ID_START + 2, skillId: SKILL_ID_START + 1, importance: "critical", levelRequired: 3 }, // Full stack needs React
      { roleId: ROLE_ID_START + 2, skillId: SKILL_ID_START + 2, importance: "critical", levelRequired: 3 }, // Full stack needs Node.js
      { roleId: ROLE_ID_START + 2, skillId: SKILL_ID_START + 3, importance: "important", levelRequired: 3 }, // Full stack needs Database Management
      
      // DevOps Engineer skills
      { roleId: ROLE_ID_START + 3, skillId: SKILL_ID_START + 4, importance: "critical", levelRequired: 4 }, // DevOps needs Cloud Computing
      { roleId: ROLE_ID_START + 3, skillId: SKILL_ID_START, importance: "helpful", levelRequired: 2 }, // DevOps benefits from JavaScript
      
      // Machine Learning Engineer skills
      { roleId: ROLE_ID_START + 4, skillId: SKILL_ID_START + 5, importance: "critical", levelRequired: 4 }, // ML Engineer needs Machine Learning
      { roleId: ROLE_ID_START + 4, skillId: SKILL_ID_START + 9, importance: "critical", levelRequired: 4 }, // ML Engineer needs Statistical Analysis
      { roleId: ROLE_ID_START + 4, skillId: SKILL_ID_START + 10, importance: "important", levelRequired: 3 }, // ML Engineer needs Big Data
      
      // Data Analyst skills
      { roleId: ROLE_ID_START + 5, skillId: SKILL_ID_START + 6, importance: "critical", levelRequired: 4 }, // Data Analyst needs Data Analysis
      { roleId: ROLE_ID_START + 5, skillId: SKILL_ID_START + 7, importance: "critical", levelRequired: 3 }, // Data Analyst needs SQL
      { roleId: ROLE_ID_START + 5, skillId: SKILL_ID_START + 8, importance: "critical", levelRequired: 3 }, // Data Analyst needs Data Visualization
      { roleId: ROLE_ID_START + 5, skillId: SKILL_ID_START + 9, importance: "important", levelRequired: 2 }, // Data Analyst benefits from Statistics
      
      // Data Scientist skills
      { roleId: ROLE_ID_START + 6, skillId: SKILL_ID_START + 6, importance: "critical", levelRequired: 4 }, // Data Scientist needs Data Analysis
      { roleId: ROLE_ID_START + 6, skillId: SKILL_ID_START + 9, importance: "critical", levelRequired: 4 }, // Data Scientist needs Statistics
      { roleId: ROLE_ID_START + 6, skillId: SKILL_ID_START + 5, importance: "critical", levelRequired: 4 }, // Data Scientist needs Machine Learning
      { roleId: ROLE_ID_START + 6, skillId: SKILL_ID_START + 7, importance: "important", levelRequired: 3 }, // Data Scientist needs SQL
      
      // Data Engineer skills
      { roleId: ROLE_ID_START + 7, skillId: SKILL_ID_START + 3, importance: "critical", levelRequired: 4 }, // Data Engineer needs Database Management
      { roleId: ROLE_ID_START + 7, skillId: SKILL_ID_START + 7, importance: "critical", levelRequired: 4 }, // Data Engineer needs SQL
      { roleId: ROLE_ID_START + 7, skillId: SKILL_ID_START + 10, importance: "critical", levelRequired: 3 }, // Data Engineer needs Big Data
      { roleId: ROLE_ID_START + 7, skillId: SKILL_ID_START + 4, importance: "important", levelRequired: 3 }, // Data Engineer benefits from Cloud
      
      // Business Intelligence Analyst skills
      { roleId: ROLE_ID_START + 8, skillId: SKILL_ID_START + 6, importance: "critical", levelRequired: 4 }, // BI Analyst needs Data Analysis
      { roleId: ROLE_ID_START + 8, skillId: SKILL_ID_START + 8, importance: "critical", levelRequired: 4 }, // BI Analyst needs Data Visualization
      { roleId: ROLE_ID_START + 8, skillId: SKILL_ID_START + 7, importance: "critical", levelRequired: 3 }, // BI Analyst needs SQL
      { roleId: ROLE_ID_START + 8, skillId: SKILL_ID_START + 12, importance: "important", levelRequired: 3 }, // BI Analyst benefits from Business Analysis
      
      // Project Manager skills
      { roleId: ROLE_ID_START + 9, skillId: SKILL_ID_START + 11, importance: "critical", levelRequired: 4 }, // Project Manager needs Project Management
      { roleId: ROLE_ID_START + 9, skillId: SKILL_ID_START + 12, importance: "important", levelRequired: 3 }, // Project Manager benefits from Business Analysis
      
      // Business Analyst skills
      { roleId: ROLE_ID_START + 10, skillId: SKILL_ID_START + 12, importance: "critical", levelRequired: 4 }, // Business Analyst needs Business Analysis
      { roleId: ROLE_ID_START + 10, skillId: SKILL_ID_START + 6, importance: "important", levelRequired: 2 }, // Business Analyst benefits from Data Analysis
      
      // Digital Marketing Manager skills
      { roleId: ROLE_ID_START + 11, skillId: SKILL_ID_START + 13, importance: "critical", levelRequired: 4 }, // Digital Marketing Manager needs Digital Marketing
      { roleId: ROLE_ID_START + 11, skillId: SKILL_ID_START + 6, importance: "important", levelRequired: 2 }, // Digital Marketing Manager benefits from Data Analysis
      { roleId: ROLE_ID_START + 11, skillId: SKILL_ID_START + 8, importance: "important", levelRequired: 2 }, // Digital Marketing Manager benefits from Data Visualization
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
    
    // Create role-industry relationships
    console.log('Creating role-industry relationships...');
    const roleIndustryRelationships = [
      // Technology industry roles
      { roleId: ROLE_ID_START, industryId: INDUSTRY_ID_START, prevalence: "high" }, // Frontend Developer in Technology
      { roleId: ROLE_ID_START + 1, industryId: INDUSTRY_ID_START, prevalence: "high" }, // Backend Developer in Technology
      { roleId: ROLE_ID_START + 2, industryId: INDUSTRY_ID_START, prevalence: "high" }, // Full Stack Developer in Technology
      { roleId: ROLE_ID_START + 3, industryId: INDUSTRY_ID_START, prevalence: "high" }, // DevOps Engineer in Technology
      { roleId: ROLE_ID_START + 4, industryId: INDUSTRY_ID_START, prevalence: "medium" }, // ML Engineer in Technology
      
      // Data & Analytics industry roles
      { roleId: ROLE_ID_START + 4, industryId: INDUSTRY_ID_START + 1, prevalence: "high" }, // ML Engineer in Data & Analytics
      { roleId: ROLE_ID_START + 5, industryId: INDUSTRY_ID_START + 1, prevalence: "high" }, // Data Analyst in Data & Analytics
      { roleId: ROLE_ID_START + 6, industryId: INDUSTRY_ID_START + 1, prevalence: "high" }, // Data Scientist in Data & Analytics
      { roleId: ROLE_ID_START + 7, industryId: INDUSTRY_ID_START + 1, prevalence: "high" }, // Data Engineer in Data & Analytics
      { roleId: ROLE_ID_START + 8, industryId: INDUSTRY_ID_START + 1, prevalence: "high" }, // BI Analyst in Data & Analytics
      
      // Financial Services industry roles
      { roleId: ROLE_ID_START + 5, industryId: INDUSTRY_ID_START + 2, prevalence: "medium" }, // Data Analyst in Financial Services
      { roleId: ROLE_ID_START + 6, industryId: INDUSTRY_ID_START + 2, prevalence: "medium" }, // Data Scientist in Financial Services
      { roleId: ROLE_ID_START + 8, industryId: INDUSTRY_ID_START + 2, prevalence: "high" }, // BI Analyst in Financial Services
      { roleId: ROLE_ID_START + 9, industryId: INDUSTRY_ID_START + 2, prevalence: "high" }, // Project Manager in Financial Services
      { roleId: ROLE_ID_START + 10, industryId: INDUSTRY_ID_START + 2, prevalence: "high" }, // Business Analyst in Financial Services
    ];
    
    for (const relationship of roleIndustryRelationships) {
      const role = await RoleModel.findOne({ id: relationship.roleId });
      const industry = await IndustryModel.findOne({ id: relationship.industryId });
      
      if (role && industry) {
        await RoleIndustryModel.findOneAndUpdate(
          { roleId: relationship.roleId, industryId: relationship.industryId },
          {
            ...relationship,
            notes: `${role.title} has ${relationship.prevalence} prevalence in the ${industry.name} industry.`,
            specializations: `${role.title} in ${industry.name}`
          },
          { upsert: true, new: true }
        );
      }
    }
    console.log(`Created ${roleIndustryRelationships.length} role-industry relationships.`);
    
    // Create skill-industry relationships
    console.log('Creating skill-industry relationships...');
    const skillIndustryRelationships = [
      // Technology industry skills
      { skillId: SKILL_ID_START, industryId: INDUSTRY_ID_START, importance: "critical", trendDirection: "increasing" }, // JavaScript in Technology
      { skillId: SKILL_ID_START + 1, industryId: INDUSTRY_ID_START, importance: "critical", trendDirection: "increasing" }, // React in Technology
      { skillId: SKILL_ID_START + 2, industryId: INDUSTRY_ID_START, importance: "critical", trendDirection: "increasing" }, // Node.js in Technology
      { skillId: SKILL_ID_START + 3, industryId: INDUSTRY_ID_START, importance: "critical", trendDirection: "stable" }, // Database Management in Technology
      { skillId: SKILL_ID_START + 4, industryId: INDUSTRY_ID_START, importance: "critical", trendDirection: "increasing" }, // Cloud Computing in Technology
      { skillId: SKILL_ID_START + 5, industryId: INDUSTRY_ID_START, importance: "important", trendDirection: "increasing" }, // Machine Learning in Technology
      
      // Data & Analytics industry skills
      { skillId: SKILL_ID_START + 5, industryId: INDUSTRY_ID_START + 1, importance: "critical", trendDirection: "increasing" }, // Machine Learning in Data
      { skillId: SKILL_ID_START + 6, industryId: INDUSTRY_ID_START + 1, importance: "critical", trendDirection: "increasing" }, // Data Analysis in Data
      { skillId: SKILL_ID_START + 7, industryId: INDUSTRY_ID_START + 1, importance: "critical", trendDirection: "stable" }, // SQL in Data
      { skillId: SKILL_ID_START + 8, industryId: INDUSTRY_ID_START + 1, importance: "critical", trendDirection: "increasing" }, // Data Visualization in Data
      { skillId: SKILL_ID_START + 9, industryId: INDUSTRY_ID_START + 1, importance: "critical", trendDirection: "stable" }, // Statistical Analysis in Data
      { skillId: SKILL_ID_START + 10, industryId: INDUSTRY_ID_START + 1, importance: "critical", trendDirection: "increasing" }, // Big Data in Data
      
      // Financial Services industry skills
      { skillId: SKILL_ID_START + 6, industryId: INDUSTRY_ID_START + 2, importance: "important", trendDirection: "increasing" }, // Data Analysis in Finance
      { skillId: SKILL_ID_START + 8, industryId: INDUSTRY_ID_START + 2, importance: "important", trendDirection: "increasing" }, // Data Visualization in Finance
      { skillId: SKILL_ID_START + 11, industryId: INDUSTRY_ID_START + 2, importance: "critical", trendDirection: "stable" }, // Project Management in Finance
      { skillId: SKILL_ID_START + 12, industryId: INDUSTRY_ID_START + 2, importance: "critical", trendDirection: "increasing" }, // Business Analysis in Finance
    ];
    
    for (const relationship of skillIndustryRelationships) {
      const skill = await SkillModel.findOne({ id: relationship.skillId });
      const industry = await IndustryModel.findOne({ id: relationship.industryId });
      
      if (skill && industry) {
        await SkillIndustryModel.findOneAndUpdate(
          { skillId: relationship.skillId, industryId: relationship.industryId },
          {
            ...relationship,
            contextualApplication: `${skill.name} is ${relationship.importance} in ${industry.name} with a ${relationship.trendDirection} demand trend.`
          },
          { upsert: true, new: true }
        );
      }
    }
    console.log(`Created ${skillIndustryRelationships.length} skill-industry relationships.`);
    
    // Create career pathways
    console.log('Creating career pathways...');
    const careerPathways = [
      {
        id: ROLE_ID_START,
        name: "Frontend to Full Stack Developer",
        description: "Career progression from Frontend Developer to Full Stack Developer, focusing on acquiring backend skills while maintaining frontend expertise.",
        startingRoleId: ROLE_ID_START, // Frontend Developer
        targetRoleId: ROLE_ID_START + 2, // Full Stack Developer
        estimatedTimeYears: 2,
        steps: [
          {
            step: 1,
            roleId: ROLE_ID_START, // Frontend Developer
            timeframe: "0-12 months",
            description: "Master advanced frontend concepts and begin learning backend fundamentals",
            requiredSkills: [SKILL_ID_START, SKILL_ID_START + 1] // JavaScript, React
          },
          {
            step: 2,
            roleId: ROLE_ID_START + 2, // Full Stack Developer
            timeframe: "12-24 months",
            description: "Develop backend skills and integrate with frontend knowledge",
            requiredSkills: [SKILL_ID_START + 2, SKILL_ID_START + 3] // Node.js, Database Management
          }
        ]
      },
      {
        id: ROLE_ID_START + 1,
        name: "Data Analyst to Data Scientist",
        description: "Career progression from Data Analyst to Data Scientist, focusing on advanced statistical methods and machine learning.",
        startingRoleId: ROLE_ID_START + 5, // Data Analyst
        targetRoleId: ROLE_ID_START + 6, // Data Scientist
        estimatedTimeYears: 3,
        steps: [
          {
            step: 1,
            roleId: ROLE_ID_START + 5, // Data Analyst
            timeframe: "0-18 months",
            description: "Master data analysis techniques and learn advanced statistics",
            requiredSkills: [SKILL_ID_START + 6, SKILL_ID_START + 7, SKILL_ID_START + 8] // Data Analysis, SQL, Data Visualization
          },
          {
            step: 2,
            roleId: ROLE_ID_START + 6, // Data Scientist
            timeframe: "18-36 months",
            description: "Develop machine learning skills and apply to complex problems",
            requiredSkills: [SKILL_ID_START + 5, SKILL_ID_START + 9] // Machine Learning, Statistical Analysis
          }
        ]
      }
    ];
    
    for (const pathway of careerPathways) {
      await CareerPathwayModel.findOneAndUpdate(
        { id: pathway.id },
        pathway,
        { upsert: true, new: true }
      );
    }
    console.log(`Created ${careerPathways.length} career pathways.`);
    
    // Create learning resources
    console.log('Creating learning resources...');
    const learningResources = [
      // JavaScript resources
      {
        id: `res-${SKILL_ID_START}-1`,
        title: "Modern JavaScript From The Beginning",
        type: "course",
        provider: "Udemy",
        url: "https://www.udemy.com/course/modern-javascript-from-the-beginning/",
        description: "Learn modern JavaScript from the beginning with this comprehensive course covering ES6+ features, asynchronous programming, and DOM manipulation.",
        skillId: SKILL_ID_START, // JavaScript
        difficulty: "beginner",
        estimatedHours: 20,
        costType: "paid",
        cost: "$19.99",
        tags: ["JavaScript", "Web Development", "Frontend"],
        rating: 4.7,
        reviewCount: 12500,
        relevanceScore: 9,
        matchReason: "This comprehensive course teaches modern JavaScript fundamentals needed for web development."
      },
      
      // React resources
      {
        id: `res-${SKILL_ID_START + 1}-1`,
        title: "React - The Complete Guide",
        type: "course",
        provider: "Udemy",
        url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
        description: "Dive into React development with this comprehensive guide covering components, hooks, state management, routing, and deployment.",
        skillId: SKILL_ID_START + 1, // React
        difficulty: "intermediate",
        estimatedHours: 40,
        costType: "paid",
        cost: "$19.99",
        tags: ["React", "JavaScript", "Web Development", "Frontend"],
        rating: 4.8,
        reviewCount: 15000,
        relevanceScore: 10,
        matchReason: "This comprehensive course covers everything you need to know about modern React development."
      },
      
      // Node.js resources
      {
        id: `res-${SKILL_ID_START + 2}-1`,
        title: "Node.js API Masterclass",
        type: "course",
        provider: "Udemy",
        url: "https://www.udemy.com/course/nodejs-api-masterclass/",
        description: "Build a complete Node.js RESTful API with authentication, authorization, and database integration.",
        skillId: SKILL_ID_START + 2, // Node.js
        difficulty: "intermediate",
        estimatedHours: 30,
        costType: "paid",
        cost: "$19.99",
        tags: ["Node.js", "JavaScript", "Web Development", "Backend", "API"],
        rating: 4.7,
        reviewCount: 9800,
        relevanceScore: 9,
        matchReason: "This course focuses on building professional-grade APIs with Node.js, which is essential for backend development."
      },
      
      // Machine Learning resources
      {
        id: `res-${SKILL_ID_START + 5}-1`,
        title: "Machine Learning A-Z: Hands-On Python & R In Data Science",
        type: "course",
        provider: "Udemy",
        url: "https://www.udemy.com/course/machinelearning/",
        description: "Learn to create machine learning algorithms in Python and R, covering data preprocessing, regression, classification, clustering, and more.",
        skillId: SKILL_ID_START + 5, // Machine Learning
        difficulty: "intermediate",
        estimatedHours: 45,
        costType: "paid",
        cost: "$19.99",
        tags: ["Machine Learning", "Python", "R", "Data Science"],
        rating: 4.6,
        reviewCount: 18000,
        relevanceScore: 9,
        matchReason: "This comprehensive course covers all the essential machine learning algorithms and techniques."
      },
      
      // Data Analysis resources
      {
        id: `res-${SKILL_ID_START + 6}-1`,
        title: "Data Analysis with Python",
        type: "course",
        provider: "Coursera",
        url: "https://www.coursera.org/learn/data-analysis-with-python",
        description: "Learn data analysis with Python, including data preprocessing, visualization, and statistical analysis using pandas, numpy, and matplotlib.",
        skillId: SKILL_ID_START + 6, // Data Analysis
        difficulty: "beginner",
        estimatedHours: 25,
        costType: "free",
        cost: "0",
        tags: ["Data Analysis", "Python", "pandas", "numpy"],
        rating: 4.7,
        reviewCount: 10000,
        relevanceScore: 9,
        matchReason: "This course provides a solid foundation in data analysis using Python and its data science libraries."
      }
    ];
    
    for (const resource of learningResources) {
      await LearningResourceModel.findOneAndUpdate(
        { id: resource.id },
        resource,
        { upsert: true, new: true }
      );
    }
    console.log(`Created ${learningResources.length} learning resources.`);
    
    console.log('Comprehensive analysis dataset generated successfully!');
    return {
      skills: allSkills.length,
      roles: allRoles.length,
      industries: industries.length,
      skillPrerequisites: skillPrerequisites.length,
      roleSkillRelationships: roleSkillRelationships.length,
      roleIndustryRelationships: roleIndustryRelationships.length,
      skillIndustryRelationships: skillIndustryRelationships.length,
      careerPathways: careerPathways.length,
      learningResources: learningResources.length
    };
  } catch (error) {
    console.error('Error generating comprehensive analysis dataset:', error);
    throw error;
  }
}

// Run the function
generateAnalysisDataset()
  .then((stats) => {
    console.log('Analysis dataset generation completed with the following statistics:');
    console.table(stats);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in analysis dataset generation:', error);
    process.exit(1);
  });