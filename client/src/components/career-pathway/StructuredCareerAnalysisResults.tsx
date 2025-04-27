/**
 * Structured Career Analysis Results Component
 * 
 * Displays the results of a structured career analysis report, ensuring
 * all 11 sections are properly ordered and rendered with a futuristic design.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  Loader2,
  Rocket,
  School,
  Sparkles,
  TrendingUp,
  Trophy,
  User,
  UserCheck,
  Info,
  Zap,
  GraduationCap,
  Brain,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { CareerAnalysisReport } from '../../../shared/reportSchema';
import { fadeIn, fadeInUp, fadeInLeft, fadeInRight, staggerChildren, listItem } from '@/lib/animations';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
  const [activeSection, setActiveSection] = useState('executiveSummary');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
    setIsSaving(true);
    
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
    } finally {
      setIsSaving(false);
    }
  };
  
  /**
   * Handle downloading the report as HTML
   */
  const handleDownloadReport = async () => {
    setIsDownloading(true);
    toast({
      title: 'Download Started',
      description: 'Preparing your career analysis report...',
    });
    
    try {
      // Create a new HTML document for the report
      const reportContent = document.getElementById('report-content');
      if (!reportContent) {
        throw new Error('Report content not found');
      }
      
      // Clone the content
      const contentClone = reportContent.cloneNode(true) as HTMLElement;
      
      // Create HTML template with styling
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Skillgenix Career Analysis - ${executiveSummary.careerGoal}</title>
          <style>
            /* Base styles */
            :root {
              --primary: rgb(28, 59, 130);
              --primary-light: rgba(28, 59, 130, 0.1);
              --accent: rgb(163, 29, 82);
              --accent-light: rgba(163, 29, 82, 0.1);
              --text: #333;
              --text-light: #666;
              --background: #fff;
              --background-alt: #f8f9fa;
              --border: #e2e8f0;
              --success: #10b981;
              --warning: #f59e0b;
              --error: #ef4444;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: var(--text);
              background-color: var(--background);
              margin: 0;
              padding: 0;
            }
            
            * {
              box-sizing: border-box;
            }
            
            .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 2rem;
            }
            
            header {
              background: linear-gradient(135deg, var(--primary), var(--accent));
              color: white;
              padding: 2rem;
              border-radius: 0.5rem 0.5rem 0 0;
              position: relative;
              overflow: hidden;
            }
            
            header::before {
              content: '';
              position: absolute;
              top: 0;
              right: 0;
              bottom: 0;
              left: 0;
              background-image: 
                radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 20%),
                radial-gradient(circle at 80% 30%, rgba(255,255,255,0.1) 0%, transparent 20%);
              z-index: 0;
            }
            
            header > * {
              position: relative;
              z-index: 1;
            }
            
            h1, h2, h3, h4, h5, h6 {
              color: var(--primary);
              margin-top: 1.5rem;
              margin-bottom: 1rem;
            }
            
            header h1, header h2, header h3, header p {
              color: white;
            }
            
            p {
              margin-top: 0;
              margin-bottom: 1rem;
            }
            
            .card {
              background: var(--background);
              border-radius: 0.5rem;
              box-shadow: 0 4px 12px rgba(0,0,0,0.05);
              padding: 1.5rem;
              margin-bottom: 1.5rem;
              border: 1px solid var(--border);
            }
            
            .card-header {
              display: flex;
              align-items: center;
              margin-bottom: 1rem;
              padding-bottom: 0.5rem;
              border-bottom: 1px solid var(--border);
            }
            
            .card-header-icon {
              background: var(--primary-light);
              color: var(--primary);
              width: 2.5rem;
              height: 2.5rem;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 0.75rem;
            }
            
            .badge {
              display: inline-block;
              padding: 0.35em 0.65em;
              font-size: 0.75em;
              font-weight: 700;
              line-height: 1;
              text-align: center;
              white-space: nowrap;
              vertical-align: baseline;
              border-radius: 0.25rem;
              background: var(--primary-light);
              color: var(--primary);
            }
            
            .badge-accent {
              background: var(--accent-light);
              color: var(--accent);
            }
            
            .grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
              gap: 1.5rem;
            }
            
            .progress-bar {
              height: 0.5rem;
              background-color: var(--border);
              border-radius: 9999px;
              overflow: hidden;
            }
            
            .progress-bar-fill {
              height: 100%;
              background-color: var(--primary);
              border-radius: 9999px;
            }
            
            ul, ol {
              padding-left: 1.5rem;
            }
            
            li {
              margin-bottom: 0.5rem;
            }
            
            .skill-card {
              background: var(--background-alt);
              border-radius: 0.375rem;
              padding: 1rem;
              margin-bottom: 0.75rem;
              border-left: 4px solid var(--primary);
            }
            
            .skill-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 0.5rem;
            }
            
            .skill-name {
              font-weight: 600;
            }
            
            .skill-level {
              font-weight: 600;
            }
            
            .footer {
              text-align: center;
              padding: 2rem;
              margin-top: 2rem;
              color: var(--text-light);
              font-size: 0.875rem;
              border-top: 1px solid var(--border);
            }
            
            @media print {
              body {
                background: white;
              }
              .container {
                max-width: 100%;
                padding: 0;
              }
              .card {
                break-inside: avoid;
                page-break-inside: avoid;
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <header>
              <h1>Career Analysis Report</h1>
              <p>Generated by Skillgenix on ${new Date(timestamp).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              <h2>${executiveSummary.careerGoal}</h2>
            </header>
            
            <div class="content">
              ${contentClone.innerHTML}
            </div>
            
            <footer class="footer">
              <p>© ${new Date().getFullYear()} Skillgenix | AI-Powered Career Pathway Development</p>
              <p>This analysis is based on information provided and should be used as a guide for your career development.</p>
            </footer>
          </div>
        </body>
        </html>
      `;
      
      // Create a Blob with the HTML content
      const blob = new Blob([html], { type: 'text/html' });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Skillgenix_Career_Analysis_${formData?.desiredRole.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsDownloading(false);
        toast({
          title: 'Download Complete',
          description: 'Your career analysis report has been downloaded successfully.',
        });
      }, 100);
      
    } catch (error) {
      console.error('Error downloading report:', error);
      setIsDownloading(false);
      toast({
        title: 'Download Failed',
        description: 'An error occurred while generating your report. Please try again.',
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
   * Render a section title with an info tooltip
   */
  const renderSectionTitle = (title: string, description: string, icon: React.ReactNode) => (
    <div className="flex items-center gap-2">
      <div className="p-2 rounded-full bg-primary/10">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
              <Info className="h-4 w-4" />
              <span className="sr-only">Info</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
  
  /**
   * Render the Executive Summary section
   */
  const renderExecutiveSummary = () => (
    <motion.div 
      className="space-y-6"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
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
      
      <Card className="border-l-4 border-l-primary overflow-hidden">
        <CardHeader className="pb-2 pt-4">
          {renderSectionTitle(
            "Executive Summary", 
            "A concise overview of your career analysis, highlighting the key findings and fit score for your desired role.",
            <Trophy className="h-5 w-5 text-primary" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mt-16 -mr-16 z-0"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -mb-12 -ml-12 z-0"></div>
            
            <div className="relative z-10">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Rocket className="h-4 w-4 text-primary" />
                Career Goal
              </h4>
              <p className="mt-1 text-lg font-medium text-primary">{executiveSummary.careerGoal}</p>
            </div>
            
            <div className="relative z-10">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-primary" />
                Summary
              </h4>
              <p className="mt-1">{executiveSummary.summary}</p>
            </div>
            
            <div className="relative z-10 p-4 bg-gradient-to-r from-primary/10 to-transparent rounded-lg">
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Fit Score
              </h4>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center justify-center p-4 w-16 h-16 bg-white shadow-md rounded-full text-xl font-bold text-primary">
                  {executiveSummary.fitScore.score}/{executiveSummary.fitScore.outOf}
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(executiveSummary.fitScore.score / executiveSummary.fitScore.outOf) * 100}%` }}></div>
                  </div>
                  <p className="text-sm mt-2">{executiveSummary.fitScore.description}</p>
                </div>
              </div>
            </div>
            
            <motion.div 
              className="relative z-10"
              variants={staggerChildren}
            >
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-primary" />
                Key Findings
              </h4>
              <ul className="mt-2 space-y-3">
                {executiveSummary.keyFindings.map((finding: string, index: number) => (
                  <motion.li 
                    key={index} 
                    className="flex items-start gap-2"
                    variants={listItem}
                  >
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span>{finding}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
  
  /**
   * Render the Skill Mapping section
   */
  const renderSkillMapping = () => (
    <motion.div 
      className="space-y-6"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
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
      
      <Card className="border-l-4 border-l-blue-500 overflow-hidden">
        <CardHeader className="pb-2 pt-4">
          {renderSectionTitle(
            "Skill Mapping", 
            "Visualization of your current skills mapped against industry frameworks (SFIA 9 and DigComp 2.2) to provide a comprehensive skills assessment.",
            <BarChart className="h-5 w-5 text-blue-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-muted-foreground">{skillMapping.skillsAnalysis}</p>
            </div>
            
            {skillMapping.sfiaSkills && skillMapping.sfiaSkills.length > 0 && (
              <motion.div 
                variants={fadeInUp}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-primary bg-primary/10 py-1">SFIA 9</Badge>
                  <h4 className="font-semibold">Skills Framework for the Information Age</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>SFIA provides a standardized framework for IT skills and competencies, with 7 levels of responsibility.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skillMapping.sfiaSkills.map((skill: any, index: number) => (
                    <motion.div
                      key={index}
                      variants={fadeInLeft}
                      custom={index * 0.1}
                      className="border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent p-3 rounded-r-lg"
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{skill.skill}</div>
                        <Badge className="bg-primary text-white">{skill.proficiency}/7</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>
                    </motion.div>
                  ))}
                </div>
                
                {skillMapping.sfiaSkills.length > 0 && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                    <SkillRadarChart 
                      data={skillMapping.sfiaSkills.map((skill: any) => ({
                        name: skill.skill,
                        value: skill.proficiency,
                        fullMark: 7
                      }))} 
                      title="SFIA Skills Radar" 
                    />
                  </div>
                )}
              </motion.div>
            )}
            
            {skillMapping.digCompSkills && skillMapping.digCompSkills.length > 0 && (
              <motion.div 
                variants={fadeInUp}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-blue-500 bg-blue-500/10 py-1">DigComp 2.2</Badge>
                  <h4 className="font-semibold">Digital Competence Framework</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>The European Digital Competence Framework is used to assess digital skills across 5 key areas.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skillMapping.digCompSkills.map((skill: any, index: number) => (
                    <motion.div
                      key={index}
                      variants={fadeInRight}
                      custom={index * 0.1}
                      className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-transparent p-3 rounded-r-lg"
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{skill.skill}</div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">{skill.proficiency}/7</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            
            {skillMapping.otherSkills && skillMapping.otherSkills.length > 0 && (
              <motion.div 
                variants={fadeInUp}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">Other Professional Skills</h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Additional professional skills that are relevant to your desired career path.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {skillMapping.otherSkills.map((skill: any, index: number) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      custom={index * 0.05}
                      className="border border-gray-200 bg-white p-3 rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{skill.skill}</div>
                        <div className="flex items-center gap-2">
                          {skill.category && (
                            <Badge variant="outline" className="text-xs">{skill.category}</Badge>
                          )}
                          <Badge variant="secondary">{skill.proficiency}/7</Badge>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
  
  /**
   * Render the Skill Gap Analysis section
   */
  const renderSkillGapAnalysis = () => (
    <motion.div 
      className="space-y-6"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
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
      
      <Card className="border-l-4 border-l-orange-500 overflow-hidden">
        <CardHeader className="pb-2 pt-4">
          {renderSectionTitle(
            "Skill Gap Analysis", 
            "Analysis of gaps between your current skill levels and those required for your target role, identifying areas for development.",
            <LineChart className="h-5 w-5 text-orange-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Target Role: {skillGapAnalysis.targetRole}
              </h4>
              <p className="text-muted-foreground">{skillGapAnalysis.aiAnalysis}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div 
                variants={fadeInLeft}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <h4 className="text-lg font-semibold mb-4">Current Proficiency</h4>
                <div className="h-64">
                  {skillGapAnalysis.currentProficiencyData && (
                    <ComparativeBarChart data={skillGapAnalysis.currentProficiencyData} />
                  )}
                </div>
                <div className="mt-2 flex justify-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          How to read this chart
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>This chart shows your current proficiency levels across key skills relevant to your target role.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </motion.div>
              
              <motion.div 
                variants={fadeInRight}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <h4 className="text-lg font-semibold mb-4">Gap Analysis</h4>
                <div className="h-64">
                  {skillGapAnalysis.gapAnalysisData && (
                    <ComparativeBarChart data={skillGapAnalysis.gapAnalysisData} />
                  )}
                </div>
                <div className="mt-2 flex justify-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          How to read this chart
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>This chart compares your current skill levels with the required levels for your target role, highlighting gaps that need attention.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div 
                variants={fadeInUp}
                className="space-y-4"
              >
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Key Skill Gaps
                </h4>
                
                <div className="space-y-3">
                  {skillGapAnalysis.keyGaps.map((gap: any, index: number) => (
                    <motion.div
                      key={index}
                      variants={fadeInLeft}
                      custom={index * 0.1}
                      className="bg-amber-50 border border-amber-100 rounded-lg p-3 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-1" style={{
                        background: gap.priority === 'High' 
                          ? 'rgb(239, 68, 68)' 
                          : gap.priority === 'Medium' 
                            ? 'rgb(245, 158, 11)' 
                            : 'rgb(34, 197, 94)'
                      }}></div>
                      
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{gap.skill}</div>
                        <Badge variant={gap.priority === 'High' 
                          ? 'destructive' 
                          : gap.priority === 'Medium' 
                            ? 'default' 
                            : 'outline'}
                        >
                          {gap.priority} Priority
                        </Badge>
                      </div>
                      
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(gap.currentLevel / 7) * 100}%` }}></div>
                      </div>
                      
                      <div className="mt-1 text-xs flex justify-between">
                        <span>Current: {gap.currentLevel}/7</span>
                        <span>Required: {gap.requiredLevel}/7</span>
                        <span>Gap: {gap.gap}</span>
                      </div>
                      
                      <p className="text-sm mt-2">{gap.improvementSuggestion}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div 
                variants={fadeInUp}
                className="space-y-4"
              >
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Key Strengths
                </h4>
                
                <div className="space-y-3">
                  {skillGapAnalysis.keyStrengths.map((strength: any, index: number) => (
                    <motion.div
                      key={index}
                      variants={fadeInRight}
                      custom={index * 0.1}
                      className="bg-green-50 border border-green-100 rounded-lg p-3"
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{strength.skill}</div>
                        <Badge variant="outline" className="bg-green-100 text-green-700">+{strength.advantage} Advantage</Badge>
                      </div>
                      
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(strength.currentLevel / 7) * 100}%` }}></div>
                      </div>
                      
                      <div className="mt-1 text-xs flex justify-between">
                        <span>Current: {strength.currentLevel}/7</span>
                        <span>Required: {strength.requiredLevel}/7</span>
                      </div>
                      
                      <p className="text-sm mt-2">{strength.leverageSuggestion}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
  
  /**
   * Render the Career Pathway Options section
   */
  const renderCareerPathwayOptions = () => (
    <motion.div 
      className="space-y-6"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
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
      
      <Card className="border-l-4 border-l-indigo-500 overflow-hidden">
        <CardHeader className="pb-2 pt-4">
          {renderSectionTitle(
            "Career Pathway Options", 
            "Exploration of different pathways to achieve your career goal, including both academic and vocational routes.",
            <Rocket className="h-5 w-5 text-indigo-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-200 py-1.5">
                  {careerPathwayOptions.currentRole} → {careerPathwayOptions.targetRole}
                </Badge>
                <Badge variant="outline" className="bg-white text-indigo-700 border-indigo-200 py-1.5">
                  Timeframe: {careerPathwayOptions.timeframe}
                </Badge>
              </div>
              <p>{careerPathwayOptions.pathwayDescription}</p>
            </div>
            
            <motion.div 
              variants={fadeInUp}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <LineChart className="h-4 w-4 text-indigo-500" />
                Career Pathway Steps
              </h4>
              
              <div className="pb-4">
                <CareerPathwayStepsDisplay 
                  steps={careerPathwayOptions.pathwaySteps}
                  currentRole={careerPathwayOptions.currentRole}
                  targetRole={careerPathwayOptions.targetRole}
                  timeframe={careerPathwayOptions.timeframe}
                />
              </div>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div 
                variants={fadeInLeft}
                className="space-y-4"
              >
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <School className="h-4 w-4 text-indigo-500" />
                  University Pathway
                </h4>
                
                <div className="space-y-3">
                  {careerPathwayOptions.universityPathway.map((degree: any, index: number) => (
                    <Accordion key={index} type="single" collapsible className="border rounded-lg">
                      <AccordionItem value={`degree-${index}`} className="border-0">
                        <AccordionTrigger className="px-4 py-2 hover:bg-indigo-50 data-[state=open]:bg-indigo-50">
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-indigo-500" />
                            <span>{degree.degree}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 pt-1">
                          <div className="space-y-3">
                            <div>
                              <h5 className="font-medium text-sm">Top Institutions</h5>
                              <ul className="mt-1 space-y-1">
                                {degree.institutions.map((institution: string, idx: number) => (
                                  <li key={idx} className="text-sm flex items-start gap-2">
                                    <div className="rounded-full bg-indigo-100 text-indigo-600 h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                      {idx + 1}
                                    </div>
                                    {institution}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h5 className="font-medium text-sm">Duration</h5>
                              <p className="text-sm">{degree.duration}</p>
                            </div>
                            
                            <div>
                              <h5 className="font-medium text-sm">Career Outcomes</h5>
                              <ul className="mt-1 space-y-1">
                                {degree.outcomes.map((outcome: string, idx: number) => (
                                  <li key={idx} className="text-sm flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    {outcome}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              </motion.div>
              
              <motion.div 
                variants={fadeInRight}
                className="space-y-4"
              >
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-orange-500" />
                  Vocational Pathway
                </h4>
                
                <div className="space-y-3">
                  {careerPathwayOptions.vocationalPathway.map((cert: any, index: number) => (
                    <Accordion key={index} type="single" collapsible className="border rounded-lg">
                      <AccordionItem value={`cert-${index}`} className="border-0">
                        <AccordionTrigger className="px-4 py-2 hover:bg-orange-50 data-[state=open]:bg-orange-50">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-orange-100 border-orange-200 text-orange-700">
                              Certification
                            </Badge>
                            <span>{cert.certification}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-3 pt-1">
                          <div className="space-y-3">
                            <div>
                              <h5 className="font-medium text-sm">Top Providers</h5>
                              <ul className="mt-1 space-y-1">
                                {cert.providers.map((provider: string, idx: number) => (
                                  <li key={idx} className="text-sm flex items-start gap-2">
                                    <div className="rounded-full bg-orange-100 text-orange-600 h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                                      {idx + 1}
                                    </div>
                                    {provider}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h5 className="font-medium text-sm">Duration</h5>
                              <p className="text-sm">{cert.duration}</p>
                            </div>
                            
                            <div>
                              <h5 className="font-medium text-sm">Career Outcomes</h5>
                              <ul className="mt-1 space-y-1">
                                {cert.outcomes.map((outcome: string, idx: number) => (
                                  <li key={idx} className="text-sm flex items-start gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                                    {outcome}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ))}
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              variants={fadeInUp}
              className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100"
            >
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Brain className="h-4 w-4 text-indigo-600" />
                AI Insights
              </h4>
              <p>{careerPathwayOptions.aiInsights}</p>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
  
  /**
   * Render the Development Plan section
   */
  const renderDevelopmentPlan = () => (
    <motion.div 
      className="space-y-6"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      {debugMode && (
        <div className="bg-muted p-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleDebugSection('developmentPlan')}
          >
            Toggle Debug
          </Button>
          {debugStates.developmentPlan && (
            <pre className="mt-2 overflow-auto">
              {JSON.stringify(developmentPlan, null, 2)}
            </pre>
          )}
        </div>
      )}
      
      <Card className="border-l-4 border-l-green-500 overflow-hidden">
        <CardHeader className="pb-2 pt-4">
          {renderSectionTitle(
            "Development Plan", 
            "A detailed plan for developing the skills needed to achieve your career goals, with specific timeframes and resources.",
            <ListChecks className="h-5 w-5 text-green-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
              <p>{developmentPlan.overview}</p>
            </div>
            
            <Tabs defaultValue="technical" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="technical">Technical Skills</TabsTrigger>
                <TabsTrigger value="soft">Soft Skills</TabsTrigger>
                <TabsTrigger value="acquire">Skills to Acquire</TabsTrigger>
              </TabsList>
              
              <TabsContent value="technical" className="mt-4 space-y-4">
                {developmentPlan.technicalSkills.map((skill: any, index: number) => (
                  <motion.div
                    key={index}
                    variants={fadeInLeft}
                    custom={index * 0.1}
                    className="bg-white border border-gray-200 shadow-sm rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-lg">{skill.skill}</div>
                      <Badge className="bg-green-100 text-green-700">
                        {skill.timeframe}
                      </Badge>
                    </div>
                    
                    <div className="mt-3 flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">Current Level:</div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-3 h-3 rounded-full ${i < skill.currentLevel ? 'bg-green-500' : 'bg-gray-200'}`}
                          ></div>
                        ))}
                      </div>
                      <div className="text-sm font-medium">{skill.currentLevel}/7</div>
                    </div>
                    
                    <div className="mt-2 flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">Target Level:</div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-3 h-3 rounded-full ${i < skill.targetLevel ? 'bg-green-500' : 'bg-gray-200'}`}
                          ></div>
                        ))}
                      </div>
                      <div className="text-sm font-medium">{skill.targetLevel}/7</div>
                    </div>
                    
                    <div className="mt-4">
                      <h5 className="text-sm font-medium mb-2">Recommended Resources:</h5>
                      <ul className="space-y-1">
                        {skill.resources.map((resource: string, idx: number) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                            {resource}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </TabsContent>
              
              <TabsContent value="soft" className="mt-4 space-y-4">
                {developmentPlan.softSkills.map((skill: any, index: number) => (
                  <motion.div
                    key={index}
                    variants={fadeInLeft}
                    custom={index * 0.1}
                    className="bg-white border border-gray-200 shadow-sm rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-lg">{skill.skill}</div>
                      <Badge className="bg-blue-100 text-blue-700">
                        {skill.timeframe}
                      </Badge>
                    </div>
                    
                    <div className="mt-3 flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">Current Level:</div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-3 h-3 rounded-full ${i < skill.currentLevel ? 'bg-blue-500' : 'bg-gray-200'}`}
                          ></div>
                        ))}
                      </div>
                      <div className="text-sm font-medium">{skill.currentLevel}/7</div>
                    </div>
                    
                    <div className="mt-2 flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">Target Level:</div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-3 h-3 rounded-full ${i < skill.targetLevel ? 'bg-blue-500' : 'bg-gray-200'}`}
                          ></div>
                        ))}
                      </div>
                      <div className="text-sm font-medium">{skill.targetLevel}/7</div>
                    </div>
                    
                    <div className="mt-4">
                      <h5 className="text-sm font-medium mb-2">Recommended Resources:</h5>
                      <ul className="space-y-1">
                        {skill.resources.map((resource: string, idx: number) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            {resource}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </TabsContent>
              
              <TabsContent value="acquire" className="mt-4 space-y-4">
                {developmentPlan.skillsToAcquire.map((skill: any, index: number) => (
                  <motion.div
                    key={index}
                    variants={fadeInLeft}
                    custom={index * 0.1}
                    className="bg-white border border-gray-200 shadow-sm rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-lg">{skill.skill}</div>
                      <Badge className="bg-purple-100 text-purple-700">
                        {skill.timeframe}
                      </Badge>
                    </div>
                    
                    <div className="mt-2">
                      <h5 className="text-sm font-medium">Why this skill is important:</h5>
                      <p className="text-sm mt-1">{skill.reason}</p>
                    </div>
                    
                    <div className="mt-4">
                      <h5 className="text-sm font-medium mb-2">Recommended Resources:</h5>
                      <ul className="space-y-1">
                        {skill.resources.map((resource: string, idx: number) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                            {resource}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
  
  /**
   * Render the Educational Programs section
   */
  const renderEducationalPrograms = () => (
    <motion.div 
      className="space-y-6"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      {debugMode && (
        <div className="bg-muted p-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleDebugSection('educationalPrograms')}
          >
            Toggle Debug
          </Button>
          {debugStates.educationalPrograms && (
            <pre className="mt-2 overflow-auto">
              {JSON.stringify(educationalPrograms, null, 2)}
            </pre>
          )}
        </div>
      )}
      
      <Card className="border-l-4 border-l-purple-500 overflow-hidden">
        <CardHeader className="pb-2 pt-4">
          {renderSectionTitle(
            "Educational Programs", 
            "Curated educational programs and self-directed project ideas to help you develop the skills needed for your target role.",
            <School className="h-5 w-5 text-purple-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <p>{educationalPrograms.introduction}</p>
            </div>
            
            <Tabs defaultValue="programs" className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="programs">Recommended Programs</TabsTrigger>
                <TabsTrigger value="projects">Project Ideas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="programs" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {educationalPrograms.recommendedPrograms.map((program: any, index: number) => (
                    <motion.div
                      key={index}
                      variants={fadeInLeft}
                      custom={index * 0.1}
                      className="bg-white border border-gray-200 shadow-sm rounded-lg p-4"
                    >
                      <div className="flex justify-between">
                        <h4 className="font-semibold">{program.name}</h4>
                        <Badge className="bg-purple-100 text-purple-700">
                          {program.format}
                        </Badge>
                      </div>
                      
                      <div className="mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-purple-500" />
                          {program.provider}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-4 w-4 text-purple-500" />
                          {program.duration}
                        </div>
                      </div>
                      
                      <p className="text-sm mt-3">{program.description}</p>
                      
                      <div className="mt-3">
                        <h5 className="text-xs font-medium text-muted-foreground mb-1">SKILLS COVERED</h5>
                        <div className="flex flex-wrap gap-2">
                          {program.skillsCovered.map((skill: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="bg-purple-50">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="projects" className="mt-4">
                <div className="space-y-4">
                  {educationalPrograms.projectIdeas.map((project: any, index: number) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      custom={index * 0.1}
                      className="bg-white border border-gray-200 shadow-sm rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold">{project.title}</h4>
                        <Badge className={
                          project.difficulty === 'Beginner' 
                            ? 'bg-green-100 text-green-700' 
                            : project.difficulty === 'Intermediate'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                        }>
                          {project.difficulty}
                        </Badge>
                      </div>
                      
                      <div className="mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-purple-500" />
                          {project.timeEstimate}
                        </div>
                      </div>
                      
                      <p className="text-sm mt-3">{project.description}</p>
                      
                      <div className="mt-3">
                        <h5 className="text-xs font-medium text-muted-foreground mb-1">SKILLS DEVELOPED</h5>
                        <div className="flex flex-wrap gap-2">
                          {project.skillsDeveloped.map((skill: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="bg-purple-50">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
  
  /**
   * Render the Learning Roadmap section
   */
  const renderLearningRoadmap = () => (
    <motion.div 
      className="space-y-6"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      {debugMode && (
        <div className="bg-muted p-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleDebugSection('learningRoadmap')}
          >
            Toggle Debug
          </Button>
          {debugStates.learningRoadmap && (
            <pre className="mt-2 overflow-auto">
              {JSON.stringify(learningRoadmap, null, 2)}
            </pre>
          )}
        </div>
      )}
      
      <Card className="border-l-4 border-l-cyan-500 overflow-hidden">
        <CardHeader className="pb-2 pt-4">
          {renderSectionTitle(
            "Learning Roadmap", 
            "A structured phase-by-phase approach to acquiring the necessary skills and knowledge for your target role.",
            <BookOpen className="h-5 w-5 text-cyan-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-cyan-50 rounded-lg p-4 border border-cyan-100">
              <p>{learningRoadmap.overview}</p>
            </div>
            
            <div className="space-y-6">
              {learningRoadmap.phases.map((phase: any, index: number) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  custom={index * 0.2}
                  className="relative"
                >
                  {index < learningRoadmap.phases.length - 1 && (
                    <div className="absolute top-14 bottom-0 left-6 border-l-2 border-dashed border-cyan-200 z-0"></div>
                  )}
                  
                  <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cyan-100 text-cyan-700 font-bold text-lg flex-shrink-0">
                        {index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-wrap justify-between items-center gap-2">
                          <h4 className="font-semibold text-lg">{phase.phase}</h4>
                          <Badge className="bg-cyan-100 text-cyan-700">
                            {phase.timeframe}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">{phase.focus}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pl-16">
                      <h5 className="text-sm font-semibold mb-2">Key Milestones</h5>
                      <ul className="space-y-2">
                        {phase.milestones.map((milestone: string, idx: number) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                            {milestone}
                          </li>
                        ))}
                      </ul>
                      
                      <h5 className="text-sm font-semibold mt-4 mb-2">Learning Resources</h5>
                      <ul className="space-y-2">
                        {phase.resources.map((resource: any, idx: number) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <Badge variant="outline" className="text-xs bg-white">
                              {resource.type}
                            </Badge>
                            <span>{resource.name}</span>
                            {resource.link && (
                              <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                (Link)
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
  
  /**
   * Render the Similar Roles section
   */
  const renderSimilarRoles = () => (
    <motion.div 
      className="space-y-6"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      {debugMode && (
        <div className="bg-muted p-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleDebugSection('similarRoles')}
          >
            Toggle Debug
          </Button>
          {debugStates.similarRoles && (
            <pre className="mt-2 overflow-auto">
              {JSON.stringify(similarRoles, null, 2)}
            </pre>
          )}
        </div>
      )}
      
      <Card className="border-l-4 border-l-yellow-500 overflow-hidden">
        <CardHeader className="pb-2 pt-4">
          {renderSectionTitle(
            "Similar Roles", 
            "Alternative career paths that leverage your existing skills and might provide additional opportunities.",
            <User className="h-5 w-5 text-yellow-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
              <p>{similarRoles.introduction}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {similarRoles.roles.map((role: any, index: number) => (
                <motion.div
                  key={index}
                  variants={index % 2 === 0 ? fadeInLeft : fadeInRight}
                  custom={index * 0.1}
                  className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden"
                >
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-b">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-lg">{role.role}</h4>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {role.similarityScore * 100}% Match
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <p className="text-sm">{role.summary}</p>
                    
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground mb-2">KEY SKILL OVERLAP</h5>
                      <div className="flex flex-wrap gap-2">
                        {role.keySkillOverlap.map((skill: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground mb-2">ADDITIONAL SKILLS NEEDED</h5>
                      <div className="flex flex-wrap gap-2">
                        {role.additionalSkillsNeeded.map((skill: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
  
  /**
   * Render the Quick Tips section
   */
  const renderQuickTips = () => (
    <motion.div 
      className="space-y-6"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      {debugMode && (
        <div className="bg-muted p-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleDebugSection('quickTips')}
          >
            Toggle Debug
          </Button>
          {debugStates.quickTips && (
            <pre className="mt-2 overflow-auto">
              {JSON.stringify(quickTips, null, 2)}
            </pre>
          )}
        </div>
      )}
      
      <Card className="border-l-4 border-l-emerald-500 overflow-hidden">
        <CardHeader className="pb-2 pt-4">
          {renderSectionTitle(
            "Quick Tips", 
            "Actionable tips and industry insights that you can implement immediately to make progress toward your goal.",
            <Lightbulb className="h-5 w-5 text-emerald-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
              <p>{quickTips.introduction}</p>
            </div>
            
            <motion.div 
              variants={staggerChildren}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
            >
              {quickTips.quickWins.map((tip: any, index: number) => (
                <motion.div
                  key={index}
                  variants={listItem}
                  className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-full z-0"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <Badge className={
                        tip.impact === 'High' 
                          ? 'bg-green-100 text-green-700' 
                          : tip.impact === 'Medium'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                      }>
                        {tip.impact} Impact
                      </Badge>
                      <Badge variant="outline">
                        {tip.timeframe}
                      </Badge>
                    </div>
                    
                    <p className="text-sm">{tip.tip}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            
            <div>
              <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Industry Insights
              </h4>
              
              <div className="space-y-3">
                {quickTips.industryInsights.map((insight: string, index: number) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    custom={index * 0.1}
                    className="bg-amber-50 border border-amber-100 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 text-amber-700 rounded-full h-6 w-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p>{insight}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
  
  /**
   * Render the Growth Trajectory section
   */
  const renderGrowthTrajectory = () => (
    <motion.div 
      className="space-y-6"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      {debugMode && (
        <div className="bg-muted p-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleDebugSection('growthTrajectory')}
          >
            Toggle Debug
          </Button>
          {debugStates.growthTrajectory && (
            <pre className="mt-2 overflow-auto">
              {JSON.stringify(growthTrajectory, null, 2)}
            </pre>
          )}
        </div>
      )}
      
      <Card className="border-l-4 border-l-blue-500 overflow-hidden">
        <CardHeader className="pb-2 pt-4">
          {renderSectionTitle(
            "Growth Trajectory", 
            "A long-term vision of your career trajectory, including potential roles, responsibilities, and salary expectations.",
            <TrendingUp className="h-5 w-5 text-blue-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p>{growthTrajectory.introduction}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Short Term (1-2 years)", data: growthTrajectory.shortTerm, color: "green" },
                { label: "Medium Term (3-5 years)", data: growthTrajectory.mediumTerm, color: "blue" },
                { label: "Long Term (5+ years)", data: growthTrajectory.longTerm, color: "indigo" }
              ].map((stage, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  custom={index * 0.2}
                  className={`bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden border-t-4 border-t-${stage.color}-500`}
                >
                  <div className={`p-3 bg-${stage.color}-50 border-b border-${stage.color}-100`}>
                    <h4 className="font-semibold">{stage.label}</h4>
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-3">
                      <h5 className="text-xs font-medium text-muted-foreground">POTENTIAL ROLE</h5>
                      <p className="font-medium text-lg">{stage.data.role}</p>
                    </div>
                    
                    <div className="mb-3">
                      <h5 className="text-xs font-medium text-muted-foreground">TIMELINE</h5>
                      <p>{stage.data.timeline}</p>
                    </div>
                    
                    {stage.data.salary && (
                      <div className="mb-3">
                        <h5 className="text-xs font-medium text-muted-foreground">SALARY RANGE</h5>
                        <p className="font-medium">
                          {stage.data.salary.currency}{stage.data.salary.min.toLocaleString()} - 
                          {stage.data.salary.currency}{stage.data.salary.max.toLocaleString()}
                        </p>
                      </div>
                    )}
                    
                    <div className="mb-3">
                      <h5 className="text-xs font-medium text-muted-foreground">KEY RESPONSIBILITIES</h5>
                      <ul className="mt-1 space-y-1">
                        {stage.data.responsibilities.map((resp: string, idx: number) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <ChevronRight className={`h-4 w-4 text-${stage.color}-500 flex-shrink-0 mt-0.5`} />
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground">REQUIRED SKILLS</h5>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {stage.data.skillsRequired.map((skill: string, idx: number) => (
                          <Badge key={idx} variant="outline" className={`bg-${stage.color}-50 text-${stage.color}-700 border-${stage.color}-200`}>
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
  
  /**
   * Render the Learning Path Roadmap section
   */
  const renderLearningPathRoadmap = () => (
    <motion.div 
      className="space-y-6"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      {debugMode && (
        <div className="bg-muted p-2 text-xs">
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleDebugSection('learningPathRoadmap')}
          >
            Toggle Debug
          </Button>
          {debugStates.learningPathRoadmap && (
            <pre className="mt-2 overflow-auto">
              {JSON.stringify(learningPathRoadmap, null, 2)}
            </pre>
          )}
        </div>
      )}
      
      <Card className="border-l-4 border-l-pink-500 overflow-hidden">
        <CardHeader className="pb-2 pt-4">
          {renderSectionTitle(
            "Learning Path Roadmap", 
            "A visual representation of your career trajectory with key milestones and skills to acquire at each stage.",
            <Zap className="h-5 w-5 text-pink-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
              <p>{learningPathRoadmap.overview}</p>
            </div>
            
            <div className="relative space-y-6 after:content-[''] after:absolute after:top-0 after:left-6 after:h-full after:w-0.5 after:bg-gradient-to-b after:from-pink-500 after:to-indigo-500 after:z-0">
              {learningPathRoadmap.careerTrajectory.map((item: any, index: number) => (
                <motion.div
                  key={index}
                  variants={fadeInLeft}
                  custom={index * 0.2}
                  className="relative z-10 flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {index + 1}
                  </div>
                  
                  <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 flex-1">
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                      <h4 className="font-semibold text-lg">{item.stage}</h4>
                      <Badge className="bg-pink-100 text-pink-700">
                        {item.timeframe}
                      </Badge>
                    </div>
                    
                    <div className="mb-3">
                      <h5 className="text-xs font-medium text-muted-foreground">TARGET ROLE</h5>
                      <p className="font-medium">{item.role}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs font-medium text-muted-foreground mb-2">FOCUS SKILLS</h5>
                        <div className="flex flex-wrap gap-2">
                          {item.skills.map((skill: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="bg-gradient-to-r from-pink-50 to-indigo-50 border-pink-200">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-xs font-medium text-muted-foreground mb-2">KEY MILESTONES</h5>
                        <ul className="space-y-1">
                          {item.milestones.map((milestone: string, idx: number) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <div className="rounded-full bg-gradient-to-r from-pink-100 to-indigo-100 h-5 w-5 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-medium text-pink-700">
                                {idx + 1}
                              </div>
                              {milestone}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
  
  /**
   * Render section selector buttons
   */
  const renderSectionSelectors = () => (
    <div className="flex flex-col space-y-2">
      <Button
        variant={activeSection === 'executiveSummary' ? 'default' : 'outline'}
        className="justify-start"
        onClick={() => setActiveSection('executiveSummary')}
      >
        <Trophy className="mr-2 h-4 w-4" />
        Executive Summary
        {completedSections.executiveSummary && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
      </Button>
      <Button
        variant={activeSection === 'skillMapping' ? 'default' : 'outline'}
        className="justify-start"
        onClick={() => setActiveSection('skillMapping')}
      >
        <BarChart className="mr-2 h-4 w-4" />
        Skill Mapping
        {completedSections.skillMapping && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
      </Button>
      <Button
        variant={activeSection === 'skillGapAnalysis' ? 'default' : 'outline'}
        className="justify-start"
        onClick={() => setActiveSection('skillGapAnalysis')}
      >
        <LineChart className="mr-2 h-4 w-4" />
        Skill Gap Analysis
        {completedSections.skillGapAnalysis && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
      </Button>
      <Button
        variant={activeSection === 'careerPathwayOptions' ? 'default' : 'outline'}
        className="justify-start"
        onClick={() => setActiveSection('careerPathwayOptions')}
      >
        <Rocket className="mr-2 h-4 w-4" />
        Career Pathway Options
        {completedSections.careerPathwayOptions && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
      </Button>
      <Button
        variant={activeSection === 'developmentPlan' ? 'default' : 'outline'}
        className="justify-start"
        onClick={() => setActiveSection('developmentPlan')}
      >
        <ListChecks className="mr-2 h-4 w-4" />
        Development Plan
        {completedSections.developmentPlan && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
      </Button>
      <Button
        variant={activeSection === 'educationalPrograms' ? 'default' : 'outline'}
        className="justify-start"
        onClick={() => setActiveSection('educationalPrograms')}
      >
        <School className="mr-2 h-4 w-4" />
        Educational Programs
        {completedSections.educationalPrograms && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
      </Button>
      <Button
        variant={activeSection === 'learningRoadmap' ? 'default' : 'outline'}
        className="justify-start"
        onClick={() => setActiveSection('learningRoadmap')}
      >
        <BookOpen className="mr-2 h-4 w-4" />
        Learning Roadmap
        {completedSections.learningRoadmap && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
      </Button>
      <Button
        variant={activeSection === 'similarRoles' ? 'default' : 'outline'}
        className="justify-start"
        onClick={() => setActiveSection('similarRoles')}
      >
        <User className="mr-2 h-4 w-4" />
        Similar Roles
        {completedSections.similarRoles && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
      </Button>
      <Button
        variant={activeSection === 'quickTips' ? 'default' : 'outline'}
        className="justify-start"
        onClick={() => setActiveSection('quickTips')}
      >
        <Lightbulb className="mr-2 h-4 w-4" />
        Quick Tips
        {completedSections.quickTips && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
      </Button>
      <Button
        variant={activeSection === 'growthTrajectory' ? 'default' : 'outline'}
        className="justify-start"
        onClick={() => setActiveSection('growthTrajectory')}
      >
        <TrendingUp className="mr-2 h-4 w-4" />
        Growth Trajectory
        {completedSections.growthTrajectory && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
      </Button>
      <Button
        variant={activeSection === 'learningPathRoadmap' ? 'default' : 'outline'}
        className="justify-start"
        onClick={() => setActiveSection('learningPathRoadmap')}
      >
        <Zap className="mr-2 h-4 w-4" />
        Learning Path Roadmap
        {completedSections.learningPathRoadmap && <CheckCircle className="ml-2 h-4 w-4 text-green-500" />}
      </Button>
    </div>
  );
  
  /**
   * Determine which section to render based on active selection
   */
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'executiveSummary':
        return renderExecutiveSummary();
      case 'skillMapping':
        return renderSkillMapping();
      case 'skillGapAnalysis':
        return renderSkillGapAnalysis();
      case 'careerPathwayOptions':
        return renderCareerPathwayOptions();
      case 'developmentPlan':
        return renderDevelopmentPlan();
      case 'educationalPrograms':
        return renderEducationalPrograms();
      case 'learningRoadmap':
        return renderLearningRoadmap();
      case 'similarRoles':
        return renderSimilarRoles();
      case 'quickTips':
        return renderQuickTips();
      case 'growthTrajectory':
        return renderGrowthTrajectory();
      case 'learningPathRoadmap':
        return renderLearningPathRoadmap();
      default:
        return renderExecutiveSummary();
    }
  };
  
  return (
    <div className="bg-slate-50 min-h-screen pt-4 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRestart}
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            New Analysis
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDebugMode}
              className={debugMode ? 'border-red-500 text-red-500 hover:bg-red-50' : ''}
            >
              {debugMode ? 'Debug Mode: ON' : 'Debug Mode: OFF'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={saveAnalysis}
              disabled={!user || savedToAccount || isSaving}
              className="gap-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : savedToAccount ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Saved
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4" />
                  Save to Account
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadReport}
              disabled={isDownloading}
              className="gap-1"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4" />
                  Download Report
                </>
              )}
            </Button>
          </div>
        </div>
        
        <motion.div 
          className="bg-white rounded-xl overflow-hidden shadow-lg border"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">{executiveSummary.careerGoal}</h1>
                  <p className="text-white/80 mt-2">Career Pathway Analysis</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-3xl font-bold">{executiveSummary.fitScore.score}/{executiveSummary.fitScore.outOf}</div>
                    <div className="text-sm text-white/80">Fit Score</div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
                    <div className="text-3xl font-bold">
                      {Object.values(completedSections).filter(Boolean).length}/11
                    </div>
                    <div className="text-sm text-white/80">Sections Complete</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-lg">{executiveSummary.summary}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
            <div className="bg-white p-4 border-r border-b lg:border-b-0">
              <h3 className="text-xl font-bold mb-4">Report Sections</h3>
              {renderSectionSelectors()}
            </div>
            
            <div className="lg:col-span-3 p-4 lg:p-6" id="report-content">
              {renderActiveSection()}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

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