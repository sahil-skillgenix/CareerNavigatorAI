/**
 * This script adds an expanded set of skills, roles, and industries to the database
 */

import { connectToMongoDB, disconnectFromMongoDB } from '../mongodb-storage';
import { SkillModel, RoleModel, IndustryModel, RoleSkillModel } from '../db/models';
import { randomBytes } from 'crypto';

// Constants for reference to SFIA and DigComp frameworks
const SFIA_LEVELS = [
  "Level 1 - Follow",
  "Level 2 - Assist",
  "Level 3 - Apply",
  "Level 4 - Enable",
  "Level 5 - Ensure/Advise",
  "Level 6 - Initiate/Influence",
  "Level 7 - Set Strategy/Inspire"
];

const DIGCOMP_LEVELS = [
  "Foundation - Level 1",
  "Foundation - Level 2",
  "Intermediate - Level 3",
  "Intermediate - Level 4",
  "Advanced - Level 5",
  "Advanced - Level 6",
  "Highly Specialized - Level 7",
  "Highly Specialized - Level 8"
];

// EXPANDED SKILLS LIST - ACROSS ALL MAJOR CATEGORIES
const EXPANDED_SKILLS = [
  // Technical Skills
  {
    name: "JavaScript Programming",
    category: "Development",
    description: "Core programming language for web development, enabling interactive and dynamic content on websites.",
    demandTrend: "increasing",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 3-5"
  },
  {
    name: "Python Programming",
    category: "Development",
    description: "Versatile programming language used for web development, data analysis, AI, machine learning, and automation.",
    demandTrend: "increasing",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 3-5"
  },
  {
    name: "Java Programming",
    category: "Development",
    description: "Object-oriented programming language used for enterprise applications, Android development, and large-scale systems.",
    demandTrend: "stable",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 3-5"
  },
  {
    name: "C# Programming",
    category: "Development",
    description: "Microsoft programming language used for Windows applications, game development with Unity, and enterprise software.",
    demandTrend: "stable",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 3-5"
  },
  {
    name: "SQL",
    category: "Data",
    description: "Standard language for managing and querying relational databases.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 2-5"
  },
  {
    name: "React.js",
    category: "Frontend Development",
    description: "JavaScript library for building user interfaces, particularly single-page applications.",
    demandTrend: "increasing",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 3-5"
  },
  {
    name: "Vue.js",
    category: "Frontend Development",
    description: "Progressive JavaScript framework for building user interfaces and single-page applications.",
    demandTrend: "increasing",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 3-5"
  },
  {
    name: "Angular",
    category: "Frontend Development",
    description: "TypeScript-based web application framework led by Google for building single-page client applications.",
    demandTrend: "stable",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 3-5"
  },
  {
    name: "Node.js",
    category: "Backend Development",
    description: "JavaScript runtime built on Chrome's V8 JavaScript engine for building scalable network applications.",
    demandTrend: "increasing",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 3-5"
  },
  {
    name: "Express.js",
    category: "Backend Development",
    description: "Fast, unopinionated, minimalist web framework for Node.js.",
    demandTrend: "increasing",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 3-5"
  },
  {
    name: "Django",
    category: "Backend Development",
    description: "High-level Python web framework that follows the model-template-view architectural pattern.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 3-5"
  },
  {
    name: "Ruby on Rails",
    category: "Backend Development",
    description: "Server-side web application framework written in Ruby that follows the model-view-controller (MVC) pattern.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 3-5"
  },
  {
    name: "Spring Boot",
    category: "Backend Development",
    description: "Java-based framework used to create microservices and stand-alone Spring applications.",
    demandTrend: "stable",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 3-6"
  },
  {
    name: "Docker",
    category: "DevOps",
    description: "Platform for developing, shipping, and running applications in containers.",
    demandTrend: "increasing",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 3-5"
  },
  {
    name: "Kubernetes",
    category: "DevOps",
    description: "Open-source system for automating deployment, scaling, and management of containerized applications.",
    demandTrend: "increasing",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 4-6"
  },
  {
    name: "AWS",
    category: "Cloud",
    description: "Amazon Web Services - comprehensive cloud computing platform offering over 200 services.",
    demandTrend: "increasing",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 3-6"
  },
  {
    name: "Azure",
    category: "Cloud",
    description: "Microsoft's cloud computing platform for building, testing, deploying, and managing applications.",
    demandTrend: "increasing",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 3-6"
  },
  {
    name: "Google Cloud Platform",
    category: "Cloud",
    description: "Suite of cloud computing services that runs on the same infrastructure that Google uses internally.",
    demandTrend: "increasing",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 3-6"
  },
  {
    name: "Git",
    category: "Development Tools",
    description: "Distributed version control system for tracking changes in source code during software development.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 2-4"
  },
  {
    name: "TensorFlow",
    category: "AI/ML",
    description: "Open-source library for machine learning and artificial intelligence.",
    demandTrend: "increasing",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 4-6"
  },
  {
    name: "PyTorch",
    category: "AI/ML",
    description: "Open-source machine learning framework based on the Torch library.",
    demandTrend: "increasing",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 4-6"
  },
  {
    name: "Scikit-learn",
    category: "AI/ML",
    description: "Free software machine learning library for Python that features various classification, regression, and clustering algorithms.",
    demandTrend: "increasing",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 3-5"
  },
  {
    name: "Data Analysis",
    category: "Data Science",
    description: "Process of inspecting, cleansing, transforming, and modeling data to discover useful information.",
    demandTrend: "increasing",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 3-6"
  },
  {
    name: "Data Visualization",
    category: "Data Science",
    description: "Visual representation of data to help understand patterns, trends, and insights.",
    demandTrend: "increasing",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 3-5"
  },
  {
    name: "Tableau",
    category: "Data Science",
    description: "Interactive data visualization software focused on business intelligence.",
    demandTrend: "increasing",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 3-5"
  },
  {
    name: "Power BI",
    category: "Data Science",
    description: "Business analytics service by Microsoft that provides interactive visualizations and business intelligence capabilities.",
    demandTrend: "increasing",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 3-5"
  },
  {
    name: "UI Design",
    category: "Design",
    description: "Process of building interfaces in software with a focus on looks or style.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    digCompFrameworkLevel: "Intermediate - Level 4"
  },
  {
    name: "UX Design",
    category: "Design",
    description: "Process of enhancing user satisfaction by improving the usability, accessibility, and pleasure provided in the interaction with a product.",
    demandTrend: "increasing",
    learningDifficulty: "medium",
    digCompFrameworkLevel: "Specialized - Level 6"
  },
  {
    name: "Photoshop",
    category: "Design",
    description: "Raster graphics editor developed and published by Adobe Inc. for Windows and macOS.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    digCompFrameworkLevel: "Intermediate - Level 4"
  },
  {
    name: "Illustrator",
    category: "Design",
    description: "Vector graphics editor developed and marketed by Adobe Inc.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    digCompFrameworkLevel: "Intermediate - Level 4"
  },
  {
    name: "Figma",
    category: "Design",
    description: "Cloud-based design tool for interface design with real-time collaboration capabilities.",
    demandTrend: "increasing",
    learningDifficulty: "medium",
    digCompFrameworkLevel: "Intermediate - Level 4"
  },
  {
    name: "Blockchain",
    category: "Emerging Tech",
    description: "Decentralized, distributed ledger that records transactions across many computers.",
    demandTrend: "stable",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 4-6"
  },
  {
    name: "AR/VR Development",
    category: "Emerging Tech",
    description: "Development of immersive experiences using augmented reality and virtual reality technologies.",
    demandTrend: "increasing",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 4-6"
  },
  {
    name: "IoT Development",
    category: "Emerging Tech",
    description: "Creating systems of interrelated computing devices, mechanical and digital machines with unique identifiers.",
    demandTrend: "increasing",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 4-6"
  },
  {
    name: "Quantum Computing",
    category: "Emerging Tech",
    description: "Study of computation systems that use quantum-mechanical phenomena to perform operations on data.",
    demandTrend: "increasing",
    learningDifficulty: "very high",
    sfiaFrameworkLevel: "Level 5-7"
  },
  {
    name: "Cybersecurity",
    category: "Security",
    description: "Practice of protecting systems, networks, and programs from digital attacks.",
    demandTrend: "increasing",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 3-7"
  },
  {
    name: "Ethical Hacking",
    category: "Security",
    description: "Authorized practice of bypassing system security to identify potential security vulnerabilities.",
    demandTrend: "increasing",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 4-6"
  },
  {
    name: "Network Security",
    category: "Security",
    description: "Policies and practices adopted to prevent and monitor unauthorized access to computer networks.",
    demandTrend: "increasing",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 3-6"
  },
  
  // Soft Skills
  {
    name: "Communication",
    category: "Soft Skills",
    description: "Ability to convey information effectively and efficiently to others in various forms.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    digCompFrameworkLevel: "All levels"
  },
  {
    name: "Leadership",
    category: "Management",
    description: "Ability to lead and influence others towards achieving a common goal.",
    demandTrend: "stable",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 4-7"
  },
  {
    name: "Project Management",
    category: "Management",
    description: "Planning, organizing and overseeing projects to ensure they're completed on time, within scope and budget.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 4-7"
  },
  {
    name: "Agile Methodologies",
    category: "Management",
    description: "Approach to project management and software development that helps teams deliver value faster.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 3-6"
  },
  {
    name: "Scrum",
    category: "Management",
    description: "Framework for developing, delivering, and sustaining complex products through iteration and incremental delivery.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 3-6"
  },
  {
    name: "Team Collaboration",
    category: "Soft Skills",
    description: "Ability to work effectively with others to achieve common goals.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    digCompFrameworkLevel: "All levels"
  },
  {
    name: "Problem Solving",
    category: "Soft Skills",
    description: "Process of finding solutions to difficult or complex issues.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    digCompFrameworkLevel: "All levels"
  },
  {
    name: "Critical Thinking",
    category: "Soft Skills",
    description: "Objective analysis and evaluation of an issue in order to form a judgment.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    digCompFrameworkLevel: "All levels"
  },
  {
    name: "Time Management",
    category: "Soft Skills",
    description: "Ability to use one's time effectively or productively, especially in the workplace.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    digCompFrameworkLevel: "All levels"
  },
  {
    name: "Emotional Intelligence",
    category: "Soft Skills",
    description: "Ability to understand, use, and manage one's own emotions in positive ways.",
    demandTrend: "increasing",
    learningDifficulty: "high",
    digCompFrameworkLevel: "All levels"
  },
  {
    name: "Negotiation",
    category: "Business Skills",
    description: "Discussion aimed at reaching an agreement between different parties.",
    demandTrend: "stable",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 4-7"
  },
  {
    name: "Presentation Skills",
    category: "Business Skills",
    description: "Ability to deliver clear, structured information effectively to a group.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    digCompFrameworkLevel: "Intermediate - Advanced"
  },
  {
    name: "Content Marketing",
    category: "Marketing",
    description: "Strategic marketing approach focused on creating valuable content to attract and retain a clearly defined audience.",
    demandTrend: "increasing",
    learningDifficulty: "medium",
    digCompFrameworkLevel: "Intermediate - Level 4"
  },
  {
    name: "SEO",
    category: "Marketing",
    description: "Process of improving the quality and quantity of website traffic by increasing visibility of a website to users of a web search engine.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    digCompFrameworkLevel: "Intermediate - Level 4"
  },
  {
    name: "Social Media Marketing",
    category: "Marketing",
    description: "Use of social media platforms to connect with audience to build brand, increase sales, and drive website traffic.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    digCompFrameworkLevel: "Intermediate - Level 4"
  },
  {
    name: "Digital Analytics",
    category: "Marketing",
    description: "Analysis of qualitative and quantitative data from your website and the competition to drive continuous improvement.",
    demandTrend: "increasing",
    learningDifficulty: "medium",
    digCompFrameworkLevel: "Intermediate - Advanced"
  },
  {
    name: "Financial Analysis",
    category: "Finance",
    description: "Assessment of the viability, stability, and profitability of a business, project, or entity.",
    demandTrend: "stable",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 4-7"
  },
  {
    name: "Budget Management",
    category: "Finance",
    description: "Planning, organizing, directing, and controlling the financial activities of a project or organization.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 4-7"
  },
  {
    name: "Investment Analysis",
    category: "Finance",
    description: "Assessing the potential return and risk of an investment opportunity.",
    demandTrend: "stable",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 5-7"
  }
];

