import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { ArrowLeft, Book, Briefcase, Building, FileText, GraduationCap, LinkIcon, MapPin, SquareArrowUpRight, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

interface Skill {
  id: number;
  name: string;
  category: string;
  description: string;
  sfiaMapping?: string;
  digCompMapping?: string;
  levelingCriteria?: {
    Beginner: string;
    Intermediate: string;
    Advanced: string;
    Expert: string;
  };
  relatedSkills?: string[];
  learningResources?: {
    courses: string[];
    books: string[];
  };
  industryRelevance?: string[];
}

interface PrerequisiteSkill extends Skill {
  importance: string;
}

interface SkillRole {
  id: number;
  title: string;
  category: string;
  description: string;
  importance: string;
  levelRequired: string;
}

interface SkillIndustry {
  id: number;
  name: string;
  category: string;
  description: string;
  importance: string;
  trendDirection: string;
}

interface LearningResource {
  id: number;
  title: string;
  type: string;
  provider?: string;
  url?: string;
  description: string;
  difficulty: string;
  estimatedHours?: number;
  costType: string;
  cost?: string;
  tags?: string[];
  rating?: number;
}

interface SkillProfile {
  id: number;
  name: string;
  category: string;
  description: string;
  sfiaMapping?: string;
  digCompMapping?: string;
  levelingCriteria?: {
    Beginner: string;
    Intermediate: string;
    Advanced: string;
    Expert: string;
  };
  relatedSkills?: string[];
  industryRelevance?: string[];
  prerequisiteSkills: PrerequisiteSkill[];
  dependentSkills: PrerequisiteSkill[];
  roles: SkillRole[];
  industries: SkillIndustry[];
  learningResources: LearningResource[];
}

export default function SkillDetailPage() {
  const [skillId, setSkillId] = useState<number | null>(null);
  
  useEffect(() => {
    // Parse skill ID from URL
    const pathParts = window.location.pathname.split('/');
    const idFromPath = parseInt(pathParts[2]);
    if (!isNaN(idFromPath)) {
      setSkillId(idFromPath);
    }
  }, []);

  const { data: skillProfile, isLoading, error } = useQuery<SkillProfile>({
    queryKey: skillId ? ['/api/skills', skillId, 'profile'] : [],
    enabled: !!skillId,
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Skill</h1>
            <p className="text-gray-600 mb-6">We encountered an error while loading the skill information.</p>
            <Button asChild variant="outline">
              <Link href="/skills">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Skills
              </Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!skillProfile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gray-50 flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Skill Not Found</h1>
            <p className="text-gray-600 mb-6">We couldn't find the skill you're looking for.</p>
            <Button asChild variant="outline">
              <Link href="/skills">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Skills
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
                <Link href="/skills" className="hover:text-primary">Skills</Link>
                <span>/</span>
                <Link href={`/skills?category=${skillProfile.category}`} className="hover:text-primary">{skillProfile.category}</Link>
                <span>/</span>
                <span className="text-gray-900">{skillProfile.name}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{skillProfile.name}</h1>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href={`/skills/${skillProfile.id}/learning-path`}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Learning Path
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

          <p className="text-gray-700 mb-8">{skillProfile.description}</p>

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="w-full border-b justify-start space-x-4 rounded-none bg-transparent p-0">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-medium text-gray-600 hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="prerequisites"
                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-medium text-gray-600 hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Prerequisites
              </TabsTrigger>
              <TabsTrigger
                value="roles"
                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-medium text-gray-600 hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Roles
              </TabsTrigger>
              <TabsTrigger
                value="industries"
                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-medium text-gray-600 hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Industries
              </TabsTrigger>
              <TabsTrigger
                value="resources"
                className="rounded-none border-b-2 border-transparent bg-transparent px-4 py-2 font-medium text-gray-600 hover:text-primary data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none"
              >
                Learning Resources
              </TabsTrigger>
            </TabsList>
          
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {skillProfile.sfiaMapping || skillProfile.digCompMapping ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      Framework Mappings
                    </CardTitle>
                    <CardDescription>
                      How this skill maps to industry standard frameworks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {skillProfile.sfiaMapping && (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">SFIA Framework</h3>
                        <p className="text-sm text-muted-foreground">{skillProfile.sfiaMapping}</p>
                      </div>
                    )}
                    {skillProfile.digCompMapping && (
                      <div>
                        <h3 className="font-semibold text-lg mb-2">DigComp Framework</h3>
                        <p className="text-sm text-muted-foreground">{skillProfile.digCompMapping}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : null}

              {skillProfile.levelingCriteria && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      Skill Progression Levels
                    </CardTitle>
                    <CardDescription>
                      What to expect at different levels of mastery
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {Object.entries(skillProfile.levelingCriteria).map(([level, description]) => (
                        <div key={level} className="border-b pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{level}</h3>
                            {renderLevelBadge(level)}
                          </div>
                          <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {skillProfile.relatedSkills && skillProfile.relatedSkills.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      Related Skills
                    </CardTitle>
                    <CardDescription>
                      Other skills that complement or enhance {skillProfile.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {skillProfile.relatedSkills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          
            {/* Prerequisites Tab */}
            <TabsContent value="prerequisites" className="space-y-6">
              {skillProfile.prerequisiteSkills && skillProfile.prerequisiteSkills.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <GraduationCap className="mr-2 h-5 w-5" />
                      Prerequisite Skills
                    </CardTitle>
                    <CardDescription>
                      Skills you should learn before mastering {skillProfile.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {skillProfile.prerequisiteSkills.map((skill) => (
                        <div key={skill.id} className="border rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <Link href={`/skills/${skill.id}`}>
                                  <h3 className="text-lg font-semibold hover:text-primary hover:underline">{skill.name}</h3>
                                </Link>
                                <Badge variant="outline">{skill.category}</Badge>
                                {renderImportanceBadge(skill.importance)}
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
                      Learning these skills first will create a strong foundation for mastering {skillProfile.name}.
                    </p>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Prerequisites</CardTitle>
                    <CardDescription>
                      This skill doesn't have any specific prerequisites in our database.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {skillProfile.name} is a foundational skill that doesn't require prior knowledge of other specific skills. 
                      However, basic knowledge in the {skillProfile.category} category is always helpful.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Roles Tab */}
            <TabsContent value="roles" className="space-y-6">
              {skillProfile.roles && skillProfile.roles.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Briefcase className="mr-2 h-5 w-5" />
                      Roles Requiring This Skill
                    </CardTitle>
                    <CardDescription>
                      Professional roles where {skillProfile.name} is a valuable or essential skill
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {skillProfile.roles.map((role) => (
                        <div key={role.id} className="border rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link href={`/roles/${role.id}`}>
                                  <h3 className="text-lg font-semibold hover:text-primary hover:underline">{role.title}</h3>
                                </Link>
                                <Badge variant="outline">{role.category}</Badge>
                                {renderImportanceBadge(role.importance)}
                                {renderLevelBadge(role.levelRequired)}
                              </div>
                            </div>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/roles/${role.id}`}>
                                View Role Profile
                              </Link>
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Roles Found</CardTitle>
                    <CardDescription>
                      We couldn't find any specific roles requiring this skill in our database.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      While {skillProfile.name} might be valuable in various professional contexts, 
                      we don't have specific role associations in our current database.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Industries Tab */}
            <TabsContent value="industries" className="space-y-6">
              {skillProfile.industries && skillProfile.industries.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="mr-2 h-5 w-5" />
                      Industries Where This Skill Is Valued
                    </CardTitle>
                    <CardDescription>
                      Industries and sectors where {skillProfile.name} is particularly relevant
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {skillProfile.industries.map((industry) => (
                        <div key={industry.id} className="border rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link href={`/industries/${industry.id}`}>
                                  <h3 className="text-lg font-semibold hover:text-primary hover:underline">{industry.name}</h3>
                                </Link>
                                <Badge variant="outline">{industry.category}</Badge>
                                {renderImportanceBadge(industry.importance)}
                                <Badge variant={industry.trendDirection === 'Growing' ? 'default' : 
                                              industry.trendDirection === 'Stable' ? 'secondary' : 'outline'}>
                                  {industry.trendDirection}
                                </Badge>
                              </div>
                            </div>
                            <Button asChild variant="outline" size="sm">
                              <Link href={`/industries/${industry.id}`}>
                                View Industry Profile
                              </Link>
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">{industry.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Industry Data</CardTitle>
                    <CardDescription>
                      We couldn't find any industry-specific data for this skill.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {skillProfile.name} may be applicable across various industries, but we don't have 
                      specific industry associations in our current database.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Learning Resources Tab */}
            <TabsContent value="resources" className="space-y-6">
              {skillProfile.learningResources && skillProfile.learningResources.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Book className="mr-2 h-5 w-5" />
                      Learning Resources
                    </CardTitle>
                    <CardDescription>
                      Recommended resources to help you learn and master {skillProfile.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      {skillProfile.learningResources.map((resource) => (
                        <div key={resource.id} className="border rounded-lg p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-semibold">{resource.title}</h3>
                                <Badge>{resource.type}</Badge>
                                {renderLevelBadge(resource.difficulty)}
                                <Badge variant="outline">{resource.costType}</Badge>
                              </div>
                              {resource.provider && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Provider: {resource.provider}
                                </p>
                              )}
                            </div>
                            {resource.url && (
                              <Button asChild variant="outline" size="sm">
                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                  <LinkIcon className="mr-2 h-3 w-3" />
                                  Visit Resource
                                </a>
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm">
                            {resource.estimatedHours && (
                              <span className="flex items-center">
                                <FileText className="mr-1 h-4 w-4" />
                                {resource.estimatedHours} hours
                              </span>
                            )}
                            {resource.cost && (
                              <span className="flex items-center">
                                <MapPin className="mr-1 h-4 w-4" />
                                {resource.cost}
                              </span>
                            )}
                            {resource.rating && (
                              <span className="flex items-center">
                                <Star className="mr-1 h-4 w-4 text-yellow-500" />
                                {resource.rating}/5
                              </span>
                            )}
                          </div>
                          
                          {resource.tags && resource.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {resource.tags.map((tag, idx) => (
                                <Badge key={idx} variant="secondary">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <p className="text-sm text-muted-foreground">
                      These resources are curated to help you develop your skills in {skillProfile.name} 
                      at various levels of expertise.
                    </p>
                  </CardFooter>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>No Learning Resources</CardTitle>
                    <CardDescription>
                      We couldn't find any specific learning resources for this skill in our database.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      While we don't have specific learning resources for {skillProfile.name}, 
                      you can search for courses and materials on platforms like Coursera, Udemy, or LinkedIn Learning.
                    </p>
                    <div className="flex gap-2 mt-4">
                      <Button asChild variant="outline">
                        <a href="https://www.coursera.org/" target="_blank" rel="noopener noreferrer">
                          <SquareArrowUpRight className="mr-2 h-4 w-4" />
                          Coursera
                        </a>
                      </Button>
                      <Button asChild variant="outline">
                        <a href="https://www.udemy.com/" target="_blank" rel="noopener noreferrer">
                          <SquareArrowUpRight className="mr-2 h-4 w-4" />
                          Udemy
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  );
}