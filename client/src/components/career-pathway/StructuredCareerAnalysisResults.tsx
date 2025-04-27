/**
 * Structured Career Analysis Results Component
 * 
 * Displays the results of a structured career analysis report, ensuring
 * all 11 sections are properly ordered and rendered with a futuristic design.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { CareerAnalysisReport } from '../../../shared/reportSchema';
import { SkillRadarChart } from './SkillRadarChart';
import { ComparativeBarChart } from './ComparativeBarChart';
import { CareerPathwayStepsDisplay } from './CareerPathwayStepsDisplay';
import { fadeIn, fadeInUp, fadeInLeft, fadeInRight } from '@/lib/animations';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import {
  LineChart,
  BarChart3,
  Target,
  ArrowRight,
  Asterisk,
  BarChart,
  BookOpen,
  Brain,
  Check,
  CheckCircle,
  Clock,
  Download,
  FileText,
  GraduationCap,
  Info,
  Laptop,
  LineChartIcon,
  ListChecks,
  Loader2,
  MapPin,
  School,
  Sparkles,
  Star,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  Save
} from 'lucide-react';

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

const defaultDebugStates: DebugStates = {
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
  learningPathRoadmap: false
};

/**
 * Component that displays a structured career analysis report with support for debugging
 */
export function StructuredCareerAnalysisResults({ 
  results, 
  formData,
  onRestart
}: StructuredCareerAnalysisResultsProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Extract result sections for easier referencing
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
    learningPathRoadmap
  } = results;
  
  // UI state
  const [activeSection, setActiveSection] = useState<string>('executiveSummary');
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);
  const [downloadInProgress, setDownloadInProgress] = useState<boolean>(false);
  const [debugMode, setDebugMode] = useState<boolean>(false);
  const [debugStates, setDebugStates] = useState<DebugStates>(defaultDebugStates);
  
  // Save report to localStorage to persist across page refreshes
  useEffect(() => {
    const savedReports = localStorage.getItem('careerAnalysisReports');
    const reports = savedReports ? JSON.parse(savedReports) : [];
    
    // Only save if the report doesn't already exist (based on timestamp)
    const exists = reports.some((r: CareerAnalysisReport) => r.timestamp === results.timestamp);
    
    if (!exists) {
      reports.push(results);
      localStorage.setItem('careerAnalysisReports', JSON.stringify(reports));
      console.log(`Saved ${reports.length} resources to localStorage`);
    } else {
      console.log(`Loaded ${reports.length} resources from localStorage`);
    }
  }, [results]);
  
  /**
   * Save career analysis to user's account
   */
  const handleSaveToAccount = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to save your career analysis.",
        variant: "destructive"
      });
      return;
    }
    
    setSaveInProgress(true);
    
    try {
      const response = await fetch('/api/career-analysis/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          formData,
          report: results
        })
      });
      
      if (response.ok) {
        toast({
          title: "Career Analysis Saved",
          description: "Your analysis has been saved to your account.",
          variant: "default"
        });
      } else {
        throw new Error('Failed to save career analysis');
      }
    } catch (error) {
      console.error('Error saving career analysis:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your career analysis.",
        variant: "destructive"
      });
    } finally {
      setSaveInProgress(false);
    }
  };
  
  /**
   * Handle downloading the report as HTML
   */
  const handleDownloadReport = async () => {
    setDownloadInProgress(true);
    
    try {
      // Create a container to hold the report content
      const reportContainer = document.getElementById('report-container');
      
      if (!reportContainer) {
        throw new Error('Report container not found');
      }
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title
      pdf.setFontSize(24);
      pdf.setTextColor(28, 59, 130);
      pdf.text('Skillgenix Career Analysis Report', 20, 20);
      
      // Add date
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on ${format(new Date(), 'MMMM d, yyyy')}`, 20, 28);
      
      // Add target role
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Career Path: ${formData?.desiredRole || skillGapAnalysis.targetRole}`, 20, 36);
      
      // Add applicant info
      pdf.setFontSize(12);
      pdf.text(`Professional Level: ${formData?.professionalLevel || 'Not specified'}`, 20, 48);
      pdf.text(`Location: ${formData?.state || 'Not specified'}, ${formData?.country || 'Not specified'}`, 20, 54);
      
      // Add content for each section
      let yPosition = 70;
      
      // Executive summary
      pdf.setFontSize(16);
      pdf.setTextColor(28, 59, 130);
      pdf.text('Executive Summary', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      const splitSummary = pdf.splitTextToSize(executiveSummary.summary, 170);
      pdf.text(splitSummary, 20, yPosition);
      yPosition += splitSummary.length * 6 + 10;
      
      // Skill Gap Analysis
      pdf.setFontSize(16);
      pdf.setTextColor(28, 59, 130);
      pdf.text('Skill Gap Analysis', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      const splitAnalysis = pdf.splitTextToSize(skillGapAnalysis.aiAnalysis, 170);
      pdf.text(splitAnalysis, 20, yPosition);
      yPosition += splitAnalysis.length * 6 + 10;
      
      // Check if we need a new page
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Career pathway
      pdf.setFontSize(16);
      pdf.setTextColor(28, 59, 130);
      pdf.text('Career Pathway Options', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      const splitPathway = pdf.splitTextToSize(careerPathwayOptions.pathwayDescription, 170);
      pdf.text(splitPathway, 20, yPosition);
      yPosition += splitPathway.length * 6 + 10;
      
      // Include each pathway step
      careerPathwayOptions.pathwaySteps.forEach((step, index) => {
        // Check if we need a new page
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(12);
        pdf.text(`Step ${index + 1}: ${step.step} (${step.timeframe})`, 20, yPosition);
        yPosition += 6;
        
        pdf.setFontSize(10);
        const splitDescription = pdf.splitTextToSize(step.description, 170);
        pdf.text(splitDescription, 20, yPosition);
        yPosition += splitDescription.length * 5 + 5;
      });
      
      // Add footer with branding
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Generated by Skillgenix - The Career Pathway Platform', pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
      
      // Save the PDF
      pdf.save(`Skillgenix_Career_Analysis_${formData?.desiredRole || 'Report'}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      
      toast({
        title: "Report Downloaded",
        description: "Your career analysis report has been downloaded successfully.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "There was an error generating your report PDF.",
        variant: "destructive"
      });
    } finally {
      setDownloadInProgress(false);
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
  const toggleDebugSection = (section: string) => {
    setDebugStates(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  /**
   * Render a section title with an info tooltip
   */
  const renderSectionTitle = (title: string, description: string, icon: React.ReactNode) => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {icon}
        <CardTitle className="text-xl md:text-2xl">{title}</CardTitle>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Info className="h-5 w-5" />
              <span className="sr-only">Section Info</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
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
            "A concise overview of your career analysis results, highlighting key insights and recommendations.",
            <FileText className="h-5 w-5 text-primary" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-primary/5 rounded-lg p-4">
              <p className="text-lg">{executiveSummary.summary}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div 
                variants={fadeInLeft}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Career Goal</h4>
                <div className="text-xl font-semibold text-primary flex items-center gap-1.5">
                  <Target className="h-5 w-5" />
                  {executiveSummary.careerGoal}
                </div>
              </motion.div>
              
              <motion.div 
                variants={fadeIn}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Fit Score</h4>
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-16">
                    <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                      <path
                        className="stroke-gray-200"
                        fill="none"
                        strokeWidth="3.8"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="stroke-primary"
                        fill="none"
                        strokeWidth="3.8"
                        strokeDasharray={`${(executiveSummary.fitScore.score / executiveSummary.fitScore.outOf) * 100}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                      <div className="text-xl font-bold">{executiveSummary.fitScore.score}/{executiveSummary.fitScore.outOf}</div>
                    </div>
                  </div>
                  <div className="text-sm">{executiveSummary.fitScore.description}</div>
                </div>
              </motion.div>
              
              <motion.div 
                variants={fadeInRight}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
              >
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Key Findings</h4>
                <ul className="space-y-1.5">
                  {executiveSummary.keyFindings.map((finding, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
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
            "A comprehensive mapping of your current skills against industry frameworks like SFIA and DigComp.",
            <BarChart3 className="h-5 w-5 text-blue-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="bg-blue-50 rounded-lg p-4 border border-blue-100 text-blue-800">
              {skillMapping.skillsAnalysis}
            </p>
            
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
                        <p>The SFIA framework defines technical, digital, and professional skills in a standardized structure.</p>
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
                        <Badge variant="secondary" className="bg-primary/10 text-primary">{skill.proficiency}/7</Badge>
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
                      className="bg-green-50 border border-green-100 rounded-lg p-3 relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bottom-0 w-1 bg-green-500"></div>
                      
                      <div className="flex justify-between items-center">
                        <div className="font-medium">{strength.skill}</div>
                        <Badge variant="outline" className="bg-green-100 text-green-700">
                          +{strength.advantage} Advantage
                        </Badge>
                      </div>
                      
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(strength.currentLevel / 7) * 100}%` }}></div>
                      </div>
                      
                      <div className="mt-1 text-xs flex justify-between">
                        <span>Current: {strength.currentLevel}/7</span>
                        <span>Required: {strength.requiredLevel}/7</span>
                        <span>Advantage: +{strength.advantage}</span>
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
            "Structured career development pathways including both academic and vocational routes to achieve your career goals.",
            <ArrowRight className="h-5 w-5 text-indigo-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
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
                    variants={fadeInRight}
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
                    variants={fadeInUp}
                    custom={index * 0.1}
                    className="bg-white border border-gray-200 shadow-sm rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-lg">{skill.skill}</div>
                      <Badge className="bg-purple-100 text-purple-700">
                        {skill.timeframe}
                      </Badge>
                    </div>
                    
                    <div className="mt-2 bg-purple-50 p-3 rounded-lg">
                      <h5 className="text-sm font-medium mb-1">Why you should acquire this skill:</h5>
                      <p className="text-sm">{skill.reason}</p>
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
      
      <Card className="border-l-4 border-l-blue-500 overflow-hidden">
        <CardHeader className="pb-2 pt-4">
          {renderSectionTitle(
            "Educational Programs", 
            "Recommended educational programs, courses, and certifications tailored to your career goals and current skill level.",
            <GraduationCap className="h-5 w-5 text-blue-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <p>{educationalPrograms.introduction}</p>
            </div>
            
            <motion.div 
              variants={fadeInUp}
              className="space-y-4"
            >
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <School className="h-4 w-4 text-blue-600" />
                Recommended Programs
              </h4>
              
              <div className="space-y-3">
                {educationalPrograms.recommendedPrograms.map((program: any, index: number) => (
                  <motion.div
                    key={index}
                    variants={fadeInLeft}
                    custom={index * 0.1}
                    className="bg-white border border-gray-200 shadow-sm rounded-lg p-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div>
                        <h5 className="font-medium text-lg">{program.name}</h5>
                        <div className="text-sm text-muted-foreground">by {program.provider}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-600">
                          {program.duration}
                        </Badge>
                        <Badge variant="outline" className="bg-slate-50 text-slate-600">
                          {program.format}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h6 className="text-sm font-medium mb-1">Skills Covered:</h6>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {program.skillsCovered.map((skill: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="bg-blue-50 text-blue-600">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm">{program.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp}
              className="space-y-4"
            >
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Laptop className="h-4 w-4 text-green-600" />
                Project Ideas
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {educationalPrograms.projectIdeas.map((project: any, index: number) => (
                  <motion.div
                    key={index}
                    variants={fadeInRight}
                    custom={index * 0.1}
                    className="bg-white border border-gray-200 shadow-sm rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <h5 className="font-medium text-lg">{project.title}</h5>
                      <Badge variant={
                        project.difficulty === 'Advanced' 
                          ? 'destructive' 
                          : project.difficulty === 'Intermediate' 
                            ? 'default' 
                            : 'outline'
                      }>
                        {project.difficulty}
                      </Badge>
                    </div>
                    
                    <p className="text-sm mt-2">{project.description}</p>
                    
                    <div className="mt-4 flex flex-col gap-2">
                      <div className="text-sm font-medium">Skills Developed:</div>
                      <div className="flex flex-wrap gap-2">
                        {project.skillsDeveloped.map((skill: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-green-50 text-green-600">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <Clock className="inline-block h-3 w-3 mr-1" />
                        Estimated time: {project.timeEstimate}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
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
      
      <Card className="border-l-4 border-l-purple-500 overflow-hidden">
        <CardHeader className="pb-2 pt-4">
          {renderSectionTitle(
            "Learning Roadmap", 
            "A phased approach to building your skills over time, with specific milestones and resources for each phase.",
            <MapPin className="h-5 w-5 text-purple-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <p>{learningRoadmap.overview}</p>
            </div>
            
            <div className="space-y-8">
              {learningRoadmap.phases.map((phase: any, index: number) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  custom={index * 0.15}
                  className="relative"
                >
                  {index < learningRoadmap.phases.length - 1 && (
                    <div className="absolute top-12 bottom-0 left-6 border-l-2 border-dashed border-purple-300 z-0"></div>
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-purple-500 h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold">{phase.phase}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {phase.timeframe}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pl-16 space-y-4">
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <h5 className="font-medium mb-2">Focus Area</h5>
                        <p className="text-sm">{phase.focus}</p>
                        
                        <h5 className="font-medium mt-4 mb-2">Key Milestones</h5>
                        <ul className="space-y-1.5">
                          {phase.milestones.map((milestone: string, idx: number) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-purple-500 flex-shrink-0 mt-0.5" />
                              <span>{milestone}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <h5 className="font-medium mt-4 mb-2">Recommended Resources</h5>
                        <ul className="space-y-2">
                          {phase.resources.map((resource: any, idx: number) => (
                            <li key={idx} className="text-sm p-2 bg-purple-50 rounded-lg">
                              <div className="flex items-start gap-2">
                                <Badge variant="outline" className="bg-purple-100 text-purple-600 flex-shrink-0 mt-0.5">
                                  {resource.type}
                                </Badge>
                                <span className="font-medium">{resource.name}</span>
                              </div>
                              {resource.link && (
                                <div className="mt-1 text-xs text-blue-600 pl-[3.25rem]">
                                  {resource.link}
                                </div>
                              )}
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
      
      <Card className="border-l-4 border-l-amber-500 overflow-hidden">
        <CardHeader className="pb-2 pt-4">
          {renderSectionTitle(
            "Similar Roles", 
            "Alternative career paths that leverage your existing skills and experience, providing more options for your career development.",
            <Asterisk className="h-5 w-5 text-amber-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
              <p>{similarRoles.introduction}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {similarRoles.roles.map((role: any, index: number) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  custom={index * 0.1}
                  className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2"></div>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold text-lg">{role.role}</h4>
                      <div className="flex items-center gap-1">
                        <div className="text-sm font-medium">{Math.round(role.similarityScore * 100)}%</div>
                        <div className="text-xs text-muted-foreground">match</div>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Progress 
                        value={role.similarityScore * 100} 
                        className="h-1.5 bg-amber-100"
                      />
                    </div>
                    
                    <div className="mt-4 space-y-3">
                      <div>
                        <h5 className="text-sm font-medium mb-1 flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          Skill Overlap
                        </h5>
                        <div className="flex flex-wrap gap-1.5">
                          {role.keySkillOverlap.map((skill: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="bg-green-50 text-green-600 text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-1 flex items-center gap-1">
                          <Plus className="h-3.5 w-3.5 text-amber-500" />
                          Additional Skills Needed
                        </h5>
                        <div className="flex flex-wrap gap-1.5">
                          {role.additionalSkillsNeeded.map((skill: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="bg-amber-50 text-amber-600 text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 text-sm">
                      <p>{role.summary}</p>
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
      
      <Card className="border-l-4 border-l-yellow-500 overflow-hidden">
        <CardHeader className="pb-2 pt-4">
          {renderSectionTitle(
            "Quick Tips", 
            "Actionable tips and insights to help you make immediate progress toward your career goals.",
            <Lightbulb className="h-5 w-5 text-yellow-500 fill-yellow-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
              <p>{quickTips.introduction}</p>
            </div>
            
            <motion.div 
              variants={fadeInUp}
              className="space-y-4"
            >
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Quick Wins
              </h4>
              
              <div className="space-y-3">
                {quickTips.quickWins.map((tip: any, index: number) => (
                  <motion.div
                    key={index}
                    variants={fadeInLeft}
                    custom={index * 0.1}
                    className="bg-white border border-gray-200 shadow-sm rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{tip.tip}</div>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          tip.impact === 'High' 
                            ? 'default' 
                            : tip.impact === 'Medium' 
                              ? 'secondary'
                              : 'outline'
                        } className={
                          tip.impact === 'High'
                            ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
                            : ''
                        }>
                          {tip.impact} Impact
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {tip.timeframe}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              variants={fadeInUp}
              className="space-y-4"
            >
              <h4 className="text-lg font-semibold flex items-center gap-2">
                <LineChartIcon className="h-4 w-4 text-yellow-600" />
                Industry Insights
              </h4>
              
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-100">
                <ul className="space-y-3">
                  {quickTips.industryInsights.map((insight: string, index: number) => (
                    <motion.li
                      key={index}
                      variants={fadeInRight}
                      custom={index * 0.1}
                      className="flex items-start gap-3"
                    >
                      <div className="bg-yellow-200 text-yellow-800 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p>{insight}</p>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
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
      
      <Card className="border-l-4 border-l-teal-500 overflow-hidden">
        <CardHeader className="pb-2 pt-4">
          {renderSectionTitle(
            "Growth Trajectory", 
            "A long-term view of your potential career progression, showing how your career might evolve over time.",
            <TrendingUp className="h-5 w-5 text-teal-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-teal-50 rounded-lg p-4 border border-teal-100">
              <p>{growthTrajectory.introduction}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                variants={fadeInLeft}
                className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-500 to-blue-400 p-3 text-white">
                  <h4 className="font-semibold">Short Term</h4>
                  <div className="text-sm text-blue-100">{growthTrajectory.shortTerm.timeline}</div>
                </div>
                
                <div className="p-4 space-y-4">
                  <div>
                    <div className="text-2xl font-bold">{growthTrajectory.shortTerm.role}</div>
                    <div className="text-lg font-medium text-muted-foreground mt-1">
                      {growthTrajectory.shortTerm.salary.currency}{growthTrajectory.shortTerm.salary.min.toLocaleString()} - {growthTrajectory.shortTerm.salary.currency}{growthTrajectory.shortTerm.salary.max.toLocaleString()}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-2">Responsibilities:</h5>
                    <ul className="space-y-1">
                      {growthTrajectory.shortTerm.responsibilities.map((responsibility: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <Check className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <span>{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-2">Key Skills:</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {growthTrajectory.shortTerm.skillsRequired.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-600 text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                variants={fadeInUp}
                className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-teal-500 to-teal-400 p-3 text-white">
                  <h4 className="font-semibold">Medium Term</h4>
                  <div className="text-sm text-teal-100">{growthTrajectory.mediumTerm.timeline}</div>
                </div>
                
                <div className="p-4 space-y-4">
                  <div>
                    <div className="text-2xl font-bold">{growthTrajectory.mediumTerm.role}</div>
                    <div className="text-lg font-medium text-muted-foreground mt-1">
                      {growthTrajectory.mediumTerm.salary.currency}{growthTrajectory.mediumTerm.salary.min.toLocaleString()} - {growthTrajectory.mediumTerm.salary.currency}{growthTrajectory.mediumTerm.salary.max.toLocaleString()}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-2">Responsibilities:</h5>
                    <ul className="space-y-1">
                      {growthTrajectory.mediumTerm.responsibilities.map((responsibility: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <Check className="h-4 w-4 text-teal-500 flex-shrink-0 mt-0.5" />
                          <span>{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-2">Key Skills:</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {growthTrajectory.mediumTerm.skillsRequired.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-teal-50 text-teal-600 text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                variants={fadeInRight}
                className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-400 p-3 text-white">
                  <h4 className="font-semibold">Long Term</h4>
                  <div className="text-sm text-indigo-100">{growthTrajectory.longTerm.timeline}</div>
                </div>
                
                <div className="p-4 space-y-4">
                  <div>
                    <div className="text-2xl font-bold">{growthTrajectory.longTerm.role}</div>
                    <div className="text-lg font-medium text-muted-foreground mt-1">
                      {growthTrajectory.longTerm.salary.currency}{growthTrajectory.longTerm.salary.min.toLocaleString()} - {growthTrajectory.longTerm.salary.currency}{growthTrajectory.longTerm.salary.max.toLocaleString()}
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-2">Responsibilities:</h5>
                    <ul className="space-y-1">
                      {growthTrajectory.longTerm.responsibilities.map((responsibility: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <Check className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                          <span>{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-2">Key Skills:</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {growthTrajectory.longTerm.skillsRequired.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-indigo-50 text-indigo-600 text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
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
            "A visual roadmap of your career progression, showing key stages, roles, and skills to acquire along the way.",
            <Star className="h-5 w-5 text-pink-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
              <p>{learningPathRoadmap.overview}</p>
            </div>
            
            <ScrollArea className="h-[450px] pr-4 -mr-4">
              <div className="pb-4">
                {learningPathRoadmap.careerTrajectory.map((stage: any, index: number) => (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    custom={index * 0.15}
                    className="relative mb-12 last:mb-0"
                  >
                    {index < learningPathRoadmap.careerTrajectory.length - 1 && (
                      <div className="absolute top-16 bottom-[-1rem] left-[5.5rem] border-l-2 border-dashed border-pink-300 z-0"></div>
                    )}
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-gradient-to-br from-pink-500 to-purple-500 h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 relative z-10">
                        {index + 1}
                      </div>
                      
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 pb-6 w-full relative">
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-3 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-pink-100 border-r-[10px] border-r-transparent"></div>
                        
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-semibold">{stage.stage}</h4>
                            <div className="text-sm text-muted-foreground">{stage.timeframe}</div>
                          </div>
                          <Badge className="bg-pink-100 text-pink-700">{stage.role}</Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-medium mb-2">Key Skills:</h5>
                            <div className="flex flex-wrap gap-1.5">
                              {stage.skills.map((skill: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="bg-pink-50 text-pink-600 text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h5 className="text-sm font-medium mb-2">Key Milestones:</h5>
                            <ul className="space-y-1">
                              {stage.milestones.map((milestone: string, idx: number) => (
                                <li key={idx} className="text-sm flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-pink-500 flex-shrink-0 mt-0.5" />
                                  <span>{milestone}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
  
  /**
   * Render section selector buttons
   */
  const renderSectionSelector = () => (
    <div className="mb-6 overflow-auto pb-2">
      <div className="inline-flex gap-2 items-center w-auto">
        <Button
          variant={activeSection === 'executiveSummary' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('executiveSummary')}
          className="whitespace-nowrap"
        >
          <FileText className="mr-1 h-4 w-4" />
          Executive Summary
        </Button>
        
        <Button
          variant={activeSection === 'skillMapping' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('skillMapping')}
          className="whitespace-nowrap"
        >
          <BarChart3 className="mr-1 h-4 w-4" />
          Skill Mapping
        </Button>
        
        <Button
          variant={activeSection === 'skillGapAnalysis' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('skillGapAnalysis')}
          className="whitespace-nowrap"
        >
          <LineChart className="mr-1 h-4 w-4" />
          Skill Gap Analysis
        </Button>
        
        <Button
          variant={activeSection === 'careerPathwayOptions' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('careerPathwayOptions')}
          className="whitespace-nowrap"
        >
          <ArrowRight className="mr-1 h-4 w-4" />
          Pathway Options
        </Button>
        
        <Button
          variant={activeSection === 'developmentPlan' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('developmentPlan')}
          className="whitespace-nowrap"
        >
          <ListChecks className="mr-1 h-4 w-4" />
          Development Plan
        </Button>
        
        <Button
          variant={activeSection === 'educationalPrograms' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('educationalPrograms')}
          className="whitespace-nowrap"
        >
          <GraduationCap className="mr-1 h-4 w-4" />
          Educational Programs
        </Button>
        
        <Button
          variant={activeSection === 'learningRoadmap' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('learningRoadmap')}
          className="whitespace-nowrap"
        >
          <MapPin className="mr-1 h-4 w-4" />
          Learning Roadmap
        </Button>
        
        <Button
          variant={activeSection === 'similarRoles' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('similarRoles')}
          className="whitespace-nowrap"
        >
          <Asterisk className="mr-1 h-4 w-4" />
          Similar Roles
        </Button>
        
        <Button
          variant={activeSection === 'quickTips' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('quickTips')}
          className="whitespace-nowrap"
        >
          <Lightbulb className="mr-1 h-4 w-4" />
          Quick Tips
        </Button>
        
        <Button
          variant={activeSection === 'growthTrajectory' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('growthTrajectory')}
          className="whitespace-nowrap"
        >
          <TrendingUp className="mr-1 h-4 w-4" />
          Growth Trajectory
        </Button>
        
        <Button
          variant={activeSection === 'learningPathRoadmap' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveSection('learningPathRoadmap')}
          className="whitespace-nowrap"
        >
          <Star className="mr-1 h-4 w-4" />
          Learning Path Roadmap
        </Button>
      </div>
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
    <div id="report-container" className="py-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold">Structured Career Analysis</h2>
          <p className="text-muted-foreground">
            Generated for {formData?.desiredRole || skillGapAnalysis.targetRole} career path on {format(new Date(results.timestamp), 'MMMM d, yyyy')}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onRestart}
            className="flex items-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Start New Analysis
          </Button>
          
          <Button
            variant="outline"
            onClick={handleSaveToAccount}
            disabled={saveInProgress}
            className="flex items-center gap-1.5"
          >
            {saveInProgress ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save to Account
              </>
            )}
          </Button>
          
          <Button
            variant="default"
            onClick={handleDownloadReport}
            disabled={downloadInProgress}
            className="flex items-center gap-1.5"
          >
            {downloadInProgress ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download Report
              </>
            )}
          </Button>
          
          {process.env.NODE_ENV === 'development' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDebugMode}
              className="ml-2"
              title="Toggle Debug Mode"
            >
              <Bug className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {renderSectionSelector()}
      {renderActiveSection()}
    </div>
  );
}

// For development only
function Plus({ className }: { className?: string }) {
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
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ArrowLeft({ className }: { className?: string }) {
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
      <path d="m12 19-7-7 7-7M5 12h14" />
    </svg>
  );
}

function Bug({ className }: { className?: string }) {
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
      <path d="m8 2 1.88 1.88M14.12 3.88 16 2M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
      <path d="M12 20v-9M8.5 10l-5 3M15.5 10l5 3M9 16a9 9 0 0 1 6 0M9 12a9 9 0 0 0 6 0" />
    </svg>
  );
}