// EXPANDED ROLES LIST - ACROSS MAJOR INDUSTRIES
const EXPANDED_ROLES = [
  // Technology Roles
  {
    title: "Full Stack Developer",
    category: "Software Development",
    description: "Develops both client and server software, handling all aspects of web application development.",
    averageSalary: "$90,000 - $140,000",
    demandOutlook: "high demand",
    experienceRequired: "2-5 years"
  },
  {
    title: "Frontend Developer",
    category: "Software Development",
    description: "Implements visual elements that users see and interact with in a web application.",
    averageSalary: "$85,000 - $130,000",
    demandOutlook: "high demand",
    experienceRequired: "1-3 years"
  },
  {
    title: "Backend Developer",
    category: "Software Development",
    description: "Builds and maintains server-side technology that powers web applications.",
    averageSalary: "$90,000 - $140,000",
    demandOutlook: "high demand",
    experienceRequired: "2-5 years"
  },
  {
    title: "Mobile App Developer",
    category: "Software Development",
    description: "Creates applications for mobile devices, including iOS and Android platforms.",
    averageSalary: "$90,000 - $140,000",
    demandOutlook: "high demand",
    experienceRequired: "2-4 years"
  },
  {
    title: "Software Engineer",
    category: "Software Development",
    description: "Applies engineering principles to software creation, designing and developing software systems.",
    averageSalary: "$95,000 - $150,000",
    demandOutlook: "high demand",
    experienceRequired: "3-5 years"
  },
  {
    title: "QA Engineer",
    category: "Software Development",
    description: "Designs and implements tests to identify software bugs and ensure product quality.",
    averageSalary: "$80,000 - $120,000",
    demandOutlook: "medium demand",
    experienceRequired: "2-4 years"
  },
  {
    title: "DevOps Engineer",
    category: "Operations",
    description: "Combines software development and IT operations to shorten system development life cycle.",
    averageSalary: "$95,000 - $150,000",
    demandOutlook: "high demand",
    experienceRequired: "3-6 years"
  },
  {
    title: "Site Reliability Engineer",
    category: "Operations",
    description: "Focuses on developing and implementing solutions that solve operational problems and automate operations tasks.",
    averageSalary: "$110,000 - $160,000",
    demandOutlook: "high demand",
    experienceRequired: "4-7 years"
  },
  {
    title: "Data Scientist",
    category: "Data Analytics",
    description: "Analyzes and interprets complex data to help organizations make better decisions.",
    averageSalary: "$100,000 - $160,000",
    demandOutlook: "high demand",
    experienceRequired: "3-5 years"
  },
  {
    title: "Data Analyst",
    category: "Data Analytics",
    description: "Collects, processes, and performs analysis on large datasets to identify trends and insights.",
    averageSalary: "$70,000 - $110,000",
    demandOutlook: "high demand",
    experienceRequired: "1-3 years"
  },
  {
    title: "Machine Learning Engineer",
    category: "Artificial Intelligence",
    description: "Designs and implements machine learning models and maintains AI systems.",
    averageSalary: "$110,000 - $170,000",
    demandOutlook: "high demand",
    experienceRequired: "3-6 years"
  },
  {
    title: "AI Research Scientist",
    category: "Artificial Intelligence",
    description: "Conducts research to advance the field of artificial intelligence and machine learning.",
    averageSalary: "$120,000 - $180,000",
    demandOutlook: "high demand",
    experienceRequired: "4-8 years with PhD"
  },
  {
    title: "Cloud Solutions Architect",
    category: "Cloud Computing",
    description: "Designs and implements cloud-based solutions tailored to business requirements.",
    averageSalary: "$120,000 - $180,000",
    demandOutlook: "high demand",
    experienceRequired: "5-8 years"
  },
  {
    title: "Cloud Engineer",
    category: "Cloud Computing",
    description: "Manages and maintains cloud infrastructure and services for organizations.",
    averageSalary: "$95,000 - $150,000",
    demandOutlook: "high demand",
    experienceRequired: "3-6 years"
  },
  {
    title: "Cybersecurity Analyst",
    category: "Information Security",
    description: "Monitors and protects information systems from security breaches and threats.",
    averageSalary: "$90,000 - $140,000",
    demandOutlook: "high demand",
    experienceRequired: "3-5 years"
  },
  {
    title: "Information Security Manager",
    category: "Information Security",
    description: "Oversees and implements security measures to protect organizational data and systems.",
    averageSalary: "$120,000 - $180,000",
    demandOutlook: "high demand",
    experienceRequired: "6-10 years"
  },
  {
    title: "Penetration Tester",
    category: "Information Security",
    description: "Conducts authorized simulated attacks on computer systems to identify security vulnerabilities.",
    averageSalary: "$90,000 - $150,000",
    demandOutlook: "high demand",
    experienceRequired: "3-6 years"
  },
  {
    title: "UX/UI Designer",
    category: "Design",
    description: "Creates visually appealing, user-friendly interfaces for websites and applications.",
    averageSalary: "$85,000 - $130,000",
    demandOutlook: "medium demand",
    experienceRequired: "2-5 years"
  },
  {
    title: "Product Designer",
    category: "Design",
    description: "Designs product concepts based on research and business requirements to address user needs.",
    averageSalary: "$90,000 - $140,000",
    demandOutlook: "medium demand",
    experienceRequired: "3-6 years"
  },
  {
    title: "Product Manager",
    category: "Product Management",
    description: "Oversees product development from conception to launch, balancing business goals with user needs.",
    averageSalary: "$100,000 - $160,000",
    demandOutlook: "medium demand",
    experienceRequired: "4-7 years"
  },
  {
    title: "Technical Product Manager",
    category: "Product Management",
    description: "Manages technical products with deep understanding of technical implications and requirements.",
    averageSalary: "$110,000 - $170,000",
    demandOutlook: "medium demand",
    experienceRequired: "4-8 years"
  },
  {
    title: "IT Project Manager",
    category: "Project Management",
    description: "Plans, executes, and closes IT projects, ensuring they're delivered on time and within budget.",
    averageSalary: "$90,000 - $150,000",
    demandOutlook: "medium demand",
    experienceRequired: "4-8 years"
  },
  {
    title: "Scrum Master",
    category: "Project Management",
    description: "Facilitates Scrum practices for development teams using Agile methodologies.",
    averageSalary: "$90,000 - $140,000",
    demandOutlook: "medium demand",
    experienceRequired: "3-6 years"
  },
  {
    title: "Technical Writer",
    category: "Content",
    description: "Creates documentation that communicates complex technical information in a clear, accessible manner.",
    averageSalary: "$70,000 - $110,000",
    demandOutlook: "medium demand",
    experienceRequired: "2-5 years"
  },
  {
    title: "Chief Technology Officer (CTO)",
    category: "Executive Leadership",
    description: "Executive-level position focused on scientific and technological issues within an organization.",
    averageSalary: "$150,000 - $300,000+",
    demandOutlook: "medium demand",
    experienceRequired: "10+ years"
  },
  {
    title: "Chief Information Officer (CIO)",
    category: "Executive Leadership",
    description: "Executive responsible for managing and implementing information technology strategies.",
    averageSalary: "$150,000 - $300,000+",
    demandOutlook: "medium demand",
    experienceRequired: "10+ years"
  },
  {
    title: "Chief Information Security Officer (CISO)",
    category: "Executive Leadership",
    description: "Executive responsible for establishing and maintaining the enterprise vision and strategy for information security.",
    averageSalary: "$150,000 - $280,000+",
    demandOutlook: "medium demand",
    experienceRequired: "10+ years"
  },
  
  // Business and Management Roles
  {
    title: "Business Analyst",
    category: "Business Analysis",
    description: "Analyzes business needs and processes to recommend improvements and solutions.",
    averageSalary: "$70,000 - $110,000",
    demandOutlook: "medium demand",
    experienceRequired: "2-5 years"
  },
  {
    title: "Management Consultant",
    category: "Business Analysis",
    description: "Provides objective advice to organizations to improve performance and efficiency.",
    averageSalary: "$90,000 - $150,000",
    demandOutlook: "medium demand",
    experienceRequired: "3-8 years"
  },
  {
    title: "Digital Marketing Manager",
    category: "Marketing",
    description: "Oversees digital marketing strategies including SEO, content marketing, and social media.",
    averageSalary: "$80,000 - $130,000",
    demandOutlook: "medium demand",
    experienceRequired: "4-7 years"
  },
  {
    title: "SEO Specialist",
    category: "Marketing",
    description: "Optimizes websites and content to increase visibility in search engine results.",
    averageSalary: "$60,000 - $90,000",
    demandOutlook: "medium demand",
    experienceRequired: "2-5 years"
  },
  {
    title: "Content Marketing Specialist",
    category: "Marketing",
    description: "Creates and manages content to attract and engage target audiences.",
    averageSalary: "$60,000 - $90,000",
    demandOutlook: "medium demand",
    experienceRequired: "2-5 years"
  },
  {
    title: "Social Media Manager",
    category: "Marketing",
    description: "Develops and implements social media strategies to support business objectives.",
    averageSalary: "$60,000 - $90,000",
    demandOutlook: "medium demand",
    experienceRequired: "2-5 years"
  },
  {
    title: "Financial Analyst",
    category: "Finance",
    description: "Analyzes financial data to guide business decisions and investment strategies.",
    averageSalary: "$70,000 - $110,000",
    demandOutlook: "medium demand",
    experienceRequired: "2-5 years"
  },
  {
    title: "Investment Banker",
    category: "Finance",
    description: "Provides financial services to corporations, governments, and individuals.",
    averageSalary: "$100,000 - $200,000+",
    demandOutlook: "medium demand",
    experienceRequired: "3-8 years"
  },
  {
    title: "Human Resources Manager",
    category: "Human Resources",
    description: "Oversees recruitment, employee relations, benefits, and overall HR strategy.",
    averageSalary: "$80,000 - $130,000",
    demandOutlook: "medium demand",
    experienceRequired: "5-8 years"
  },
  {
    title: "Talent Acquisition Specialist",
    category: "Human Resources",
    description: "Identifies, attracts, and recruits qualified candidates for organizational roles.",
    averageSalary: "$60,000 - $90,000",
    demandOutlook: "medium demand",
    experienceRequired: "2-5 years"
  },
  {
    title: "Operations Manager",
    category: "Operations",
    description: "Oversees daily operations to ensure efficiency, quality, and productivity.",
    averageSalary: "$80,000 - $130,000",
    demandOutlook: "medium demand",
    experienceRequired: "5-8 years"
  },
  {
    title: "Supply Chain Manager",
    category: "Operations",
    description: "Manages the flow of goods and services from raw materials to finished products.",
    averageSalary: "$80,000 - $130,000",
    demandOutlook: "medium demand",
    experienceRequired: "5-8 years"
  },
  {
    title: "Project Coordinator",
    category: "Project Management",
    description: "Assists project managers in organizing and managing project details and documentation.",
    averageSalary: "$50,000 - $80,000",
    demandOutlook: "medium demand",
    experienceRequired: "1-3 years"
  },
  {
    title: "Chief Executive Officer (CEO)",
    category: "Executive Leadership",
    description: "Highest-ranking executive responsible for overall management and direction of an organization.",
    averageSalary: "$150,000 - $500,000+",
    demandOutlook: "low demand (limited positions)",
    experienceRequired: "10+ years"
  },
  {
    title: "Chief Operating Officer (COO)",
    category: "Executive Leadership",
    description: "Second-in-command executive who oversees daily operational functions.",
    averageSalary: "$140,000 - $250,000+",
    demandOutlook: "low demand (limited positions)",
    experienceRequired: "10+ years"
  },
  {
    title: "Chief Financial Officer (CFO)",
    category: "Executive Leadership",
    description: "Senior executive responsible for managing financial actions of a company.",
    averageSalary: "$140,000 - $250,000+",
    demandOutlook: "low demand (limited positions)",
    experienceRequired: "10+ years"
  },
  
  // Healthcare Roles
  {
    title: "Healthcare Administrator",
    category: "Healthcare Management",
    description: "Manages healthcare facilities, ensuring efficient operations and quality patient care.",
    averageSalary: "$80,000 - $130,000",
    demandOutlook: "high demand",
    experienceRequired: "5-8 years"
  },
  {
    title: "Health Informatics Specialist",
    category: "Healthcare IT",
    description: "Manages and analyzes healthcare data to improve patient care and organizational efficiency.",
    averageSalary: "$70,000 - $110,000",
    demandOutlook: "high demand",
    experienceRequired: "3-6 years"
  },
  {
    title: "Medical Records Technician",
    category: "Healthcare IT",
    description: "Organizes and manages health information data, ensuring quality, accuracy, and security.",
    averageSalary: "$40,000 - $60,000",
    demandOutlook: "medium demand",
    experienceRequired: "1-3 years"
  },
  
  // Education Roles
  {
    title: "Educational Technologist",
    category: "Education",
    description: "Develops and implements technology-based learning solutions in educational settings.",
    averageSalary: "$60,000 - $90,000",
    demandOutlook: "medium demand",
    experienceRequired: "3-5 years"
  },
  {
    title: "Instructional Designer",
    category: "Education",
    description: "Creates educational experiences that make learning more effective and engaging.",
    averageSalary: "$60,000 - $90,000",
    demandOutlook: "medium demand",
    experienceRequired: "2-5 years"
  },
  {
    title: "E-Learning Developer",
    category: "Education",
    description: "Designs and develops digital learning content and experiences.",
    averageSalary: "$60,000 - $90,000",
    demandOutlook: "medium demand",
    experienceRequired: "2-5 years"
  }
];

