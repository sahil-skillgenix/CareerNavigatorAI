import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  Award, 
  BookOpen, 
  Briefcase, 
  Building, 
  Calendar, 
  ChartBar, 
  Clock, 
  Cog, 
  FileText, 
  GraduationCap, 
  LineChart, 
  Link as LinkIcon, 
  ListTodo, 
  MapPin, 
  Search, 
  Sparkles, 
  Star, 
  TrendingUp, 
  Users 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

interface Role {
  id: number;
  title: string;
  category: string;
  description: string;
  responsibilities?: string[];
  salaryRange?: string;
  requiredExperience?: string;
  educationRequirements?: string[];
  workModeDemand?: {
    remote: string;
    hybrid: string;
    onsite: string;
  };
  certifications?: string[];
  growthPotential?: string;
  relatedRoles?: string[];
}

interface RoleSkill {
  id: number;
  name: string;
  category: string;
  description: string;
  importance: string;
  levelRequired: string;
}

interface RoleIndustry {
  id: number;
  name: string;
  category: string;
  description: string;
  prevalence: string;
  growthRate?: string;
  marketDemand?: string;
}

interface RoleProfile {
  id: number;
  title: string;
  category: string;
  description: string;
  responsibilities?: string[];
  salaryRange?: string;
  requiredExperience?: string;
  educationRequirements?: string[];
  workModeDemand?: {
    remote: string;
    hybrid: string;
    onsite: string;
  };
  certifications?: string[];
  growthPotential?: string;
  relatedRoles?: string[];
  skills: RoleSkill[];
  industries: RoleIndustry[];
}

