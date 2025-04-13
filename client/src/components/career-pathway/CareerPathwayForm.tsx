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
  careerPathway: Array<{
    step: number;
    role: string;
    timeframe: string;
    keySkillsNeeded: string[];
    description: string;
  }>;
  developmentPlan: {
    skillsToAcquire: Array<{skill: string, priority: string, resources: string[]}>;
    recommendedCertifications: string[];
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
          <h2 className="text-2xl font-bold mb-4">Career Pathway</h2>
          
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[26px] top-8 bottom-0 w-0.5 bg-primary/20" />
            
            <div className="space-y-6">
              {results.careerPathway.map((step, index) => (
                <div key={index} className="flex">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg z-10">
                      {step.step}
                    </div>
                  </div>
                  
                  <div className="flex-1 ml-4 bg-white rounded-lg border p-4">
                    <div className="font-medium text-lg mb-1">{step.role}</div>
                    <div className="text-sm text-muted-foreground mb-3">Timeframe: {step.timeframe}</div>
                    
                    <p className="text-sm mb-3">{step.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {step.keySkillsNeeded.map((skill, skillIndex) => (
                        <span 
                          key={skillIndex} 
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Development Plan */}
        <div ref={developmentRef} className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Development Plan</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Skills To Acquire</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {results.developmentPlan.skillsToAcquire.map((skill, index) => (
                  <div key={index} className="bg-white rounded-lg border p-4">
                    <div className="font-medium text-primary mb-1">{skill.skill}</div>
                    <div className="text-sm text-muted-foreground mb-2">Priority: {skill.priority}</div>
                    
                    <div className="text-sm">
                      <div className="font-medium mb-1">Recommended Resources:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {skill.resources.map((resource, resourceIndex) => (
                          <li key={resourceIndex}>{resource}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-xl font-semibold mb-3">Recommended Certifications</h3>
                <Card>
                  <CardContent className="pt-6">
                    <ul className="list-disc list-inside space-y-2">
                      {results.developmentPlan.recommendedCertifications.map((cert, index) => (
                        <li key={index}>{cert}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3">Suggested Projects</h3>
                <Card>
                  <CardContent className="pt-6">
                    <ul className="list-disc list-inside space-y-2">
                      {results.developmentPlan.suggestedProjects.map((project, index) => (
                        <li key={index}>{project}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3">Learning Path</h3>
              <Card>
                <CardContent className="pt-6">
                  <p className="whitespace-pre-line">{results.developmentPlan.learningPath}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Review Notes */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Analysis Review Notes</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>First Review</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{results.reviewNotes.firstReview}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Second Review</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{results.reviewNotes.secondReview}</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button onClick={onRestart} size="lg">
            Start a New Analysis
          </Button>
        </div>
      </motion.div>
    </div>
  );
}