// EXPANDED INDUSTRIES LIST
const EXPANDED_INDUSTRIES = [
  {
    name: "Software Development",
    category: "Technology",
    description: "Creation and maintenance of applications, frameworks, and other software components.",
    growthOutlook: "high growth",
    disruptionLevel: "high",
    technologyIntensity: "very high"
  },
  {
    name: "Data Analytics",
    category: "Technology",
    description: "Examination of data sets to draw conclusions about the information they contain.",
    growthOutlook: "high growth",
    disruptionLevel: "high",
    technologyIntensity: "very high"
  },
  {
    name: "Cloud Services",
    category: "Technology",
    description: "Delivery of computing services over the internet, including servers, storage, and software.",
    growthOutlook: "high growth",
    disruptionLevel: "high",
    technologyIntensity: "very high"
  },
  {
    name: "Cybersecurity",
    category: "Technology",
    description: "Protection of computer systems from theft or damage to hardware, software, or data.",
    growthOutlook: "high growth",
    disruptionLevel: "medium",
    technologyIntensity: "high"
  },
  {
    name: "Artificial Intelligence",
    category: "Technology",
    description: "Simulation of human intelligence processes by machines, especially computer systems.",
    growthOutlook: "high growth",
    disruptionLevel: "very high",
    technologyIntensity: "very high"
  },
  {
    name: "Internet of Things",
    category: "Technology",
    description: "Network of physical objects embedded with sensors, software, and technologies to connect and exchange data.",
    growthOutlook: "high growth",
    disruptionLevel: "high",
    technologyIntensity: "very high"
  },
  {
    name: "Blockchain Technology",
    category: "Technology",
    description: "Decentralized, distributed ledger technology underpinning cryptocurrencies and other applications.",
    growthOutlook: "medium growth",
    disruptionLevel: "high",
    technologyIntensity: "very high"
  },
  {
    name: "E-commerce",
    category: "Retail & Consumer",
    description: "Buying and selling of goods and services over the internet.",
    growthOutlook: "high growth",
    disruptionLevel: "high",
    technologyIntensity: "high"
  },
  {
    name: "Digital Marketing",
    category: "Marketing & Advertising",
    description: "Marketing of products or services using digital channels and technologies.",
    growthOutlook: "high growth",
    disruptionLevel: "medium",
    technologyIntensity: "high"
  },
  {
    name: "FinTech",
    category: "Financial Services",
    description: "Technology innovations aimed at competing with traditional financial methods in the delivery of financial services.",
    growthOutlook: "high growth",
    disruptionLevel: "high",
    technologyIntensity: "very high"
  },
  {
    name: "InsurTech",
    category: "Financial Services",
    description: "Use of technology innovations designed to squeeze out savings and efficiency from the current insurance industry model.",
    growthOutlook: "medium growth",
    disruptionLevel: "medium",
    technologyIntensity: "high"
  },
  {
    name: "RegTech",
    category: "Financial Services",
    description: "Management of regulatory processes within the financial industry through technology.",
    growthOutlook: "medium growth",
    disruptionLevel: "medium",
    technologyIntensity: "high"
  },
  {
    name: "Healthcare Technology",
    category: "Healthcare",
    description: "Application of organized knowledge and skills in the form of devices, medicines, procedures, and systems.",
    growthOutlook: "high growth",
    disruptionLevel: "medium",
    technologyIntensity: "high"
  },
  {
    name: "Telemedicine",
    category: "Healthcare",
    description: "Remote delivery of healthcare services and clinical information using telecommunications technology.",
    growthOutlook: "high growth",
    disruptionLevel: "high",
    technologyIntensity: "high"
  },
  {
    name: "BioTechnology",
    category: "Healthcare",
    description: "Technology that utilizes biological systems, living organisms, or parts of them to develop products.",
    growthOutlook: "high growth",
    disruptionLevel: "high",
    technologyIntensity: "very high"
  },
  {
    name: "EdTech",
    category: "Education",
    description: "Use of technological processes and resources to improve education.",
    growthOutlook: "high growth",
    disruptionLevel: "medium",
    technologyIntensity: "high"
  },
  {
    name: "Online Learning",
    category: "Education",
    description: "Education that takes place over the internet, often referred to as e-learning.",
    growthOutlook: "high growth",
    disruptionLevel: "high",
    technologyIntensity: "high"
  },
  {
    name: "Clean Energy",
    category: "Energy",
    description: "Energy collected from renewable resources that are naturally replenished on a human timescale.",
    growthOutlook: "high growth",
    disruptionLevel: "high",
    technologyIntensity: "high"
  },
  {
    name: "Sustainable Technology",
    category: "Energy",
    description: "Technology that considers the long-term and lasting impact of a technological innovation.",
    growthOutlook: "high growth",
    disruptionLevel: "medium",
    technologyIntensity: "high"
  },
  {
    name: "AgTech",
    category: "Agriculture",
    description: "Use of technology in agriculture, horticulture, and aquaculture to improve yield, efficiency, and profitability.",
    growthOutlook: "medium growth",
    disruptionLevel: "medium",
    technologyIntensity: "high"
  },
  {
    name: "Smart Cities",
    category: "Urban Development",
    description: "Urban area that uses different types of electronic methods and sensors to collect data for efficient resource management.",
    growthOutlook: "medium growth",
    disruptionLevel: "medium",
    technologyIntensity: "high"
  },
  {
    name: "Augmented Reality",
    category: "Extended Reality",
    description: "Interactive experience where real-world environment is enhanced with computer-generated perceptual information.",
    growthOutlook: "high growth",
    disruptionLevel: "high",
    technologyIntensity: "very high"
  },
  {
    name: "Virtual Reality",
    category: "Extended Reality",
    description: "Simulated experience that can be similar to or different from the real world.",
    growthOutlook: "high growth",
    disruptionLevel: "high",
    technologyIntensity: "very high"
  },
  {
    name: "Mixed Reality",
    category: "Extended Reality",
    description: "Merging of real and virtual worlds to produce new environments where physical and digital objects co-exist.",
    growthOutlook: "high growth",
    disruptionLevel: "high",
    technologyIntensity: "very high"
  },
  {
    name: "Space Technology",
    category: "Aerospace",
    description: "Technology developed for use in space exploration, satellites, and space stations.",
    growthOutlook: "medium growth",
    disruptionLevel: "medium",
    technologyIntensity: "very high"
  },
  {
    name: "Robotics",
    category: "Automation",
    description: "Design, construction, operation, and use of robots, as well as computer systems for their control.",
    growthOutlook: "high growth",
    disruptionLevel: "high",
    technologyIntensity: "very high"
  },
  {
    name: "Autonomous Vehicles",
    category: "Automation",
    description: "Vehicles capable of sensing their environment and operating without human involvement.",
    growthOutlook: "high growth",
    disruptionLevel: "very high",
    technologyIntensity: "very high"
  },
  {
    name: "3D Printing",
    category: "Manufacturing",
    description: "Process of making three-dimensional solid objects from a digital file.",
    growthOutlook: "medium growth",
    disruptionLevel: "medium",
    technologyIntensity: "high"
  },
  {
    name: "Smart Manufacturing",
    category: "Manufacturing",
    description: "Integration of manufacturing operations with digital technologies, smart computing and big data analytics.",
    growthOutlook: "medium growth",
    disruptionLevel: "medium",
    technologyIntensity: "high"
  },
  {
    name: "Quantum Computing",
    category: "Emerging Tech",
    description: "Area of computing focused on developing computer technologies based on quantum theory principles.",
    growthOutlook: "medium growth",
    disruptionLevel: "very high",
    technologyIntensity: "very high"
  },
  {
    name: "Nanotechnology",
    category: "Emerging Tech",
    description: "Manipulation of matter on an atomic, molecular, and supramolecular scale.",
    growthOutlook: "medium growth",
    disruptionLevel: "high",
    technologyIntensity: "very high"
  }
];

