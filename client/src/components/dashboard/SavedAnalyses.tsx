import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, ChevronDown, ChevronUp, BarChart3, Download, Clock, RefreshCw, 
  History, CheckCircle, Eye, EyeOff, ScrollText, Gauge, Bug
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

// Define an interface for section debug state
interface SectionDebugState {
  [key: string]: boolean;
}

export function SavedAnalyses() {
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(false);
  const [sectionDebug, setSectionDebug] = useState<SectionDebugState>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Initialize from localStorage on component mount
  useEffect(() => {
    const savedExpandedAnalysis = localStorage.getItem('expandedAnalysis');
    if (savedExpandedAnalysis) {
      setExpandedAnalysis(savedExpandedAnalysis);
    }
    
    const savedDebugPanel = localStorage.getItem('showDebugPanel');
    if (savedDebugPanel) {
      setShowDebugPanel(savedDebugPanel === 'true');
    }
    
    const savedSectionDebug = localStorage.getItem('sectionDebug');
    if (savedSectionDebug) {
      try {
        setSectionDebug(JSON.parse(savedSectionDebug));
      } catch (e) {
        console.error("Failed to parse section debug state from localStorage", e);
      }
    }
  }, []);
  
  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (expandedAnalysis) {
      localStorage.setItem('expandedAnalysis', expandedAnalysis);
    } else {
      localStorage.removeItem('expandedAnalysis');
    }
  }, [expandedAnalysis]);
  
  useEffect(() => {
    localStorage.setItem('showDebugPanel', showDebugPanel.toString());
  }, [showDebugPanel]);
  
  useEffect(() => {
    localStorage.setItem('sectionDebug', JSON.stringify(sectionDebug));
  }, [sectionDebug]);
  
  // Function to toggle debug state for specific section has been merged with the general toggleSectionDebug function

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
  
  // Helper function to toggle a section's debug state
  const toggleSectionDebug = (sectionKey: string) => {
    const newState = { 
      ...sectionDebug, 
      [sectionKey]: !sectionDebug[sectionKey] 
    };
    setSectionDebug(newState);
    localStorage.setItem('sectionDebug', JSON.stringify(newState));
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
                          For <span className="font-medium">{latestAnalysis.desiredRole}</span>
                          {latestAnalysis.professionalLevel && (
                            <> - {latestAnalysis.professionalLevel} level</>
                          )}
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
                        
                        {/* Section-specific debug toggles */}
                        {showDebugPanel && (
                          <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                            <span className="text-xs font-medium text-muted-foreground">Debug Sections:</span>
                            
                            <Button 
                              size="sm" 
                              variant={sectionDebug['executiveSummary'] ? "default" : "outline"}
                              className="text-xs h-7 px-2 py-0" 
                              onClick={() => toggleSectionDebug('executiveSummary')}
                            >
                              Executive Summary
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant={sectionDebug['skillMapping'] ? "default" : "outline"}
                              className="text-xs h-7 px-2 py-0" 
                              onClick={() => toggleSectionDebug('skillMapping')}
                            >
                              Skill Mapping
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant={sectionDebug['gapAnalysis'] ? "default" : "outline"}
                              className="text-xs h-7 px-2 py-0" 
                              onClick={() => toggleSectionDebug('gapAnalysis')}
                            >
                              Gap Analysis
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant={sectionDebug['pathwayOptions'] ? "default" : "outline"}
                              className="text-xs h-7 px-2 py-0" 
                              onClick={() => toggleSectionDebug('pathwayOptions')}
                            >
                              Pathway Options
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant={sectionDebug['similarRoles'] ? "default" : "outline"}
                              className="text-xs h-7 px-2 py-0" 
                              onClick={() => toggleSectionDebug('similarRoles')}
                            >
                              Similar Roles
                            </Button>
                          </div>
                        )}
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
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs px-2 h-7 text-muted-foreground hover:text-foreground"
                        onClick={() => toggleSectionDebug('executiveSummary')}
                      >
                        <Bug className="h-3.5 w-3.5 mr-1" />
                        {sectionDebug['executiveSummary'] ? 'Hide Debug' : 'Debug'}
                      </Button>
                    </div>
                    
                    {latestAnalysis.result.executiveSummary ? (
                      <div className="bg-card border rounded-lg p-6 shadow-sm">
                        <div className="space-y-6">
                          <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {latestAnalysis.result.executiveSummary.overview || latestAnalysis.result.executiveSummary}
                          </p>
                          
                          {/* Key Points */}
                          {latestAnalysis.result.executiveSummary.keyPoints && 
                           latestAnalysis.result.executiveSummary.keyPoints.length > 0 && (
                            <div className="mt-4">
                              <h3 className="text-base font-semibold mb-3">Key Points</h3>
                              <ul className="space-y-2">
                                {latestAnalysis.result.executiveSummary.keyPoints.map((point: string, idx: number) => (
                                  <li key={idx} className="flex items-start">
                                    <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {/* Recommended Next Steps */}
                          {latestAnalysis.result.executiveSummary.recommendedNextSteps && 
                           latestAnalysis.result.executiveSummary.recommendedNextSteps.length > 0 && (
                            <div>
                              <h3 className="text-base font-semibold mb-3">Recommended Next Steps</h3>
                              <ol className="space-y-2 ml-5 list-decimal">
                                {latestAnalysis.result.executiveSummary.recommendedNextSteps.map((step: string, idx: number) => (
                                  <li key={idx} className="text-sm">
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5 lucide-gauge"><path d="m12 14 4-4"></path><path d="M3.34 19a10 10 0 1 1 17.32 0"></path></svg>
                        Skill Mapping
                      </h2>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs px-2 h-7 text-muted-foreground hover:text-foreground"
                        onClick={() => toggleSectionDebug('skillMapping')}
                      >
                        <Bug className="h-3.5 w-3.5 mr-1" />
                        {sectionDebug['skillMapping'] ? 'Hide Debug' : 'Debug'}
                      </Button>
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
                            {latestAnalysis.result.skillMapping.digcomp22.map((skill: any, index: number) => (
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
                  
                  {/* Section Debug Panels */}
                  {sectionDebug['similarRoles'] && (
                    <div className="mt-6 border rounded-lg p-4 bg-green-50/20 dark:bg-green-900/10">
                      <h3 className="text-sm font-medium mb-2 flex items-center text-primary">
                        <Bug className="h-4 w-4 mr-1.5" />
                        Similar Roles Debug
                      </h3>
                      <pre className="text-xs overflow-auto max-h-[200px] p-4 bg-muted/30 rounded-md">
                        {JSON.stringify(latestAnalysis.result.similarRoles, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {sectionDebug['executiveSummary'] && (
                    <div className="mt-6 border rounded-lg p-4 bg-yellow-50/20 dark:bg-yellow-900/10">
                      <h3 className="text-sm font-medium mb-2 flex items-center text-primary">
                        <Bug className="h-4 w-4 mr-1.5" />
                        Executive Summary Debug
                      </h3>
                      <pre className="text-xs overflow-auto max-h-[200px] p-4 bg-muted/30 rounded-md">
                        {JSON.stringify(latestAnalysis.result.executiveSummary, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {sectionDebug['skillMapping'] && (
                    <div className="mt-6 border rounded-lg p-4 bg-blue-50/20 dark:bg-blue-900/10">
                      <h3 className="text-sm font-medium mb-2 flex items-center text-primary">
                        <Bug className="h-4 w-4 mr-1.5" />
                        Skill Mapping Debug
                      </h3>
                      {/* Display top-level object keys to help debug */}
                      <div className="mb-2 px-3 py-2 bg-black/5 rounded text-xs">
                        <strong>Available sections:</strong> {Object.keys(latestAnalysis.result || {}).join(', ')}
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-semibold mb-1">SFIA 9 Framework</h4>
                          <pre className="text-xs overflow-auto max-h-[150px] p-3 bg-muted/30 rounded-md">
                            {JSON.stringify(latestAnalysis.result.skillMapping?.sfia9, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold mb-1">DigComp 2.2 Framework</h4>
                          <pre className="text-xs overflow-auto max-h-[150px] p-3 bg-muted/30 rounded-md">
                            {JSON.stringify(latestAnalysis.result.skillMapping?.digcomp22, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {sectionDebug['gapAnalysis'] && (
                    <div className="mt-6 border rounded-lg p-4 bg-purple-50/20 dark:bg-purple-900/10">
                      <h3 className="text-sm font-medium mb-2 flex items-center text-primary">
                        <Bug className="h-4 w-4 mr-1.5" />
                        Skill Gap Analysis Debug
                      </h3>
                      <pre className="text-xs overflow-auto max-h-[200px] p-4 bg-muted/30 rounded-md">
                        {JSON.stringify(latestAnalysis.result.gapAnalysis, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {sectionDebug['pathwayOptions'] && (
                    <div className="mt-6 border rounded-lg p-4 bg-amber-50/20 dark:bg-amber-900/10">
                      <h3 className="text-sm font-medium mb-2 flex items-center text-primary">
                        <Bug className="h-4 w-4 mr-1.5" />
                        Career Pathway Options Debug
                      </h3>
                      <pre className="text-xs overflow-auto max-h-[200px] p-4 bg-muted/30 rounded-md">
                        {JSON.stringify(latestAnalysis.result.pathwayOptions, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {/* Global Debug Panel */}
                  {showDebugPanel && (
                    <div className="mt-8 border rounded-lg p-4 bg-muted/10">
                      <h3 className="text-sm font-medium mb-2 flex items-center">
                        <Eye className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        Raw Analysis Data
                      </h3>
                      <pre className="text-xs overflow-auto max-h-[300px] p-4 bg-muted/30 rounded-md">
                        {JSON.stringify(latestAnalysis.result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No analyses available. Try refreshing the data.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}