import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { AuthenticatedLayout } from "@/components/layouts";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  ChevronLeft, 
  AlertTriangle, 
  Loader2, 
  GraduationCap, 
  Briefcase, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Star,
  Award,
  ArrowRight,
  BookOpen,
  Target
} from "lucide-react";
import { format } from "date-fns";

interface SkillItem {
  skill: string;
  level?: string;
  importance?: string;
  relevance?: string;
  description?: string;
}

interface CareerPathwayStep {
  step: number;
  role: string;
  timeframe: string;
  keySkillsNeeded: string[];
  description: string;
  requiredQualification?: string;
  alternativeQualification?: string;
  recommendedProjects?: Array<{
    name: string;
    description: string;
    skillsGained: string[];
  }>;
}

export default function CareerAnalysisPage() {
  const { id } = useParams();
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Fetch the specific career analysis
  const { data: analysis, isLoading, error } = useQuery({
    queryKey: [`/api/career-analyses/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/career-analyses/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch career analysis");
      }
      return response.json();
    }
  });
  
  const handleBackClick = () => {
    setLocation("/dashboard");
  };
  
  const handleDownloadPdf = () => {
    window.open(`/api/career-analyses/${id}/pdf`, '_blank');
  };
  
  if (isLoading) {
    return (
      <AuthenticatedLayout title="Career Analysis">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AuthenticatedLayout>
    );
  }
  
  if (error || !analysis) {
    return (
      <AuthenticatedLayout title="Career Analysis">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-center mb-4">
              <Button variant="ghost" onClick={handleBackClick} className="mr-2">
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            </div>
            <CardTitle className="text-xl font-semibold flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
              Error Loading Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              There was a problem loading the requested career analysis. It may have been deleted or you may not have permission to view it.
            </p>
            <Button className="mt-4" onClick={handleBackClick}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </AuthenticatedLayout>
    );
  }
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMMM d, yyyy");
    } catch (e) {
      return "Unknown date";
    }
  };
  
  const renderSkillList = (skills: SkillItem[], includeDescription = true) => {
    return (
      <div className="grid gap-3 mt-2">
        {skills.map((skill, index) => (
          <Card key={index} className="border border-muted">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{skill.skill}</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {skill.level && (
                      <Badge variant="outline" className="text-xs">
                        Level: {skill.level}
                      </Badge>
                    )}
                    {skill.importance && (
                      <Badge variant="outline" className="text-xs">
                        Importance: {skill.importance}
                      </Badge>
                    )}
                    {skill.relevance && (
                      <Badge variant="outline" className="text-xs">
                        Relevance: {skill.relevance}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              {includeDescription && skill.description && (
                <p className="text-sm text-muted-foreground mt-2">{skill.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  const renderPathwaySteps = (steps: CareerPathwayStep[]) => {
    return (
      <div className="mt-4 space-y-8 relative">
        {/* Timeline line */}
        <div className="absolute left-[22px] top-6 bottom-10 w-0.5 bg-border"></div>
        
        {steps.map((step, index) => (
          <div key={index} className="flex gap-4 relative">
            <div className="z-10 rounded-full w-11 h-11 flex items-center justify-center bg-primary text-primary-foreground shrink-0 mt-1">
              {step.step}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-medium">{step.role}</h4>
              <div className="flex items-center text-muted-foreground text-sm mt-1">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {step.timeframe}
              </div>
              <p className="mt-2 text-muted-foreground">{step.description}</p>
              
              {/* Key Skills */}
              {step.keySkillsNeeded && step.keySkillsNeeded.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium mb-1">Key Skills</h5>
                  <div className="flex flex-wrap gap-1">
                    {step.keySkillsNeeded.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Qualification Info */}
              {(step.requiredQualification || step.alternativeQualification) && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium mb-1">
                    {step.requiredQualification ? "Required Qualification" : "Alternative Qualification"}
                  </h5>
                  <p className="text-sm text-muted-foreground">
                    {step.requiredQualification || step.alternativeQualification}
                  </p>
                </div>
              )}
              
              {/* Recommended Projects */}
              {step.recommendedProjects && step.recommendedProjects.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-sm font-medium mb-1">Recommended Projects</h5>
                  <div className="space-y-2">
                    {step.recommendedProjects.map((project, i) => (
                      <div key={i} className="text-sm border border-border rounded-md p-2">
                        <p className="font-medium">{project.name}</p>
                        <p className="text-muted-foreground text-xs mt-1">{project.description}</p>
                        {project.skillsGained && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {project.skillsGained.map((skill, j) => (
                              <Badge key={j} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <AuthenticatedLayout title="Career Analysis">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <Button variant="ghost" onClick={handleBackClick} className="mr-2">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <div>
                  <CardTitle className="text-2xl">{analysis.desiredRole}</CardTitle>
                  <CardDescription>
                    Created on {formatDate(analysis.createdAt)}
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={handleDownloadPdf}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="outline">{analysis.professionalLevel} Level</Badge>
              {analysis.state && analysis.country && (
                <Badge variant="outline">
                  Location: {analysis.state}, {analysis.country}
                </Badge>
              )}
              <Badge variant={analysis.progress === 100 ? "default" : "secondary"}>
                Progress: {analysis.progress}%
              </Badge>
            </div>
          </CardHeader>
        </Card>
        
        {/* Detailed Content */}
        <Tabs defaultValue="summary" className="mb-12">
          <TabsList className="mb-6">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
            <TabsTrigger value="pathway">Career Pathway</TabsTrigger>
            <TabsTrigger value="development">Development Plan</TabsTrigger>
            <TabsTrigger value="similar">Similar Roles</TabsTrigger>
          </TabsList>
          
          {/* Executive Summary Tab */}
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
                <CardDescription>Overview of your career analysis</CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.result?.executiveSummary ? (
                  <div className="prose prose-slate max-w-none">
                    <p>{analysis.result.executiveSummary}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Executive summary not available.</p>
                )}
                
                {/* Review Notes */}
                {analysis.result?.reviewNotes && (
                  <div className="mt-8 space-y-6">
                    <h3 className="text-lg font-medium">Review Notes</h3>
                    
                    {analysis.result.reviewNotes.firstReview && (
                      <Card className="border border-muted p-4">
                        <h4 className="font-medium">First Review</h4>
                        <p className="text-muted-foreground mt-1">
                          {analysis.result.reviewNotes.firstReview}
                        </p>
                      </Card>
                    )}
                    
                    {analysis.result.reviewNotes.secondReview && (
                      <Card className="border border-muted p-4">
                        <h4 className="font-medium">Second Review</h4>
                        <p className="text-muted-foreground mt-1">
                          {analysis.result.reviewNotes.secondReview}
                        </p>
                      </Card>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Skills Analysis Tab */}
          <TabsContent value="skills">
            <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
              {/* Skill Mapping */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2 text-primary" />
                    Framework Skill Mapping
                  </CardTitle>
                  <CardDescription>
                    Your skills mapped to industry standard frameworks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysis.result?.skillMapping ? (
                    <Tabs defaultValue="sfia9">
                      <TabsList className="mb-4">
                        <TabsTrigger value="sfia9">SFIA 9</TabsTrigger>
                        <TabsTrigger value="digcomp22">DigComp 2.2</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="sfia9">
                        {analysis.result.skillMapping.sfia9 && analysis.result.skillMapping.sfia9.length > 0 ? (
                          <div className="space-y-3">
                            {analysis.result.skillMapping.sfia9.map((item: any, i: number) => (
                              <Card key={i} className="border border-muted">
                                <CardHeader className="p-3 pb-1">
                                  <CardTitle className="text-sm font-medium">{item.skill}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <Badge variant="outline" className="mb-2">Level: {item.level}</Badge>
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No SFIA skills mapped.</p>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="digcomp22">
                        {analysis.result.skillMapping.digcomp22 && analysis.result.skillMapping.digcomp22.length > 0 ? (
                          <div className="space-y-3">
                            {analysis.result.skillMapping.digcomp22.map((item: any, i: number) => (
                              <Card key={i} className="border border-muted">
                                <CardHeader className="p-3 pb-1">
                                  <CardTitle className="text-sm font-medium">{item.competency}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 pt-0">
                                  <Badge variant="outline" className="mb-2">Level: {item.level}</Badge>
                                  <p className="text-xs text-muted-foreground">{item.description}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No DigComp competencies mapped.</p>
                        )}
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <p className="text-muted-foreground">Skill mapping data not available.</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Skill Gap Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2 text-primary" />
                    Skill Gap Analysis
                  </CardTitle>
                  <CardDescription>
                    Key skills to develop for your career goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysis.result?.skillGapAnalysis ? (
                    <Tabs defaultValue="gaps">
                      <TabsList className="mb-4">
                        <TabsTrigger value="gaps">Gaps</TabsTrigger>
                        <TabsTrigger value="strengths">Strengths</TabsTrigger>
                        <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="gaps">
                        {analysis.result.skillGapAnalysis.gaps && analysis.result.skillGapAnalysis.gaps.length > 0 ? (
                          renderSkillList(analysis.result.skillGapAnalysis.gaps)
                        ) : (
                          <p className="text-muted-foreground">No skill gaps identified.</p>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="strengths">
                        {analysis.result.skillGapAnalysis.strengths && analysis.result.skillGapAnalysis.strengths.length > 0 ? (
                          renderSkillList(analysis.result.skillGapAnalysis.strengths)
                        ) : (
                          <p className="text-muted-foreground">No strengths identified.</p>
                        )}
                      </TabsContent>
                      
                      <TabsContent value="analysis">
                        {analysis.result.skillGapAnalysis.aiAnalysis ? (
                          <div className="prose prose-slate max-w-none">
                            <p>{analysis.result.skillGapAnalysis.aiAnalysis}</p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No AI analysis available.</p>
                        )}
                        
                        {/* Recommendations */}
                        {analysis.result.skillGapAnalysis.recommendations && analysis.result.skillGapAnalysis.recommendations.length > 0 && (
                          <div className="mt-6">
                            <h3 className="text-lg font-medium mb-3">Recommendations</h3>
                            <div className="space-y-3">
                              {analysis.result.skillGapAnalysis.recommendations.map((rec: any, i: number) => (
                                <Card key={i} className="border border-muted">
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                      <h4 className="font-medium">{rec.area}</h4>
                                      <Badge variant={
                                        rec.impactLevel === 'high' ? 'default' : 
                                        rec.impactLevel === 'medium' ? 'secondary' : 'outline'
                                      }>
                                        {rec.impactLevel} impact
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">{rec.suggestion}</p>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <p className="text-muted-foreground">Skill gap analysis not available.</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Career Pathway Tab */}
          <TabsContent value="pathway">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ArrowRight className="h-5 w-5 mr-2 text-primary" />
                  Career Pathway Options
                </CardTitle>
                <CardDescription>
                  Detailed career progression pathways
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.result?.careerPathway ? (
                  <Tabs defaultValue="withDegree">
                    <TabsList className="mb-6">
                      <TabsTrigger value="withDegree">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        With Degree
                      </TabsTrigger>
                      <TabsTrigger value="withoutDegree">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Without Degree
                      </TabsTrigger>
                      <TabsTrigger value="aiRecommendations">
                        <Star className="h-4 w-4 mr-2" />
                        AI Recommendations
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="withDegree">
                      {analysis.result.careerPathway.withDegree && analysis.result.careerPathway.withDegree.length > 0 ? (
                        renderPathwaySteps(analysis.result.careerPathway.withDegree)
                      ) : (
                        <p className="text-muted-foreground">No degree pathway available.</p>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="withoutDegree">
                      {analysis.result.careerPathway.withoutDegree && analysis.result.careerPathway.withoutDegree.length > 0 ? (
                        renderPathwaySteps(analysis.result.careerPathway.withoutDegree)
                      ) : (
                        <p className="text-muted-foreground">No alternative pathway available.</p>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="aiRecommendations">
                      {analysis.result.careerPathway.aiRecommendations ? (
                        <div className="prose prose-slate max-w-none">
                          <p>{analysis.result.careerPathway.aiRecommendations}</p>
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No AI recommendations available.</p>
                      )}
                    </TabsContent>
                  </Tabs>
                ) : (
                  <p className="text-muted-foreground">Career pathway data not available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Development Plan Tab */}
          <TabsContent value="development">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Development Plan
                </CardTitle>
                <CardDescription>
                  Personalized learning and development roadmap
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.result?.developmentPlan ? (
                  <Tabs defaultValue="skills">
                    <TabsList className="mb-6">
                      <TabsTrigger value="skills">Skills to Acquire</TabsTrigger>
                      <TabsTrigger value="certifications">Certifications</TabsTrigger>
                      <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
                      <TabsTrigger value="courses">Courses</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="skills">
                      {analysis.result.developmentPlan.skillsToAcquire && analysis.result.developmentPlan.skillsToAcquire.length > 0 ? (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {analysis.result.developmentPlan.skillsToAcquire.map((skill: any, i: number) => (
                            <Card key={i} className="border border-muted">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-medium">{skill.skill}</h4>
                                  <Badge variant={
                                    skill.priority === 'high' ? 'default' : 
                                    skill.priority === 'medium' ? 'secondary' : 'outline'
                                  }>
                                    {skill.priority} priority
                                  </Badge>
                                </div>
                                
                                {skill.resources && skill.resources.length > 0 && (
                                  <div className="mt-3">
                                    <h5 className="text-sm font-medium mb-1">Recommended Resources</h5>
                                    <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-1">
                                      {skill.resources.map((resource: string, j: number) => (
                                        <li key={j}>{resource}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No skills to acquire listed.</p>
                      )}
                      
                      {/* Learning Path */}
                      {analysis.result.developmentPlan.learningPath && (
                        <div className="mt-8">
                          <h3 className="text-lg font-medium mb-3">Learning Path</h3>
                          <div className="prose prose-slate max-w-none">
                            <p>{analysis.result.developmentPlan.learningPath}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Suggested Projects */}
                      {analysis.result.developmentPlan.suggestedProjects && analysis.result.developmentPlan.suggestedProjects.length > 0 && (
                        <div className="mt-8">
                          <h3 className="text-lg font-medium mb-3">Suggested Projects</h3>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {analysis.result.developmentPlan.suggestedProjects.map((project: string, i: number) => (
                              <Card key={i} className="border border-muted">
                                <CardContent className="p-3 text-sm">
                                  {project}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="certifications">
                      {analysis.result.developmentPlan.recommendedCertifications ? (
                        <Tabs defaultValue="university">
                          <TabsList className="mb-4">
                            <TabsTrigger value="university">University</TabsTrigger>
                            <TabsTrigger value="vocational">Vocational</TabsTrigger>
                            <TabsTrigger value="online">Online</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="university">
                            {analysis.result.developmentPlan.recommendedCertifications.university && 
                             analysis.result.developmentPlan.recommendedCertifications.university.length > 0 ? (
                              <div className="grid gap-2">
                                {analysis.result.developmentPlan.recommendedCertifications.university.map((cert: string, i: number) => (
                                  <Card key={i} className="border border-muted">
                                    <CardContent className="p-3 text-sm">
                                      {cert}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No university certifications recommended.</p>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="vocational">
                            {analysis.result.developmentPlan.recommendedCertifications.vocational && 
                             analysis.result.developmentPlan.recommendedCertifications.vocational.length > 0 ? (
                              <div className="grid gap-2">
                                {analysis.result.developmentPlan.recommendedCertifications.vocational.map((cert: string, i: number) => (
                                  <Card key={i} className="border border-muted">
                                    <CardContent className="p-3 text-sm">
                                      {cert}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No vocational certifications recommended.</p>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="online">
                            {analysis.result.developmentPlan.recommendedCertifications.online && 
                             analysis.result.developmentPlan.recommendedCertifications.online.length > 0 ? (
                              <div className="grid gap-2">
                                {analysis.result.developmentPlan.recommendedCertifications.online.map((cert: string, i: number) => (
                                  <Card key={i} className="border border-muted">
                                    <CardContent className="p-3 text-sm">
                                      {cert}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No online certifications recommended.</p>
                            )}
                          </TabsContent>
                        </Tabs>
                      ) : (
                        <p className="text-muted-foreground">No certification recommendations available.</p>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="roadmap">
                      {analysis.result.developmentPlan.roadmapStages && analysis.result.developmentPlan.roadmapStages.length > 0 ? (
                        <div className="mt-2 space-y-8 relative">
                          {/* Timeline line */}
                          <div className="absolute left-[22px] top-6 bottom-10 w-0.5 bg-border"></div>
                          
                          {analysis.result.developmentPlan.roadmapStages.map((stage: any, index: number) => (
                            <div key={index} className="flex gap-4 relative">
                              <div className="z-10 rounded-full w-11 h-11 flex items-center justify-center bg-primary text-primary-foreground shrink-0 mt-1">
                                {stage.stage}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-medium">{stage.title}</h4>
                                <div className="flex items-center text-muted-foreground text-sm mt-1">
                                  <Calendar className="h-3.5 w-3.5 mr-1" />
                                  {stage.timeframe}
                                </div>
                                <p className="mt-2 text-muted-foreground">{stage.description}</p>
                                
                                {/* Focus Areas */}
                                {stage.focusAreas && stage.focusAreas.length > 0 && (
                                  <div className="mt-3">
                                    <h5 className="text-sm font-medium mb-1">Focus Areas</h5>
                                    <div className="flex flex-wrap gap-1">
                                      {stage.focusAreas.map((area: string, i: number) => (
                                        <Badge key={i} variant="secondary" className="text-xs">
                                          {area}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Milestones */}
                                {stage.milestones && stage.milestones.length > 0 && (
                                  <div className="mt-3">
                                    <h5 className="text-sm font-medium mb-1">Milestones</h5>
                                    <ul className="text-sm text-muted-foreground list-disc ml-5 space-y-1">
                                      {stage.milestones.map((milestone: string, i: number) => (
                                        <li key={i}>{milestone}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No roadmap stages available.</p>
                      )}
                      
                      {/* Micro-Learning Tips */}
                      {analysis.result.developmentPlan.microLearningTips && analysis.result.developmentPlan.microLearningTips.length > 0 && (
                        <div className="mt-10">
                          <h3 className="text-lg font-medium mb-3">Micro-Learning Tips</h3>
                          <div className="grid gap-3 sm:grid-cols-2">
                            {analysis.result.developmentPlan.microLearningTips.map((tip: any, i: number) => (
                              <Card key={i} className="border border-muted">
                                <CardContent className="p-4">
                                  <div className="flex justify-between">
                                    <h4 className="font-medium text-sm">{tip.skillArea}</h4>
                                    <Badge variant={
                                      tip.impactLevel === "high" ? "default" : 
                                      tip.impactLevel === "medium" ? "secondary" : "outline"
                                    } className="text-xs">
                                      {tip.impactLevel} impact
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-2">{tip.tip}</p>
                                  <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                                    <span>{tip.estimatedTimeMinutes} minutes</span>
                                    {tip.source && <span>Source: {tip.source}</span>}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Personal Growth Insights */}
                      {analysis.result.developmentPlan.personalizedGrowthInsights && (
                        <div className="mt-10">
                          <h3 className="text-lg font-medium mb-3">Personalized Growth Insights</h3>
                          <Card className="border border-muted">
                            <CardContent className="p-4">
                              <p className="text-muted-foreground">
                                {analysis.result.developmentPlan.personalizedGrowthInsights}
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="courses">
                      {analysis.result.developmentPlan.platformSpecificCourses ? (
                        <Tabs defaultValue="linkedin">
                          <TabsList className="mb-4">
                            <TabsTrigger value="linkedin">LinkedIn Learning</TabsTrigger>
                            <TabsTrigger value="coursera">Coursera</TabsTrigger>
                            <TabsTrigger value="udemy">Udemy</TabsTrigger>
                            <TabsTrigger value="microsoft">Microsoft</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="linkedin">
                            {analysis.result.developmentPlan.platformSpecificCourses.linkedinLearning && 
                             analysis.result.developmentPlan.platformSpecificCourses.linkedinLearning.length > 0 ? (
                              <div className="grid gap-3">
                                {analysis.result.developmentPlan.platformSpecificCourses.linkedinLearning.map((course: any, i: number) => (
                                  <Card key={i} className="border border-muted">
                                    <CardContent className="p-4">
                                      <h4 className="font-medium mb-1">{course.title}</h4>
                                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                        <span className="flex items-center">
                                          Author: {course.author}
                                        </span>
                                        <span className="flex items-center">
                                          Level: {course.level}
                                        </span>
                                        <span className="flex items-center">
                                          Duration: {course.duration}
                                        </span>
                                      </div>
                                      {course.url && (
                                        <Button variant="outline" size="sm" className="mt-3" onClick={() => window.open(course.url, '_blank')}>
                                          View Course
                                        </Button>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No LinkedIn Learning courses recommended.</p>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="coursera">
                            {analysis.result.developmentPlan.platformSpecificCourses.coursera && 
                             analysis.result.developmentPlan.platformSpecificCourses.coursera.length > 0 ? (
                              <div className="grid gap-3">
                                {analysis.result.developmentPlan.platformSpecificCourses.coursera.map((course: any, i: number) => (
                                  <Card key={i} className="border border-muted">
                                    <CardContent className="p-4">
                                      <h4 className="font-medium mb-1">{course.title}</h4>
                                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                        <span className="flex items-center">
                                          Partner: {course.partner}
                                        </span>
                                        <span className="flex items-center">
                                          Certification: {course.certificationType}
                                        </span>
                                        <span className="flex items-center">
                                          Duration: {course.duration}
                                        </span>
                                      </div>
                                      {course.url && (
                                        <Button variant="outline" size="sm" className="mt-3" onClick={() => window.open(course.url, '_blank')}>
                                          View Course
                                        </Button>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No Coursera courses recommended.</p>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="udemy">
                            {analysis.result.developmentPlan.platformSpecificCourses.udemy && 
                             analysis.result.developmentPlan.platformSpecificCourses.udemy.length > 0 ? (
                              <div className="grid gap-3">
                                {analysis.result.developmentPlan.platformSpecificCourses.udemy.map((course: any, i: number) => (
                                  <Card key={i} className="border border-muted">
                                    <CardContent className="p-4">
                                      <h4 className="font-medium mb-1">{course.title}</h4>
                                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                        <span className="flex items-center">
                                          Instructor: {course.instructorName}
                                        </span>
                                        <span className="flex items-center">
                                          Rating: {course.rating}
                                        </span>
                                        <span className="flex items-center">
                                          Students: {course.studentsCount}
                                        </span>
                                      </div>
                                      {course.url && (
                                        <Button variant="outline" size="sm" className="mt-3" onClick={() => window.open(course.url, '_blank')}>
                                          View Course
                                        </Button>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No Udemy courses recommended.</p>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="microsoft">
                            {analysis.result.developmentPlan.platformSpecificCourses.microsoft && 
                             analysis.result.developmentPlan.platformSpecificCourses.microsoft.length > 0 ? (
                              <div className="grid gap-3">
                                {analysis.result.developmentPlan.platformSpecificCourses.microsoft.map((course: any, i: number) => (
                                  <Card key={i} className="border border-muted">
                                    <CardContent className="p-4">
                                      <h4 className="font-medium mb-1">{course.title}</h4>
                                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                        <span className="flex items-center">
                                          Level: {course.level}
                                        </span>
                                        <span className="flex items-center">
                                          Duration: {course.duration}
                                        </span>
                                      </div>
                                      {course.url && (
                                        <Button variant="outline" size="sm" className="mt-3" onClick={() => window.open(course.url, '_blank')}>
                                          View Course
                                        </Button>
                                      )}
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground">No Microsoft courses recommended.</p>
                            )}
                          </TabsContent>
                        </Tabs>
                      ) : (
                        <p className="text-muted-foreground">No courses available.</p>
                      )}
                    </TabsContent>
                  </Tabs>
                ) : (
                  <p className="text-muted-foreground">Development plan not available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Similar Roles Tab */}
          <TabsContent value="similar">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-primary" />
                  Similar Roles
                </CardTitle>
                <CardDescription>
                  Discover related career opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysis.result?.similarRoles && analysis.result.similarRoles.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {analysis.result.similarRoles.map((role: any, i: number) => (
                      <Card key={i} className="border border-muted">
                        <CardContent className="p-5">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-medium text-lg">{role.role}</h4>
                            <Badge variant="outline" className="text-xs">
                              {role.similarityScore * 100}% Match
                            </Badge>
                          </div>
                          
                          {/* Key Skills Overlap */}
                          {role.keySkillsOverlap && role.keySkillsOverlap.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-sm font-medium mb-1">Overlapping Skills</h5>
                              <div className="flex flex-wrap gap-1">
                                {role.keySkillsOverlap.map((skill: string, j: number) => (
                                  <Badge key={j} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Unique Requirements */}
                          {role.uniqueRequirements && role.uniqueRequirements.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-sm font-medium mb-1">Additional Requirements</h5>
                              <div className="flex flex-wrap gap-1">
                                {role.uniqueRequirements.map((req: string, j: number) => (
                                  <Badge key={j} variant="outline" className="text-xs">
                                    {req}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Salary and Demand */}
                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            {role.potentialSalaryRange && (
                              <div>
                                <h5 className="font-medium text-xs mb-1">Salary Range</h5>
                                <p className="text-muted-foreground">{role.potentialSalaryRange}</p>
                              </div>
                            )}
                            
                            {role.locationSpecificDemand && (
                              <div>
                                <h5 className="font-medium text-xs mb-1">Local Demand</h5>
                                <p className="text-muted-foreground">{role.locationSpecificDemand}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No similar roles available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}