// ROLE-SKILL MAPPINGS - Example relationships that will be used to create role-skill connections
// For each role, we'll attach a set of relevant skills with importance levels
const ROLE_SKILL_MAPPINGS = [
  {
    roleTitle: "Full Stack Developer", 
    skills: [
      { skillName: "JavaScript Programming", importance: "critical", levelRequired: "advanced" },
      { skillName: "React.js", importance: "critical", levelRequired: "advanced" },
      { skillName: "Node.js", importance: "critical", levelRequired: "advanced" },
      { skillName: "Express.js", importance: "critical", levelRequired: "advanced" },
      { skillName: "SQL", importance: "important", levelRequired: "intermediate" },
      { skillName: "Git", importance: "important", levelRequired: "intermediate" },
      { skillName: "Docker", importance: "useful", levelRequired: "basic" },
      { skillName: "AWS", importance: "useful", levelRequired: "basic" }
    ]
  },
  {
    roleTitle: "Data Scientist", 
    skills: [
      { skillName: "Python Programming", importance: "critical", levelRequired: "advanced" },
      { skillName: "Data Analysis", importance: "critical", levelRequired: "advanced" },
      { skillName: "Data Visualization", importance: "critical", levelRequired: "advanced" },
      { skillName: "Machine Learning", importance: "critical", levelRequired: "advanced" },
      { skillName: "SQL", importance: "important", levelRequired: "intermediate" },
      { skillName: "TensorFlow", importance: "important", levelRequired: "intermediate" },
      { skillName: "PyTorch", importance: "useful", levelRequired: "intermediate" },
      { skillName: "Problem Solving", importance: "important", levelRequired: "advanced" }
    ]
  },
  {
    roleTitle: "DevOps Engineer", 
    skills: [
      { skillName: "Docker", importance: "critical", levelRequired: "advanced" },
      { skillName: "Kubernetes", importance: "critical", levelRequired: "advanced" },
      { skillName: "AWS", importance: "critical", levelRequired: "advanced" },
      { skillName: "Git", importance: "important", levelRequired: "intermediate" },
      { skillName: "Python Programming", importance: "important", levelRequired: "intermediate" },
      { skillName: "Linux", importance: "critical", levelRequired: "advanced" },
      { skillName: "Problem Solving", importance: "important", levelRequired: "advanced" },
      { skillName: "Team Collaboration", importance: "important", levelRequired: "intermediate" }
    ]
  },
  {
    roleTitle: "UX/UI Designer", 
    skills: [
      { skillName: "UI Design", importance: "critical", levelRequired: "advanced" },
      { skillName: "UX Design", importance: "critical", levelRequired: "advanced" },
      { skillName: "Figma", importance: "critical", levelRequired: "advanced" },
      { skillName: "Photoshop", importance: "important", levelRequired: "intermediate" },
      { skillName: "Illustrator", importance: "important", levelRequired: "intermediate" },
      { skillName: "Problem Solving", importance: "important", levelRequired: "intermediate" },
      { skillName: "Communication", importance: "important", levelRequired: "advanced" },
      { skillName: "Team Collaboration", importance: "important", levelRequired: "intermediate" }
    ]
  },
  {
    roleTitle: "Cybersecurity Analyst", 
    skills: [
      { skillName: "Cybersecurity", importance: "critical", levelRequired: "advanced" },
      { skillName: "Network Security", importance: "critical", levelRequired: "advanced" },
      { skillName: "Ethical Hacking", importance: "important", levelRequired: "intermediate" },
      { skillName: "Linux", importance: "important", levelRequired: "intermediate" },
      { skillName: "Python Programming", importance: "useful", levelRequired: "intermediate" },
      { skillName: "Problem Solving", importance: "important", levelRequired: "advanced" },
      { skillName: "Critical Thinking", importance: "important", levelRequired: "advanced" }
    ]
  }
];

