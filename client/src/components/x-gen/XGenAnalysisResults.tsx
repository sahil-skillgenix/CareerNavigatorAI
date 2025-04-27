/**
 * X-Gen Analysis Results Component
 * 
 * Displays the results of the X-Gen AI career analysis in a structured format
 * with interactive sections for each part of the career analysis report.
 */
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, ChevronUp, ChevronRight, BarChart3, Book, Brain, 
  Calendar, GraduationCap, LineChart, Star, Trophy, Users, Route, Lightbulb 
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CareerAnalysisReport, CareerAnalysisRequestData } from "../../../shared/types/reportTypes";

// Import charts and visualization components
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart as RechartLineChart,
  Line,
} from "recharts";

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
  requestData: CareerAnalysisRequestData;
}

export function XGenAnalysisResults({ 
  report, 
  requestData 
}: XGenAnalysisResultsProps) {
  const [activeSection, setActiveSection] = useState<string | null>("executiveSummary");
  const sectionRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  
  // Function to scroll to a specific section
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionRefs.current[sectionId]) {
      sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Generate skill gap visualization data for radar chart
  const generateSkillRadarData = () => {
    try {
      const { currentSkills, requiredSkills } = report.skillGapAnalysis?.visualizationData || {};
      
      if (!currentSkills || !requiredSkills) return [];
      
      // Combine the data
      return currentSkills.map((current, index) => {
        const required = requiredSkills[index] || { skill: current.skill, value: 0 };
        
        return {
          skill: current.skill,
          current: current.value,
          required: required.value,
          fullMark: 5,
        };
      });
    } catch (error) {
      console.error("Error generating radar chart data:", error);
      return [];
    }
  };

  // Format the salary progression data for the line chart
  const formatSalaryProgressionData = () => {
    try {
      const progression = report.growthTrajectory?.potentialSalaryProgression || [];
      
      return progression.map(item => {
        // Extract numeric value from salary string
        const salaryStr = item.salary.replace(/[^0-9.]/g, '');
        const salary = parseFloat(salaryStr);
        
        return {
          stage: item.stage,
          salary: !isNaN(salary) ? salary : 0,
          timeframe: item.timeframe,
        };
      });
    } catch (error) {
      console.error("Error formatting salary progression data:", error);
      return [];
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Navigation Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl shadow-md p-4 border border-border/50 sticky top-4 max-h-[calc(100vh-2rem)] overflow-auto">
            <h3 className="text-lg font-semibold mb-4 text-primary">Report Sections</h3>
            <div className="space-y-1">
              {[
                { id: "executiveSummary", icon: <Star className="h-4 w-4" />, label: "Executive Summary" },
                { id: "skillMapping", icon: <Brain className="h-4 w-4" />, label: "Skill Mapping" },
                { id: "skillGapAnalysis", icon: <BarChart3 className="h-4 w-4" />, label: "Skill Gap Analysis" },
                { id: "careerPathwayOptions", icon: <Route className="h-4 w-4" />, label: "Career Pathway Options" },
                { id: "developmentPlan", icon: <Book className="h-4 w-4" />, label: "Development Plan" },
                { id: "educationalPrograms", icon: <GraduationCap className="h-4 w-4" />, label: "Educational Programs" },
                { id: "learningRoadmap", icon: <Calendar className="h-4 w-4" />, label: "Learning Roadmap" },
                { id: "similarRoles", icon: <Users className="h-4 w-4" />, label: "Similar Roles" },
                { id: "quickTips", icon: <Lightbulb className="h-4 w-4" />, label: "Quick Tips" },
                { id: "growthTrajectory", icon: <Trophy className="h-4 w-4" />, label: "Growth Trajectory" },
                { id: "learningPathRoadmap", icon: <LineChart className="h-4 w-4" />, label: "Learning Path Roadmap" },
              ].map((section) => (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "ghost"}
                  className={`w-full justify-start ${activeSection === section.id ? "bg-primary text-primary-foreground" : ""}`}
                  onClick={() => scrollToSection(section.id)}
                >
                  <span className="mr-2">{section.icon}</span>
                  <span>{section.label}</span>
                  {activeSection === section.id && <ChevronRight className="ml-auto h-4 w-4" />}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Executive Summary */}
          <motion.div
            ref={(el) => (sectionRefs.current.executiveSummary = el)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-xl shadow-md p-6 border border-border/50"
          >
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
              <Star className="mr-2 h-5 w-5" /> Executive Summary
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-secondary/20 rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold mb-2">Desired Role</h3>
                <p className="text-xl font-bold text-primary">{requestData.desiredRole}</p>
              </div>
              
              <div className="bg-secondary/20 rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold mb-2">Career Goal</h3>
                <p>{report.executiveSummary?.careerGoal || "Not specified"}</p>
              </div>
              
              <div className="bg-secondary/20 rounded-lg p-4 text-center">
                <h3 className="text-lg font-semibold mb-2">Fit Score</h3>
                <div className="flex justify-center items-center gap-3">
                  <Progress value={(report.executiveSummary?.fitScore?.score / report.executiveSummary?.fitScore?.outOf) * 100} className="w-20 h-2" />
                  <p className="text-xl font-bold text-primary">
                    {report.executiveSummary?.fitScore?.score || 0}/{report.executiveSummary?.fitScore?.outOf || 10}
                  </p>
                </div>
                <p className="text-sm mt-2">{report.executiveSummary?.fitScore?.description}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Summary</h3>
              <p className="text-muted-foreground">{report.executiveSummary?.summary}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Key Findings</h3>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                {report.executiveSummary?.keyFindings?.map((finding, index) => (
                  <li key={index}>{finding}</li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Skill Mapping */}
          <motion.div
            ref={(el) => (sectionRefs.current.skillMapping = el)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-xl shadow-md p-6 border border-border/50"
          >
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
              <Brain className="mr-2 h-5 w-5" /> Skill Mapping
            </h2>
            
            <div className="mb-6">
              <p className="text-muted-foreground">{report.skillMapping?.skillsAnalysis}</p>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="sfia-skills">
                <AccordionTrigger className="font-semibold">
                  SFIA 9 Framework Skills
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-4">
                      {report.skillMapping?.sfiaSkills?.map((skill, idx) => (
                        <div key={idx} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{skill.skill}</h4>
                            <div className="flex items-center">
                              <span className="text-sm text-muted-foreground mr-2">
                                Proficiency Level: {skill.proficiency}/5
                              </span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="flex space-x-0.5">
                                      {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                          key={level}
                                          className={`w-2 h-6 rounded-sm ${
                                            level <= skill.proficiency
                                              ? "bg-primary"
                                              : "bg-secondary"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Proficiency Level: {skill.proficiency}/5</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{skill.description}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="digcomp-skills">
                <AccordionTrigger className="font-semibold">
                  DigComp 2.2 Framework Skills
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-4">
                      {report.skillMapping?.digCompSkills?.map((skill, idx) => (
                        <div key={idx} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{skill.skill}</h4>
                            <div className="flex items-center">
                              <span className="text-sm text-muted-foreground mr-2">
                                Proficiency Level: {skill.proficiency}/5
                              </span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="flex space-x-0.5">
                                      {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                          key={level}
                                          className={`w-2 h-6 rounded-sm ${
                                            level <= skill.proficiency
                                              ? "bg-primary"
                                              : "bg-secondary"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Proficiency Level: {skill.proficiency}/5</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{skill.description}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="other-skills">
                <AccordionTrigger className="font-semibold">
                  Additional Skills
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-4">
                      {report.skillMapping?.otherSkills?.map((skill, idx) => (
                        <div key={idx} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{skill.skill}</h4>
                            <div className="flex items-center">
                              <span className="text-sm text-muted-foreground mr-2">
                                Proficiency Level: {skill.proficiency}/5
                              </span>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <div className="flex space-x-0.5">
                                      {[1, 2, 3, 4, 5].map((level) => (
                                        <div
                                          key={level}
                                          className={`w-2 h-6 rounded-sm ${
                                            level <= skill.proficiency
                                              ? "bg-primary"
                                              : "bg-secondary"
                                          }`}
                                        />
                                      ))}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Proficiency Level: {skill.proficiency}/5</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{skill.description}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>

          {/* Skill Gap Analysis */}
          <motion.div
            ref={(el) => (sectionRefs.current.skillGapAnalysis = el)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-xl shadow-md p-6 border border-border/50"
          >
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" /> Skill Gap Analysis
            </h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Target Role: {report.skillGapAnalysis?.targetRole}</h3>
              <p className="text-muted-foreground">{report.skillGapAnalysis?.aiAnalysis}</p>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Skill Gap Visualization</h3>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={150} data={generateSkillRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis tickCount={6} domain={[0, 5]} />
                    <Radar
                      name="Current Skills"
                      dataKey="current"
                      stroke="#1C3B82"
                      fill="#1C3B82"
                      fillOpacity={0.4}
                    />
                    <Radar
                      name="Required Skills"
                      dataKey="required"
                      stroke="#A31D52"
                      fill="#A31D52"
                      fillOpacity={0.4}
                    />
                    <Legend />
                    <RechartsTooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Skill Gaps</h3>
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {report.skillGapAnalysis?.keyGaps?.map((gap, idx) => (
                      <div 
                        key={idx} 
                        className="border border-border rounded-lg p-4"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold">{gap.skill}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            gap.priority === 'High' 
                              ? 'bg-red-100 text-red-800' 
                              : gap.priority === 'Medium' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {gap.priority} Priority
                          </span>
                        </div>
                        
                        <div className="mt-3 mb-2">
                          <div className="flex justify-between text-sm">
                            <span>Current: {gap.currentLevel}/5</span>
                            <span>Required: {gap.requiredLevel}/5</span>
                          </div>
                          <div className="relative pt-1">
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-secondary">
                              <div
                                style={{ width: `${(gap.currentLevel / 5) * 100}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary"
                              ></div>
                            </div>
                            <div className="mt-1 overflow-hidden h-2 text-xs flex rounded bg-secondary">
                              <div
                                style={{ width: `${(gap.requiredLevel / 5) * 100}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#A31D52]"
                              ></div>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-sm mt-2">{gap.improvementSuggestion}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Strengths</h3>
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {report.skillGapAnalysis?.keyStrengths?.map((strength, idx) => (
                      <div key={idx} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">{strength.skill}</h4>
                          <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                            +{strength.advantage} Advantage
                          </span>
                        </div>
                        <p className="text-sm">{strength.leverageSuggestion}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </motion.div>

          {/* Career Pathway Options */}
          <motion.div
            ref={(el) => (sectionRefs.current.careerPathwayOptions = el)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-xl shadow-md p-6 border border-border/50"
          >
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
              <Route className="mr-2 h-5 w-5" /> Career Pathway Options
            </h2>
            
            <div className="mb-6">
              <p className="text-muted-foreground">{report.careerPathwayOptions?.pathwayDescription}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-secondary/20 rounded-lg p-4">
                <h3 className="text-md font-semibold mb-2">Current Role</h3>
                <p className="font-medium">{report.careerPathwayOptions?.currentRole}</p>
              </div>
              
              <div className="bg-secondary/20 rounded-lg p-4">
                <h3 className="text-md font-semibold mb-2">Target Role</h3>
                <p className="font-medium">{report.careerPathwayOptions?.targetRole}</p>
              </div>
              
              <div className="bg-secondary/20 rounded-lg p-4">
                <h3 className="text-md font-semibold mb-2">Timeframe</h3>
                <p className="font-medium">{report.careerPathwayOptions?.timeframe}</p>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Pathway Steps</h3>
              <ol className="relative border-l border-primary/30">
                {report.careerPathwayOptions?.pathwaySteps?.map((step, idx) => (
                  <li key={idx} className="mb-6 ml-6">
                    <span className="absolute flex items-center justify-center w-6 h-6 bg-primary rounded-full -left-3 ring-8 ring-card">
                      {idx + 1}
                    </span>
                    <h4 className="font-semibold">{step.step} <span className="text-muted-foreground text-sm font-normal">({step.timeframe})</span></h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </li>
                ))}
              </ol>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">University Pathway</h3>
                <ScrollArea className="h-80">
                  <div className="space-y-6">
                    {report.careerPathwayOptions?.universityPathway?.map((degree, idx) => (
                      <div key={idx} className="border border-border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{degree.degree}</h4>
                        <p className="text-sm mb-2"><span className="font-medium">Duration:</span> {degree.duration}</p>
                        
                        <h5 className="text-sm font-medium mb-1">Institutions:</h5>
                        <ul className="list-disc pl-5 mb-3 text-sm">
                          {degree.institutions.map((institution, index) => (
                            <li key={index}>{institution}</li>
                          ))}
                        </ul>
                        
                        <h5 className="text-sm font-medium mb-1">Outcomes:</h5>
                        <ul className="list-disc pl-5 text-sm">
                          {degree.outcomes.map((outcome, index) => (
                            <li key={index}>{outcome}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Vocational Pathway</h3>
                <ScrollArea className="h-80">
                  <div className="space-y-6">
                    {report.careerPathwayOptions?.vocationalPathway?.map((cert, idx) => (
                      <div key={idx} className="border border-border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{cert.degree}</h4>
                        <p className="text-sm mb-2"><span className="font-medium">Duration:</span> {cert.duration}</p>
                        
                        <h5 className="text-sm font-medium mb-1">Institutions:</h5>
                        <ul className="list-disc pl-5 mb-3 text-sm">
                          {cert.institutions.map((institution, index) => (
                            <li key={index}>{institution}</li>
                          ))}
                        </ul>
                        
                        <h5 className="text-sm font-medium mb-1">Outcomes:</h5>
                        <ul className="list-disc pl-5 text-sm">
                          {cert.outcomes.map((outcome, index) => (
                            <li key={index}>{outcome}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
              <p className="text-muted-foreground">{report.careerPathwayOptions?.aiInsights}</p>
            </div>
          </motion.div>

          {/* Development Plan */}
          <motion.div
            ref={(el) => (sectionRefs.current.developmentPlan = el)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-xl shadow-md p-6 border border-border/50"
          >
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
              <Book className="mr-2 h-5 w-5" /> Development Plan
            </h2>
            
            <div className="mb-6">
              <p className="text-muted-foreground">{report.developmentPlan?.overview}</p>
            </div>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="technical-skills">
                <AccordionTrigger className="font-semibold">
                  Technical Skills Development
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-4">
                      {report.developmentPlan?.technicalSkills?.map((skill, idx) => (
                        <div key={idx} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{skill.skill}</h4>
                            <div className="text-sm text-muted-foreground">
                              {skill.currentLevel} → {skill.targetLevel} <span className="text-xs">({skill.timeframe})</span>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <div className="relative pt-1">
                              <div className="overflow-hidden h-2 text-xs flex rounded bg-secondary">
                                <div
                                  style={{ width: `${(skill.currentLevel / 5) * 100}%` }}
                                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                                ></div>
                              </div>
                              <div className="mt-1 overflow-hidden h-2 text-xs flex rounded bg-secondary">
                                <div
                                  style={{ width: `${(skill.targetLevel / 5) * 100}%` }}
                                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          <h5 className="text-sm font-medium mb-2">Recommended Resources:</h5>
                          <ul className="list-disc pl-5 text-sm">
                            {skill.resources.map((resource, ridx) => (
                              <li key={ridx}>{resource}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="soft-skills">
                <AccordionTrigger className="font-semibold">
                  Soft Skills Development
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-4">
                      {report.developmentPlan?.softSkills?.map((skill, idx) => (
                        <div key={idx} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{skill.skill}</h4>
                            <div className="text-sm text-muted-foreground">
                              {skill.currentLevel} → {skill.targetLevel} <span className="text-xs">({skill.timeframe})</span>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <div className="relative pt-1">
                              <div className="overflow-hidden h-2 text-xs flex rounded bg-secondary">
                                <div
                                  style={{ width: `${(skill.currentLevel / 5) * 100}%` }}
                                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                                ></div>
                              </div>
                              <div className="mt-1 overflow-hidden h-2 text-xs flex rounded bg-secondary">
                                <div
                                  style={{ width: `${(skill.targetLevel / 5) * 100}%` }}
                                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                                ></div>
                              </div>
                            </div>
                          </div>
                          
                          <h5 className="text-sm font-medium mb-2">Recommended Resources:</h5>
                          <ul className="list-disc pl-5 text-sm">
                            {skill.resources.map((resource, ridx) => (
                              <li key={ridx}>{resource}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="skills-to-acquire">
                <AccordionTrigger className="font-semibold">
                  New Skills to Acquire
                </AccordionTrigger>
                <AccordionContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-4">
                      {report.developmentPlan?.skillsToAcquire?.map((skill, idx) => (
                        <div key={idx} className="border border-border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">{skill.skill}</h4>
                            <div className="text-sm text-muted-foreground">
                              {skill.timeframe}
                            </div>
                          </div>
                          
                          <p className="text-sm mb-3">{skill.reason}</p>
                          
                          <h5 className="text-sm font-medium mb-2">Recommended Resources:</h5>
                          <ul className="list-disc pl-5 text-sm">
                            {skill.resources.map((resource, ridx) => (
                              <li key={ridx}>{resource}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>

          {/* Educational Programs */}
          <motion.div
            ref={(el) => (sectionRefs.current.educationalPrograms = el)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-xl shadow-md p-6 border border-border/50"
          >
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
              <GraduationCap className="mr-2 h-5 w-5" /> Educational Programs
            </h2>
            
            <div className="mb-6">
              <p className="text-muted-foreground">{report.educationalPrograms?.introduction}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Recommended Programs</h3>
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    {report.educationalPrograms?.recommendedPrograms?.map((program, idx) => (
                      <div key={idx} className="border border-border rounded-lg p-4">
                        <h4 className="font-semibold mb-1">{program.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">by {program.provider}</p>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <span className="text-xs font-medium block">Duration</span>
                            <span className="text-sm">{program.duration}</span>
                          </div>
                          <div>
                            <span className="text-xs font-medium block">Format</span>
                            <span className="text-sm">{program.format}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm mb-3">{program.description}</p>
                        
                        <h5 className="text-xs font-medium mb-1">Skills Covered:</h5>
                        <div className="flex flex-wrap gap-1">
                          {program.skillsCovered.map((skill, sidx) => (
                            <span key={sidx} className="px-2 py-1 bg-secondary text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Suggested Projects</h3>
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    {report.educationalPrograms?.suggestedProjects?.map((project, idx) => (
                      <div key={idx} className="border border-border rounded-lg p-4">
                        <h4 className="font-semibold mb-1">{project.title}</h4>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div>
                            <span className="text-xs font-medium block">Difficulty</span>
                            <span className="text-sm">{project.difficultyLevel}</span>
                          </div>
                          <div>
                            <span className="text-xs font-medium block">Est. Time</span>
                            <span className="text-sm">{project.completionTime}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm mb-3">{project.description}</p>
                        
                        <h5 className="text-xs font-medium mb-1">Skills Developed:</h5>
                        <div className="flex flex-wrap gap-1">
                          {project.skillsDeveloped.map((skill, sidx) => (
                            <span key={sidx} className="px-2 py-1 bg-secondary text-xs rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </motion.div>

          {/* Learning Roadmap */}
          <motion.div
            ref={(el) => (sectionRefs.current.learningRoadmap = el)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-xl shadow-md p-6 border border-border/50"
          >
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5" /> Learning Roadmap
            </h2>
            
            <div className="mb-6">
              <p className="text-muted-foreground">{report.learningRoadmap?.roadmapOverview}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Learning Phases</h3>
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {report.learningRoadmap?.learningPhases?.map((phase, idx) => (
                      <div key={idx} className="border border-border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{phase.phase}</h4>
                        
                        <h5 className="text-sm font-medium mb-1">Focus Areas:</h5>
                        <ul className="list-disc pl-5 mb-3 text-sm">
                          {phase.focusAreas.map((area, index) => (
                            <li key={index}>{area}</li>
                          ))}
                        </ul>
                        
                        <h5 className="text-sm font-medium mb-1">Key Resources:</h5>
                        <ul className="list-disc pl-5 text-sm">
                          {phase.keyResources.map((resource, index) => (
                            <li key={index}>{resource}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Skills Progression</h3>
                <ScrollArea className="h-80">
                  <div className="space-y-4">
                    {report.learningRoadmap?.skillsProgression?.map((skill, sidx) => (
                      <div key={sidx} className="border border-border rounded-lg p-4">
                        <h4 className="font-semibold mb-2">{skill.skill}</h4>
                        <p className="text-sm mb-3">Progression: {skill.startLevel} → {skill.targetLevel}</p>
                        
                        <h5 className="text-sm font-medium mb-1">Milestones:</h5>
                        <div className="space-y-2">
                          {skill.milestones.map((milestone, midx) => (
                            <div key={midx} className="bg-secondary/30 p-2 rounded">
                              <div className="text-sm font-medium">Level {milestone.level}</div>
                              <ul className="list-disc pl-5 text-xs">
                                {milestone.achievements.map((achievement, i) => (
                                  <li key={i}>{achievement}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </motion.div>

          {/* Similar Roles */}
          <motion.div
            ref={(el) => (sectionRefs.current.similarRoles = el)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-xl shadow-md p-6 border border-border/50"
          >
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
              <Users className="mr-2 h-5 w-5" /> Similar Roles
            </h2>
            
            <div className="mb-6">
              <p className="text-muted-foreground">{report.similarRoles?.introduction}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {report.similarRoles?.roles?.map((role, idx) => (
                <div key={idx} className="border border-border rounded-lg p-4">
                  <div className="flex flex-wrap justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold">{role.title}</h3>
                      <div className="flex items-center mt-1">
                        <span className="text-sm mr-2">Similarity Score:</span>
                        <Progress 
                          value={role.similarityScore} 
                          className="w-24 h-2" 
                        />
                        <span className="text-sm ml-2">{role.similarityScore}%</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Average Salary</div>
                      <div className="text-lg font-bold text-primary">{role.averageSalary}</div>
                      <div className="text-xs text-muted-foreground">Growth: {role.growthPotential}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Responsibilities:</h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {role.keyResponsibilities.map((req, ridx) => (
                          <li key={ridx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Required Skills:</h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {role.requiredSkills.map((skill, index) => (
                          <li key={index}>{skill}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Pros:</h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {role.prosAndCons.pros.map((pro, index) => (
                          <li key={index}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Cons:</h4>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {role.prosAndCons.cons.map((con, index) => (
                          <li key={index}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Tips */}
          <motion.div
            ref={(el) => (sectionRefs.current.quickTips = el)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-xl shadow-md p-6 border border-border/50"
          >
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
              <Lightbulb className="mr-2 h-5 w-5" /> Quick Tips
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-secondary/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-primary">Daily Learning Tips</h3>
                <ul className="space-y-2">
                  {report.quickTips?.dailyLearningTips?.map((tip, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="inline-flex mr-2 mt-1 bg-primary/20 text-primary text-xs w-5 h-5 rounded-full items-center justify-center">{idx + 1}</span>
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-secondary/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-primary">Interview Preparation</h3>
                <ul className="space-y-2">
                  {report.quickTips?.interviewPreparationTips?.map((tip, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="inline-flex mr-2 mt-1 bg-primary/20 text-primary text-xs w-5 h-5 rounded-full items-center justify-center">{idx + 1}</span>
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-secondary/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-primary">Networking Recommendations</h3>
                <ul className="space-y-2">
                  {report.quickTips?.networkingRecommendations?.map((tip, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="inline-flex mr-2 mt-1 bg-primary/20 text-primary text-xs w-5 h-5 rounded-full items-center justify-center">{idx + 1}</span>
                      <span className="text-sm">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Growth Trajectory */}
          <motion.div
            ref={(el) => (sectionRefs.current.growthTrajectory = el)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-xl shadow-md p-6 border border-border/50"
          >
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
              <Trophy className="mr-2 h-5 w-5" /> Growth Trajectory
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Short-Term Goals</h3>
                <p className="text-sm mb-3 text-muted-foreground">{report.growthTrajectory?.shortTermGoals?.timeframe}</p>
                
                <h4 className="text-sm font-medium mb-1">Goals:</h4>
                <ul className="list-disc pl-5 text-sm mb-3">
                  {report.growthTrajectory?.shortTermGoals?.goals.map((goal, idx) => (
                    <li key={idx}>{goal}</li>
                  ))}
                </ul>
                
                <h4 className="text-sm font-medium mb-1">Success Metrics:</h4>
                <ul className="list-disc pl-5 text-sm">
                  {report.growthTrajectory?.shortTermGoals?.metrics.map((goal, idx) => (
                    <li key={idx}>{goal}</li>
                  ))}
                </ul>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Medium-Term Goals</h3>
                <p className="text-sm mb-3 text-muted-foreground">{report.growthTrajectory?.mediumTermGoals?.timeframe}</p>
                
                <h4 className="text-sm font-medium mb-1">Goals:</h4>
                <ul className="list-disc pl-5 text-sm mb-3">
                  {report.growthTrajectory?.mediumTermGoals?.goals.map((goal, idx) => (
                    <li key={idx}>{goal}</li>
                  ))}
                </ul>
                
                <h4 className="text-sm font-medium mb-1">Success Metrics:</h4>
                <ul className="list-disc pl-5 text-sm">
                  {report.growthTrajectory?.mediumTermGoals?.metrics.map((goal, idx) => (
                    <li key={idx}>{goal}</li>
                  ))}
                </ul>
              </div>
              
              <div className="border border-border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Long-Term Goals</h3>
                <p className="text-sm mb-3 text-muted-foreground">{report.growthTrajectory?.longTermGoals?.timeframe}</p>
                
                <h4 className="text-sm font-medium mb-1">Goals:</h4>
                <ul className="list-disc pl-5 text-sm mb-3">
                  {report.growthTrajectory?.longTermGoals?.goals.map((goal, idx) => (
                    <li key={idx}>{goal}</li>
                  ))}
                </ul>
                
                <h4 className="text-sm font-medium mb-1">Success Metrics:</h4>
                <ul className="list-disc pl-5 text-sm">
                  {report.growthTrajectory?.longTermGoals?.metrics.map((goal, idx) => (
                    <li key={idx}>{goal}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Potential Salary Progression</h3>
              
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartLineChart
                    data={formatSalaryProgressionData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="stage" />
                    <YAxis 
                      tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <RechartsTooltip 
                      formatter={(value) => [`$${value.toLocaleString()}`, 'Salary']}
                      labelFormatter={(value) => `${value} (${formatSalaryProgressionData().find(item => item.stage === value)?.timeframe})`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="salary" 
                      stroke="#1C3B82" 
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </RechartLineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Career Stage</TableHead>
                      <TableHead>Timeframe</TableHead>
                      <TableHead className="text-right">Salary Range</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.growthTrajectory?.potentialSalaryProgression?.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{item.stage}</TableCell>
                        <TableCell>{item.timeframe}</TableCell>
                        <TableCell className="text-right font-semibold">{item.salary}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </motion.div>

          {/* Learning Path Roadmap */}
          <motion.div
            ref={(el) => (sectionRefs.current.learningPathRoadmap = el)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-xl shadow-md p-6 border border-border/50"
          >
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center">
              <LineChart className="mr-2 h-5 w-5" /> Learning Path Roadmap
            </h2>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Timeline</h3>
              <ol className="relative border-l border-primary/30">
                {report.learningPathRoadmap?.timelineData?.map((milestone, index) => (
                  <li key={index} className="mb-6 ml-6">
                    <span className="flex absolute -left-3 justify-center items-center w-6 h-6 bg-primary rounded-full ring-8 ring-card">
                      {index + 1}
                    </span>
                    <h4 className="flex items-center font-semibold">
                      {milestone.milestone}
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium ml-2 px-2.5 py-0.5 rounded">
                        {milestone.timeframe}
                      </span>
                    </h4>
                    <p className="text-sm text-muted-foreground">{milestone.description}</p>
                  </li>
                ))}
              </ol>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Skill Focus Areas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report.learningPathRoadmap?.skillFocus?.map((skill, idx) => (
                  <div 
                    key={idx} 
                    className={`border rounded-lg p-4 ${
                      skill.priority === 'High' 
                        ? 'border-red-200 bg-red-50' 
                        : skill.priority === 'Medium'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-green-200 bg-green-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">{skill.skill}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        skill.priority === 'High' 
                          ? 'bg-red-100 text-red-800' 
                          : skill.priority === 'Medium' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {skill.priority} Priority
                      </span>
                    </div>
                    
                    <h5 className="text-sm font-medium mb-2">Learning Resources:</h5>
                    <div className="space-y-2">
                      {skill.resources.map((resource, idx) => (
                        <div key={idx} className="bg-white/50 rounded p-2 text-sm">
                          <div className="font-medium">{resource.name}</div>
                          <div className="text-xs text-muted-foreground mb-1">Type: {resource.type}</div>
                          <a 
                            href={resource.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            {resource.url}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}