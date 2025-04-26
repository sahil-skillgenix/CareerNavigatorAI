import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, ChevronDown, ChevronUp, BarChart3, Download, Clock, RefreshCw, 
  History, CheckCircle, PlusCircle, MoveUpRight, Eye, EyeOff, ChevronRight, 
  User, Briefcase, GraduationCap, Users, CalendarRange, BookText, 
  ScrollText, Sparkles, PanelRight, Star, Award, GanttChart, 
  School, LineChart, Brain, Gauge, ExternalLink, BadgePlus, ListChecks, Book
} from "lucide-react";
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
              
              <div className="flex items-center justify-end mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1 text-xs"
                  onClick={() => toggleExpand(latestAnalysis.id)}
                >
                  {expandedAnalysis === latestAnalysis.id ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />
                      View Analysis
                    </>
                  )}
                </Button>
              </div>
              
              {expandedAnalysis === latestAnalysis.id && latestAnalysis.result && (
                <div className="mt-6 space-y-10 text-sm overflow-hidden">
                  {/* Page Title */}
                  <div className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Your Career Pathway Analysis</h2>
                        <p className="text-muted-foreground">
                          From: <span className="font-medium">{latestAnalysis.careerHistory || "Current Position"}</span> → 
                          To: <span className="font-medium">{latestAnalysis.desiredRole}</span>
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 px-3 py-0 bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                          onClick={() => {
                            toast({
                              title: "Generating PDF",
                              description: "Your analysis PDF is being prepared",
                              variant: "default",
                            });
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 px-3 py-0 bg-muted/50"
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
                    </div>
                    <Separator className="mt-4" />
                  </div>
                  
                  {/* SECTION 1: Executive Summary */}
                  <section className="py-6 border-b border-muted">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold flex items-center text-primary">
                        <ScrollText className="mr-2 h-5 w-5" />
                        Executive Summary
                      </h2>
                    </div>
                    
                    {latestAnalysis.result.executiveSummary ? (
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {latestAnalysis.result.executiveSummary}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-muted/30 border rounded-lg p-6 text-center">
                        <p className="text-muted-foreground">No executive summary available</p>
                      </div>
                    )}
                  </section>
                  
                  {/* SECTION 2: Skill Mapping */}
                  <section className="py-6 border-b border-muted">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold flex items-center text-primary">
                        <Gauge className="mr-2 h-5 w-5" />
                        Skill Mapping
                      </h2>
                    </div>
                    
                    <div className="space-y-6">
                      {/* 2.1 SFIA 9 Framework */}
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Badge className="mr-2 bg-primary/20 text-primary border-none">2.1</Badge>
                          Skill Mapping in SFIA 9 Framework
                        </h3>
                        
                        {latestAnalysis.result.skillMapping?.sfia9 && latestAnalysis.result.skillMapping.sfia9.length > 0 ? (
                          <div className="space-y-4">
                            {latestAnalysis.result.skillMapping.sfia9.map((skill, index) => (
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
                        ) : (
                          <div className="bg-muted/30 rounded-lg p-4 text-center">
                            <p className="text-muted-foreground">No SFIA 9 framework mapping available</p>
                          </div>
                        )}
                      </div>
                      
                      {/* 2.2 DigComp 2.2 Framework */}
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Badge className="mr-2 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-none">2.2</Badge>
                          Skill Mapping in DigComp 2.2 Framework
                        </h3>
                        
                        {latestAnalysis.result.skillMapping?.digcomp22 && latestAnalysis.result.skillMapping.digcomp22.length > 0 ? (
                          <div className="space-y-4">
                            {latestAnalysis.result.skillMapping.digcomp22.map((skill, index) => (
                              <div key={index} className="pb-3 border-b last:border-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">{skill.competence}</span>
                                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                                    {skill.proficiencyLevel}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{skill.description}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-muted/30 rounded-lg p-4 text-center">
                            <p className="text-muted-foreground">No DigComp 2.2 framework mapping available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                  
                  {/* SECTION 3: Framework-Based Skill Gap Analysis */}
                  <section className="py-6 border-b border-muted">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold flex items-center text-primary">
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Framework-Based Skill Gap Analysis
                      </h2>
                    </div>
                    
                    <div className="space-y-6">
                      {/* 3.1 Radar Chart */}
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Badge className="mr-2 bg-primary/20 text-primary border-none">3.1</Badge>
                          Radar Chart Visualization
                        </h3>
                        
                        {(latestAnalysis.result.radarChartData?.skills || 
                          latestAnalysis.result.chartData?.currentSkills) ? (
                          <div className="h-72">
                            {/* Temporarily render a placeholder instead of SkillRadarChart */}
                            <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg">
                              <p className="text-center">Skill Radar Chart Visualization</p>
                            </div>
                          </div>
                        ) : (
                          <div className="h-72 flex items-center justify-center bg-muted/30 rounded-lg">
                            <p className="text-muted-foreground">No radar chart data available</p>
                          </div>
                        )}
                      </div>
                      
                      {/* 3.2 Bar Chart */}
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Badge className="mr-2 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-none">3.2</Badge>
                          Bar Chart Visualization
                        </h3>
                        
                        {(latestAnalysis.result.barChartData?.skills || 
                          latestAnalysis.result.chartData?.skillGaps) ? (
                          <div className="h-72">
                            {/* Temporarily render a placeholder instead of ComparativeBarChart */}
                            <div className="h-full flex items-center justify-center bg-muted/20 rounded-lg">
                              <p className="text-center">Comparative Bar Chart Visualization</p>
                            </div>
                          </div>
                        ) : (
                          <div className="h-72 flex items-center justify-center bg-muted/30 rounded-lg">
                            <p className="text-muted-foreground">No bar chart data available</p>
                          </div>
                        )}
                      </div>
                      
                      {/* 3.3 AI-Enhanced Analysis */}
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Badge className="mr-2 bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-none">3.3</Badge>
                          AI-Enhanced Analysis
                        </h3>
                        
                        {latestAnalysis.result.skillGapAnalysis?.aiAnalysis ? (
                          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
                            <p className="text-sm text-blue-800 whitespace-pre-line">
                              {latestAnalysis.result.skillGapAnalysis.aiAnalysis}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-muted/30 rounded-lg p-4 text-center">
                            <p className="text-muted-foreground">No AI-enhanced analysis available</p>
                          </div>
                        )}
                      </div>
                      
                      {/* 3.4 Skill Gaps and Strengths */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Skill Gaps */}
                        <div className="bg-card border rounded-lg shadow-sm overflow-hidden h-full">
                          <div className="bg-destructive/10 p-4 border-b">
                            <h4 className="font-semibold">Skill Gaps</h4>
                          </div>
                          <div className="p-4">
                            {latestAnalysis.result.skillGapAnalysis?.gaps && 
                             latestAnalysis.result.skillGapAnalysis.gaps.length > 0 ? (
                              <div className="space-y-4">
                                {latestAnalysis.result.skillGapAnalysis.gaps.map((gap, index) => (
                                  <div key={index} className="pb-3 border-b last:border-0">
                                    <div className="flex items-center mb-1">
                                      <Badge 
                                        variant={gap.importance?.toLowerCase() === 'high' ? 'destructive' : 'outline'} 
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
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-muted-foreground">No skill gaps identified</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Strengths */}
                        <div className="bg-card border rounded-lg shadow-sm overflow-hidden h-full">
                          <div className="bg-green-100 dark:bg-green-950/30 p-4 border-b">
                            <h4 className="font-semibold text-green-800 dark:text-green-200">Strengths</h4>
                          </div>
                          <div className="p-4">
                            {latestAnalysis.result.skillGapAnalysis?.strengths && 
                             latestAnalysis.result.skillGapAnalysis.strengths.length > 0 ? (
                              <div className="space-y-4">
                                {latestAnalysis.result.skillGapAnalysis.strengths.map((strength, index) => (
                                  <div key={index} className="pb-3 border-b last:border-0">
                                    <div className="flex items-center mb-1">
                                      <Badge 
                                        variant="outline" 
                                        className="mr-2 bg-green-50 text-green-700 border-green-200"
                                      >
                                        {strength.relevance || "Relevant"}
                                      </Badge>
                                      <span className="font-medium">{strength.skill}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{strength.description || strength.applicationToRole}</p>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-4">
                                <p className="text-muted-foreground">No key strengths identified</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  {/* SECTION 4: Career Pathway Options */}
                  <section className="py-6 border-b border-muted">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold flex items-center text-primary">
                        <GanttChart className="mr-2 h-5 w-5" />
                        Career Pathway Options
                      </h2>
                    </div>
                    
                    <div className="space-y-6">
                      {/* 4.1 Career Transition Visualization */}
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Badge className="mr-2 bg-primary/20 text-primary border-none">4.1</Badge>
                          Career Transition Visualization
                        </h3>
                        
                        {latestAnalysis.result.careerPathway?.pathwayExplanation ? (
                          <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
                            <p className="text-sm text-blue-800 whitespace-pre-line">
                              {latestAnalysis.result.careerPathway.pathwayExplanation}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-muted/30 rounded-lg p-4 text-center">
                            <p className="text-muted-foreground">No career transition visualization available</p>
                          </div>
                        )}
                      </div>
                      
                      {/* 4.2 University & Vocational Pathways */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* University Pathway */}
                        <div className="bg-card border rounded-lg p-6 shadow-sm h-full">
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <School className="h-4 w-4 mr-2 text-blue-600" />
                            University Pathway
                          </h3>
                          
                          {latestAnalysis.result.careerPathway?.withDegree && 
                           latestAnalysis.result.careerPathway.withDegree.length > 0 ? (
                            <div className="space-y-4">
                              {latestAnalysis.result.careerPathway.withDegree.map((step, index) => (
                                <div key={index} className="relative pl-8 pb-6 last:pb-0">
                                  <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                                    {step.step}
                                  </div>
                                  
                                  {/* Connector line */}
                                  {index < latestAnalysis.result.careerPathway.withDegree.length - 1 && (
                                    <div className="absolute left-3 top-6 bottom-0 w-px bg-blue-200"></div>
                                  )}
                                  
                                  <div className="mb-1 font-medium">{step.role}</div>
                                  <div className="text-xs text-muted-foreground mb-2">{step.timeframe}</div>
                                  <p className="text-sm text-muted-foreground">{step.description}</p>
                                  
                                  {step.requiredQualification && (
                                    <div className="mt-2 bg-blue-50 p-2 rounded-md">
                                      <p className="text-xs text-blue-700">
                                        <span className="font-medium">Required qualification:</span> {step.requiredQualification}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-muted-foreground">No university pathway data available</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Vocational & Skills Pathway */}
                        <div className="bg-card border rounded-lg p-6 shadow-sm h-full">
                          <h3 className="text-lg font-semibold mb-4 flex items-center">
                            <BadgePlus className="h-4 w-4 mr-2 text-amber-600" />
                            Vocational & Skills Pathway
                          </h3>
                          
                          {latestAnalysis.result.careerPathway?.withoutDegree && 
                           latestAnalysis.result.careerPathway.withoutDegree.length > 0 ? (
                            <div className="space-y-4">
                              {latestAnalysis.result.careerPathway.withoutDegree.map((step, index) => (
                                <div key={index} className="relative pl-8 pb-6 last:pb-0">
                                  <div className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
                                    {step.step}
                                  </div>
                                  
                                  {/* Connector line */}
                                  {index < latestAnalysis.result.careerPathway.withoutDegree.length - 1 && (
                                    <div className="absolute left-3 top-6 bottom-0 w-px bg-amber-200"></div>
                                  )}
                                  
                                  <div className="mb-1 font-medium">{step.role}</div>
                                  <div className="text-xs text-muted-foreground mb-2">{step.timeframe}</div>
                                  <p className="text-sm text-muted-foreground">{step.description}</p>
                                  
                                  {step.requiredQualification && (
                                    <div className="mt-2 bg-amber-50 p-2 rounded-md">
                                      <p className="text-xs text-amber-700">
                                        <span className="font-medium">Required qualification:</span> {step.requiredQualification}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-muted-foreground">No vocational pathway data available</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 4.3 AI Pathway Enhancement Insights */}
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Badge className="mr-2 bg-purple-100 text-purple-800 border-none">4.3</Badge>
                          AI Pathway Enhancement Insights
                        </h3>
                        
                        {latestAnalysis.result.careerPathway?.aiInsights ? (
                          <div className="rounded-lg bg-purple-50 border border-purple-100 p-4">
                            <p className="text-sm text-purple-800 whitespace-pre-line">
                              {latestAnalysis.result.careerPathway.aiInsights}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-muted/30 rounded-lg p-4 text-center">
                            <p className="text-muted-foreground">No AI pathway insights available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                  
                  {/* SECTION 5: Comprehensive Development Plan */}
                  <section className="py-6 border-b border-muted">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold flex items-center text-primary">
                        <GraduationCap className="mr-2 h-5 w-5" />
                        Comprehensive Development Plan
                      </h2>
                    </div>
                    
                    <div className="space-y-6">
                      {/* 5.1 Skills Assessment Overview */}
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Badge className="mr-2 bg-primary/20 text-primary border-none">5.1</Badge>
                          Skills Assessment Overview
                        </h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Existing Skills */}
                          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                            <h4 className="text-base font-medium text-green-800 mb-3">Existing Skills</h4>
                            
                            {latestAnalysis.result.skillGapAnalysis?.existingSkills ? (
                              <div className="space-y-2">
                                {Array.isArray(latestAnalysis.result.skillGapAnalysis.existingSkills) ? (
                                  latestAnalysis.result.skillGapAnalysis.existingSkills.map((skill, idx) => (
                                    <div key={idx} className="flex items-center">
                                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                      <span className="text-sm text-green-700">{skill}</span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-green-700 whitespace-pre-line">
                                    {latestAnalysis.result.skillGapAnalysis.existingSkills}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-2">
                                <p className="text-muted-foreground">No existing skills data available</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Skills to Develop */}
                          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                            <h4 className="text-base font-medium text-amber-800 mb-3">Skills to Develop</h4>
                            
                            {latestAnalysis.result.skillGapAnalysis?.skillsToDevelop ? (
                              <div className="space-y-2">
                                {Array.isArray(latestAnalysis.result.skillGapAnalysis.skillsToDevelop) ? (
                                  latestAnalysis.result.skillGapAnalysis.skillsToDevelop.map((skill, idx) => (
                                    <div key={idx} className="flex items-center">
                                      <PlusCircle className="h-4 w-4 text-amber-600 mr-2" />
                                      <span className="text-sm text-amber-700">{skill}</span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-amber-700 whitespace-pre-line">
                                    {latestAnalysis.result.skillGapAnalysis.skillsToDevelop}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-2">
                                <p className="text-muted-foreground">No skills to develop data available</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* 5.2 Social & Soft Skills Development */}
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Badge className="mr-2 bg-blue-100 text-blue-800 border-none">5.2</Badge>
                          Social & Soft Skills Development
                        </h3>
                        
                        {(latestAnalysis.result.socialSkills || latestAnalysis.result.socialSkillsDevelopment) ? (
                          <div className="space-y-6">
                            {/* Interpersonal Skills */}
                            {(latestAnalysis.result.socialSkills?.interpersonalSkills || 
                              latestAnalysis.result.socialSkillsDevelopment?.interpersonalSkills) && (
                              <div>
                                <h4 className="text-base font-medium mb-3">Interpersonal Skills</h4>
                                <div className="space-y-3">
                                  {(latestAnalysis.result.socialSkills?.interpersonalSkills || 
                                    latestAnalysis.result.socialSkillsDevelopment?.interpersonalSkills)
                                    .map((skill, idx) => (
                                    <div key={idx} className="border-b pb-3 last:border-0">
                                      <h5 className="font-medium text-sm">{skill.skill}</h5>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {skill.importanceDescription || skill.description}
                                      </p>
                                      {skill.developmentTips && (
                                        <div className="mt-2 bg-blue-50 p-2 rounded">
                                          <p className="text-xs text-blue-700">
                                            <span className="font-medium">Development tips:</span> {skill.developmentTips}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Leadership Skills */}
                            {(latestAnalysis.result.socialSkills?.leadershipSkills || 
                              latestAnalysis.result.socialSkillsDevelopment?.leadershipSkills) && (
                              <div>
                                <h4 className="text-base font-medium mb-3">Leadership Skills</h4>
                                <div className="space-y-3">
                                  {(latestAnalysis.result.socialSkills?.leadershipSkills || 
                                    latestAnalysis.result.socialSkillsDevelopment?.leadershipSkills)
                                    .map((skill, idx) => (
                                    <div key={idx} className="border-b pb-3 last:border-0">
                                      <h5 className="font-medium text-sm">{skill.skill}</h5>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {skill.importanceDescription || skill.description}
                                      </p>
                                      {skill.developmentTips && (
                                        <div className="mt-2 bg-blue-50 p-2 rounded">
                                          <p className="text-xs text-blue-700">
                                            <span className="font-medium">Development tips:</span> {skill.developmentTips}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Communication Skills */}
                            {(latestAnalysis.result.socialSkills?.communicationSkills || 
                              latestAnalysis.result.socialSkillsDevelopment?.communicationSkills) && (
                              <div>
                                <h4 className="text-base font-medium mb-3">Communication Skills</h4>
                                <div className="space-y-3">
                                  {(latestAnalysis.result.socialSkills?.communicationSkills || 
                                    latestAnalysis.result.socialSkillsDevelopment?.communicationSkills)
                                    .map((skill, idx) => (
                                    <div key={idx} className="border-b pb-3 last:border-0">
                                      <h5 className="font-medium text-sm">{skill.skill}</h5>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {skill.importanceDescription || skill.description}
                                      </p>
                                      {skill.developmentTips && (
                                        <div className="mt-2 bg-blue-50 p-2 rounded">
                                          <p className="text-xs text-blue-700">
                                            <span className="font-medium">Development tips:</span> {skill.developmentTips}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="bg-muted/30 rounded-lg p-4 text-center">
                            <p className="text-muted-foreground">No social skills development data available</p>
                          </div>
                        )}
                      </div>
                      
                      {/* 5.3 Skills To Acquire with Distribution & Details */}
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Badge className="mr-2 bg-amber-100 text-amber-800 border-none">5.3</Badge>
                          Skills To Acquire
                        </h3>
                        
                        {latestAnalysis.result.developmentPlan?.skillsToAcquire && 
                         latestAnalysis.result.developmentPlan.skillsToAcquire.length > 0 ? (
                          <div className="space-y-6">
                            {/* Skill Priority Distribution (visual) */}
                            <div className="mb-6">
                              <h4 className="text-base font-medium mb-3">Skill Priority Distribution</h4>
                              
                              <div className="bg-muted/20 p-4 rounded-lg">
                                <div className="grid grid-cols-3 gap-4">
                                  <div className="text-center">
                                    <div className="h-6 bg-red-500 rounded-t-md"></div>
                                    <div className="py-2 px-3 bg-red-50 text-red-700 text-xs font-medium rounded-b-md border border-red-200">
                                      High Priority
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="h-4 bg-amber-500 rounded-t-md"></div>
                                    <div className="py-2 px-3 bg-amber-50 text-amber-700 text-xs font-medium rounded-b-md border border-amber-200">
                                      Medium Priority
                                    </div>
                                  </div>
                                  <div className="text-center">
                                    <div className="h-2 bg-blue-500 rounded-t-md"></div>
                                    <div className="py-2 px-3 bg-blue-50 text-blue-700 text-xs font-medium rounded-b-md border border-blue-200">
                                      Normal Priority
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Skills to Acquire Details */}
                            <div className="space-y-4">
                              {latestAnalysis.result.developmentPlan.skillsToAcquire.map((skill, index) => (
                                <div key={index} className="pb-4 border-b last:border-0">
                                  <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-medium">{skill.skill}</h4>
                                    <Badge variant="outline" className={
                                      skill.priority?.toLowerCase() === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                                      skill.priority?.toLowerCase() === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                      'bg-blue-50 text-blue-700 border-blue-200'
                                    }>
                                      {skill.priority || 'Normal'}
                                    </Badge>
                                  </div>
                                  
                                  {skill.resources && skill.resources.length > 0 && (
                                    <div className="mt-2">
                                      <h5 className="text-xs font-medium mb-1">Recommended Resources:</h5>
                                      <ul className="text-xs text-muted-foreground list-disc list-inside">
                                        {skill.resources.map((resource, rIdx) => (
                                          <li key={rIdx} className="mb-1">{resource}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-muted/30 rounded-lg p-4 text-center">
                            <p className="text-muted-foreground">No skills to acquire data available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                  
                  {/* SECTION 6: Recommended Educational Programs */}
                  <section className="py-6 border-b border-muted">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold flex items-center text-primary">
                        <School className="mr-2 h-5 w-5" />
                        Recommended Educational Programs
                      </h2>
                    </div>
                    
                    <div className="space-y-6">
                      {/* 6.1 Global Educational Recommendations */}
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Badge className="mr-2 bg-primary/20 text-primary border-none">6.1</Badge>
                          Educational Recommendations
                        </h3>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Top Universities */}
                          {latestAnalysis.result.educationalRecommendations?.universities && 
                           latestAnalysis.result.educationalRecommendations.universities.length > 0 ? (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 h-full">
                              <h4 className="text-base font-medium text-blue-800 mb-3 flex items-center">
                                <School className="h-4 w-4 mr-2 text-blue-600" />
                                Top Universities
                              </h4>
                              <ul className="space-y-2">
                                {latestAnalysis.result.educationalRecommendations.universities.map((uni, idx) => (
                                  <li key={idx} className="text-sm text-blue-700 flex items-start">
                                    <div className="h-5 w-5 flex-shrink-0 mr-2 bg-blue-100 rounded-full text-blue-700 flex items-center justify-center text-xs font-medium">
                                      {idx + 1}
                                    </div>
                                    <span>{typeof uni === 'string' ? uni : uni.name}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 h-full">
                              <h4 className="text-base font-medium text-blue-800 mb-3">Top Universities</h4>
                              <p className="text-sm text-blue-700">No university recommendations available</p>
                            </div>
                          )}
                          
                          {/* Top Institutes */}
                          {latestAnalysis.result.educationalRecommendations?.institutes && 
                           latestAnalysis.result.educationalRecommendations.institutes.length > 0 ? (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 h-full">
                              <h4 className="text-base font-medium text-amber-800 mb-3 flex items-center">
                                <BadgePlus className="h-4 w-4 mr-2 text-amber-600" />
                                Top Institutes
                              </h4>
                              <ul className="space-y-2">
                                {latestAnalysis.result.educationalRecommendations.institutes.map((inst, idx) => (
                                  <li key={idx} className="text-sm text-amber-700 flex items-start">
                                    <div className="h-5 w-5 flex-shrink-0 mr-2 bg-amber-100 rounded-full text-amber-700 flex items-center justify-center text-xs font-medium">
                                      {idx + 1}
                                    </div>
                                    <span>{typeof inst === 'string' ? inst : inst.name}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 h-full">
                              <h4 className="text-base font-medium text-amber-800 mb-3">Top Institutes</h4>
                              <p className="text-sm text-amber-700">No institute recommendations available</p>
                            </div>
                          )}
                          
                          {/* Online Course Providers */}
                          {latestAnalysis.result.educationalRecommendations?.onlinePlatforms && 
                           latestAnalysis.result.educationalRecommendations.onlinePlatforms.length > 0 ? (
                            <div className="bg-green-50 border border-green-100 rounded-lg p-4 h-full">
                              <h4 className="text-base font-medium text-green-800 mb-3 flex items-center">
                                <div className="h-4 w-4 mr-2 text-green-600 flex items-center justify-center">
                                  <span className="text-xs">🌐</span>
                                </div>
                                Online Providers
                              </h4>
                              <ul className="space-y-2">
                                {latestAnalysis.result.educationalRecommendations.onlinePlatforms.map((platform, idx) => (
                                  <li key={idx} className="text-sm text-green-700 flex items-start">
                                    <div className="h-5 w-5 flex-shrink-0 mr-2 bg-green-100 rounded-full text-green-700 flex items-center justify-center text-xs font-medium">
                                      {idx + 1}
                                    </div>
                                    <span>{typeof platform === 'string' ? platform : platform.name}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div className="bg-green-50 border border-green-100 rounded-lg p-4 h-full">
                              <h4 className="text-base font-medium text-green-800 mb-3">Online Providers</h4>
                              <p className="text-sm text-green-700">No online platform recommendations available</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 6.2 Suggested Projects */}
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center">
                          <Badge className="mr-2 bg-blue-100 text-blue-800 border-none">6.2</Badge>
                          Suggested Projects
                        </h3>
                        
                        {latestAnalysis.result.developmentPlan?.suggestedProjects && 
                         (Array.isArray(latestAnalysis.result.developmentPlan.suggestedProjects) && 
                          latestAnalysis.result.developmentPlan.suggestedProjects.length > 0) ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {latestAnalysis.result.developmentPlan.suggestedProjects.map((project, idx) => (
                              <div key={idx} className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                                {typeof project === 'string' ? (
                                  <p className="text-sm text-purple-800">{project}</p>
                                ) : (
                                  <div>
                                    <h4 className="text-base font-medium text-purple-800 mb-1">{project.name}</h4>
                                    <p className="text-sm text-purple-700">{project.description}</p>
                                    
                                    {project.skillsGained && project.skillsGained.length > 0 && (
                                      <div className="mt-2">
                                        <h5 className="text-xs font-medium text-purple-800 mb-1">Skills Gained:</h5>
                                        <div className="flex flex-wrap gap-1">
                                          {project.skillsGained.map((skill, sIdx) => (
                                            <Badge 
                                              key={sIdx} 
                                              variant="outline" 
                                              className="text-xs bg-purple-100 text-purple-800 border-purple-200"
                                            >
                                              {skill}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-muted/30 rounded-lg p-4 text-center">
                            <p className="text-muted-foreground">No suggested projects available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>
                  
                  {/* SECTION 7: AI-Enhanced Learning Roadmap */}
                  <section className="py-6 border-b border-muted">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold flex items-center text-primary">
                        <GanttChart className="mr-2 h-5 w-5" />
                        AI-Enhanced Learning Roadmap
                      </h2>
                    </div>
                    
                    {latestAnalysis.result.developmentPlan?.learningPath ? (
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
                          <p className="text-sm text-blue-800 whitespace-pre-line">
                            {latestAnalysis.result.developmentPlan.learningPath}
                          </p>
                        </div>
                        
                        {latestAnalysis.result.developmentPlan.roadmapStages && 
                         latestAnalysis.result.developmentPlan.roadmapStages.length > 0 && (
                          <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Learning Roadmap Stages</h3>
                            
                            <div className="space-y-8">
                              {latestAnalysis.result.developmentPlan.roadmapStages.map((stage, idx) => (
                                <div key={idx} className="relative pl-10 pb-8 last:pb-0">
                                  <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
                                    {idx + 1}
                                  </div>
                                  
                                  {/* Connector line */}
                                  {idx < latestAnalysis.result.developmentPlan.roadmapStages.length - 1 && (
                                    <div className="absolute left-4 top-8 bottom-0 w-px bg-primary/20"></div>
                                  )}
                                  
                                  <div className="space-y-2">
                                    <h4 className="text-base font-medium">{stage.title || `Stage ${idx + 1}`}</h4>
                                    <p className="text-sm text-muted-foreground">{stage.description}</p>
                                    
                                    {stage.duration && (
                                      <div className="flex items-center text-sm text-muted-foreground">
                                        <CalendarRange className="h-4 w-4 mr-2 text-muted-foreground" />
                                        {stage.duration}
                                      </div>
                                    )}
                                    
                                    {/* Focus Areas */}
                                    {stage.focusAreas && stage.focusAreas.length > 0 && (
                                      <div className="mt-3">
                                        <h5 className="text-sm font-medium mb-2">Focus Areas:</h5>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                          {stage.focusAreas.map((area, areaIdx) => (
                                            <li key={areaIdx} className="flex items-start">
                                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                              <span className="text-sm">{area}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    {/* Milestones */}
                                    {stage.milestones && stage.milestones.length > 0 && (
                                      <div className="mt-3 bg-muted/10 rounded-lg p-3">
                                        <h5 className="text-sm font-medium mb-2">Key Milestones:</h5>
                                        <ul className="space-y-2">
                                          {stage.milestones.map((milestone, milestoneIdx) => (
                                            <li key={milestoneIdx} className="flex items-start">
                                              <div className="h-5 w-5 flex-shrink-0 mr-2 bg-primary/10 rounded-full text-primary flex items-center justify-center text-xs font-medium">
                                                {milestoneIdx + 1}
                                              </div>
                                              <span className="text-sm">{milestone}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-muted/30 border rounded-lg p-6 text-center">
                        <p className="text-muted-foreground">No learning roadmap available</p>
                      </div>
                    )}
                  </section>
                  
                  {/* SECTION 8: Similar Roles To Consider */}
                  <section className="py-6 border-b border-muted">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold flex items-center text-primary">
                        <Users className="mr-2 h-5 w-5" />
                        Similar Roles To Consider
                      </h2>
                    </div>
                    
                    {(latestAnalysis.result.similarRoles || latestAnalysis.result.alternativeRoles) && 
                     (latestAnalysis.result.similarRoles?.length > 0 || latestAnalysis.result.alternativeRoles?.length > 0) ? (
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {(latestAnalysis.result.similarRoles || latestAnalysis.result.alternativeRoles).map((role, idx) => (
                            <div key={idx} className="bg-blue-50 border border-blue-100 rounded-lg p-4 shadow-sm">
                              <h3 className="text-lg font-medium text-blue-700 mb-1">{role.title || role.role}</h3>
                              
                              {(role.match || role.similarityScore) && (
                                <div className="mb-2">
                                  <Badge 
                                    variant="outline" 
                                    className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                                  >
                                    Match: {role.match || role.similarityScore}
                                  </Badge>
                                </div>
                              )}
                              
                              <p className="text-sm text-blue-800 mb-3">{role.description}</p>
                              
                              {/* Key Skill Overlaps */}
                              {(role.keySkillOverlaps || role.keySkillsOverlap) && (
                                <div className="mb-2">
                                  <h4 className="text-xs font-semibold text-blue-700 mb-1">Key skill overlaps:</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {(role.keySkillOverlaps ? role.keySkillOverlaps : 
                                      (typeof role.keySkillsOverlap === 'string' ? 
                                        role.keySkillsOverlap.split(',').map(s => s.trim()) : 
                                        Array.isArray(role.keySkillsOverlap) ? 
                                          role.keySkillsOverlap : 
                                          []
                                      )
                                    ).map((skill, skillIdx) => (
                                      <Badge 
                                        key={skillIdx} 
                                        variant="secondary" 
                                        className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200"
                                      >
                                        {skill}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Key Difference */}
                              {(role.keyDifference || role.uniqueRequirements) && (
                                <div className="mb-2">
                                  <h4 className="text-xs font-semibold text-amber-600 mb-1">Key difference:</h4>
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
                                    <span className="font-semibold text-slate-700">
                                      {role.salaryRange || role.potentialSalaryRange}
                                    </span>
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
                    ) : (
                      <div className="bg-muted/30 border rounded-lg p-6 text-center">
                        <p className="text-muted-foreground">No similar roles data available</p>
                      </div>
                    )}
                  </section>
                  
                  {/* SECTION 9: Micro-Learning Quick Tips by GenAI */}
                  <section className="py-6 border-b border-muted">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold flex items-center text-primary">
                        <Sparkles className="mr-2 h-5 w-5" />
                        Micro-Learning Quick Tips by GenAI
                      </h2>
                    </div>
                    
                    {latestAnalysis.result.developmentPlan?.microLearningTips && 
                     latestAnalysis.result.developmentPlan.microLearningTips.length > 0 ? (
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {latestAnalysis.result.developmentPlan.microLearningTips.map((tip, idx) => (
                            <div key={idx} className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                              <h3 className="font-medium text-primary mb-2">{tip.title || `Tip ${idx + 1}`}</h3>
                              <p className="text-sm text-muted-foreground">{tip.description || tip.tip || tip}</p>
                              
                              {tip.timeline && (
                                <div className="mt-2 flex items-center">
                                  <CalendarRange className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                                  <span className="text-xs font-medium">{tip.timeline}</span>
                                </div>
                              )}
                              
                              {tip.resources && tip.resources.length > 0 && (
                                <div className="mt-2">
                                  <h4 className="text-xs font-medium">Resources:</h4>
                                  <ul className="text-xs text-muted-foreground">
                                    {tip.resources.map((res, resIdx) => (
                                      <li key={resIdx} className="flex items-center">
                                        <ChevronRight className="h-3 w-3 flex-shrink-0 text-primary/70" />
                                        <span>{res}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted/30 border rounded-lg p-6 text-center">
                        <p className="text-muted-foreground">No micro-learning tips available</p>
                      </div>
                    )}
                  </section>
                  
                  {/* SECTION 10: Personalized Skill Growth Trajectory */}
                  <section className="py-6 border-b border-muted">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold flex items-center text-primary">
                        <LineChart className="mr-2 h-5 w-5" />
                        Personalized Skill Growth Trajectory
                      </h2>
                    </div>
                    
                    {latestAnalysis.result.skillGrowthTrajectory ? (
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <div className="space-y-6">
                          {/* Overview */}
                          {latestAnalysis.result.skillGrowthTrajectory.overview && (
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                              <h3 className="text-lg font-semibold text-blue-800 mb-2">Growth Overview</h3>
                              <p className="text-sm text-blue-700 whitespace-pre-line">
                                {latestAnalysis.result.skillGrowthTrajectory.overview}
                              </p>
                            </div>
                          )}
                          
                          {/* Milestones */}
                          {latestAnalysis.result.skillGrowthTrajectory.milestones && 
                           latestAnalysis.result.skillGrowthTrajectory.milestones.length > 0 && (
                            <div>
                              <h3 className="text-lg font-semibold mb-4">Growth Milestones</h3>
                              
                              <div className="space-y-6">
                                {latestAnalysis.result.skillGrowthTrajectory.milestones.map((milestone, idx) => (
                                  <div key={idx} className="relative pl-10 pb-8 last:pb-0">
                                    <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-700 font-medium">
                                      {idx + 1}
                                    </div>
                                    
                                    {/* Connector line */}
                                    {idx < latestAnalysis.result.skillGrowthTrajectory.milestones.length - 1 && (
                                      <div className="absolute left-4 top-8 bottom-0 w-px bg-green-200"></div>
                                    )}
                                    
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between">
                                        <h4 className="text-base font-medium">{milestone.title || milestone.stage || `Milestone ${idx + 1}`}</h4>
                                        {milestone.timeframe && (
                                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            {milestone.timeframe}
                                          </Badge>
                                        )}
                                      </div>
                                      
                                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                                      
                                      {/* Expected Outcomes */}
                                      {milestone.outcomes && milestone.outcomes.length > 0 && (
                                        <div className="mt-3">
                                          <h5 className="text-sm font-medium mb-2">Expected Outcomes:</h5>
                                          <ul className="space-y-2">
                                            {milestone.outcomes.map((outcome, outcomeIdx) => (
                                              <li key={outcomeIdx} className="flex items-start">
                                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                                <span className="text-sm">{outcome}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted/30 border rounded-lg p-6 text-center">
                        <p className="text-muted-foreground">No skill growth trajectory available</p>
                      </div>
                    )}
                  </section>
                  
                  {/* SECTION 11: Learning Path Roadmap */}
                  <section className="py-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold flex items-center text-primary">
                        <GanttChart className="mr-2 h-5 w-5" />
                        Learning Path Roadmap
                      </h2>
                    </div>
                    
                    {latestAnalysis.result.careerDevelopmentTimeline && 
                     latestAnalysis.result.careerDevelopmentTimeline.length > 0 ? (
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <h3 className="text-lg font-semibold mb-6">Career Development Timeline</h3>
                        
                        <div className="space-y-8">
                          {latestAnalysis.result.careerDevelopmentTimeline.map((step, idx) => (
                            <div key={idx} className="relative pl-10 pb-10 last:pb-0">
                              <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white font-medium">
                                {idx + 1}
                              </div>
                              
                              {/* Connector line */}
                              {idx < latestAnalysis.result.careerDevelopmentTimeline.length - 1 && (
                                <div className="absolute left-4 top-8 bottom-0 w-px bg-primary/20"></div>
                              )}
                              
                              <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="text-base font-medium">{step.phase || step.title || `Phase ${idx + 1}`}</h4>
                                  {step.timeframe && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                      {step.timeframe}
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-sm text-muted-foreground whitespace-pre-line">{step.description}</p>
                                
                                {/* Goals */}
                                {step.goals && step.goals.length > 0 && (
                                  <div className="mt-3 bg-muted/10 rounded-lg p-3">
                                    <h5 className="text-sm font-medium mb-2">Key Goals:</h5>
                                    <ul className="space-y-2">
                                      {step.goals.map((goal, goalIdx) => (
                                        <li key={goalIdx} className="flex items-start">
                                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                          <span className="text-sm">{goal}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {/* Focus Areas */}
                                {step.focusAreas && step.focusAreas.length > 0 && (
                                  <div className="mt-3">
                                    <h5 className="text-sm font-medium mb-2">Focus Areas:</h5>
                                    <div className="flex flex-wrap gap-1">
                                      {step.focusAreas.map((area, areaIdx) => (
                                        <Badge 
                                          key={areaIdx} 
                                          variant="outline" 
                                          className="bg-primary/5 border-primary/20 text-primary/80"
                                        >
                                          {area}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-end mt-6">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs shadow-sm bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                            onClick={() => {
                              toast({
                                title: "Generating PDF",
                                description: "Your analysis PDF is being prepared",
                                variant: "default",
                              });
                            }}
                          >
                            <Download className="h-3.5 w-3.5 mr-2" />
                            Download Complete Analysis
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted/30 border rounded-lg p-6 text-center">
                        <p className="text-muted-foreground">No learning path roadmap available</p>
                      </div>
                    )}
                  </section>
                  
                  {/* SECTION 4: Career Pathway with dual options */}
                  <section className="py-6 border-b border-muted">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold flex items-center text-primary">
                        <GanttChart className="mr-2 h-5 w-5" />
                        Career Pathway
                      </h2>
                    </div>
                    
                    {latestAnalysis.result.careerPathway ? (
                      <div>
                        <div className="bg-card border rounded-lg p-6 shadow-sm mb-4">
                          {/* Temporarily render a placeholder instead of CareerPathwayStepsDisplay */}
                          <div className="p-4 bg-muted/20 rounded-lg">
                            <div className="flex justify-between items-center mb-6">
                              <h3 className="text-lg font-medium">Career Pathway Options</h3>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
                                  University Path
                                </Badge>
                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100">
                                  Vocational Path
                                </Badge>
                              </div>
                            </div>
                            
                            {/* University Pathway Preview */}
                            {latestAnalysis.result.careerPathway.withDegree && (
                              <div className="mb-8">
                                <h4 className="font-medium mb-2 text-blue-700">University Pathway</h4>
                                <div className="flex flex-col gap-2">
                                  {latestAnalysis.result.careerPathway.withDegree.map((step, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0 bg-blue-50">
                                        {step.step}
                                      </Badge>
                                      <div className="text-sm font-medium">{step.role}</div>
                                      <div className="text-xs text-muted-foreground ml-auto">{step.timeframe}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Vocational Pathway Preview */}
                            {latestAnalysis.result.careerPathway.withoutDegree && (
                              <div>
                                <h4 className="font-medium mb-2 text-amber-700">Vocational Pathway</h4>
                                <div className="flex flex-col gap-2">
                                  {latestAnalysis.result.careerPathway.withoutDegree.map((step, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0 bg-amber-50">
                                        {step.step}
                                      </Badge>
                                      <div className="text-sm font-medium">{step.role}</div>
                                      <div className="text-xs text-muted-foreground ml-auto">{step.timeframe}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {latestAnalysis.result.careerPathway.pathwayExplanation && (
                          <div className="bg-card border rounded-lg p-6 shadow-sm mt-4">
                            <h3 className="text-base font-semibold mb-3">Pathway Explanation</h3>
                            <p className="text-sm text-muted-foreground whitespace-pre-line">
                              {latestAnalysis.result.careerPathway.pathwayExplanation}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-muted/30 border rounded-lg p-6 text-center">
                        <p className="text-muted-foreground">No career pathway data available</p>
                      </div>
                    )}
                  </section>
                  
                  {/* SECTION 5: Similar/Alternative Roles */}
                  <section className="py-6 border-b border-muted">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold flex items-center text-primary">
                        <Users className="mr-2 h-5 w-5" />
                        Similar Roles
                      </h2>
                    </div>
                    
                    {(latestAnalysis.result.similarRoles || latestAnalysis.result.alternativeRoles) && 
                     (latestAnalysis.result.similarRoles?.length > 0 || latestAnalysis.result.alternativeRoles?.length > 0) ? (
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <p className="text-sm text-muted-foreground mb-4">
                          Based on your skills, experience, and career goals, these related roles might offer alternative paths that leverage your abilities:
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {(latestAnalysis.result.similarRoles || latestAnalysis.result.alternativeRoles).map((role, idx) => (
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
                                    ).map((skill, skillIdx) => (
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
                    ) : (
                      <div className="bg-muted/30 border rounded-lg p-6 text-center">
                        <p className="text-muted-foreground">No similar roles data available</p>
                      </div>
                    )}
                  </section>
                  
                  {/* SECTION 6: Industry Analysis */}
                  <section className="py-6 border-b border-muted">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold flex items-center text-primary">
                        <Briefcase className="mr-2 h-5 w-5" />
                        Industry Analysis
                      </h2>
                    </div>
                    
                    {latestAnalysis.result.industryAnalysis ? (
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <div className="space-y-6">
                          {/* Industry Overview */}
                          {latestAnalysis.result.industryAnalysis.industryOverview && (
                            <div>
                              <h3 className="text-base font-semibold mb-3">Industry Overview</h3>
                              <p className="text-sm text-muted-foreground whitespace-pre-line mb-4">
                                {latestAnalysis.result.industryAnalysis.industryOverview}
                              </p>
                            </div>
                          )}
                          
                          {/* Market Trends */}
                          {latestAnalysis.result.industryAnalysis.marketTrends && (
                            <div>
                              <h3 className="text-base font-semibold mb-3 flex items-center">
                                <LineChart className="h-4 w-4 mr-2 text-amber-600" />
                                Market Trends
                              </h3>
                              <p className="text-sm text-muted-foreground whitespace-pre-line mb-2">
                                {latestAnalysis.result.industryAnalysis.marketTrends}
                              </p>
                            </div>
                          )}
                          
                          {/* Key Companies */}
                          {latestAnalysis.result.industryAnalysis.keyCompanies && 
                           latestAnalysis.result.industryAnalysis.keyCompanies.length > 0 && (
                            <div>
                              <h3 className="text-base font-semibold mb-3 flex items-center">
                                <Briefcase className="h-4 w-4 mr-2 text-blue-600" />
                                Key Companies
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {latestAnalysis.result.industryAnalysis.keyCompanies.map((company, idx) => (
                                  <div key={idx} className="bg-card border rounded-md p-3 shadow-sm">
                                    <h4 className="font-medium text-sm">{company.name}</h4>
                                    {company.specialization && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {company.specialization}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Future Outlook */}
                          {latestAnalysis.result.industryAnalysis.futureOutlook && (
                            <div>
                              <h3 className="text-base font-semibold mb-3 flex items-center">
                                <PanelRight className="h-4 w-4 mr-2 text-green-600" />
                                Future Outlook
                              </h3>
                              <p className="text-sm text-muted-foreground whitespace-pre-line">
                                {latestAnalysis.result.industryAnalysis.futureOutlook}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted/30 border rounded-lg p-6 text-center">
                        <p className="text-muted-foreground">No industry analysis available</p>
                      </div>
                    )}
                  </section>
                  
                  {/* SECTION 7: Development Plan */}
                  <section className="py-6 border-b border-muted">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold flex items-center text-primary">
                        <GraduationCap className="mr-2 h-5 w-5" />
                        Development Plan
                      </h2>
                    </div>
                    
                    {latestAnalysis.result.developmentPlan ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Skills To Acquire */}
                        {latestAnalysis.result.developmentPlan.skillsToAcquire && 
                         latestAnalysis.result.developmentPlan.skillsToAcquire.length > 0 && (
                          <div className="bg-card border rounded-lg p-6 shadow-sm h-full">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <PlusCircle className="h-4 w-4 mr-2 text-primary" /> 
                              Skills To Acquire
                            </h3>
                            <div className="space-y-4">
                              {latestAnalysis.result.developmentPlan.skillsToAcquire.map((skill, index) => (
                                <div key={index} className="pb-4 border-b last:border-0">
                                  <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-medium">{skill.skill}</h4>
                                    <Badge variant="outline" className={
                                      skill.priority?.toLowerCase() === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                                      skill.priority?.toLowerCase() === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                      'bg-blue-50 text-blue-700 border-blue-200'
                                    }>
                                      {skill.priority || 'Normal'}
                                    </Badge>
                                  </div>
                                  
                                  {skill.resources && skill.resources.length > 0 && (
                                    <div className="mt-2">
                                      <h5 className="text-xs font-medium mb-1">Recommended Resources:</h5>
                                      <ul className="text-xs text-muted-foreground list-disc list-inside">
                                        {skill.resources.map((resource, rIdx) => (
                                          <li key={rIdx} className="mb-1">{resource}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Recommended Certifications */}
                        {latestAnalysis.result.developmentPlan.recommendedCertifications && (
                          <div className="bg-card border rounded-lg p-6 shadow-sm h-full">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <Award className="h-4 w-4 mr-2 text-amber-600" />
                              Recommended Certifications
                            </h3>
                            
                            <div className="space-y-4">
                              {/* University Certifications */}
                              {latestAnalysis.result.developmentPlan.recommendedCertifications.university && 
                               latestAnalysis.result.developmentPlan.recommendedCertifications.university.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2 flex items-center">
                                    <School className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                                    University
                                  </h4>
                                  <ul className="text-sm text-muted-foreground list-disc list-inside pl-2">
                                    {latestAnalysis.result.developmentPlan.recommendedCertifications.university.map((cert, idx) => (
                                      <li key={idx} className="mb-1 leading-tight">{cert}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Vocational Certifications */}
                              {latestAnalysis.result.developmentPlan.recommendedCertifications.vocational && 
                               latestAnalysis.result.developmentPlan.recommendedCertifications.vocational.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2 flex items-center">
                                    <BadgePlus className="h-3.5 w-3.5 mr-1.5 text-amber-600/70" />
                                    Vocational
                                  </h4>
                                  <ul className="text-sm text-muted-foreground list-disc list-inside pl-2">
                                    {latestAnalysis.result.developmentPlan.recommendedCertifications.vocational.map((cert, idx) => (
                                      <li key={idx} className="mb-1 leading-tight">{cert}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {/* Online Certifications */}
                              {latestAnalysis.result.developmentPlan.recommendedCertifications.online && 
                               latestAnalysis.result.developmentPlan.recommendedCertifications.online.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2 flex items-center">
                                    <div className="h-3.5 w-3.5 mr-1.5 text-blue-600/70 flex items-center justify-center">
                                      <span className="text-xs">🌐</span>
                                    </div>
                                    Online
                                  </h4>
                                  <ul className="text-sm text-muted-foreground list-disc list-inside pl-2">
                                    {latestAnalysis.result.developmentPlan.recommendedCertifications.online.map((cert, idx) => (
                                      <li key={idx} className="mb-1 leading-tight">{cert}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Micro Learning Tips */}
                        {latestAnalysis.result.developmentPlan.microLearningTips && 
                         latestAnalysis.result.developmentPlan.microLearningTips.length > 0 && (
                          <div className="bg-card border rounded-lg p-6 shadow-sm col-span-1 lg:col-span-2">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <Sparkles className="h-4 w-4 mr-2 text-primary" />
                              Quick Learning Tips
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {latestAnalysis.result.developmentPlan.microLearningTips.map((tip, idx) => (
                                <div key={idx} className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                                  <h4 className="font-medium text-primary mb-2">{tip.title || `Tip ${idx + 1}`}</h4>
                                  <p className="text-sm text-muted-foreground">{tip.description || tip.tip || tip}</p>
                                  
                                  {tip.timeline && (
                                    <div className="mt-2 flex items-center">
                                      <CalendarRange className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                                      <span className="text-xs font-medium">{tip.timeline}</span>
                                    </div>
                                  )}
                                  
                                  {tip.resources && tip.resources.length > 0 && (
                                    <div className="mt-2">
                                      <h5 className="text-xs font-medium">Resources:</h5>
                                      <ul className="text-xs text-muted-foreground">
                                        {tip.resources.map((res, resIdx) => (
                                          <li key={resIdx} className="flex items-center">
                                            <ChevronRight className="h-3 w-3 flex-shrink-0 text-primary/70" />
                                            <span>{res}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-muted/30 border rounded-lg p-6 text-center">
                        <p className="text-muted-foreground">No development plan available</p>
                      </div>
                    )}
                  </section>
                  
                  {/* SECTION 8: Soft Skills Development */}
                  <section className="py-6 border-b border-muted">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold flex items-center text-primary">
                        <Users className="mr-2 h-5 w-5" />
                        Soft Skills Development
                      </h2>
                    </div>
                    
                    {(latestAnalysis.result.socialSkills || latestAnalysis.result.socialSkillsDevelopment) ? (
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Interpersonal Skills */}
                          {(latestAnalysis.result.socialSkills?.interpersonalSkills || 
                            latestAnalysis.result.socialSkillsDevelopment?.interpersonalSkills) && (
                            <div>
                              <h3 className="text-lg font-semibold mb-4">Interpersonal Skills</h3>
                              <div className="space-y-4">
                                {(latestAnalysis.result.socialSkills?.interpersonalSkills || 
                                  latestAnalysis.result.socialSkillsDevelopment?.interpersonalSkills)
                                  .map((skill, idx) => (
                                  <div key={idx} className="border-b pb-3 last:border-0">
                                    <h4 className="font-medium text-sm">{skill.skill}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">{skill.importanceDescription || skill.description}</p>
                                    {skill.developmentTips && (
                                      <div className="mt-2 bg-muted/30 p-2 rounded">
                                        <h5 className="text-xs font-medium">Development Tips:</h5>
                                        <p className="text-xs text-muted-foreground">{skill.developmentTips}</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Leadership Skills */}
                          {(latestAnalysis.result.socialSkills?.leadershipSkills || 
                            latestAnalysis.result.socialSkillsDevelopment?.leadershipSkills) && (
                            <div>
                              <h3 className="text-lg font-semibold mb-4">Leadership Skills</h3>
                              <div className="space-y-4">
                                {(latestAnalysis.result.socialSkills?.leadershipSkills || 
                                  latestAnalysis.result.socialSkillsDevelopment?.leadershipSkills)
                                  .map((skill, idx) => (
                                  <div key={idx} className="border-b pb-3 last:border-0">
                                    <h4 className="font-medium text-sm">{skill.skill}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">{skill.importanceDescription || skill.description}</p>
                                    {skill.developmentTips && (
                                      <div className="mt-2 bg-muted/30 p-2 rounded">
                                        <h5 className="text-xs font-medium">Development Tips:</h5>
                                        <p className="text-xs text-muted-foreground">{skill.developmentTips}</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Communication Skills */}
                          {(latestAnalysis.result.socialSkills?.communicationSkills || 
                            latestAnalysis.result.socialSkillsDevelopment?.communicationSkills) && (
                            <div>
                              <h3 className="text-lg font-semibold mb-4">Communication Skills</h3>
                              <div className="space-y-4">
                                {(latestAnalysis.result.socialSkills?.communicationSkills || 
                                  latestAnalysis.result.socialSkillsDevelopment?.communicationSkills)
                                  .map((skill, idx) => (
                                  <div key={idx} className="border-b pb-3 last:border-0">
                                    <h4 className="font-medium text-sm">{skill.skill}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">{skill.importanceDescription || skill.description}</p>
                                    {skill.developmentTips && (
                                      <div className="mt-2 bg-muted/30 p-2 rounded">
                                        <h5 className="text-xs font-medium">Development Tips:</h5>
                                        <p className="text-xs text-muted-foreground">{skill.developmentTips}</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* General Framework */}
                          {(latestAnalysis.result.socialSkills?.generalDevelopmentFramework || 
                            latestAnalysis.result.socialSkillsDevelopment?.generalDevelopmentFramework) && (
                            <div className="col-span-1 lg:col-span-2 bg-blue-50 border border-blue-100 rounded-lg p-4">
                              <h3 className="text-lg font-semibold mb-3 text-blue-800">Soft Skills Development Framework</h3>
                              <p className="text-sm text-blue-700 whitespace-pre-line">
                                {latestAnalysis.result.socialSkills?.generalDevelopmentFramework || 
                                 latestAnalysis.result.socialSkillsDevelopment?.generalDevelopmentFramework}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted/30 border rounded-lg p-6 text-center">
                        <p className="text-muted-foreground">No soft skills development information available</p>
                      </div>
                    )}
                  </section>
                  
                  {/* SECTION 9: Learning Resources */}
                  <section className="py-6 border-b border-muted">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold flex items-center text-primary">
                        <Book className="mr-2 h-5 w-5" />
                        Learning Resources
                      </h2>
                    </div>
                    
                    {latestAnalysis.result.learningResources ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Books */}
                        {latestAnalysis.result.learningResources.books && 
                         latestAnalysis.result.learningResources.books.length > 0 && (
                          <div className="bg-card border rounded-lg p-6 shadow-sm h-full">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <BookText className="h-4 w-4 mr-2 text-amber-600" />
                              Recommended Books
                            </h3>
                            <ul className="space-y-3">
                              {latestAnalysis.result.learningResources.books.map((book, idx) => (
                                <li key={idx} className="border-b pb-3 last:border-0">
                                  <h4 className="font-medium text-sm">{book.title || (typeof book === 'string' ? book : '')}</h4>
                                  {book.author && <p className="text-xs text-muted-foreground">Author: {book.author}</p>}
                                  {book.description && <p className="text-xs text-muted-foreground mt-1">{book.description}</p>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Online Courses */}
                        {latestAnalysis.result.learningResources.onlineCourses && 
                         latestAnalysis.result.learningResources.onlineCourses.length > 0 && (
                          <div className="bg-card border rounded-lg p-6 shadow-sm h-full">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <div className="h-4 w-4 mr-2 text-blue-600 flex items-center justify-center">
                                <span className="text-xs">🌐</span>
                              </div>
                              Online Courses
                            </h3>
                            <ul className="space-y-3">
                              {latestAnalysis.result.learningResources.onlineCourses.map((course, idx) => (
                                <li key={idx} className="border-b pb-3 last:border-0">
                                  <h4 className="font-medium text-sm">{course.title || (typeof course === 'string' ? course : '')}</h4>
                                  {course.platform && <p className="text-xs text-primary-foreground/70">Platform: {course.platform}</p>}
                                  {course.description && <p className="text-xs text-muted-foreground mt-1">{course.description}</p>}
                                  {course.link && (
                                    <a 
                                      href={course.link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary mt-1 flex items-center hover:underline"
                                    >
                                      <ExternalLink className="h-3 w-3 mr-1" />
                                      View Course
                                    </a>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Communities & Networks */}
                        {latestAnalysis.result.learningResources.communities && 
                         latestAnalysis.result.learningResources.communities.length > 0 && (
                          <div className="bg-card border rounded-lg p-6 shadow-sm h-full">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <Users className="h-4 w-4 mr-2 text-green-600" />
                              Communities & Networks
                            </h3>
                            <ul className="space-y-3">
                              {latestAnalysis.result.learningResources.communities.map((community, idx) => (
                                <li key={idx} className="border-b pb-3 last:border-0">
                                  <h4 className="font-medium text-sm">{community.name || (typeof community === 'string' ? community : '')}</h4>
                                  {community.type && <p className="text-xs text-muted-foreground">Type: {community.type}</p>}
                                  {community.description && <p className="text-xs text-muted-foreground mt-1">{community.description}</p>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {/* Tools and Platforms */}
                        {latestAnalysis.result.learningResources.toolsAndPlatforms && 
                         latestAnalysis.result.learningResources.toolsAndPlatforms.length > 0 && (
                          <div className="bg-card border rounded-lg p-6 shadow-sm h-full">
                            <h3 className="text-lg font-semibold mb-4 flex items-center">
                              <Brain className="h-4 w-4 mr-2 text-purple-600" />
                              Tools & Platforms
                            </h3>
                            <ul className="space-y-3">
                              {latestAnalysis.result.learningResources.toolsAndPlatforms.map((tool, idx) => (
                                <li key={idx} className="border-b pb-3 last:border-0">
                                  <h4 className="font-medium text-sm">{tool.name || (typeof tool === 'string' ? tool : '')}</h4>
                                  {tool.purpose && <p className="text-xs text-muted-foreground">Purpose: {tool.purpose}</p>}
                                  {tool.description && <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-muted/30 border rounded-lg p-6 text-center">
                        <p className="text-muted-foreground">No learning resources available</p>
                      </div>
                    )}
                  </section>
                  
                  {/* SECTION 10: Recommendations (AI Advice) */}
                  <section className="py-6 border-b border-muted">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold flex items-center text-primary">
                        <Star className="mr-2 h-5 w-5" />
                        AI Recommendations
                      </h2>
                    </div>
                    
                    {latestAnalysis.result.recommendations ? (
                      <div className="space-y-4">
                        {/* Temporarily render a placeholder instead of AIRecommendationsPanel */}
                        <div className="bg-card border rounded-lg p-6 shadow-sm">
                          {latestAnalysis.result.recommendations.shortTerm && (
                            <div className="mb-6">
                              <h3 className="text-lg font-semibold mb-3 flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-blue-600" />
                                Short-Term Recommendations
                              </h3>
                              <div className="space-y-3">
                                {Array.isArray(latestAnalysis.result.recommendations.shortTerm) ? 
                                  latestAnalysis.result.recommendations.shortTerm.map((rec, idx) => (
                                    <div key={idx} className="flex items-start">
                                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                      <p className="text-sm text-muted-foreground">{rec}</p>
                                    </div>
                                  )) : (
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                                      {latestAnalysis.result.recommendations.shortTerm}
                                    </p>
                                  )
                                }
                              </div>
                            </div>
                          )}
                          
                          {latestAnalysis.result.recommendations.midTerm && (
                            <div className="mb-6">
                              <h3 className="text-lg font-semibold mb-3 flex items-center">
                                <CalendarRange className="h-4 w-4 mr-2 text-amber-600" />
                                Mid-Term Recommendations
                              </h3>
                              <div className="space-y-3">
                                {Array.isArray(latestAnalysis.result.recommendations.midTerm) ? 
                                  latestAnalysis.result.recommendations.midTerm.map((rec, idx) => (
                                    <div key={idx} className="flex items-start">
                                      <CheckCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                                      <p className="text-sm text-muted-foreground">{rec}</p>
                                    </div>
                                  )) : (
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                                      {latestAnalysis.result.recommendations.midTerm}
                                    </p>
                                  )
                                }
                              </div>
                            </div>
                          )}
                          
                          {latestAnalysis.result.recommendations.longTerm && (
                            <div>
                              <h3 className="text-lg font-semibold mb-3 flex items-center">
                                <MoveUpRight className="h-4 w-4 mr-2 text-purple-600" />
                                Long-Term Recommendations
                              </h3>
                              <div className="space-y-3">
                                {Array.isArray(latestAnalysis.result.recommendations.longTerm) ? 
                                  latestAnalysis.result.recommendations.longTerm.map((rec, idx) => (
                                    <div key={idx} className="flex items-start">
                                      <CheckCircle className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0 mt-0.5" />
                                      <p className="text-sm text-muted-foreground">{rec}</p>
                                    </div>
                                  )) : (
                                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                                      {latestAnalysis.result.recommendations.longTerm}
                                    </p>
                                  )
                                }
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted/30 border rounded-lg p-6 text-center">
                        <p className="text-muted-foreground">No AI recommendations available</p>
                      </div>
                    )}
                  </section>
                  
                  {/* SECTION 11: Next Steps */}
                  <section className="py-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-bold flex items-center text-primary">
                        <ListChecks className="mr-2 h-5 w-5" />
                        Next Steps
                      </h2>
                    </div>
                    
                    {latestAnalysis.result.nextSteps ? (
                      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-6 shadow-sm">
                        <div className="space-y-4">
                          {Array.isArray(latestAnalysis.result.nextSteps) ? (
                            <ul className="space-y-3">
                              {latestAnalysis.result.nextSteps.map((step, idx) => (
                                <li key={idx} className="flex items-start">
                                  <div className="flex-shrink-0 bg-primary/20 text-primary h-6 w-6 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-primary">{step}</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-primary-foreground whitespace-pre-line">
                              {latestAnalysis.result.nextSteps}
                            </p>
                          )}
                          
                          <div className="flex justify-end mt-6">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-xs shadow-sm bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
                              onClick={() => {
                                toast({
                                  title: "Generating PDF",
                                  description: "Your analysis PDF is being prepared",
                                  variant: "default",
                                });
                              }}
                            >
                              <Download className="h-3.5 w-3.5 mr-2" />
                              Download Analysis Report
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted/30 border rounded-lg p-6 text-center">
                        <p className="text-muted-foreground">No next steps available</p>
                      </div>
                    )}
                  </section>

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
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="py-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-xs ml-auto"
                onClick={() => toggleExpand(latestAnalysis.id)}
              >
                {expandedAnalysis === latestAnalysis.id ? (
                  <ChevronUp className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 mr-1" />
                )}
                {expandedAnalysis === latestAnalysis.id ? "Collapse" : "View Details"}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No career analysis found</p>
            <Button className="mt-4" onClick={() => window.location.href = "/career-pathway"}>
              Create New Analysis
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}