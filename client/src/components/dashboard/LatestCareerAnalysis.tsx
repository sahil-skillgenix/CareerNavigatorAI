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
  Download,
  BarChart,
  GitBranch,
  BookOpen,
  Search,
  Lightbulb
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SkillRadarChart } from "@/components/career-pathway/SkillRadarChart";
import { ComparativeBarChart } from "@/components/career-pathway/ComparativeBarChart";

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
  const reviewNotes = report?.reviewNotes || {};

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
          <div className="border-b overflow-x-auto p-0 mb-0">
            <TabsList className="bg-transparent h-auto p-0 mx-4 mb-0 w-auto inline-flex">
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
                value="career-pathway"
                className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <GitBranch className="h-4 w-4 mr-2" />
                Career Pathway
              </TabsTrigger>
              <TabsTrigger 
                value="development-plan"
                className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Development Plan
              </TabsTrigger>
              <TabsTrigger 
                value="similar-roles"
                className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <Search className="h-4 w-4 mr-2" />
                Similar Roles
              </TabsTrigger>
              <TabsTrigger 
                value="social-skills"
                className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-primary rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Social Skills
              </TabsTrigger>
            </TabsList>
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
                  <p className="text-sm">{executiveSummary.careerGoal || "No career goal specified"}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Summary</h4>
                  <p className="text-sm whitespace-pre-wrap">{executiveSummary.summary || 
                    (typeof report.executiveSummary === 'string' ? report.executiveSummary : "No summary available")}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Key Findings</h4>
                  <ul className="list-disc list-inside text-sm">
                    {executiveSummary.keyFindings?.map((finding: any, idx: number) => (
                      <li key={idx} className="mb-1">{finding}</li>
                    )) || <li className="text-muted-foreground">No key findings available</li>}
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
                
                {skillMapping.skillsAnalysis && (
                  <div>
                    <p className="text-sm mb-4 whitespace-pre-wrap">{skillMapping.skillsAnalysis}</p>
                  </div>
                )}
                
                <div className="space-y-6">
                  {/* SFIA Skills */}
                  {skillMapping.sfia9 && skillMapping.sfia9.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">SFIA Framework Skills</h4>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Skill</TableHead>
                              <TableHead>Level</TableHead>
                              <TableHead>Description</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {skillMapping.sfia9.map((skill: any, idx: number) => (
                              <TableRow key={idx}>
                                <TableCell className="font-medium">{skill.skill}</TableCell>
                                <TableCell>{skill.level}</TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {skill.description}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                  
                  {/* Other Skill Categories */}
                  {skillMapping.sfiaSkills && skillMapping.sfiaSkills.length > 0 && (
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
                            {skillMapping.sfiaSkills.map((skill: any, idx: number) => (
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
                  Skill Gap Analysis
                </h3>
                
                {skillGapAnalysis.aiAnalysis && (
                  <div>
                    <p className="text-sm mb-4 whitespace-pre-wrap">{skillGapAnalysis.aiAnalysis}</p>
                  </div>
                )}
                
                {/* Radar Chart for Current Proficiency */}
                {skillGapAnalysis.currentProficiencyData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <h4 className="font-medium mb-3 text-center">Current Skill Proficiency</h4>
                      <div className="h-[300px] flex justify-center">
                        <SkillRadarChart data={skillGapAnalysis.currentProficiencyData} title="Current Skills" />
                      </div>
                    </div>
                    
                    {skillGapAnalysis.gapAnalysisData && (
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <h4 className="font-medium mb-3 text-center">Skill Gap Analysis</h4>
                        <div className="h-[300px] flex justify-center">
                          <ComparativeBarChart data={skillGapAnalysis.gapAnalysisData} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Key Gaps */}
                {skillGapAnalysis.keyGaps && skillGapAnalysis.keyGaps.length > 0 && (
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
                          {skillGapAnalysis.keyGaps.map((gap: any, idx: number) => (
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
                                  {gap.priority || "Low"}
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
                )}
                
                {/* Key Strengths */}
                {skillGapAnalysis.keyStrengths && skillGapAnalysis.keyStrengths.length > 0 && (
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
                          {skillGapAnalysis.keyStrengths.map((strength: any, idx: number) => (
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
                )}
              </div>
            </TabsContent>
            
            {/* Career Pathway Tab */}
            <TabsContent value="career-pathway" className="mt-0">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                  <GitBranch className="h-5 w-5 mr-2 text-primary" />
                  Career Pathway
                </h3>
                
                {careerPathway.introduction && (
                  <div>
                    <p className="text-sm mb-4 whitespace-pre-wrap">{careerPathway.introduction}</p>
                  </div>
                )}
                
                {/* Pathway Steps */}
                {careerPathway.steps && careerPathway.steps.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Pathway Steps</h4>
                    <ol className="space-y-4 ml-5 list-decimal">
                      {careerPathway.steps.map((step: any, idx: number) => (
                        <li key={idx} className="pl-2">
                          <div className="font-medium">{step.title}</div>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          {step.timeframe && (
                            <div className="flex items-center mt-1 text-sm">
                              <span className="text-muted-foreground">Timeframe:</span>
                              <span className="ml-2">{step.timeframe}</span>
                            </div>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
                
                {/* Educational Options */}
                {(careerPathway.educationalOptions || careerPathway.education) && (
                  <div>
                    <h4 className="font-medium mb-3">Educational Options</h4>
                    <div className="space-y-3">
                      {careerPathway.educationalOptions && careerPathway.educationalOptions.map((option: any, idx: number) => (
                        <div key={idx} className="bg-muted/30 p-3 rounded-md">
                          <h5 className="font-medium">{option.name}</h5>
                          <p className="text-sm">{option.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {option.institutions && option.institutions.map((inst: any, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">{inst}</Badge>
                            ))}
                          </div>
                          {option.outcomes && (
                            <div className="mt-2">
                              <span className="text-sm text-muted-foreground">Outcomes:</span>
                              <ul className="list-disc list-inside text-sm">
                                {option.outcomes.map((outcome: any, i: number) => (
                                  <li key={i}>{outcome}</li>
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
            </TabsContent>
            
            {/* Development Plan Tab */}
            <TabsContent value="development-plan" className="mt-0">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Development Plan
                </h3>
                
                {developmentPlan.overview && (
                  <div>
                    <p className="text-sm mb-4 whitespace-pre-wrap">{developmentPlan.overview}</p>
                  </div>
                )}
                
                {/* Key Skills to Develop */}
                {developmentPlan.keySkills && developmentPlan.keySkills.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Key Skills to Develop</h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Skill</TableHead>
                            <TableHead>Importance</TableHead>
                            <TableHead>Development Strategy</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {developmentPlan.keySkills.map((skill: any, idx: number) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{skill.skill}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  skill.importance?.toLowerCase() === "high" ? "destructive" : 
                                  skill.importance?.toLowerCase() === "medium" ? "default" : 
                                  "secondary"
                                }>
                                  {skill.importance || "Medium"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{skill.developmentStrategy}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
                
                {/* Recommended Resources */}
                {developmentPlan.recommendedResources && developmentPlan.recommendedResources.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Recommended Resources</h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Resource</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {developmentPlan.recommendedResources.map((resource: any, idx: number) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{resource.name}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {resource.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{resource.description}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Similar Roles Tab */}
            <TabsContent value="similar-roles" className="mt-0">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                  <Search className="h-5 w-5 mr-2 text-primary" />
                  Similar Roles
                </h3>
                
                {similarRoles.introduction && (
                  <div>
                    <p className="text-sm mb-4 whitespace-pre-wrap">{similarRoles.introduction}</p>
                  </div>
                )}
                
                {/* Similar Roles List */}
                {similarRoles.roles && similarRoles.roles.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {similarRoles.roles.map((role: any, idx: number) => (
                      <div key={idx} className="bg-muted/30 p-4 rounded-lg">
                        <h4 className="font-medium">{role.title}</h4>
                        <p className="text-sm mt-1">{role.description}</p>
                        
                        {role.skillOverlap && (
                          <div className="mt-3">
                            <span className="text-sm font-medium">Skill Overlap:</span>
                            <ul className="list-disc list-inside text-sm mt-1">
                              {role.skillOverlap.map((skill: any, i: number) => (
                                <li key={i}>{skill}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {role.additionalSkills && (
                          <div className="mt-3">
                            <span className="text-sm font-medium">Additional Skills Required:</span>
                            <ul className="list-disc list-inside text-sm mt-1">
                              {role.additionalSkills.map((skill: any, i: number) => (
                                <li key={i}>{skill}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Social Skills Tab */}
            <TabsContent value="social-skills" className="mt-0">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center mb-4">
                  <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                  Social Skills & Communication
                </h3>
                
                {socialSkills.overview && (
                  <div>
                    <p className="text-sm mb-4 whitespace-pre-wrap">{socialSkills.overview}</p>
                  </div>
                )}
                
                {/* Key Social Skills */}
                {socialSkills.keySocialSkills && socialSkills.keySocialSkills.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Key Social Skills</h4>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Skill</TableHead>
                            <TableHead>Importance</TableHead>
                            <TableHead>Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {socialSkills.keySocialSkills.map((skill: any, idx: number) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{skill.skill}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  skill.importance?.toLowerCase() === "high" ? "destructive" : 
                                  skill.importance?.toLowerCase() === "medium" ? "default" : 
                                  "secondary"
                                }>
                                  {skill.importance || "Medium"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{skill.description}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
                
                {/* Communication Tips */}
                {socialSkills.communicationTips && socialSkills.communicationTips.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Communication Tips</h4>
                    <ul className="space-y-3">
                      {socialSkills.communicationTips.map((tip: any, idx: number) => (
                        <li key={idx} className="flex gap-3">
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            {idx + 1}
                          </div>
                          <div>
                            <p className="text-sm">{tip}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}