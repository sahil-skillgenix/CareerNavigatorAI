/**
 * Structured Career Pathway Form Component
 * 
 * Collects user information and generates a structured career analysis report
 * using the standardized 11-section format.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CareerAnalysisReport } from '../../../shared/reportSchema';
import { StructuredCareerAnalysisResults } from './StructuredCareerAnalysisResults';
import { fadeIn, fadeInUp, staggerChildren } from '@/lib/animations';

// Define form state interface
interface FormData {
  professionalLevel: string;
  currentSkills: string;
  educationalBackground: string;
  careerHistory: string;
  desiredRole: string;
  state: string;
  country: string;
}

// Default form values
const defaultFormData: FormData = {
  professionalLevel: 'Mid-Level',
  currentSkills: 'Project management, user research, UI/UX design, team leadership, Agile methodologies, product roadmapping, stakeholder management',
  educationalBackground: 'Bachelor\'s degree in Business Administration with a concentration in Marketing, Various product management certifications',
  careerHistory: 'Product Manager for a retail tech company (3 years), UX Designer (2 years), Marketing Specialist (2 years)',
  desiredRole: 'Data Scientist',
  state: 'California',
  country: 'United States',
};

// Professional level options
const professionalLevelOptions = [
  'Entry-Level', 
  'Junior', 
  'Mid-Level', 
  'Senior', 
  'Lead', 
  'Manager', 
  'Director', 
  'Executive'
];

/**
 * Generate a sample structured career analysis report
 */
