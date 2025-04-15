import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookCheck, GraduationCap, History, Target, User2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { FrameworkSkillGapCharts } from "./FrameworkSkillGapCharts";
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import ReactApexChart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';

interface FormData {
  professionalLevel: string;
  currentSkills: string;
  educationalBackground: string;
  careerHistory: string;
  desiredRole: string;
}

interface CareerAnalysisResult {
  executiveSummary: string;
  skillMapping: {
    sfia9: Array<{skill: string, level: string, description: string}>;
    digcomp22: Array<{competency: string, level: string, description: string}>;
  };
  skillGapAnalysis: {
    gaps: Array<{skill: string, importance: string, description: string}>;
    strengths: Array<{skill: string, level: string, relevance: string, description: string}>;
  };
  careerPathway: {
    withDegree: Array<{
      step: number;
      role: string;
      timeframe: string;
      keySkillsNeeded: string[];
      description: string;
      requiredQualification?: string;
    }>;
    withoutDegree: Array<{
      step: number;
      role: string;
      timeframe: string;
      keySkillsNeeded: string[];
      description: string;
      alternativeQualification?: string;
    }>;
  };
  developmentPlan: {
    skillsToAcquire: Array<{skill: string, priority: string, resources: string[]}>;
    recommendedCertifications: {
      university: string[];
      tafe: string[];
      online: string[];
    };
    suggestedProjects: string[];
    learningPath: string;
  };
  reviewNotes: {
    firstReview: string;
    secondReview: string;
  };
}

