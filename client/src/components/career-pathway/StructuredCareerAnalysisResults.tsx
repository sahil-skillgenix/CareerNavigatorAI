/**
 * Enhanced Career Analysis Results component that works with the structured report format
 * ensuring all 11 sections are displayed correctly with proper ordering.
 */

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Sparkles, 
  Save, 
  FileDown, 
  ChevronRight,
  InfoIcon,
  Lightbulb,
  BookOpen,
  GraduationCap,
  Map,
  CheckCircle,
  BriefcaseBusiness,
  BarChart2,
  ListChecks,
  TrendingUp,
  Timer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { SkillRadarChart } from "./SkillRadarChart";
import { ComparativeBarChart } from "./ComparativeBarChart";
import { CareerPathwayStepsDisplay } from "./CareerPathwayStepsDisplay";
import { AIRecommendationsPanel } from "./AIRecommendationsPanel";
import { LearningRecommendationsGrid } from "./LearningRecommendationsGrid";
import { StructuredPdfDownloader } from "./StructuredPdfDownloader";
import { CareerAnalysisReport } from "../../../shared/reportSchema";

// Props for the form data
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

// Props for the component
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
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showDevDebug, setShowDevDebug] = useState(() => {
    // Load debug state from localStorage to persist across refreshes
    const savedState = localStorage.getItem("showDevDebug");
    return savedState ? JSON.parse(savedState) : false;
  });

  // Initialize debug states for each section with values from localStorage
  const [debugStates, setDebugStates] = useState<DebugStates>(() => {
    const savedStates = localStorage.getItem("debugStates");
    return savedStates ? JSON.parse(savedStates) : {
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
  });

  // Helper function to toggle debug state for a specific section
  const toggleSectionDebug = (section: string) => {
    setDebugStates(prev => {
      const newStates = { ...prev, [section]: !prev[section] };
      // Save to localStorage to persist across refreshes
      localStorage.setItem("debugStates", JSON.stringify(newStates));
      return newStates;
    });
  };

  // Toggle the developer debug panel visibility
  const toggleDevDebug = () => {
    setShowDevDebug(prev => {
      const newState = !prev;
      localStorage.setItem("showDevDebug", JSON.stringify(newState));
      return newState;
    });
  };

  /**
   * Save career analysis to user's account
   */
  const saveToAccount = async () => {
    if (!user || !formData) {
      toast({
        title: "Error",
        description: "Unable to save analysis. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // Call API to save analysis
      const response = await apiRequest("POST", "/api/save-career-analysis", {
        userId: user.id,
        ...formData,
        result: results
      });
      
      if (!response.ok) {
        throw new Error("Failed to save career analysis");
      }
      
      const data = await response.json();
      
      toast({
        title: "Analysis saved",
        description: "Your career analysis has been saved to your dashboard.",
        variant: "default"
      });
      
      console.log("Career analysis saved successfully:", data);
    } catch (error) {
      console.error("Error saving career analysis:", error);
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <div className="flex items-center">
              <h1 className="text-3xl font-bold">Career Analysis Report</h1>
              <Badge variant="outline" className="ml-3">Structured Format</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              Your personalized career pathway analysis with 11-section full structure
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="mt-4 md:mt-0"
            onClick={onRestart}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Start New Analysis
          </Button>
        </div>

        {/* Developer Debug Toggle */}
        <div className="mb-4 flex items-center justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleDevDebug}
            className="text-xs"
          >
            {showDevDebug ? "Hide" : "Developer Debug"}
          </Button>
        </div>

        {/* Debug Panel - Shows available sections in the data */}
        {showDevDebug && (
          <div className="mb-6 p-4 border rounded-lg bg-muted/30">
            <h3 className="text-sm font-medium mb-2">Debug Tools</h3>
            
            <div className="mb-4">
              <p className="text-xs mb-2 font-medium">Available sections:</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(results).map((key) => (
                  <Badge key={key} variant="outline" className="text-xs">
                    {key}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                size="sm"
                variant={debugStates.executiveSummary ? "default" : "outline"}
                className="text-xs h-8"
                onClick={() => toggleSectionDebug('executiveSummary')}
              >
                Executive Summary
              </Button>
              
              <Button
                size="sm"
                variant={debugStates.skillMapping ? "default" : "outline"}
                className="text-xs h-8"
                onClick={() => toggleSectionDebug('skillMapping')}
              >
                Skill Mapping
              </Button>
              
              <Button
                size="sm"
                variant={debugStates.gapAnalysis ? "default" : "outline"}
                className="text-xs h-8"
                onClick={() => toggleSectionDebug('gapAnalysis')}
              >
                Gap Analysis
              </Button>
              
              <Button
                size="sm"
                variant={debugStates.pathwayOptions ? "default" : "outline"}
                className="text-xs h-8"
                onClick={() => toggleSectionDebug('pathwayOptions')}
              >
                Pathway Options
              </Button>
              
              <Button
                size="sm"
                variant={debugStates.developmentPlan ? "default" : "outline"}
                className="text-xs h-8"
                onClick={() => toggleSectionDebug('developmentPlan')}
              >
                Development Plan
              </Button>
              
              <Button
                size="sm"
                variant={debugStates.educationalPrograms ? "default" : "outline"}
                className="text-xs h-8"
                onClick={() => toggleSectionDebug('educationalPrograms')}
              >
                Educational Programs
              </Button>
              
              <Button
                size="sm"
                variant={debugStates.learningRoadmap ? "default" : "outline"}
                className="text-xs h-8"
                onClick={() => toggleSectionDebug('learningRoadmap')}
              >
                Learning Roadmap
              </Button>
              
              <Button
                size="sm"
                variant={debugStates.similarRoles ? "default" : "outline"}
                className="text-xs h-8"
                onClick={() => toggleSectionDebug('similarRoles')}
              >
                Similar Roles
              </Button>
              
              <Button
                size="sm"
                variant={debugStates.quickTips ? "default" : "outline"}
                className="text-xs h-8"
                onClick={() => toggleSectionDebug('quickTips')}
              >
                Quick Tips
              </Button>
              
              <Button
                size="sm"
                variant={debugStates.growthTrajectory ? "default" : "outline"}
                className="text-xs h-8"
                onClick={() => toggleSectionDebug('growthTrajectory')}
              >
                Growth Trajectory
              </Button>
              
              <Button
                size="sm"
                variant={debugStates.learningPathRoadmap ? "default" : "outline"}
                className="text-xs h-8"
                onClick={() => toggleSectionDebug('learningPathRoadmap')}
              >
                Learning Path Roadmap
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <Tabs 
          defaultValue="overview" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 mb-6">
            <TabsTrigger value="overview">
              <InfoIcon className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="skills">
              <Sparkles className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="gap-analysis">
              <BarChart2 className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Gap Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="pathway">
              <Map className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Pathway</span>
            </TabsTrigger>
            <TabsTrigger value="development">
              <CheckCircle className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Development</span>
            </TabsTrigger>
            <TabsTrigger value="education">
              <GraduationCap className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Education</span>
            </TabsTrigger>
            <TabsTrigger value="similar-roles">
              <BriefcaseBusiness className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Similar Roles</span>
            </TabsTrigger>
            <TabsTrigger value="roadmap">
              <TrendingUp className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Roadmap</span>
            </TabsTrigger>
          </TabsList>

          {/* 1. Executive Summary */}
          <TabsContent value="overview" className="space-y-6">
            {debugStates.executiveSummary && (
              <div className="p-4 border rounded-lg bg-muted/30 mb-4 overflow-auto max-h-[300px]">
                <h3 className="text-sm font-medium mb-2">Executive Summary Data:</h3>
                <pre className="text-xs">{JSON.stringify(results.executiveSummary, null, 2)}</pre>
              </div>
            )}
            
            <div className="p-6 border rounded-lg bg-card">
              <h2 className="text-2xl font-bold mb-4">Executive Summary</h2>
              <p className="mb-6 text-muted-foreground">{results.executiveSummary.overview}</p>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Key Points</h3>
                <ul className="list-disc list-inside space-y-1">
                  {results.executiveSummary.keyPoints.map((point, index) => (
                    <li key={index} className="text-sm">{point}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Recommended Next Steps</h3>
                <ul className="list-disc list-inside space-y-1">
                  {results.executiveSummary.recommendedNextSteps.map((step, index) => (
                    <li key={index} className="text-sm">{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* 2. Skill Mapping */}
          <TabsContent value="skills" className="space-y-6">
            {debugStates.skillMapping && (
              <div className="p-4 border rounded-lg bg-muted/30 mb-4 overflow-auto max-h-[300px]">
                <h3 className="text-sm font-medium mb-2">Skill Mapping Data:</h3>
                <pre className="text-xs">{JSON.stringify(results.skillMapping, null, 2)}</pre>
              </div>
            )}
            
            <div className="p-6 border rounded-lg bg-card">
              <h2 className="text-2xl font-bold mb-4">Skill Mapping</h2>
              
              <Accordion type="single" collapsible defaultValue="sfia9">
                <AccordionItem value="sfia9">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>SFIA 9 Framework Skills</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="mt-2 space-y-4">
                      {results.skillMapping.sfia9.map((skill, index) => (
                        <div key={index} className="p-3 border rounded-md">
                          <div className="flex justify-between items-start">
                            <div className="font-medium">{skill.skill}</div>
                            <Badge>{skill.level}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{skill.description}</p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="digcomp22">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Laptop className="mr-2 h-4 w-4" />
                      <span>DigComp 2.2 Framework Competencies</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="mt-2 space-y-4">
                      {results.skillMapping.digcomp22.map((item, index) => (
                        <div key={index} className="p-3 border rounded-md">
                          <div className="flex justify-between items-start">
                            <div className="font-medium">{item.competence}</div>
                            <Badge>{item.proficiencyLevel}</Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
          
          {/* 3. Gap Analysis */}
          <TabsContent value="gap-analysis" className="space-y-6">
            {debugStates.gapAnalysis && (
              <div className="p-4 border rounded-lg bg-muted/30 mb-4 overflow-auto max-h-[300px]">
                <h3 className="text-sm font-medium mb-2">Gap Analysis Data:</h3>
                <pre className="text-xs">{JSON.stringify(results.gapAnalysis, null, 2)}</pre>
              </div>
            )}
            
            <div className="p-6 border rounded-lg bg-card">
              <h2 className="text-2xl font-bold mb-4">Framework-Based Skill Gap Analysis</h2>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Skill Radar</h3>
                  <div className="aspect-square">
                    <SkillRadarChart data={results.gapAnalysis.radarChartData} />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Skill Gap Comparison</h3>
                  <div className="aspect-square">
                    <ComparativeBarChart data={results.gapAnalysis.barChartData} />
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">AI-Enhanced Analysis</h3>
                <div className="p-4 bg-primary/5 rounded-lg border">
                  <div className="flex items-start">
                    <Sparkles className="h-5 w-5 mr-3 text-primary mt-0.5" />
                    <p className="text-sm">{results.gapAnalysis.aiAnalysis}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Skill Gaps</h3>
                  <div className="space-y-3">
                    {results.gapAnalysis.skillGaps.map((gap, index) => (
                      <div key={index} className="p-3 border rounded-md">
                        <div className="flex justify-between items-start">
                          <div className="font-medium">{gap.skill}</div>
                          <Badge 
                            variant={
                              gap.priorityLevel === 'High' ? 'destructive' : 
                              gap.priorityLevel === 'Medium' ? 'default' : 
                              'outline'
                            }
                          >
                            {gap.priorityLevel} Priority
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{gap.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Skill Strengths</h3>
                  <div className="space-y-3">
                    {results.gapAnalysis.skillStrengths.map((strength, index) => (
                      <div key={index} className="p-3 border rounded-md">
                        <div className="flex justify-between items-start">
                          <div className="font-medium">{strength.skill}</div>
                          <Badge 
                            variant={
                              strength.relevanceLevel === 'High' ? 'default' : 
                              strength.relevanceLevel === 'Medium' ? 'secondary' : 
                              'outline'
                            }
                          >
                            {strength.relevanceLevel} Relevance
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{strength.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* 4. Career Pathway Options */}
          <TabsContent value="pathway" className="space-y-6">
            {debugStates.pathwayOptions && (
              <div className="p-4 border rounded-lg bg-muted/30 mb-4 overflow-auto max-h-[300px]">
                <h3 className="text-sm font-medium mb-2">Pathway Options Data:</h3>
                <pre className="text-xs">{JSON.stringify(results.pathwayOptions, null, 2)}</pre>
              </div>
            )}
            
            <div className="p-6 border rounded-lg bg-card">
              <h2 className="text-2xl font-bold mb-4">Career Pathway Options</h2>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Career Transition Visualization</h3>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <CareerPathwayStepsDisplay 
                    currentRole={results.pathwayOptions.transitionVisualization.currentRole} 
                    targetRole={results.pathwayOptions.transitionVisualization.targetRole}
                    steps={results.pathwayOptions.transitionVisualization.transitionSteps}
                    timeframe={results.pathwayOptions.transitionVisualization.estimatedTimeframe}
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">University Pathway</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">Recommended Degrees</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {results.pathwayOptions.universityPathway.recommendedDegrees.map((degree, index) => (
                          <li key={index} className="text-sm">{degree}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">Institutions</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {results.pathwayOptions.universityPathway.institutions.map((institution, index) => (
                          <li key={index} className="text-sm">{institution}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">Estimated Timeframe</h4>
                      <p className="text-sm">{results.pathwayOptions.universityPathway.estimatedTimeframe}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">Expected Outcomes</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {results.pathwayOptions.universityPathway.expectedOutcomes.map((outcome, index) => (
                          <li key={index} className="text-sm">{outcome}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Vocational Pathway</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-1">Recommended Certifications</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {results.pathwayOptions.vocationalPathway.recommendedCertifications.map((cert, index) => (
                          <li key={index} className="text-sm">{cert}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">Providers</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {results.pathwayOptions.vocationalPathway.providers.map((provider, index) => (
                          <li key={index} className="text-sm">{provider}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">Estimated Timeframe</h4>
                      <p className="text-sm">{results.pathwayOptions.vocationalPathway.estimatedTimeframe}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-1">Expected Outcomes</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {results.pathwayOptions.vocationalPathway.expectedOutcomes.map((outcome, index) => (
                          <li key={index} className="text-sm">{outcome}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">AI Pathway Enhancement Insights</h3>
                <AIRecommendationsPanel 
                  title="Pathway Insights"
                  content={results.pathwayOptions.aiInsights}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Other tabs will be implemented similarly */}
          
          {/* Additional tab content sections would be added here */}
          <TabsContent value="development" className="space-y-6">
            {debugStates.developmentPlan && (
              <div className="p-4 border rounded-lg bg-muted/30 mb-4 overflow-auto max-h-[300px]">
                <h3 className="text-sm font-medium mb-2">Development Plan Data:</h3>
                <pre className="text-xs">{JSON.stringify(results.developmentPlan, null, 2)}</pre>
              </div>
            )}
            
            <div className="p-6 border rounded-lg bg-card">
              <h2 className="text-2xl font-bold mb-4">Comprehensive Development Plan</h2>
              {/* Development plan content */}
            </div>
          </TabsContent>
          
          <TabsContent value="education" className="space-y-6">
            {/* Educational Programs content */}
          </TabsContent>
          
          <TabsContent value="similar-roles" className="space-y-6">
            {/* Similar Roles content */}
          </TabsContent>
          
          <TabsContent value="roadmap" className="space-y-6">
            {/* Roadmap content */}
          </TabsContent>
        </Tabs>
        
        <motion.div 
          className="flex flex-col items-center gap-6 mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {/* Save to Dashboard and PDF Download buttons */}
          <div className="flex justify-center w-full gap-4">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-0.5 rounded-lg">
              <Button 
                onClick={saveToAccount}
                disabled={saving}
                className="bg-background hover:bg-background/90 text-foreground"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save to Dashboard
                  </>
                )}
              </Button>
            </div>
            
            <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-0.5 rounded-lg">
              {/* We will implement this component later */}
              {/*<StructuredPdfDownloader results={results} formData={formData} />*/}
              <Button className="bg-background hover:bg-background/90 text-foreground">
                <FileDown className="mr-2 h-4 w-4" />
                Download PDF Report
              </Button>
            </div>
          </div>
          
          <div>
            <Button 
              variant="outline" 
              onClick={onRestart}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="font-medium">Start a New Career Analysis</span>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}