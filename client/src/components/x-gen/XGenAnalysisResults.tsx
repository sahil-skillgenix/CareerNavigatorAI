/**
 * X-Gen Analysis Results Component
 * 
 * Displays the results of the X-Gen AI career analysis in a structured format
 * with interactive sections for each part of the career analysis report.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { CareerAnalysisReport } from '../../../shared/reportSchema';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fadeIn, fadeInUp, staggerChildren } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  CheckCircle,
  Download,
  ExternalLink,
  FileText,
  Save,
  Share2
} from 'lucide-react';

// Interface for form data
interface RequestData {
  professionalLevel: string;
  currentSkills: string;
  educationalBackground: string;
  careerHistory: string;
  desiredRole: string;
  state: string;
  country: string;
}

interface XGenAnalysisResultsProps {
  report: CareerAnalysisReport;
  requestData: RequestData;
}

export function XGenAnalysisResults({ 
  report, 
  requestData 
}: XGenAnalysisResultsProps) {
  // Validate report to prevent errors
  if (!report || typeof report !== 'object') {
    return (
      <div className="p-8 text-center">
        <div className="text-red-600 mb-4">Error: Invalid report data</div>
        <Button onClick={() => window.location.reload()}>
          Reload Page
        </Button>
      </div>
    );
  }

  const [activeSection, setActiveSection] = useState('executive-summary');
  
  // Function to get color class based on proficiency level
  const getProficiencyColorClass = (level: number, max: number = 5) => {
    const percentage = (level / max) * 100;
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };
  
  // Function to render skill proficiency badges with consistent styling
  const renderSkillProficiency = (skill: any) => {
    const maxLevel = 5; // Assuming max proficiency is 5
    return (
      <div className="flex flex-col gap-1 mb-4" key={skill.skill}>
        <div className="flex justify-between items-center">
          <span className="font-medium">{skill.skill}</span>
          <Badge className={getProficiencyColorClass(skill.proficiency, maxLevel)}>
            Level {skill.proficiency}/{maxLevel}
          </Badge>
        </div>
        <Progress 
          value={(skill.proficiency / maxLevel) * 100} 
          className="h-2"
        />
        <p className="text-sm text-muted-foreground mt-1">{skill.description}</p>
      </div>
    );
  };
  
  // Function to render skill gaps with consistent styling
  const renderSkillGap = (gap: any) => {
    const maxLevel = 5;
    return (
      <div className="flex flex-col gap-1 mb-4" key={gap.skill}>
        <div className="flex justify-between items-center">
          <span className="font-medium">{gap.skill}</span>
          <Badge variant={gap.priority === 'High' ? 'destructive' : (gap.priority === 'Medium' ? 'default' : 'outline')}>
            {gap.priority} Priority
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm">Current: {gap.currentLevel}</span>
          <Progress 
            value={(gap.currentLevel / maxLevel) * 100} 
            className="h-2 flex-1"
          />
          <span className="text-sm">Required: {gap.requiredLevel}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{gap.improvementSuggestion}</p>
      </div>
    );
  };
  
  // Function to render career pathway steps
  const renderPathwayStep = (step: any, index: any) => {
    return (
      <div className="flex items-start gap-4 mb-4" key={step.step}>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
          {index + 1}
        </div>
        <div className="flex-1">
          <h4 className="font-medium">{step.step}</h4>
          <p className="text-sm text-muted-foreground">{step.timeframe}</p>
          <p className="mt-1">{step.description}</p>
        </div>
      </div>
    );
  };
  
  // Function to render educational paths
  const renderDegree = (degree: any) => {
    return (
      <Card className="mb-4" key={degree.degree}>
        <CardHeader>
          <CardTitle className="text-lg">{degree.degree}</CardTitle>
          <CardDescription>{degree.duration}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2">
            <h4 className="font-medium mb-1">Top Institutions</h4>
            <ul className="list-disc pl-5">
              {degree.institutions.map((institution: any) => (
                <li key={institution}>{institution}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">Key Outcomes</h4>
            <ul className="list-disc pl-5">
              {degree.outcomes.map((outcome: any) => (
                <li key={outcome}>{outcome}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Helper function to safely access arrays and avoid null/undefined errors
  const safeMap = (array: any[] | null | undefined, mapFn: (item: any, index: number) => React.ReactNode) => {
    if (!array || !Array.isArray(array) || array.length === 0) {
      return null;
    }
    return array.map(mapFn);
  };

  // Helper function to check if section exists with data
  const hasData = (section: any, arrayProps: string[] = []) => {
    if (!section || typeof section !== 'object') return false;
    
    if (arrayProps.length === 0) return true;
    
    return arrayProps.some(prop => 
      section[prop] && 
      Array.isArray(section[prop]) && 
      section[prop].length > 0
    );
  };

  // Format location string
  const location = `${requestData.state}, ${requestData.country}`;
  
  return (
    <motion.div
      className="space-y-8"
      variants={staggerChildren}
      initial="hidden"
      animate="visible"
    >
      {/* Report Header */}
      <motion.div variants={fadeIn}>
        <Card className="border-primary/20">
          <CardHeader className="bg-primary/5">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">X-Gen Career Analysis Report</h2>
                <p className="text-muted-foreground">
                  Generated for {requestData.desiredRole} in {location}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Professional Level</p>
                <p className="font-medium">{requestData.professionalLevel}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Target Role</p>
                <p className="font-medium">{requestData.desiredRole}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Fit Score</p>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary">
                    {report.executiveSummary.fitScore.score}/{report.executiveSummary.fitScore.outOf}
                  </Badge>
                  <Progress 
                    value={(report.executiveSummary.fitScore.score / report.executiveSummary.fitScore.outOf) * 100} 
                    className="h-2 flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Report Body - Sections Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <motion.div variants={fadeInUp} className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Report Sections</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-320px)] px-4 pb-4">
                <div className="space-y-1">
                  <Button
                    variant={activeSection === 'executive-summary' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveSection('executive-summary')}
                  >
                    Executive Summary
                  </Button>
                  <Button
                    variant={activeSection === 'skill-mapping' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveSection('skill-mapping')}
                  >
                    Skill Mapping
                  </Button>
                  <Button
                    variant={activeSection === 'skill-gap-analysis' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveSection('skill-gap-analysis')}
                  >
                    Skill Gap Analysis
                  </Button>
                  <Button
                    variant={activeSection === 'career-pathway' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveSection('career-pathway')}
                  >
                    Career Pathway
                  </Button>
                  <Button
                    variant={activeSection === 'development-plan' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveSection('development-plan')}
                  >
                    Development Plan
                  </Button>
                  <Button
                    variant={activeSection === 'educational-programs' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveSection('educational-programs')}
                  >
                    Educational Programs
                  </Button>
                  <Button
                    variant={activeSection === 'learning-roadmap' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveSection('learning-roadmap')}
                  >
                    Learning Roadmap
                  </Button>
                  <Button
                    variant={activeSection === 'similar-roles' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveSection('similar-roles')}
                  >
                    Similar Roles
                  </Button>
                  <Button
                    variant={activeSection === 'quick-tips' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveSection('quick-tips')}
                  >
                    Quick Tips
                  </Button>
                  <Button
                    variant={activeSection === 'growth-trajectory' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveSection('growth-trajectory')}
                  >
                    Growth Trajectory
                  </Button>
                  <Button
                    variant={activeSection === 'learning-path-roadmap' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveSection('learning-path-roadmap')}
                  >
                    Learning Path Roadmap
                  </Button>
                  <Button
                    variant={activeSection === 'social-skills' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setActiveSection('social-skills')}
                  >
                    Social Skills
                  </Button>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={fadeInUp} className="lg:col-span-3">
          {/* Executive Summary Section */}
          {activeSection === 'executive-summary' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Executive Summary</CardTitle>
                <CardDescription>Overview of your career analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Summary</h3>
                  <p>{report.executiveSummary.summary}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Career Goal</h3>
                  <div className="flex items-center">
                    <Badge className="bg-primary mr-2">Target Role</Badge>
                    <span>{report.executiveSummary.careerGoal}</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Fit Score</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary">
                        {report.executiveSummary.fitScore.score}/{report.executiveSummary.fitScore.outOf}
                      </Badge>
                      <Progress 
                        value={(report.executiveSummary.fitScore.score / report.executiveSummary.fitScore.outOf) * 100} 
                        className="h-2 flex-1"
                      />
                    </div>
                    <p className="text-sm">{report.executiveSummary.fitScore.description}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Key Findings</h3>
                  <ul className="space-y-2">
                    {safeMap(report.executiveSummary?.keyFindings, (finding, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{finding}</span>
                      </li>
                    )) || <li>No key findings available</li>}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Skill Mapping Section */}
          {activeSection === 'skill-mapping' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Skill Mapping</CardTitle>
                <CardDescription>Analysis of your current skills against industry frameworks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Skills Analysis</h3>
                  <p>{report.skillMapping.skillsAnalysis}</p>
                </div>
                
                <Tabs defaultValue="sfia">
                  <TabsList className="mb-4">
                    <TabsTrigger value="sfia">SFIA Skills</TabsTrigger>
                    <TabsTrigger value="digcomp">DigComp Skills</TabsTrigger>
                    <TabsTrigger value="other">Other Skills</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="sfia" className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium mb-4">SFIA Framework Skills</h4>
                      <div className="space-y-4">
                        {safeMap(report.skillMapping?.sfiaSkills, skill => renderSkillProficiency(skill)) || <div>No SFIA skills available</div>}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="digcomp" className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium mb-4">DigComp Framework Skills</h4>
                      <div className="space-y-4">
                        {safeMap(report.skillMapping?.digCompSkills, skill => renderSkillProficiency(skill)) || <div>No DigComp skills available</div>}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="other" className="space-y-4">
                    <div className="rounded-lg border p-4">
                      <h4 className="font-medium mb-4">Other Relevant Skills</h4>
                      <div className="space-y-4">
                        {report?.skillMapping?.otherSkills?.map(skill => renderSkillProficiency(skill)) || <div>No other skills available</div>}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
          
          {/* Skill Gap Analysis Section */}
          {activeSection === 'skill-gap-analysis' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Skill Gap Analysis</CardTitle>
                <CardDescription>Identification of skill gaps for your target role of {report.skillGapAnalysis.targetRole}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">AI Analysis</h3>
                  <p>{report.skillGapAnalysis.aiAnalysis}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <BarChart className="h-5 w-5 mr-2 text-primary" />
                    Gap Analysis
                  </h3>
                  
                  <div className="rounded-lg border p-4 mb-4">
                    <h4 className="font-medium mb-4">Key Gaps</h4>
                    <div className="space-y-4">
                      {report.skillGapAnalysis.keyGaps.map(gap => renderSkillGap(gap))}
                    </div>
                  </div>
                  
                  <div className="rounded-lg border p-4">
                    <h4 className="font-medium mb-4">Key Strengths</h4>
                    <div className="space-y-4">
                      {report.skillGapAnalysis.keyStrengths.map((strength, idx) => (
                        <div className="flex flex-col gap-1 mb-4" key={idx}>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{strength.skill}</span>
                            <Badge className="bg-green-500">
                              +{strength.advantage} Advantage
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{strength.leverageSuggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Career Pathway Section */}
          {activeSection === 'career-pathway' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Career Pathway Options</CardTitle>
                <CardDescription>
                  From {report.careerPathwayOptions.currentRole} to {report.careerPathwayOptions.targetRole} • 
                  Estimated timeframe: {report.careerPathwayOptions.timeframe}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Pathway Description</h3>
                  <p>{report.careerPathwayOptions.pathwayDescription}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Step-by-Step Pathway</h3>
                  <div className="space-y-2">
                    {report.careerPathwayOptions.pathwaySteps.map((step, idx) => 
                      renderPathwayStep(step, idx)
                    )}
                  </div>
                </div>
                
                <Tabs defaultValue="university">
                  <TabsList className="mb-4">
                    <TabsTrigger value="university">University Pathway</TabsTrigger>
                    <TabsTrigger value="vocational">Vocational Pathway</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="university" className="space-y-4">
                    {report.careerPathwayOptions.universityPathway.map(degree => 
                      renderDegree(degree)
                    )}
                  </TabsContent>
                  
                  <TabsContent value="vocational" className="space-y-4">
                    {report.careerPathwayOptions.vocationalPathway.map(cert => 
                      renderDegree(cert)
                    )}
                  </TabsContent>
                </Tabs>
                
                <div className="rounded-lg border p-4 bg-primary/5">
                  <h4 className="font-medium mb-2">AI Insights</h4>
                  <p>{report.careerPathwayOptions.aiInsights}</p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Development Plan Section */}
          {activeSection === 'development-plan' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Development Plan</CardTitle>
                <CardDescription>Structured approach to develop necessary skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Overview</h3>
                  <p>{report.developmentPlan.overview}</p>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="technical-skills">
                    <AccordionTrigger className="text-lg font-medium">Technical Skills</AccordionTrigger>
                    <AccordionContent className="pt-4">
                      {report.developmentPlan.technicalSkills.map((skill, idx) => (
                        <div key={idx} className="mb-6">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{skill.skill}</h4>
                            <Badge>
                              {skill.timeframe}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">Current: {skill.currentLevel}</span>
                            <Progress 
                              value={(skill.currentLevel / skill.targetLevel) * 100} 
                              className="h-2 flex-1"
                            />
                            <span className="text-sm">Target: {skill.targetLevel}</span>
                          </div>
                          <div className="rounded-lg border p-4">
                            <h5 className="font-medium mb-2">Recommended Resources</h5>
                            <ul className="list-disc pl-5 space-y-1">
                              {skill.resources.map((resource, ridx) => (
                                <li key={ridx}>{resource}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="soft-skills">
                    <AccordionTrigger className="text-lg font-medium">Soft Skills</AccordionTrigger>
                    <AccordionContent className="pt-4">
                      {report.developmentPlan.softSkills.map((skill, idx) => (
                        <div key={idx} className="mb-6">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{skill.skill}</h4>
                            <Badge>
                              {skill.timeframe}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm">Current: {skill.currentLevel}</span>
                            <Progress 
                              value={(skill.currentLevel / skill.targetLevel) * 100} 
                              className="h-2 flex-1"
                            />
                            <span className="text-sm">Target: {skill.targetLevel}</span>
                          </div>
                          <div className="rounded-lg border p-4">
                            <h5 className="font-medium mb-2">Recommended Activities</h5>
                            <ul className="list-disc pl-5 space-y-1">
                              {skill.resources.map((resource, ridx) => (
                                <li key={ridx}>{resource}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="skills-to-acquire">
                    <AccordionTrigger className="text-lg font-medium">Skills to Acquire</AccordionTrigger>
                    <AccordionContent className="pt-4">
                      {report.developmentPlan.skillsToAcquire.map((skill, idx) => (
                        <div key={idx} className="mb-6">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{skill.skill}</h4>
                            <Badge>
                              {skill.timeframe}
                            </Badge>
                          </div>
                          <p className="mb-2">{skill.reason}</p>
                          <div className="rounded-lg border p-4">
                            <h5 className="font-medium mb-2">Recommended Resources</h5>
                            <ul className="list-disc pl-5 space-y-1">
                              {skill.resources.map((resource, ridx) => (
                                <li key={ridx}>{resource}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          )}
          
          {/* Educational Programs Section */}
          {activeSection === 'educational-programs' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Educational Programs</CardTitle>
                <CardDescription>Recommended formal education and projects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Introduction</h3>
                  <p>{report.educationalPrograms.introduction}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Recommended Programs</h3>
                  {report.educationalPrograms.recommendedPrograms.map((program, idx) => (
                    <Card className="mb-4" key={idx}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{program.name}</CardTitle>
                            <CardDescription>{program.provider}</CardDescription>
                          </div>
                          <Badge>{program.duration}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Format</h4>
                            <p>{program.format}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Skills Covered</h4>
                            <div className="flex flex-wrap gap-2">
                              {program.skillsCovered.map((skill, sidx) => (
                                <Badge key={sidx} variant="outline">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Description</h4>
                          <p>{program.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Project Ideas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {report.educationalPrograms.projectIdeas.map((project, idx) => (
                      <Card className="h-full" key={idx}>
                        <CardHeader>
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <CardDescription>
                            {project.difficulty} • {project.timeline}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-4">{project.description}</p>
                          <div>
                            <h4 className="font-medium mb-2">Skills Developed</h4>
                            <div className="flex flex-wrap gap-2">
                              {project.skillsDeveloped.map((skill, sidx) => (
                                <Badge key={sidx} variant="outline">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Learning Roadmap Section */}
          {activeSection === 'learning-roadmap' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Learning Roadmap</CardTitle>
                <CardDescription>Structured learning path for skill development</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Introduction</h3>
                  <p>{report.learningRoadmap.introduction}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Roadmap Phases</h3>
                  {report.learningRoadmap.roadmapPhases.map((phase, idx) => (
                    <Card className="mb-4" key={idx}>
                      <CardHeader className={`bg-primary/5 ${idx % 2 === 0 ? 'bg-primary/10' : ''}`}>
                        <CardTitle className="text-lg">{phase.phase}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium mb-2">Key Skills</h4>
                            <div className="flex flex-wrap gap-2">
                              {phase.skills.map((skill, sidx) => (
                                <Badge key={sidx} variant="outline">{skill}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Milestones</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {phase.milestones.map((milestone, midx) => (
                              <li key={midx}>{milestone}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-medium mb-2">Learning Style</h3>
                    <p>{report.learningRoadmap.learningStyle}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-medium mb-2">Certification Path</h3>
                    <p>{report.learningRoadmap.certificationPath}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Similar Roles Section */}
          {activeSection === 'similar-roles' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Similar Roles</CardTitle>
                <CardDescription>Alternative career options based on your skills</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Introduction</h3>
                  <p>{report.similarRoles.introduction}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.similarRoles.roles.map((role, idx) => (
                    <Card className="h-full" key={idx}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{role.title}</CardTitle>
                          <Badge>
                            {role.skillsOverlap}% Overlap
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="mb-4">{role.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-sm mb-1">Transition Difficulty</h4>
                            <Badge 
                              variant={
                                role.transitionDifficulty === 'Low' ? 'outline' :
                                role.transitionDifficulty === 'Medium' ? 'secondary' : 'default'
                              }
                            >
                              {role.transitionDifficulty}
                            </Badge>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm mb-1">Growth Prospects</h4>
                            <Badge 
                              variant={
                                role.growthProspects === 'High' || role.growthProspects === 'Very High' ? 'default' : 'outline'
                              }
                            >
                              {role.growthProspects}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Salary Range</h4>
                          <p>{role.salaryRange}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Key Requirements</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {role.keyRequirements.map((req, ridx) => (
                              <li key={ridx}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Quick Tips Section */}
          {activeSection === 'quick-tips' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Quick Tips</CardTitle>
                <CardDescription>Practical advice for your career transition</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium mb-4">Career Advice</h3>
                  <ul className="space-y-2">
                    {report.quickTips.careerAdvice.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium mb-4">Skill Development</h3>
                  <ul className="space-y-2">
                    {report.quickTips.skillDevelopment.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium mb-4">Interview Preparation</h3>
                  <ul className="space-y-2">
                    {report.quickTips.interviewPreparation.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Growth Trajectory Section */}
          {activeSection === 'growth-trajectory' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Growth Trajectory</CardTitle>
                <CardDescription>Your anticipated career progression path</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="h-full">
                    <CardHeader className="bg-primary/5">
                      <CardTitle className="text-lg">Short Term</CardTitle>
                      <CardDescription>{report.growthTrajectory.shortTerm.timeline}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2">Goals</h4>
                      <ul className="list-disc pl-5 space-y-1 mb-4">
                        {report.growthTrajectory.shortTerm.goals.map((goal, idx) => (
                          <li key={idx}>{goal}</li>
                        ))}
                      </ul>
                      <h4 className="font-medium mb-2">Expected Outcomes</h4>
                      <p>{report.growthTrajectory.shortTerm.expectedOutcomes}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="h-full">
                    <CardHeader className="bg-primary/10">
                      <CardTitle className="text-lg">Medium Term</CardTitle>
                      <CardDescription>{report.growthTrajectory.mediumTerm.timeline}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2">Goals</h4>
                      <ul className="list-disc pl-5 space-y-1 mb-4">
                        {report.growthTrajectory.mediumTerm.goals.map((goal, idx) => (
                          <li key={idx}>{goal}</li>
                        ))}
                      </ul>
                      <h4 className="font-medium mb-2">Expected Outcomes</h4>
                      <p>{report.growthTrajectory.mediumTerm.expectedOutcomes}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="h-full">
                    <CardHeader className="bg-primary/15">
                      <CardTitle className="text-lg">Long Term</CardTitle>
                      <CardDescription>{report.growthTrajectory.longTerm.timeline}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2">Goals</h4>
                      <ul className="list-disc pl-5 space-y-1 mb-4">
                        {report.growthTrajectory.longTerm.goals.map((goal, idx) => (
                          <li key={idx}>{goal}</li>
                        ))}
                      </ul>
                      <h4 className="font-medium mb-2">Expected Outcomes</h4>
                      <p>{report.growthTrajectory.longTerm.expectedOutcomes}</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Potential Challenges & Mitigation</h3>
                  {report.growthTrajectory.potentialChallenges.map((item, idx) => (
                    <Card className="mb-4" key={idx}>
                      <CardHeader>
                        <CardTitle className="text-base">{item.challenge}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{item.mitigation}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Learning Path Roadmap Section */}
          {activeSection === 'learning-path-roadmap' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Learning Path Roadmap</CardTitle>
                <CardDescription>Visual roadmap of your learning journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Introduction</h3>
                  <p>{report.learningPathRoadmap.introduction}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Milestones</h3>
                  {report.learningPathRoadmap.milestones.map((milestone, index) => (
                    <div 
                      key={index} 
                      className={`relative pb-12 ${index === report.learningPathRoadmap.milestones.length - 1 ? '' : 'border-l border-primary/30'} pl-8 ml-4`}
                    >
                      <div className="absolute -left-3 top-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{milestone.title}</CardTitle>
                              <CardDescription>{milestone.timeframe}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="mb-4">{milestone.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Key Skills</h4>
                              <div className="flex flex-wrap gap-2">
                                {milestone.keySkills.map((skill, idx) => (
                                  <Badge key={idx} variant="outline">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Resources</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {milestone.resources.map((resource, idx) => (
                                  <li key={idx}>{resource}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Skill Progress Timeline</h3>
                  <Tabs defaultValue="technical">
                    <TabsList className="mb-4">
                      <TabsTrigger value="technical">Technical Skills</TabsTrigger>
                      <TabsTrigger value="business">Business Skills</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="technical">
                      <div className="space-y-4">
                        {report.learningPathRoadmap.skillProgress.technical.map((skill, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{skill.skill}</span>
                              <Badge>{skill.months} months</Badge>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm">Start: {skill.startLevel}</span>
                              <div className="flex-1 relative h-8 bg-gray-100 rounded-full">
                                <div 
                                  className="absolute top-0 left-0 h-full bg-primary rounded-full" 
                                  style={{width: `${(skill.startLevel / 5) * 100}%`}}
                                />
                                <div 
                                  className="absolute top-0 left-0 h-full bg-primary/30 rounded-full" 
                                  style={{
                                    width: `${(skill.targetLevel / 5) * 100}%`,
                                    clipPath: `inset(0 0 0 ${(skill.startLevel / 5) * 100}%)`
                                  }}
                                />
                                <div className="absolute inset-0 flex items-center justify-between px-2">
                                  <span className="text-xs font-medium">Current</span>
                                  <span className="text-xs font-medium">Target: {skill.targetLevel}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="business">
                      <div className="space-y-4">
                        {report.learningPathRoadmap.skillProgress.business.map((skill, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{skill.skill}</span>
                              <Badge>{skill.months} months</Badge>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm">Start: {skill.startLevel}</span>
                              <div className="flex-1 relative h-8 bg-gray-100 rounded-full">
                                <div 
                                  className="absolute top-0 left-0 h-full bg-primary rounded-full" 
                                  style={{width: `${(skill.startLevel / 5) * 100}%`}}
                                />
                                <div 
                                  className="absolute top-0 left-0 h-full bg-primary/30 rounded-full" 
                                  style={{
                                    width: `${(skill.targetLevel / 5) * 100}%`,
                                    clipPath: `inset(0 0 0 ${(skill.startLevel / 5) * 100}%)`
                                  }}
                                />
                                <div className="absolute inset-0 flex items-center justify-between px-2">
                                  <span className="text-xs font-medium">Current</span>
                                  <span className="text-xs font-medium">Target: {skill.targetLevel}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Social Skills Section */}
          {activeSection === 'social-skills' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Social Skills</CardTitle>
                <CardDescription>Social and communication skills assessment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Key Findings</h3>
                  <p>{report.socialSkills.key_findings}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Transferable Skills</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Skill</TableHead>
                        <TableHead>Proficiency</TableHead>
                        <TableHead className="hidden md:table-cell">Relevance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.socialSkills.transferable_skills.map((skill, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{skill.skill}</TableCell>
                          <TableCell>
                            <Badge 
                              className={
                                skill.proficiency === 'High' ? 'bg-green-500' :
                                skill.proficiency === 'Medium' ? 'bg-blue-500' : 'bg-yellow-500'
                              }
                            >
                              {skill.proficiency}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{skill.relevance}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Development Areas</h3>
                  {report.socialSkills.development_areas.map((area, idx) => (
                    <div key={idx} className="mb-4 rounded-lg border p-4">
                      <h4 className="font-medium mb-1">{area.skill}</h4>
                      <p className="text-sm mb-2">{area.why_important}</p>
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <h5 className="text-sm font-medium mb-1">Development Suggestion</h5>
                        <p className="text-sm">{area.development_suggestion}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Networking Strategy</h3>
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Importance</h4>
                    <p>{report.socialSkills.networking_strategy.importance}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Recommended Actions</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {report.socialSkills.networking_strategy.recommended_actions.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="rounded-lg border p-4 bg-primary/5">
                    <h4 className="font-medium mb-2">Your Elevator Pitch</h4>
                    <p className="italic">"{report.socialSkills.networking_strategy.elevator_pitch}"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}