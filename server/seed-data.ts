import { db } from './db';
import { 
  industries,
  skills,
  roles,
  roleSkills,
  roleIndustries,
  skillIndustries,
  skillPrerequisites,
  learningResources,
  careerPathways
} from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingIndustries = await db.select().from(industries);
    if (existingIndustries.length > 0) {
      console.log('Database already seeded. Skipping seed process.');
      return;
    }

    console.log('Seeding database with initial data...');
    // Seed Industries
    const seededIndustries = await db.insert(industries).values([
      {
        name: 'Technology',
        category: 'Technology',
        description: 'The technology industry encompasses all businesses that develop, produce, or heavily depend on technological innovations for their operations and services.',
        trends: 'Rapid innovation cycles, increasing focus on AI and ML, remote work acceleration, cybersecurity prioritization, cloud migration.',
        growthOutlook: 'Strong growth expected with 15-20% annual expansion in emerging tech sectors.',
        keySkillsDescription: 'Programming languages, cloud architecture, data analysis, AI/ML, cybersecurity, product management.',
        averageSalaryRange: '$70,000 - $180,000 depending on role and experience.',
        entryRequirements: 'Varies by role, typically requiring bachelor\'s degree in computer science or related field, or equivalent experience and technical certifications.'
      },
      {
        name: 'Healthcare',
        category: 'Healthcare',
        description: 'The healthcare industry provides medical services, manufactures medical equipment or drugs, and facilitates the provision of healthcare to patients.',
        trends: 'Telehealth expansion, personalized medicine, AI diagnostics, electronic health records optimization, preventative care focus.',
        growthOutlook: 'Steady growth of 5-7% annually with aging population driving demand.',
        keySkillsDescription: 'Medical knowledge, patient care, health informatics, regulatory compliance, healthcare administration.',
        averageSalaryRange: '$55,000 - $250,000 depending on specialization and level.',
        entryRequirements: 'Variable by role; clinical positions require specific degrees and licenses, while support roles may require relevant certifications or experience.'
      },
      {
        name: 'Finance',
        category: 'Finance',
        description: 'The financial industry includes banks, investment firms, insurance companies, and other businesses that manage money and assets.',
        trends: 'FinTech disruption, blockchain implementation, algorithmic trading, regulatory technology, personalized financial services.',
        growthOutlook: 'Moderate growth of 4-6% annually with significant disruption from technology.',
        keySkillsDescription: 'Financial analysis, regulatory knowledge, risk management, data analysis, customer relationship management.',
        averageSalaryRange: '$65,000 - $200,000 depending on specialization and seniority.',
        entryRequirements: 'Typically requires bachelor\'s degree in finance, economics, or related field; many roles require certifications like CFA, CPA, or Series licenses.'
      },
      {
        name: 'Education',
        category: 'Education',
        description: 'The education industry includes institutions and services involved in teaching and training at all levels.',
        trends: 'EdTech integration, personalized learning, micro-credentials, lifelong learning models, global education platforms.',
        growthOutlook: 'Moderate growth of 3-5% annually with significant innovation in delivery methods.',
        keySkillsDescription: 'Teaching methods, curriculum development, educational technology, student assessment, learning psychology.',
        averageSalaryRange: '$45,000 - $120,000 depending on level and specialization.',
        entryRequirements: 'Teaching positions typically require teaching credentials and relevant degrees; administrative roles may require education management experience or degrees.'
      },
      {
        name: 'Manufacturing',
        category: 'Manufacturing',
        description: 'The manufacturing industry transforms raw materials into finished products through mechanical, physical, or chemical processes.',
        trends: 'Industry 4.0 implementation, IoT integration, sustainable manufacturing, additive manufacturing/3D printing, reshoring.',
        growthOutlook: 'Variable growth of 2-4% annually with significant regional differences.',
        keySkillsDescription: 'Process optimization, quality control, supply chain management, industrial automation, lean manufacturing principles.',
        averageSalaryRange: '$50,000 - $150,000 depending on specialization and level.',
        entryRequirements: 'Varies by role; technical positions may require specific engineering degrees, while operational roles may require certifications or relevant experience.'
      },
      {
        name: 'Creative Arts & Media',
        category: 'Media',
        description: 'The creative arts and media industry encompasses entertainment, publishing, broadcasting, advertising, and digital content creation.',
        trends: 'Digital content dominance, streaming platform competition, creator economy growth, immersive media technologies, AI-assisted content creation.',
        growthOutlook: 'Variable growth of 3-8% annually with digital sectors growing most rapidly.',
        keySkillsDescription: 'Content creation, storytelling, digital production, audience engagement, multimedia skills, creative software proficiency.',
        averageSalaryRange: '$45,000 - $150,000 depending on role, platform, and recognition.',
        entryRequirements: 'Portfolio-based industry with varied paths; formal education beneficial but demonstrated skill and creativity often more important.'
      }
    ]).returning();
    
    console.log(`Seeded ${seededIndustries.length} industries`);

    // Seed Skills
    const techSkills = await db.insert(skills).values([
      {
        name: 'JavaScript Programming',
        category: 'Technical',
        description: 'Ability to write, debug, and maintain code in JavaScript, including modern ES6+ features and understanding of the event-driven, functional, and asynchronous nature of the language.',
        sfiaMapping: 'PROG - Programming/Software Development',
        digCompMapping: 'DigComp 3.4 Programming',
        levelingCriteria: JSON.stringify({
          'Beginner': 'Can write basic scripts and modify existing code',
          'Intermediate': 'Can build complete front-end applications with modern frameworks',
          'Advanced': 'Can architect complex applications and optimize performance',
          'Expert': 'Can contribute to the JavaScript ecosystem and implement cutting-edge patterns'
        }),
        relatedSkills: ['TypeScript', 'HTML/CSS', 'React', 'Node.js'],
        learningResources: JSON.stringify({
          'courses': ['JavaScript: The Complete Guide', 'Modern JavaScript From The Beginning'],
          'books': ['Eloquent JavaScript', 'You Don\'t Know JS']
        }),
        industryRelevance: ['Technology', 'Finance', 'E-commerce', 'Media']
      },
      {
        name: 'Python Programming',
        category: 'Technical',
        description: 'Ability to write, debug, and maintain code in Python, leveraging its libraries for data processing, web development, automation, and AI/ML applications.',
        sfiaMapping: 'PROG - Programming/Software Development',
        digCompMapping: 'DigComp 3.4 Programming',
        levelingCriteria: JSON.stringify({
          'Beginner': 'Can write simple scripts and use basic libraries',
          'Intermediate': 'Can build complete applications and analyze data effectively',
          'Advanced': 'Can architect complex systems and optimize performance',
          'Expert': 'Can contribute to Python ecosystem and implement ML algorithms'
        }),
        relatedSkills: ['Data Analysis', 'Machine Learning', 'Web Development', 'Automation'],
        learningResources: JSON.stringify({
          'courses': ['Complete Python Bootcamp', 'Python for Data Science and ML'],
          'books': ['Python Crash Course', 'Fluent Python']
        }),
        industryRelevance: ['Technology', 'Finance', 'Research', 'Education']
      },
      {
        name: 'Data Analysis',
        category: 'Analytical',
        description: 'Ability to interpret data, identify patterns, clean datasets, perform statistical analysis, and create visualizations to communicate insights effectively.',
        sfiaMapping: 'DTAN - Data Analysis',
        digCompMapping: 'DigComp 1.3 Managing Data, Information and Digital Content',
        levelingCriteria: JSON.stringify({
          'Beginner': 'Can perform basic data cleaning and create simple visualizations',
          'Intermediate': 'Can conduct comprehensive analyses and derive meaningful insights',
          'Advanced': 'Can design complex analytical models and lead data-driven decisions',
          'Expert': 'Can develop novel analytical methodologies and predictive models'
        }),
        relatedSkills: ['Statistics', 'SQL', 'Python', 'Data Visualization', 'Excel'],
        learningResources: JSON.stringify({
          'courses': ['Data Science and Machine Learning Bootcamp', 'Data Analysis with Pandas'],
          'books': ['Practical Statistics for Data Scientists', 'Storytelling with Data']
        }),
        industryRelevance: ['Technology', 'Finance', 'Healthcare', 'Marketing']
      },
      {
        name: 'Cloud Computing',
        category: 'Technical',
        description: 'Understanding of cloud service models (IaaS, PaaS, SaaS), ability to design and implement cloud-based solutions, and manage cloud resources effectively.',
        sfiaMapping: 'ARCH - Solution Architecture',
        digCompMapping: 'DigComp 5.2 Identifying Needs and Technological Responses',
        levelingCriteria: JSON.stringify({
          'Beginner': 'Can deploy applications on cloud platforms using existing templates',
          'Intermediate': 'Can design and implement cloud-native applications',
          'Advanced': 'Can architect complex multi-cloud solutions with security and compliance',
          'Expert': 'Can design innovative cloud strategies and optimize for scale and cost'
        }),
        relatedSkills: ['AWS', 'Azure', 'Docker', 'Kubernetes', 'DevOps'],
        learningResources: JSON.stringify({
          'courses': ['AWS Certified Solutions Architect', 'Google Cloud Professional Architect'],
          'books': ['Cloud Native Infrastructure', 'Architecting the Cloud']
        }),
        industryRelevance: ['Technology', 'Finance', 'Healthcare', 'E-commerce']
      },
      {
        name: 'Machine Learning',
        category: 'Technical',
        description: 'Ability to design, implement, and evaluate machine learning models for classification, regression, clustering, and other predictive tasks.',
        sfiaMapping: 'DENG - Data Engineering',
        digCompMapping: 'DigComp 5.3 Creatively Using Digital Technologies',
        levelingCriteria: JSON.stringify({
          'Beginner': 'Can implement basic ML algorithms and evaluate models',
          'Intermediate': 'Can develop custom models and feature engineering pipelines',
          'Advanced': 'Can design complex AI systems and optimize performance',
          'Expert': 'Can develop novel algorithms and advance state-of-the-art techniques'
        }),
        relatedSkills: ['Python', 'Statistics', 'Deep Learning', 'Data Analysis', 'TensorFlow'],
        learningResources: JSON.stringify({
          'courses': ['Machine Learning by Stanford', 'Deep Learning Specialization'],
          'books': ['Hands-On Machine Learning with Scikit-Learn and TensorFlow', 'Pattern Recognition and Machine Learning']
        }),
        industryRelevance: ['Technology', 'Finance', 'Healthcare', 'Retail']
      },
      {
        name: 'Project Management',
        category: 'Management',
        description: 'Ability to plan, execute, and close projects successfully by managing resources, schedules, risks, and stakeholder expectations.',
        sfiaMapping: 'PRMG - Project Management',
        digCompMapping: 'DigComp 4.3 Managing Digital Identity',
        levelingCriteria: JSON.stringify({
          'Beginner': 'Can manage small projects with guidance',
          'Intermediate': 'Can independently manage mid-sized projects',
          'Advanced': 'Can lead large, complex projects and programs',
          'Expert': 'Can develop project management methodologies and mentor others'
        }),
        relatedSkills: ['Leadership', 'Risk Management', 'Budgeting', 'Agile Methodologies', 'Communication'],
        learningResources: JSON.stringify({
          'courses': ['PMP Certification Prep', 'Agile Project Management'],
          'books': ['A Guide to the Project Management Body of Knowledge (PMBOK)', 'Scrum: The Art of Doing Twice the Work in Half the Time']
        }),
        industryRelevance: ['Technology', 'Construction', 'Healthcare', 'Manufacturing']
      },
      {
        name: 'Leadership',
        category: 'Soft Skills',
        description: 'Ability to inspire and guide individuals or teams toward achieving goals through vision-setting, motivation, and effective decision-making.',
        sfiaMapping: 'LEAD - Leadership',
        digCompMapping: 'DigComp 2.4 Collaborating Through Digital Technologies',
        levelingCriteria: JSON.stringify({
          'Beginner': 'Can lead small teams on defined tasks',
          'Intermediate': 'Can guide teams through complex projects and changes',
          'Advanced': 'Can develop organizational strategy and build high-performing cultures',
          'Expert': 'Can transform organizations and navigate significant challenges'
        }),
        relatedSkills: ['Communication', 'Strategic Thinking', 'Emotional Intelligence', 'Coaching', 'Decision Making'],
        learningResources: JSON.stringify({
          'courses': ['Leadership Development Program', 'Executive Leadership'],
          'books': ['Leaders Eat Last', 'The Five Dysfunctions of a Team']
        }),
        industryRelevance: ['All industries']
      },
      {
        name: 'UX/UI Design',
        category: 'Creative',
        description: 'Ability to design user interfaces and experiences that are intuitive, accessible, and delightful, based on user research and design principles.',
        sfiaMapping: 'UIDT - User Experience Design',
        digCompMapping: 'DigComp 3.1 Developing Digital Content',
        levelingCriteria: JSON.stringify({
          'Beginner': 'Can create wireframes and basic interface designs',
          'Intermediate': 'Can conduct user research and design complete user experiences',
          'Advanced': 'Can develop design systems and lead user experience strategy',
          'Expert': 'Can innovate design methodologies and shape product direction'
        }),
        relatedSkills: ['User Research', 'Wireframing', 'Prototyping', 'Visual Design', 'Accessibility'],
        learningResources: JSON.stringify({
          'courses': ['User Experience Design Immersive', 'UI/UX Design Bootcamp'],
          'books': ['Don\'t Make Me Think', 'The Design of Everyday Things']
        }),
        industryRelevance: ['Technology', 'E-commerce', 'Media', 'Finance']
      },
      {
        name: 'Digital Marketing',
        category: 'Domain-Specific',
        description: 'Ability to promote products/services through digital channels, including SEO, SEM, content marketing, social media, and email campaigns.',
        sfiaMapping: 'MKTG - Marketing',
        digCompMapping: 'DigComp 2.2 Sharing Through Digital Technologies',
        levelingCriteria: JSON.stringify({
          'Beginner': 'Can implement basic digital marketing campaigns',
          'Intermediate': 'Can develop integrated marketing strategies across channels',
          'Advanced': 'Can optimize marketing ROI and lead comprehensive strategies',
          'Expert': 'Can develop innovative marketing approaches and predict trends'
        }),
        relatedSkills: ['SEO', 'Content Creation', 'Analytics', 'Social Media Management', 'Email Marketing'],
        learningResources: JSON.stringify({
          'courses': ['Digital Marketing Specialization', 'Google Digital Marketing Certification'],
          'books': ['Digital Marketing For Dummies', 'Building a StoryBrand']
        }),
        industryRelevance: ['E-commerce', 'Media', 'Retail', 'Technology']
      },
      {
        name: 'Cybersecurity',
        category: 'Technical',
        description: 'Ability to protect systems, networks, and data from digital attacks through security protocols, tools, and best practices.',
        sfiaMapping: 'SCTY - Information Security',
        digCompMapping: 'DigComp 4.1 Protecting Devices',
        levelingCriteria: JSON.stringify({
          'Beginner': 'Can implement basic security measures and identify common vulnerabilities',
          'Intermediate': 'Can conduct security assessments and respond to incidents',
          'Advanced': 'Can design comprehensive security architectures and lead security teams',
          'Expert': 'Can develop security frameworks and counter advanced persistent threats'
        }),
        relatedSkills: ['Network Security', 'Penetration Testing', 'Security Architecture', 'Incident Response', 'Cryptography'],
        learningResources: JSON.stringify({
          'courses': ['Certified Information Systems Security Professional (CISSP)', 'Ethical Hacking'],
          'books': ['Cybersecurity Blue Team Toolkit', 'The Art of Deception']
        }),
        industryRelevance: ['Technology', 'Finance', 'Healthcare', 'Government']
      }
    ]).returning();

    console.log(`Seeded ${techSkills.length} technology skills`);

    const healthcareSkills = await db.insert(skills).values([
      {
        name: 'Clinical Care',
        category: 'Domain-Specific',
        description: 'Ability to provide direct patient care through assessment, diagnosis, treatment planning, and intervention, following evidence-based practices.',
        sfiaMapping: 'N/A',
        digCompMapping: 'DigComp 4.2 Protecting Personal Data and Privacy',
        levelingCriteria: JSON.stringify({
          'Beginner': 'Can perform basic clinical procedures under supervision',
          'Intermediate': 'Can independently manage routine patient care',
          'Advanced': 'Can handle complex cases and lead clinical teams',
          'Expert': 'Can develop clinical protocols and drive practice innovation'
        }),
        relatedSkills: ['Patient Assessment', 'Medical Knowledge', 'Treatment Planning', 'Clinical Documentation', 'Patient Education'],
        learningResources: JSON.stringify({
          'courses': ['Advanced Clinical Assessment', 'Evidence-Based Practice'],
          'books': ['Clinical Reasoning in the Health Professions', 'Bates\' Guide to Physical Examination']
        }),
        industryRelevance: ['Healthcare', 'Public Health', 'Mental Health']
      },
      {
        name: 'Healthcare Management',
        category: 'Management',
        description: 'Ability to effectively manage healthcare organizations, departments, or programs, balancing quality care, regulatory compliance, and financial performance.',
        sfiaMapping: 'MGMT - Management',
        digCompMapping: 'DigComp 5.2 Identifying Needs and Technological Responses',
        levelingCriteria: JSON.stringify({
          'Beginner': 'Can manage small healthcare teams or units',
          'Intermediate': 'Can lead departments and implement improvement initiatives',
          'Advanced': 'Can direct multiple healthcare service lines and strategic planning',
          'Expert': 'Can transform healthcare organizations and drive industry innovation'
        }),
        relatedSkills: ['Healthcare Finance', 'Quality Improvement', 'Regulatory Compliance', 'Leadership', 'Strategic Planning'],
        learningResources: JSON.stringify({
          'courses': ['Healthcare Administration MBA', 'Healthcare Quality Management'],
          'books': ['Managing Health Services Organizations and Systems', 'The Healthcare Quality Book']
        }),
        industryRelevance: ['Healthcare', 'Healthcare Insurance', 'Public Health']
      },
      {
        name: 'Health Informatics',
        category: 'Technical',
        description: 'Ability to manage and leverage healthcare data and information systems to improve patient care, operational efficiency, and clinical decision-making.',
        sfiaMapping: 'DTAN - Data Analysis',
        digCompMapping: 'DigComp 1.3 Managing Data, Information and Digital Content',
        levelingCriteria: JSON.stringify({
          'Beginner': 'Can use electronic health records and basic health IT systems',
          'Intermediate': 'Can implement and optimize health information systems',
          'Advanced': 'Can lead health IT initiatives and information governance',
          'Expert': 'Can design innovative health information architectures and standards'
        }),
        relatedSkills: ['Electronic Health Records', 'Healthcare Data Analysis', 'Clinical Decision Support', 'Healthcare IT Standards', 'Privacy & Security'],
        learningResources: JSON.stringify({
          'courses': ['Health Informatics Certification', 'Clinical Information Systems'],
          'books': ['Health Informatics: Practical Guide', 'Biomedical Informatics: Computer Applications in Health Care']
        }),
        industryRelevance: ['Healthcare', 'Healthcare IT', 'Public Health', 'Pharmaceutical']
      }
    ]).returning();
    
    console.log(`Seeded ${healthcareSkills.length} healthcare skills`);

    const financeSkills = await db.insert(skills).values([
      {
        name: 'Financial Analysis',
        category: 'Analytical',
        description: 'Ability to evaluate financial data to support decision-making, including financial statement analysis, forecasting, budgeting, and valuation.',
        sfiaMapping: 'FMIT - Financial Management',
        digCompMapping: 'DigComp 1.2 Evaluating Data, Information and Digital Content',
        levelingCriteria: JSON.stringify({
          'Beginner': 'Can perform basic financial calculations and statement analysis',
          'Intermediate': 'Can develop comprehensive financial models and forecasts',
          'Advanced': 'Can lead complex financial evaluations and investment analyses',
          'Expert': 'Can design innovative financial analysis methodologies and strategies'
        }),
        relatedSkills: ['Financial Modeling', 'Valuation', 'Accounting', 'Excel', 'Risk Assessment'],
        learningResources: JSON.stringify({
          'courses': ['Financial Analysis and Valuation', 'CFA Program'],
          'books': ['Financial Statement Analysis', 'Investment Valuation']
        }),
        industryRelevance: ['Finance', 'Consulting', 'Corporate Finance', 'Investment Management']
      },
      {
        name: 'Investment Management',
        category: 'Domain-Specific',
        description: 'Ability to manage investment portfolios to meet financial objectives, including asset allocation, security selection, and performance evaluation.',
        sfiaMapping: 'FMIT - Financial Management',
        digCompMapping: 'DigComp 5.2 Identifying Needs and Technological Responses',
        levelingCriteria: JSON.stringify({
          'Beginner': 'Can analyze securities and assist in portfolio management',
          'Intermediate': 'Can independently manage portfolios and client relationships',
          'Advanced': 'Can develop investment strategies and lead investment teams',
          'Expert': 'Can pioneer investment approaches and manage complex portfolios'
        }),
        relatedSkills: ['Portfolio Management', 'Financial Analysis', 'Risk Management', 'Asset Allocation', 'Securities Analysis'],
        learningResources: JSON.stringify({
          'courses': ['CFA Program', 'Investment Management Specialization'],
          'books': ['The Intelligent Investor', 'Modern Portfolio Theory and Investment Analysis']
        }),
        industryRelevance: ['Finance', 'Wealth Management', 'Banking', 'Insurance']
      },
      {
        name: 'Risk Management',
        category: 'Analytical',
        description: 'Ability to identify, assess, and mitigate financial, operational, and strategic risks to protect organizational value and ensure compliance.',
        sfiaMapping: 'BURM - Business Risk Management',
        digCompMapping: 'DigComp 4.4 Protecting the Environment',
        levelingCriteria: JSON.stringify({
          'Beginner': 'Can identify basic risks and implement controls',
          'Intermediate': 'Can assess complex risks and develop mitigation strategies',
          'Advanced': 'Can design enterprise risk frameworks and lead risk functions',
          'Expert': 'Can develop innovative risk methodologies and influence industry standards'
        }),
        relatedSkills: ['Risk Assessment', 'Compliance', 'Internal Controls', 'Scenario Analysis', 'Crisis Management'],
        learningResources: JSON.stringify({
          'courses': ['Financial Risk Manager (FRM)', 'Enterprise Risk Management'],
          'books': ['Against the Gods: The Remarkable Story of Risk', 'Essentials of Risk Management']
        }),
        industryRelevance: ['Finance', 'Insurance', 'Banking', 'Corporate']
      }
    ]).returning();
    
    console.log(`Seeded ${financeSkills.length} finance skills`);

    // Seed Roles
    const techRoles = await db.insert(roles).values([
      {
        title: 'Software Engineer',
        category: 'Technology',
        description: 'Designs, develops, and maintains software systems using programming languages, frameworks, and best practices to create robust and scalable applications.',
        responsibilities: [
          'Writing clean, efficient code according to specifications',
          'Designing and implementing software components and systems',
          'Debugging and troubleshooting issues in existing codebases',
          'Collaborating with cross-functional teams on product development',
          'Performing code reviews and ensuring code quality',
          'Documenting technical aspects of software solutions'
        ],
        careerPathways: JSON.stringify({
          'progression': [
            'Junior Software Engineer',
            'Software Engineer',
            'Senior Software Engineer',
            'Lead Software Engineer',
            'Software Architect',
            'Chief Technology Officer'
          ],
          'lateral': [
            'DevOps Engineer',
            'Site Reliability Engineer',
            'Machine Learning Engineer',
            'Product Manager'
          ]
        }),
        educationRequirements: 'Bachelor\'s degree in Computer Science, Software Engineering, or related field; equivalent experience may substitute formal education.',
        experienceRequirements: '0-2 years for entry-level; 3-5 years for mid-level; 5+ years for senior positions.',
        salaryRange: '$70,000 - $160,000 depending on experience, location, and specialization.',
        growthOutlook: 'Strong growth projected at 22% over the next decade, much faster than average.',
        workEnvironment: 'Typically office-based or remote work in collaborative team settings with flexible hours. Fast-paced environment with continuous learning requirements.'
      },
      {
        title: 'Data Scientist',
        category: 'Technology',
        description: 'Extracts insights from complex data using statistical analysis, machine learning, and data visualization to solve business problems and inform decision-making.',
        responsibilities: [
          'Collecting, processing, and cleaning large datasets',
          'Developing statistical models and machine learning algorithms',
          'Creating data visualizations and interpretable reports',
          'Communicating findings to technical and non-technical stakeholders',
          'Collaborating with engineering teams to implement models in production',
          'Keeping current with latest data science methodologies and tools'
        ],
        careerPathways: JSON.stringify({
          'progression': [
            'Junior Data Scientist',
            'Data Scientist',
            'Senior Data Scientist',
            'Lead Data Scientist',
            'Chief Data Scientist',
            'VP of Data Science'
          ],
          'lateral': [
            'Machine Learning Engineer',
            'Data Engineer',
            'Business Intelligence Analyst',
            'Research Scientist'
          ]
        }),
        educationRequirements: 'Master\'s or PhD in Statistics, Computer Science, Mathematics, or related field; bachelor\'s with significant experience may suffice.',
        experienceRequirements: '1-3 years for entry-level; 4-7 years for mid-level; 8+ years for senior positions.',
        salaryRange: '$85,000 - $180,000 depending on experience, education, and location.',
        growthOutlook: 'Very strong growth projected at 36% over the next decade, much faster than average.',
        workEnvironment: 'Collaborative environment working with cross-functional teams. Typically office-based or remote with flexible arrangements depending on the organization.'
      },
      {
        title: 'UX/UI Designer',
        category: 'Technology',
        description: 'Creates user-centered digital experiences by designing intuitive interfaces, conducting user research, and collaborating with development teams to implement effective designs.',
        responsibilities: [
          'Conducting user research and usability testing',
          'Creating wireframes, prototypes, and high-fidelity mockups',
          'Developing user personas and journey maps',
          'Designing responsive interfaces for various devices and screen sizes',
          'Collaborating with developers on implementation',
          'Establishing and maintaining design systems'
        ],
        careerPathways: JSON.stringify({
          'progression': [
            'Junior UX/UI Designer',
            'UX/UI Designer',
            'Senior UX/UI Designer',
            'Lead Designer',
            'UX Manager',
            'Design Director'
          ],
          'lateral': [
            'Product Designer',
            'Interaction Designer',
            'Content Strategist',
            'Product Manager'
          ]
        }),
        educationRequirements: 'Bachelor\'s degree in Design, Human-Computer Interaction, or related field; strong portfolio may substitute formal education.',
        experienceRequirements: '0-2 years for entry-level; 3-5 years for mid-level; 5+ years for senior positions.',
        salaryRange: '$65,000 - $140,000 depending on experience, location, and industry.',
        growthOutlook: 'Strong growth projected at 24% over the next decade, much faster than average.',
        workEnvironment: 'Collaborative environment working closely with product, development, and marketing teams. Typically offers flexible work arrangements in office or remote settings.'
      },
      {
        title: 'Product Manager',
        category: 'Technology',
        description: 'Leads the development and launch of products by understanding market needs, defining product vision, and coordinating cross-functional teams to deliver value to customers.',
        responsibilities: [
          'Conducting market research and competitive analysis',
          'Defining product vision, strategy, and roadmap',
          'Gathering and prioritizing product requirements',
          'Coordinating with engineering, design, and marketing teams',
          'Monitoring product performance and user feedback',
          'Making data-driven decisions for product improvements'
        ],
        careerPathways: JSON.stringify({
          'progression': [
            'Associate Product Manager',
            'Product Manager',
            'Senior Product Manager',
            'Director of Product',
            'VP of Product',
            'Chief Product Officer'
          ],
          'lateral': [
            'Product Marketing Manager',
            'Business Analyst',
            'Project Manager',
            'Entrepreneur'
          ]
        }),
        educationRequirements: 'Bachelor\'s degree in Business, Computer Science, or related field; MBA often preferred for senior positions.',
        experienceRequirements: '2-3 years for entry-level; 4-7 years for mid-level; 8+ years for senior positions.',
        salaryRange: '$80,000 - $175,000 depending on experience, industry, and location.',
        growthOutlook: 'Strong growth projected at 15% over the next decade, faster than average.',
        workEnvironment: 'Fast-paced environment requiring collaboration across multiple departments. Typically office-based with increasing remote options depending on the organization.'
      },
      {
        title: 'Cybersecurity Analyst',
        category: 'Technology',
        description: 'Protects organization\'s digital assets by monitoring systems for threats, implementing security measures, and responding to security incidents to maintain data integrity and confidentiality.',
        responsibilities: [
          'Monitoring networks and systems for security breaches',
          'Investigating security incidents and threats',
          'Implementing security tools and protocols',
          'Performing vulnerability assessments and penetration testing',
          'Developing security policies and procedures',
          'Providing security awareness training to staff'
        ],
        careerPathways: JSON.stringify({
          'progression': [
            'Junior Security Analyst',
            'Cybersecurity Analyst',
            'Senior Security Analyst',
            'Security Engineer',
            'Security Architect',
            'Chief Information Security Officer'
          ],
          'lateral': [
            'Network Administrator',
            'Systems Administrator',
            'Security Consultant',
            'Compliance Specialist'
          ]
        }),
        educationRequirements: 'Bachelor\'s degree in Cybersecurity, Computer Science, or related field; security certifications often required (CISSP, CEH, Security+).',
        experienceRequirements: '1-3 years for entry-level; 4-7 years for mid-level; 8+ years for senior positions.',
        salaryRange: '$75,000 - $160,000 depending on experience, certifications, and clearance level.',
        growthOutlook: 'Very strong growth projected at 33% over the next decade, much faster than average.',
        workEnvironment: 'High-stakes environment requiring attention to detail and quick response to incidents. May involve on-call rotations and non-standard hours during security events.'
      }
    ]).returning();
    
    console.log(`Seeded ${techRoles.length} technology roles`);

    const healthRoles = await db.insert(roles).values([
      {
        title: 'Registered Nurse',
        category: 'Healthcare',
        description: 'Provides and coordinates patient care, educates patients about health conditions, and provides advice and emotional support to patients and their families.',
        responsibilities: [
          'Assessing patient health problems and needs',
          'Developing and implementing nursing care plans',
          'Administering medications and treatments',
          'Monitoring patient condition and documenting observations',
          'Educating patients about managing their health',
          'Collaborating with healthcare team members'
        ],
        careerPathways: JSON.stringify({
          'progression': [
            'Staff Nurse',
            'Charge Nurse',
            'Nurse Manager',
            'Director of Nursing',
            'Chief Nursing Officer'
          ],
          'lateral': [
            'Nurse Educator',
            'Clinical Nurse Specialist',
            'Nurse Practitioner',
            'Healthcare Administrator'
          ]
        }),
        educationRequirements: 'Associate\'s or Bachelor\'s degree in Nursing; RN licensure required; BSN often preferred or required for advancement.',
        experienceRequirements: '0-1 year for entry-level; 3-5 years for mid-level; 5+ years for leadership positions.',
        salaryRange: '$60,000 - $120,000 depending on specialization, setting, location, and education.',
        growthOutlook: 'Strong growth projected at 9% over the next decade, faster than average.',
        workEnvironment: 'Healthcare settings including hospitals, clinics, long-term care facilities. Often involves shift work including nights, weekends, and holidays. Physically and emotionally demanding.'
      },
      {
        title: 'Healthcare Administrator',
        category: 'Healthcare',
        description: 'Plans, directs, and coordinates medical and health services, ensuring healthcare delivery systems run efficiently while complying with laws and regulations.',
        responsibilities: [
          'Managing facility operations and finances',
          'Developing goals and objectives for departments or services',
          'Ensuring compliance with healthcare laws and regulations',
          'Improving efficiency and quality of healthcare services',
          'Recruiting and supervising staff',
          'Creating work schedules and managing resources'
        ],
        careerPathways: JSON.stringify({
          'progression': [
            'Administrative Assistant',
            'Department Manager',
            'Assistant Administrator',
            'Healthcare Administrator',
            'Executive Director',
            'Chief Executive Officer'
          ],
          'lateral': [
            'Compliance Officer',
            'Quality Improvement Director',
            'Healthcare Consultant',
            'Health Information Manager'
          ]
        }),
        educationRequirements: 'Bachelor\'s degree in Healthcare Administration, Business, or related field; Master\'s degree (MHA, MBA) often required for senior positions.',
        experienceRequirements: '1-3 years for entry-level; 5-7 years for mid-level; 10+ years for executive positions.',
        salaryRange: '$70,000 - $200,000 depending on facility size, type, location, and position level.',
        growthOutlook: 'Strong growth projected at 32% over the next decade, much faster than average.',
        workEnvironment: 'Office-based in healthcare facilities such as hospitals, group practices, nursing homes, and clinics. Regular business hours with potential on-call responsibilities.'
      }
    ]).returning();
    
    console.log(`Seeded ${healthRoles.length} healthcare roles`);

    const financeRoles = await db.insert(roles).values([
      {
        title: 'Financial Analyst',
        category: 'Finance',
        description: 'Evaluates financial data, market trends, and investment opportunities to provide insights and recommendations for business decisions and investment strategies.',
        responsibilities: [
          'Analyzing financial statements and market conditions',
          'Building financial models and forecasts',
          'Evaluating investment opportunities and risks',
          'Preparing reports and presentations for management',
          'Monitoring performance of investments and business segments',
          'Recommending strategies to improve financial performance'
        ],
        careerPathways: JSON.stringify({
          'progression': [
            'Junior Financial Analyst',
            'Financial Analyst',
            'Senior Financial Analyst',
            'Finance Manager',
            'Finance Director',
            'Chief Financial Officer'
          ],
          'lateral': [
            'Investment Analyst',
            'Budget Analyst',
            'Risk Analyst',
            'Corporate Development Associate'
          ]
        }),
        educationRequirements: 'Bachelor\'s degree in Finance, Accounting, Economics, or related field; MBA or CFA often preferred for advancement.',
        experienceRequirements: '0-2 years for entry-level; 3-5 years for mid-level; 7+ years for senior positions.',
        salaryRange: '$65,000 - $150,000 depending on experience, industry, and location.',
        growthOutlook: 'Moderate growth projected at 6% over the next decade, about as fast as average.',
        workEnvironment: 'Office-based or increasingly remote, often in corporate settings, investment firms, or banks. Fast-paced environment with potential for long hours during busy periods.'
      },
      {
        title: 'Investment Manager',
        category: 'Finance',
        description: 'Oversees investment portfolios for individuals, organizations, or funds, making strategic decisions about asset allocation to achieve financial objectives while managing risk.',
        responsibilities: [
          'Developing and implementing investment strategies',
          'Conducting research on investment opportunities',
          'Managing asset allocation and portfolio diversification',
          'Monitoring market trends and economic indicators',
          'Evaluating portfolio performance and adjusting strategies',
          'Communicating with clients about investment decisions'
        ],
        careerPathways: JSON.stringify({
          'progression': [
            'Investment Analyst',
            'Portfolio Manager',
            'Senior Portfolio Manager',
            'Investment Director',
            'Chief Investment Officer'
          ],
          'lateral': [
            'Financial Advisor',
            'Hedge Fund Manager',
            'Private Equity Manager',
            'Risk Manager'
          ]
        }),
        educationRequirements: 'Bachelor\'s degree in Finance, Economics, or related field; MBA or CFA generally required for advancement.',
        experienceRequirements: '3-5 years for entry-level; 5-10 years for mid-level; 10+ years for senior positions.',
        salaryRange: '$90,000 - $250,000+ depending on experience, assets under management, and performance.',
        growthOutlook: 'Moderate growth projected at 5% over the next decade, as fast as average.',
        workEnvironment: 'Fast-paced, high-pressure environment in investment firms, banks, or wealth management companies. Often requires long hours and continuous monitoring of markets.'
      }
    ]).returning();
    
    console.log(`Seeded ${financeRoles.length} finance roles`);

    // Create role-skill relationships
    const roleSkillRelations = [];
    
    // Software Engineer skills
    const softwareEngineerRole = techRoles.find(r => r.title === 'Software Engineer');
    if (softwareEngineerRole) {
      const jsSkill = techSkills.find(s => s.name === 'JavaScript Programming');
      const pythonSkill = techSkills.find(s => s.name === 'Python Programming');
      const cloudSkill = techSkills.find(s => s.name === 'Cloud Computing');
      
      if (jsSkill) roleSkillRelations.push({
        roleId: softwareEngineerRole.id,
        skillId: jsSkill.id,
        importance: 'Essential',
        levelRequired: 'Advanced' as any,
        context: 'Used for front-end and back-end development, especially in web applications.'
      });
      
      if (pythonSkill) roleSkillRelations.push({
        roleId: softwareEngineerRole.id,
        skillId: pythonSkill.id,
        importance: 'Important',
        levelRequired: 'Intermediate',
        context: 'Used for back-end development, scripting, and automating tasks.'
      });
      
      if (cloudSkill) roleSkillRelations.push({
        roleId: softwareEngineerRole.id,
        skillId: cloudSkill.id,
        importance: 'Important',
        levelRequired: 'Intermediate',
        context: 'Needed for designing and deploying cloud-native applications.'
      });
    }
    
    // Data Scientist skills
    const dataScientistRole = techRoles.find(r => r.title === 'Data Scientist');
    if (dataScientistRole) {
      const pythonSkill = techSkills.find(s => s.name === 'Python Programming');
      const dataAnalysisSkill = techSkills.find(s => s.name === 'Data Analysis');
      const mlSkill = techSkills.find(s => s.name === 'Machine Learning');
      
      if (pythonSkill) roleSkillRelations.push({
        roleId: dataScientistRole.id,
        skillId: pythonSkill.id,
        importance: 'Essential',
        levelRequired: 'Advanced',
        context: 'Primary programming language for data analysis and machine learning.'
      });
      
      if (dataAnalysisSkill) roleSkillRelations.push({
        roleId: dataScientistRole.id,
        skillId: dataAnalysisSkill.id,
        importance: 'Essential',
        levelRequired: 'Advanced',
        context: 'Core skill for extracting insights from data and communicating findings.'
      });
      
      if (mlSkill) roleSkillRelations.push({
        roleId: dataScientistRole.id,
        skillId: mlSkill.id,
        importance: 'Essential',
        levelRequired: 'Advanced',
        context: 'Used to develop predictive models and algorithms for data-driven decisions.'
      });
    }
    
    // UX/UI Designer skills
    const uxDesignerRole = techRoles.find(r => r.title === 'UX/UI Designer');
    if (uxDesignerRole) {
      const uxSkill = techSkills.find(s => s.name === 'UX/UI Design');
      
      if (uxSkill) roleSkillRelations.push({
        roleId: uxDesignerRole.id,
        skillId: uxSkill.id,
        importance: 'Essential',
        levelRequired: 'Advanced',
        context: 'Core skill for designing intuitive, accessible, and engaging user interfaces.'
      });
    }
    
    // Product Manager skills
    const productManagerRole = techRoles.find(r => r.title === 'Product Manager');
    if (productManagerRole) {
      const projectMgmtSkill = techSkills.find(s => s.name === 'Project Management');
      const leadershipSkill = techSkills.find(s => s.name === 'Leadership');
      const dataAnalysisSkill = techSkills.find(s => s.name === 'Data Analysis');
      
      if (projectMgmtSkill) roleSkillRelations.push({
        roleId: productManagerRole.id,
        skillId: projectMgmtSkill.id,
        importance: 'Essential',
        levelRequired: 'Advanced',
        context: 'Used to coordinate product development and launch efforts across teams.'
      });
      
      if (leadershipSkill) roleSkillRelations.push({
        roleId: productManagerRole.id,
        skillId: leadershipSkill.id,
        importance: 'Essential',
        levelRequired: 'Advanced',
        context: 'Required to guide cross-functional teams and influence stakeholders without direct authority.'
      });
      
      if (dataAnalysisSkill) roleSkillRelations.push({
        roleId: productManagerRole.id,
        skillId: dataAnalysisSkill.id,
        importance: 'Important',
        levelRequired: 'Intermediate',
        context: 'Used to evaluate product performance and make data-driven decisions.'
      });
    }
    
    // Cybersecurity Analyst skills
    const securityAnalystRole = techRoles.find(r => r.title === 'Cybersecurity Analyst');
    if (securityAnalystRole) {
      const securitySkill = techSkills.find(s => s.name === 'Cybersecurity');
      const pythonSkill = techSkills.find(s => s.name === 'Python Programming');
      
      if (securitySkill) roleSkillRelations.push({
        roleId: securityAnalystRole.id,
        skillId: securitySkill.id,
        importance: 'Essential',
        levelRequired: 'Advanced',
        context: 'Core skill for identifying, assessing, and mitigating security threats.'
      });
      
      if (pythonSkill) roleSkillRelations.push({
        roleId: securityAnalystRole.id,
        skillId: pythonSkill.id,
        importance: 'Important',
        levelRequired: 'Intermediate',
        context: 'Used for security automation, scripting, and building security tools.'
      });
    }
    
    // Healthcare Administrator skills
    const healthcareAdminRole = healthRoles.find(r => r.title === 'Healthcare Administrator');
    if (healthcareAdminRole) {
      const healthcareMgmtSkill = healthcareSkills.find(s => s.name === 'Healthcare Management');
      const projectMgmtSkill = techSkills.find(s => s.name === 'Project Management');
      const leadershipSkill = techSkills.find(s => s.name === 'Leadership');
      
      if (healthcareMgmtSkill) roleSkillRelations.push({
        roleId: healthcareAdminRole.id,
        skillId: healthcareMgmtSkill.id,
        importance: 'Essential',
        levelRequired: 'Advanced',
        context: 'Core skill for managing healthcare operations, compliance, and resources.'
      });
      
      if (projectMgmtSkill) roleSkillRelations.push({
        roleId: healthcareAdminRole.id,
        skillId: projectMgmtSkill.id,
        importance: 'Important',
        levelRequired: 'Intermediate',
        context: 'Used for implementing new healthcare initiatives and improvement projects.'
      });
      
      if (leadershipSkill) roleSkillRelations.push({
        roleId: healthcareAdminRole.id,
        skillId: leadershipSkill.id,
        importance: 'Essential',
        levelRequired: 'Advanced',
        context: 'Required to lead healthcare teams and manage complex stakeholder relationships.'
      });
    }
    
    // Financial Analyst skills
    const financialAnalystRole = financeRoles.find(r => r.title === 'Financial Analyst');
    if (financialAnalystRole) {
      const finAnalysisSkill = financeSkills.find(s => s.name === 'Financial Analysis');
      const dataAnalysisSkill = techSkills.find(s => s.name === 'Data Analysis');
      
      if (finAnalysisSkill) roleSkillRelations.push({
        roleId: financialAnalystRole.id,
        skillId: finAnalysisSkill.id,
        importance: 'Essential',
        levelRequired: 'Advanced',
        context: 'Core skill for evaluating financial performance and investment opportunities.'
      });
      
      if (dataAnalysisSkill) roleSkillRelations.push({
        roleId: financialAnalystRole.id,
        skillId: dataAnalysisSkill.id,
        importance: 'Important',
        levelRequired: 'Intermediate',
        context: 'Used to analyze financial data, identify trends, and generate insights.'
      });
    }
    
    // Investment Manager skills
    const investmentManagerRole = financeRoles.find(r => r.title === 'Investment Manager');
    if (investmentManagerRole) {
      const investmentMgmtSkill = financeSkills.find(s => s.name === 'Investment Management');
      const finAnalysisSkill = financeSkills.find(s => s.name === 'Financial Analysis');
      const riskMgmtSkill = financeSkills.find(s => s.name === 'Risk Management');
      
      if (investmentMgmtSkill) roleSkillRelations.push({
        roleId: investmentManagerRole.id,
        skillId: investmentMgmtSkill.id,
        importance: 'Essential',
        levelRequired: 'Advanced',
        context: 'Core skill for managing investment portfolios and making allocation decisions.'
      });
      
      if (finAnalysisSkill) roleSkillRelations.push({
        roleId: investmentManagerRole.id,
        skillId: finAnalysisSkill.id,
        importance: 'Essential',
        levelRequired: 'Advanced',
        context: 'Used to evaluate investment opportunities and financial performance.'
      });
      
      if (riskMgmtSkill) roleSkillRelations.push({
        roleId: investmentManagerRole.id,
        skillId: riskMgmtSkill.id,
        importance: 'Essential',
        levelRequired: 'Advanced',
        context: 'Critical for assessing and mitigating investment risks in portfolios.'
      });
    }
    
    // Seed role-skill relationships
    // Cast to any to avoid TypeScript errors with enums
    const seededRoleSkills = await db.insert(roleSkills).values(roleSkillRelations as any).returning();
    console.log(`Seeded ${seededRoleSkills.length} role-skill relationships`);
    
    // Create industry-role relationships
    const roleIndustryRelations = [];
    
    // Technology industry roles
    const techIndustry = seededIndustries.find(i => i.name === 'Technology');
    if (techIndustry) {
      techRoles.forEach(role => {
        roleIndustryRelations.push({
          roleId: role.id,
          industryId: techIndustry.id,
          prevalence: 'High',
          notes: `${role.title} is a core role in the technology industry.`,
          specializations: role.title === 'Software Engineer' ? 'Web Developer, Mobile Developer, Backend Engineer, Frontend Engineer' :
                          role.title === 'Data Scientist' ? 'Machine Learning Specialist, Analytics Engineer, Research Scientist' :
                          role.title === 'UX/UI Designer' ? 'Mobile Designer, Web Designer, Product Designer' :
                          role.title === 'Product Manager' ? 'Technical Product Manager, Growth Product Manager' :
                          role.title === 'Cybersecurity Analyst' ? 'Security Engineer, Penetration Tester, Security Architect' : ''
        });
      });
      
      // Finance roles in Tech
      const financialAnalystRole = financeRoles.find(r => r.title === 'Financial Analyst');
      if (financialAnalystRole) {
        roleIndustryRelations.push({
          roleId: financialAnalystRole.id,
          industryId: techIndustry.id,
          prevalence: 'Medium',
          notes: 'Financial Analysts in tech focus on startup valuation, growth metrics, and investment in R&D.',
          specializations: 'Tech Sector Analyst, Startup Financial Analyst, R&D Investment Analyst'
        });
      }
    }
    
    // Healthcare industry roles
    const healthcareIndustry = seededIndustries.find(i => i.name === 'Healthcare');
    if (healthcareIndustry) {
      healthRoles.forEach(role => {
        roleIndustryRelations.push({
          roleId: role.id,
          industryId: healthcareIndustry.id,
          prevalence: 'High',
          notes: `${role.title} is a core role in the healthcare industry.`,
          specializations: role.title === 'Registered Nurse' ? 'ICU Nurse, Pediatric Nurse, Surgical Nurse, Oncology Nurse' :
                          role.title === 'Healthcare Administrator' ? 'Hospital Administrator, Clinic Manager, Nursing Home Administrator' : ''
        });
      });
      
      // Tech roles in Healthcare
      const dataScientistRole = techRoles.find(r => r.title === 'Data Scientist');
      if (dataScientistRole) {
        roleIndustryRelations.push({
          roleId: dataScientistRole.id,
          industryId: healthcareIndustry.id,
          prevalence: 'Medium',
          notes: 'Data Scientists in healthcare focus on clinical data, patient outcomes, and population health analytics.',
          specializations: 'Clinical Data Scientist, Healthcare Analytics Specialist, Population Health Analyst'
        });
      }
      
      const securityAnalystRole = techRoles.find(r => r.title === 'Cybersecurity Analyst');
      if (securityAnalystRole) {
        roleIndustryRelations.push({
          roleId: securityAnalystRole.id,
          industryId: healthcareIndustry.id,
          prevalence: 'Medium',
          notes: 'Cybersecurity Analysts in healthcare focus on protecting patient data and ensuring HIPAA compliance.',
          specializations: 'Healthcare Security Specialist, Medical Device Security Analyst, HIPAA Compliance Analyst'
        });
      }
    }
    
    // Finance industry roles
    const financeIndustry = seededIndustries.find(i => i.name === 'Finance');
    if (financeIndustry) {
      financeRoles.forEach(role => {
        roleIndustryRelations.push({
          roleId: role.id,
          industryId: financeIndustry.id,
          prevalence: 'High',
          notes: `${role.title} is a core role in the finance industry.`,
          specializations: role.title === 'Financial Analyst' ? 'Investment Analyst, Credit Analyst, Financial Planning Analyst' :
                          role.title === 'Investment Manager' ? 'Portfolio Manager, Wealth Manager, Asset Manager' : ''
        });
      });
      
      // Tech roles in Finance
      const dataScientistRole = techRoles.find(r => r.title === 'Data Scientist');
      if (dataScientistRole) {
        roleIndustryRelations.push({
          roleId: dataScientistRole.id,
          industryId: financeIndustry.id,
          prevalence: 'Medium',
          notes: 'Data Scientists in finance focus on risk modeling, fraud detection, and algorithmic trading.',
          specializations: 'Quantitative Analyst, Risk Modeler, Algorithmic Trading Specialist'
        });
      }
      
      const securityAnalystRole = techRoles.find(r => r.title === 'Cybersecurity Analyst');
      if (securityAnalystRole) {
        roleIndustryRelations.push({
          roleId: securityAnalystRole.id,
          industryId: financeIndustry.id,
          prevalence: 'High',
          notes: 'Cybersecurity Analysts are crucial in finance for protecting financial data and preventing fraud.',
          specializations: 'Financial Security Specialist, Fraud Prevention Analyst, Banking Security Expert'
        });
      }
    }
    
    // Seed role-industry relationships
    const seededRoleIndustries = await db.insert(roleIndustries).values(roleIndustryRelations).returning();
    console.log(`Seeded ${seededRoleIndustries.length} role-industry relationships`);
    
    // Create skill-industry relationships
    const skillIndustryRelations = [];
    
    // Technology industry skills
    const techIndustry1 = seededIndustries.find(i => i.name === 'Technology');
    if (techIndustry1) {
      techSkills.forEach(skill => {
        skillIndustryRelations.push({
          skillId: skill.id,
          industryId: techIndustry1.id,
          importance: 'Essential',
          trendDirection: 'Growing',
          contextualApplication: `${skill.name} is directly applicable in technology companies for product development and operations.`
        });
      });
    }
    
    // Healthcare industry skills
    const healthcareIndustry1 = seededIndustries.find(i => i.name === 'Healthcare');
    if (healthcareIndustry1) {
      healthcareSkills.forEach(skill => {
        skillIndustryRelations.push({
          skillId: skill.id,
          industryId: healthcareIndustry1.id,
          importance: 'Essential',
          trendDirection: 'Growing',
          contextualApplication: `${skill.name} is directly applicable in healthcare organizations for patient care and administration.`
        });
      });
      
      // Tech skills in Healthcare
      const dataAnalysisSkill = techSkills.find(s => s.name === 'Data Analysis');
      if (dataAnalysisSkill) {
        skillIndustryRelations.push({
          skillId: dataAnalysisSkill.id,
          industryId: healthcareIndustry1.id,
          importance: 'Important',
          trendDirection: 'Growing',
          contextualApplication: 'Used for analyzing patient outcomes, operational efficiency, and healthcare trends.'
        });
      }
      
      const mlSkill = techSkills.find(s => s.name === 'Machine Learning');
      if (mlSkill) {
        skillIndustryRelations.push({
          skillId: mlSkill.id,
          industryId: healthcareIndustry1.id,
          importance: 'Important',
          trendDirection: 'Growing',
          contextualApplication: 'Applied to diagnostic assistance, treatment recommendations, and predictive healthcare.'
        });
      }
    }
    
    // Finance industry skills
    const financeIndustry1 = seededIndustries.find(i => i.name === 'Finance');
    if (financeIndustry1) {
      financeSkills.forEach(skill => {
        skillIndustryRelations.push({
          skillId: skill.id,
          industryId: financeIndustry1.id,
          importance: 'Essential',
          trendDirection: 'Stable',
          contextualApplication: `${skill.name} is a core skill in financial institutions for investment management and financial operations.`
        });
      });
      
      // Tech skills in Finance
      const dataAnalysisSkill = techSkills.find(s => s.name === 'Data Analysis');
      if (dataAnalysisSkill) {
        skillIndustryRelations.push({
          skillId: dataAnalysisSkill.id,
          industryId: financeIndustry1.id,
          importance: 'Essential',
          trendDirection: 'Growing',
          contextualApplication: 'Used for financial modeling, market analysis, and investment research.'
        });
      }
      
      const mlSkill = techSkills.find(s => s.name === 'Machine Learning');
      if (mlSkill) {
        skillIndustryRelations.push({
          skillId: mlSkill.id,
          industryId: financeIndustry1.id,
          importance: 'Important',
          trendDirection: 'Growing',
          contextualApplication: 'Applied to algorithmic trading, risk assessment, and fraud detection.'
        });
      }
      
      const securitySkill = techSkills.find(s => s.name === 'Cybersecurity');
      if (securitySkill) {
        skillIndustryRelations.push({
          skillId: securitySkill.id,
          industryId: financeIndustry1.id,
          importance: 'Essential',
          trendDirection: 'Growing',
          contextualApplication: 'Critical for protecting financial data, transactions, and preventing cyber fraud.'
        });
      }
    }
    
    // Seed skill-industry relationships
    const seededSkillIndustries = await db.insert(skillIndustries).values(skillIndustryRelations).returning();
    console.log(`Seeded ${seededSkillIndustries.length} skill-industry relationships`);
    
    // Create skill prerequisites
    const skillPrereqRelations = [];
    
    // JavaScript prerequisites
    const jsSkill = techSkills.find(s => s.name === 'JavaScript Programming');
    
    // Machine Learning prerequisites
    const mlSkill = techSkills.find(s => s.name === 'Machine Learning');
    const pythonSkill = techSkills.find(s => s.name === 'Python Programming');
    const dataAnalysisSkill = techSkills.find(s => s.name === 'Data Analysis');
    
    if (mlSkill && pythonSkill && dataAnalysisSkill) {
      skillPrereqRelations.push({
        skillId: mlSkill.id,
        prerequisiteId: pythonSkill.id,
        importance: 'Essential',
        notes: 'Python is the primary programming language for implementing machine learning algorithms.'
      });
      
      skillPrereqRelations.push({
        skillId: mlSkill.id,
        prerequisiteId: dataAnalysisSkill.id,
        importance: 'Essential',
        notes: 'Data analysis is fundamental to preparing and understanding data for machine learning models.'
      });
    }
    
    // Data Analysis prerequisites
    if (dataAnalysisSkill && pythonSkill) {
      skillPrereqRelations.push({
        skillId: dataAnalysisSkill.id,
        prerequisiteId: pythonSkill.id,
        importance: 'Important',
        notes: 'Python is widely used for data analysis through libraries like Pandas and NumPy.'
      });
    }
    
    // Project Management prerequisites
    const projectMgmtSkill = techSkills.find(s => s.name === 'Project Management');
    const leadershipSkill = techSkills.find(s => s.name === 'Leadership');
    
    if (projectMgmtSkill && leadershipSkill) {
      skillPrereqRelations.push({
        skillId: projectMgmtSkill.id,
        prerequisiteId: leadershipSkill.id,
        importance: 'Important',
        notes: 'Leadership skills are crucial for effective project management and team guidance.'
      });
    }
    
    // Seed skill prerequisites
    const seededSkillPrereqs = await db.insert(skillPrerequisites).values(skillPrereqRelations).returning();
    console.log(`Seeded ${seededSkillPrereqs.length} skill prerequisites`);
    
    // Create learning resources
    const learningResourceRelations = [];
    
    // JavaScript learning resources
    if (jsSkill) {
      learningResourceRelations.push({
        title: 'Modern JavaScript From The Beginning',
        type: 'Course',
        provider: 'Udemy',
        url: 'https://www.udemy.com/course/modern-javascript-from-the-beginning/',
        description: 'Learn modern JavaScript from the beginning, including ES6+ features, asynchronous programming, and DOM manipulation.',
        skillId: jsSkill.id,
        difficulty: 'Beginner',
        estimatedHours: 40,
        costType: 'Paid',
        cost: '$12-25',
        tags: ['JavaScript', 'Web Development', 'Programming'],
        rating: 5,
        reviewCount: 8500
      });
      
      learningResourceRelations.push({
        title: 'JavaScript: The Complete Guide 2023',
        type: 'Course',
        provider: 'Udemy',
        url: 'https://www.udemy.com/course/javascript-the-complete-guide-2020-beginner-advanced/',
        description: 'Comprehensive JavaScript course covering basics to advanced concepts like OOP, async JS, and testing.',
        skillId: jsSkill.id,
        difficulty: 'Intermediate',
        estimatedHours: 52,
        costType: 'Paid',
        cost: '$12-25',
        tags: ['JavaScript', 'Web Development', 'Programming'],
        rating: 5,
        reviewCount: 5600
      });
      
      learningResourceRelations.push({
        title: 'Eloquent JavaScript',
        type: 'Book',
        provider: 'Marijn Haverbeke',
        url: 'https://eloquentjavascript.net/',
        description: 'Free online book that provides a thorough introduction to JavaScript and programming concepts.',
        skillId: jsSkill.id,
        difficulty: 'Intermediate',
        estimatedHours: 60,
        costType: 'Free',
        cost: '$0',
        tags: ['JavaScript', 'Programming', 'Book'],
        rating: 5,
        reviewCount: 2000
      });
    }
    
    // Python learning resources
    if (pythonSkill) {
      learningResourceRelations.push({
        title: 'Complete Python Bootcamp: From Zero to Hero',
        type: 'Course',
        provider: 'Udemy',
        url: 'https://www.udemy.com/course/complete-python-bootcamp/',
        description: 'Learn Python from scratch with practical exercises and projects. Covers basics to advanced topics.',
        skillId: pythonSkill.id,
        difficulty: 'Beginner',
        estimatedHours: 35,
        costType: 'Paid',
        cost: '$12-25',
        tags: ['Python', 'Programming', 'Data Science'],
        rating: 5,
        reviewCount: 12000
      });
      
      learningResourceRelations.push({
        title: 'Python Crash Course',
        type: 'Book',
        provider: 'Eric Matthes',
        url: 'https://nostarch.com/pythoncrashcourse2e',
        description: 'A hands-on, project-based introduction to programming with Python that teaches practical skills for real-world applications.',
        skillId: pythonSkill.id,
        difficulty: 'Beginner',
        estimatedHours: 50,
        costType: 'Paid',
        cost: '$30-40',
        tags: ['Python', 'Programming', 'Book'],
        rating: 5,
        reviewCount: 3500
      });
    }
    
    // Machine Learning learning resources
    if (mlSkill) {
      learningResourceRelations.push({
        title: 'Machine Learning by Stanford University',
        type: 'Course',
        provider: 'Coursera',
        url: 'https://www.coursera.org/learn/machine-learning',
        description: 'Famous course by Andrew Ng covering fundamental machine learning concepts, algorithms, and applications.',
        skillId: mlSkill.id,
        difficulty: 'Intermediate',
        estimatedHours: 60,
        costType: 'Freemium',
        cost: 'Free to audit, $49 for certificate',
        tags: ['Machine Learning', 'Data Science', 'Algorithms'],
        rating: 5,
        reviewCount: 9800
      });
      
      learningResourceRelations.push({
        title: 'Hands-On Machine Learning with Scikit-Learn and TensorFlow',
        type: 'Book',
        provider: 'Aurélien Géron',
        url: 'https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/',
        description: 'Practical guide to implementing machine learning algorithms with Python libraries like Scikit-Learn and TensorFlow.',
        skillId: mlSkill.id,
        difficulty: 'Intermediate',
        estimatedHours: 70,
        costType: 'Paid',
        cost: '$45-60',
        tags: ['Machine Learning', 'Python', 'TensorFlow', 'Book'],
        rating: 5,
        reviewCount: 2200
      });
    }
    
    // Data Analysis learning resources
    if (dataAnalysisSkill) {
      learningResourceRelations.push({
        title: 'Data Science and Machine Learning Bootcamp with R',
        type: 'Course',
        provider: 'Udemy',
        url: 'https://www.udemy.com/course/data-science-and-machine-learning-bootcamp-with-r/',
        description: 'Learn data analysis, visualization, and machine learning using R programming language.',
        skillId: dataAnalysisSkill.id,
        difficulty: 'Intermediate',
        estimatedHours: 38,
        costType: 'Paid',
        cost: '$12-25',
        tags: ['Data Analysis', 'R Programming', 'Data Science'],
        rating: 4,
        reviewCount: 4500
      });
      
      learningResourceRelations.push({
        title: 'Python for Data Analysis',
        type: 'Book',
        provider: 'Wes McKinney',
        url: 'https://www.oreilly.com/library/view/python-for-data/9781491957653/',
        description: 'Comprehensive guide to using Python for data analysis, focusing on pandas, NumPy, and data manipulation.',
        skillId: dataAnalysisSkill.id,
        difficulty: 'Intermediate',
        estimatedHours: 55,
        costType: 'Paid',
        cost: '$40-55',
        tags: ['Python', 'Data Analysis', 'pandas', 'Book'],
        rating: 5,
        reviewCount: 1800
      });
    }
    
    // Seed learning resources
    // Cast to any to avoid TypeScript errors with enums
    const seededLearningResources = await db.insert(learningResources).values(learningResourceRelations as any).returning();
    console.log(`Seeded ${seededLearningResources.length} learning resources`);
    
    // Create career pathways
    const careerPathwayRelations = [];
    
    // Software Engineer to Data Scientist pathway
    const softwareEngineerRole1 = techRoles.find(r => r.title === 'Software Engineer');
    const dataScientistRole1 = techRoles.find(r => r.title === 'Data Scientist');
    
    if (softwareEngineerRole1 && dataScientistRole1) {
      careerPathwayRelations.push({
        name: 'Software Engineer to Data Scientist',
        description: 'Transition from software engineering to data science by building on programming skills and adding data analysis and machine learning capabilities.',
        startingRoleId: softwareEngineerRole1.id,
        targetRoleId: dataScientistRole1.id,
        estimatedTimeYears: 2,
        steps: JSON.stringify([
          {
            step: 1,
            title: 'Build Data Analysis Foundation',
            duration: '6 months',
            description: 'Learn Python data analysis libraries (pandas, NumPy) and statistics fundamentals.',
            skills: ['Python Programming', 'Data Analysis', 'Statistics'],
            resources: ['Python for Data Analysis book', 'Data Analysis with Python course']
          },
          {
            step: 2,
            title: 'Develop Machine Learning Skills',
            duration: '8 months',
            description: 'Learn machine learning algorithms, model evaluation, and implementation with scikit-learn and TensorFlow.',
            skills: ['Machine Learning', 'Deep Learning', 'Model Evaluation'],
            resources: ['Machine Learning by Stanford on Coursera', 'Hands-On Machine Learning book']
          },
          {
            step: 3,
            title: 'Build Portfolio & Experience',
            duration: '10 months',
            description: 'Apply skills through personal projects, Kaggle competitions, and gradual transition to data-focused roles in current position.',
            skills: ['Data Visualization', 'Project Management', 'Communication'],
            resources: ['Kaggle competitions', 'GitHub portfolio', 'Data science meetups']
          }
        ]),
        alternativeRoutes: JSON.stringify({
          accelerated: {
            title: 'Accelerated Bootcamp Route',
            description: 'Intensive data science bootcamp followed by internship or entry-level position.',
            timeframe: '1 year',
            pros: ['Faster transition', 'Structured learning', 'Career support'],
            cons: ['Higher cost', 'Less depth in some areas', 'More competitive entry point']
          },
          gradual: {
            title: 'Gradual Role Transition',
            description: 'Move to data-adjacent software engineering roles before full transition.',
            timeframe: '2-3 years',
            pros: ['Maintain income stability', 'Build on existing role', 'Less risk'],
            cons: ['Slower transition', 'Limited focused learning time', 'Depends on employer opportunities']
          }
        })
      });
    }
    
    // Financial Analyst to Investment Manager pathway
    const financialAnalystRole1 = financeRoles.find(r => r.title === 'Financial Analyst');
    const investmentManagerRole1 = financeRoles.find(r => r.title === 'Investment Manager');
    
    if (financialAnalystRole1 && investmentManagerRole1) {
      careerPathwayRelations.push({
        name: 'Financial Analyst to Investment Manager',
        description: 'Progress from financial analysis to investment management by developing portfolio management skills, obtaining certifications, and gaining specialized experience.',
        startingRoleId: financialAnalystRole1.id,
        targetRoleId: investmentManagerRole1.id,
        estimatedTimeYears: 5,
        steps: JSON.stringify([
          {
            step: 1,
            title: 'Deepen Financial Analysis Expertise',
            duration: '1-2 years',
            description: 'Refine financial modeling, valuation techniques, and industry analysis skills while taking on more complex projects.',
            skills: ['Financial Analysis', 'Valuation', 'Industry Research'],
            resources: ['CFA Level I', 'Financial Statement Analysis courses']
          },
          {
            step: 2,
            title: 'Obtain CFA Certification',
            duration: '2-3 years',
            description: 'Complete CFA program while gaining experience in investment analysis and portfolio construction.',
            skills: ['Portfolio Theory', 'Asset Allocation', 'Ethics'],
            resources: ['CFA Program Levels II and III', 'Investment management seminars']
          },
          {
            step: 3,
            title: 'Transition to Assistant Portfolio Manager',
            duration: '1-2 years',
            description: 'Take on assistant portfolio management role to gain hands-on experience with investment decisions and client relationships.',
            skills: ['Portfolio Management', 'Client Relations', 'Risk Management'],
            resources: ['Mentorship from senior managers', 'Investment committee participation']
          }
        ]),
        alternativeRoutes: JSON.stringify({
          mbaRoute: {
            title: 'MBA Specialization Route',
            description: 'Obtain MBA with finance specialization to accelerate career progression.',
            timeframe: '3-4 years',
            pros: ['Broader business perspective', 'Strong network', 'Potential for direct entry to higher positions'],
            cons: ['Higher cost', 'Time away from workforce', 'Less specialized knowledge initially']
          },
          entrepreneurial: {
            title: 'Boutique Advisory Path',
            description: 'Gain experience in smaller investment firm with faster advancement opportunities.',
            timeframe: '4-6 years',
            pros: ['Faster responsibility growth', 'Broader skill development', 'Direct client exposure'],
            cons: ['Potentially lower initial compensation', 'Less structured development', 'Less brand recognition']
          }
        })
      });
    }
    
    // Healthcare Administrator progression pathway
    const healthcareAdminRole1 = healthRoles.find(r => r.title === 'Healthcare Administrator');
    
    if (healthcareAdminRole1) {
      careerPathwayRelations.push({
        name: 'Healthcare Administration Career Ladder',
        description: 'Progress through healthcare administration roles from department manager to executive leadership positions.',
        startingRoleId: healthcareAdminRole1.id,
        targetRoleId: null,
        estimatedTimeYears: 10,
        steps: JSON.stringify([
          {
            step: 1,
            title: 'Department Manager',
            duration: '2-3 years',
            description: 'Manage operations of a specific healthcare department, developing expertise in that clinical or operational area.',
            skills: ['Team Leadership', 'Departmental Operations', 'Budgeting'],
            resources: ['Healthcare Management Association membership', 'Department-specific certifications']
          },
          {
            step: 2,
            title: 'Director of Operations',
            duration: '3-4 years',
            description: 'Oversee multiple departments, focusing on operational efficiency, quality improvement, and staff development.',
            skills: ['Multi-department Management', 'Process Improvement', 'Leadership Development'],
            resources: ['MHA or MBA program', 'Lean Six Sigma certification', 'Healthcare operations conferences']
          },
          {
            step: 3,
            title: 'Chief Operating Officer or Executive Director',
            duration: '4+ years',
            description: 'Provide executive leadership for entire healthcare facility or organization, setting strategic direction and managing relationships with stakeholders.',
            skills: ['Strategic Planning', 'Board Relations', 'Healthcare Finance', 'Regulatory Compliance'],
            resources: ['Executive leadership programs', 'American College of Healthcare Executives fellowship', 'Healthcare policy forums']
          }
        ]),
        alternativeRoutes: JSON.stringify({
          specialization: {
            title: 'Healthcare Technology Leadership',
            description: 'Specialize in healthcare IT and technology implementation leadership.',
            timeframe: '5-8 years',
            pros: ['Growing demand', 'Higher compensation potential', 'Intersection of healthcare and technology innovation'],
            cons: ['Requires technical knowledge', 'Rapid change in technologies', 'Complex stakeholder management']
          },
          consultingPath: {
            title: 'Healthcare Consulting Route',
            description: 'Move to healthcare consulting to gain broad experience across multiple organizations.',
            timeframe: '6-10 years',
            pros: ['Diverse experience', 'Exposure to best practices', 'Higher earning potential'],
            cons: ['Travel requirements', 'Less operational stability', 'Project-based work pressure']
          }
        })
      });
    }
    
    // Seed career pathways
    const seededCareerPathways = await db.insert(careerPathways).values(careerPathwayRelations).returning();
    console.log(`Seeded ${seededCareerPathways.length} career pathways`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}