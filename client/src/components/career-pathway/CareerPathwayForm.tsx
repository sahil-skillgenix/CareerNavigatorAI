/**
 * ⚠️ PROTECTED COMPONENT - DO NOT MODIFY ⚠️
 * 
 * This component is part of the Career Pathway Analysis feature which is
 * considered stable and production-ready. Any changes to this file could
 * disrupt critical functionality. See PROTECTED_FEATURES.md at project root.
 * 
 * Last modified: April 26, 2025
 */

import { useState, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  BookCheck, 
  GraduationCap, 
  History, 
  Target, 
  User2, 
  MapPin, 
  Globe, 
  Sparkles,
  LineChart as LineChartIcon,
  Laptop,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { PdfDownloader } from "./PdfDownloader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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

import { SkillRadarChart } from "./SkillRadarChart";
import { ComparativeBarChart } from "./ComparativeBarChart";
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
  state: string;
  country: string;
}

export interface CareerAnalysisResult {
  executiveSummary: string;
  skillMapping: {
    sfia9: Array<{skill: string, level: string, description: string}>;
    digcomp22: Array<{competency: string, level: string, description: string}>;
  };
  skillGapAnalysis: {
    gaps: Array<{skill: string, importance: string, description: string}>;
    strengths: Array<{skill: string, level: string, relevance: string, description: string}>;
    aiAnalysis?: string; // New field for GenAI deeper analysis of skill gaps
    recommendations?: Array<{area: string, suggestion: string, impactLevel: string}>;
  };
  careerPathway: {
    withDegree: Array<{
      step: number;
      role: string;
      timeframe: string;
      keySkillsNeeded: string[];
      description: string;
      requiredQualification?: string;
      recommendedProjects?: Array<{name: string, description: string, skillsGained: string[]}>;
      jobOpportunities?: Array<{roleType: string, description: string, skillsUtilized: string[]}>;
    }>;
    withoutDegree: Array<{
      step: number;
      role: string;
      timeframe: string;
      keySkillsNeeded: string[];
      description: string;
      alternativeQualification?: string;
      recommendedProjects?: Array<{name: string, description: string, skillsGained: string[]}>;
      jobOpportunities?: Array<{roleType: string, description: string, skillsUtilized: string[]}>;
    }>;
    aiRecommendations?: string; // New field for GenAI recommendations for pathway enhancement
  };
  developmentPlan: {
    skillsToAcquire: Array<{skill: string, priority: string, resources: string[]}>;
    recommendedCertifications: {
      university: string[];
      vocational: string[]; // TAFE in Australia, Community College in USA, Further Education in UK, etc.
      online: string[];
    };
    suggestedProjects: string[];
    learningPath: string;
    roadmapStages?: Array<{
      stage: number;
      title: string;
      timeframe: string;
      focusAreas: string[];
      milestones: string[];
      description: string;
    }>;
    microLearningTips?: Array<{
      skillArea: string;
      tip: string;
      estimatedTimeMinutes: number;
      impactLevel: "high" | "medium" | "low";
      source?: string;
    }>;
    platformSpecificCourses?: {
      microsoft: Array<{title: string, url: string, level: string, duration: string}>;
      udemy: Array<{title: string, url: string, instructorName: string, rating: string, studentsCount: string}>;
      linkedinLearning: Array<{title: string, url: string, author: string, level: string, duration: string}>;
      coursera: Array<{title: string, url: string, partner: string, certificationType: string, duration: string}>;
    };
    personalizedGrowthInsights?: string;
  };
  similarRoles?: Array<{
    role: string;
    similarityScore: number;
    keySkillsOverlap: string[];
    uniqueRequirements: string[];
    potentialSalaryRange: string;
    locationSpecificDemand: string;
  }>;
  socialSkills?: {
    criticalSoftSkills: Array<{skill: string, importance: string, developmentStrategies: string[]}>;
    communicationRecommendations: string;
    leadershipDevelopment: string;
    teamworkStrategies: string;
    networkingOpportunities: Array<{type: string, specificRecommendation: string, location: string}>;
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
  
  // Explicitly define the FormData interface type again to ensure it's accessible
  interface FormValues {
    professionalLevel: string;
    currentSkills: string;
    educationalBackground: string;
    careerHistory: string;
    desiredRole: string;
    state: string;
    country: string;
  }
  
  const [formData, setFormData] = useState<FormValues>({
    professionalLevel: "",
    currentSkills: "",
    educationalBackground: "",
    careerHistory: "",
    desiredRole: "",
    state: "",
    country: ""
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
  
  // Store the submitted form data for later use when saving
  const [submittedFormData, setSubmittedFormData] = useState<SubmittedFormData | null>(null);

  const careerAnalysisMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Save the form data for later use when saving to dashboard
      const formDataToSave: SubmittedFormData = {
        userId: user?.id,
        professionalLevel: data.professionalLevel,
        currentSkills: data.currentSkills,
        educationalBackground: data.educationalBackground,
        careerHistory: data.careerHistory,
        desiredRole: data.desiredRole,
        state: data.state,
        country: data.country,
      };
      
      setSubmittedFormData(formDataToSave);
      console.log("Form data saved for later use:", formDataToSave);
      
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
    return <CareerAnalysisResults 
      results={analysisResult} 
      formData={submittedFormData}
      onRestart={() => setAnalysisResult(null)} 
    />;
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
              
              {/* Location Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* State */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <Label htmlFor="state">State/Province</Label>
                  </div>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g., Victoria, NSW, Queensland..."
                  />
                </div>
                
                {/* Country */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    <Label htmlFor="country">Country</Label>
                  </div>
                  <Select 
                    value={formData.country} 
                    onValueChange={(value) => handleSelectChange("country", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="australia">Australia</SelectItem>
                      <SelectItem value="new-zealand">New Zealand</SelectItem>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

// Type definition for form data
type SubmittedFormData = {
  userId: string | undefined;
  professionalLevel: string;
  currentSkills: string;
  educationalBackground: string;
  careerHistory: string;
  desiredRole: string;
  state: string;
  country: string;
};

// Component to display analysis results
function CareerAnalysisResults({
  results,
  formData,
  onRestart
}: {
  results: CareerAnalysisResult;
  formData: SubmittedFormData | null;
  onRestart: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  // Create a reference to scroll to specific sections
  const executeRef = useRef<HTMLDivElement>(null);
  const skillMappingRef = useRef<HTMLDivElement>(null);
  const gapAnalysisRef = useRef<HTMLDivElement>(null);
  const pathwayRef = useRef<HTMLDivElement>(null);
  const developmentRef = useRef<HTMLDivElement>(null);
  
  // Helper functions for skill evaluations
  const skillValidated = (skillName: string, results: CareerAnalysisResult): number => {
    if (!results.skillGapAnalysis.strengths) return 0;
    return results.skillGapAnalysis.strengths.some(
      s => s.skill.toLowerCase() === skillName.toLowerCase()
    ) ? 1 : 0;
  };
  
  const skillPossessed = (skillName: string, results: CareerAnalysisResult): number => {
    // First check in strengths
    if (results.skillGapAnalysis.strengths && 
        results.skillGapAnalysis.strengths.some(s => s.skill.toLowerCase() === skillName.toLowerCase())) {
      return 1;
    }
    
    // Then check if it's NOT in gaps (if a skill is required but not in gaps, user must have it)
    if (results.skillGapAnalysis.gaps && 
        !results.skillGapAnalysis.gaps.some(g => g.skill.toLowerCase() === skillName.toLowerCase())) {
      
      // Check if this skill is actually required for the role
      const isRequiredSkill = hasRequiredSkill(skillName, results);
      if (isRequiredSkill) {
        return 1; // It's required but not a gap, so user has it
      }
    }
    
    return 0; // User doesn't have this skill
  };
  
  // Helper to check if a skill is explicitly mentioned as required
  const hasRequiredSkill = (skillName: string, results: CareerAnalysisResult): boolean => {
    // Check SFIA skills
    const inSfia = results.skillMapping.sfia9.some(
      s => s.skill.toLowerCase() === skillName.toLowerCase()
    );
    
    // Check DigComp skills
    const inDigComp = results.skillMapping.digcomp22.some(
      c => c.competency.toLowerCase() === skillName.toLowerCase()
    );
    
    return inSfia || inDigComp;
  };
  
  const countSkillsPossessed = (skills: any[], results: CareerAnalysisResult): number => {
    if (!skills) return 0;
    
    return skills.filter(skill => {
      const skillName = skill.skill || skill.competency;
      return skillPossessed(skillName, results) === 1;
    }).length;
  };
  
  const countSkillsValidated = (skills: any[], results: CareerAnalysisResult): number => {
    if (!skills || !results.skillGapAnalysis.strengths) return 0;
    
    return skills.filter(skill => {
      const skillName = skill.skill || skill.competency;
      
      // Check if this skill is validated (in strengths with high relevance)
      const validatedStrength = results.skillGapAnalysis.strengths.find(
        s => s.skill.toLowerCase() === skillName.toLowerCase()
      );
      
      return validatedStrength && 
             (validatedStrength.relevance === 'High' || 
              validatedStrength.relevance === 'Very High' || 
              validatedStrength.relevance === 'Medium');
    }).length;
  };
  
  const isSkillGap = (skillName: string, results: CareerAnalysisResult): boolean => {
    if (!results.skillGapAnalysis.gaps) return false;
    return results.skillGapAnalysis.gaps.some(
      g => g.skill.toLowerCase() === skillName.toLowerCase()
    );
  };
  
  const getGapSeverity = (skillName: string, results: CareerAnalysisResult): number => {
    if (!results.skillGapAnalysis.gaps) return 0;
    const gap = results.skillGapAnalysis.gaps.find(
      g => g.skill.toLowerCase() === skillName.toLowerCase()
    );
    if (!gap) return 0;
    
    switch (gap.importance.toLowerCase()) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 2;
    }
  };
  
  // Helper function to convert level string to numeric value for charts
  const getLevelValue = (level?: string): number => {
    if (!level) return 3;
    // SFIA levels are typically 1-7
    if (!isNaN(Number(level))) {
      return Math.min(7, Math.max(1, Number(level)));
    }
    // For text levels
    switch (level.toLowerCase()) {
      case 'beginner': return 1;
      case 'foundation': return 2;
      case 'intermediate': return 3;
      case 'advanced': return 5;
      case 'expert': return 7;
      default: return 3;
    }
  };
  
  // Helper functions for checking role types
  const hasDesignerRole = (results: CareerAnalysisResult): boolean => {
    if (!results || !results.executiveSummary) return false;
    const searchTerms = ['design', 'designer', 'ui', 'ux', 'interface', 'creative', 'art'];
    const roleStr = results.executiveSummary.toLowerCase();
    return searchTerms.some(term => roleStr.includes(term));
  };
  
  const hasManagerRole = (results: CareerAnalysisResult): boolean => {
    if (!results || !results.executiveSummary) return false;
    const searchTerms = ['manager', 'management', 'lead', 'director', 'executive', 'coordinator', 'head'];
    const roleStr = results.executiveSummary.toLowerCase();
    return searchTerms.some(term => roleStr.includes(term));
  };
  
  const hasDeveloperRole = (results: CareerAnalysisResult): boolean => {
    if (!results || !results.executiveSummary) return false;
    const searchTerms = ['developer', 'engineer', 'programmer', 'coder', 'software', 'web', 'technical'];
    const roleStr = results.executiveSummary.toLowerCase();
    return searchTerms.some(term => roleStr.includes(term));
  };
  
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
        id="career-analysis-results"
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
        <div ref={executeRef} id="executive-summary" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
          <div className="bg-white rounded-lg border p-6">
            <p className="text-gray-700 whitespace-pre-line">{results.executiveSummary}</p>
          </div>
        </div>
        
        {/* Skill Mapping */}
        <div ref={skillMappingRef} id="framework-analysis" className="mb-12">
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
        <div ref={gapAnalysisRef} id="skill-gap-analysis" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Framework-Based Skill Gap Analysis</h2>
          <p className="text-muted-foreground mb-6">
            This analysis is based on the <span className="font-medium">SFIA 9 Framework</span> (Skills Framework for the Information Age) and <span className="font-medium">DigComp 2.2 Framework</span> (European Digital Competence Framework), providing a comprehensive assessment of your technical and digital competencies.
          </p>
          
          {/* New Radar Chart Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 bg-white rounded-lg border shadow-sm p-6"
          >
            <SkillRadarChart results={results} />
          </motion.div>
          
          {/* New Bar Chart Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8 bg-white rounded-lg border shadow-sm p-6"
          >
            <ComparativeBarChart results={results} />
          </motion.div>
          
          {/* GenAI Enhanced Analysis */}
          {results.skillGapAnalysis.aiAnalysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg border border-primary-100 shadow-sm p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold text-primary-900">AI-Enhanced Analysis</h3>
              </div>
              <div className="prose prose-slate max-w-none mb-6">
                <p className="text-slate-700">{results.skillGapAnalysis.aiAnalysis}</p>
              </div>
              
              {results.skillGapAnalysis.recommendations && results.skillGapAnalysis.recommendations.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-4 text-primary-800">Strategic Recommendations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.skillGapAnalysis.recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-white/80 rounded-lg border border-primary-100 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-primary-900 flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${
                              rec.impactLevel === 'High' ? 'bg-red-500' : 
                              rec.impactLevel === 'Medium' ? 'bg-amber-500' : 'bg-green-500'
                            }`}></span>
                            {rec.area}
                          </h5>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            rec.impactLevel === 'High' ? 'bg-red-100 text-red-800' : 
                            rec.impactLevel === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {rec.impactLevel} Impact
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{rec.suggestion}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
                    
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
        <div ref={pathwayRef} id="university-pathway" className="mb-12">
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

                        {/* New GenAI Recommended Projects */}
                        {step.recommendedProjects && step.recommendedProjects.length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              AI-Recommended Projects:
                            </div>
                            <div className="space-y-2 mb-2">
                              {step.recommendedProjects.map((project: any, idx: number) => (
                                <div key={idx} className="bg-blue-50 rounded-md p-2 text-xs">
                                  <div className="font-medium text-blue-800">{project.name}</div>
                                  <div className="text-blue-600 mt-1">{project.description}</div>
                                  {project.skillsGained && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {project.skillsGained.map((skill: string, sIdx: number) => (
                                        <span key={sIdx} className="inline-flex bg-blue-100 text-blue-800 text-2xs px-1.5 py-0.5 rounded">
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* New GenAI Job Opportunities */}
                        {step.jobOpportunities && step.jobOpportunities.length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              AI-Recommended Job Opportunities:
                            </div>
                            <div className="space-y-2">
                              {step.jobOpportunities.map((job: any, idx: number) => (
                                <div key={idx} className="bg-blue-50 rounded-md p-2 text-xs">
                                  <div className="font-medium text-blue-800">{job.roleType}</div>
                                  <div className="text-blue-600 mt-1">{job.description}</div>
                                  {job.skillsUtilized && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {job.skillsUtilized.map((skill: string, sIdx: number) => (
                                        <span key={sIdx} className="inline-flex bg-blue-100 text-blue-800 text-2xs px-1.5 py-0.5 rounded">
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
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
              id="vocational-pathway"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-xl border border-emerald-100"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-emerald-700">Vocational & Skills Pathway</h3>
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
                        
                        {/* New GenAI Recommended Projects */}
                        {step.recommendedProjects && step.recommendedProjects.length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              AI-Recommended Projects:
                            </div>
                            <div className="space-y-2 mb-2">
                              {step.recommendedProjects.map((project: any, idx: number) => (
                                <div key={idx} className="bg-emerald-50 rounded-md p-2 text-xs">
                                  <div className="font-medium text-emerald-800">{project.name}</div>
                                  <div className="text-emerald-600 mt-1">{project.description}</div>
                                  {project.skillsGained && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {project.skillsGained.map((skill: string, sIdx: number) => (
                                        <span key={sIdx} className="inline-flex bg-emerald-100 text-emerald-800 text-2xs px-1.5 py-0.5 rounded">
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* New GenAI Job Opportunities */}
                        {step.jobOpportunities && step.jobOpportunities.length > 0 && (
                          <div className="mt-3">
                            <div className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              AI-Recommended Job Opportunities:
                            </div>
                            <div className="space-y-2">
                              {step.jobOpportunities.map((job: any, idx: number) => (
                                <div key={idx} className="bg-emerald-50 rounded-md p-2 text-xs">
                                  <div className="font-medium text-emerald-800">{job.roleType}</div>
                                  <div className="text-emerald-600 mt-1">{job.description}</div>
                                  {job.skillsUtilized && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {job.skillsUtilized.map((skill: string, sIdx: number) => (
                                        <span key={sIdx} className="inline-flex bg-emerald-100 text-emerald-800 text-2xs px-1.5 py-0.5 rounded">
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
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
          
          {/* AI Pathway Recommendations */}
          {results.careerPathway.aiRecommendations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100"
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-indigo-700">AI Pathway Enhancement Insights</h3>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-indigo-100 shadow-sm">
                <p className="text-sm text-indigo-700 leading-relaxed whitespace-pre-line">
                  {results.careerPathway.aiRecommendations}
                </p>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Development Plan */}
        <div ref={developmentRef} id="development-plan" className="mb-12">
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
                    {/* User's existing skills based on analysis */}
                    {/* First display skills from strengths */}
                    {results.skillGapAnalysis.strengths.map((strength: any, index: number) => (
                      <div key={`strength-${index}`} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-sm">{strength.skill}</span>
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                            Level: {strength.level || 'Proficient'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                            Relevance: {strength.relevance}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                            {strength.framework || (index % 2 === 0 ? 'DigComp 2.2' : 'SFIA 9')}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Then display framework skills that are required but not in gaps (user must have these) */}
                    {[...results.skillMapping.sfia9, ...results.skillMapping.digcomp22.map(c => ({
                      skill: c.competency, 
                      level: c.level, 
                      description: c.description,
                      framework: 'DigComp 2.2'
                    }))].filter(skill => {
                      // Only show skills that aren't already in strengths but user has them
                      const skillName = skill.skill;
                      
                      // Skip if it's already in strengths
                      const inStrengths = results.skillGapAnalysis.strengths.some(
                        s => s.skill.toLowerCase() === skillName.toLowerCase()
                      );
                      if (inStrengths) return false;
                      
                      // Skip if it's in gaps (user doesn't have it)
                      const inGaps = results.skillGapAnalysis.gaps.some(
                        g => g.skill.toLowerCase() === skillName.toLowerCase()
                      );
                      if (inGaps) return false;
                      
                      // Include if user has this skill
                      return skillPossessed(skillName, results) === 1;
                    }).map((skill, index) => (
                      <div key={`framework-${index}`} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-sm">{skill.skill}</span>
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                            Level: {skill.level || 'Intermediate'}
                          </span>
                        </div>
                        <div className="flex justify-end mt-2">
                          <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                            {index % 2 === 0 ? 'SFIA 9' : 'DigComp 2.2'}
                          </span>
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
                    {/* We'll map all skills with detailed information */}
                    {results.developmentPlan.skillsToAcquire.map((skill: any, index: number) => (
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
            id="social-skills"
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
                {(() => {
                  // Generate dynamic soft skills based on the desired role from executive summary
                  const summary = results.executiveSummary.toLowerCase();
                  
                  // Determine role type
                  const isManager = summary.includes('manager') || summary.includes('director') || summary.includes('lead');
                  const isDeveloper = summary.includes('developer') || summary.includes('programmer') || summary.includes('engineer');
                  const isDesigner = summary.includes('design') || summary.includes('ux') || summary.includes('ui');
                  const isCustomerFacing = summary.includes('client') || summary.includes('customer') || summary.includes('service');
                  
                  // Select the most relevant categories for the role
                  let categories = [];
                  
                  // First category - Communication (for all roles)
                  let communicationSkills = [
                    { name: "Active Listening", benefit: "Builds trust and understanding with team members and stakeholders" },
                    { name: "Clear Articulation", benefit: "Ensures your ideas are understood and implemented correctly" }
                  ];
                  
                  // Add role-specific communication skill
                  if (isCustomerFacing) {
                    communicationSkills.push({ name: "Client Communication", benefit: "Helps navigate sensitive client discussions effectively" });
                  } else {
                    communicationSkills.push({ name: "Persuasive Presentation", benefit: "Helps gain support for your proposals and projects" });
                  }
                  
                  categories.push({
                    category: "Communication",
                    skills: communicationSkills,
                    color: "blue"
                  });
                  
                  // Second category based on role
                  if (isManager) {
                    categories.push({
                      category: "Leadership",
                      skills: [
                        { name: "Team Mentoring", benefit: "Develops team capabilities and collective performance" },
                        { name: "Conflict Resolution", benefit: "Creates harmonious environments and addresses issues early" },
                        { name: "Strategic Vision", benefit: "Guides teams toward meaningful goals with clear purpose" }
                      ],
                      color: "amber"
                    });
                  } else if (isDeveloper) {
                    categories.push({
                      category: "Technical Collaboration",
                      skills: [
                        { name: "Knowledge Sharing", benefit: "Strengthens team capabilities and creates learning culture" },
                        { name: "Code Review Skills", benefit: "Turns feedback exchanges into positive learning experiences" },
                        { name: "Cross-functional Collaboration", benefit: "Bridges technical and non-technical stakeholder needs" }
                      ],
                      color: "amber"
                    });
                  } else if (isDesigner) {
                    categories.push({
                      category: "Creative Collaboration",
                      skills: [
                        { name: "Design Critique", benefit: "Giving and receiving constructive design feedback" },
                        { name: "Visual Storytelling", benefit: "Communicating design decisions with compelling narratives" },
                        { name: "Stakeholder Management", benefit: "Navigating competing priorities in design requirements" }
                      ],
                      color: "amber"
                    });
                  } else {
                    categories.push({
                      category: "Collaboration",
                      skills: [
                        { name: "Teamwork", benefit: "Creates synergy and leverages diverse strengths" },
                        { name: "Constructive Feedback", benefit: "Helps improve work quality while maintaining relationships" },
                        { name: "Cross-functional Understanding", benefit: "Enables effective work across departments" }
                      ],
                      color: "amber"
                    });
                  }
                  
                  // Third category for all roles
                  if (isCustomerFacing) {
                    categories.push({
                      category: "Client Relations",
                      skills: [
                        { name: "Needs Assessment", benefit: "Accurately identifies client requirements and expectations" },
                        { name: "Expectation Management", benefit: "Prevents misunderstandings and ensures satisfaction" },
                        { name: "Relationship Building", benefit: "Develops long-term client partnerships and trust" }
                      ],
                      color: "green"
                    });
                  } else {
                    categories.push({
                      category: "Adaptability",
                      skills: [
                        { name: "Resilience", benefit: "Helps navigate setbacks and maintain momentum" },
                        { name: "Cultural Intelligence", benefit: "Enhances collaboration in diverse teams" },
                        { name: "Learning Agility", benefit: "Allows quick adaptation to new technologies" }
                      ],
                      color: "green"
                    });
                  }
                  
                  return categories;
                })().map((category, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 * index }}
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
                          {Array.isArray(skill.resources) ? (
                            skill.resources.map((resource: string, resourceIndex: number) => (
                              <li key={resourceIndex} className="text-gray-700">{resource}</li>
                            ))
                          ) : (
                            <li className="text-gray-700">{skill.resources}</li>
                          )}
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
                        {/* Sample Global Universities with links */}
                        <li className="text-sm flex items-start gap-2 mb-4 pb-3 border-b border-blue-100">
                          <div className="min-w-4 mt-1">🏫</div>
                          <div className="w-full">
                            <span className="font-medium block mb-1">Top Global Universities</span>
                            <div className="grid grid-cols-1 gap-2 mt-2">
                              <a 
                                href="https://www.harvard.edu/" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                Harvard University (USA)
                              </a>
                              <a 
                                href="https://www.cam.ac.uk/" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                University of Cambridge (UK)
                              </a>
                              <a 
                                href="https://www.sydney.edu.au/" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                University of Sydney (Australia)
                              </a>
                              <a 
                                href="https://www.u-tokyo.ac.jp/en/" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                University of Tokyo (Japan)
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
                  
                  {/* Vocational Courses */}
                  <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-emerald-700 flex items-center gap-2">
                        <BookCheck className="h-5 w-5" />
                        Vocational Courses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {/* Top vocational institutions with links */}
                        <li className="text-sm flex items-start gap-2 mb-4 pb-3 border-b border-emerald-100">
                          <div className="min-w-4 mt-1">🏫</div>
                          <div className="w-full">
                            <span className="font-medium block mb-1">Major Vocational Institutions</span>
                            <div className="grid grid-cols-1 gap-2 mt-2">
                              <a 
                                href="https://www.tafensw.edu.au/" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                              >
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                TAFE NSW (Australia)
                              </a>
                              <a 
                                href="https://www.cityandguilds.com/" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                              >
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                City & Guilds (UK)
                              </a>
                              <a 
                                href="https://www.ed2go.com/" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                              >
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                Ed2Go (USA)
                              </a>
                              <a 
                                href="https://www.btec.co.uk/" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                              >
                                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                BTEC (UK)
                              </a>
                            </div>
                          </div>
                        </li>
                        
                        {results.developmentPlan.recommendedCertifications.vocational.map((cert: string, index: number) => (
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
                      {results.developmentPlan.suggestedProjects.map((project: any, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="bg-purple-100 text-purple-800 p-1 rounded-full flex items-center justify-center mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="16 18 22 12 16 6" />
                              <polyline points="8 6 2 12 8 18" />
                            </svg>
                          </div>
                          <div className="text-sm">
                            {typeof project === 'string' ? project : 
                             (project.name ? 
                              <div>
                                <div className="font-medium">{project.name}</div>
                                {project.description && <div className="mt-1">{project.description}</div>}
                                {project.skillsGained && project.skillsGained.length > 0 && (
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {project.skillsGained.map((skill: string, sIdx: number) => (
                                      <span key={sIdx} className="inline-flex bg-purple-100 text-purple-700 text-2xs px-1.5 py-0.5 rounded">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              : JSON.stringify(project)
                             )
                            }
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* New Roadmap Stages Visualization */}
              {results.developmentPlan.roadmapStages && results.developmentPlan.roadmapStages.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="mt-8"
                >
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    AI-Enhanced Learning Roadmap
                  </h3>
                  
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
                    <p className="text-sm text-indigo-800 mb-6">
                      This AI-generated roadmap provides a structured learning path divided into clear stages, 
                      helping you progress systematically toward your career goals with focused milestones.
                    </p>
                    
                    <div className="relative pt-4 pb-2">
                      {/* Horizontal progress line */}
                      <div className="absolute left-0 right-0 top-10 h-1 bg-indigo-200 rounded-full" />
                      
                      <div className="flex justify-between relative">
                        {results.developmentPlan.roadmapStages?.map((stage: any, index: number) => (
                          <div key={index} className="flex flex-col items-center relative z-10" style={{ width: `${100/(results.developmentPlan.roadmapStages?.length || 1)}%` }}>
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                              {stage.stage}
                            </div>
                            <div className="mt-3 text-center">
                              <div className="font-medium text-indigo-800">{stage.title}</div>
                              <div className="text-xs text-indigo-600 mt-1">{stage.timeframe}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-8 grid gap-6">
                      {results.developmentPlan.roadmapStages?.map((stage: any, index: number) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-indigo-100 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                              {stage.stage}
                            </div>
                            <div className="font-semibold text-indigo-800">{stage.title}</div>
                          </div>
                          
                          <p className="text-sm text-slate-600 mb-4">{stage.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-indigo-50 rounded-md p-3">
                              <div className="text-xs font-semibold text-indigo-700 mb-2">Focus Areas:</div>
                              <div className="flex flex-wrap gap-2">
                                {stage.focusAreas.map((area: string, idx: number) => (
                                  <span key={idx} className="inline-flex bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                                    {area}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="bg-blue-50 rounded-md p-3">
                              <div className="text-xs font-semibold text-blue-700 mb-2">Key Milestones:</div>
                              <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
                                {stage.milestones.map((milestone: string, idx: number) => (
                                  <li key={idx}>{milestone}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 id="similar-roles" className="text-xl font-semibold mb-3 flex items-center">
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
                  {(() => {
                    // Determine career type based on executive summary and desired role
                    const summary = results.executiveSummary.toLowerCase();
                    
                    // Get user strengths from analysis
                    const userStrengths = results.skillGapAnalysis.strengths.map(s => s.skill.toLowerCase());
                    
                    // Identify relevant roles based on career direction
                    const isDeveloper = summary.includes('developer') || summary.includes('software') || 
                      summary.includes('programmer') || summary.includes('engineer');
                    const isDesigner = summary.includes('designer') || summary.includes('design') || 
                      summary.includes('ux') || summary.includes('ui');
                    const isManager = summary.includes('manager') || summary.includes('director') || 
                      summary.includes('lead') || summary.includes('head');
                    const isAnalyst = summary.includes('analyst') || summary.includes('research') || 
                      summary.includes('data');
                    const isMarketing = summary.includes('marketing') || summary.includes('content') || 
                      summary.includes('communications');
                    
                    // Generate related roles appropriate to the user's career path
                    let similarRoles = [];
                    
                    if (isDeveloper) {
                      similarRoles = [
                        {
                          title: "Solutions Architect",
                          similarity: "High",
                          description: "Similar to your target role, but with greater emphasis on designing system solutions and technical strategy.",
                          salaryRange: "$120,000 - $170,000",
                          growthOutlook: "Excellent",
                          skillOverlap: ["Technical knowledge", "System design", "Problem-solving"],
                          keyDifference: "More architectural focus"
                        },
                        {
                          title: "DevOps Engineer",
                          similarity: "Medium-High",
                          description: "Focuses on streamlining development processes and optimizing deployment infrastructure.",
                          salaryRange: "$105,000 - $155,000",
                          growthOutlook: "Strong",
                          skillOverlap: ["Technical skills", "Automation", "Continuous integration"],
                          keyDifference: "More operations-focused"
                        },
                        {
                          title: "Technical Product Manager",
                          similarity: "Medium",
                          description: "Bridges technical expertise with product development, guiding features through the development lifecycle.",
                          salaryRange: "$110,000 - $160,000",
                          growthOutlook: "Excellent",
                          skillOverlap: ["Technical knowledge", "Communication", "Problem-solving"],
                          keyDifference: "More business and strategy focused"
                        }
                      ];
                    } else if (isDesigner) {
                      similarRoles = [
                        {
                          title: "Product Designer",
                          similarity: "High",
                          description: "Combines UX and UI with broader product thinking to create comprehensive user experiences.",
                          salaryRange: "$95,000 - $140,000",
                          growthOutlook: "Excellent",
                          skillOverlap: ["User-centered design", "Visual skills", "Design thinking"],
                          keyDifference: "More holistic product approach"
                        },
                        {
                          title: "UX Researcher",
                          similarity: "Medium-High",
                          description: "Specializes in understanding user needs through detailed research methodologies.",
                          salaryRange: "$85,000 - $130,000",
                          growthOutlook: "Strong",
                          skillOverlap: ["User empathy", "Research methods", "Problem definition"],
                          keyDifference: "More research-intensive"
                        },
                        {
                          title: "Creative Director",
                          similarity: "Medium",
                          description: "Guides the creative vision and strategy across multiple projects or products.",
                          salaryRange: "$120,000 - $180,000",
                          growthOutlook: "Good",
                          skillOverlap: ["Visual design", "Creative thinking", "Brand understanding"],
                          keyDifference: "More leadership and strategic vision"
                        }
                      ];
                    } else if (isManager) {
                      similarRoles = [
                        {
                          title: "Program Manager",
                          similarity: "High",
                          description: "Coordinates multiple related projects and ensures alignment with business objectives.",
                          salaryRange: "$110,000 - $160,000",
                          growthOutlook: "Strong",
                          skillOverlap: ["Leadership", "Strategic planning", "Stakeholder management"],
                          keyDifference: "Broader program oversight"
                        },
                        {
                          title: "Change Management Lead",
                          similarity: "Medium-High",
                          description: "Focuses on guiding organizations through transitions with minimal disruption.",
                          salaryRange: "$100,000 - $150,000",
                          growthOutlook: "Growing",
                          skillOverlap: ["Leadership", "Stakeholder engagement", "Strategic communication"],
                          keyDifference: "More transformation-focused"
                        },
                        {
                          title: "Business Strategist",
                          similarity: "Medium",
                          description: "Develops business strategies to achieve organizational goals and market positioning.",
                          salaryRange: "$115,000 - $170,000",
                          growthOutlook: "Good",
                          skillOverlap: ["Strategic thinking", "Analysis", "Business acumen"],
                          keyDifference: "More business and market focused"
                        }
                      ];
                    } else if (isAnalyst) {
                      similarRoles = [
                        {
                          title: "Data Scientist",
                          similarity: "High",
                          description: "Uses advanced analytics and machine learning to extract insights from complex data.",
                          salaryRange: "$100,000 - $150,000",
                          growthOutlook: "Excellent",
                          skillOverlap: ["Analytical skills", "Technical knowledge", "Problem-solving"],
                          keyDifference: "More statistical and algorithmic"
                        },
                        {
                          title: "Business Intelligence Developer",
                          similarity: "Medium-High",
                          description: "Creates data visualization tools and dashboards to enable data-driven decisions.",
                          salaryRange: "$90,000 - $135,000",
                          growthOutlook: "Strong",
                          skillOverlap: ["Data analysis", "Technical skills", "Visualization"],
                          keyDifference: "More visualization and reporting focused"
                        },
                        {
                          title: "Operations Research Analyst",
                          similarity: "Medium",
                          description: "Applies analytical methods to help organizations make better decisions and improve operations.",
                          salaryRange: "$85,000 - $130,000",
                          growthOutlook: "Stable",
                          skillOverlap: ["Problem-solving", "Analytical thinking", "Data analysis"],
                          keyDifference: "More operations optimization focused"
                        }
                      ];
                    } else if (isMarketing) {
                      similarRoles = [
                        {
                          title: "Brand Strategist",
                          similarity: "High",
                          description: "Develops brand identities and positioning strategies to build market presence.",
                          salaryRange: "$90,000 - $140,000",
                          growthOutlook: "Strong",
                          skillOverlap: ["Strategic thinking", "Market awareness", "Creative direction"],
                          keyDifference: "More brand focused"
                        },
                        {
                          title: "Digital Marketing Specialist",
                          similarity: "Medium-High",
                          description: "Leverages multiple digital channels to drive engagement and conversion.",
                          salaryRange: "$80,000 - $125,000",
                          growthOutlook: "Excellent",
                          skillOverlap: ["Content creation", "Channel expertise", "Analytics"],
                          keyDifference: "More channel-specific focus"
                        },
                        {
                          title: "Marketing Analytics Manager",
                          similarity: "Medium",
                          description: "Uses data analysis to optimize marketing strategies and measure campaign effectiveness.",
                          salaryRange: "$95,000 - $145,000",
                          growthOutlook: "Growing",
                          skillOverlap: ["Analytical skills", "Marketing knowledge", "Data interpretation"],
                          keyDifference: "More data and measurement focused"
                        }
                      ];
                    } else {
                      // Default roles for any other career paths
                      similarRoles = [
                        {
                          title: "Strategic Consultant",
                          similarity: "High",
                          description: "Provides expert guidance and analysis to solve complex business challenges.",
                          salaryRange: "$95,000 - $150,000",
                          growthOutlook: "Strong",
                          skillOverlap: ["Problem-solving", "Analytical thinking", "Industry knowledge"],
                          keyDifference: "More advisory role"
                        },
                        {
                          title: "Project Coordinator",
                          similarity: "Medium-High",
                          description: "Organizes and manages resources, schedules, and procedures to ensure project success.",
                          salaryRange: "$80,000 - $120,000",
                          growthOutlook: "Stable",
                          skillOverlap: ["Organization", "Communication", "Detail-orientation"],
                          keyDifference: "More operational focus"
                        },
                        {
                          title: "Industry Specialist",
                          similarity: "Medium",
                          description: "Leverages deep domain expertise to solve specialized challenges in a specific field.",
                          salaryRange: "$85,000 - $135,000",
                          growthOutlook: "Good",
                          skillOverlap: ["Domain knowledge", "Critical thinking", "Problem-solving"],
                          keyDifference: "More specialized knowledge"
                        }
                      ];
                    }
                    
                    return similarRoles;
                  })().map((role, index) => (
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
            
            {/* Micro-Learning Quick Tips */}
            {results.developmentPlan.microLearningTips && results.developmentPlan.microLearningTips.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8"
              >
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-rose-500" />
                  Micro-Learning Quick Tips by GenAI
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.developmentPlan.microLearningTips.map((tip, index) => (
                    <Card key={index} className={
                      tip.impactLevel === "high" 
                        ? "bg-gradient-to-br from-rose-50 to-orange-50 border-rose-100" 
                        : tip.impactLevel === "medium" 
                          ? "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100"
                          : "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100"
                    }>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-2 mb-2">
                          <div className={
                            tip.impactLevel === "high" 
                              ? "bg-rose-100 text-rose-800 p-1 rounded-full flex items-center justify-center" 
                              : tip.impactLevel === "medium" 
                                ? "bg-amber-100 text-amber-800 p-1 rounded-full flex items-center justify-center"
                                : "bg-emerald-100 text-emerald-800 p-1 rounded-full flex items-center justify-center"
                          }>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M10.83 5H13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2.17" />
                              <path d="M10 10h4" />
                              <path d="M10 14h4" />
                            </svg>
                          </div>
                          <div className="font-semibold text-sm">{tip.skillArea}</div>
                        </div>
                        <div className="ml-6">
                          <p className="text-sm mb-2">{tip.tip}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className={
                              tip.impactLevel === "high" 
                                ? "bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full" 
                                : tip.impactLevel === "medium" 
                                  ? "bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full"
                                  : "bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full"
                            }>
                              {tip.impactLevel.charAt(0).toUpperCase() + tip.impactLevel.slice(1)} Impact
                            </span>
                            <span className="text-slate-500">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {tip.estimatedTimeMinutes} min
                            </span>
                          </div>
                          {tip.source && (
                            <div className="text-xs text-slate-500 mt-2">
                              Source: {tip.source}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            )}
            
            {/* Personalized Skill Growth Animation */}
            {results.developmentPlan.personalizedGrowthInsights && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8"
              >
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5 text-purple-600" />
                  Personalized Skill Growth Trajectory
                </h3>
                <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
                  <CardContent className="pt-4">
                    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden">
                      {/* Animated background decoration */}
                      <div className="absolute top-0 left-0 w-full h-full opacity-10 overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full blur-3xl animate-pulse"></div>
                      </div>
                      <p className="whitespace-pre-line text-sm leading-relaxed relative z-10">{results.developmentPlan.personalizedGrowthInsights}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {/* Platform-Specific Courses */}
            {results.developmentPlan.platformSpecificCourses && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8"
              >
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Laptop className="h-5 w-5 text-blue-600" />
                  Recommended Platform Courses
                </h3>
                <Tabs defaultValue="microsoft" className="mb-8">
                  <TabsList className="grid grid-cols-4 mb-4">
                    <TabsTrigger value="microsoft" className="text-xs">Microsoft Learning</TabsTrigger>
                    <TabsTrigger value="udemy" className="text-xs">Udemy</TabsTrigger>
                    <TabsTrigger value="linkedin" className="text-xs">LinkedIn Learning</TabsTrigger>
                    <TabsTrigger value="coursera" className="text-xs">Coursera</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="microsoft">
                    <div className="grid grid-cols-1 gap-3">
                      {results.developmentPlan.platformSpecificCourses.microsoft.map((course, index) => (
                        <Card key={index} className="bg-gradient-to-r from-slate-50 to-blue-50 border-blue-100 overflow-hidden">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <div className="bg-blue-600 text-white p-2 rounded-md flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M0 0h11.5v11.5H0V0zm12.5 0H24v11.5H12.5V0zM0 12.5h11.5V24H0V12.5zm12.5 0H24V24H12.5V12.5z"/>
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold">
                                  <a href={course.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                                    {course.title}
                                  </a>
                                </h4>
                                <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                                  <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M12 20h9"/>
                                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                    </svg>
                                    {course.level}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="12" cy="12" r="10"/>
                                      <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    {course.duration}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="udemy">
                    <div className="grid grid-cols-1 gap-3">
                      {results.developmentPlan.platformSpecificCourses.udemy.map((course, index) => (
                        <Card key={index} className="bg-gradient-to-r from-slate-50 to-purple-50 border-purple-100 overflow-hidden">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <div className="bg-violet-600 text-white p-2 rounded-md flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M18 6h-5c-1.1 0-2 .9-2 2v10"/>
                                  <path d="M18 16v-3a2 2 0 0 0-2-2h-6"/>
                                  <path d="M12 19h-2a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold">
                                  <a href={course.url} target="_blank" rel="noopener noreferrer" className="hover:text-violet-600 transition-colors">
                                    {course.title}
                                  </a>
                                </h4>
                                <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                                  <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                      <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                    {course.instructorName}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                    </svg>
                                    {course.rating}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                      <circle cx="9" cy="7" r="4"/>
                                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                    </svg>
                                    {course.studentsCount}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="linkedin">
                    <div className="grid grid-cols-1 gap-3">
                      {results.developmentPlan.platformSpecificCourses.linkedinLearning.map((course, index) => (
                        <Card key={index} className="bg-gradient-to-r from-slate-50 to-sky-50 border-sky-100 overflow-hidden">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <div className="bg-sky-600 text-white p-2 rounded-md flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold">
                                  <a href={course.url} target="_blank" rel="noopener noreferrer" className="hover:text-sky-600 transition-colors">
                                    {course.title}
                                  </a>
                                </h4>
                                <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                                  <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                      <circle cx="12" cy="7" r="4"/>
                                    </svg>
                                    {course.author}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M12 20h9"/>
                                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                    </svg>
                                    {course.level}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="12" cy="12" r="10"/>
                                      <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    {course.duration}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="coursera">
                    <div className="grid grid-cols-1 gap-3">
                      {results.developmentPlan.platformSpecificCourses.coursera.map((course, index) => (
                        <Card key={index} className="bg-gradient-to-r from-slate-50 to-blue-50 border-blue-100 overflow-hidden">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <div className="bg-blue-700 text-white p-2 rounded-md flex items-center justify-center shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold">
                                  <a href={course.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition-colors">
                                    {course.title}
                                  </a>
                                </h4>
                                <div className="flex items-center gap-4 mt-1 text-xs text-slate-600">
                                  <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                                      <path d="M8 21h8"/>
                                      <path d="M12 17v4"/>
                                    </svg>
                                    {course.partner}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                    {course.certificationType}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="12" cy="12" r="10"/>
                                      <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    {course.duration}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}
            
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
          {/* Save to Dashboard and PDF Download buttons */}
          <div className="flex justify-center w-full gap-6">
            {/* HTML Report Button */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-0.5 rounded-lg">
              <PdfDownloader results={results} userName={user?.fullName || 'User'} />
            </div>
          </div>
          
          {/* New Analysis button */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-0.5 rounded-lg">
            <Button 
              onClick={onRestart} 
              size="lg" 
              className="bg-white text-gray-800 hover:bg-opacity-95 hover:text-gray-900 shadow-lg text-base gap-2 border-2 border-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              <span className="font-medium">Start a New Career Analysis</span>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}