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
import { Loader2, ChevronDown, ChevronUp, BarChart3, Download, Clock, RefreshCw, History, ChartBarIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { SkillRadarChart } from "@/components/career-pathway/SkillRadarChart";
import { ComparativeBarChart } from "@/components/career-pathway/ComparativeBarChart";
import { AIRecommendationsPanel } from "@/components/career-pathway/AIRecommendationsPanel";

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

  const viewFullAnalysis = (id: string) => {
    // Use document.location to ensure the page refreshes
    document.location.href = `/career-analysis/${id}`;
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
                <div className="mt-4 space-y-6 text-sm divide-y overflow-hidden">
                  {latestAnalysis.result.executiveSummary && (
                    <div className="pb-4">
                      <h3 className="text-base font-semibold mb-2">Executive Summary</h3>
                      <p className="text-muted-foreground break-words">{latestAnalysis.result.executiveSummary}</p>
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
                            {latestAnalysis.result.skillMapping.sfia9.slice(0, 5).map((skill: any, index: number) => (
                              <li key={index} className="flex items-start">
                                <Badge variant="outline" className="mr-2 mt-0.5 shrink-0">
                                  {skill.level}
                                </Badge>
                                <div className="overflow-hidden">
                                  <span className="font-medium">{skill.skill}</span>
                                  <p className="text-xs text-muted-foreground truncate" title={skill.description}>
                                    {skill.description}
                                  </p>
                                </div>
                              </li>
                            ))}
                            {latestAnalysis.result.skillMapping.sfia9.length > 5 && (
                              <li className="text-xs text-muted-foreground italic">
                                And {latestAnalysis.result.skillMapping.sfia9.length - 5} more skills...
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                      
                      {/* DigComp 2.2 Skills */}
                      {latestAnalysis.result.skillMapping.digcomp22 && latestAnalysis.result.skillMapping.digcomp22.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">DigComp 2.2 Framework</h4>
                          <ul className="space-y-1">
                            {latestAnalysis.result.skillMapping.digcomp22.slice(0, 5).map((comp: any, index: number) => (
                              <li key={index} className="flex items-start">
                                <Badge variant="outline" className="mr-2 mt-0.5 shrink-0">
                                  {comp.level}
                                </Badge>
                                <div className="overflow-hidden">
                                  <span className="font-medium">{comp.competency}</span>
                                  <p className="text-xs text-muted-foreground truncate" title={comp.description}>
                                    {comp.description}
                                  </p>
                                </div>
                              </li>
                            ))}
                            {latestAnalysis.result.skillMapping.digcomp22.length > 5 && (
                              <li className="text-xs text-muted-foreground italic">
                                And {latestAnalysis.result.skillMapping.digcomp22.length - 5} more competencies...
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Skill Gap Analysis */}
                  {latestAnalysis.result.skillGapAnalysis && (
                    <div className="pt-4 pb-4">
                      <h3 className="text-base font-semibold mb-3">Skill Gap Analysis</h3>
                      
                      {/* Limited AI Analysis */}
                      {latestAnalysis.result.skillGapAnalysis.aiAnalysis && (
                        <div className="mb-4">
                          <p className="text-muted-foreground text-sm break-words">
                            {latestAnalysis.result.skillGapAnalysis.aiAnalysis.length > 150 ? 
                              `${latestAnalysis.result.skillGapAnalysis.aiAnalysis.substring(0, 150)}...` : 
                              latestAnalysis.result.skillGapAnalysis.aiAnalysis}
                          </p>
                        </div>
                      )}
                      
                      {/* Grid layout for gaps and strengths */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {/* Skill Gaps */}
                        {latestAnalysis.result.skillGapAnalysis.gaps && latestAnalysis.result.skillGapAnalysis.gaps.length > 0 && (
                          <div className="border rounded-md overflow-hidden">
                            <div className="bg-destructive/10 p-2">
                              <h4 className="text-sm font-medium">Key Skill Gaps</h4>
                            </div>
                            <div className="p-3">
                              <div className="space-y-3">
                                {latestAnalysis.result.skillGapAnalysis.gaps.slice(0, 3).map((gap: any, index: number) => (
                                  <div key={index} className="flex items-start">
                                    <Badge 
                                      variant={gap.importance.toLowerCase() === 'high' ? 'destructive' : 'outline'} 
                                      className="mr-2 mt-0.5 shrink-0"
                                    >
                                      {gap.importance}
                                    </Badge>
                                    <div>
                                      <span className="font-medium">{gap.skill}</span>
                                      <p className="text-xs text-muted-foreground line-clamp-2">{gap.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Strengths */}
                        {latestAnalysis.result.skillGapAnalysis.strengths && latestAnalysis.result.skillGapAnalysis.strengths.length > 0 && (
                          <div className="border rounded-md overflow-hidden">
                            <div className="bg-green-100 dark:bg-green-950/30 p-2">
                              <h4 className="text-sm font-medium text-green-800 dark:text-green-200">Key Strengths</h4>
                            </div>
                            <div className="p-3">
                              <div className="space-y-3">
                                {latestAnalysis.result.skillGapAnalysis.strengths.slice(0, 3).map((strength: any, index: number) => (
                                  <div key={index} className="flex items-start">
                                    <Badge 
                                      variant="secondary" 
                                      className="mr-2 mt-0.5 shrink-0 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200"
                                    >
                                      {strength.level}
                                    </Badge>
                                    <div>
                                      <span className="font-medium">{strength.skill}</span>
                                      <p className="text-xs text-muted-foreground">
                                        <span className="font-medium text-xs">Relevance:</span> {strength.relevance}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Skill Visualization Charts */}
                      <div className="mt-8 border-t border-muted pt-6">
                        <h4 className="text-sm font-medium mb-4">Skill Visualizations</h4>
                        
                        {/* Chart Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                          {/* Skill Radar Chart */}
                          <div className="border rounded-md p-3 bg-muted/20">
                            <h4 className="text-sm font-medium mb-3 text-center">Skill Gap Visualization</h4>
                            <div className="w-full" style={{ height: '280px' }}>
                              {latestAnalysis.result && <SkillRadarChart results={latestAnalysis.result} />}
                            </div>
                          </div>
                          
                          {/* Comparative Bar Chart */}
                          <div className="border rounded-md p-3 bg-muted/20">
                            <h4 className="text-sm font-medium mb-3 text-center">Skills Comparison</h4>
                            <div className="w-full" style={{ height: '280px' }}>
                              {latestAnalysis.result && <ComparativeBarChart results={latestAnalysis.result} />}
                            </div>
                          </div>
                        </div>
                        
                        {/* AI Recommendations Section - Only show if expanded */}
                        {latestAnalysis.result && 
                          (latestAnalysis.result.skillGapAnalysis?.aiAnalysis ||
                           latestAnalysis.result.careerPathway?.aiRecommendations ||
                           latestAnalysis.result.developmentPlan?.personalizedGrowthInsights) && (
                          <div className="mb-4">
                            {latestAnalysis.result && <AIRecommendationsPanel results={latestAnalysis.result} />}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Career Pathway */}
                  {latestAnalysis.result.careerPathway && (
                    <div className="pt-6 border-t border-muted">
                      <h3 className="text-base font-semibold mb-3">Career Pathway</h3>
                      
                      {/* Limit the AI recommendations to prevent overflow */}
                      {latestAnalysis.result.careerPathway.aiRecommendations && (
                        <div className="mb-4">
                          <p className="text-muted-foreground text-sm">
                            {latestAnalysis.result.careerPathway.aiRecommendations.length > 150 ? 
                              `${latestAnalysis.result.careerPathway.aiRecommendations.substring(0, 150)}...` : 
                              latestAnalysis.result.careerPathway.aiRecommendations}
                          </p>
                        </div>
                      )}
                      
                      {/* Pathway Tabs for Degree/Non-Degree paths */}
                      <div className="mb-4">
                        <div className="grid grid-cols-2 gap-4">
                          {/* University Pathway */}
                          {latestAnalysis.result.careerPathway.withDegree && latestAnalysis.result.careerPathway.withDegree.length > 0 && (
                            <div className="border rounded-md overflow-hidden">
                              <div className="bg-primary/10 p-2">
                                <h4 className="text-sm font-medium">University Pathway</h4>
                              </div>
                              <div className="p-3">
                                {latestAnalysis.result.careerPathway.withDegree.slice(0, 2).map((step: any, index: number) => (
                                  <div key={index} className="flex items-start mb-3 last:mb-0">
                                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary mr-2">
                                      {index + 1}
                                    </div>
                                    <div>
                                      <span className="font-medium">{step.role}</span>
                                      <p className="text-xs text-muted-foreground">{step.timeframe}</p>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {step.keySkillsNeeded.slice(0, 3).map((skill: string, idx: number) => (
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
                          )}
                          
                          {/* Vocational Pathway */}
                          {latestAnalysis.result.careerPathway.withoutDegree && latestAnalysis.result.careerPathway.withoutDegree.length > 0 && (
                            <div className="border rounded-md overflow-hidden">
                              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-2">
                                <h4 className="text-sm font-medium">Vocational Pathway</h4>
                              </div>
                              <div className="p-3">
                                {latestAnalysis.result.careerPathway.withoutDegree.slice(0, 2).map((step: any, index: number) => (
                                  <div key={index} className="flex items-start mb-3 last:mb-0">
                                    <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 mr-2">
                                      {index + 1}
                                    </div>
                                    <div>
                                      <span className="font-medium">{step.role}</span>
                                      <p className="text-xs text-muted-foreground">{step.timeframe}</p>
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {step.keySkillsNeeded.slice(0, 3).map((skill: string, idx: number) => (
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
                          )}
                        </div>
                      </div>
                      
                      {/* Call to action for full view */}
                      <div className="flex justify-center mt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs"
                          onClick={() => viewFullAnalysis(latestAnalysis.id)}
                        >
                          View Complete Pathway Analysis
                        </Button>
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