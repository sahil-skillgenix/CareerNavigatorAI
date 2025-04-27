/**
 * Structured Career Analysis Results Component
 * 
 * Displays the results of a structured career analysis report, ensuring
 * all 11 sections are properly ordered and rendered.
 */

import React, { useState, useEffect, Fragment } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SkillRadarChart } from './SkillRadarChart';
import { ComparativeBarChart } from './ComparativeBarChart';
import { CareerPathwayStepsDisplay } from './CareerPathwayStepsDisplay';
import {
  AlertCircle,
  ArrowLeft,
  BarChart,
  BookOpen,
  ChevronRight,
  Download,
  FileDown,
  Lightbulb,
  LineChart,
  ListChecks,
  Rocket,
  School,
  Sparkles,
  TrendingUp,
  Trophy,
  User,
  UserCheck,
} from 'lucide-react';
import { CareerAnalysisReport } from '../../../shared/reportSchema';

// Define interfaces for the component props
interface SubmittedFormData {
  userId: string | undefined;
  professionalLevel: string;
  currentSkills: string;
  educationalBackground: string;
  careerHistory: string;
  desiredRole: string;
  state: string;
  country: string;
}

interface StructuredCareerAnalysisResultsProps {
  results: CareerAnalysisReport;
  formData: SubmittedFormData | null;
  onRestart: () => void;
}

/**
 * Debug mode settings for each section
 */
interface DebugStates {
  executiveSummary: boolean;
  skillMapping: boolean;
  gapAnalysis: boolean;
  pathwayOptions: boolean;
  developmentPlan: boolean;
  educationalPrograms: boolean;
  learningRoadmap: boolean;
  similarRoles: boolean;
  quickTips: boolean;
  growthTrajectory: boolean;
  learningPathRoadmap: boolean;
  [key: string]: boolean;
}

/**
 * Component that displays a structured career analysis report with support for debugging
 */
