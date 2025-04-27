/**
 * Enhanced Structured Career Pathway Form Component
 * 
 * Collects user information and generates a structured career analysis report
 * using the OpenAI API integration.
 */
import React, { useState } from 'react';
import { useEffect } from 'react';
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
import { CareerAnalysisReport } from '@shared/reportSchema';
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
  'Executive',
  'career-switcher', // Added to match options seen in the database
  'worker'            // Added to match options seen in the database
];

/**
 * Normalizes the API response to ensure it has the expected format for rendering
 * This handles any inconsistencies between the API output and component expectations
 */
function normalizeApiResponse(apiResponse: any): CareerAnalysisReport {
  console.log('API Response structure:', Object.keys(apiResponse));
  
  // Create sample data for the demo mode - this ensures the UI can render something
  const sampleSkills = [
    { skill: 'Data Analysis', proficiency: 3, description: 'Ability to analyze data and derive insights', category: 'Technical' },
    { skill: 'Programming', proficiency: 2, description: 'Basic coding skills', category: 'Technical' },
    { skill: 'Communication', proficiency: 4, description: 'Excellent verbal and written communication', category: 'Soft Skills' }
  ];
  
  const sampleGapData = {
    labels: ['Data Analysis', 'Programming', 'Machine Learning', 'Statistics', 'Communication'],
    datasets: [
      { label: 'Current Level', data: [3, 2, 1, 2, 4] },
      { label: 'Required Level', data: [5, 4, 4, 4, 3] }
    ]
  };
  
  // Create a default structure that matches what the component expects
  const normalizedResponse: CareerAnalysisReport = {
    executiveSummary: {
      summary: (apiResponse.executiveSummary && apiResponse.executiveSummary.summary) || 
        'This analysis provides a comprehensive plan for your career transition.',
      careerGoal: (apiResponse.executiveSummary && apiResponse.executiveSummary.careerGoal) || 
        apiResponse.skillGapAnalysis?.targetRole || 'Data Scientist',
      fitScore: (apiResponse.executiveSummary && apiResponse.executiveSummary.fitScore) || 
        { score: 7, outOf: 10, description: 'Good alignment with target role' },
      keyFindings: (apiResponse.executiveSummary && Array.isArray(apiResponse.executiveSummary.keyFindings)) ? 
        apiResponse.executiveSummary.keyFindings : 
        ['Strong transferable skills', 'Technical skill gaps need to be addressed', 'Educational background provides good foundation']
    },
    
    skillMapping: {
      skillsAnalysis: (apiResponse.skillMapping && apiResponse.skillMapping.skillsAnalysis) || 
        'Analysis of current skills shows strengths in business and transferable skills.',
      sfiaSkills: (apiResponse.skillMapping && Array.isArray(apiResponse.skillMapping.sfiaSkills)) ? 
        apiResponse.skillMapping.sfiaSkills : sampleSkills,
      digCompSkills: (apiResponse.skillMapping && Array.isArray(apiResponse.skillMapping.digCompSkills)) ? 
        apiResponse.skillMapping.digCompSkills : sampleSkills,
      otherSkills: (apiResponse.skillMapping && Array.isArray(apiResponse.skillMapping.otherSkills)) ? 
        apiResponse.skillMapping.otherSkills : sampleSkills
    },
    
    skillGapAnalysis: {
      targetRole: (apiResponse.skillGapAnalysis && apiResponse.skillGapAnalysis.targetRole) || 'Data Scientist',
      currentProficiencyData: (apiResponse.skillGapAnalysis && apiResponse.skillGapAnalysis.currentProficiencyData) || 
        { labels: sampleGapData.labels, datasets: [sampleGapData.datasets[0]] },
      gapAnalysisData: (apiResponse.skillGapAnalysis && apiResponse.skillGapAnalysis.gapAnalysisData) || sampleGapData,
      aiAnalysis: (apiResponse.skillGapAnalysis && apiResponse.skillGapAnalysis.aiAnalysis) || 
        'AI analysis indicates significant gaps in technical skills that need to be addressed.',
      keyGaps: (apiResponse.skillGapAnalysis && Array.isArray(apiResponse.skillGapAnalysis.keyGaps)) ? 
        apiResponse.skillGapAnalysis.keyGaps : [
          {
            skill: 'Machine Learning',
            currentLevel: 1,
            requiredLevel: 4,
            gap: 3,
            priority: 'High',
            improvementSuggestion: 'Focus on online courses in ML fundamentals.'
          },
          {
            skill: 'Programming',
            currentLevel: 2,
            requiredLevel: 4,
            gap: 2,
            priority: 'High',
            improvementSuggestion: 'Practice Python programming daily.'
          }
        ],
      keyStrengths: (apiResponse.skillGapAnalysis && Array.isArray(apiResponse.skillGapAnalysis.keyStrengths)) ? 
        apiResponse.skillGapAnalysis.keyStrengths : [
          {
            skill: 'Communication',
            currentLevel: 4,
            requiredLevel: 3,
            advantage: 1,
            leverageSuggestion: 'Use communication skills to explain complex data concepts.'
          }
        ]
    },
    
    careerPathwayOptions: {
      pathwayDescription: (apiResponse.careerPathwayOptions && apiResponse.careerPathwayOptions.pathwayDescription) || 
        'Multiple pathways available for transition to target role.',
      currentRole: (apiResponse.careerPathwayOptions && apiResponse.careerPathwayOptions.currentRole) || 'Current Role',
      targetRole: (apiResponse.careerPathwayOptions && apiResponse.careerPathwayOptions.targetRole) || 
        (apiResponse.skillGapAnalysis && apiResponse.skillGapAnalysis.targetRole) || 'Data Scientist',
      timeframe: (apiResponse.careerPathwayOptions && apiResponse.careerPathwayOptions.timeframe) || '12-18 months',
      pathwaySteps: (apiResponse.careerPathwayOptions && Array.isArray(apiResponse.careerPathwayOptions.pathwaySteps)) ? 
        apiResponse.careerPathwayOptions.pathwaySteps : [
          {
            step: 'Learn Fundamentals',
            timeframe: '0-3 months',
            description: 'Build core skills in programming and data analysis.'
          },
          {
            step: 'Build Portfolio',
            timeframe: '3-9 months',
            description: 'Create projects demonstrating your skills.'
          },
          {
            step: 'Transition',
            timeframe: '9-12 months',
            description: 'Apply for junior positions in target field.'
          }
        ],
      universityPathway: (apiResponse.careerPathwayOptions && Array.isArray(apiResponse.careerPathwayOptions.universityPathway)) ? 
        apiResponse.careerPathwayOptions.universityPathway : [
          {
            degree: 'Master in Data Science',
            institutions: ['University A', 'University B'],
            duration: '1-2 years',
            outcomes: ['Comprehensive foundation', 'Research opportunities']
          }
        ],
      vocationalPathway: (apiResponse.careerPathwayOptions && Array.isArray(apiResponse.careerPathwayOptions.vocationalPathway)) ? 
        apiResponse.careerPathwayOptions.vocationalPathway : [
          {
            certification: 'Data Science Bootcamp',
            providers: ['Provider A', 'Provider B'],
            duration: '12-16 weeks',
            outcomes: ['Practical skills', 'Industry projects']
          }
        ],
      aiInsights: (apiResponse.careerPathwayOptions && apiResponse.careerPathwayOptions.aiInsights) || 
        'AI recommends focusing on projects that demonstrate practical application of skills.'
    },
    
    developmentPlan: {
      overview: (apiResponse.developmentPlan && apiResponse.developmentPlan.overview) || 
        'This development plan outlines steps to build necessary skills.',
      technicalSkills: (apiResponse.developmentPlan && Array.isArray(apiResponse.developmentPlan.technicalSkills)) ? 
        apiResponse.developmentPlan.technicalSkills : [
          {
            skill: 'Python Programming',
            currentLevel: 2,
            targetLevel: 4,
            timeframe: '6 months',
            resources: ['Codecademy Python Course', 'Python for Data Science Book']
          }
        ],
      softSkills: (apiResponse.developmentPlan && Array.isArray(apiResponse.developmentPlan.softSkills)) ? 
        apiResponse.developmentPlan.softSkills : [
          {
            skill: 'Technical Communication',
            currentLevel: 3,
            targetLevel: 4,
            timeframe: '3 months',
            resources: ['Technical Writing Course', 'Join Data Science Community']
          }
        ],
      skillsToAcquire: (apiResponse.developmentPlan && Array.isArray(apiResponse.developmentPlan.skillsToAcquire)) ? 
        apiResponse.developmentPlan.skillsToAcquire : [
          {
            skill: 'Machine Learning',
            reason: 'Essential for data scientist role',
            timeframe: '6 months',
            resources: ['Andrew Ng Machine Learning Course', 'Kaggle Competitions']
          }
        ]
    },
    
    educationalPrograms: {
      introduction: (apiResponse.educationalPrograms && apiResponse.educationalPrograms.introduction) || 
        'Educational programs that can help you develop necessary skills.',
      recommendedPrograms: (apiResponse.educationalPrograms && Array.isArray(apiResponse.educationalPrograms.recommendedPrograms)) ? 
        apiResponse.educationalPrograms.recommendedPrograms : [
          {
            name: 'Master of Data Science',
            provider: 'University X',
            duration: '2 years',
            format: 'Full-time/Part-time',
            skillsCovered: ['Data Analysis', 'Machine Learning', 'Statistics', 'Data Visualization'],
            description: 'Comprehensive graduate program covering all aspects of data science'
          },
          {
            name: 'Data Science Professional Certificate',
            provider: 'Provider X',
            duration: '6 months',
            format: 'Online, self-paced',
            skillsCovered: ['Python', 'Data Analysis', 'Basic Machine Learning'],
            description: 'Industry-focused certification program for practical data science skills'
          }
        ],
      projectIdeas: (apiResponse.educationalPrograms && Array.isArray(apiResponse.educationalPrograms.projectIdeas)) ? 
        apiResponse.educationalPrograms.projectIdeas : [
          {
            title: 'Predictive Analysis Portfolio Project',
            description: 'Build a machine learning model that predicts outcomes based on real-world data',
            skillsDeveloped: ['Python', 'Machine Learning', 'Data Cleaning', 'Model Evaluation'],
            difficulty: 'Intermediate',
            timeEstimate: '4-6 weeks'
          },
          {
            title: 'Data Visualization Dashboard',
            description: 'Create an interactive dashboard visualizing insights from a complex dataset',
            skillsDeveloped: ['Data Visualization', 'JavaScript/Python', 'Data Analysis'],
            difficulty: 'Beginner to Intermediate',
            timeEstimate: '2-3 weeks'
          }
        ]
    },
    
    learningRoadmap: {
      overview: (apiResponse.learningRoadmap && apiResponse.learningRoadmap.overview) || 
        'Structured learning path to achieve career goals in data science.',
      phases: (apiResponse.learningRoadmap && Array.isArray(apiResponse.learningRoadmap.phases)) ? 
        apiResponse.learningRoadmap.phases : [
          {
            phase: 'Foundation',
            timeframe: '0-3 months',
            focus: 'Core programming and statistics fundamentals',
            milestones: [
              'Complete Python basics course',
              'Finish introductory statistics',
              'Build first data analysis project'
            ],
            resources: [
              { type: 'Course', name: 'Python for Everybody', link: 'https://www.py4e.com/' },
              { type: 'Book', name: 'Statistics for Data Scientists' },
              { type: 'Tutorial', name: 'Pandas Fundamentals' }
            ]
          },
          {
            phase: 'Skill Building',
            timeframe: '3-6 months',
            focus: 'Data analysis libraries and visualization tools',
            milestones: [
              'Master pandas and numpy',
              'Create data visualization portfolio',
              'Complete SQL fundamentals'
            ],
            resources: [
              { type: 'Course', name: 'Data Analysis with Python' },
              { type: 'Tutorial', name: 'Data Visualization with Matplotlib and Seaborn' },
              { type: 'Project', name: 'Real-world Data Analysis Portfolio' }
            ]
          },
          {
            phase: 'Advanced Concepts',
            timeframe: '6-12 months',
            focus: 'Machine learning and specialized techniques',
            milestones: [
              'Complete machine learning fundamentals',
              'Build predictive models',
              'Create end-to-end data science project'
            ],
            resources: [
              { type: 'Course', name: 'Machine Learning by Andrew Ng' },
              { type: 'Book', name: 'Hands-on Machine Learning' },
              { type: 'Community', name: 'Kaggle Competitions' }
            ]
          }
        ]
    },
    
    similarRoles: {
      introduction: (apiResponse.similarRoles && apiResponse.similarRoles.introduction) || 
        'Alternative roles that match your skills and interests.',
      roles: (apiResponse.similarRoles && Array.isArray(apiResponse.similarRoles.roles)) ? 
        apiResponse.similarRoles.roles : [
          {
            title: 'Data Analyst',
            fitScore: '85',
            description: 'Focuses on analyzing data and creating visualizations',
            skillAlignment: 'High overlap with current skills',
            transitionEase: 'Easier transition path than primary target role'
          },
          {
            title: 'Business Intelligence Analyst',
            fitScore: '80',
            description: 'Combines business knowledge with technical skills',
            skillAlignment: 'Very high overlap with current skills',
            transitionEase: 'Natural transition from current role'
          }
        ]
    },
    
    quickTips: {
      careerAdvice: (apiResponse.quickTips && Array.isArray(apiResponse.quickTips.careerAdvice)) ? 
        apiResponse.quickTips.careerAdvice : [
          'Join data science communities to network with professionals',
          'Contribute to open-source projects to build portfolio',
          'Attend industry meetups and conferences'
        ],
      skillDevelopment: (apiResponse.quickTips && Array.isArray(apiResponse.quickTips.skillDevelopment)) ? 
        apiResponse.quickTips.skillDevelopment : [
          'Practice coding daily, even if just for 30 minutes',
          'Work through real-world datasets on platforms like Kaggle',
          'Follow data science blogs and podcasts to stay current'
        ]
    },
    
    growthTrajectory: {
      overview: (apiResponse.growthTrajectory && apiResponse.growthTrajectory.overview) || 
        'Long-term career growth potential and progression path.',
      promotionTimeline: (apiResponse.growthTrajectory && apiResponse.growthTrajectory.promotionTimeline) || 
        'Typical progression from Junior to Senior in 3-5 years with consistent skill development',
      salaryExpectations: (apiResponse.growthTrajectory && Array.isArray(apiResponse.growthTrajectory.salaryExpectations)) ? 
        apiResponse.growthTrajectory.salaryExpectations : [
          { level: 'Entry-Level', range: '$70,000 - $90,000', timeframe: 'First 1-2 years' },
          { level: 'Mid-Level', range: '$90,000 - $120,000', timeframe: '2-5 years' },
          { level: 'Senior-Level', range: '$120,000 - $160,000+', timeframe: '5+ years' }
        ],
      careerMilestones: (apiResponse.growthTrajectory && Array.isArray(apiResponse.growthTrajectory.careerMilestones)) ? 
        apiResponse.growthTrajectory.careerMilestones : [
          { milestone: 'First Junior Position', timeframe: '6-12 months', description: 'Entry-level position applying basic skills' },
          { milestone: 'Leading Small Projects', timeframe: '2-3 years', description: 'Taking ownership of data projects' },
          { milestone: 'Senior/Lead Role', timeframe: '5+ years', description: 'Leading teams and setting technical direction' }
        ]
    },
    
    learningPathRoadmap: {
      introduction: (apiResponse.learningPathRoadmap && apiResponse.learningPathRoadmap.introduction) || 
        'Detailed learning path with specific resources and milestones.',
      keyStages: (apiResponse.learningPathRoadmap && Array.isArray(apiResponse.learningPathRoadmap.keyStages)) ? 
        apiResponse.learningPathRoadmap.keyStages : [
          {
            stage: 'Foundations',
            skills: ['Python', 'Statistics', 'Data Visualization'],
            resources: ['Python for Data Analysis Book', 'Khan Academy Statistics'],
            projects: ['Exploratory Data Analysis Project'],
            timeEstimate: '3 months'
          },
          {
            stage: 'Intermediate',
            skills: ['Machine Learning Basics', 'SQL', 'Data Cleaning'],
            resources: ['Andrew Ng Machine Learning Course', 'Mode Analytics SQL Tutorial'],
            projects: ['Predictive Model for Tabular Data'],
            timeEstimate: '3-6 months'
          }
        ]
    },
    
    timestamp: Date.now().toString(),
    dateFormatted: new Date().toISOString()
  };
  
  // If we have received nested objects without the right structure, normalize them here
  // Cast to any to handle dynamic property access
  const roadmap = normalizedResponse.learningRoadmap as any;
  ['shortTerm', 'mediumTerm', 'longTerm'].forEach(term => {
    if (roadmap[term] && !roadmap[term].goals) {
      // Fix the structure if it doesn't match expected format
      roadmap[term] = {
        timeframe: roadmap[term].timeframe || '0-0 months',
        goals: Array.isArray(roadmap[term].goals) ? roadmap[term].goals : []
      };
    }
  });
  
  console.log('Normalized response ready:', Object.keys(normalizedResponse));
  return normalizedResponse;
}