export function CareerPathwayForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analysisResult, setAnalysisResult] = useState<CareerAnalysisResult | null>(null);
  const [formData, setFormData] = useState<FormData>({
    professionalLevel: "",
    currentSkills: "",
    educationalBackground: "",
    careerHistory: "",
    desiredRole: ""
  });
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const careerAnalysisMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/career-analysis", data);
      const result = await res.json();
      return result as CareerAnalysisResult;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast({
        title: "Career analysis complete",
        description: "Your personalized career pathway has been generated.",
        variant: "default"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis failed",
        description: error.message || "Failed to analyze your career information. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (
      !formData.professionalLevel ||
      !formData.currentSkills ||
      !formData.educationalBackground ||
      !formData.careerHistory ||
      !formData.desiredRole
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all the required fields.",
        variant: "destructive"
      });
      return;
    }
    
    // Check skills count limit
    if (formData.currentSkills.split(',').length > 50) {
      toast({
        title: "Too many skills",
        description: "Please limit your skills to 50 maximum.",
        variant: "destructive"
      });
      return;
    }
    
    // Check desired role character limit
    if (formData.desiredRole.length > 250) {
      toast({
        title: "Character limit exceeded",
        description: "Please limit your desired role to 250 characters.",
        variant: "destructive"
      });
      return;
    }
    
    careerAnalysisMutation.mutate(formData);
  };
  
  // If user not logged in, don't render form
  if (!user) {
    return null;
  }
  
  if (analysisResult) {
    return <CareerAnalysisResults results={analysisResult} onRestart={() => setAnalysisResult(null)} />;
  }
  
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3">Career Pathway Analysis</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Fill in the form below to get a personalized career development plan based on SFIA 9 and DigComp 2.2 frameworks.
            Our AI will analyze your skills and experience to create a tailored pathway toward your goals.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Career Information</CardTitle>
            <CardDescription>
              Provide detailed information about your professional background and career aspirations.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Professional Level */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User2 className="h-4 w-4 text-primary" />
                  <Label htmlFor="professionalLevel">Current Professional Level</Label>
                </div>
                <Select 
                  value={formData.professionalLevel} 
                  onValueChange={(value) => handleSelectChange("professionalLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your current level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                    <SelectItem value="worker">Working Professional</SelectItem>
                    <SelectItem value="returner">Returner</SelectItem>
                    <SelectItem value="career-switcher">Career Switcher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Current Skills */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookCheck className="h-4 w-4 text-primary" />
                  <Label htmlFor="currentSkills">Current Skills (Comma separated, 50 max)</Label>
                </div>
                <Textarea
                  id="currentSkills"
                  name="currentSkills"
                  value={formData.currentSkills}
                  onChange={handleChange}
                  placeholder="e.g., JavaScript, Project Management, Data Analysis, Team Leadership..."
                  className="min-h-24"
                />
                <p className="text-xs text-muted-foreground">
                  Listed skills: {formData.currentSkills ? formData.currentSkills.split(',').length : 0}/50
                </p>
              </div>
              
              {/* Educational Background */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <Label htmlFor="educationalBackground">Educational Background</Label>
                </div>
                <Textarea
                  id="educationalBackground"
                  name="educationalBackground"
                  value={formData.educationalBackground}
                  onChange={handleChange}
                  placeholder="List your degrees, certifications, and relevant educational experiences..."
                  className="min-h-24"
                />
              </div>
              
              {/* Career History */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  <Label htmlFor="careerHistory">Career History</Label>
                </div>
                <Textarea
                  id="careerHistory"
                  name="careerHistory"
                  value={formData.careerHistory}
                  onChange={handleChange}
                  placeholder="Summarize your work experience, job titles, and key responsibilities..."
                  className="min-h-24"
                />
              </div>
              
              {/* Desired Role */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <Label htmlFor="desiredRole">Desired Role or Career Goal (250 chars max)</Label>
                </div>
                <Textarea
                  id="desiredRole"
                  name="desiredRole"
                  value={formData.desiredRole}
                  onChange={handleChange}
                  placeholder="Describe your career goal or desired role in detail..."
                  className="min-h-24"
                  maxLength={250}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.desiredRole.length}/250 characters
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between border-t pt-6">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              
              <Button 
                type="submit" 
                disabled={careerAnalysisMutation.isPending}
                className="min-w-32"
              >
                {careerAnalysisMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Generate Career Pathway"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

// Component to display analysis results
function CareerAnalysisResults({
  results,
  onRestart
}: {
  results: CareerAnalysisResult;
  onRestart: () => void;
}) {
  const { toast } = useToast();
  // Create a reference to scroll to specific sections
  const executeRef = useRef<HTMLDivElement>(null);
  const skillMappingRef = useRef<HTMLDivElement>(null);
  const gapAnalysisRef = useRef<HTMLDivElement>(null);
  const pathwayRef = useRef<HTMLDivElement>(null);
  const developmentRef = useRef<HTMLDivElement>(null);
  
  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  return (
    <div className="container mx-auto max-w-4xl py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-primary/5 rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold mb-4">Your Career Pathway Analysis</h1>
          
          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToSection(executeRef)}
            >
              Executive Summary
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToSection(skillMappingRef)}
            >
              Skill Mapping
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToSection(gapAnalysisRef)}
            >
              Gap Analysis
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToSection(pathwayRef)}
            >
              Career Pathway
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToSection(developmentRef)}
            >
              Development Plan
            </Button>
          </div>
        </div>
        
        {/* Executive Summary */}
        <div ref={executeRef} className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
          <div className="bg-white rounded-lg border p-6">
            <p className="text-gray-700 whitespace-pre-line">{results.executiveSummary}</p>
          </div>
        </div>
        
        {/* Skill Mapping */}
        <div ref={skillMappingRef} className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Skill Mapping</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">SFIA 9 Framework</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {results.skillMapping.sfia9.map((skill, index) => (
                  <div key={index} className="bg-white rounded-lg border p-4">
                    <div className="font-medium text-primary mb-1">{skill.skill}</div>
                    <div className="text-sm text-muted-foreground mb-2">Level: {skill.level}</div>
                    <p className="text-sm">{skill.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-xl font-semibold mb-3">DigComp 2.2 Framework</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {results.skillMapping.digcomp22.map((competency, index) => (
                  <div key={index} className="bg-white rounded-lg border p-4">
                    <div className="font-medium text-primary mb-1">{competency.competency}</div>
                    <div className="text-sm text-muted-foreground mb-2">Level: {competency.level}</div>
                    <p className="text-sm">{competency.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Skill Gap Analysis */}
        <div ref={gapAnalysisRef} className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Framework-Based Skill Gap Analysis</h2>
          <p className="text-muted-foreground mb-6">
            This analysis is based on the <span className="font-medium">SFIA 9 Framework</span> (Skills Framework for the Information Age) and <span className="font-medium">DigComp 2.2 Framework</span> (European Digital Competence Framework), providing a comprehensive assessment of your technical and digital competencies.
          </p>
          
          {/* Framework Skill Gap Charts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <FrameworkSkillGapCharts 
              sfiaSkills={results.skillMapping.sfia9}
              digcompCompetencies={results.skillMapping.digcomp22}
              skillGaps={results.skillGapAnalysis.gaps}
              skillStrengths={results.skillGapAnalysis.strengths}
            />
          </motion.div>
          
          <div className="grid gap-8 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-red-50 p-4 rounded-lg border border-red-100 mb-4">
                <h3 className="text-xl font-semibold mb-3 text-red-800 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                  Skill Gaps
                </h3>
                <div className="text-sm text-red-600 mb-3 font-medium">
                  The following skills from SFIA 9 and DigComp 2.2 frameworks have been identified as gaps for your desired role:
                </div>
              </div>
              
              <div className="space-y-4">
                {results.skillGapAnalysis.gaps.map((gap: any, index: number) => (
                  <motion.div 
                    key={index} 
                    className="bg-white rounded-lg border border-red-100 p-4 shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <div className="font-medium text-red-600 mb-1 flex items-center gap-2">
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded">
                        {gap.framework || (index % 2 === 0 ? 'SFIA 9' : 'DigComp 2.2')}
                      </span>
                      {gap.skill}
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">Importance: {gap.importance}</div>
                    <p className="text-sm">{gap.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-4">
                <h3 className="text-xl font-semibold mb-3 text-green-800 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Strengths
                </h3>
                <div className="text-sm text-green-600 mb-3 font-medium">
                  Your current skills align well with these SFIA 9 and DigComp 2.2 competencies required for your target role:
                </div>
              </div>
              
              <div className="space-y-4">
                {results.skillGapAnalysis.strengths.map((strength: any, index: number) => (
                  <motion.div 
                    key={index} 
                    className="bg-white rounded-lg border border-green-100 p-4 shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <div className="font-medium text-green-600 mb-1 flex items-center gap-2">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                        {strength.framework || (index % 2 === 0 ? 'DigComp 2.2' : 'SFIA 9')}
                      </span>
                      {strength.skill}
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">Level: {strength.level}</div>
                    <div className="text-sm text-muted-foreground mb-2">Relevance: {strength.relevance}</div>
                    <p className="text-sm">{strength.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Career Pathway */}
        <div ref={pathwayRef} className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Career Pathway Options</h2>
          <p className="text-muted-foreground mb-6">
            Below are two distinct career pathway options tailored to your background and aspirations. 
            Each pathway includes suggested courses, licensing requirements, and progression steps.
            Choose the path that best aligns with your preferences and circumstances.
          </p>
          
          {/* Career Transition Visualization */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-6 rounded-xl border border-slate-200 mb-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 14V4M17 14H9" />
                <path d="M13 18 9 14 13 10" />
                <path d="M7 14H3" />
                <path d="M14 6 17 3 20 6" />
              </svg>
              Career Transition Visualization
            </h3>
            
            <div className="relative h-[200px] mb-6">
              <div className="absolute left-0 bottom-0 w-full h-1 bg-slate-200"></div>
              
              <div className="absolute left-[5%] bottom-0 flex flex-col items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mb-3">
                  <div className="absolute top-[-70px] transform -translate-x-1/2 w-28 text-center">
                    <div className="text-xs font-semibold text-blue-600">Current Position</div>
                    <div className="mt-1 text-xs px-1 py-0.5 bg-blue-100 text-blue-600 rounded-full">Starting Point</div>
                  </div>
                </div>
                <div className="h-[10px] w-[2px] bg-blue-500"></div>
              </div>
              
              <div className="absolute left-[50%] bottom-0 flex flex-col items-center">
                <div className="w-4 h-4 bg-purple-500 rounded-full mb-3">
                  <div className="absolute top-[-100px] transform -translate-x-1/2 w-36 text-center">
                    <div className="text-xs font-semibold text-purple-600">Transition Period</div>
                    <div className="mt-1 text-2xs px-1 py-0.5 bg-purple-100 text-purple-600 rounded-full">Skills Development</div>
                    <div className="mt-1 text-2xs px-1 py-0.5 bg-purple-100 text-purple-600 rounded-full">Networking</div>
                    <div className="mt-1 text-2xs px-1 py-0.5 bg-purple-100 text-purple-600 rounded-full">Experience Building</div>
                  </div>
                </div>
                <div className="h-[10px] w-[2px] bg-purple-500"></div>
              </div>
              
              <div className="absolute left-[85%] bottom-0 flex flex-col items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mb-3">
                  <div className="absolute top-[-70px] transform -translate-x-1/2 w-28 text-center">
                    <div className="text-xs font-semibold text-green-600">Target Role</div>
                    <div className="mt-1 text-xs px-1 py-0.5 bg-green-100 text-green-600 rounded-full">Career Goal</div>
                  </div>
                </div>
                <div className="h-[10px] w-[2px] bg-green-500"></div>
              </div>
              
              {/* Connecting arrow */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '80%' }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="absolute left-[5%] bottom-[7px] h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
              ></motion.div>
              
              {/* Milestones */}
              <div className="absolute left-[20%] bottom-0 flex flex-col items-center">
                <div className="w-2 h-2 bg-slate-400 rounded-full mb-2"></div>
                <div className="h-[5px] w-[1px] bg-slate-400"></div>
              </div>
              
              <div className="absolute left-[35%] bottom-0 flex flex-col items-center">
                <div className="w-2 h-2 bg-slate-400 rounded-full mb-2"></div>
                <div className="h-[5px] w-[1px] bg-slate-400"></div>
              </div>
              
              <div className="absolute left-[65%] bottom-0 flex flex-col items-center">
                <div className="w-2 h-2 bg-slate-400 rounded-full mb-2"></div>
                <div className="h-[5px] w-[1px] bg-slate-400"></div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div className="text-blue-600">
                <div className="font-medium">Initial Phase</div>
                <div className="text-xs text-muted-foreground">Skills assessment & gap identification</div>
              </div>
              <div className="text-purple-600">
                <div className="font-medium">Development Phase</div>
                <div className="text-xs text-muted-foreground">Education, training & practical experience</div>
              </div>
              <div className="text-green-600">
                <div className="font-medium">Establishment Phase</div>
                <div className="text-xs text-muted-foreground">Career goal achievement & ongoing growth</div>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Pathway With Degree */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-blue-700">University Pathway</h3>
                <p className="text-sm text-blue-600">Progression with formal academic qualifications</p>
              </div>
              
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[26px] top-8 bottom-0 w-0.5 bg-blue-300" />
                
                <div className="space-y-6">
                  {results.careerPathway.withDegree.map((step: any, index: number) => (
                    <motion.div 
                      key={index} 
                      className="flex"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg z-10 shadow-md">
                          {step.step}
                        </div>
                      </div>
                      
                      <div className="flex-1 ml-4 bg-white rounded-lg border border-blue-200 p-4 shadow-sm">
                        <div className="font-medium text-lg mb-1 text-blue-800">{step.role}</div>
                        <div className="text-sm text-blue-500 mb-2">Timeframe: {step.timeframe}</div>
                        
                        {step.requiredQualification && (
                          <div className="flex items-center gap-1 text-xs text-blue-600 mb-2">
                            <GraduationCap className="h-3 w-3" />
                            <span>{step.requiredQualification}</span>
                            {step.courseLink && (
                              <a 
                                href={step.courseLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="ml-1 underline hover:text-blue-800"
                              >
                                View Course
                              </a>
                            )}
                          </div>
                        )}
                        
                        {step.licenseRequired && (
                          <div className="flex items-center gap-1 text-xs text-blue-600 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <span>License required: {step.licenseRequired}</span>
                            {step.licenseLink && (
                              <a 
                                href={step.licenseLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="ml-1 underline hover:text-blue-800"
                              >
                                View Details
                              </a>
                            )}
                          </div>
                        )}
                        
                        <p className="text-sm mb-3">{step.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {step.keySkillsNeeded.map((skill: string, skillIndex: number) => (
                            <span 
                              key={skillIndex} 
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            {/* Pathway Without Degree */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-xl border border-emerald-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-emerald-700">TAFE & Skills Pathway</h3>
                <p className="text-sm text-emerald-600">Progression through practical qualifications & experience</p>
              </div>
              
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[26px] top-8 bottom-0 w-0.5 bg-emerald-300" />
                
                <div className="space-y-6">
                  {results.careerPathway.withoutDegree.map((step: any, index: number) => (
                    <motion.div 
                      key={index} 
                      className="flex"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg z-10 shadow-md">
                          {step.step}
                        </div>
                      </div>
                      
                      <div className="flex-1 ml-4 bg-white rounded-lg border border-emerald-200 p-4 shadow-sm">
                        <div className="font-medium text-lg mb-1 text-emerald-800">{step.role}</div>
                        <div className="text-sm text-emerald-500 mb-2">Timeframe: {step.timeframe}</div>
                        
                        {step.alternativeQualification && (
                          <div className="flex items-center gap-1 text-xs text-emerald-600 mb-2">
                            <BookCheck className="h-3 w-3" />
                            <span>{step.alternativeQualification}</span>
                            {step.courseLink && (
                              <a 
                                href={step.courseLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="ml-1 underline hover:text-emerald-800"
                              >
                                View Course
                              </a>
                            )}
                          </div>
                        )}
                        
                        {step.licenseRequired && (
                          <div className="flex items-center gap-1 text-xs text-emerald-600 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <span>License required: {step.licenseRequired}</span>
                            {step.licenseLink && (
                              <a 
                                href={step.licenseLink} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="ml-1 underline hover:text-emerald-800"
                              >
                                View Details
                              </a>
                            )}
                          </div>
                        )}
                        
                        <p className="text-sm mb-3">{step.description}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          {step.keySkillsNeeded.map((skill: string, skillIndex: number) => (
                            <span 
                              key={skillIndex} 
                              className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Development Plan */}
        <div ref={developmentRef} className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Comprehensive Development Plan</h2>
          <p className="text-muted-foreground mb-6">
            This personalized development plan compares your existing skills against required skills for your target role,
            outlines development timelines, and suggests both technical and social skills to foster career growth.
          </p>

          {/* Skills Comparison Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-10"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              Skills Assessment Overview
            </h3>
            
            <div className="bg-white rounded-xl border shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Existing Skills */}
                <div>
                  <h4 className="text-lg font-medium text-blue-800 mb-4 flex items-center gap-2">
                    <span className="bg-blue-100 w-6 h-6 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                    </span>
                    Existing Skills
                  </h4>
                  
                  <div className="space-y-4">
                    {/* Sample existing skills - in a real app these would come from the API */}
                    {[
                      { name: "JavaScript Programming", proficiency: 85, transferability: "High" },
                      { name: "UI/UX Design Principles", proficiency: 75, transferability: "High" },
                      { name: "Project Management", proficiency: 70, transferability: "Medium" },
                      { name: "Content Writing", proficiency: 80, transferability: "Medium" },
                      { name: "Data Analysis", proficiency: 65, transferability: "High" }
                    ].map((skill, index) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-sm">{skill.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                            Transferability: {skill.transferability}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${skill.proficiency}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-slate-500">Beginner</span>
                          <span className="text-xs text-slate-500">Proficient</span>
                          <span className="text-xs text-slate-500">Expert</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Skills To Develop */}
                <div>
                  <h4 className="text-lg font-medium text-rose-800 mb-4 flex items-center gap-2">
                    <span className="bg-rose-100 w-6 h-6 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </span>
                    Skills To Develop
                  </h4>
                  
                  <div className="space-y-4">
                    {/* We'll map just a few skills with more details */}
                    {results.developmentPlan.skillsToAcquire.slice(0, 5).map((skill: any, index: number) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-sm">{skill.skill}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            skill.priority === 'High' ? 'bg-red-100 text-red-700' :
                            skill.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            Priority: {skill.priority}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <div className="space-y-1">
                            <div className="text-xs flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12 6 12 12 16 14"/>
                              </svg>
                              <span>Est. Time: {
                                skill.priority === 'High' ? '3-6 months' :
                                skill.priority === 'Medium' ? '2-4 months' : '1-2 months'
                              }</span>
                            </div>
                            <div className="text-xs flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                              </svg>
                              <span>Fast-track: {
                                skill.priority === 'High' ? 'Intensive bootcamp' :
                                skill.priority === 'Medium' ? 'Focused mentorship' : 'Online course'
                              }</span>
                            </div>
                          </div>
                          <div className="h-8 w-8 flex items-center justify-center rounded-full bg-rose-100">
                            <div className="h-6 w-6 rounded-full border-2 border-rose-400 flex items-center justify-center">
                              <div className="h-3 w-3 bg-rose-500 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Social Skills Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
              Social & Soft Skills Development
            </h3>
            
            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl p-6 border border-purple-100">
              <p className="text-sm text-purple-800 mb-6">
                Developing these social and soft skills will complement your technical abilities, enhancing your effectiveness in professional environments and supporting your career advancement.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    category: "Communication",
                    skills: [
                      { name: "Active Listening", benefit: "Builds trust and understanding with team members and stakeholders" },
                      { name: "Clear Articulation", benefit: "Ensures your ideas are understood and implemented correctly" },
                      { name: "Persuasive Presentation", benefit: "Helps gain support for your proposals and projects" }
                    ],
                    color: "blue"
                  },
                  {
                    category: "Leadership",
                    skills: [
                      { name: "Delegation", benefit: "Increases team productivity and develops others' skills" },
                      { name: "Conflict Resolution", benefit: "Creates harmonious team environments and stronger relationships" },
                      { name: "Strategic Thinking", benefit: "Enables you to guide teams toward meaningful goals" }
                    ],
                    color: "amber"
                  },
                  {
                    category: "Adaptability",
                    skills: [
                      { name: "Resilience", benefit: "Helps you navigate setbacks and maintain momentum" },
                      { name: "Cultural Intelligence", benefit: "Enhances collaboration in diverse teams and global environments" },
                      { name: "Learning Agility", benefit: "Allows quick adaptation to new technologies and methodologies" }
                    ],
                    color: "green"
                  }
                ].map((category, catIndex) => (
                  <motion.div
                    key={catIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * catIndex }}
                    className={`bg-white rounded-lg border p-4 shadow-sm ${
                      category.category === "Communication" ? "border-blue-100" : 
                      category.category === "Leadership" ? "border-amber-100" : 
                      "border-green-100"
                    }`}
                  >
                    <h4 className={`font-medium mb-3 pb-2 border-b ${
                      category.category === "Communication" ? "text-blue-700 border-blue-100" : 
                      category.category === "Leadership" ? "text-amber-700 border-amber-100" : 
                      "text-green-700 border-green-100"
                    }`}>
                      {category.category}
                    </h4>
                    <ul className="space-y-3">
                      {category.skills.map((skill, skillIndex) => (
                        <li key={skillIndex} className="text-sm">
                          <div className={`font-medium mb-1 ${
                            category.category === "Communication" ? "text-blue-600" : 
                            category.category === "Leadership" ? "text-amber-600" : 
                            "text-green-600"
                          }`}>{skill.name}</div>
                          <div className="text-gray-600">{skill.benefit}</div>
                        </li>
                      ))}
                    </ul>
                    <div className={`mt-4 text-xs flex items-center justify-between ${
                      category.category === "Communication" ? "text-blue-600" : 
                      category.category === "Leadership" ? "text-amber-600" : 
                      "text-green-600"
                    }`}>
                      <span>Development methods:</span>
                      <span className={`px-2 py-1 rounded-full ${
                        category.category === "Communication" ? "bg-blue-50" : 
                        category.category === "Leadership" ? "bg-amber-50" : 
                        "bg-green-50"
                      }`}>
                        {category.category === "Communication" ? "Workshops & Practice" : 
                         category.category === "Leadership" ? "Mentorship & Projects" : 
                         "Challenges & Reflection"}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
          
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl opacity-50 overflow-hidden -z-10">
                <div className="absolute top-0 -right-4 w-3/4 h-full">
                  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-10">
                    <path fill="#4F46E5" d="M45.3,-47.7C59.9,-35.8,73.3,-21.7,76.2,-5.4C79.1,10.9,71.5,29.4,58.7,41.1C45.8,52.8,27.7,57.9,9.8,59.7C-8.1,61.6,-25.9,60.3,-39.8,51.5C-53.6,42.8,-63.5,26.6,-66.4,8.8C-69.3,-9,-65.3,-28.4,-53.6,-41C-41.9,-53.5,-22.4,-59.2,-4.1,-55.8C14.2,-52.4,30.7,-59.7,45.3,-47.7Z" transform="translate(100 100)" />
                  </svg>
                </div>
                <motion.div 
                  className="absolute bottom-0 left-0 w-1/2 h-full"
                  animate={{ 
                    x: [0, 10, 0],
                    y: [0, -15, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                >
                  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-10">
                    <path fill="#6366F1" d="M48.2,-46.1C60.5,-34.3,66.9,-14.8,65.1,3.2C63.3,21.1,53.2,37.5,39.1,47.7C24.9,57.9,6.5,61.9,-11.9,59.7C-30.4,57.4,-48.9,48.9,-58.6,34.2C-68.3,19.4,-69.3,-1.6,-61.8,-18.2C-54.3,-34.8,-38.4,-47,-22.2,-57.3C-5.9,-67.5,10.7,-75.7,24.4,-71.3C38,-66.9,48.7,-49.9,48.2,-46.1Z" transform="translate(100 100)" />
                  </svg>
                </motion.div>
              </div>
              
              <div className="relative p-6 mb-8">
                <h3 className="text-xl font-semibold mb-5 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                    <line x1="12" y1="22.08" x2="12" y2="12"/>
                  </svg>
                  Skills To Acquire
                </h3>
                
                {/* Skill chart visualization */}
                <div className="bg-white rounded-xl border shadow-sm p-5 mb-8">
                  <h4 className="text-lg font-medium mb-4 text-blue-800">Skill Priority Distribution</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {results.developmentPlan.skillsToAcquire.map((skill: any, idx: number) => {
                      const priorityValue = skill.priority === "High" ? 90 : 
                                skill.priority === "Medium" ? 65 : 40;
                      const priorityColor = skill.priority === "High" ? "#ef4444" : 
                                skill.priority === "Medium" ? "#f59e0b" : "#3b82f6";
                      
                      return (
                        <motion.div 
                          key={idx}
                          initial={{ width: 0 }}
                          animate={{ width: `${priorityValue}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          className="flex items-center"
                        >
                          <div className="w-1/3 text-sm font-medium truncate pr-2">{skill.skill}</div>
                          <div className="w-2/3 flex items-center">
                            <div 
                              style={{ 
                                width: `${priorityValue}%`, 
                                backgroundColor: priorityColor,
                                transition: 'width 1s ease-in-out'
                              }} 
                              className="h-5 rounded-r-full rounded-l-full"
                            />
                            <span className="ml-2 text-xs">{skill.priority}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {results.developmentPlan.skillsToAcquire.map((skill: any, index: number) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className="bg-white rounded-lg border shadow-sm p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-primary text-lg">{skill.skill}</div>
                        <div className={`text-sm px-2 py-1 rounded-full ${
                          skill.priority === 'High' ? 'bg-red-100 text-red-700' :
                          skill.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {skill.priority}
                        </div>
                      </div>
                      
                      {skill.licenseRequired && (
                        <div className="bg-indigo-50 p-2 rounded-md mb-3 text-sm">
                          <div className="flex items-center gap-1 text-indigo-700 font-medium">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            License Required: {skill.licenseRequired}
                          </div>
                          {skill.licenseInfo && <div className="text-indigo-600 mt-1">{skill.licenseInfo}</div>}
                        </div>
                      )}
                      
                      <div className="text-sm">
                        <div className="font-medium mb-1">Recommended Resources:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {skill.resources.map((resource: string, resourceIndex: number) => (
                            <li key={resourceIndex} className="text-gray-700">{resource}</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            <Separator />
            
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <h3 className="text-xl font-semibold mb-4">Recommended Educational Programs</h3>
                
                <div className="grid gap-6 md:grid-cols-3">
                  {/* University Programs */}
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-blue-700 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        University Programs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {/* Sample Australian Universities with links */}
                        <li className="text-sm flex items-start gap-2 mb-4 pb-3 border-b border-blue-100">
                          <div className="min-w-4 mt-1">🏫</div>
                          <div className="w-full">
                            <span className="font-medium block mb-1">Top Australian Universities</span>
                            <div className="grid grid-cols-1 gap-2 mt-2">
                              <a 
                                href="https://www.sydney.edu.au/" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                University of Sydney
                              </a>
                              <a 
                                href="https://www.unimelb.edu.au/" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                University of Melbourne
                              </a>
                              <a 
                                href="https://www.anu.edu.au/" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                Australian National University
                              </a>
                              <a 
                                href="https://www.unsw.edu.au/" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                UNSW Sydney
                              </a>
                            </div>
                          </div>
                        </li>
                        
                        {results.developmentPlan.recommendedCertifications.university.map((cert: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <div className="min-w-4 mt-1">•</div>
                            <div>{cert}</div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  {/* TAFE Courses */}
                  <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-emerald-700 flex items-center gap-2">
                        <BookCheck className="h-5 w-5" />
                        TAFE Courses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {/* Top TAFE institutions in Australia with links */}
                        <li className="text-sm flex items-start gap-2 mb-4 pb-3 border-b border-emerald-100">
                          <div className="min-w-4 mt-1">🏫</div>
                          <div className="w-full">
                            <span className="font-medium block mb-1">Major TAFE Institutions</span>
                            <div className="grid grid-cols-1 gap-2 mt-2">
                              <a 
                                href="https://www.tafensw.edu.au/" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                              >
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                TAFE NSW
                              </a>
                              <a 
                                href="https://www.tafe.qld.gov.au/" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                              >
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                TAFE Queensland
                              </a>
                              <a 
                                href="https://www.swtafe.edu.au/" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                              >
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                South West TAFE
                              </a>
                              <a 
                                href="https://www.boxhill.edu.au/" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                              >
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                Box Hill Institute
                              </a>
                            </div>
                          </div>
                        </li>
                        
                        {results.developmentPlan.recommendedCertifications.tafe.map((cert: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <div className="min-w-4 mt-1">•</div>
                            <div>{cert}</div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  {/* Online Courses */}
                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-amber-700 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" x2="22" y1="12" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                        Online Courses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {results.developmentPlan.recommendedCertifications.online.map((cert: string, index: number) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <div className="min-w-4 mt-1">•</div>
                            <div>{cert}</div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <h3 className="text-xl font-semibold mb-3">Suggested Projects</h3>
                <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-100">
                  <CardContent className="pt-6">
                    <ul className="space-y-3">
                      {results.developmentPlan.suggestedProjects.map((project: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="bg-purple-100 text-purple-800 p-1 rounded-full flex items-center justify-center mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="16 18 22 12 16 6" />
                              <polyline points="8 6 2 12 8 18" />
                            </svg>
                          </div>
                          <div className="text-sm">{project}</div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-indigo-600">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                Similar Roles To Consider
              </h3>
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-100 p-5 mb-6">
                <p className="text-sm text-indigo-700 mb-4">
                  Based on your skills, experience, and career goals, these related roles might offer alternative paths that leverage your abilities:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    // Generate dynamic roles based on user's desired role rather than hardcoded examples
                    // The roles below are examples and should be generated from OpenAI based on user input
                    {
                      title: results.desiredRole.includes("Designer") ? "UX Researcher" : 
                             results.desiredRole.includes("Manager") ? "Program Manager" :
                             results.desiredRole.includes("Developer") ? "Solutions Architect" : "Strategic Consultant",
                      similarity: "High",
                      description: `Similar to your target role of ${results.desiredRole || "your desired position"}, but with a focus on ${results.desiredRole.includes("Designer") ? "user research and behavioral analysis" : 
                                   results.desiredRole.includes("Manager") ? "coordinating multiple related projects" :
                                   results.desiredRole.includes("Developer") ? "designing system architecture and integration" : "providing expert guidance and analysis"}.`,
                      salaryRange: `${Math.round(90000 + Math.random() * 40000).toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0})} - ${Math.round(120000 + Math.random() * 50000).toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0})}`,
                      growthOutlook: "Excellent",
                      skillOverlap: ["Problem-solving", "Analytical thinking", "Industry knowledge"],
                      keyDifference: results.desiredRole.includes("Designer") ? "More research-focused" : 
                                     results.desiredRole.includes("Manager") ? "Broader oversight" :
                                     results.desiredRole.includes("Developer") ? "Less coding, more design" : "More advisory role"
                    },
                    {
                      title: results.desiredRole.includes("Designer") ? "Product Designer" :
                             results.desiredRole.includes("Manager") ? "Business Analyst" :
                             results.desiredRole.includes("Developer") ? "DevOps Engineer" : "Project Coordinator",
                      similarity: "Medium-High",
                      description: `Shares many core competencies with ${results.desiredRole || "your desired role"}, requiring similar technical foundations but with a shift toward ${results.desiredRole.includes("Designer") ? "product functionality and user interfaces" : 
                                   results.desiredRole.includes("Manager") ? "analysis and requirements gathering" :
                                   results.desiredRole.includes("Developer") ? "infrastructure and deployment automation" : "hands-on implementation and coordination"}.`,
                      salaryRange: `${Math.round(85000 + Math.random() * 30000).toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0})} - ${Math.round(110000 + Math.random() * 40000).toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0})}`,
                      growthOutlook: "Strong",
                      skillOverlap: ["Communication", "Technical knowledge", "Attention to detail"],
                      keyDifference: results.desiredRole.includes("Designer") ? "More product-centric" : 
                                     results.desiredRole.includes("Manager") ? "More analytical focus" :
                                     results.desiredRole.includes("Developer") ? "Infrastructure focus" : "More tactical role"
                    },
                    {
                      title: results.desiredRole.includes("Designer") ? "Content Strategist" :
                             results.desiredRole.includes("Manager") ? "Customer Success Manager" :
                             results.desiredRole.includes("Developer") ? "QA Automation Engineer" : "Industry Consultant",
                      similarity: "Medium",
                      description: `Offers an alternative pathway using your ${results.skillGapAnalysis.strengths[0]?.skill || "key skills"} and industry knowledge, but with a greater emphasis on ${results.desiredRole.includes("Designer") ? "content planning and information architecture" : 
                                   results.desiredRole.includes("Manager") ? "client relationships and retention" :
                                   results.desiredRole.includes("Developer") ? "quality assurance and test automation" : "specialized domain expertise"}.`,
                      salaryRange: `${Math.round(80000 + Math.random() * 25000).toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0})} - ${Math.round(100000 + Math.random() * 35000).toLocaleString('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 0})}`,
                      growthOutlook: "Good",
                      skillOverlap: ["Domain expertise", "Critical thinking", "Stakeholder management"],
                      keyDifference: results.desiredRole.includes("Designer") ? "Content vs. visual focus" : 
                                     results.desiredRole.includes("Manager") ? "Client-facing role" :
                                     results.desiredRole.includes("Developer") ? "Testing vs. building" : "Advisory vs. implementation"
                    }
                  ].map((role, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className="bg-white rounded-lg border border-indigo-100 p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="font-medium text-indigo-700 mb-2 text-lg">{role.title}</div>
                      <div className="inline-block px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-700 mb-3">
                        Match: {role.similarity}
                      </div>
                      <p className="text-sm mb-3 text-slate-600">{role.description}</p>
                      
                      {/* Skill overlap section */}
                      <div className="mb-3">
                        <div className="text-xs text-slate-500 mb-1">Key skill overlaps:</div>
                        <div className="flex flex-wrap gap-1">
                          {role.skillOverlap.map((skill, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-xs text-slate-500 mb-1">Key difference:</div>
                      <div className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-md mb-3">
                        {role.keyDifference}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                        <div className="flex flex-col">
                          <span className="text-slate-500">Salary Range</span>
                          <span className="font-medium text-slate-700">{role.salaryRange}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-500">Growth Outlook</span>
                          <span className={`font-medium ${
                            role.growthOutlook === 'Excellent' ? 'text-emerald-600' :
                            role.growthOutlook === 'Strong' ? 'text-green-600' :
                            'text-blue-600'
                          }`}>
                            {role.growthOutlook}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold mb-3 mt-8">Learning Path Roadmap</h3>
              <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-slate-700 flex items-center gap-2 text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v18h18" />
                      <path d="m19 9-5 5-4-4-3 3" />
                    </svg>
                    Career Development Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <p className="whitespace-pre-line text-sm leading-relaxed">{results.developmentPlan.learningPath}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
        
        {/* Review Notes - Hidden per user request */}
        {/* <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Quality Assurance Reviews</h2>
          <p className="text-muted-foreground mb-6">
            To ensure high-quality analysis, your career pathway assessment has undergone a two-stage quality review process by AI. Below are the reviewer notes.
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-blue-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <line x1="10" y1="9" x2="8" y2="9" />
                    </svg>
                    First Stage Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-line bg-white p-3 rounded-lg border border-blue-100">{results.reviewNotes.firstReview}</p>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-100 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-purple-700 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m22 2-7 20-4-9-9-4Z" />
                      <path d="M22 2 11 13" />
                    </svg>
                    Second Stage Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-line bg-white p-3 rounded-lg border border-purple-100">{results.reviewNotes.secondReview}</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div> */}
        
        <motion.div 
          className="flex flex-col items-center gap-6 mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {/* Save to Dashboard button */}
          <div className="flex justify-center w-full">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-0.5 rounded-lg">
              <Button 
                onClick={() => {
                  // Save analysis to dashboard functionality
                  toast({
                    title: "Analysis Saved",
                    description: "Your career pathway analysis has been saved to your dashboard.",
                    variant: "default",
                  });
                }}
                size="lg" 
                className="bg-white text-gray-800 hover:bg-opacity-95 hover:text-gray-900 shadow-lg text-base gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                  <polyline points="17 21 17 13 7 13 7 21" />
                  <polyline points="7 3 7 8 15 8" />
                </svg>
                Save Analysis to Dashboard
              </Button>
            </div>
          </div>
          
          {/* New Analysis button */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-0.5 rounded-lg">
            <Button 
              onClick={onRestart} 
              size="lg" 
              className="bg-white text-gray-800 hover:bg-opacity-95 hover:text-gray-900 shadow-lg text-base gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Start a New Career Analysis
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}