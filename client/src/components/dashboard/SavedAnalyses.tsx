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