/**
 * Enhanced Form Component with real API integration
 */
export function StructuredCareerPathwayFormEnhanced() {
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
  
  // Generate career analysis report with real API call
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      // Get the JWT token from localStorage if available
      const token = localStorage.getItem('auth_token');
      
      // Make a real API call to the structured career analysis endpoint
      const response = await fetch('/api/career-pathway-analysis-structured', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      
      // Data format validation and normalization
      const normalizedResult = normalizeApiResponse(result);
      setResults(normalizedResult);
      
      toast({
        title: 'Career Analysis Generated',
        description: 'Your structured career analysis report has been created successfully.',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate your career analysis. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
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
              ENHANCED
            </Badge>
            <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
              OpenAI Powered
            </Badge>
          </div>
          <CardTitle className="text-2xl md:text-3xl">AI Career Analysis</CardTitle>
          <CardDescription className="text-base">
            Generate a comprehensive career transition analysis using OpenAI's advanced GPT model with the standardized 11-section report format.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              variants={staggerChildren}
              initial="hidden"
              animate="visible"
              className="grid gap-6 sm:grid-cols-2"
            >
              <motion.div variants={fadeInUp} className="space-y-2">
                <Label htmlFor="professionalLevel">Professional Level</Label>
                <Select
                  value={formData.professionalLevel}
                  onValueChange={(value) => handleSelectChange('professionalLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionalLevelOptions.map(level => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="space-y-2">
                <Label htmlFor="desiredRole">Desired Role</Label>
                <Input
                  id="desiredRole"
                  name="desiredRole"
                  value={formData.desiredRole}
                  onChange={handleChange}
                  placeholder="e.g., Data Scientist, Product Manager"
                />
              </motion.div>
              
              <motion.div variants={fadeInUp} className="space-y-2 sm:col-span-2">
                <Label htmlFor="currentSkills">Current Skills</Label>
                <Textarea
                  id="currentSkills"
                  name="currentSkills"
                  value={formData.currentSkills}
                  onChange={handleChange}
                  placeholder="List your current skills, separated by commas"
                  rows={3}
                />
              </motion.div>
              
              <motion.div variants={fadeInUp} className="space-y-2 sm:col-span-2">
                <Label htmlFor="educationalBackground">Educational Background</Label>
                <Textarea
                  id="educationalBackground"
                  name="educationalBackground"
                  value={formData.educationalBackground}
                  onChange={handleChange}
                  placeholder="Describe your educational background and any certifications"
                  rows={3}
                />
              </motion.div>
              
              <motion.div variants={fadeInUp} className="space-y-2 sm:col-span-2">
                <Label htmlFor="careerHistory">Career History</Label>
                <Textarea
                  id="careerHistory"
                  name="careerHistory"
                  value={formData.careerHistory}
                  onChange={handleChange}
                  placeholder="Briefly describe your work experience and previous roles"
                  rows={3}
                />
              </motion.div>
              
              <motion.div variants={fadeInUp} className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g., California, Ontario"
                />
              </motion.div>
              
              <motion.div variants={fadeInUp} className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="e.g., United States, Canada"
                />
              </motion.div>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="flex justify-center mt-8">
              <Button
                type="submit"
                size="lg"
                disabled={isGenerating}
                className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Career Pathway...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Analysis
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-blue-50 to-white border-none shadow-sm dark:from-slate-950 dark:to-slate-900">
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <Check className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Comprehensive Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes your background against industry frameworks like SFIA 9 and DigComp 2.2.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <Check className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Personalized Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Receive detailed insights into skill gaps, development plans, and educational pathways.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <Check className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Standardized Format</h3>
              <p className="text-sm text-muted-foreground">
                Results are presented in our 11-section standardized format, allowing easy comparison between analyses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}