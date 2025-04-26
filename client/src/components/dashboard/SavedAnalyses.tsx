import { useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronDown, ChevronUp, BarChart3, Download, Clock, RefreshCw, History, CheckCircle, PlusCircle, MoveUpRight, Eye, EyeOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import html2canvas from "html2canvas";
import { SkillRadarChart } from "@/components/career-pathway/SkillRadarChart";
import { ComparativeBarChart } from "@/components/career-pathway/ComparativeBarChart";
import { AIRecommendationsPanel } from "@/components/career-pathway/AIRecommendationsPanel";
import { CareerPathwayStepsDisplay } from "@/components/career-pathway/CareerPathwayStepsDisplay";
import { LearningRecommendationsGrid } from "@/components/career-pathway/LearningRecommendationsGrid";
import { PdfDownloader } from "@/components/career-pathway/PdfDownloader";

interface SavedAnalysis {
  id: string;
  professionalLevel: string;
  desiredRole: string;
  createdAt: string;
  progress: number;
  result?: any;
}

export function SavedAnalyses() {
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch saved career analyses
  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/dashboard"],
    queryFn: async () => {
      console.log("Fetching dashboard data...");
      
      // Get the JWT token from localStorage if available
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch("/api/dashboard", {
        headers: {
          // Add Authorization header if token exists
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include', // Include cookies in the request
      });
      
      if (!response.ok) {
        console.error("Failed to fetch dashboard data:", response.status);
        throw new Error("Failed to fetch dashboard data");
      }
      
      const data = await response.json();
      console.log("Dashboard data received:", data?.careerAnalyses?.length || 0, "analyses found");
      return data;
    }
  });
  
  // Extract analyses from dashboard data
  const analyses = dashboardData?.careerAnalyses || [];
  
  // Function to refresh dashboard data
  const refreshDashboard = async () => {
    try {
      toast({
        title: "Refreshing data...",
        description: "Getting your latest saved analyses",
        variant: "default",
      });
      
      await refetch();
      
      toast({
        title: "Data refreshed",
        description: `Found ${analyses.length} saved analyses`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not refresh dashboard data",
        variant: "destructive",
      });
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedAnalysis === id) {
      setExpandedAnalysis(null);
    } else {
      setExpandedAnalysis(id);
    }
  };

  // Completely removed the viewFullAnalysis function
  // We'll display analysis inline instead of navigating to a new page

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Unknown date";
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Saved Career Analyses
          </CardTitle>
          <CardDescription>Your previously saved career pathway analyses</CardDescription>
        </CardHeader>
        <CardContent className="h-60 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Saved Career Analyses
          </CardTitle>
          <CardDescription>Your previously saved career pathway analyses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>Failed to load saved analyses. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyses || analyses.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Saved Career Analyses
          </CardTitle>
          <CardDescription>Your previously saved career pathway analyses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>You haven't saved any career analyses yet.</p>
            <Button className="mt-4" onClick={() => window.location.href = "/career-pathway"}>
              Create Your First Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort analyses by date (newest first) and get the latest one
  const sortedAnalyses = [...analyses].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Get only the latest analysis for the main dashboard
  const latestAnalysis = sortedAnalyses.length > 0 ? sortedAnalyses[0] : null;
  const hasMultipleAnalyses = sortedAnalyses.length > 1;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Latest Career Analysis
          </CardTitle>
          <CardDescription>Your most recent career pathway analysis</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {hasMultipleAnalyses && (
            <Button 
              variant="outline" 
              size="sm"
              asChild
              className="flex items-center gap-1"
            >
              <Link href="/history">
                <History className="h-3.5 w-3.5" />
                View History
              </Link>
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshDashboard}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {latestAnalysis ? (
          <Card className="border border-muted">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{latestAnalysis.desiredRole}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(latestAnalysis.createdAt)}
                  </CardDescription>
                </div>
                <Badge variant={latestAnalysis.progress === 100 ? "default" : "outline"}>
                  {latestAnalysis.progress === 100 ? "Complete" : `${latestAnalysis.progress}%`}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-2">
              <p className="text-sm text-muted-foreground mb-2">Professional Level: {latestAnalysis.professionalLevel}</p>
              
              {expandedAnalysis === latestAnalysis.id && latestAnalysis.result && (
                <div className="mt-6 space-y-10 text-sm divide-y overflow-hidden">
                  {/* Page Title */}
                  <div className="pb-4 text-center">
                    <h2 className="text-2xl font-bold mb-2">Your Career Pathway Analysis</h2>
                    <p className="text-muted-foreground">
                      From: <span className="font-medium">{latestAnalysis.careerHistory || "Current Position"}</span> → 
                      To: <span className="font-medium">{latestAnalysis.desiredRole}</span>
                    </p>
                  </div>
                  
                  {/* Debug Toggle Button - only visible during development */}
                  <div className="py-1 mb-2 flex justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-6 px-2 py-0 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowDebugPanel(!showDebugPanel)}
                    >
                      {showDebugPanel ? (
                        <span className="flex items-center">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Hide Debug
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          Developer Debug
                        </span>
                      )}
                    </Button>
                  </div>
                  
                  {/* Debug Information Panel - Hidden by default */}
                  {showDebugPanel && (
                    <div className="py-4 mb-4">
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-sm font-medium text-amber-800">Detailed Debug Information</h5>
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Development Mode</Badge>
                        </div>
                        
                        <div className="space-y-3">
                          {/* Basic Analysis Information */}
                          <div className="p-2 bg-white/60 rounded border border-amber-100">
                            <h6 className="text-xs font-semibold text-amber-900 mb-1">Analysis Metadata</h6>
                            <p className="text-xs text-amber-700 mb-1">
                              ID: {latestAnalysis.id}
                            </p>
                            <p className="text-xs text-amber-700 mb-1">
                              Created: {latestAnalysis.createdAt}
                            </p>
                            <p className="text-xs text-amber-700 mb-1">
                              Progress: {latestAnalysis.progress}%
                            </p>
                            <p className="text-xs text-amber-700">
                              Professional Level: {latestAnalysis.professionalLevel}
                            </p>
                          </div>
                          
                          {/* Result Structure */}
                          <div className="p-2 bg-white/60 rounded border border-amber-100">
                            <h6 className="text-xs font-semibold text-amber-900 mb-1">Result Structure</h6>
                            <p className="text-xs text-amber-700 mb-1">
                              Top-level sections: {Object.keys(latestAnalysis.result || {}).join(', ')}
                            </p>
                            <div className="mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-6 px-2 py-0 bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
                                onClick={() => {
                                  console.log('Full analysis data:', latestAnalysis);
                                  toast({
                                    title: "Debug Info",
                                    description: "Full analysis data logged to console",
                                    variant: "default",
                                  });
                                }}
                              >
                                Log Full Data to Console
                              </Button>
                            </div>
                          </div>
                          
                          {/* Career Pathway Debug */}
                          <div className="p-2 bg-white/60 rounded border border-amber-100">
                            <h6 className="text-xs font-semibold text-amber-900 mb-1">Career Pathway</h6>
                            <p className="text-xs text-amber-700 mb-1">
                              Has careerPathway: {latestAnalysis.result?.careerPathway ? 'Yes' : 'No'}
                            </p>
                            {latestAnalysis.result?.careerPathway && (
                              <>
                                <p className="text-xs text-amber-700 mb-1">
                                  Pathway keys: {Object.keys(latestAnalysis.result.careerPathway).join(', ')}
                                </p>
                                {latestAnalysis.result.careerPathway.withDegree && (
                                  <p className="text-xs text-amber-700 mb-1">
                                    withDegree steps: {latestAnalysis.result.careerPathway.withDegree.length}
                                  </p>
                                )}
                                {latestAnalysis.result.careerPathway.withoutDegree && (
                                  <p className="text-xs text-amber-700 mb-1">
                                    withoutDegree steps: {latestAnalysis.result.careerPathway.withoutDegree.length}
                                  </p>
                                )}
                                <div className="mt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-6 px-2 py-0 bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
                                    onClick={() => {
                                      console.log('Career Pathway data:', latestAnalysis.result.careerPathway);
                                      const jsonString = JSON.stringify(latestAnalysis.result.careerPathway, null, 2);
                                      toast({
                                        title: "Career Pathway Data",
                                        description: "Pathway data logged to console",
                                        variant: "default",
                                      });
                                      
                                      // Create a downloadable file
                                      const blob = new Blob([jsonString], { type: 'application/json' });
                                      const url = URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `career-pathway-${latestAnalysis.id}.json`;
                                      document.body.appendChild(a);
                                      a.click();
                                      document.body.removeChild(a);
                                      URL.revokeObjectURL(url);
                                    }}
                                  >
                                    Export Pathway JSON
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {/* Skill Gap Analysis Debug */}
                          <div className="p-2 bg-white/60 rounded border border-amber-100">
                            <h6 className="text-xs font-semibold text-amber-900 mb-1">Skill Gap Analysis</h6>
                            <p className="text-xs text-amber-700 mb-1">
                              Has skillGapAnalysis: {latestAnalysis.result?.skillGapAnalysis ? 'Yes' : 'No'}
                            </p>
                            {latestAnalysis.result?.skillGapAnalysis && (
                              <>
                                <p className="text-xs text-amber-700 mb-1">
                                  Keys: {Object.keys(latestAnalysis.result.skillGapAnalysis).join(', ')}
                                </p>
                                {latestAnalysis.result.skillGapAnalysis.existingSkills && (
                                  <p className="text-xs text-amber-700 mb-1">
                                    Existing skills: {latestAnalysis.result.skillGapAnalysis.existingSkills.length}
                                  </p>
                                )}
                                {latestAnalysis.result.skillGapAnalysis.skillsToAcquire && (
                                  <p className="text-xs text-amber-700 mb-1">
                                    Skills to acquire: {latestAnalysis.result.skillGapAnalysis.skillsToAcquire.length}
                                  </p>
                                )}
                                
                                <div className="mt-2 flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-6 px-2 py-0 bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
                                    onClick={() => {
                                      console.log('Skill Gap Analysis data:', latestAnalysis.result.skillGapAnalysis);
                                      toast({
                                        title: "Skill Gap Data",
                                        description: "Skill Gap Analysis data logged to console",
                                        variant: "default",
                                      });
                                    }}
                                  >
                                    Log Skills Data
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-6 px-2 py-0 bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
                                    onClick={() => {
                                      const jsonString = JSON.stringify(latestAnalysis.result.skillGapAnalysis, null, 2);
                                      const blob = new Blob([jsonString], { type: 'application/json' });
                                      const url = URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `skill-gap-${latestAnalysis.id}.json`;
                                      document.body.appendChild(a);
                                      a.click();
                                      document.body.removeChild(a);
                                      URL.revokeObjectURL(url);
                                    }}
                                  >
                                    Export Skills JSON
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                          
                          {/* Development Plan Debug */}
                          <div className="p-2 bg-white/60 rounded border border-amber-100">
                            <h6 className="text-xs font-semibold text-amber-900 mb-1">Development Plan</h6>
                            <p className="text-xs text-amber-700 mb-1">
                              Has developmentPlan: {latestAnalysis.result?.developmentPlan ? 'Yes' : 'No'}
                            </p>
                            {latestAnalysis.result?.developmentPlan && (
                              <>
                                <p className="text-xs text-amber-700 mb-1">
                                  Keys: {Object.keys(latestAnalysis.result.developmentPlan).join(', ')}
                                </p>
                                
                                {latestAnalysis.result.developmentPlan.roadmapStages && (
                                  <p className="text-xs text-amber-700 mb-1">
                                    Roadmap stages: {latestAnalysis.result.developmentPlan.roadmapStages.length}
                                  </p>
                                )}
                                
                                {latestAnalysis.result.developmentPlan.microLearningTips && (
                                  <p className="text-xs text-amber-700 mb-1">
                                    Micro-learning tips: {latestAnalysis.result.developmentPlan.microLearningTips.length}
                                  </p>
                                )}
                                
                                {latestAnalysis.result.developmentPlan.platformSpecificCourses && (
                                  <p className="text-xs text-amber-700 mb-1">
                                    Platform courses: {Object.keys(latestAnalysis.result.developmentPlan.platformSpecificCourses).join(', ')}
                                  </p>
                                )}
                                
                                <div className="mt-2 flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-6 px-2 py-0 bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
                                    onClick={() => {
                                      console.log('Development Plan data:', latestAnalysis.result.developmentPlan);
                                      toast({
                                        title: "Development Plan Data",
                                        description: "Development Plan data logged to console",
                                        variant: "default",
                                      });
                                    }}
                                  >
                                    Log Plan Data
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-6 px-2 py-0 bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
                                    onClick={() => {
                                      const jsonString = JSON.stringify(latestAnalysis.result.developmentPlan, null, 2);
                                      const blob = new Blob([jsonString], { type: 'application/json' });
                                      const url = URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `development-plan-${latestAnalysis.id}.json`;
                                      document.body.appendChild(a);
                                      a.click();
                                      document.body.removeChild(a);
                                      URL.revokeObjectURL(url);
                                    }}
                                  >
                                    Export Plan JSON
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Executive Summary Section */}
                  {latestAnalysis.result.executiveSummary && (
                    <div className="py-8">
                      <h3 className="text-xl font-bold mb-4">Executive Summary</h3>
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <p className="text-muted-foreground leading-relaxed">{latestAnalysis.result.executiveSummary}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Skill Mapping Section */}
                  {latestAnalysis.result.skillMapping && (
                    <div className="py-8">
                      <h3 className="text-xl font-bold mb-4">Skill Mapping</h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* SFIA 9 Skills */}
                        {latestAnalysis.result.skillMapping.sfia9 && latestAnalysis.result.skillMapping.sfia9.length > 0 && (
                          <div className="bg-card border rounded-lg p-6 shadow-sm h-full">
                            <h4 className="text-base font-semibold mb-4 flex items-center">
                              <Badge className="mr-2 bg-primary/20 text-primary border-none">SFIA 9</Badge>
                              Framework Skills
                            </h4>
                            <div className="space-y-4">
                              {latestAnalysis.result.skillMapping.sfia9.map((skill: any, index: number) => (
                                <div key={index} className="pb-3 border-b last:border-0">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{skill.skill}</span>
                                    <Badge variant="outline" className="ml-2">
                                      Level {skill.level}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{skill.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* DigComp 2.2 Skills */}
                        {latestAnalysis.result.skillMapping.digcomp22 && latestAnalysis.result.skillMapping.digcomp22.length > 0 && (
                          <div className="bg-card border rounded-lg p-6 shadow-sm h-full">
                            <h4 className="text-base font-semibold mb-4 flex items-center">
                              <Badge className="mr-2 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-none">DigComp 2.2</Badge>
                              Framework Competencies
                            </h4>
                            <div className="space-y-4">
                              {latestAnalysis.result.skillMapping.digcomp22.map((comp: any, index: number) => (
                                <div key={index} className="pb-3 border-b last:border-0">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{comp.competency}</span>
                                    <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                      Level {comp.level}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{comp.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Skill Gap Analysis */}
                  {latestAnalysis.result.skillGapAnalysis && (
                    <div className="py-8">
                      <h3 className="text-xl font-bold mb-4">Skill Gap Analysis</h3>
                      
                      {/* AI Analysis */}
                      {latestAnalysis.result.skillGapAnalysis.aiAnalysis && (
                        <div className="mb-6 bg-card border rounded-lg p-6 shadow-sm">
                          <h4 className="text-base font-semibold mb-2">Analysis Overview</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {latestAnalysis.result.skillGapAnalysis.aiAnalysis}
                          </p>
                        </div>
                      )}
                      
                      {/* Skills Assessment Overview */}
                      {(latestAnalysis.result.skillGapAnalysis.existingSkills || 
                         latestAnalysis.result.skillGapAnalysis.skillsToAcquire) && (
                        <div className="mb-6 bg-card border rounded-lg p-6 shadow-sm">
                          <h4 className="text-base font-semibold mb-4">Skills Assessment Overview</h4>
                          
                          {/* Existing Skills */}
                          {latestAnalysis.result.skillGapAnalysis.existingSkills && (
                            <div className="mb-6">
                              <div className="flex items-center mb-2">
                                <CheckCircle className="h-4 w-4 text-primary mr-2" />
                                <h5 className="font-medium text-sm">Existing Skills</h5>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {latestAnalysis.result.skillGapAnalysis.existingSkills.map((skill: any, idx: number) => (
                                  <div key={idx} className="bg-primary/5 rounded-md p-3 border border-primary/10">
                                    <div className="font-medium text-sm">{skill.name || skill.skill}</div>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-xs text-muted-foreground">
                                        Level: {skill.level}
                                      </span>
                                      {skill.framework && (
                                        <Badge variant="outline" className="text-xs">
                                          {skill.framework}
                                        </Badge>
                                      )}
                                    </div>
                                    {skill.relevance && (
                                      <div className="mt-1 text-xs">
                                        Relevance: <span className="font-medium">{skill.relevance}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Skills To Develop */}
                          {latestAnalysis.result.skillGapAnalysis.skillsToAcquire && (
                            <div>
                              <div className="flex items-center mb-2">
                                <PlusCircle className="h-4 w-4 text-destructive mr-2" />
                                <h5 className="font-medium text-sm">Skills To Develop</h5>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {latestAnalysis.result.skillGapAnalysis.skillsToAcquire.map((skill: any, idx: number) => (
                                  <div key={idx} className="bg-destructive/5 rounded-md p-3 border border-destructive/10">
                                    <div className="font-medium text-sm">{skill.skill || skill.name}</div>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-xs text-muted-foreground">
                                        Priority: {skill.priority}
                                      </span>
                                      {skill.framework && (
                                        <Badge variant="outline" className="text-xs">
                                          {skill.framework}
                                        </Badge>
                                      )}
                                    </div>
                                    {skill.timeToAcquire && (
                                      <div className="mt-1 text-xs">
                                        Est. Time: <span className="font-medium">{skill.timeToAcquire}</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Grid layout for gaps and strengths */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Skill Gaps */}
                        {latestAnalysis.result.skillGapAnalysis.gaps && latestAnalysis.result.skillGapAnalysis.gaps.length > 0 && (
                          <div className="bg-card border rounded-lg shadow-sm overflow-hidden h-full">
                            <div className="bg-destructive/10 p-4 border-b">
                              <h4 className="font-semibold">Key Skill Gaps</h4>
                            </div>
                            <div className="p-4">
                              <div className="space-y-4">
                                {latestAnalysis.result.skillGapAnalysis.gaps.map((gap: any, index: number) => (
                                  <div key={index} className="pb-3 border-b last:border-0">
                                    <div className="flex items-center mb-1">
                                      <Badge 
                                        variant={gap.importance.toLowerCase() === 'high' ? 'destructive' : 'outline'} 
                                        className="mr-2"
                                      >
                                        {gap.importance}
                                      </Badge>
                                      <span className="font-medium">{gap.skill}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{gap.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Strengths */}
                        {latestAnalysis.result.skillGapAnalysis.strengths && latestAnalysis.result.skillGapAnalysis.strengths.length > 0 && (
                          <div className="bg-card border rounded-lg shadow-sm overflow-hidden h-full">
                            <div className="bg-green-100 dark:bg-green-950/30 p-4 border-b">
                              <h4 className="font-semibold text-green-800 dark:text-green-200">Key Strengths</h4>
                            </div>
                            <div className="p-4">
                              <div className="space-y-4">
                                {latestAnalysis.result.skillGapAnalysis.strengths.map((strength: any, index: number) => (
                                  <div key={index} className="pb-3 border-b last:border-0">
                                    <div className="flex items-center mb-1">
                                      <Badge 
                                        variant="secondary" 
                                        className="mr-2 bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-200"
                                      >
                                        {strength.level}
                                      </Badge>
                                      <span className="font-medium">{strength.skill}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {strength.description}
                                      {strength.relevance && (
                                        <span className="block mt-1">
                                          <span className="font-medium">Relevance:</span> {strength.relevance}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Charts Section - always show charts for better experience */}
                      <div className="grid grid-cols-1 gap-10 mb-10">
                        <div className="bg-card border rounded-lg p-6 shadow-sm">
                          <h4 className="text-base font-semibold mb-4 text-center">Skill Proficiency Overview</h4>
                          <div className="w-full h-96 mx-auto flex items-center justify-center border-b pb-2" id="radar-chart-container">
                            <div className="max-w-md w-full mx-auto">
                              {JSON.stringify(latestAnalysis.result) !== '{}' ? (
                                <SkillRadarChart results={latestAnalysis.result} />
                              ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <p className="text-sm">Chart data is unavailable</p>
                                  <p className="text-xs mt-1">Analysis result may be incomplete</p>
                                  <div className="mt-4 p-2 bg-amber-50 border border-amber-200 rounded text-amber-700 text-xs max-w-md">
                                    <p>Debug info: {JSON.stringify(latestAnalysis).substring(0, 150)}...</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-center mt-6 gap-4">
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-[#7b8cb8] mr-2"></div>
                              <span className="text-sm">Current Skill Level</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-[#1c3b82] mr-2"></div>
                              <span className="text-sm">Required Skill Level</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-4 text-center">
                            This radar chart visualizes your skill levels compared to the desired role's requirements
                          </p>
                        </div>
                        
                        <div className="bg-card border rounded-lg p-6 shadow-sm">
                          <h4 className="text-base font-semibold mb-4 text-center">Gap Analysis Comparison</h4>
                          <div className="w-full h-96 mx-auto" id="bar-chart-container">
                            {JSON.stringify(latestAnalysis.result) !== '{}' ? (
                              <ComparativeBarChart results={latestAnalysis.result} />
                            ) : (
                              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <p className="text-sm">Gap analysis data is unavailable</p>
                                <p className="text-xs mt-1">Analysis result may be incomplete</p>
                                <p className="text-xs mt-3 max-w-sm text-center text-amber-700">
                                  Diagnostic info: {typeof latestAnalysis.result === 'object' ? 
                                    (latestAnalysis.result?.skillGapAnalysis ? 'Has skillGapAnalysis' : 'Missing skillGapAnalysis') : 
                                    'Invalid result type'}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-center mt-6 gap-4">
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-[#6366f1] mr-2"></div>
                              <span className="text-sm">Current Skill Level</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-[#be123c] mr-2"></div>
                              <span className="text-sm">Required Skill Level</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-4 text-center">
                            This chart compares your current skill levels with the levels required for your target role
                          </p>
                        </div>
                      </div>
                      
                      {/* Skill Priority Distribution */}
                      {latestAnalysis.result.skillGapAnalysis?.priorityDistribution && (
                        <div className="mb-10 bg-card border rounded-lg p-6 shadow-sm">
                          <h4 className="text-base font-semibold mb-4 text-center">Skill Priority Distribution</h4>
                          <div className="space-y-3 mt-4 max-w-3xl mx-auto">
                            {Object.entries(latestAnalysis.result.skillGapAnalysis.priorityDistribution).map(([skill, info]: [string, any], idx: number) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>{skill}</span>
                                  <span className="font-medium">{info.priority}</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2.5">
                                  <div 
                                    className={`h-2.5 rounded-full ${
                                      info.priority === 'High' ? 'bg-red-500' : 
                                      info.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                                    }`}
                                    style={{ width: `${
                                      info.priority === 'High' ? '100%' : 
                                      info.priority === 'Medium' ? '66%' : '33%'
                                    }` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-center mt-6 gap-5">
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-red-500 mr-2 rounded-full"></div>
                              <span className="text-xs">High Priority</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-amber-500 mr-2 rounded-full"></div>
                              <span className="text-xs">Medium Priority</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-4 h-4 bg-blue-500 mr-2 rounded-full"></div>
                              <span className="text-xs">Low Priority</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-4 text-center">
                            Focus on high priority skills first to maximize your career transition impact
                          </p>
                        </div>
                      )}
                      
                      {/* Social & Soft Skills Development */}
                      {latestAnalysis.result.skillGapAnalysis?.softSkills && latestAnalysis.result.skillGapAnalysis.softSkills.length > 0 && (
                        <div className="mb-10 bg-card border rounded-lg p-6 shadow-sm">
                          <h4 className="text-base font-semibold mb-4 text-center">Social & Soft Skills Development</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {latestAnalysis.result.skillGapAnalysis.softSkills.map((skill: any, idx: number) => (
                              <div key={idx} className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                                <div className="font-medium mb-1">{skill.name || skill.skill}</div>
                                <p className="text-sm text-muted-foreground mb-2">{skill.description}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {skill.developmentActivities && skill.developmentActivities.map((activity: string, actIdx: number) => (
                                    <Badge key={actIdx} variant="outline" className="text-xs">
                                      {activity}
                                    </Badge>
                                  ))}
                                </div>
                                {skill.importance && (
                                  <div className="mt-2 text-xs">
                                    <span className="font-medium">Importance:</span> 
                                    <span className={`ml-1 ${
                                      skill.importance === 'High' ? 'text-red-500' : 
                                      skill.importance === 'Medium' ? 'text-amber-500' : 'text-blue-500'
                                    }`}>
                                      {skill.importance}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-6 text-center">
                            Soft skills are critical for career advancement and often differentiate top performers
                          </p>
                        </div>
                      )}
                      
                      {/* Career Pathway Section */}
                      <div className="py-8">
                        <h3 className="text-xl font-bold mb-4">Career Pathway Visualization</h3>
                        
                        {latestAnalysis.result.careerPathway ? (
                          <div className="bg-card border rounded-lg p-6 shadow-sm">
                            {/* Pathway Visualization */}
                            <div className="mt-2">
                              <CareerPathwayStepsDisplay 
                                results={latestAnalysis.result}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="bg-muted/20 border rounded-lg p-6 text-center">
                            <MoveUpRight className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                            <h4 className="text-base font-medium mb-2">Career Pathway Not Available</h4>
                            <p className="text-sm text-muted-foreground max-w-md mx-auto">
                              This analysis does not include a career pathway visualization. Generate a new analysis to include career pathway data.
                            </p>
                          </div>
                        )}
                      </div>
                      
                      {/* Similar Roles To Consider */}
                      {(latestAnalysis.result.alternativeRoles || latestAnalysis.result.similarRoles) && 
                       (latestAnalysis.result.alternativeRoles?.length > 0 || latestAnalysis.result.similarRoles?.length > 0) && (
                        <div className="py-6">
                          <h3 className="text-xl font-bold mb-4">Similar Roles To Consider</h3>
                          
                          <div className="bg-card border rounded-lg p-6 shadow-sm">
                            <p className="text-sm text-muted-foreground mb-4">
                              Based on your skills, experience, and career goals, these related roles might offer alternative paths that leverage your abilities:
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {(latestAnalysis.result.alternativeRoles || latestAnalysis.result.similarRoles).map((role: any, idx: number) => (
                                <div key={idx} className="bg-blue-50 border border-blue-100 rounded-lg p-4 shadow-sm">
                                  <h4 className="text-lg font-medium text-blue-700 mb-1">{role.title || role.role}</h4>
                                  
                                  {role.match && (
                                    <div className="mb-2">
                                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200">
                                        Match: {role.match}
                                      </Badge>
                                    </div>
                                  )}
                                  
                                  {role.similarityScore && (
                                    <div className="mb-2">
                                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200">
                                        Match: {role.similarityScore}
                                      </Badge>
                                    </div>
                                  )}
                                  
                                  <p className="text-sm text-blue-800 mb-3">{role.description}</p>
                                  
                                  {/* Key Skill Overlaps */}
                                  {(role.keySkillOverlaps || role.keySkillsOverlap) && (
                                    <div className="mb-2">
                                      <h5 className="text-xs font-semibold text-blue-700 mb-1">Key skill overlaps:</h5>
                                      <div className="flex flex-wrap gap-1">
                                        {(role.keySkillOverlaps ? role.keySkillOverlaps : 
                                          (typeof role.keySkillsOverlap === 'string' ? 
                                            role.keySkillsOverlap.split(',').map(s => s.trim()) : 
                                            Array.isArray(role.keySkillsOverlap) ? 
                                              role.keySkillsOverlap : 
                                              []
                                          )
                                        ).map((skill: string, skillIdx: number) => (
                                          <Badge key={skillIdx} variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200">
                                            {skill}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Key Difference */}
                                  {(role.keyDifference || role.uniqueRequirements) && (
                                    <div className="mb-2">
                                      <h5 className="text-xs font-semibold text-amber-600 mb-1">Key difference:</h5>
                                      <p className="text-xs text-amber-700 bg-amber-50 p-1 rounded">
                                        {role.keyDifference || role.uniqueRequirements}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Salary Range & Growth */}
                                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-blue-200">
                                    {(role.salaryRange || role.potentialSalaryRange) && (
                                      <div className="text-xs">
                                        <span className="text-slate-500">Salary Range:</span><br />
                                        <span className="font-semibold text-slate-700">{role.salaryRange || role.potentialSalaryRange}</span>
                                      </div>
                                    )}
                                    
                                    {(role.growthOutlook || role.locationSpecificDemand) && (
                                      <div className="text-xs">
                                        <span className="text-slate-500">Growth Outlook:</span><br />
                                        <span className={`font-semibold ${
                                          (role.growthOutlook?.toLowerCase().includes('excellent') || 
                                           role.locationSpecificDemand?.toLowerCase().includes('excellent')) ? 'text-emerald-600' :
                                          (role.growthOutlook?.toLowerCase().includes('good') || 
                                           role.locationSpecificDemand?.toLowerCase().includes('good')) ? 'text-blue-600' :
                                          (role.growthOutlook?.toLowerCase().includes('strong') || 
                                           role.locationSpecificDemand?.toLowerCase().includes('strong')) ? 'text-indigo-600' :
                                          'text-slate-700'
                                        }`}>
                                          {role.growthOutlook || role.locationSpecificDemand}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Development Plan - Learning Resources */}
                      {latestAnalysis.result.developmentPlan && (
                        <div className="mt-6 bg-card border rounded-lg p-6 shadow-sm">
                          <h4 className="text-base font-semibold mb-4">Learning Plan</h4>
                          {latestAnalysis.result.developmentPlan.personalizedGrowthInsights && (
                            <div className="mb-4">
                              <h5 className="text-sm font-medium mb-2">Personal Growth Insights</h5>
                              <p className="text-sm text-muted-foreground">
                                {latestAnalysis.result.developmentPlan.personalizedGrowthInsights}
                              </p>
                            </div>
                          )}
                          
                          {/* Micro-Learning Quick Tips */}
                          {latestAnalysis.result.developmentPlan.microLearningTips && 
                           latestAnalysis.result.developmentPlan.microLearningTips.length > 0 && (
                            <div className="mb-6">
                              <h5 className="text-sm font-medium mb-3 flex items-center">
                                <span className="text-rose-500 mr-1">✦</span> 
                                Micro-Learning Quick Tips by GenAI
                              </h5>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                {latestAnalysis.result.developmentPlan.microLearningTips.map((tip: any, idx: number) => (
                                  <div 
                                    key={idx} 
                                    className="bg-rose-50 border border-rose-100 rounded-lg p-4 shadow-sm"
                                  >
                                    <div className="flex items-start mb-2">
                                      <div className="w-6 h-6 bg-rose-500 text-white rounded-full mr-2 flex items-center justify-center text-xs font-medium flex-shrink-0">
                                        {idx + 1}
                                      </div>
                                      <h6 className="font-medium text-sm text-rose-700">{tip.title || tip.skill}</h6>
                                    </div>
                                    <p className="text-xs text-rose-700/80 ml-8">{tip.description}</p>
                                    
                                    <div className="flex items-center mt-2 ml-8">
                                      <div className="flex items-center text-xs text-rose-600">
                                        <div className="mr-1">
                                          <span className="font-medium">{tip.impact || "High"} Impact</span>
                                        </div>
                                      </div>
                                      
                                      {tip.timeEstimate && (
                                        <div className="flex items-center text-xs text-rose-600 ml-auto">
                                          <Clock className="h-3 w-3 mr-1" />
                                          <span>{tip.timeEstimate}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Personalized Skill Growth Trajectory */}
                          {latestAnalysis.result.developmentPlan.skillGrowthTrajectory && (
                            <div className="mb-6">
                              <h5 className="text-sm font-medium mb-3 flex items-center">
                                <span className="text-indigo-500 mr-1">↗</span> 
                                Personalized Skill Growth Trajectory
                              </h5>
                              
                              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                                <p className="text-sm text-indigo-700">
                                  {latestAnalysis.result.developmentPlan.skillGrowthTrajectory}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* AI-Enhanced Roadmap Stages */}
                          {latestAnalysis.result.developmentPlan.roadmapStages && 
                           latestAnalysis.result.developmentPlan.roadmapStages.length > 0 && (
                            <div className="mt-6 mb-6">
                              <h5 className="text-sm font-medium mb-3">AI-Enhanced Learning Roadmap</h5>
                              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100">
                                <p className="text-xs text-indigo-800 mb-4">
                                  This AI-generated roadmap provides a structured learning path to help you progress systematically.
                                </p>
                                
                                <div className="relative pt-2 pb-2">
                                  {/* Horizontal progress line */}
                                  <div className="absolute left-0 right-0 top-8 h-1 bg-indigo-200 rounded-full" />
                                  
                                  <div className="flex justify-between relative">
                                    {latestAnalysis.result.developmentPlan.roadmapStages.map((stage: any, index: number) => (
                                      <div key={index} className="flex flex-col items-center relative z-10" 
                                           style={{ width: `${100/(latestAnalysis.result.developmentPlan.roadmapStages?.length || 1)}%` }}>
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md text-xs">
                                          {stage.stage}
                                        </div>
                                        <div className="mt-2 text-center">
                                          <div className="font-medium text-indigo-800 text-xs">{stage.title}</div>
                                          <div className="text-[10px] text-indigo-600 mt-1">{stage.timeframe}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="mt-6 space-y-4">
                                  {latestAnalysis.result.developmentPlan.roadmapStages.map((stage: any, index: number) => (
                                    <div key={index} className="bg-white rounded-lg p-3 border border-indigo-100 shadow-sm">
                                      <div className="flex items-center gap-2 mb-2">
                                        <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                                          {stage.stage}
                                        </div>
                                        <div className="font-semibold text-indigo-800 text-sm">{stage.title}</div>
                                      </div>
                                      
                                      {stage.timeframe && (
                                        <div className="text-xs text-slate-500 mb-1">
                                          Timeframe: {stage.timeframe}
                                        </div>
                                      )}
                                      
                                      <p className="text-xs text-slate-600 mb-3">{stage.description}</p>
                                      
                                      {stage.focusAreas && stage.focusAreas.length > 0 && (
                                        <div className="bg-indigo-50 rounded-md p-2 mb-2">
                                          <div className="text-[10px] font-semibold text-indigo-700 mb-1">Focus Areas:</div>
                                          <div className="flex flex-wrap gap-1">
                                            {stage.focusAreas.map((area: string, idx: number) => (
                                              <span key={idx} className="inline-flex bg-indigo-100 text-indigo-800 text-[10px] px-1.5 py-0.5 rounded-full">
                                                {area}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {stage.milestones && stage.milestones.length > 0 && (
                                        <div className="bg-emerald-50 rounded-md p-2 mb-1">
                                          <div className="text-[10px] font-semibold text-emerald-700 mb-1">Key Milestones:</div>
                                          <ul className="list-disc list-inside text-[10px] text-emerald-800 space-y-1 pl-1">
                                            {stage.milestones.map((milestone: string, idx: number) => (
                                              <li key={idx}>{milestone}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Micro-Learning Tips */}
                          {latestAnalysis.result.developmentPlan.microLearningTips && 
                           latestAnalysis.result.developmentPlan.microLearningTips.length > 0 && (
                            <div className="mb-6">
                              <h5 className="text-sm font-medium mb-3">Micro-Learning Tips</h5>
                              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                                <div className="space-y-3">
                                  {latestAnalysis.result.developmentPlan.microLearningTips.map((tip: any, idx: number) => {
                                    // Determine background color based on impact level
                                    let bgClass = "bg-emerald-50";
                                    let borderClass = "border-emerald-100";
                                    let textClass = "text-emerald-800";
                                    let badgeClass = "bg-emerald-100 text-emerald-700";
                                    
                                    if (tip.impactLevel === 'high') {
                                      bgClass = "bg-rose-50";
                                      borderClass = "border-rose-100";
                                      textClass = "text-rose-800";
                                      badgeClass = "bg-rose-100 text-rose-700";
                                    } else if (tip.impactLevel === 'medium') {
                                      bgClass = "bg-amber-50";
                                      borderClass = "border-amber-100";
                                      textClass = "text-amber-800";
                                      badgeClass = "bg-amber-100 text-amber-700";
                                    }
                                    
                                    return (
                                      <div key={idx} className={`flex items-start gap-2 p-3 rounded-md border ${borderClass} ${bgClass}`}>
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-full ${badgeClass} flex items-center justify-center font-bold text-xs mt-0.5`}>
                                          {idx+1}
                                        </div>
                                        <div className="flex-1">
                                          <p className={`text-sm font-medium ${textClass.replace('800', '900')}`}>{tip.skillArea}</p>
                                          <p className={`text-xs ${textClass} mt-1`}>{tip.tip}</p>
                                          
                                          <div className="flex flex-wrap items-center mt-2 gap-2 text-xs">
                                            {tip.estimatedTimeMinutes && (
                                              <span className="text-gray-500">
                                                ⏱️ {tip.estimatedTimeMinutes} minutes
                                              </span>
                                            )}
                                            
                                            {tip.impactLevel && (
                                              <span className={`px-2 py-0.5 rounded-full ${badgeClass}`}>
                                                {tip.impactLevel.charAt(0).toUpperCase() + tip.impactLevel.slice(1)} Impact
                                              </span>
                                            )}
                                            
                                            {tip.source && (
                                              <span className="text-gray-500">
                                                Source: {tip.source}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {latestAnalysis.result.developmentPlan.resources && 
                           latestAnalysis.result.developmentPlan.resources.length > 0 && (
                            <div className="mt-4">
                              <h5 className="text-sm font-medium mb-3">Recommended Resources</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {latestAnalysis.result.developmentPlan.resources.map((resource, idx) => (
                                  <div key={idx} className="bg-muted/20 rounded-md p-3 border">
                                    <h6 className="font-medium text-sm">{resource.title}</h6>
                                    <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                                    <div className="flex items-center justify-between mt-2">
                                      <Badge variant="outline" className="text-xs">
                                        {resource.type}
                                      </Badge>
                                      {resource.estimatedTime && (
                                        <span className="text-xs text-muted-foreground">
                                          {resource.estimatedTime}
                                        </span>
                                      )}
                                    </div>
                                    {resource.link && (
                                      <a 
                                        href={resource.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline mt-2 inline-block"
                                      >
                                        View Resource
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Platform-Specific Courses */}
                          {latestAnalysis.result.developmentPlan.platformSpecificCourses && (
                            <div className="mt-6">
                              <h5 className="text-sm font-medium mb-3">Platform-Specific Courses</h5>
                              
                              {/* Microsoft Learn */}
                              {latestAnalysis.result.developmentPlan.platformSpecificCourses.microsoft && 
                               latestAnalysis.result.developmentPlan.platformSpecificCourses.microsoft.length > 0 && (
                                <div className="mb-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <svg className="h-5 w-5" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M0 0H11V11H0V0Z" fill="#F25022"/>
                                      <path d="M12 0H23V11H12V0Z" fill="#7FBA00"/>
                                      <path d="M0 12H11V23H0V12Z" fill="#00A4EF"/>
                                      <path d="M12 12H23V23H12V12Z" fill="#FFB900"/>
                                    </svg>
                                    <h6 className="text-sm font-medium">Microsoft Learn</h6>
                                  </div>
                                  <div className="space-y-2">
                                    {latestAnalysis.result.developmentPlan.platformSpecificCourses.microsoft.map((course: any, idx: number) => (
                                      <div key={idx} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-900/40">
                                        <div className="font-medium text-sm text-blue-800 dark:text-blue-200">{course.title}</div>
                                        <div className="flex items-center justify-between mt-2 text-xs">
                                          <span className="text-blue-600 dark:text-blue-400">Level: {course.level}</span>
                                          <span className="text-blue-600 dark:text-blue-400">{course.duration}</span>
                                        </div>
                                        {course.url && (
                                          <a 
                                            href={course.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-700 dark:text-blue-300 hover:underline mt-2 inline-block"
                                          >
                                            View Course
                                          </a>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* LinkedIn Learning */}
                              {latestAnalysis.result.developmentPlan.platformSpecificCourses.linkedinLearning && 
                               latestAnalysis.result.developmentPlan.platformSpecificCourses.linkedinLearning.length > 0 && (
                                <div className="mb-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill="#0077B5"/>
                                    </svg>
                                    <h6 className="text-sm font-medium">LinkedIn Learning</h6>
                                  </div>
                                  <div className="space-y-2">
                                    {latestAnalysis.result.developmentPlan.platformSpecificCourses.linkedinLearning.map((course: any, idx: number) => (
                                      <div key={idx} className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md border border-blue-100 dark:border-blue-900/40">
                                        <div className="font-medium text-sm text-blue-800 dark:text-blue-200">{course.title}</div>
                                        <div className="flex items-center justify-between mt-2 text-xs">
                                          <span className="text-blue-600 dark:text-blue-400">By: {course.author}</span>
                                          <span className="text-blue-600 dark:text-blue-400">{course.duration}</span>
                                        </div>
                                        {course.url && (
                                          <a 
                                            href={course.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-700 dark:text-blue-300 hover:underline mt-2 inline-block"
                                          >
                                            View Course
                                          </a>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Udemy */}
                              {latestAnalysis.result.developmentPlan.platformSpecificCourses.udemy && 
                               latestAnalysis.result.developmentPlan.platformSpecificCourses.udemy.length > 0 && (
                                <div className="mb-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M12 0L5.81 3.573v3.574l6.189-3.574 6.191 3.574V3.573z" fill="#A435F0"/>
                                      <path d="M5.81 7.147v6.191l6.189 3.574 6.191-3.574V7.147l-6.191 3.574z" fill="#A435F0"/>
                                      <path d="M5.81 16.911l6.189 3.574 6.191-3.574v-3.574l-6.191 3.574-6.189-3.574z" fill="#A435F0"/>
                                    </svg>
                                    <h6 className="text-sm font-medium">Udemy</h6>
                                  </div>
                                  <div className="space-y-2">
                                    {latestAnalysis.result.developmentPlan.platformSpecificCourses.udemy.map((course: any, idx: number) => (
                                      <div key={idx} className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-md border border-purple-100 dark:border-purple-900/40">
                                        <div className="font-medium text-sm text-purple-800 dark:text-purple-200">{course.title}</div>
                                        <div className="flex items-center justify-between mt-2 text-xs">
                                          <span className="text-purple-600 dark:text-purple-400">Instructor: {course.instructorName}</span>
                                          <span className="text-purple-600 dark:text-purple-400">Rating: {course.rating}</span>
                                        </div>
                                        {course.url && (
                                          <a 
                                            href={course.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs text-purple-700 dark:text-purple-300 hover:underline mt-2 inline-block"
                                          >
                                            View Course
                                          </a>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Career Pathway Section */}
                  {latestAnalysis.result.careerPathway && (
                    <div className="py-8">
                      <h3 className="text-xl font-bold mb-4">Career Pathway</h3>
                      
                      {/* Career Transition AI Analysis */}
                      {latestAnalysis.result.careerPathway.aiAnalysis && (
                        <div className="mb-6 bg-card border rounded-lg p-6 shadow-sm">
                          <h4 className="text-base font-semibold mb-2">Transition Strategy</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {latestAnalysis.result.careerPathway.aiAnalysis}
                          </p>
                        </div>
                      )}
                      
                      {/* Fallback for old format */}
                      {latestAnalysis.result.careerPathway.aiRecommendations && !latestAnalysis.result.careerPathway.aiAnalysis && (
                        <div className="mb-6 bg-card border rounded-lg p-6 shadow-sm">
                          <h4 className="text-base font-semibold mb-2">Transition Strategy</h4>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {latestAnalysis.result.careerPathway.aiRecommendations}
                          </p>
                        </div>
                      )}
                      
                      {/* Career Steps */}
                      {latestAnalysis.result.careerPathway.steps && latestAnalysis.result.careerPathway.steps.length > 0 && (
                        <div className="mt-6 bg-card border rounded-lg p-6 shadow-sm">
                          <h4 className="text-base font-semibold mb-4">Career Progression Steps</h4>
                          <div className="mt-4">
                            <CareerPathwayStepsDisplay results={latestAnalysis.result} />
                          </div>
                        </div>
                      )}
                      
                      {/* Legacy Pathway Tabs for Degree/Non-Degree paths */}
                      {(!latestAnalysis.result.careerPathway.steps && 
                        (latestAnalysis.result.careerPathway.withDegree || latestAnalysis.result.careerPathway.withoutDegree)) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                          {/* University Pathway */}
                          {latestAnalysis.result.careerPathway.withDegree && latestAnalysis.result.careerPathway.withDegree.length > 0 && (
                            <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
                              <div className="bg-primary/10 p-4 border-b">
                                <h4 className="font-semibold">University Pathway</h4>
                              </div>
                              <div className="p-4">
                                <div className="space-y-6">
                                  {latestAnalysis.result.careerPathway.withDegree.map((step: any, index: number) => (
                                    <div key={index} className="flex items-start pb-4 border-b last:border-0 last:pb-0">
                                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary mr-3 mt-1">
                                        <span className="font-semibold">{index + 1}</span>
                                      </div>
                                      <div>
                                        <h5 className="font-semibold mb-1">{step.role}</h5>
                                        <p className="text-sm text-muted-foreground mb-2">{step.timeframe}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          <p className="text-xs font-medium w-full mb-1">Key Skills:</p>
                                          {step.keySkillsNeeded.map((skill: string, idx: number) => (
                                            <Badge key={idx} variant="outline" className="text-xs">
                                              {skill}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Vocational Pathway */}
                          {latestAnalysis.result.careerPathway.withoutDegree && latestAnalysis.result.careerPathway.withoutDegree.length > 0 && (
                            <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
                              <div className="bg-emerald-100 dark:bg-emerald-950/30 p-4 border-b">
                                <h4 className="font-semibold text-emerald-800 dark:text-emerald-300">Vocational Pathway</h4>
                              </div>
                              <div className="p-4">
                                <div className="space-y-6">
                                  {latestAnalysis.result.careerPathway.withoutDegree.map((step: any, index: number) => (
                                    <div key={index} className="flex items-start pb-4 border-b last:border-0 last:pb-0">
                                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 mr-3 mt-1">
                                        <span className="font-semibold">{index + 1}</span>
                                      </div>
                                      <div>
                                        <h5 className="font-semibold mb-1">{step.role}</h5>
                                        <p className="text-sm text-muted-foreground mb-2">{step.timeframe}</p>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                          <p className="text-xs font-medium w-full mb-1">Key Skills:</p>
                                          {step.keySkillsNeeded.map((skill: string, idx: number) => (
                                            <Badge key={idx} variant="outline" className="text-xs">
                                              {skill}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => toggleExpand(latestAnalysis.id)}
                className="flex-1 justify-start"
              >
                {expandedAnalysis === latestAnalysis.id ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" /> Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" /> Show More
                  </>
                )}
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={async () => {
                    toast({
                      title: "Preparing report...",
                      description: "Capturing charts and generating HTML report",
                      variant: "default",
                    });
                    
                    // Ensure charts are visible to capture
                    const ensureElementsAreRendered = () => {
                      return new Promise<void>(resolve => {
                        // Briefly wait to ensure DOM is updated
                        setTimeout(() => {
                          resolve();
                        }, 500);
                      });
                    };
                    
                    // Function to capture chart as base64 image with retry
                    const captureChartAsImage = async (elementId: string, retries = 3) => {
                      const element = document.getElementById(elementId);
                      if (!element) {
                        console.error(`Chart element '${elementId}' not found`);
                        return '';
                      }
                      
                      try {
                        // Force element to be visible if hidden
                        const originalDisplay = element.style.display;
                        const originalVisibility = element.style.visibility;
                        const originalHeight = element.style.height;
                        
                        element.style.display = 'block';
                        element.style.visibility = 'visible';
                        element.style.height = 'auto';
                        
                        // Wait for rendering
                        await ensureElementsAreRendered();
                        
                        // Capture with html2canvas
                        const canvas = await html2canvas(element, {
                          scale: 2,
                          backgroundColor: '#ffffff',
                          logging: false,
                          useCORS: true,
                          allowTaint: true,
                          foreignObjectRendering: true,
                        });
                        
                        // Restore original styles
                        element.style.display = originalDisplay;
                        element.style.visibility = originalVisibility;
                        element.style.height = originalHeight;
                        
                        return canvas.toDataURL('image/png');
                      } catch (error) {
                        console.error(`Error capturing chart ${elementId}:`, error);
                        
                        if (retries > 0) {
                          console.log(`Retrying capture for ${elementId}, ${retries} attempts remaining`);
                          await new Promise(resolve => setTimeout(resolve, 500));
                          return captureChartAsImage(elementId, retries - 1);
                        }
                        
                        return '';
                      }
                    };

                      // Capture chart images
                      await ensureElementsAreRendered();
                      const radarChartImage = await captureChartAsImage('radar-chart-container');
                      const barChartImage = await captureChartAsImage('bar-chart-container');
                      
                      // Create HTML content
                      const htmlContent = `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                          <meta charset="UTF-8">
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <title>Skillgenix Career Analysis - ${latestAnalysis.desiredRole}</title>
                          <style>
                            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
                            h1, h2, h3, h4 { color: #1c3b82; }
                            h1 { font-size: 28px; text-align: center; margin-bottom: 30px; }
                            h2 { font-size: 24px; margin-top: 40px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                            h3 { font-size: 20px; }
                            p { margin-bottom: 16px; }
                            .card { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                            .header { text-align: center; margin-bottom: 40px; }
                            .badge { display: inline-block; border-radius: 4px; padding: 3px 8px; font-size: 12px; font-weight: 600; }
                            .badge-primary { background: rgba(28,59,130,0.1); color: #1c3b82; }
                            .badge-success { background: rgba(34,197,94,0.1); color: #166534; }
                            .badge-danger { background: rgba(239,68,68,0.1); color: #b91c1c; }
                            .badge-info { background: rgba(6,182,212,0.1); color: #155e75; }
                            .skill-item { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
                            .skill-item:last-child { border-bottom: none; }
                            .two-columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(480px, 1fr)); gap: 20px; }
                            .charts-section { margin-top: 40px; margin-bottom: 40px; }
                            .chart-container { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center; }
                            .chart-image { max-width: 100%; height: auto; margin: 0 auto; display: block; }
                            .chart-caption { margin-top: 15px; font-size: 14px; color: #666; text-align: center; }
                            .pathway-step { display: flex; margin-bottom: 20px; }
                            .step-number { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; background: rgba(28,59,130,0.1); color: #1c3b82; border-radius: 50%; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
                            .skills-list { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
                            .skill-tag { background: #f5f5f5; padding: 3px 8px; border-radius: 4px; font-size: 12px; }
                            .legend { display: flex; gap: 15px; justify-content: center; margin: 10px 0; }
                            .legend-item { display: flex; align-items: center; font-size: 13px; }
                            .legend-color { width: 12px; height: 12px; margin-right: 5px; display: inline-block; }
                            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
                            @media print {
                              body { font-size: 12pt; }
                              .no-print { display: none; }
                              h2 { font-size: 18pt; }
                              h3 { font-size: 16pt; }
                              .card { border: none; box-shadow: none; padding: 0; margin-bottom: 30px; }
                              .two-columns { grid-template-columns: 1fr 1fr; }
                            }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <h1>Career Pathway Analysis</h1>
                            <p>From <strong>${latestAnalysis.careerHistory || "Current Position"}</strong> to <strong>${latestAnalysis.desiredRole}</strong></p>
                            <p>Professional Level: <strong>${latestAnalysis.professionalLevel}</strong></p>
                          </div>
                          
                          <h2>Executive Summary</h2>
                          <div class="card">
                            <p>${latestAnalysis.result.executiveSummary}</p>
                          </div>
                          
                          <h2>Skill Mapping</h2>
                          <div class="two-columns">
                            <!-- SFIA 9 Skills -->
                            <div class="card">
                              <h3><span class="badge badge-primary">SFIA 9</span> Framework Skills</h3>
                              ${latestAnalysis.result.skillMapping?.sfia9 ? 
                                latestAnalysis.result.skillMapping.sfia9.map((skill: any) => `
                                  <div class="skill-item">
                                    <div style="display: flex; justify-content: space-between;">
                                      <span style="font-weight: 600;">${skill.skill}</span>
                                      <span class="badge badge-primary">Level ${skill.level}</span>
                                    </div>
                                    <p style="font-size: 14px; color: #666;">${skill.description}</p>
                                  </div>
                                `).join('') : '<p>No SFIA 9 skills mapped.</p>'}
                            </div>
                            
                            <!-- DigComp 2.2 Skills -->
                            <div class="card">
                              <h3><span class="badge badge-info">DigComp 2.2</span> Framework Competencies</h3>
                              ${latestAnalysis.result.skillMapping?.digcomp22 ? 
                                latestAnalysis.result.skillMapping.digcomp22.map((comp: any) => `
                                  <div class="skill-item">
                                    <div style="display: flex; justify-content: space-between;">
                                      <span style="font-weight: 600;">${comp.competency}</span>
                                      <span class="badge badge-info">Level ${comp.level}</span>
                                    </div>
                                    <p style="font-size: 14px; color: #666;">${comp.description}</p>
                                  </div>
                                `).join('') : '<p>No DigComp 2.2 competencies mapped.</p>'}
                            </div>
                          </div>
                          
                          <!-- Skill Visualizations Section -->
                          <div class="charts-section">
                            <h2>Skill Visualizations</h2>
                            <div>
                              <!-- Radar Chart -->
                              <div class="chart-container">
                                <h3>Skill Proficiency Overview</h3>
                                ${radarChartImage ? `
                                  <img src="${radarChartImage}" alt="Skill Radar Chart" class="chart-image" style="max-width: 100%; width: 800px;" />
                                  <div class="legend">
                                    <div class="legend-item">
                                      <span class="legend-color" style="background-color: #7b8cb8;"></span>
                                      <span>Current Level</span>
                                    </div>
                                    <div class="legend-item">
                                      <span class="legend-color" style="background-color: #1c3b82;"></span>
                                      <span>Required Level</span>
                                    </div>
                                  </div>
                                  <p class="chart-caption">This radar chart visualizes your skill levels compared to the desired role's requirements</p>
                                ` : '<p>Chart visualization could not be generated.</p>'}
                              </div>
                              
                              <!-- Bar Chart -->
                              <div class="chart-container">
                                <h3>Gap Analysis Comparison</h3>
                                ${barChartImage ? `
                                  <img src="${barChartImage}" alt="Skill Gap Comparison" class="chart-image" style="max-width: 100%; width: 800px;" />
                                  <div class="legend">
                                    <div class="legend-item">
                                      <span class="legend-color" style="background-color: #6366f1;"></span>
                                      <span>Current Level</span>
                                    </div>
                                    <div class="legend-item">
                                      <span class="legend-color" style="background-color: #be123c;"></span>
                                      <span>Required Level</span>
                                    </div>
                                  </div>
                                  <p class="chart-caption">This chart compares your current skill levels with the levels required for your target role</p>
                                ` : '<p>Chart visualization could not be generated.</p>'}
                              </div>
                            </div>
                          </div>
                          
                          <h2>Skill Gap Analysis</h2>
                          ${latestAnalysis.result.skillGapAnalysis?.aiAnalysis ? `
                          <div class="card">
                            <h3>Analysis Overview</h3>
                            <p>${latestAnalysis.result.skillGapAnalysis.aiAnalysis}</p>
                          </div>` : ''}
                        
                        <div class="two-columns">
                          <!-- Skill Gaps -->
                          <div class="card">
                            <h3>Key Skill Gaps</h3>
                            ${latestAnalysis.result.skillGapAnalysis?.gaps ? 
                              latestAnalysis.result.skillGapAnalysis.gaps.map((gap: any) => `
                                <div class="skill-item">
                                  <div style="display: flex; align-items: center; margin-bottom: 4px;">
                                    <span class="badge badge-danger" style="margin-right: 8px;">${gap.importance}</span>
                                    <span style="font-weight: 600;">${gap.skill}</span>
                                  </div>
                                  <p style="font-size: 14px; color: #666;">${gap.description}</p>
                                </div>
                              `).join('') : '<p>No skill gaps identified.</p>'}
                          </div>
                          
                          <!-- Strengths -->
                          <div class="card">
                            <h3>Key Strengths</h3>
                            ${latestAnalysis.result.skillGapAnalysis?.strengths ? 
                              latestAnalysis.result.skillGapAnalysis.strengths.map((strength: any) => `
                                <div class="skill-item">
                                  <div style="display: flex; align-items: center; margin-bottom: 4px;">
                                    <span class="badge badge-success" style="margin-right: 8px;">${strength.level}</span>
                                    <span style="font-weight: 600;">${strength.skill}</span>
                                  </div>
                                  <p style="font-size: 14px; color: #666;">${strength.description}</p>
                                </div>
                              `).join('') : '<p>No strengths identified.</p>'}
                          </div>
                        </div>
                        
                        <h2>Career Pathway</h2>
                        ${latestAnalysis.result.careerPathway?.aiAnalysis ? `
                        <div class="card">
                          <h3>Transition Strategy</h3>
                          <p>${latestAnalysis.result.careerPathway.aiAnalysis}</p>
                        </div>` : 
                        latestAnalysis.result.careerPathway?.aiRecommendations ? `
                        <div class="card">
                          <h3>Transition Strategy</h3>
                          <p>${latestAnalysis.result.careerPathway.aiRecommendations}</p>
                        </div>` : ''}
                        
                        <div class="card">
                          <h3>Career Progression Steps</h3>
                          ${latestAnalysis.result.careerPathway?.steps ? 
                            latestAnalysis.result.careerPathway.steps.map((step: any, index: number) => `
                              <div class="pathway-step">
                                <div class="step-number">${index + 1}</div>
                                <div>
                                  <h4>${step.title}</h4>
                                  <p>${step.description}</p>
                                  ${step.duration ? `<p><strong>Duration:</strong> ${step.duration}</p>` : ''}
                                  ${step.skills ? `
                                    <div>
                                      <strong>Key Skills to Develop:</strong>
                                      <div class="skills-list">
                                        ${step.skills.map((skill: any) => `<span class="skill-tag">${skill}</span>`).join('')}
                                      </div>
                                    </div>` : ''}
                                </div>
                              </div>
                            `).join('') : 
                            
                            // Handle legacy format
                            (latestAnalysis.result.careerPathway?.withDegree || latestAnalysis.result.careerPathway?.withoutDegree) ? `
                              ${latestAnalysis.result.careerPathway.withDegree ? `
                                <div>
                                  <h4>University Pathway</h4>
                                  ${latestAnalysis.result.careerPathway.withDegree.map((step: any, index: number) => `
                                    <div class="pathway-step">
                                      <div class="step-number">${index + 1}</div>
                                      <div>
                                        <h4>${step.role}</h4>
                                        <p>${step.timeframe}</p>
                                        <div>
                                          <strong>Key Skills:</strong>
                                          <div class="skills-list">
                                            ${step.keySkillsNeeded.map((skill: any) => `<span class="skill-tag">${skill}</span>`).join('')}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  `).join('')}
                                </div>
                              ` : ''}
                              
                              ${latestAnalysis.result.careerPathway.withoutDegree ? `
                                <div style="margin-top: 20px;">
                                  <h4>Vocational Pathway</h4>
                                  ${latestAnalysis.result.careerPathway.withoutDegree.map((step: any, index: number) => `
                                    <div class="pathway-step">
                                      <div class="step-number" style="background: rgba(16,185,129,0.1); color: #047857;">${index + 1}</div>
                                      <div>
                                        <h4>${step.role}</h4>
                                        <p>${step.timeframe}</p>
                                        <div>
                                          <strong>Key Skills:</strong>
                                          <div class="skills-list">
                                            ${step.keySkillsNeeded.map((skill: any) => `<span class="skill-tag">${skill}</span>`).join('')}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  `).join('')}
                                </div>
                              ` : ''}
                            ` : '<p>No career pathway steps defined.</p>'}
                        </div>
                        
                        ${latestAnalysis.result.learningRecommendations?.resources ? `
                        <h2>Learning Recommendations</h2>
                        <div class="card">
                          <h3>Recommended Resources</h3>
                          ${latestAnalysis.result.learningRecommendations.resources.map((resource: any) => `
                            <div class="skill-item">
                              <h4>${resource.title}</h4>
                              <p>${resource.description}</p>
                              <p><strong>Resource Type:</strong> ${resource.type}</p>
                              ${resource.link ? `<p><strong>Link:</strong> <a href="${resource.link}" target="_blank">${resource.link}</a></p>` : ''}
                              ${resource.estimatedTime ? `<p><strong>Estimated Time:</strong> ${resource.estimatedTime}</p>` : ''}
                            </div>
                          `).join('')}
                        </div>
                        ` : ''}
                        
                        ${latestAnalysis.result.aiRecommendations ? `
                        <h2>AI Recommendations</h2>
                        <div class="card">
                          ${latestAnalysis.result.aiRecommendations.map((rec: any) => `
                            <div class="skill-item">
                              <h4>${rec.title}</h4>
                              <p>${rec.description}</p>
                            </div>
                          `).join('')}
                        </div>
                        ` : ''}
                        
                        <div class="footer">
                          <p>Generated by Skillgenix Career Analysis | ${new Date().toISOString().split('T')[0]}</p>
                        </div>
                      </body>
                      </html>
                    `;
                  
                    try {
                      // Create a blob and download link
                      const blob = new Blob([htmlContent], { type: 'text/html' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Skillgenix_Career_Analysis_${latestAnalysis.desiredRole.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
                      document.body.appendChild(a);
                      a.click();
                      
                      // Clean up
                      setTimeout(() => {
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }, 0);
                    } catch (error) {
                      console.error('Error generating HTML report:', error);
                      toast({
                        title: "Error",
                        description: "Could not generate HTML report. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  <Download className="h-4 w-4" /> HTML Report
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => window.open(`/api/career-analyses/${latestAnalysis.id}/pdf`, '_blank')}
                >
                  <Download className="h-4 w-4" /> PDF Report
                </Button>
              </div>
            </CardFooter>
          </Card>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No career analysis found. Create your first one!</p>
            <Button className="mt-4" onClick={() => window.location.href = "/career-pathway"}>
              Create Your First Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}