// Function to add all skills to the database
async function addAllSkills() {
  console.log("Adding skills to the database...");
  const skillsPromises = EXPANDED_SKILLS.map(async (skillData, index) => {
    // Create a unique ID for each skill starting at 101 (to avoid conflicts with existing data)
    const id = 101 + index;

    try {
      // Check if skill already exists
      const existingSkill = await SkillModel.findOne({ name: skillData.name });
      if (existingSkill) {
        console.log(`Skill "${skillData.name}" already exists with ID ${existingSkill.id}`);
        return existingSkill;
      }

      // Create new skill with ID
      const newSkill = new SkillModel({
        id,
        name: skillData.name,
        category: skillData.category,
        description: skillData.description,
        demandTrend: skillData.demandTrend || "stable",
        learningDifficulty: skillData.learningDifficulty || "medium",
        sfiaFrameworkLevel: skillData.sfiaFrameworkLevel || null,
        digCompFrameworkLevel: skillData.digCompFrameworkLevel || null
      });

      await newSkill.save();
      console.log(`Added skill: ${skillData.name} with ID ${id}`);
      return newSkill;
    } catch (error) {
      console.error(`Error adding skill "${skillData.name}":`, error);
      return null;
    }
  });

  const results = await Promise.all(skillsPromises);
  console.log(`Added ${results.filter(Boolean).length} skills to the database`);
  return results.filter(Boolean);
}