export function StructuredCareerAnalysisResults({ 
  results, 
  formData, 
  onRestart 
}: StructuredCareerAnalysisResultsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('overview');
  const [isDownloading, setIsDownloading] = useState(false);
  const [savedToAccount, setSavedToAccount] = useState(false);
  
  // Debug mode tracking
  const [debugMode, setDebugMode] = useState(false);
  const [debugStates, setDebugStates] = useState<DebugStates>({
    executiveSummary: false,
    skillMapping: false,
    gapAnalysis: false,
    pathwayOptions: false,
    developmentPlan: false,
    educationalPrograms: false,
    learningRoadmap: false,
    similarRoles: false,
    quickTips: false,
    growthTrajectory: false,
    learningPathRoadmap: false,
  });
  
  // Access report sections
  const { 
    executiveSummary, 
    skillMapping, 
    skillGapAnalysis, 
    careerPathwayOptions, 
    developmentPlan,
    educationalPrograms,
    learningRoadmap,
    similarRoles,
    quickTips,
    growthTrajectory,
    learningPathRoadmap,
    timestamp
  } = results;
  
  // Track section completion to show in UI
  const [completedSections, setCompletedSections] = useState<Record<string, boolean>>({});
  
  // Effect to update completed sections based on data presence
  useEffect(() => {
    // Check each section for presence of key data
    const sections: Record<string, boolean> = {
      executiveSummary: Boolean(executiveSummary?.summary),
      skillMapping: Boolean(skillMapping?.sfiaSkills?.length || skillMapping?.digCompSkills?.length),
      skillGapAnalysis: Boolean(skillGapAnalysis?.gapAnalysisData?.labels?.length),
      careerPathwayOptions: Boolean(careerPathwayOptions?.pathwaySteps?.length),
      developmentPlan: Boolean(developmentPlan?.technicalSkills?.length || developmentPlan?.softSkills?.length),
      educationalPrograms: Boolean(educationalPrograms?.recommendedPrograms?.length),
      learningRoadmap: Boolean(learningRoadmap?.phases?.length),
      similarRoles: Boolean(similarRoles?.roles?.length),
      quickTips: Boolean(quickTips?.quickWins?.length || quickTips?.industryInsights?.length),
      growthTrajectory: Boolean(growthTrajectory?.shortTerm?.role || growthTrajectory?.mediumTerm?.role),
      learningPathRoadmap: Boolean(learningPathRoadmap?.careerTrajectory?.length),
    };
    
    setCompletedSections(prev => ({...prev, ...sections}));
  }, [results]);
  
  /**
   * Save career analysis to user's account
   */
  const saveAnalysis = async () => {
    if (!user || !formData) return;
    
    try {
      const response = await fetch('/api/save-career-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          professionalLevel: formData.professionalLevel,
          currentSkills: formData.currentSkills,
          educationalBackground: formData.educationalBackground,
          careerHistory: formData.careerHistory,
          desiredRole: formData.desiredRole,
          state: formData.state,
          country: formData.country,
          result: results,
          progress: 100,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save analysis');
      }
      
      setSavedToAccount(true);
      toast({
        title: 'Analysis Saved',
        description: 'Your career analysis has been saved to your account.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error saving analysis:', error);
      toast({
        title: 'Save Failed',
        description: 'Failed to save analysis to your account. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  /**
   * Toggle debug mode for testing/development
   */
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };
  
  /**
   * Toggle debug state for a specific section
   */
  const toggleDebugSection = (section: keyof DebugStates) => {
    setDebugStates(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  
  /**
   * Render the Executive Summary section
   */
  const renderExecutiveSummary = () => (
    <div className="space-y-4">
      {debugMode && (
        <div className="bg-muted p-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleDebugSection('executiveSummary')}
          >
            Toggle Debug
          </Button>
          {debugStates.executiveSummary && (
            <pre className="mt-2 overflow-auto">
              {JSON.stringify(executiveSummary, null, 2)}
            </pre>
          )}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Summary</h3>
          <p className="mt-1">{executiveSummary.summary}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">Career Goal</h3>
          <p className="mt-1">{executiveSummary.careerGoal}</p>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">Fit Score</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="text-xl font-bold">
              {executiveSummary.fitScore.score}/{executiveSummary.fitScore.outOf}
            </div>
            <div className="text-sm text-muted-foreground">
              {executiveSummary.fitScore.description}
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold">Key Findings</h3>
          <ul className="mt-1 pl-5 list-disc">
            {executiveSummary.keyFindings.map((finding, index) => (
              <li key={index} className="mt-1">
                {finding}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
  
  /**
   * Render the Skill Mapping section
   */
  const renderSkillMapping = () => (
    <div className="space-y-6">
      {debugMode && (
        <div className="bg-muted p-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleDebugSection('skillMapping')}
          >
            Toggle Debug
          </Button>
          {debugStates.skillMapping && (
            <pre className="mt-2 overflow-auto">
              {JSON.stringify(skillMapping, null, 2)}
            </pre>
          )}
        </div>
      )}
      
      <div>
        <p className="text-muted-foreground mb-4">{skillMapping.skillsAnalysis}</p>
      </div>
      
      {skillMapping.sfiaSkills && skillMapping.sfiaSkills.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-primary bg-primary/10">SFIA 9</Badge>
            <span>Skills Framework for the Information Age</span>
          </h3>
          
          <div className="space-y-3">
            {skillMapping.sfiaSkills.map((skill, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <div className="font-medium">{skill.skill}</div>
                    <Badge>{skill.proficiency}/7</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {skillMapping.digCompSkills && skillMapping.digCompSkills.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <Badge variant="outline" className="text-blue-500 bg-blue-500/10">DigComp 2.2</Badge>
            <span>Digital Competence Framework</span>
          </h3>
          
          <div className="space-y-3">
            {skillMapping.digCompSkills.map((skill, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <div className="font-medium">{skill.skill}</div>
                    <Badge variant="secondary">{skill.proficiency}/7</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {skillMapping.otherSkills && skillMapping.otherSkills.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Other Skills</h3>
          
          <div className="space-y-3">
            {skillMapping.otherSkills.map((skill, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <div className="font-medium">{skill.skill}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{skill.category}</Badge>
                      <Badge variant="secondary">{skill.proficiency}/7</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  
  /**
   * Render the Skill Gap Analysis section
   */
  const renderSkillGapAnalysis = () => (
    <div className="space-y-6">
      {debugMode && (
        <div className="bg-muted p-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleDebugSection('gapAnalysis')}
          >
            Toggle Debug
          </Button>
          {debugStates.gapAnalysis && (
            <pre className="mt-2 overflow-auto">
              {JSON.stringify(skillGapAnalysis, null, 2)}
            </pre>
          )}
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-semibold">Target Role</h3>
        <p className="mt-1 font-medium text-primary">{skillGapAnalysis.targetRole}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Current Proficiency</h3>
          <SkillRadarChart data={skillGapAnalysis.currentProficiencyData} />
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Gap Analysis</h3>
          <ComparativeBarChart data={skillGapAnalysis.gapAnalysisData} />
        </Card>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
        <Card className="p-4 bg-primary/5">
          <p className="text-sm">{skillGapAnalysis.aiAnalysis}</p>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Key Gaps</h3>
          <div className="space-y-3">
            {skillGapAnalysis.keyGaps.map((gap, index) => (
              <Card key={index} className="border-l-4 border-l-destructive">
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <div className="font-medium">{gap.skill}</div>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline">Gap: {gap.gap}</Badge>
                      <Badge variant={
                        gap.priority === 'High' ? 'destructive' : 
                        gap.priority === 'Medium' ? 'default' : 'outline'
                      }>
                        {gap.priority}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Current: {gap.currentLevel}/7</span>
                    <span>Required: {gap.requiredLevel}/7</span>
                  </div>
                  <p className="text-sm mt-2">{gap.improvementSuggestion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Key Strengths</h3>
          <div className="space-y-3">
            {skillGapAnalysis.keyStrengths.map((strength, index) => (
              <Card key={index} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex justify-between">
                    <div className="font-medium">{strength.skill}</div>
                    <Badge className="bg-green-500 hover:bg-green-600">
                      +{strength.advantage}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Current: {strength.currentLevel}/7</span>
                    <span>Required: {strength.requiredLevel}/7</span>
                  </div>
                  <p className="text-sm mt-2">{strength.leverageSuggestion}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
  
  /**
   * Render the Career Pathway Options section
   */
  const renderCareerPathwayOptions = () => (
    <div className="space-y-6">
      {debugMode && (
        <div className="bg-muted p-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleDebugSection('pathwayOptions')}
          >
            Toggle Debug
          </Button>
          {debugStates.pathwayOptions && (
            <pre className="mt-2 overflow-auto">
              {JSON.stringify(careerPathwayOptions, null, 2)}
            </pre>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <CardTitle className="text-lg mb-2">Transition Overview</CardTitle>
          <CardContent className="p-0 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Role:</span>
              <span className="font-medium">{careerPathwayOptions.currentRole}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target Role:</span>
              <span className="font-medium text-primary">{careerPathwayOptions.targetRole}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Difficulty:</span>
              <Badge variant={
                careerPathwayOptions.transitionDifficulty === 'Easy' ? 'outline' : 
                careerPathwayOptions.transitionDifficulty === 'Moderate' ? 'default' : 'destructive'
              }>
                {careerPathwayOptions.transitionDifficulty}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timeframe:</span>
              <span className="font-medium">{careerPathwayOptions.estimatedTimeframe}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="p-4">
          <CardTitle className="text-lg mb-2">AI Insights</CardTitle>
          <CardContent className="p-0">
            <p className="text-sm">{careerPathwayOptions.aiInsights}</p>
          </CardContent>
        </Card>
      </div>
      
      <CareerPathwayStepsDisplay 
        currentRole={careerPathwayOptions.currentRole}
        targetRole={careerPathwayOptions.targetRole}
        steps={careerPathwayOptions.pathwaySteps}
        timeframe={careerPathwayOptions.estimatedTimeframe}
      />
      
      <Tabs defaultValue="university">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="university">University Pathway</TabsTrigger>
          <TabsTrigger value="vocational">Vocational Pathway</TabsTrigger>
        </TabsList>
        
        <TabsContent value="university" className="space-y-4 mt-4">
          <div>
            <h3 className="text-md font-medium mb-2">Recommended Degrees</h3>
            <ul className="pl-5 list-disc">
              {careerPathwayOptions.universityPathway.degrees.map((degree, index) => (
                <li key={index} className="mt-1">{degree}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Suggested Institutions</h3>
            <ul className="pl-5 list-disc">
              {careerPathwayOptions.universityPathway.institutions.map((institution, index) => (
                <li key={index} className="mt-1">{institution}</li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Estimated Duration:</span>
            <Badge variant="outline">
              {careerPathwayOptions.universityPathway.estimatedDuration}
            </Badge>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Expected Outcomes</h3>
            <ul className="pl-5 list-disc">
              {careerPathwayOptions.universityPathway.outcomes.map((outcome, index) => (
                <li key={index} className="mt-1">{outcome}</li>
              ))}
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="vocational" className="space-y-4 mt-4">
          <div>
            <h3 className="text-md font-medium mb-2">Recommended Certifications</h3>
            <ul className="pl-5 list-disc">
              {careerPathwayOptions.vocationalPathway.certifications.map((cert, index) => (
                <li key={index} className="mt-1">{cert}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Suggested Providers</h3>
            <ul className="pl-5 list-disc">
              {careerPathwayOptions.vocationalPathway.providers.map((provider, index) => (
                <li key={index} className="mt-1">{provider}</li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Estimated Duration:</span>
            <Badge variant="outline">
              {careerPathwayOptions.vocationalPathway.estimatedDuration}
            </Badge>
          </div>
          
          <div>
            <h3 className="text-md font-medium mb-2">Expected Outcomes</h3>
            <ul className="pl-5 list-disc">
              {careerPathwayOptions.vocationalPathway.outcomes.map((outcome, index) => (
                <li key={index} className="mt-1">{outcome}</li>
              ))}
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
  
  /**
   * Render section selector buttons
   */
  const renderSectionSelector = () => {
    const sections = [
      {
        id: 'overview',
        name: 'Executive Summary',
        icon: <User className="h-4 w-4" />,
        completed: completedSections.executiveSummary,
      },
      {
        id: 'skillMapping',
        name: 'Skill Mapping',
        icon: <ListChecks className="h-4 w-4" />,
        completed: completedSections.skillMapping,
      },
      {
        id: 'gapAnalysis',
        name: 'Gap Analysis',
        icon: <BarChart className="h-4 w-4" />,
        completed: completedSections.skillGapAnalysis,
      },
      {
        id: 'pathwayOptions',
        name: 'Pathway Options',
        icon: <Rocket className="h-4 w-4" />,
        completed: completedSections.careerPathwayOptions,
      },
      {
        id: 'developmentPlan',
        name: 'Development Plan',
        icon: <TrendingUp className="h-4 w-4" />,
        completed: completedSections.developmentPlan,
      },
      {
        id: 'educationalPrograms',
        name: 'Educational Programs',
        icon: <School className="h-4 w-4" />,
        completed: completedSections.educationalPrograms,
      },
      {
        id: 'learningRoadmap',
        name: 'Learning Roadmap',
        icon: <BookOpen className="h-4 w-4" />,
        completed: completedSections.learningRoadmap,
      },
      {
        id: 'similarRoles',
        name: 'Similar Roles',
        icon: <UserCheck className="h-4 w-4" />,
        completed: completedSections.similarRoles,
      },
      {
        id: 'quickTips',
        name: 'Quick Tips',
        icon: <Lightbulb className="h-4 w-4" />,
        completed: completedSections.quickTips,
      },
      {
        id: 'growthTrajectory',
        name: 'Growth Trajectory',
        icon: <LineChart className="h-4 w-4" />,
        completed: completedSections.growthTrajectory,
      },
      {
        id: 'learningPathRoadmap',
        name: 'Learning Path',
        icon: <Trophy className="h-4 w-4" />,
        completed: completedSections.learningPathRoadmap,
      },
    ];
    
    return (
      <div className="flex flex-col gap-1 w-full">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? 'default' : 'ghost'}
            className={`justify-start ${!section.completed ? 'opacity-70' : ''}`}
            onClick={() => setActiveSection(section.id)}
            disabled={!section.completed}
          >
            <div className="flex items-center gap-2">
              {section.icon}
              <span>{section.name}</span>
            </div>
            {section.completed && activeSection === section.id && (
              <ChevronRight className="h-4 w-4 ml-auto" />
            )}
          </Button>
        ))}
      </div>
    );
  };
  
  /**
   * Determine which section to render based on active selection
   */
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderExecutiveSummary();
      case 'skillMapping':
        return renderSkillMapping();
      case 'gapAnalysis':
        return renderSkillGapAnalysis();
      case 'pathwayOptions':
        return renderCareerPathwayOptions();
      case 'developmentPlan':
        return <div>Development Plan Content</div>;
      case 'educationalPrograms':
        return <div>Educational Programs Content</div>;
      case 'learningRoadmap':
        return <div>Learning Roadmap Content</div>;
      case 'similarRoles':
        return <div>Similar Roles Content</div>;
      case 'quickTips':
        return <div>Quick Tips Content</div>;
      case 'growthTrajectory':
        return <div>Growth Trajectory Content</div>;
      case 'learningPathRoadmap':
        return <div>Learning Path Roadmap Content</div>;
      default:
        return renderExecutiveSummary();
    }
  };
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container mx-auto py-6"
    >
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="ghost"
          onClick={onRestart}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Form
        </Button>
        
        <div className="flex gap-2">
          {!savedToAccount && user && (
            <Button 
              variant="outline"
              onClick={saveAnalysis}
            >
              Save to Account
            </Button>
          )}
          
          <Button
            variant="default"
            disabled={isDownloading}
            onClick={() => {
              setIsDownloading(true);
              // PDF Download logic would go here
              setTimeout(() => {
                setIsDownloading(false);
                toast({
                  title: 'Download Complete',
                  description: 'Your career analysis report has been downloaded.',
                });
              }, 1500);
            }}
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Download Report
              </>
            )}
          </Button>
          
          {process.env.NODE_ENV === 'development' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDebugMode}
              className="w-8 h-8"
            >
              <AlertCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      <Card className="w-full">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Career Pathway Analysis for {formData?.desiredRole}</CardTitle>
          </div>
          <CardDescription>
            Generated on {new Date(timestamp).toLocaleDateString()} • Structured Format
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-4">
            <div className="md:col-span-1 border-r p-4">
              {renderSectionSelector()}
            </div>
            
            <div className="md:col-span-3 p-6">
              {renderActiveSection()}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}