/**
 * Enhanced version of CareerPathwayForm that uses the structured report format
 * to ensure proper ordering and naming consistency across all sections.
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
import { StructuredPdfDownloader } from "./StructuredPdfDownloader";
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
import { CareerPathwayStepsDisplay } from "./CareerPathwayStepsDisplay";
import { AIRecommendationsPanel } from "./AIRecommendationsPanel";
import { LearningRecommendationsGrid } from "./LearningRecommendationsGrid";
import { CareerAnalysisReport } from "../../../shared/reportSchema";
import { StructuredCareerAnalysisResults } from "./StructuredCareerAnalysisResults";

// Form data structure for the career analysis
interface FormValues {
  professionalLevel: string;
  currentSkills: string;
  educationalBackground: string;
  careerHistory: string;
  desiredRole: string;
  state: string;
  country: string;
}

// Submitted form data
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

/**
 * A form component that collects career information from the user
 * and generates a structured career analysis report
 */
export function StructuredCareerPathwayForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [formData, setFormData] = useState<FormValues>({
    professionalLevel: "",
    currentSkills: "",
    educationalBackground: "",
    careerHistory: "",
    desiredRole: "",
    state: "",
    country: ""
  });
  
  // Analysis result state (using the structured CareerAnalysisReport interface)
  const [analysisResult, setAnalysisResult] = useState<CareerAnalysisReport | null>(null);
  
  // Store the submitted form data for later use when saving
  const [submittedFormData, setSubmittedFormData] = useState<SubmittedFormData | null>(null);

  /**
   * Mutation for submitting career analysis using the structured endpoint
   */
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
      
      // Use the structured endpoint for proper section ordering
      const res = await apiRequest("POST", "/api/career-pathway-analysis-structured", data);
      const result = await res.json();
      return result as CareerAnalysisReport;
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      toast({
        title: "Career analysis complete",
        description: "Your personalized career pathway has been generated using the structured format.",
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
  
  /**
   * Handle input changes in the form
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  /**
   * Handle select changes in the form
   */
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  /**
   * Handle form submission
   */
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
    return <StructuredCareerAnalysisResults 
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
          <h1 className="text-3xl font-bold mb-3">Career Pathway Analysis <Badge variant="outline" className="ml-2">Structured Format</Badge></h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Analyze your skills and receive a personalized career pathway with step-by-step guidance
            to achieve your career goals.
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Enter Your Career Information</CardTitle>
            <CardDescription>
              Our AI will analyze your skills and career history to create personalized recommendations.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Professional Level */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <User2 className="mr-2 h-4 w-4 text-primary" />
                  <Label htmlFor="professionalLevel">Professional Level</Label>
                </div>
                <Select 
                  value={formData.professionalLevel} 
                  onValueChange={(value) => handleSelectChange("professionalLevel", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your professional level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="graduate">Recent Graduate</SelectItem>
                    <SelectItem value="worker">Working Professional</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="career-changer">Career Changer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Current Skills */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <BookCheck className="mr-2 h-4 w-4 text-primary" />
                  <Label htmlFor="currentSkills">Current Skills</Label>
                </div>
                <Textarea 
                  id="currentSkills"
                  name="currentSkills"
                  value={formData.currentSkills}
                  onChange={handleInputChange}
                  placeholder="List your skills and competencies (separated by commas)"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Enter up to 50 skills, separated by commas.
                </p>
              </div>
              
              {/* Educational Background */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <GraduationCap className="mr-2 h-4 w-4 text-primary" />
                  <Label htmlFor="educationalBackground">Educational Background</Label>
                </div>
                <Textarea 
                  id="educationalBackground"
                  name="educationalBackground"
                  value={formData.educationalBackground}
                  onChange={handleInputChange}
                  placeholder="Describe your education, degrees, certifications, etc."
                  rows={3}
                />
              </div>
              
              {/* Career History */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <History className="mr-2 h-4 w-4 text-primary" />
                  <Label htmlFor="careerHistory">Career History</Label>
                </div>
                <Textarea 
                  id="careerHistory"
                  name="careerHistory"
                  value={formData.careerHistory}
                  onChange={handleInputChange}
                  placeholder="Describe your work experience and previous roles"
                  rows={3}
                />
              </div>
              
              {/* Desired Role */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <Target className="mr-2 h-4 w-4 text-primary" />
                  <Label htmlFor="desiredRole">Desired Role or Career Goal</Label>
                </div>
                <Textarea 
                  id="desiredRole"
                  name="desiredRole"
                  value={formData.desiredRole}
                  onChange={handleInputChange}
                  placeholder="What role or career path are you aiming for?"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum 250 characters.
                </p>
              </div>
              
              {/* Location Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-primary" />
                    <Label htmlFor="state">State/Province</Label>
                  </div>
                  <Input 
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Your state or province"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Globe className="mr-2 h-4 w-4 text-primary" />
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
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Pathway
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}