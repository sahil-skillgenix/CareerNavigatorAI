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
import { Loader2, ChevronDown, ChevronUp, BarChart3, Download, Clock, RefreshCw, History } from "lucide-react";
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