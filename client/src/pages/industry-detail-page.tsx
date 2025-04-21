import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  BarChart3, 
  Briefcase, 
  Building, 
  Cog, 
  Globe, 
  LineChart, 
  PieChart, 
  Search, 
  Star, 
  TrendingUp 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

interface Industry {
  id: number;
  name: string;
  category: string;
  description: string;
  marketSize?: string;
  trendDirection?: string;
  growthRate?: string;
  topCompanies?: string[];
  keyRegions?: string[];
  challenges?: string[];
  technologies?: string[];
  futureOutlook?: string;
}

interface IndustryRole {
  id: number;
  title: string;
  category: string;
  description: string;
  prevalence: string;
  salaryRange?: string;
  growthRate?: string;
}

interface IndustrySkill {
  id: number;
  name: string;
  category: string;
  description: string;
  importance: string;
  trendDirection: string;
}

interface IndustryProfile {
  id: number;
  name: string;
  category: string;
  description: string;
  marketSize?: string;
  trendDirection?: string;
  growthRate?: string;
  topCompanies?: string[];
  keyRegions?: string[];
  challenges?: string[];
  technologies?: string[];
  futureOutlook?: string;
  roles: IndustryRole[];
  skills: IndustrySkill[];
}

export default function IndustryDetailPage() {
  const [industryId, setIndustryId] = useState<number | null>(null);
  
  useEffect(() => {
    // Parse industry ID from URL
    const pathParts = window.location.pathname.split('/');
    const idFromPath = parseInt(pathParts[2]);
    if (!isNaN(idFromPath)) {
      setIndustryId(idFromPath);
    }
  }, []);

  const { data: industryProfile, isLoading, error } = useQuery<IndustryProfile>({
    queryKey: industryId ? ['/api/industries', industryId, 'profile'] : [],
    enabled: !!industryId,
  });

  const renderImportanceBadge = (importance: string) => {
    if (!importance) return null;
    
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    
    if (importance === "Critical" || importance === "High") {
      variant = "default";
    } else if (importance === "Medium") {
      variant = "secondary";
    }
    
    return <Badge variant={variant}>{importance}</Badge>;
  };

  const renderPrevalenceBadge = (prevalence: string) => {
    if (!prevalence) return null;
    
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    
    if (prevalence === "High" || prevalence === "Very High") {
      variant = "default";
    } else if (prevalence === "Medium") {
      variant = "secondary";
    } else if (prevalence === "Low") {
      variant = "destructive";
    }
    
    return <Badge variant={variant}>{prevalence}</Badge>;
  };

  const renderTrendBadge = (trend: string) => {
    if (!trend) return null;
    
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    
    if (trend === "Growing" || trend === "Increasing") {
      variant = "default";
    } else if (trend === "Stable") {
      variant = "secondary";
    } else if (trend === "Declining" || trend === "Decreasing") {
      variant = "destructive";
    }
    
    return <Badge variant={variant}>{trend}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="container mx-auto max-w-5xl">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-full max-w-3xl mb-12" />
            <div className="space-y-8">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gray-50 flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Industry</h1>
            <p className="text-gray-600 mb-6">We encountered an error while loading the industry information.</p>
            <Button asChild variant="outline">
              <Link href="/industries">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Industries
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!industryProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gray-50 flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Industry Not Found</h1>
            <p className="text-gray-600 mb-6">We couldn't find the industry you're looking for.</p>
            <Button asChild variant="outline">
              <Link href="/industries">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Industries
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="container mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Link href="/industries" className="hover:text-primary">Industries</Link>
                <span>/</span>
                <Link href={`/industries?category=${industryProfile.category}`} className="hover:text-primary">{industryProfile.category}</Link>
                <span>/</span>
                <span className="text-gray-900">{industryProfile.name}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{industryProfile.name}</h1>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href={`/career-pathway?industry=${industryProfile.id}`}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Career Pathway
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="#">
                  <Star className="mr-2 h-4 w-4" />
                  Save
                </Link>
              </Button>
            </div>
          </div>

          <p className="text-gray-700 mb-8">{industryProfile.description}</p>

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="w-full border-b justify-start space-x-4 rounded-none bg-transparent p-0">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-medium text-gray-600 hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="roles"
                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-medium text-gray-600 hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Key Roles
              </TabsTrigger>
              <TabsTrigger
                value="skills"
                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-medium text-gray-600 hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Required Skills
              </TabsTrigger>
              <TabsTrigger
                value="trends"
                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-medium text-gray-600 hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Market Trends
              </TabsTrigger>
            </TabsList>
          
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Market Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PieChart className="mr-2 h-5 w-5" />
                      Market Information
                    </CardTitle>
                    <CardDescription>
                      Key market indicators for the {industryProfile.name} industry
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {industryProfile.marketSize && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Market Size</span>
                          <span className="font-medium">{industryProfile.marketSize}</span>
                        </div>
                      )}

                      {industryProfile.growthRate && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Growth Rate</span>
                          <span className="font-medium">{industryProfile.growthRate}</span>
                        </div>
                      )}

                      {industryProfile.trendDirection && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Trend Direction</span>
                          {renderTrendBadge(industryProfile.trendDirection)}
                        </div>
                      )}
                    </div>
                    
                    {industryProfile.futureOutlook && (
                      <div className="pt-3 border-t">
                        <h4 className="text-sm font-medium mb-2">Future Outlook</h4>
                        <p className="text-muted-foreground text-sm">{industryProfile.futureOutlook}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Geographic Presence */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="mr-2 h-5 w-5" />
                      Geographic Presence
                    </CardTitle>
                    <CardDescription>
                      Key regions and market distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {industryProfile.keyRegions && industryProfile.keyRegions.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {industryProfile.keyRegions.map((region, index) => (
                            <Badge key={index} variant="outline" className="px-3 py-1 text-sm">
                              {region}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No specific regional information available for this industry.
                      </p>
                    )}
                    
                    {industryProfile.topCompanies && industryProfile.topCompanies.length > 0 && (
                      <div className="pt-4 mt-4 border-t">
                        <h4 className="text-sm font-medium mb-2">Top Companies</h4>
                        <ul className="space-y-1 list-disc pl-5">
                          {industryProfile.topCompanies.map((company, index) => (
                            <li key={index} className="text-sm">{company}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Challenges and Technologies */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Challenges */}
                {industryProfile.challenges && industryProfile.challenges.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Industry Challenges
                      </CardTitle>
                      <CardDescription>
                        Current challenges facing the {industryProfile.name} industry
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 list-disc pl-5">
                        {industryProfile.challenges.map((challenge, index) => (
                          <li key={index} className="text-gray-700">{challenge}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* Technologies */}
                {industryProfile.technologies && industryProfile.technologies.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Cog className="mr-2 h-5 w-5" />
                        Key Technologies
                      </CardTitle>
                      <CardDescription>
                        Technologies driving innovation in this industry
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {industryProfile.technologies.map((tech, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          
            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-6">
              {industryProfile.roles && industryProfile.roles.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="mr-2 h-5 w-5" />
                      Key Roles in {industryProfile.name}
                    </CardTitle>
                    <CardDescription>
                      Most common and in-demand roles in this industry
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {industryProfile.roles.map((role) => (
                        <div key={role.id} className="border rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link href={`/roles/${role.id}`}>
                                  <h3 className="text-lg font-semibold hover:text-primary hover:underline">{role.title}</h3>
                                </Link>
                                <Badge variant="outline">{role.category}</Badge>
                                {renderPrevalenceBadge(role.prevalence)}
                              </div>
                            </div>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/roles/${role.id}`}>
                                <Briefcase className="mr-2 h-3 w-3" />
                                Role Details
                              </Link>
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{role.description}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                            {role.salaryRange && (
                              <div className="bg-gray-50 rounded p-2">
                                <div className="flex items-center text-sm">
                                  <LineChart className="h-4 w-4 mr-1 text-blue-600" />
                                  <span className="font-medium">Salary Range:</span>
                                  <span className="ml-1">{role.salaryRange}</span>
                                </div>
                              </div>
                            )}
                            {role.growthRate && (
                              <div className="bg-gray-50 rounded p-2">
                                <div className="flex items-center text-sm">
                                  <TrendingUp className="h-4 w-4 mr-1 text-blue-600" />
                                  <span className="font-medium">Growth Rate:</span>
                                  <span className="ml-1">{role.growthRate}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="default" size="sm">
                      <Link href="/roles">
                        <Search className="mr-2 h-4 w-4" />
                        Explore All Roles
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Roles Found</CardTitle>
                    <CardDescription>
                      We couldn't find any specific roles for this industry in our database.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      While specific roles aren't listed, the {industryProfile.name} industry likely has various 
                      career opportunities across different functions like management, operations, engineering, marketing, and more.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              {industryProfile.skills && industryProfile.skills.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Cog className="mr-2 h-5 w-5" />
                      In-Demand Skills
                    </CardTitle>
                    <CardDescription>
                      Critical skills for success in the {industryProfile.name} industry
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {industryProfile.skills.map((skill) => (
                        <div key={skill.id} className="border rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link href={`/skills/${skill.id}`}>
                                  <h3 className="text-lg font-semibold hover:text-primary hover:underline">{skill.name}</h3>
                                </Link>
                                <Badge variant="outline">{skill.category}</Badge>
                                {renderImportanceBadge(skill.importance)}
                                {renderTrendBadge(skill.trendDirection)}
                              </div>
                            </div>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/skills/${skill.id}/learning-path`}>
                                <TrendingUp className="mr-2 h-3 w-3" />
                                Learning Path
                              </Link>
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">{skill.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="default" size="sm">
                      <Link href="/skills">
                        <Search className="mr-2 h-4 w-4" />
                        Explore All Skills
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Skills Found</CardTitle>
                    <CardDescription>
                      We couldn't find any specific skills for this industry in our database.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      While specific skills aren't listed, success in the {industryProfile.name} industry typically requires 
                      a combination of technical and soft skills relevant to the specific roles within the industry.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Market Trends Tab */}
            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="mr-2 h-5 w-5" />
                    Market Trends & Outlook
                  </CardTitle>
                  <CardDescription>
                    Current state and future projections for the {industryProfile.name} industry
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2 flex items-center">
                        <PieChart className="mr-2 h-4 w-4 text-blue-600" />
                        Market Size
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {industryProfile.marketSize || "Data not available"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2 flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4 text-blue-600" />
                        Growth Rate
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {industryProfile.growthRate || "Data not available"}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2 flex items-center">
                        <LineChart className="mr-2 h-4 w-4 text-blue-600" />
                        Trend Direction
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {industryProfile.trendDirection || "Data not available"}
                      </p>
                    </div>
                  </div>

                  {industryProfile.futureOutlook && (
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-3">Future Outlook</h3>
                      <p className="text-muted-foreground">{industryProfile.futureOutlook}</p>
                    </div>
                  )}

                  {industryProfile.challenges && industryProfile.challenges.length > 0 && (
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-3">Key Challenges</h3>
                      <ul className="space-y-2 list-disc pl-5">
                        {industryProfile.challenges.map((challenge, index) => (
                          <li key={index} className="text-gray-700">{challenge}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {industryProfile.technologies && industryProfile.technologies.length > 0 && (
                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-3">Disruptive Technologies</h3>
                      <div className="flex flex-wrap gap-2">
                        {industryProfile.technologies.map((tech, index) => (
                          <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    Industry trends and projections based on current market research and analysis.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}