// Function to add all roles to the database
async function addAllRoles() {
  console.log("Adding roles to the database...");
  const rolesPromises = EXPANDED_ROLES.map(async (roleData, index) => {
    // Create a unique ID for each role starting at 101 (to avoid conflicts with existing data)
    const id = 101 + index;

    try {
      // Check if role already exists
      const existingRole = await RoleModel.findOne({ title: roleData.title });
      if (existingRole) {
        console.log(`Role "${roleData.title}" already exists with ID ${existingRole.id}`);
        return existingRole;
      }

      // Create new role with ID
      const newRole = new RoleModel({
        id,
        title: roleData.title,
        category: roleData.category,
        description: roleData.description,
        averageSalary: roleData.averageSalary || null,
        demandOutlook: roleData.demandOutlook || "medium demand",
        experienceRequired: roleData.experienceRequired || null,
        educationRequired: roleData.educationRequired || null
      });

      await newRole.save();
      console.log(`Added role: ${roleData.title} with ID ${id}`);
      return newRole;
    } catch (error) {
      console.error(`Error adding role "${roleData.title}":`, error);
      return null;
    }
  });

  const results = await Promise.all(rolesPromises);
  console.log(`Added ${results.filter(Boolean).length} roles to the database`);
  return results.filter(Boolean);
}