function generateSampleReport(): CareerAnalysisReport {
  return {
    executiveSummary: {
      summary: 'This analysis provides a comprehensive transition plan for moving from a Product Manager role in retail to a Data Scientist role. It highlights the strengths in management and communication while identifying gaps in technical data skills.',
      careerGoal: 'Data Scientist',
      fitScore: {
        score: 7,
        outOf: 10,
        description: 'The fit score indicates a moderate alignment with the desired role, primarily due to the strong business acumen but a gap in specific technical skills required for data science.'
      },
      keyFindings: [
        'Strong leadership and management skills from current role.',
        'Lacks technical proficiency in data analysis and programming.',
        'Advanced education in business provides a solid foundation for data-driven decision making.'
      ]
    },
    skillMapping: {
      skillsAnalysis: 'Your current skill set shows strong business and management capabilities with limited technical data skills. This mapping highlights both your transferable skills and areas requiring development.',
      sfiaSkills: [
        {
          skill: 'Data Analysis',
          proficiency: 2,
          description: 'Basic understanding of data concepts but limited practical experience.',
          category: 'Technical'
        },
        {
          skill: 'Project Management',
          proficiency: 5,
          description: 'Strong ability to manage complex projects and deliver on time.',
          category: 'Management'
        },
        {
          skill: 'Business Analysis',
          proficiency: 4,
          description: 'Good capacity for understanding business needs and translating to technical requirements.',
          category: 'Business'
        }
      ],
      digCompSkills: [
        {
          skill: 'Data Literacy',
          proficiency: 3,
          description: 'Moderate ability to read, understand, create, and communicate data as information.',
          category: 'Information'
        },
        {
          skill: 'Digital Content Creation',
          proficiency: 4,
          description: 'Strong ability to create and edit digital content for various purposes.',
          category: 'Creation'
        }
      ],
      otherSkills: [
        {
          skill: 'Team Leadership',
          proficiency: 5,
          description: 'Excellent ability to lead and motivate teams.',
          category: 'Soft Skills'
        },
        {
          skill: 'Stakeholder Management',
          proficiency: 4,
          description: 'Good ability to manage relationships with various stakeholders.',
          category: 'Business Skills'
        }
      ]
    },
    skillGapAnalysis: {
      targetRole: 'Data Scientist',
      currentProficiencyData: {
        labels: ['Data Analysis', 'Machine Learning', 'Programming', 'Statistics', 'Data Visualization'],
        datasets: [
          {
            label: 'Current Proficiency',
            data: [2, 1, 2, 2, 3]
          }
        ]
      },
      gapAnalysisData: {
        labels: ['Data Analysis', 'Machine Learning', 'Programming', 'Statistics', 'Data Visualization'],
        datasets: [
          {
            label: 'Current Level',
            data: [2, 1, 2, 2, 3]
          },
          {
            label: 'Required Level',
            data: [5, 4, 5, 5, 4]
          }
        ]
      },
      aiAnalysis: 'Your background in product management provides valuable business context but shows significant gaps in core data science skills including programming, machine learning, and advanced statistics.',
      keyGaps: [
        {
          skill: 'Machine Learning',
          currentLevel: 1,
          requiredLevel: 4,
          gap: 3,
          priority: 'High',
          improvementSuggestion: 'Focus on online courses in ML fundamentals, followed by practical implementation projects.'
        },
        {
          skill: 'Programming (Python)',
          currentLevel: 2,
          requiredLevel: 5,
          gap: 3,
          priority: 'High',
          improvementSuggestion: 'Start with Python for Data Science courses, then build projects using pandas and scikit-learn.'
        },
        {
          skill: 'Statistics',
          currentLevel: 2,
          requiredLevel: 5,
          gap: 3,
          priority: 'Medium',
          improvementSuggestion: 'Take courses in statistical methods and probability, with emphasis on practical applications.'
        }
      ],
      keyStrengths: [
        {
          skill: 'Business Analysis',
          currentLevel: 4,
          requiredLevel: 3,
          advantage: 1,
          leverageSuggestion: 'Leverage your business knowledge to identify high-value data science applications in business contexts.'
        },
        {
          skill: 'Project Management',
          currentLevel: 5,
          requiredLevel: 2,
          advantage: 3,
          leverageSuggestion: 'Use your project management skills to lead data science initiatives once you develop technical proficiency.'
        }
      ]
    },
    careerPathwayOptions: {
      pathwayDescription: 'There are multiple viable pathways to transition from Product Management to Data Science, focusing on both academic and professional development.',
      currentRole: 'Product Manager',
      targetRole: 'Data Scientist',
      timeframe: '18-24 months',
      pathwaySteps: [
        {
          step: 'Build Technical Foundation',
          timeframe: '0-6 months',
          description: 'Focus on core programming and data manipulation skills through online courses and small projects.'
        },
        {
          step: 'Develop Advanced Skills',
          timeframe: '6-12 months',
          description: 'Learn machine learning, statistics, and specialized techniques through coursework and increasingly complex projects.'
        },
        {
          step: 'Applied Experience',
          timeframe: '12-18 months',
          description: 'Complete capstone projects, contribute to open source, or secure an internship/junior role to build practical experience.'
        },
        {
          step: 'Full Transition',
          timeframe: '18-24 months',
          description: 'Apply for entry or mid-level data scientist positions that value your combined product and data skills.'
        }
      ],
      universityPathway: [
        {
          degree: 'Master of Science in Data Science',
          institutions: [
            'University of California, Berkeley',
            'Georgia Tech (Online)',
            'University of Michigan'
          ],
          duration: '1-2 years full-time, 2-3 years part-time',
          outcomes: [
            'Comprehensive foundation in all data science aspects',
            'Strong academic credentials for research-oriented positions',
            'Access to university recruitment networks'
          ]
        },
        {
          degree: 'Graduate Certificate in Data Science',
          institutions: [
            'Stanford University',
            'Harvard Extension School',
            'MIT Professional Education'
          ],
          duration: '6-12 months part-time',
          outcomes: [
            'Focused technical skills development',
            'Credential from recognized institution',
            'Faster completion than full degree'
          ]
        }
      ],
      vocationalPathway: [
        {
          certification: 'Professional Data Science Bootcamp',
          providers: [
            'Galvanize Data Science Immersive',
            'Metis Data Science Bootcamp',
            'BrainStation Data Science Program'
          ],
          duration: '12-16 weeks full-time',
          outcomes: [
            'Intensive, focused skill development',
            'Project portfolio for employers',
            'Career services and placement assistance'
          ]
        },
        {
          certification: 'Professional Certifications',
          providers: [
            'Google Data Analytics Professional Certificate',
            'IBM Data Science Professional Certificate',
            'Microsoft Certified: Azure Data Scientist Associate'
          ],
          duration: '3-6 months self-paced',
          outcomes: [
            'Industry-recognized credentials',
            'Flexible learning schedule',
            'Structured learning path'
          ]
        }
      ],
      aiInsights: 'Your product management background is particularly valuable for bridging business needs and data solutions. Consider hybrid roles like Product Data Scientist or AI Product Manager during your transition to leverage both skill sets.'
    },
    developmentPlan: {
      overview: 'This development plan outlines a structured approach to gain the necessary skills for a successful transition to Data Science, leveraging your existing product management expertise.',
      technicalSkills: [
        {
          skill: 'Python Programming',
          currentLevel: 2,
          targetLevel: 5,
          timeframe: '6 months',
          resources: [
            'Python for Data Science and Machine Learning Bootcamp (Udemy)',
            'Applied Data Science with Python Specialization (Coursera)',
            'Complete daily coding challenges on platforms like LeetCode'
          ]
        },
        {
          skill: 'Machine Learning',
          currentLevel: 1,
          targetLevel: 4,
          timeframe: '8 months',
          resources: [
            'Machine Learning by Andrew Ng (Coursera)',
            'Hands-On Machine Learning with Scikit-Learn and TensorFlow (Book)',
            'Kaggle competitions for practical experience'
          ]
        },
        {
          skill: 'SQL & Database Management',
          currentLevel: 2,
          targetLevel: 4,
          timeframe: '3 months',
          resources: [
            'SQL for Data Science (Coursera)',
            'Mode Analytics SQL Tutorial',
            'Build a personal project with PostgreSQL'
          ]
        }
      ],
      softSkills: [
        {
          skill: 'Data Storytelling',
          currentLevel: 3,
          targetLevel: 5,
          timeframe: '4 months',
          resources: [
            'Storytelling with Data (Book by Cole Nussbaumer Knaflic)',
            'Data Visualization Society resources',
            'Practice creating executive summaries of your data projects'
          ]
        },
        {
          skill: 'Technical Communication',
          currentLevel: 4,
          targetLevel: 5,
          timeframe: '3 months',
          resources: [
            'Write a technical blog explaining complex concepts',
            'Present technical topics to non-technical audiences',
            'Join data science forums and practice explaining concepts'
          ]
        }
      ],
      skillsToAcquire: [
        {
          skill: 'Deep Learning',
          reason: 'Essential for advanced data science roles and increasingly requested by employers',
          timeframe: '6 months (after ML foundations)',
          resources: [
            'Deep Learning Specialization by Andrew Ng (Coursera)',
            'Practical Deep Learning for Coders (fast.ai)',
            'Join an open-source deep learning project'
          ]
        },
        {
          skill: 'Cloud Computing (AWS/Azure)',
          reason: 'Most data science work involves cloud platforms for scalable processing',
          timeframe: '4 months',
          resources: [
            'AWS Machine Learning Specialty Certification',
            'Azure Data Scientist Associate Certification',
            'Build a cloud-deployed machine learning model'
          ]
        }
      ]
    },
    educationalPrograms: {
      introduction: 'Based on your background and career goals, the following educational programs are recommended to help you develop the necessary skills for a Data Scientist role.',
      recommendedPrograms: [
        {
          name: 'Master of Science in Data Science',
          provider: 'Georgia Tech (Online)',
          duration: '2 years part-time',
          format: 'Online with some synchronous sessions',
          skillsCovered: ['Machine Learning', 'Statistical Analysis', 'Data Visualization', 'Big Data Systems'],
          description: 'This program is ideal for working professionals and offers a comprehensive curriculum that balances theoretical knowledge with practical applications.'
        },
        {
          name: 'Data Science Immersive',
          provider: 'Galvanize',
          duration: '12 weeks full-time',
          format: 'In-person or remote',
          skillsCovered: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'Data Visualization'],
          description: 'An intensive bootcamp focused on practical skills that would accelerate your transition to data science roles.'
        },
        {
          name: 'Data Science Professional Certificate',
          provider: 'IBM via Coursera',
          duration: '6 months part-time',
          format: 'Online self-paced',
          skillsCovered: ['Python', 'Data Analysis', 'Machine Learning', 'Data Visualization', 'SQL'],
          description: 'A flexible program that allows you to learn at your own pace while building practical skills through hands-on projects.'
        }
      ],
      projectIdeas: [
        {
          title: 'Retail Customer Segmentation Analysis',
          description: 'Leverage your retail industry knowledge to create a machine learning model that segments customers based on purchasing behavior and predicts future buying patterns.',
          skillsDeveloped: ['Clustering Algorithms', 'Python (Scikit-learn)', 'Data Visualization', 'Business Analysis'],
          difficulty: 'Intermediate',
          timeEstimate: '4-6 weeks'
        },
        {
          title: 'Product Analytics Dashboard',
          description: 'Develop an interactive dashboard that visualizes key product metrics and allows for data-driven decision making.',
          skillsDeveloped: ['SQL', 'Data Visualization (Tableau/Power BI)', 'Dashboard Design', 'KPI Analysis'],
          difficulty: 'Beginner',
          timeEstimate: '2-3 weeks'
        },
        {
          title: 'Predictive Maintenance Model',
          description: 'Build a model that predicts when retail equipment might fail, combining IoT sensor data with maintenance logs.',
          skillsDeveloped: ['Time Series Analysis', 'Predictive Modeling', 'Python (TensorFlow)', 'Feature Engineering'],
          difficulty: 'Advanced',
          timeEstimate: '6-8 weeks'
        }
      ]
    },
    learningRoadmap: {
      overview: 'This roadmap divides your learning journey into distinct phases, each building on previous knowledge to systematically develop the skills needed for a Data Scientist role.',
      phases: [
        {
          phase: 'Foundation Building',
          timeframe: 'Months 1-3',
          focus: 'Establishing core programming and data handling skills',
          milestones: [
            'Complete Python for Data Science course',
            'Build 3 basic data analysis projects',
            'Master SQL fundamentals for data retrieval'
          ],
          resources: [
            {
              type: 'Course',
              name: 'Python for Everybody (Coursera)',
              link: 'https://www.coursera.org/specializations/python'
            },
            {
              type: 'Book',
              name: 'Python for Data Analysis by Wes McKinney'
            },
            {
              type: 'Project',
              name: 'Exploratory data analysis on retail datasets'
            }
          ]
        },
        {
          phase: 'Technical Skill Development',
          timeframe: 'Months 4-8',
          focus: 'Building specialized data science skills and statistical knowledge',
          milestones: [
            'Implement basic machine learning models',
            'Complete statistics for data science course',
            'Create visualization portfolio with 5 projects'
          ],
          resources: [
            {
              type: 'Course',
              name: 'Machine Learning by Andrew Ng (Coursera)'
            },
            {
              type: 'Book',
              name: 'Hands-On Machine Learning with Scikit-Learn and TensorFlow'
            },
            {
              type: 'Community',
              name: 'Kaggle competitions (start with "Getting Started" challenges)'
            }
          ]
        },
        {
          phase: 'Advanced Techniques',
          timeframe: 'Months 9-15',
          focus: 'Mastering advanced algorithms and specialized data science approaches',
          milestones: [
            'Implement deep learning models',
            'Complete a large-scale data project',
            'Master feature engineering techniques'
          ],
          resources: [
            {
              type: 'Course',
              name: 'Deep Learning Specialization (Coursera)'
            },
            {
              type: 'Workshop',
              name: 'Attend data science conferences or local meetups'
            },
            {
              type: 'Project',
              name: 'End-to-end ML project tackling a real business problem'
            }
          ]
        },
        {
          phase: 'Professional Application',
          timeframe: 'Months 16-24',
          focus: 'Applying skills in professional contexts and building industry credentials',
          milestones: [
            'Complete capstone project utilizing all learned skills',
            'Obtain professional certifications',
            'Build professional network in data science field'
          ],
          resources: [
            {
              type: 'Certification',
              name: 'Azure Data Scientist Associate or AWS Machine Learning Specialty'
            },
            {
              type: 'Community',
              name: 'Contribute to open-source data science projects'
            },
            {
              type: 'Networking',
              name: 'Join data science professional organizations and attend industry events'
            }
          ]
        }
      ]
    },
    similarRoles: {
      introduction: 'These alternative roles leverage your existing product management skills while incorporating aspects of data science, providing multiple potential career paths.',
      roles: [
        {
          role: 'Data Product Manager',
          similarityScore: 0.85,
          keySkillOverlap: [
            'Product Management',
            'Business Analysis',
            'Stakeholder Management',
            'User Research'
          ],
          additionalSkillsNeeded: [
            'Data Pipeline Knowledge',
            'Basic SQL',
            'Analytics Tools',
            'Data Visualization'
          ],
          summary: 'This role combines product management with data expertise, focusing on building data products or features. It requires less technical depth than a full Data Scientist role while leveraging your existing product skills.'
        },
        {
          role: 'Analytics Engineer',
          similarityScore: 0.75,
          keySkillOverlap: [
            'Problem Solving',
            'Business Analysis',
            'Product Knowledge',
            'Stakeholder Communication'
          ],
          additionalSkillsNeeded: [
            'SQL (Advanced)',
            'Data Modeling',
            'ETL Processes',
            'Programming (Python/R)'
          ],
          summary: 'Analytics Engineers bridge the gap between data engineering and data analysis, building data pipelines and models that transform raw data into usable analytics products.'
        },
        {
          role: 'Business Intelligence Analyst',
          similarityScore: 0.70,
          keySkillOverlap: [
            'Data Analysis',
            'Business Acumen',
            'Stakeholder Management',
            'Presentation Skills'
          ],
          additionalSkillsNeeded: [
            'SQL',
            'Data Visualization Tools',
            'Dashboard Creation',
            'Report Design'
          ],
          summary: 'This role focuses on translating data into business insights through reports and dashboards, requiring less advanced mathematics than Data Science but still delivering data-driven value.'
        }
      ]
    },
    quickTips: {
      introduction: 'These actionable tips can help you make immediate progress toward your goal of becoming a Data Scientist, even before completing comprehensive training.',
      quickWins: [
        {
          tip: 'Start a Kaggle account and participate in their "Getting Started" competitions to practice data science skills in a structured environment.',
          timeframe: 'This Week',
          impact: 'Medium'
        },
        {
          tip: 'Begin a daily coding practice of 30 minutes with Python focusing specifically on data manipulation with pandas and NumPy libraries.',
          timeframe: 'Immediately',
          impact: 'High'
        },
        {
          tip: 'Create a GitHub repository to document your data science learning journey and projects, building your portfolio from day one.',
          timeframe: 'This Week',
          impact: 'Medium'
        },
        {
          tip: 'Install and become familiar with Jupyter Notebooks, the standard environment for data science exploration and sharing analyses.',
          timeframe: 'Today',
          impact: 'High'
        },
        {
          tip: 'Connect with 3-5 data scientists on LinkedIn who have transitioned from product management backgrounds and request informational interviews.',
          timeframe: 'Next 2 Weeks',
          impact: 'Medium'
        },
        {
          tip: 'Apply your product management skills to create a personal learning roadmap with clear milestones and deliverables for your data science transition.',
          timeframe: 'This Week',
          impact: 'High'
        }
      ],
      industryInsights: [
        'The most sought-after data scientists combine technical skills with the ability to communicate insights to non-technical stakeholders – your product background gives you an advantage here.',
        'Many companies are increasingly valuing domain expertise in their data scientists, making your retail industry knowledge potentially valuable in that sector.',
        'Consider targeting companies with mature data teams where you can start in a more hybrid role before transitioning to a pure data science position.',
        'The demand for data professionals who understand product development is growing as more companies adopt data-driven product development approaches.',
        'Look for opportunities to apply data science to your current product role as a way to build relevant experience while transitioning.'
      ]
    },
    growthTrajectory: {
      introduction: 'This trajectory outlines how your career might evolve over time after transitioning to data science, showing potential progression paths and expected skill development.',
      shortTerm: {
        role: 'Junior Data Scientist / Data Analyst',
        timeline: '1-2 years after completing transition',
        responsibilities: [
          'Implementing established machine learning models',
          'Conducting exploratory data analysis',
          'Creating data visualizations and reports',
          'Contributing to team projects under supervision'
        ],
        skillsRequired: [
          'Python programming',
          'Statistical analysis',
          'Data visualization',
          'Basic machine learning',
          'SQL'
        ],
        salary: {
          min: 70000,
          max: 95000,
          currency: '$'
        }
      },
      mediumTerm: {
        role: 'Senior Data Scientist',
        timeline: '3-5 years after initial transition',
        responsibilities: [
          'Designing and implementing complex machine learning solutions',
          'Leading data science workstreams independently',
          'Mentoring junior team members',
          'Collaborating with cross-functional stakeholders',
          'Presenting findings to executive leadership'
        ],
        skillsRequired: [
          'Advanced machine learning',
          'Deep learning fundamentals',
          'Experimental design',
          'Feature engineering',
          'Cloud-based data solutions',
          'Data project management'
        ],
        salary: {
          min: 100000,
          max: 140000,
          currency: '$'
        }
      },
      longTerm: {
        role: 'Lead Data Scientist / Data Science Manager',
        timeline: '5+ years in data science roles',
        responsibilities: [
          'Setting data science strategy',
          'Building and leading data science teams',
          'Defining complex data initiatives',
          'Bridging business strategy and technical implementation',
          'Overseeing multiple concurrent data projects'
        ],
        skillsRequired: [
          'Team leadership',
          'Data science strategy',
          'Advanced modeling techniques',
          'Executive communication',
          'Resource allocation',
          'Technical mentorship',
          'ROI analysis'
        ],
        salary: {
          min: 130000,
          max: 180000,
          currency: '$'
        }
      }
    },
    learningPathRoadmap: {
      overview: 'This roadmap visualizes your career progression from Product Manager to Data Scientist, highlighting key milestones, skills to acquire, and potential roles along the journey.',
      careerTrajectory: [
        {
          stage: 'Current Position',
          timeframe: 'Present',
          role: 'Product Manager',
          skills: [
            'Product Strategy',
            'User Research',
            'Stakeholder Management',
            'Agile Methodologies',
            'Business Analysis'
          ],
          milestones: [
            'Beginning data science learning path',
            'Identifying transferable skills',
            'Establishing transition timeline'
          ]
        },
        {
          stage: 'Skill Development',
          timeframe: '0-12 months',
          role: 'Product Manager with Data Focus',
          skills: [
            'Python Programming',
            'SQL',
            'Data Analysis',
            'Statistical Methods',
            'Data Visualization'
          ],
          milestones: [
            'Complete foundational courses',
            'Build first analysis projects',
            'Incorporate data skills into current role',
            'Begin building portfolio'
          ]
        },
        {
          stage: 'Hybrid Transition',
          timeframe: '12-18 months',
          role: 'Product Analyst / Data Product Manager',
          skills: [
            'Machine Learning Fundamentals',
            'Predictive Modeling',
            'A/B Testing',
            'Dashboard Development',
            'Product Analytics'
          ],
          milestones: [
            'Transition to more data-focused role',
            'Complete advanced coursework',
            'Develop complex data projects',
            'Expand professional network in data field'
          ]
        },
        {
          stage: 'Full Transition',
          timeframe: '18-24 months',
          role: 'Junior Data Scientist',
          skills: [
            'Advanced Machine Learning',
            'Feature Engineering',
            'Deep Learning Basics',
            'Model Deployment',
            'Data Science Workflow'
          ],
          milestones: [
            'Secure first dedicated data science role',
            'Complete capstone projects',
            'Obtain relevant certifications',
            'Continue specialized skill development'
          ]
        },
        {
          stage: 'Career Advancement',
          timeframe: '3-5 years',
          role: 'Senior Data Scientist',
          skills: [
            'Advanced Algorithms',
            'Cloud ML Infrastructure',
            'MLOps',
            'Leadership',
            'Technical Mentoring'
          ],
          milestones: [
            'Lead complex data science initiatives',
            'Develop specialized expertise area',
            'Mentor junior team members',
            'Contribute to data strategy'
          ]
        }
      ]
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Form for collecting user information and generating a structured career analysis
 */
export function StructuredCareerPathwayForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<CareerAnalysisReport | null>(null);
  
  // Update form field
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Update select fields
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Generate career analysis report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call the API
      // For demo purposes, we're using a sample report
      setTimeout(() => {
        const report = generateSampleReport();
        setResults(report);
        setIsGenerating(false);
        
        toast({
          title: 'Career Analysis Generated',
          description: 'Your structured career analysis report has been created successfully.',
        });
      }, 3000);
    } catch (error) {
      console.error('Error generating report:', error);
      setIsGenerating(false);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate your career analysis. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Reset the form and results
  const handleReset = () => {
    setResults(null);
  };
  
  // If results are available, show the results component
  if (results) {
    return (
      <StructuredCareerAnalysisResults
        results={results}
        formData={{ ...formData, userId: user?.id }}
        onRestart={handleReset}
      />
    );
  }
  
  // Otherwise show the form
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto"
    >
      <Card className="mb-6 border-none shadow-lg bg-gradient-to-r from-primary/5 to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mt-20 -mr-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full -mb-16 -ml-16"></div>
        
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
              NEW
            </Badge>
            <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
              Structured Format
            </Badge>
          </div>
          <CardTitle className="text-2xl md:text-3xl">AI Career Analysis</CardTitle>
          <CardDescription className="text-base">
            Fill in the form below to get a personalized career development plan based on SFIA 9 and DigComp 2.2 frameworks. Our AI will analyze your skills and experience to create a tailored pathway toward your goals.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div 
              variants={staggerChildren}
              className="space-y-6"
            >
              <motion.div variants={fadeInUp}>
                <Label htmlFor="professionalLevel" className="text-sm font-medium">
                  Professional Level
                </Label>
                <Select
                  value={formData.professionalLevel}
                  onValueChange={(value) => handleSelectChange('professionalLevel', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select your professional level" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionalLevelOptions.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
              
              <motion.div variants={fadeInUp}>
                <Label htmlFor="currentSkills" className="text-sm font-medium">
                  Current Skills
                </Label>
                <Textarea
                  id="currentSkills"
                  name="currentSkills"
                  value={formData.currentSkills}
                  onChange={handleChange}
                  className="mt-1 resize-none h-24"
                  placeholder="List your current skills, separated by commas"
                />
              </motion.div>
              
              <motion.div variants={fadeInUp}>
                <Label htmlFor="educationalBackground" className="text-sm font-medium">
                  Educational Background
                </Label>
                <Textarea
                  id="educationalBackground"
                  name="educationalBackground"
                  value={formData.educationalBackground}
                  onChange={handleChange}
                  className="mt-1 resize-none h-24"
                  placeholder="Describe your educational background and certifications"
                />
              </motion.div>
              
              <motion.div variants={fadeInUp}>
                <Label htmlFor="careerHistory" className="text-sm font-medium">
                  Career History
                </Label>
                <Textarea
                  id="careerHistory"
                  name="careerHistory"
                  value={formData.careerHistory}
                  onChange={handleChange}
                  className="mt-1 resize-none h-24"
                  placeholder="Summarize your work experience and roles"
                />
              </motion.div>
              
              <motion.div variants={fadeInUp}>
                <Label htmlFor="desiredRole" className="text-sm font-medium">
                  Desired Role
                </Label>
                <Input
                  id="desiredRole"
                  name="desiredRole"
                  value={formData.desiredRole}
                  onChange={handleChange}
                  className="mt-1"
                  placeholder="e.g., Data Scientist, UX Designer, Product Manager"
                />
              </motion.div>
              
              <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="state" className="text-sm font-medium">
                    State/Province
                  </Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="e.g., California, Ontario"
                  />
                </div>
                
                <div>
                  <Label htmlFor="country" className="text-sm font-medium">
                    Country
                  </Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="mt-1"
                    placeholder="e.g., United States, Canada"
                  />
                </div>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full py-6"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Generating Analysis...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Career Analysis
                    </>
                  )}
                </Button>
                
                <p className="text-center text-sm text-muted-foreground mt-4">
                  <Check className="inline-block h-4 w-4 text-green-500 mr-1" />
                  Your information is processed securely and will not be shared with third parties.
                </p>
              </motion.div>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Definition for Clock component to fix the TypeScript error
function Clock({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}