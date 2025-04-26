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
                      
                      {/* Charts Section */}
                      {latestAnalysis.result.skillGapAnalysis.visualData && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {latestAnalysis.result.skillGapAnalysis.visualData.radarData && (
                            <div className="bg-card border rounded-lg p-4 shadow-sm">
                              <h4 className="text-base font-semibold mb-3">Skill Proficiency Overview</h4>
                              <div className="w-full h-80 mx-auto">
                                <SkillRadarChart results={latestAnalysis.result} />
                              </div>
                            </div>
                          )}
                          
                          {latestAnalysis.result.skillGapAnalysis.visualData.barData && (
                            <div className="bg-card border rounded-lg p-4 shadow-sm">
                              <h4 className="text-base font-semibold mb-3">Gap Analysis Comparison</h4>
                              <div className="w-full h-80 mx-auto">
                                <ComparativeBarChart results={latestAnalysis.result} />
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
              <Button 
                variant="default" 
                size="sm"
                className="flex items-center gap-1"
                onClick={() => window.open(`/api/career-analyses/${latestAnalysis.id}/pdf`, '_blank')}
              >
                <Download className="h-4 w-4" /> Download PDF
              </Button>
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