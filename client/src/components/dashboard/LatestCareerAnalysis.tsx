import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Loader2, 
  BarChart3, 
  Clock, 
  RefreshCw, 
  History,
  ScrollText,
  ListChecks,
  Plus,
  Download
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

interface SavedAnalysis {
  id: string;
  professionalLevel: string;
  desiredRole: string;
  createdAt: string;
  progress: number;
  result?: any;
}

export function LatestCareerAnalysis() {
  const [activeTab, setActiveTab] = useState("executive-summary");
  const { toast } = useToast();
  
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
  
  // Extract analyses from dashboard data and log them
  const analyses = dashboardData?.careerAnalyses || [];
  console.log("Analyses:", analyses);
  
  // Log the structure of the first analysis if it exists
  if (analyses.length > 0) {
    console.log("First analysis:", analyses[0]);
    console.log("First analysis result structure:", analyses[0]?.result ? Object.keys(analyses[0].result) : "No result")
  }
  
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
            Latest Career Analysis
          </CardTitle>
          <CardDescription>Your most recent Skillgenix AI Career Analysis</CardDescription>
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
            Latest Career Analysis
          </CardTitle>
          <CardDescription>Your most recent Skillgenix AI Career Analysis</CardDescription>
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
            Latest Career Analysis
          </CardTitle>
          <CardDescription>Your most recent Skillgenix AI Career Analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>You haven't saved any career analyses yet.</p>
            <Button className="mt-4" asChild>
              <Link href="/structured-pathway">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Analysis
              </Link>
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
  
  // If there's no result, show a simplified card
  if (!latestAnalysis?.result) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              Latest Career Analysis
            </CardTitle>
            <CardDescription>Your most recent Skillgenix AI Career Analysis</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshDashboard}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>Your latest analysis doesn't contain detailed results.</p>
            <Button className="mt-4" asChild>
              <Link href="/structured-pathway">
                <Plus className="h-4 w-4 mr-2" />
                Create New Analysis
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Extract the full report from the latest analysis
  const report = latestAnalysis.result;
  
  // Log the exact properties in the report for debugging
  console.log("Report properties:", report ? Object.keys(report) : "No report");
  
  // Create empty objects for sections if they don't exist
  // Use the properties we know exist based on the debug log
  const executiveSummary = typeof report?.executiveSummary === 'string' 
    ? { summary: report.executiveSummary } 
    : (report?.executiveSummary || {});
  const skillMapping = report?.skillMapping || {};
  const skillGapAnalysis = report?.skillGapAnalysis || {};
  const careerPathway = report?.careerPathway || {};
  const developmentPlan = report?.developmentPlan || {};
  const similarRoles = report?.similarRoles || {};
  const socialSkills = report?.socialSkills || {};

  // Create a basic display for testing
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Latest Career Analysis
          </CardTitle>
          <CardDescription>Your most recent Skillgenix AI Career Analysis</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {hasMultipleAnalyses && (
            <Button 
              variant="outline" 
              size="sm"
              asChild
              className="flex items-center gap-1"
            >
              <Link href="/saved-analyses">
                <History className="h-3.5 w-3.5" />
                View All Analyses
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
      <CardContent>
        <div className="p-4 bg-muted/30 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Analysis for: {latestAnalysis.desiredRole}</h2>
          <div className="flex items-center gap-2 mt-1 mb-4">
            <Badge variant="outline" className="font-normal">
              {latestAnalysis.professionalLevel}
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(latestAnalysis.createdAt)}
            </span>
            <Badge variant={latestAnalysis.progress === 100 ? "default" : "outline"} className="font-medium">
              {latestAnalysis.progress === 100 ? "Complete" : `${latestAnalysis.progress}%`}
            </Badge>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="executive-summary">Executive Summary</TabsTrigger>
              <TabsTrigger value="skill-mapping">Skill Mapping</TabsTrigger>
            </TabsList>
            
            <TabsContent value="executive-summary" className="pt-4">
              <h3 className="text-lg font-medium mb-3">Executive Summary</h3>
              <p>{typeof report.executiveSummary === 'string' 
                ? report.executiveSummary 
                : (report.executiveSummary?.summary || 'No summary available')}
              </p>
            </TabsContent>
            
            <TabsContent value="skill-mapping" className="pt-4">
              <h3 className="text-lg font-medium mb-3">Skill Mapping</h3>
              <p>Skill mapping data would appear here.</p>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}