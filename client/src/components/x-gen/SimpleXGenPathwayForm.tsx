/**
 * X-Gen Pathway Form Component - Simplified
 * 
 * This component renders the form for users to input their career information
 * and generate an X-Gen AI career pathway analysis with robust error handling.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fadeIn, fadeInUp, staggerChildren } from '@/lib/animations';

// Common professional level options
const professionalLevelOptions = [
  'Entry Level',
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
  'Manager',
  'Director',
  'Executive'
];

// Interface for form data
interface FormData {
  professionalLevel: string;
  currentSkills: string;
  educationalBackground: string;
  careerHistory: string;
  desiredRole: string;
  state: string;
  country: string;
}

// Simplified report structure with only essential sections
interface SimplifiedCareerReport {
  executiveSummary: {
    careerGoal: string;
    professionalLevel: string;
    keyFindings: string[];
    fitScore: {
      score: number;
      outOf: number;
      description: string;
    };
  };
  skillGaps: {
    description: string;
    gaps: Array<{
      skill: string;
      importance: string;
    }>;
  };
  recommendedPath: {
    steps: Array<{
      title: string;
      description: string;
      timeframe: string;
    }>;
  };
  learningResources: {
    courses: Array<{
      title: string;
      provider: string;
      difficulty: string;
      link: string;
    }>;
  };
}

export function SimpleXGenPathwayForm() {
  const { toast } = useToast();
  const [step, setStep] = useState<'form' | 'result'>('form');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SimplifiedCareerReport | null>(null);
  const [formData, setFormData] = useState<FormData>({
    professionalLevel: 'Mid-Level',
    currentSkills: '',
    educationalBackground: '',
    careerHistory: '',
    desiredRole: '',
    state: '',
    country: ''
  });
  
  // Generate a simplified sample report
  function generateSampleReport(): SimplifiedCareerReport {
    const targetRole = formData.desiredRole || 'Data Scientist';
    
    return {
      executiveSummary: {
        careerGoal: targetRole,
        professionalLevel: formData.professionalLevel,
        keyFindings: [
          `You have a solid foundation for a career as a ${targetRole}`,
          `Your background in ${formData.educationalBackground.split(' ')[0] || 'education'} is relevant to this role`,
          `Your skills in ${formData.currentSkills.split(',')[0] || 'technical areas'} are particularly valuable`,
          `Further development in advanced techniques would be beneficial`
        ],
        fitScore: {
          score: 8,
          outOf: 10,
          description: `Based on your background and skills, you have a strong fit for the ${targetRole} role.`
        }
      },
      skillGaps: {
        description: `To succeed as a ${targetRole}, consider developing these key skills:`,
        gaps: [
          {
            skill: 'Advanced Data Analysis',
            importance: 'High'
          },
          {
            skill: 'Machine Learning',
            importance: 'Medium'
          },
          {
            skill: 'Cloud Computing',
            importance: 'Medium'
          }
        ]
      },
      recommendedPath: {
        steps: [
          {
            title: 'Foundation Building',
            description: 'Strengthen core skills through online courses',
            timeframe: '3 months'
          },
          {
            title: 'Practical Application',
            description: 'Build portfolio projects demonstrating your abilities',
            timeframe: '4 months'
          },
          {
            title: 'Certification',
            description: 'Obtain relevant professional certifications',
            timeframe: '2 months'
          },
          {
            title: 'Job Search Preparation',
            description: 'Update resume and prepare for interviews',
            timeframe: '1 month'
          }
        ]
      },
      learningResources: {
        courses: [
          {
            title: 'Introduction to Data Science',
            provider: 'Coursera',
            difficulty: 'Beginner',
            link: 'https://www.coursera.org'
          },
          {
            title: 'Machine Learning Fundamentals',
            provider: 'edX',
            difficulty: 'Intermediate',
            link: 'https://www.edx.org'
          },
          {
            title: 'Advanced Analytics',
            provider: 'Udemy',
            difficulty: 'Advanced',
            link: 'https://www.udemy.com'
          }
        ]
      }
    };
  }
  
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    try {
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a simplified report
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
        
        {/* Simple inline analysis results */}
        <div className="space-y-8">
          {/* Executive Summary Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Executive Summary</CardTitle>
              <CardDescription>Overview of your career analysis for {report.executiveSummary.careerGoal}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Professional Level</h3>
                <p>{report.executiveSummary.professionalLevel}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Fit Score</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium bg-primary text-primary-foreground px-2 py-1 rounded-md">
                    {report.executiveSummary.fitScore.score}/{report.executiveSummary.fitScore.outOf}
                  </span>
                  <span>{report.executiveSummary.fitScore.description}</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Key Findings</h3>
                <ul className="space-y-2 pl-5 list-disc">
                  {report.executiveSummary.keyFindings.map((finding, idx) => (
                    <li key={idx}>{finding}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          
          {/* Skill Gaps Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Skill Gaps</CardTitle>
              <CardDescription>{report.skillGaps.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y">
                {report.skillGaps.gaps.map((gap, idx) => (
                  <li key={idx} className="py-3 flex justify-between items-center">
                    <span>{gap.skill}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      gap.importance === 'High' ? 'bg-red-100 text-red-800' : 
                      gap.importance === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {gap.importance} Priority
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          {/* Career Path Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Recommended Path</CardTitle>
              <CardDescription>Step-by-step guide to reaching your career goal</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="relative border-l border-gray-200 ml-3">
                {report.recommendedPath.steps.map((step, idx) => (
                  <li key={idx} className="mb-10 ml-6">
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-primary rounded-full -left-4 ring-4 ring-white text-white">
                      {idx + 1}
                    </span>
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-gray-500">{step.timeframe}</p>
                    <p className="mt-1">{step.description}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
          
          {/* Learning Resources Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Learning Resources</CardTitle>
              <CardDescription>Recommended courses to develop required skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {report.learningResources.courses.map((course, idx) => (
                  <Card key={idx} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <CardTitle className="text-lg">{course.title}</CardTitle>
                      <CardDescription>{course.provider}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          course.difficulty === 'Advanced' ? 'bg-red-100 text-red-800' : 
                          course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'
                        }`}>
                          {course.difficulty}
                        </span>
                        <a 
                          href={course.link}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="text-sm text-primary hover:underline"
                        >
                          View Course
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
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