// Function to add all industries to the database
async function addAllIndustries() {
  console.log("Adding industries to the database...");
  const industriesPromises = EXPANDED_INDUSTRIES.map(async (industryData, index) => {
    // Create a unique ID for each industry starting at 101 (to avoid conflicts with existing data)
    const id = 101 + index;

    try {
      // Check if industry already exists
      const existingIndustry = await IndustryModel.findOne({ name: industryData.name });
      if (existingIndustry) {
        console.log(`Industry "${industryData.name}" already exists with ID ${existingIndustry.id}`);
        return existingIndustry;
      }

      // Create new industry with ID
      const newIndustry = new IndustryModel({
        id,
        name: industryData.name,
        category: industryData.category,
        description: industryData.description,
        growthOutlook: industryData.growthOutlook || "medium growth",
        disruptionLevel: industryData.disruptionLevel || "medium",
        technologyIntensity: industryData.technologyIntensity || "medium"
      });

      await newIndustry.save();
      console.log(`Added industry: ${industryData.name} with ID ${id}`);
      return newIndustry;
    } catch (error) {
      console.error(`Error adding industry "${industryData.name}":`, error);
      return null;
    }
  });

  const results = await Promise.all(industriesPromises);
  console.log(`Added ${results.filter(Boolean).length} industries to the database`);
  return results.filter(Boolean);
}

