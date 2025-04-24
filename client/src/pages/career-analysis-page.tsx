import React, { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { AuthenticatedLayout } from '@/components/layouts';
import { ProtectedRoute } from '@/lib/protected-route';
import { useAuth } from '@/hooks/use-auth';
import { Redirect } from 'wouter';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { SkeletonCard } from '@/components/ui/skeleton';
import { 
  BarChart3, 
  BookOpen, 
  Brain, 
  ChevronLeft, 
  Clock, 
  FileSpreadsheet, 
  GraduationCap, 
  Home,
  PersonStanding,
  ScrollText,
  Sparkles,
  Target,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { SkillRadarChart } from '@/components/career-pathway/SkillRadarChart';
import { ComparativeBarChart } from '@/components/career-pathway/ComparativeBarChart';
import { PdfDownloader } from '@/components/career-pathway/PdfDownloader';
import { AIRecommendationsPanel } from '@/components/career-pathway/AIRecommendationsPanel';
import { CareerPathwayStepsDisplay } from '@/components/career-pathway/CareerPathwayStepsDisplay';
import { LearningRecommendationsGrid } from '@/components/career-pathway/LearningRecommendationsGrid';
import { Link } from 'wouter';

export default function CareerAnalysisPage() {
  return (
    <ProtectedRoute
      path="/career-analysis/:id"
      component={CareerAnalysisContent}
    />
  );
}

function CareerAnalysisContent() {
  const { id } = useParams();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  
  // Fetch career analysis data
  const { 
    data: analysis, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: [`/api/career-analyses/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/career-analyses/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch career analysis');
      }
      return response.json();
    },
  });
  
  // Redirect if not authenticated
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  // Format date 
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Unknown date";
    }
  };
  
  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="container py-6">
          <div className="flex items-center mb-8">
            <Button variant="ghost" asChild className="gap-1">
              <Link href="/dashboard">
                <ChevronLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
            <Separator orientation="vertical" className="mx-2 h-6" />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="gap-1">
                <Link href="/">
                  <Home className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">Home</span>
                </Link>
              </Button>
              <span className="text-muted-foreground">/</span>
              <Button variant="ghost" size="sm" asChild className="gap-1">
                <Link href="/dashboard">
                  <BarChart3 className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">Dashboard</span>
                </Link>
              </Button>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm text-muted-foreground">Analysis</span>
            </div>
          </div>
          
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-muted rounded-md"></div>
            <div className="h-6 w-96 bg-muted rounded-md"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SkeletonCard className="col-span-2" />
              <SkeletonCard />
            </div>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="container py-6">
          <div className="flex justify-between items-center mb-8">
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <ChevronLeft className="h-4 w-4 mr-2" /> Back to Dashboard
              </Link>
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6 flex flex-col items-center justify-center h-64">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center mb-2">Failed to load career analysis</p>
              <p className="text-sm text-muted-foreground text-center mb-6">
                We couldn't retrieve the requested career analysis. It may have been deleted or you may not have permission to view it.
              </p>
              <Button asChild>
                <Link href="/career-pathway">Create New Analysis</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  const { result, professionalLevel, desiredRole, createdAt } = analysis;
  
  return (
    <AuthenticatedLayout>
      <div className="container py-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center mb-8">
          <Button variant="ghost" asChild className="gap-1">
            <Link href="/dashboard">
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
          <Separator orientation="vertical" className="mx-2 h-6" />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="gap-1">
              <Link href="/">
                <Home className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Home</span>
              </Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <Button variant="ghost" size="sm" asChild className="gap-1">
              <Link href="/dashboard">
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only">Dashboard</span>
              </Link>
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">Career Analysis</span>
          </div>
        </div>
        
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold mb-1">{desiredRole}</h1>
              <div className="flex items-center text-muted-foreground gap-4">
                <div className="flex items-center">
                  <PersonStanding className="h-4 w-4 mr-1.5" />
                  <span>{professionalLevel}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1.5" />
                  <span>{formatDate(createdAt)}</span>
                </div>
              </div>
            </div>
            <div>
              <PdfDownloader results={result} userName={user?.fullName || 'User'} />
            </div>
          </div>
        </div>
        
        {/* Page Navigation */}
        <Tabs value={activeSection} onValueChange={setActiveSection} className="mb-8">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="overview" className="flex gap-2 items-center">
              <ScrollText className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="skills" className="flex gap-2 items-center">
              <Target className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">Skills</span>
            </TabsTrigger>
            <TabsTrigger value="pathway" className="flex gap-2 items-center">
              <Sparkles className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">Pathway</span>
            </TabsTrigger>
            <TabsTrigger value="learning" className="flex gap-2 items-center">
              <BookOpen className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">Learning</span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex gap-2 items-center">
              <Brain className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">AI Insights</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Executive Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center">
                <ScrollText className="h-5 w-5 mr-2 text-primary" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-line">{result.executiveSummary}</p>
            </CardContent>
          </Card>
          
          {/* Visualization Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Skill Gap Visualization</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <SkillRadarChart results={result} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Skills Comparison</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ComparativeBarChart results={result} />
              </CardContent>
            </Card>
          </div>
          
          {/* AI Recommendations Panel */}
          <AIRecommendationsPanel results={result} />
          
          {/* Career Pathway Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                Career Pathway Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-muted-foreground mb-4">{result.careerPathway.aiRecommendations}</p>
                <Button asChild variant="outline" className="mb-2">
                  <a onClick={() => setActiveSection('pathway')}>
                    View Detailed Career Pathway
                  </a>
                </Button>
              </div>
              <div className="border rounded-md p-4 bg-muted/10">
                <h3 className="text-sm font-medium mb-2">First Steps on Your Path</h3>
                <div className="space-y-3">
                  {result.careerPathway.withDegree.slice(0, 2).map((step: any, index: number) => (
                    <div key={index} className="flex items-start">
                      <Badge variant="outline" className="mr-2 mt-0.5">
                        {index + 1}
                      </Badge>
                      <div>
                        <span className="font-medium">{step.role}</span>
                        <p className="text-xs text-muted-foreground">{step.timeframe} • {step.keySkillsNeeded.slice(0, 3).join(", ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          {/* Frameworks Mapping */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                Industry Framework Mapping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="sfia9">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <span>SFIA 9 Framework Skills</span>
                      <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {result.skillMapping.sfia9.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {result.skillMapping.sfia9.map((skill: any, index: number) => (
                        <Card key={index} className="border border-muted">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{skill.skill}</h4>
                              <Badge variant="outline">{skill.level}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{skill.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="digcomp22">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <span>DigComp 2.2 Framework Competencies</span>
                      <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">
                        {result.skillMapping.digcomp22.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {result.skillMapping.digcomp22.map((comp: any, index: number) => (
                        <Card key={index} className="border border-muted">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{comp.competency}</h4>
                              <Badge variant="outline">{comp.level}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{comp.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
          
          {/* Skill Gap Analysis */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center">
                <Target className="h-5 w-5 mr-2 text-primary" />
                Skill Gap Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">AI Skill Gap Analysis</h3>
                <p className="text-muted-foreground mb-4">{result.skillGapAnalysis.aiAnalysis}</p>
                
                <ComparativeBarChart results={result} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Skill Gaps */}
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Target className="h-4 w-4 mr-2 text-destructive" />
                    Skill Gaps to Address
                  </h3>
                  <div className="space-y-3">
                    {result.skillGapAnalysis.gaps.map((gap: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-destructive">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium">{gap.skill}</h4>
                            <Badge variant={
                              gap.importance.toLowerCase() === 'high' ? 'destructive' : 
                              gap.importance.toLowerCase() === 'medium' ? 'default' : 'outline'
                            }>
                              {gap.importance}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{gap.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                {/* Strengths */}
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-green-600" />
                    Current Strengths
                  </h3>
                  <div className="space-y-3">
                    {result.skillGapAnalysis.strengths.map((strength: any, index: number) => (
                      <Card key={index} className="border-l-4 border-l-green-600">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium">{strength.skill}</h4>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">
                                {strength.level}
                              </Badge>
                              <Badge variant="outline">
                                {strength.relevance}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{strength.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pathway Tab */}
        <TabsContent value="pathway" className="space-y-6">
          <CareerPathwayStepsDisplay results={result} />
        </TabsContent>
        
        {/* Learning Tab */}
        <TabsContent value="learning" className="space-y-6">
          <LearningRecommendationsGrid results={result} />
        </TabsContent>
        
        {/* AI Insights Tab */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center">
                <Brain className="h-5 w-5 mr-2 text-primary" />
                AI Career Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* AI Analysis of Skill Gaps */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Skill Gap Analysis</h3>
                  <div className="border rounded-md p-4 bg-muted/10">
                    <p className="whitespace-pre-line">{result.skillGapAnalysis.aiAnalysis}</p>
                  </div>
                </div>
                
                {/* AI Career Pathway Recommendations */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Career Pathway Recommendations</h3>
                  <div className="border rounded-md p-4 bg-muted/10">
                    <p className="whitespace-pre-line">{result.careerPathway.aiRecommendations}</p>
                  </div>
                </div>
                
                {/* Personalized Growth Insights */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Personalized Growth Insights</h3>
                  <div className="border rounded-md p-4 bg-muted/10">
                    <p className="whitespace-pre-line">{result.developmentPlan.personalizedGrowthInsights}</p>
                  </div>
                </div>
                
                {/* AI Recommendations Panel */}
                <AIRecommendationsPanel results={result} />
              </div>
            </CardContent>
          </Card>
          
          {/* Similar Roles Analysis */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-primary" />
                Similar Roles Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.similarRoles && result.similarRoles.map((role: any, index: number) => (
                  <Card key={index} className="border border-muted">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{role.role}</h4>
                        <Badge variant="outline">
                          {role.similarityScore > 0.8 ? 'High Match' : 
                           role.similarityScore > 0.6 ? 'Good Match' : 'Partial Match'}
                        </Badge>
                      </div>
                      
                      <div className="text-sm space-y-2">
                        <div>
                          <span className="font-medium">Salary Range: </span>
                          <span className="text-muted-foreground">{role.potentialSalaryRange}</span>
                        </div>
                        <div>
                          <span className="font-medium">Demand: </span>
                          <span className="text-muted-foreground">{role.locationSpecificDemand}</span>
                        </div>
                        
                        <div>
                          <span className="font-medium">Key Skills Overlap:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {role.keySkillsOverlap.map((skill: string, skillIndex: number) => (
                              <Badge key={skillIndex} variant="secondary" className="bg-green-100 text-green-800">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium">Unique Requirements:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {role.uniqueRequirements.map((req: string, reqIndex: number) => (
                              <Badge key={reqIndex} variant="outline">
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </AuthenticatedLayout>
  );
}