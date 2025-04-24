import { useState } from "react";
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
      const response = await fetch("/api/dashboard");
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

  const viewFullAnalysis = (id: string) => {
    window.open(`/career-analysis/${id}`, '_blank');
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
              <p className="text-sm text-muted-foreground mb-1">Professional Level: {latestAnalysis.professionalLevel}</p>
              
              {expandedAnalysis === latestAnalysis.id && latestAnalysis.result && (
                <div className="mt-4 space-y-6 text-sm divide-y">
                  {latestAnalysis.result.executiveSummary && (
                    <div className="pb-4">
                      <h3 className="text-base font-semibold mb-2">Executive Summary</h3>
                      <p className="text-muted-foreground">{latestAnalysis.result.executiveSummary}</p>
                    </div>
                  )}
                  
                  {/* Skill Mapping Section */}
                  {latestAnalysis.result.skillMapping && (
                    <div className="pt-4 pb-4">
                      <h3 className="text-base font-semibold mb-2">Skill Mapping</h3>
                      
                      {/* SFIA 9 Skills */}
                      {latestAnalysis.result.skillMapping.sfia9 && latestAnalysis.result.skillMapping.sfia9.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium mb-1">SFIA 9 Framework</h4>
                          <ul className="space-y-1">
                            {latestAnalysis.result.skillMapping.sfia9.map((skill: any, index: number) => (
                              <li key={index} className="flex items-start">
                                <Badge variant="outline" className="mr-2 mt-0.5">
                                  {skill.level}
                                </Badge>
                                <div>
                                  <span className="font-medium">{skill.skill}</span>
                                  <p className="text-xs text-muted-foreground">{skill.description}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* DigComp 2.2 Skills */}
                      {latestAnalysis.result.skillMapping.digcomp22 && latestAnalysis.result.skillMapping.digcomp22.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">DigComp 2.2 Framework</h4>
                          <ul className="space-y-1">
                            {latestAnalysis.result.skillMapping.digcomp22.map((comp: any, index: number) => (
                              <li key={index} className="flex items-start">
                                <Badge variant="outline" className="mr-2 mt-0.5">
                                  {comp.level}
                                </Badge>
                                <div>
                                  <span className="font-medium">{comp.competency}</span>
                                  <p className="text-xs text-muted-foreground">{comp.description}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Skill Gap Analysis */}
                  {latestAnalysis.result.skillGapAnalysis && (
                    <div className="pt-4 pb-4">
                      <h3 className="text-base font-semibold mb-2">Skill Gap Analysis</h3>
                      
                      {latestAnalysis.result.skillGapAnalysis.aiAnalysis && (
                        <p className="text-muted-foreground mb-3">{latestAnalysis.result.skillGapAnalysis.aiAnalysis}</p>
                      )}
                      
                      {/* Skill Gaps */}
                      {latestAnalysis.result.skillGapAnalysis.gaps && latestAnalysis.result.skillGapAnalysis.gaps.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-medium mb-1">Key Skill Gaps</h4>
                          <ul className="space-y-1">
                            {latestAnalysis.result.skillGapAnalysis.gaps.slice(0, 3).map((gap: any, index: number) => (
                              <li key={index} className="flex items-start">
                                <Badge variant={gap.importance.toLowerCase() === 'high' ? 'destructive' : 'outline'} className="mr-2 mt-0.5">
                                  {gap.importance}
                                </Badge>
                                <div>
                                  <span className="font-medium">{gap.skill}</span>
                                  <p className="text-xs text-muted-foreground">{gap.description}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Strengths */}
                      {latestAnalysis.result.skillGapAnalysis.strengths && latestAnalysis.result.skillGapAnalysis.strengths.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Key Strengths</h4>
                          <ul className="space-y-1">
                            {latestAnalysis.result.skillGapAnalysis.strengths.slice(0, 3).map((strength: any, index: number) => (
                              <li key={index} className="flex items-start">
                                <Badge variant="success" className="mr-2 mt-0.5 bg-green-600">
                                  {strength.level}
                                </Badge>
                                <div>
                                  <span className="font-medium">{strength.skill}</span>
                                  <p className="text-xs text-muted-foreground">Relevance: {strength.relevance}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Career Pathway */}
                  {latestAnalysis.result.careerPathway && (
                    <div className="pt-4">
                      <h3 className="text-base font-semibold mb-2">Career Pathway</h3>
                      
                      {latestAnalysis.result.careerPathway.aiRecommendations && (
                        <p className="text-muted-foreground mb-3">{latestAnalysis.result.careerPathway.aiRecommendations}</p>
                      )}
                      
                      {/* Show pathway steps */}
                      {latestAnalysis.result.careerPathway.withDegree && latestAnalysis.result.careerPathway.withDegree.length > 0 && (
                        <div className="mb-2">
                          <h4 className="text-sm font-medium mb-1">Primary Pathway</h4>
                          <div className="border rounded-md p-2 bg-muted/30">
                            {latestAnalysis.result.careerPathway.withDegree.slice(0, 2).map((step: any, index: number) => (
                              <div key={index} className="flex items-start mb-2 last:mb-0">
                                <Badge variant="outline" className="mr-2 mt-0.5">
                                  {index + 1}
                                </Badge>
                                <div>
                                  <span className="font-medium">{step.role}</span>
                                  <p className="text-xs text-muted-foreground">{step.timeframe} • {step.keySkillsNeeded.slice(0, 2).join(", ")}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Call to action for full view */}
                      <div className="text-center mt-4">
                        <p className="text-xs text-muted-foreground mb-2">
                          View the complete analysis for detailed development plans, learning resources, and more.
                        </p>
                      </div>
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
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => viewFullAnalysis(latestAnalysis.id)}
                >
                  View Full Analysis
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  className="px-2"
                  onClick={() => window.open(`/api/career-analyses/${latestAnalysis.id}/pdf`, '_blank')}
                >
                  <Download className="h-4 w-4" />
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