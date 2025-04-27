import { useState, useEffect } from "react";
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
  Download,
  ScrollText,
  ListChecks,
  BarChart,
  GitBranch,
  BookOpen,
  Backpack,
  Map,
  Search,
  Lightbulb,
  TrendingUp,
  Route,
  Plus,
  ChevronRight 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { CareerAnalysisReport } from "@shared/reportSchema";
import { SkillRadarChart } from "@/components/career-pathway/SkillRadarChart";
import { ComparativeBarChart } from "@/components/career-pathway/ComparativeBarChart";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SavedAnalysis {
  id: string;
  professionalLevel: string;
  desiredRole: string;
  createdAt: string;
  progress: number;
  result?: CareerAnalysisReport;
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
      <CardContent className="p-0">
        <div className="p-4 bg-muted/30 border-b">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold">{latestAnalysis.desiredRole}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="font-normal">
                  {latestAnalysis.professionalLevel}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDate(latestAnalysis.createdAt)}
                </span>
              </div>
            </div>
            <Badge variant={latestAnalysis.progress === 100 ? "default" : "outline"} className="font-medium">
              {latestAnalysis.progress === 100 ? "Complete" : `${latestAnalysis.progress}%`}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Fit Score:</span>
              <div className="flex items-center">
                <span className="text-lg font-bold text-primary">
                  {report.executiveSummary?.fitScore?.score || "N/A"}
                </span>
                <span className="text-sm text-muted-foreground">
                  /{report.executiveSummary?.fitScore?.outOf || 10}
                </span>
              </div>
            </div>
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b overflow-x-auto">
            <ScrollArea className="w-full whitespace-nowrap pb-1">
              <TabsList className="bg-transparent p-0 mx-4 mb-0 w-auto inline-flex">
                <TabsTrigger 
                  value="executive-summary"
                  className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <ScrollText className="h-4 w-4 mr-2" />
                  Executive Summary
                </TabsTrigger>
                <TabsTrigger 
                  value="skill-mapping"
                  className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <ListChecks className="h-4 w-4 mr-2" />
                  Skill Mapping
                </TabsTrigger>
                <TabsTrigger 
                  value="skill-gap-analysis"
                  className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <BarChart className="h-4 w-4 mr-2" />
                  Skill Gap Analysis
                </TabsTrigger>
                <TabsTrigger 
                  value="career-pathway-options"
                  className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <GitBranch className="h-4 w-4 mr-2" />
                  Pathway Options
                </TabsTrigger>
                <TabsTrigger 
                  value="development-plan"
                  className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Development Plan
                </TabsTrigger>
                <TabsTrigger 
                  value="educational-programs"
                  className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <Backpack className="h-4 w-4 mr-2" />
                  Educational Programs
                </TabsTrigger>
                <TabsTrigger 
                  value="learning-roadmap"
                  className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <Map className="h-4 w-4 mr-2" />
                  Learning Roadmap
                </TabsTrigger>
                <TabsTrigger 
                  value="similar-roles"
                  className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Similar Roles
                </TabsTrigger>
                <TabsTrigger 
                  value="quick-tips"
                  className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Quick Tips
                </TabsTrigger>
                <TabsTrigger 
                  value="growth-trajectory"
                  className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Growth Trajectory
                </TabsTrigger>
                <TabsTrigger 
                  value="learning-path-roadmap"
                  className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
                >
                  <Route className="h-4 w-4 mr-2" />
                  Learning Path Roadmap
                </TabsTrigger>
              </TabsList>
            </ScrollArea>
          </div>
          
          <div className="p-6">
            {/* Executive Summary Tab */}
            <TabsContent value="executive-summary" className="mt-0">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                  <ScrollText className="h-5 w-5 mr-2 text-primary" />
                  Executive Summary
                </h3>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Career Goal</h4>
                  <p className="text-sm">{report.executiveSummary.careerGoal || "No career goal specified"}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Summary</h4>
                  <p className="text-sm whitespace-pre-wrap">{report.executiveSummary.summary}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Key Findings</h4>
                  <ul className="list-disc list-inside text-sm">
                    {report.executiveSummary.keyFindings.map((finding, idx) => (
                      <li key={idx} className="mb-1">{finding}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            {/* Skill Mapping Tab */}
            <TabsContent value="skill-mapping" className="mt-0">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                  <ListChecks className="h-5 w-5 mr-2 text-primary" />
                  Skill Mapping
                </h3>
                
                <div>
                  <p className="text-sm mb-4 whitespace-pre-wrap">{report.skillMapping.skillsAnalysis}</p>
                </div>
                
                <div className="space-y-6">
                  {/* SFIA Skills */}
                  {report.skillMapping.sfiaSkills && report.skillMapping.sfiaSkills.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">SFIA Framework Skills</h4>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Skill</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Proficiency</TableHead>
                              <TableHead className="hidden md:table-cell">Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {report.skillMapping.sfiaSkills.map((skill, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{skill.skill}</TableCell>
                                <TableCell>{skill.category}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress value={skill.proficiency * 10} className="h-2 w-16" />
                                    <span className="text-xs">{skill.proficiency}/10</span>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                                  {skill.description}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                  
                  {/* DigComp Skills */}
                  {report.skillMapping.digCompSkills && report.skillMapping.digCompSkills.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">DigComp Framework Skills</h4>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Skill</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Proficiency</TableHead>
                              <TableHead className="hidden md:table-cell">Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {report.skillMapping.digCompSkills.map((skill, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{skill.skill}</TableCell>
                                <TableCell>{skill.category}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress value={skill.proficiency * 10} className="h-2 w-16" />
                                    <span className="text-xs">{skill.proficiency}/10</span>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                                  {skill.description}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                  
                  {/* Other Skills */}
                  {report.skillMapping.otherSkills && report.skillMapping.otherSkills.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Other Skills</h4>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Skill</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Proficiency</TableHead>
                              <TableHead className="hidden md:table-cell">Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {report.skillMapping.otherSkills.map((skill, idx) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{skill.skill}</TableCell>
                                <TableCell>{skill.category}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Progress value={skill.proficiency * 10} className="h-2 w-16" />
                                    <span className="text-xs">{skill.proficiency}/10</span>
                                  </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                                  {skill.description}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Skill Gap Analysis Tab */}
            <TabsContent value="skill-gap-analysis" className="mt-0">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                  <BarChart className="h-5 w-5 mr-2 text-primary" />
                  Skill Gap Analysis for {report.skillGapAnalysis.targetRole}
                </h3>
                
                <div>
                  <p className="text-sm mb-4 whitespace-pre-wrap">{report.skillGapAnalysis.aiAnalysis}</p>
                </div>
                
                {/* Radar Chart for Current Proficiency */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-medium mb-3 text-center">Current Skill Proficiency</h4>
                    <div className="h-[300px] flex justify-center">
                      <SkillRadarChart data={report.skillGapAnalysis.currentProficiencyData} />
                    </div>
                  </div>
                  
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-medium mb-3 text-center">Skill Gap Analysis</h4>
                    <div className="h-[300px] flex justify-center">
                      <ComparativeBarChart data={report.skillGapAnalysis.gapAnalysisData} />
                    </div>
                  </div>
                </div>
                
                {/* Key Gaps */}
                <div>
                  <h4 className="font-medium mb-3">Key Skill Gaps</h4>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Skill</TableHead>
                          <TableHead>Current</TableHead>
                          <TableHead>Required</TableHead>
                          <TableHead>Gap</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead className="hidden md:table-cell">Improvement Suggestion</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.skillGapAnalysis.keyGaps.map((gap, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{gap.skill}</TableCell>
                            <TableCell>{gap.currentLevel}</TableCell>
                            <TableCell>{gap.requiredLevel}</TableCell>
                            <TableCell className="text-red-500 font-medium">{gap.gap}</TableCell>
                            <TableCell>
                              <Badge variant={
                                gap.priority?.toLowerCase() === "high" ? "destructive" : 
                                gap.priority?.toLowerCase() === "medium" ? "default" : 
                                "secondary"
                              }>
                                {gap.priority}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                              {gap.improvementSuggestion}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                {/* Key Strengths */}
                <div>
                  <h4 className="font-medium mb-3">Key Strengths</h4>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Skill</TableHead>
                          <TableHead>Current</TableHead>
                          <TableHead>Required</TableHead>
                          <TableHead>Advantage</TableHead>
                          <TableHead className="hidden md:table-cell">Leverage Suggestion</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.skillGapAnalysis.keyStrengths.map((strength, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{strength.skill}</TableCell>
                            <TableCell>{strength.currentLevel}</TableCell>
                            <TableCell>{strength.requiredLevel}</TableCell>
                            <TableCell className="text-green-500 font-medium">+{strength.advantage}</TableCell>
                            <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                              {strength.leverageSuggestion}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Career Pathway Options Tab */}
            <TabsContent value="career-pathway-options" className="mt-0">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                  <GitBranch className="h-5 w-5 mr-2 text-primary" />
                  Career Pathway Options
                </h3>
                
                <div className="bg-muted/30 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">Career Pathway</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        From <span className="font-medium">{report.careerPathwayOptions.currentRole}</span> to{" "}
                        <span className="font-medium">{report.careerPathwayOptions.targetRole}</span>
                      </p>
                    </div>
                    <Badge variant="outline">{report.careerPathwayOptions.timeframe}</Badge>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm mb-4 whitespace-pre-wrap">{report.careerPathwayOptions.pathwayDescription}</p>
                </div>
                
                {/* Pathway Steps */}
                <div>
                  <h4 className="font-medium mb-3">Pathway Steps</h4>
                  <div className="space-y-3">
                    {report.careerPathwayOptions.pathwaySteps.map((step, idx) => (
                      <div key={idx} className="flex gap-4 pb-4 relative">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                            {idx + 1}
                          </div>
                          {idx < report.careerPathwayOptions.pathwaySteps.length - 1 && (
                            <div className="w-0.5 bg-muted-foreground/30 h-full mt-1"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h5 className="font-medium text-base">{step.step}</h5>
                            <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-md">
                              {step.timeframe}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* University & Vocational Pathways */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* University Pathway */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">University Pathway</h4>
                    <div className="space-y-4">
                      {report.careerPathwayOptions.universityPathway.map((item, idx) => (
                        <div key={idx} className="border-b pb-3 last:border-b-0 last:pb-0">
                          <h5 className="font-medium text-sm">{item.degree}</h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            <span className="inline-block mr-2">⏱️ {item.duration}</span>
                          </p>
                          <div className="mt-2">
                            <p className="text-xs font-medium mb-1">Institutions:</p>
                            <ul className="list-disc list-inside text-xs text-muted-foreground">
                              {item.institutions.map((inst, i) => (
                                <li key={i}>{inst}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs font-medium mb-1">Outcomes:</p>
                            <ul className="list-disc list-inside text-xs text-muted-foreground">
                              {item.outcomes.map((outcome, i) => (
                                <li key={i}>{outcome}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Vocational Pathway */}
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Vocational Pathway</h4>
                    <div className="space-y-4">
                      {report.careerPathwayOptions.vocationalPathway.map((item, idx) => (
                        <div key={idx} className="border-b pb-3 last:border-b-0 last:pb-0">
                          <h5 className="font-medium text-sm">{item.certification}</h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            <span className="inline-block mr-2">⏱️ {item.duration}</span>
                          </p>
                          <div className="mt-2">
                            <p className="text-xs font-medium mb-1">Providers:</p>
                            <ul className="list-disc list-inside text-xs text-muted-foreground">
                              {item.providers.map((prov, i) => (
                                <li key={i}>{prov}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="mt-2">
                            <p className="text-xs font-medium mb-1">Outcomes:</p>
                            <ul className="list-disc list-inside text-xs text-muted-foreground">
                              {item.outcomes.map((outcome, i) => (
                                <li key={i}>{outcome}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="font-medium mb-2">AI Insights</h4>
                  <p className="text-sm whitespace-pre-wrap">{report.careerPathwayOptions.aiInsights}</p>
                </div>
              </div>
            </TabsContent>
            
            {/* Development Plan Tab */}
            <TabsContent value="development-plan" className="mt-0">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Development Plan
                </h3>
                
                <div>
                  <p className="text-sm mb-4 whitespace-pre-wrap">{report.developmentPlan.overview}</p>
                </div>
                
                {/* Technical Skills */}
                <div>
                  <h4 className="font-medium mb-3">Technical Skills Development</h4>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Skill</TableHead>
                          <TableHead>Current Level</TableHead>
                          <TableHead>Target Level</TableHead>
                          <TableHead>Timeframe</TableHead>
                          <TableHead className="hidden md:table-cell">Resources</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.developmentPlan.technicalSkills.map((skill, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{skill.skill}</TableCell>
                            <TableCell>{skill.currentLevel}</TableCell>
                            <TableCell>{skill.targetLevel}</TableCell>
                            <TableCell>{skill.timeframe}</TableCell>
                            <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                              <ul className="list-disc list-inside">
                                {skill.resources.map((resource, i) => (
                                  <li key={i}>{resource}</li>
                                ))}
                              </ul>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                {/* Soft Skills */}
                <div>
                  <h4 className="font-medium mb-3">Soft Skills Development</h4>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Skill</TableHead>
                          <TableHead>Current Level</TableHead>
                          <TableHead>Target Level</TableHead>
                          <TableHead>Timeframe</TableHead>
                          <TableHead className="hidden md:table-cell">Resources</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.developmentPlan.softSkills.map((skill, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{skill.skill}</TableCell>
                            <TableCell>{skill.currentLevel}</TableCell>
                            <TableCell>{skill.targetLevel}</TableCell>
                            <TableCell>{skill.timeframe}</TableCell>
                            <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                              <ul className="list-disc list-inside">
                                {skill.resources.map((resource, i) => (
                                  <li key={i}>{resource}</li>
                                ))}
                              </ul>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                {/* Skills to Acquire */}
                <div>
                  <h4 className="font-medium mb-3">New Skills to Acquire</h4>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Skill</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Timeframe</TableHead>
                          <TableHead className="hidden md:table-cell">Resources</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.developmentPlan.skillsToAcquire.map((skill, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{skill.skill}</TableCell>
                            <TableCell className="text-xs">{skill.reason}</TableCell>
                            <TableCell>{skill.timeframe}</TableCell>
                            <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                              <ul className="list-disc list-inside">
                                {skill.resources.map((resource, i) => (
                                  <li key={i}>{resource}</li>
                                ))}
                              </ul>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Educational Programs Tab */}
            <TabsContent value="educational-programs" className="mt-0">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                  <Backpack className="h-5 w-5 mr-2 text-primary" />
                  Educational Programs
                </h3>
                
                <div>
                  <p className="text-sm mb-4 whitespace-pre-wrap">{report.educationalPrograms.introduction}</p>
                </div>
                
                {/* Recommended Programs */}
                <div>
                  <h4 className="font-medium mb-3">Recommended Programs</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {report.educationalPrograms.recommendedPrograms.map((program, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex justify-between">
                          <h5 className="font-medium">{program.name}</h5>
                          <Badge variant="outline" className="whitespace-nowrap">
                            {program.duration}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Provider: {program.provider}</p>
                        <p className="text-sm text-muted-foreground">Format: {program.format}</p>
                        <p className="text-sm mt-2">{program.description}</p>
                        <div className="mt-3">
                          <p className="text-xs font-medium mb-1">Skills Covered:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {program.skillsCovered.map((skill, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Project Ideas */}
                <div>
                  <h4 className="font-medium mb-3">Project Ideas</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {report.educationalPrograms.projectIdeas.map((project, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex justify-between">
                          <h5 className="font-medium">{project.title}</h5>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="whitespace-nowrap">
                              {project.difficulty}
                            </Badge>
                            <Badge variant="outline" className="whitespace-nowrap">
                              {project.timeEstimate}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm mt-2">{project.description}</p>
                        <div className="mt-3">
                          <p className="text-xs font-medium mb-1">Skills Developed:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {project.skillsDeveloped.map((skill, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
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
            </TabsContent>
            
            {/* Learning Roadmap Tab */}
            <TabsContent value="learning-roadmap" className="mt-0">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                  <Map className="h-5 w-5 mr-2 text-primary" />
                  Learning Roadmap
                </h3>
                
                <div>
                  <p className="text-sm mb-4 whitespace-pre-wrap">{report.learningRoadmap.overview}</p>
                </div>
                
                {/* Learning Phases */}
                <div>
                  {report.learningRoadmap.phases.map((phase, idx) => (
                    <div key={idx} className="mb-6 last:mb-0">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                          {idx < report.learningRoadmap.phases.length - 1 && (
                            <div className="absolute top-10 bottom-0 left-1/2 w-0.5 bg-muted-foreground/30 -translate-x-1/2 h-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-lg">{phase.phase}</h4>
                            <Badge variant="outline" className="whitespace-nowrap w-fit">
                              {phase.timeframe}
                            </Badge>
                          </div>
                          <p className="text-sm">{phase.focus}</p>
                          
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-muted/30 p-3 rounded-lg">
                              <h5 className="font-medium text-sm mb-2">Milestones</h5>
                              <ul className="list-disc list-inside text-sm">
                                {phase.milestones.map((milestone, i) => (
                                  <li key={i} className="mb-1">{milestone}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="bg-muted/30 p-3 rounded-lg">
                              <h5 className="font-medium text-sm mb-2">Resources</h5>
                              <ul className="space-y-2">
                                {phase.resources.map((resource, i) => (
                                  <li key={i} className="text-sm">
                                    <div className="flex items-start">
                                      <span className="font-medium inline-block min-w-[60px] mr-2">
                                        {resource.type}:
                                      </span>
                                      <span>
                                        {resource.link ? (
                                          <a 
                                            href={resource.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline flex items-center"
                                          >
                                            {resource.name}
                                            <ChevronRight className="h-3 w-3 ml-1" />
                                          </a>
                                        ) : (
                                          resource.name
                                        )}
                                      </span>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Similar Roles Tab */}
            <TabsContent value="similar-roles" className="mt-0">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                  <Search className="h-5 w-5 mr-2 text-primary" />
                  Similar Roles
                </h3>
                
                <div>
                  <p className="text-sm mb-4 whitespace-pre-wrap">{report.similarRoles.introduction}</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {report.similarRoles.roles.map((role, idx) => (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                        <h4 className="font-medium text-lg">{role.role}</h4>
                        <div className="flex items-center">
                          <Badge 
                            variant={
                              role.similarityScore >= 80 ? "default" : 
                              role.similarityScore >= 60 ? "secondary" : 
                              "outline"
                            }
                            className="whitespace-nowrap"
                          >
                            {role.similarityScore}% Similarity
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm mb-4">{role.summary}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Key Skill Overlap</h5>
                          <div className="flex flex-wrap gap-1">
                            {role.keySkillOverlap.map((skill, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-sm mb-2">Additional Skills Needed</h5>
                          <div className="flex flex-wrap gap-1">
                            {role.additionalSkillsNeeded.map((skill, i) => (
                              <Badge key={i} variant="outline" className="text-xs bg-primary/10 border-primary/20 text-primary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            {/* Quick Tips Tab */}
            <TabsContent value="quick-tips" className="mt-0">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                  <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                  Quick Tips
                </h3>
                
                <div>
                  <p className="text-sm mb-4 whitespace-pre-wrap">{report.quickTips.introduction}</p>
                </div>
                
                {/* Quick Wins */}
                <div>
                  <h4 className="font-medium mb-3">Quick Wins</h4>
                  <div className="space-y-3">
                    {report.quickTips.quickWins.map((tip, idx) => (
                      <div key={idx} className="bg-muted/30 p-4 rounded-lg">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h5 className="font-medium">{tip.tip}</h5>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="whitespace-nowrap">
                              {tip.timeframe}
                            </Badge>
                            <Badge variant={
                              tip.impact?.toLowerCase().includes("high") ? "default" : 
                              tip.impact?.toLowerCase().includes("medium") ? "secondary" : 
                              "outline"
                            } className="whitespace-nowrap">
                              {tip.impact}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Industry Insights */}
                <div>
                  <h4 className="font-medium mb-3">Industry Insights</h4>
                  <ul className="space-y-2">
                    {report.quickTips.industryInsights.map((insight, idx) => (
                      <li key={idx} className="bg-white p-4 rounded-lg border flex items-start">
                        <span className="text-primary font-bold mr-2">💡</span>
                        <p className="text-sm">{insight}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            {/* Growth Trajectory Tab */}
            <TabsContent value="growth-trajectory" className="mt-0">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                  <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                  Growth Trajectory
                </h3>
                
                <div>
                  <p className="text-sm mb-4 whitespace-pre-wrap">{report.growthTrajectory.introduction}</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Short Term */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2 text-center">Short Term</h4>
                    <div className="bg-muted/30 p-3 rounded-lg mb-3">
                      <div className="text-center">
                        <h5 className="font-semibold text-lg mb-1">{report.growthTrajectory.shortTerm.role}</h5>
                        <Badge variant="outline">{report.growthTrajectory.shortTerm.timeline}</Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h5 className="text-sm font-medium mb-1">Responsibilities:</h5>
                      <ul className="list-disc list-inside text-sm">
                        {report.growthTrajectory.shortTerm.responsibilities.map((resp, idx) => (
                          <li key={idx} className="mb-1">{resp}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-3">
                      <h5 className="text-sm font-medium mb-1">Required Skills:</h5>
                      <div className="flex flex-wrap gap-1">
                        {report.growthTrajectory.shortTerm.skillsRequired.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-1">Salary Range:</h5>
                      <p className="text-sm">
                        {report.growthTrajectory.shortTerm.salary.currency}{' '}
                        {report.growthTrajectory.shortTerm.salary.min.toLocaleString()} - {' '}
                        {report.growthTrajectory.shortTerm.salary.max.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Medium Term */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2 text-center">Medium Term</h4>
                    <div className="bg-muted/30 p-3 rounded-lg mb-3">
                      <div className="text-center">
                        <h5 className="font-semibold text-lg mb-1">{report.growthTrajectory.mediumTerm.role}</h5>
                        <Badge variant="outline">{report.growthTrajectory.mediumTerm.timeline}</Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h5 className="text-sm font-medium mb-1">Responsibilities:</h5>
                      <ul className="list-disc list-inside text-sm">
                        {report.growthTrajectory.mediumTerm.responsibilities.map((resp, idx) => (
                          <li key={idx} className="mb-1">{resp}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-3">
                      <h5 className="text-sm font-medium mb-1">Required Skills:</h5>
                      <div className="flex flex-wrap gap-1">
                        {report.growthTrajectory.mediumTerm.skillsRequired.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-1">Salary Range:</h5>
                      <p className="text-sm">
                        {report.growthTrajectory.mediumTerm.salary.currency}{' '}
                        {report.growthTrajectory.mediumTerm.salary.min.toLocaleString()} - {' '}
                        {report.growthTrajectory.mediumTerm.salary.max.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Long Term */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2 text-center">Long Term</h4>
                    <div className="bg-muted/30 p-3 rounded-lg mb-3">
                      <div className="text-center">
                        <h5 className="font-semibold text-lg mb-1">{report.growthTrajectory.longTerm.role}</h5>
                        <Badge variant="outline">{report.growthTrajectory.longTerm.timeline}</Badge>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <h5 className="text-sm font-medium mb-1">Responsibilities:</h5>
                      <ul className="list-disc list-inside text-sm">
                        {report.growthTrajectory.longTerm.responsibilities.map((resp, idx) => (
                          <li key={idx} className="mb-1">{resp}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mb-3">
                      <h5 className="text-sm font-medium mb-1">Required Skills:</h5>
                      <div className="flex flex-wrap gap-1">
                        {report.growthTrajectory.longTerm.skillsRequired.map((skill, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-medium mb-1">Salary Range:</h5>
                      <p className="text-sm">
                        {report.growthTrajectory.longTerm.salary.currency}{' '}
                        {report.growthTrajectory.longTerm.salary.min.toLocaleString()} - {' '}
                        {report.growthTrajectory.longTerm.salary.max.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Learning Path Roadmap Tab */}
            <TabsContent value="learning-path-roadmap" className="mt-0">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                  <Route className="h-5 w-5 mr-2 text-primary" />
                  Learning Path Roadmap
                </h3>
                
                <div>
                  <p className="text-sm mb-4 whitespace-pre-wrap">{report.learningPathRoadmap.overview}</p>
                </div>
                
                {/* Career Trajectory */}
                <div>
                  <h4 className="font-medium mb-4">Career Trajectory</h4>
                  <div className="space-y-8">
                    {report.learningPathRoadmap.careerTrajectory.map((stage, idx) => (
                      <div key={idx} className="relative">
                        <div className="flex items-start gap-6">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                              {idx + 1}
                            </div>
                            {idx < report.learningPathRoadmap.careerTrajectory.length - 1 && (
                              <div className="absolute top-10 bottom-0 left-1/2 w-0.5 bg-muted-foreground/30 -translate-x-1/2 h-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                              <div>
                                <h5 className="font-semibold text-lg">{stage.stage}</h5>
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-medium">{stage.role}</span> • {stage.timeframe}
                                </p>
                              </div>
                            </div>
                            
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-muted/30 p-3 rounded-lg">
                                <h5 className="font-medium text-sm mb-2">Skills to Focus</h5>
                                <div className="flex flex-wrap gap-1">
                                  {stage.skills.map((skill, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="bg-muted/30 p-3 rounded-lg">
                                <h5 className="font-medium text-sm mb-2">Milestones</h5>
                                <ul className="list-disc list-inside text-sm">
                                  {stage.milestones.map((milestone, i) => (
                                    <li key={i} className="mb-1">{milestone}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}