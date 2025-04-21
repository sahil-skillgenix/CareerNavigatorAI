import { connectToDatabase } from './db/mongodb';
import {
  IndustryModel,
  SkillModel,
  RoleModel,
  RoleSkillModel,
  RoleIndustryModel,
  SkillIndustryModel,
  SkillPrerequisiteModel,
  LearningResourceModel,
  CareerPathwayModel
} from './db/models';

// Industry categories and skill levels
import { INDUSTRY_CATEGORIES, SKILL_CATEGORIES, SKILL_LEVELS } from '@shared/schema';

export async function seedDatabase() {
  try {
    // Connect to MongoDB first
    await connectToDatabase();
    
    // Check if data already exists
    const existingIndustries = await IndustryModel.countDocuments();
    if (existingIndustries > 0) {
      console.log('Database already seeded. Skipping seed process.');
      return;
    }

    console.log('Seeding database with initial data...');

    // Technology industry data
    const techIndustry = await IndustryModel.create({
      name: 'Information Technology',
      category: 'Technology',
      description: 'The technology industry encompasses companies that research, develop, manufacture, or distribute digital technology including software, hardware, electronics, semiconductors, internet, telecom equipment, e-commerce, and AI.',
      trends: 'Rapid growth in AI, cloud computing, IoT, and cybersecurity',
      growthOutlook: 'Strong growth projected at 5-7% annually through 2030',
      keySkillsDescription: 'Programming, data analysis, cloud infrastructure, cybersecurity, and AI/ML',
      averageSalaryRange: '$70,000 - $150,000',
      entryRequirements: 'Bachelor\'s degree in Computer Science or related field, certifications, or equivalent experience'
    });
    console.log('Seeded', await IndustryModel.countDocuments(), 'industries');

    // Technology skills
    const programmingSkill = await SkillModel.create({
      name: 'Programming',
      category: 'Technical',
      description: 'Ability to write, debug and maintain code in one or more programming languages',
      sfiaMapping: 'PROG',
      digCompMapping: '3.4',
      levelingCriteria: {
        Beginner: 'Can write basic scripts and understand fundamental programming concepts',
        Intermediate: 'Can develop moderately complex applications and understand software architecture',
        Advanced: 'Can architect complex systems and optimize code for performance',
        Expert: 'Can design innovative solutions and lead technical strategy'
      },
      relatedSkills: ['Software Development', 'Problem Solving', 'Debugging'],
      industryRelevance: ['Technology', 'Finance', 'Healthcare']
    });
    
    const cyberSecuritySkill = await SkillModel.create({
      name: 'Cybersecurity',
      category: 'Technical',
      description: 'Knowledge and skills to protect systems, networks, and programs from digital attacks',
      sfiaMapping: 'SCTY',
      digCompMapping: '4.1',
      levelingCriteria: {
        Beginner: 'Understands basic security principles and can implement simple security measures',
        Intermediate: 'Can identify threats and vulnerabilities and implement appropriate controls',
        Advanced: 'Can design comprehensive security architectures and perform advanced threat analysis',
        Expert: 'Can develop security strategy at enterprise level and lead incident response'
      },
      relatedSkills: ['Network Security', 'Risk Management', 'Compliance'],
      industryRelevance: ['Technology', 'Finance', 'Government']
    });
    console.log('Seeded', await SkillModel.countDocuments(), 'technology skills');
    
    // Healthcare skills - minimal examples
    const patientCareSkill = await SkillModel.create({
      name: 'Patient Care',
      category: 'Domain-Specific',
      description: 'Providing care and support to patients, including assessment, treatment, and monitoring',
      difficulty: 'Intermediate',
      timeToLearn: '1-2 years',
      popularity: 85,
      futureDemand: 'High',
      relatedSkills: ['Communication', 'Empathy', 'Medical Knowledge'],
      industryRelevance: ['Healthcare']
    });
    console.log('Seeded', await SkillModel.countDocuments() - 2, 'healthcare skills');
    
    // Finance skills - minimal examples
    const financialAnalysisSkill = await SkillModel.create({
      name: 'Financial Analysis',
      category: 'Analytical',
      description: 'Analyzing financial data to support business decisions and strategy',
      difficulty: 'Advanced',
      timeToLearn: '1-3 years',
      popularity: 75,
      futureDemand: 'High',
      relatedSkills: ['Statistical Analysis', 'Accounting', 'Risk Assessment'],
      industryRelevance: ['Finance', 'Technology']
    });
    console.log('Seeded', await SkillModel.countDocuments() - 3, 'finance skills');
    
    // Technology roles
    const softwareEngineerRole = await RoleModel.create({
      title: 'Software Engineer',
      category: 'Technology',
      description: 'Designs, develops, and maintains software applications and systems',
      responsibilities: ['Write code', 'Debug issues', 'Design software architecture', 'Collaborate with team members'],
      educationRequirements: 'Bachelor\'s degree in Computer Science or related field, or equivalent experience',
      experienceRequirements: '1-3 years for junior positions, 3-5 for mid-level, 5+ for senior',
      salaryRange: '$70,000 - $150,000',
      growthOutlook: 'Strong demand expected to continue for the next decade',
      workEnvironment: 'Usually office-based with remote options available'
    });
    
    const cyberSecurityAnalystRole = await RoleModel.create({
      title: 'Cybersecurity Analyst',
      category: 'Technology',
      description: 'Protects computer systems and networks from information disclosure, theft, and damage',
      responsibilities: ['Monitor security systems', 'Investigate breaches', 'Implement security measures', 'Conduct risk assessments'],
      educationRequirements: 'Bachelor\'s degree in Cybersecurity, IT, or related field, plus relevant certifications',
      experienceRequirements: '2-4 years in IT security or related field',
      salaryRange: '$75,000 - $130,000',
      growthOutlook: 'Very high demand due to increasing security threats',
      workEnvironment: 'Office environment with potential on-call responsibilities'
    });
    console.log('Seeded', await RoleModel.countDocuments(), 'technology roles');
    
    // Healthcare roles - minimal examples
    const registeredNurseRole = await RoleModel.create({
      title: 'Registered Nurse',
      category: 'Healthcare',
      description: 'Provides patient care in various healthcare settings',
      responsibilities: ['Patient assessment', 'Administering medications', 'Patient advocacy', 'Documentation'],
      educationRequirements: 'Bachelor\'s or Associate\'s degree in Nursing and RN license',
      salaryRange: '$60,000 - $120,000'
    });
    console.log('Seeded', await RoleModel.countDocuments() - 2, 'healthcare roles');
    
    // Finance roles - minimal examples
    const financialAnalystRole = await RoleModel.create({
      title: 'Financial Analyst',
      category: 'Finance',
      description: 'Analyzes financial data to guide business decisions',
      responsibilities: ['Financial modeling', 'Budget analysis', 'Forecasting', 'Investment evaluation'],
      educationRequirements: 'Bachelor\'s degree in Finance, Economics, or related field',
      salaryRange: '$65,000 - $110,000'
    });
    console.log('Seeded', await RoleModel.countDocuments() - 3, 'finance roles');
    
    // Role-Skill relationships
    await RoleSkillModel.create({
      roleId: softwareEngineerRole._id,
      skillId: programmingSkill._id,
      importance: 'Essential',
      levelRequired: 'Advanced',
      context: 'Core skill required for day-to-day responsibilities'
    });
    
    await RoleSkillModel.create({
      roleId: cyberSecurityAnalystRole._id,
      skillId: cyberSecuritySkill._id,
      importance: 'Essential',
      levelRequired: 'Advanced',
      context: 'Primary skill needed to perform job duties'
    });
    
    await RoleSkillModel.create({
      roleId: registeredNurseRole._id,
      skillId: patientCareSkill._id,
      importance: 'Essential',
      levelRequired: 'Advanced',
      context: 'Fundamental to providing quality healthcare'
    });
    
    await RoleSkillModel.create({
      roleId: financialAnalystRole._id,
      skillId: financialAnalysisSkill._id,
      importance: 'Essential',
      levelRequired: 'Advanced',
      context: 'Core responsibility of the role'
    });
    console.log('Seeded', await RoleSkillModel.countDocuments(), 'role-skill relationships');
    
    // Role-Industry relationships
    await RoleIndustryModel.create({
      roleId: softwareEngineerRole._id,
      industryId: techIndustry._id,
      prevalence: 'High',
      notes: 'Core role within the technology industry',
      specializations: 'Web Developer, Mobile Developer, Backend Engineer'
    });
    
    await RoleIndustryModel.create({
      roleId: cyberSecurityAnalystRole._id,
      industryId: techIndustry._id,
      prevalence: 'High',
      notes: 'Critical role as security concerns increase',
      specializations: 'Network Security Specialist, Security Architect, Penetration Tester'
    });
    console.log('Seeded', await RoleIndustryModel.countDocuments(), 'role-industry relationships');
    
    // Skill-Industry relationships
    await SkillIndustryModel.create({
      skillId: programmingSkill._id,
      industryId: techIndustry._id,
      importance: 'Essential',
      trendDirection: 'Growing',
      contextualApplication: 'Development of applications, systems, and services that form the backbone of tech companies'
    });
    
    await SkillIndustryModel.create({
      skillId: cyberSecuritySkill._id,
      industryId: techIndustry._id,
      importance: 'Essential',
      trendDirection: 'Growing',
      contextualApplication: 'Protection of systems, data, and infrastructure from cyber threats'
    });
    console.log('Seeded', await SkillIndustryModel.countDocuments(), 'skill-industry relationships');
    
    // Skill prerequisites relationships
    await SkillPrerequisiteModel.create({
      skillId: cyberSecuritySkill._id,
      prerequisiteId: programmingSkill._id,
      importance: 'Helpful',
      notes: 'Understanding programming helps with scripting security tools and understanding vulnerabilities'
    });
    console.log('Seeded', await SkillPrerequisiteModel.countDocuments(), 'skill prerequisites');
    
    // Learning resources
    await LearningResourceModel.create({
      title: 'Complete Web Development Bootcamp',
      type: 'Course',
      provider: 'Udemy',
      url: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/',
      description: 'Comprehensive course covering HTML, CSS, JavaScript, Node.js, and more',
      skillId: programmingSkill._id,
      difficulty: 'Beginner',
      estimatedHours: 60,
      costType: 'Paid',
      tags: ['Web Development', 'JavaScript', 'Full Stack'],
      rating: 4.7
    });
    
    await LearningResourceModel.create({
      title: 'CompTIA Security+ Certification',
      type: 'Certification',
      provider: 'CompTIA',
      url: 'https://www.comptia.org/certifications/security',
      description: 'Industry-standard certification covering core security skills',
      skillId: cyberSecuritySkill._id,
      difficulty: 'Intermediate',
      estimatedHours: 100,
      costType: 'Paid',
      tags: ['Cybersecurity', 'Certification', 'IT Security'],
      rating: 4.5
    });
    console.log('Seeded', await LearningResourceModel.countDocuments(), 'learning resources');
    
    // Career pathways
    await CareerPathwayModel.create({
      name: 'Junior to Senior Software Engineer',
      description: 'Progression path from entry-level to senior software engineering roles',
      startingRoleId: softwareEngineerRole._id,
      targetRoleId: softwareEngineerRole._id, // Same role but higher level
      estimatedTimeYears: 5,
      steps: [
        {
          title: 'Junior Software Engineer',
          duration: '1-2 years',
          keySkills: ['Basic programming', 'Version control', 'Testing'],
          description: 'Focus on learning coding standards and contributing to team projects'
        },
        {
          title: 'Mid-level Software Engineer',
          duration: '2-3 years',
          keySkills: ['System design', 'Advanced programming', 'Mentoring'],
          description: 'Take on more complex tasks and begin leading smaller projects'
        },
        {
          title: 'Senior Software Engineer',
          duration: 'Ongoing',
          keySkills: ['Architecture', 'Technical leadership', 'Strategic thinking'],
          description: 'Lead major projects and guide technical decisions'
        }
      ]
    });
    console.log('Seeded', await CareerPathwayModel.countDocuments(), 'career pathways');
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}