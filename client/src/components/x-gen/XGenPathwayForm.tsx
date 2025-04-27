/**
 * X-Gen Pathway Form Component
 * 
 * Collects user information and generates an X-Gen AI career analysis report
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
import { XGenAnalysisResults } from './XGenAnalysisResults';
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
          timeline: '4-6 weeks'
        },
        {
          title: 'Product Performance Prediction System',
          description: 'Build a model that predicts product performance based on various features, helping to identify potentially successful new products before launch.',
          skillsDeveloped: ['Regression Modeling', 'Feature Engineering', 'Python (Pandas/Numpy)', 'Statistical Analysis'],
          difficulty: 'Intermediate',
          timeline: '5-7 weeks'
        }
      ]
    },
    learningRoadmap: {
      introduction: 'This customized learning roadmap provides a clear, progressive path to develop your data science skills over time.',
      roadmapPhases: [
        {
          phase: 'Foundation (Months 1-3)',
          skills: ['Python Programming Fundamentals', 'Statistical Concepts', 'Basic Data Analysis', 'Data Visualization Basics'],
          milestones: [
            'Complete Python basics course and build simple data analysis scripts',
            'Learn foundational statistics principles and apply to real datasets',
            'Create basic visualizations using matplotlib/seaborn'
          ]
        },
        {
          phase: 'Intermediate Skills (Months 4-8)',
          skills: ['Machine Learning Fundamentals', 'Advanced SQL', 'Data Cleaning & Preprocessing', 'Statistical Modeling'],
          milestones: [
            'Build first supervised learning models (classification and regression)',
            'Complete advanced SQL course and complex database queries',
            'Create a portfolio project demonstrating core ML concepts'
          ]
        },
        {
          phase: 'Advanced Development (Months 9-15)',
          skills: ['Deep Learning', 'Feature Engineering', 'Model Deployment', 'Big Data Technologies'],
          milestones: [
            'Build and deploy a neural network model',
            'Use feature engineering to improve model performance',
            'Develop a full end-to-end ML system with API endpoints'
          ]
        },
        {
          phase: 'Specialization (Months 16-24)',
          skills: ['Advanced Deep Learning', 'Domain Specialization', 'MLOps', 'Research Methods'],
          milestones: [
            'Develop expertise in specific industry applications of data science',
            'Build a comprehensive capstone project for your portfolio',
            'Prepare for and apply to data scientist positions'
          ]
        }
      ],
      learningStyle: 'Your product management background suggests you learn well through project-based approaches that connect theory to real business problems. Focus on applied learning that leverages your existing business knowledge.',
      certificationPath: 'Start with IBM Data Science Professional Certificate, followed by more specialized certifications in machine learning or cloud ML services (AWS/Azure) as you progress.'
    },
    similarRoles: {
      introduction: 'Based on your current skills and desired career path, consider these similar roles that might offer a smoother transition or alternative direction.',
      roles: [
        {
          title: 'Product Data Analyst',
          description: 'Combines product management knowledge with data analysis to derive insights for product decisions.',
          skillsOverlap: 80,
          transitionDifficulty: 'Low',
          salaryRange: '$80,000 - $120,000',
          growthProspects: 'High',
          keyRequirements: [
            'SQL and data querying',
            'Data visualization',
            'Basic statistical analysis',
            'Product development knowledge'
          ]
        },
        {
          title: 'AI Product Manager',
          description: 'Specializes in managing AI/ML product development, bridging technical and business needs.',
          skillsOverlap: 70,
          transitionDifficulty: 'Medium',
          salaryRange: '$110,000 - $160,000',
          growthProspects: 'Very High',
          keyRequirements: [
            'Understanding of ML concepts',
            'Strong product management skills',
            'Technical communication',
            'Stakeholder management'
          ]
        },
        {
          title: 'Business Intelligence Analyst',
          description: 'Focuses on transforming data into actionable business insights through analytics and visualization.',
          skillsOverlap: 65,
          transitionDifficulty: 'Low-Medium',
          salaryRange: '$75,000 - $115,000',
          growthProspects: 'Medium-High',
          keyRequirements: [
            'SQL and database knowledge',
            'Dashboard creation (Tableau/Power BI)',
            'Business analysis',
            'Data storytelling'
          ]
        }
      ]
    },
    quickTips: {
      careerAdvice: [
        'Leverage your product background by focusing on data science roles in retail or e-commerce initially',
        'Join communities like Kaggle to practice skills and network with data scientists',
        'Create a portfolio that showcases your unique combination of product and data skills',
        'Consider hybrid roles as stepping stones to full data science positions'
      ],
      skillDevelopment: [
        'Focus on one programming language (Python) rather than trying to learn multiple at once',
        'Build projects that solve real business problems, especially in retail/product domains',
        'Participate in hackathons to gain practical experience and expand your network',
        'Find a mentor who has made a similar career transition'
      ],
      interviewPreparation: [
        'Prepare to explain how your product background adds unique value to data science roles',
        'Practice explaining technical concepts in business terms and vice versa',
        'Develop strong case study examples that demonstrate your analytical thinking',
        'Be ready to discuss both technical approaches and business applications'
      ]
    },
    growthTrajectory: {
      shortTerm: {
        goals: [
          'Develop core Python and SQL skills',
          'Complete at least one data analysis portfolio project',
          'Build a professional network in the data science community'
        ],
        timeline: '6-12 months',
        expectedOutcomes: 'Foundation in technical skills and initial portfolio to demonstrate abilities'
      },
      mediumTerm: {
        goals: [
          'Secure a transitional role (Data Analyst or AI Product Manager)',
          'Develop advanced machine learning skills',
          'Gain professional experience applying data science in business contexts'
        ],
        timeline: '1-2 years',
        expectedOutcomes: 'Professional experience in data-focused roles and competency in core data science skills'
      },
      longTerm: {
        goals: [
          'Transition to full Data Scientist role',
          'Develop specialization in a high-demand area (e.g., NLP, Computer Vision)',
          'Lead cross-functional data science initiatives'
        ],
        timeline: '3-5 years',
        expectedOutcomes: 'Established career as a Data Scientist with unique product-focused perspective'
      },
      potentialChallenges: [
        {
          challenge: 'Technical skill gap compared to traditional CS graduates',
          mitigation: 'Focus on practical applications and projects that demonstrate real-world problem-solving abilities'
        },
        {
          challenge: 'Competition from candidates with more technical backgrounds',
          mitigation: 'Differentiate yourself by emphasizing your unique combination of product and data skills'
        },
        {
          challenge: 'Balancing learning with current work responsibilities',
          mitigation: 'Create a structured learning plan with specific weekly goals and accountability systems'
        }
      ]
    },
    learningPathRoadmap: {
      introduction: 'This visual roadmap outlines your learning journey from Product Manager to Data Scientist, highlighting key milestones and skills to acquire along the way.',
      milestones: [
        {
          title: 'Technical Foundation',
          description: 'Develop core programming and data manipulation skills',
          timeframe: 'Months 1-6',
          keySkills: ['Python', 'SQL', 'Data Manipulation', 'Basic Statistics'],
          resources: [
            'Python for Data Science and Machine Learning Bootcamp (Udemy)',
            'SQL for Data Science (Coursera)',
            'Khan Academy Statistics'
          ]
        },
        {
          title: 'Analysis & Visualization',
          description: 'Learn to analyze data and create meaningful visualizations',
          timeframe: 'Months 7-10',
          keySkills: ['Statistical Analysis', 'Data Visualization', 'Exploratory Data Analysis'],
          resources: [
            'Data Science A-Z (Udemy)',
            'Tableau Essential Training (LinkedIn Learning)',
            'Applied Plotting, Charting & Data Representation (Coursera)'
          ]
        },
        {
          title: 'Machine Learning Fundamentals',
          description: 'Master core ML algorithms and applications',
          timeframe: 'Months 11-15',
          keySkills: ['Supervised Learning', 'Unsupervised Learning', 'Model Evaluation'],
          resources: [
            'Machine Learning by Andrew Ng (Coursera)',
            'Hands-On Machine Learning with Scikit-Learn (Book)',
            'Kaggle Competitions'
          ]
        },
        {
          title: 'Specialization & Application',
          description: 'Develop specialized skills and apply in real-world projects',
          timeframe: 'Months 16-24',
          keySkills: ['Deep Learning', 'Natural Language Processing', 'Time Series Analysis'],
          resources: [
            'Deep Learning Specialization (Coursera)',
            'NLP Nanodegree (Udacity)',
            'Capstone Projects and Internships'
          ]
        }
      ],
      skillProgress: {
        technical: [
          { skill: 'Python Programming', startLevel: 2, targetLevel: 5, months: 6 },
          { skill: 'Machine Learning', startLevel: 1, targetLevel: 4, months: 10 },
          { skill: 'Data Visualization', startLevel: 3, targetLevel: 5, months: 4 }
        ],
        business: [
          { skill: 'Data-Driven Decision Making', startLevel: 4, targetLevel: 5, months: 3 },
          { skill: 'Data Strategy', startLevel: 3, targetLevel: 5, months: 6 },
          { skill: 'Technical Communication', startLevel: 4, targetLevel: 5, months: 4 }
        ]
      }
    },
    socialSkills: {
      key_findings: "Your product management background has given you strong social and communication skills that will be valuable in a data science role. This section highlights these transferable skills and areas for development.",
      transferable_skills: [
        {
          skill: "Stakeholder Communication",
          proficiency: "High",
          relevance: "Critical for translating complex data findings into business insights for various audiences."
        },
        {
          skill: "Team Collaboration",
          proficiency: "High",
          relevance: "Essential for working in cross-functional data science teams."
        },
        {
          skill: "Project Management",
          proficiency: "High",
          relevance: "Valuable for managing complex data science projects and timelines."
        }
      ],
      development_areas: [
        {
          skill: "Technical Communication",
          why_important: "Need to communicate complex statistical concepts and model mechanics to technical team members",
          development_suggestion: "Join forums like Stack Overflow or Medium to practice explaining technical concepts. Consider presenting at local data science meetups."
        },
        {
          skill: "Data Storytelling",
          why_important: "Critical for making data insights compelling and actionable for business stakeholders",
          development_suggestion: "Take specialized courses in data visualization and storytelling. Practice creating executive summaries of complex analyses."
        }
      ],
      networking_strategy: {
        importance: "Building a strong network in the data science community is crucial for your career transition.",
        recommended_actions: [
          "Join local data science meetups and user groups",
          "Participate in online communities like Kaggle, GitHub, and specialized LinkedIn groups",
          "Attend industry conferences (in person or virtual)",
          "Connect with alumni from your educational programs who work in data science"
        ],
        elevator_pitch: "Experienced product manager with a strong business background transitioning to data science. I combine business acumen with growing technical skills to deliver data-driven solutions that align with business objectives."
      }
    },
    reviewNotes: {
      analyst_comments: "The candidate's product management background provides an excellent foundation for certain aspects of data science roles, particularly those involving stakeholder communication and project management. The transition plan is realistic but will require significant dedication to building technical skills.",
      strengths: [
        "Strong business acumen and domain knowledge in retail technology",
        "Excellent communication and leadership skills",
        "Experience with product development processes and user needs analysis"
      ],
      challenges: [
        "Significant technical skill gaps in core data science areas",
        "Competition from candidates with formal CS/statistics backgrounds",
        "Need for practical experience beyond coursework"
      ],
      custom_recommendations: [
        "Consider starting with a hybrid role like Product Analyst to build technical experience while leveraging existing skills",
        "Focus initial learning on Python and SQL as these will yield the fastest practical applications",
        "Create a portfolio that highlights your unique combination of business and growing technical skills"
      ]
    }
  };
}

export function XGenPathwayForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<CareerAnalysisReport | null>(null);
  const [step, setStep] = useState<'form' | 'result'>('form');

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      // In a real implementation, this would send the form data to an API
      // and receive the career analysis report as a response
      
      // For now, simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a sample report to simulate the API response
      const generatedReport = generateSampleReport();
      
      setReport(generatedReport);
      setStep('result');

      toast({
        title: "Analysis Complete",
        description: "Your X-Gen AI Career Analysis report has been generated successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error generating report:", error);
      
      toast({
        title: "Generation Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setReport(null);
    setStep('form');
  };
  
  if (step === 'result' && report) {
    return (
      <div className="py-6">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={resetForm}
        >
          ← Create New Analysis
        </Button>
        
        <XGenAnalysisResults 
          report={report} 
          requestData={formData}
        />
      </div>
    );
  }

  return (
    <motion.form 
      onSubmit={handleSubmit}
      className="space-y-8"
      variants={staggerChildren}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="space-y-4" variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
            <CardDescription>
              Tell us about your current professional status and skills
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="professionalLevel">Professional Level</Label>
              <Select 
                defaultValue={formData.professionalLevel}
                onValueChange={(value) => handleChange('professionalLevel', value)}
              >
                <SelectTrigger>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentSkills">Current Skills</Label>
              <Textarea 
                id="currentSkills"
                placeholder="List your current skills, separated by commas"
                value={formData.currentSkills}
                onChange={(e) => handleChange('currentSkills', e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground">
                Include technical skills, soft skills, and any other relevant abilities
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div className="space-y-4" variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>Background Information</CardTitle>
            <CardDescription>
              Information about your education and career history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="educationalBackground">Educational Background</Label>
              <Textarea 
                id="educationalBackground"
                placeholder="Describe your educational background"
                value={formData.educationalBackground}
                onChange={(e) => handleChange('educationalBackground', e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground">
                Include degrees, certificates, and other relevant education
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="careerHistory">Career History</Label>
              <Textarea 
                id="careerHistory"
                placeholder="Summarize your career history"
                value={formData.careerHistory}
                onChange={(e) => handleChange('careerHistory', e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-sm text-muted-foreground">
                Include job titles, duration, and brief descriptions of roles
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div className="space-y-4" variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>Career Goals</CardTitle>
            <CardDescription>
              Information about your desired role and location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="desiredRole">Desired Role</Label>
              <Input 
                id="desiredRole" 
                placeholder="e.g., Data Scientist, Product Manager, UX Designer"
                value={formData.desiredRole}
                onChange={(e) => handleChange('desiredRole', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input 
                  id="state" 
                  placeholder="e.g., California, Ontario"
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  placeholder="e.g., United States, Canada"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div className="flex justify-center" variants={fadeIn}>
        <Button
          type="submit"
          size="lg"
          className="w-full md:w-auto min-w-[200px]"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Analysis...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate X-Gen Career Analysis
            </>
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}