// Function to create role-skill relationships
async function createRoleSkillRelationships() {
  console.log("Creating role-skill relationships...");
  
  for (const mapping of ROLE_SKILL_MAPPINGS) {
    try {
      // Find the role ID
      const role = await RoleModel.findOne({ title: mapping.roleTitle });
      if (!role) {
        console.error(`Role "${mapping.roleTitle}" not found in database`);
        continue;
      }
      
      for (const skillMapping of mapping.skills) {
        // Find the skill ID
        const skill = await SkillModel.findOne({ name: skillMapping.skillName });
        if (!skill) {
          console.error(`Skill "${skillMapping.skillName}" not found in database`);
          continue;
        }
        
        // Check if relationship already exists
        const existingRelationship = await RoleSkillModel.findOne({
          roleId: role.id,
          skillId: skill.id
        });
        
        if (existingRelationship) {
          console.log(`Relationship between role "${role.title}" and skill "${skill.name}" already exists`);
          continue;
        }
        
        // Create the relationship
        const relationship = new RoleSkillModel({
          id: randomBytes(4).readUInt32BE(0), // Generate random ID
          roleId: role.id,
          skillId: skill.id,
          importance: skillMapping.importance,
          levelRequired: skillMapping.levelRequired,
          context: `Required for ${role.title} responsibilities`
        });
        
        await relationship.save();
        console.log(`Created relationship: ${role.title} requires ${skill.name} (${skillMapping.importance})`);
      }
      
    } catch (error) {
      console.error(`Error creating relationships for role "${mapping.roleTitle}":`, error);
    }
  }
  
  console.log("Finished creating role-skill relationships");
}

// Main function to run all operations
async function expandCareerData() {
  try {
    console.log("Starting expanded career data creation process...");
    await connectToMongoDB();
    
    // Add all entities to the database
    const skills = await addAllSkills();
    const roles = await addAllRoles();
    const industries = await addAllIndustries();
    
    // Create relationships between entities
    await createRoleSkillRelationships();
    
    console.log("Expanded career data creation completed successfully");
    console.log(`Summary: Added ${skills.length} skills, ${roles.length} roles, ${industries.length} industries`);
    
    await disconnectFromMongoDB();
    console.log("MongoDB connection closed");
    
  } catch (error) {
    console.error("Error in expanded career data creation:", error);
    await disconnectFromMongoDB();
  }
}

// Run the function if this module is executed directly
if (require.main === module) {
  expandCareerData()
    .then(() => {
      console.log("Expanded career data script completed");
      process.exit(0);
    })
    .catch(error => {
      console.error("Error running expanded career data script:", error);
      process.exit(1);
    });
}

export { expandCareerData };