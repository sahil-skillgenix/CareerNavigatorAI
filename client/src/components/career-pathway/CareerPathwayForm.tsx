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
          <h2 className="text-2xl font-bold mb-4">Skill Gap Analysis</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Skill Gaps</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {results.skillGapAnalysis.gaps.map((gap, index) => (
                  <div key={index} className="bg-white rounded-lg border p-4">
                    <div className="font-medium text-destructive mb-1">{gap.skill}</div>
                    <div className="text-sm text-muted-foreground mb-2">Importance: {gap.importance}</div>
                    <p className="text-sm">{gap.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-xl font-semibold mb-3">Strengths</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {results.skillGapAnalysis.strengths.map((strength, index) => (
                  <div key={index} className="bg-white rounded-lg border p-4">
                    <div className="font-medium text-green-600 mb-1">{strength.skill}</div>
                    <div className="text-sm text-muted-foreground mb-2">
                      Level: {strength.level} | Relevance: {strength.relevance}
                    </div>
                    <p className="text-sm">{strength.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Career Pathway */}
        <div ref={pathwayRef} className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Career Pathway Options</h2>
          <p className="text-muted-foreground mb-6">
            Below are two distinct career pathway options tailored to your background and aspirations. 
            Choose the path that best aligns with your preferences and circumstances.
          </p>
          
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
          <h2 className="text-2xl font-bold mb-4">Development Plan</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Skills To Acquire</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {results.developmentPlan.skillsToAcquire.map((skill: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg border p-4">
                    <div className="font-medium text-primary mb-1">{skill.skill}</div>
                    <div className="text-sm text-muted-foreground mb-2">Priority: {skill.priority}</div>
                    
                    <div className="text-sm">
                      <div className="font-medium mb-1">Recommended Resources:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {skill.resources.map((resource: string, resourceIndex: number) => (
                          <li key={resourceIndex}>{resource}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
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
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold mb-3">Learning Path Roadmap</h3>
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
        
        {/* Review Notes */}
        <div className="mb-12">
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
        </div>
        
        <motion.div 
          className="flex justify-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
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