export default function RoleDetailPage() {
  const [roleId, setRoleId] = useState<number | null>(null);
  
  useEffect(() => {
    // Parse role ID from URL
    const pathParts = window.location.pathname.split('/');
    const idFromPath = parseInt(pathParts[2]);
    if (!isNaN(idFromPath)) {
      setRoleId(idFromPath);
    }
  }, []);

  const { data: roleProfile, isLoading, error } = useQuery<RoleProfile>({
    queryKey: roleId ? ['/api/roles', roleId, 'profile'] : [],
    enabled: !!roleId,
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

  const renderLevelBadge = (level: string) => {
    if (!level) return null;
    
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    
    if (level === "Expert" || level === "Advanced") {
      variant = "destructive";
    } else if (level === "Intermediate") {
      variant = "secondary";
    } else if (level === "Beginner") {
      variant = "default";
    }
    
    return <Badge variant={variant}>{level}</Badge>;
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Role</h1>
            <p className="text-gray-600 mb-6">We encountered an error while loading the role information.</p>
            <Button asChild variant="outline">
              <Link href="/roles">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Roles
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!roleProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gray-50 flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Role Not Found</h1>
            <p className="text-gray-600 mb-6">We couldn't find the role you're looking for.</p>
            <Button asChild variant="outline">
              <Link href="/roles">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Roles
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
                <Link href="/roles" className="hover:text-primary">Roles</Link>
                <span>/</span>
                <Link href={`/roles?category=${roleProfile.category}`} className="hover:text-primary">{roleProfile.category}</Link>
                <span>/</span>
                <span className="text-gray-900">{roleProfile.title}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{roleProfile.title}</h1>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href={`/career-pathway?role=${roleProfile.id}`}>
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

          <p className="text-gray-700 mb-8">{roleProfile.description}</p>

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="w-full border-b justify-start space-x-4 rounded-none bg-transparent p-0">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-medium text-gray-600 hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="skills"
                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-medium text-gray-600 hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Required Skills
              </TabsTrigger>
              <TabsTrigger
                value="industries"
                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-medium text-gray-600 hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Industries
              </TabsTrigger>
              <TabsTrigger
                value="requirements"
                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-medium text-gray-600 hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Requirements
              </TabsTrigger>
            </TabsList>
          
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Core Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="mr-2 h-5 w-5" />
                      Role Overview
                    </CardTitle>
                    <CardDescription>
                      Essential information about the {roleProfile.title} role
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Category</span>
                        <Badge variant="outline">{roleProfile.category}</Badge>
                      </div>

                      {roleProfile.requiredExperience && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Experience</span>
                          <span className="font-medium">{roleProfile.requiredExperience}</span>
                        </div>
                      )}

                      {roleProfile.salaryRange && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Salary Range</span>
                          <span className="font-medium">{roleProfile.salaryRange}</span>
                        </div>
                      )}

                      {roleProfile.growthPotential && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Growth Potential</span>
                          <span className="font-medium">{roleProfile.growthPotential}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Work Mode and Certifications */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5" />
                      Work Environment
                    </CardTitle>
                    <CardDescription>
                      Work mode preferences and qualifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {roleProfile.workModeDemand && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Work Mode Demand</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-blue-50 rounded-md p-3 text-center">
                            <p className="text-xs text-muted-foreground">Remote</p>
                            <p className="font-semibold">{roleProfile.workModeDemand.remote}</p>
                          </div>
                          <div className="bg-blue-50 rounded-md p-3 text-center">
                            <p className="text-xs text-muted-foreground">Hybrid</p>
                            <p className="font-semibold">{roleProfile.workModeDemand.hybrid}</p>
                          </div>
                          <div className="bg-blue-50 rounded-md p-3 text-center">
                            <p className="text-xs text-muted-foreground">Onsite</p>
                            <p className="font-semibold">{roleProfile.workModeDemand.onsite}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {roleProfile.certifications && roleProfile.certifications.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Recommended Certifications</p>
                        <div className="flex flex-wrap gap-2">
                          {roleProfile.certifications.map((cert, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center">
                              <Award className="h-3 w-3 mr-1" />
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Responsibilities Section */}
              {roleProfile.responsibilities && roleProfile.responsibilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ListTodo className="mr-2 h-5 w-5" />
                      Key Responsibilities
                    </CardTitle>
                    <CardDescription>
                      Primary duties and responsibilities for this role
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 list-disc pl-5">
                      {roleProfile.responsibilities.map((responsibility, index) => (
                        <li key={index} className="text-gray-700">{responsibility}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Related Roles Section */}
              {roleProfile.relatedRoles && roleProfile.relatedRoles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Related Roles
                    </CardTitle>
                    <CardDescription>
                      Other roles that share similarities with {roleProfile.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {roleProfile.relatedRoles.map((role, index) => (
                        <Badge key={index} variant="outline" className="px-3 py-1 text-sm">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/roles">
                        <Search className="mr-2 h-3 w-3" />
                        Explore All Roles
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </TabsContent>
          
            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              {roleProfile.skills && roleProfile.skills.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Cog className="mr-2 h-5 w-5" />
                      Required Skills
                    </CardTitle>
                    <CardDescription>
                      Key skills needed to excel as a {roleProfile.title}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {roleProfile.skills.map((skill) => (
                        <div key={skill.id} className="border rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link href={`/skills/${skill.id}`}>
                                  <h3 className="text-lg font-semibold hover:text-primary hover:underline">{skill.name}</h3>
                                </Link>
                                <Badge variant="outline">{skill.category}</Badge>
                                {renderImportanceBadge(skill.importance)}
                                {renderLevelBadge(skill.levelRequired)}
                              </div>
                            </div>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/skills/${skill.id}/learning-path`}>
                                <GraduationCap className="mr-2 h-3 w-3" />
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
                    <p className="text-sm text-muted-foreground">
                      Having these skills will significantly increase your effectiveness as a {roleProfile.title}.
                    </p>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Skills Found</CardTitle>
                    <CardDescription>
                      We couldn't find any specific required skills for this role in our database.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      While specific skills aren't listed, common professional skills like communication, 
                      problem-solving, and teamwork are generally valuable in this role.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Industries Tab */}
            <TabsContent value="industries" className="space-y-6">
              {roleProfile.industries && roleProfile.industries.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="mr-2 h-5 w-5" />
                      Top Industries
                    </CardTitle>
                    <CardDescription>
                      Industries where the {roleProfile.title} role is most prevalent
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {roleProfile.industries.map((industry) => (
                        <div key={industry.id} className="border rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link href={`/industries/${industry.id}`}>
                                  <h3 className="text-lg font-semibold hover:text-primary hover:underline">{industry.name}</h3>
                                </Link>
                                <Badge variant="outline">{industry.category}</Badge>
                                {renderPrevalenceBadge(industry.prevalence)}
                              </div>
                            </div>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/industries/${industry.id}`}>
                                <Building className="mr-2 h-3 w-3" />
                                Industry Details
                              </Link>
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">{industry.description}</p>

                          {industry.growthRate || industry.marketDemand ? (
                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                              {industry.growthRate && (
                                <div className="bg-gray-50 rounded p-2">
                                  <div className="flex items-center text-sm">
                                    <ChartBar className="h-4 w-4 mr-1 text-blue-600" />
                                    <span className="font-medium">Growth Rate:</span>
                                    <span className="ml-1">{industry.growthRate}</span>
                                  </div>
                                </div>
                              )}
                              {industry.marketDemand && (
                                <div className="bg-gray-50 rounded p-2">
                                  <div className="flex items-center text-sm">
                                    <TrendingUp className="h-4 w-4 mr-1 text-blue-600" />
                                    <span className="font-medium">Market Demand:</span>
                                    <span className="ml-1">{industry.marketDemand}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-muted-foreground">
                      {roleProfile.title} professionals are particularly in demand in these industries.
                    </p>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Industry Data</CardTitle>
                    <CardDescription>
                      We couldn't find any industry-specific data for this role.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      The {roleProfile.title} role may be applicable across various industries, but we don't have 
                      specific industry associations in our current database.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Requirements Tab */}
            <TabsContent value="requirements" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Experience Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Experience Requirements
                    </CardTitle>
                    <CardDescription>
                      Typical experience needed for this role
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {roleProfile.requiredExperience ? (
                      <div className="space-y-2">
                        <div className="bg-blue-50 rounded-md p-4">
                          <div className="flex items-center mb-3">
                            <Clock className="h-5 w-5 mr-2 text-blue-600" />
                            <p className="font-medium">Required Experience</p>
                          </div>
                          <p className="text-gray-700">{roleProfile.requiredExperience}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No specific experience requirements listed for this role.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Education Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <GraduationCap className="mr-2 h-5 w-5" />
                      Education & Qualifications
                    </CardTitle>
                    <CardDescription>
                      Educational background and qualifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {roleProfile.educationRequirements && roleProfile.educationRequirements.length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Educational Background</p>
                        <ul className="space-y-1 list-disc pl-5">
                          {roleProfile.educationRequirements.map((edu, index) => (
                            <li key={index} className="text-gray-700">{edu}</li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">
                        No specific educational requirements listed for this role.
                      </p>
                    )}

                    {roleProfile.certifications && roleProfile.certifications.length > 0 && (
                      <div className="space-y-2 mt-4">
                        <p className="text-sm font-medium">Valuable Certifications</p>
                        <ul className="space-y-1 list-disc pl-5">
                          {roleProfile.certifications.map((cert, index) => (
                            <li key={index} className="text-gray-700">{cert}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Skills Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Skills Summary
                  </CardTitle>
                  <CardDescription>
                    Overview of key skills by importance and level required
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {roleProfile.skills && roleProfile.skills.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-2 font-medium text-gray-700">Skill</th>
                            <th className="text-left py-2 px-2 font-medium text-gray-700">Category</th>
                            <th className="text-left py-2 px-2 font-medium text-gray-700">Importance</th>
                            <th className="text-left py-2 px-2 font-medium text-gray-700">Level Required</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roleProfile.skills.map((skill) => (
                            <tr key={skill.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-2">
                                <Link href={`/skills/${skill.id}`} className="font-medium hover:text-primary hover:underline">
                                  {skill.name}
                                </Link>
                              </td>
                              <td className="py-3 px-2 text-gray-600">{skill.category}</td>
                              <td className="py-3 px-2">
                                {renderImportanceBadge(skill.importance)}
                              </td>
                              <td className="py-3 px-2">
                                {renderLevelBadge(skill.levelRequired)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No specific skills defined for this role in our database.
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button asChild variant="default" size="sm">
                    <Link href="/skills">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Explore Skills
                    </Link>
                  </Button>
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