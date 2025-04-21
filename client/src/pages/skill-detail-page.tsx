import React, { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Book, 
  Briefcase, 
  Building, 
  Code, 
  FileText, 
  GraduationCap, 
  Lightbulb, 
  Link as LinkIcon, 
  Loader2, 
  MapPin, 
  Medal, 
  SquareArrowUpRight, 
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [_, params] = useRoute('/skills/:id');
  const skillId = params?.id;
  const { toast } = useToast();
  
  const { data: skillProfile, isLoading, error } = useQuery<SkillProfile>({
    queryKey: ['/api/skills', skillId, 'profile'],
    queryFn: async () => {
      const response = await fetch(`/api/skills/${skillId}/profile`);
      if (!response.ok) {
        throw new Error('Failed to fetch skill profile');
      }
      return response.json();
    },
    enabled: !!skillId
  });
  
  useEffect(() => {
    if (skillProfile) {
      document.title = `${skillProfile.name} | Skillgenix`;
    } else {
      document.title = 'Skill Details | Skillgenix';
    }
  }, [skillProfile]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-semibold text-center">Loading skill details...</h2>
      </div>
    );
  }
  
  if (error || !skillProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">Error Loading Skill</h2>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : 'Failed to load skill details. Please try again.'}
          </p>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  // Format the learning path URL (if needed for sharing or bookmarking)
  const learningPathUrl = `/skills/${skillId}/learning-path`;
  
  // Helper function to render importance badge with appropriate color
  const renderImportanceBadge = (importance: string) => {
    const color = 
      importance === 'Essential' ? 'bg-red-100 text-red-800 border-red-300' :
      importance === 'Important' ? 'bg-blue-100 text-blue-800 border-blue-300' :
      importance === 'Helpful' ? 'bg-green-100 text-green-800 border-green-300' :
      importance === 'Beneficial' ? 'bg-green-100 text-green-800 border-green-300' :
      importance === 'Optional' ? 'bg-gray-100 text-gray-800 border-gray-300' :
      'bg-gray-100 text-gray-800 border-gray-300';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
        {importance}
      </span>
    );
  };
  
  // Helper function to render skill level badge with appropriate color
  const renderLevelBadge = (level: string) => {
    const color = 
      level === 'Beginner' ? 'bg-green-100 text-green-800 border-green-300' :
      level === 'Intermediate' ? 'bg-blue-100 text-blue-800 border-blue-300' :
      level === 'Advanced' ? 'bg-purple-100 text-purple-800 border-purple-300' :
      level === 'Expert' ? 'bg-red-100 text-red-800 border-red-300' :
      'bg-gray-100 text-gray-800 border-gray-300';
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
        {level}
      </span>
    );
  };
  
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mt-20 container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Skill Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link href="/skills" className="hover:underline">Skills</Link>
              <span>/</span>
              <Badge variant="outline">{skillProfile.category}</Badge>
            </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1c3b82]">{skillProfile.name}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link href={learningPathUrl}>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Learning Path
                </Link>
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  // Add to saved skills/resources functionality
                  toast({
                    title: "Skill saved",
                    description: `${skillProfile.name} has been added to your saved items.`,
                  });
                }}
              >
                <Star className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
        </div>
        
          {/* Skill description */}
          <p className="text-lg text-muted-foreground mb-4">{skillProfile.description}</p>
          
          {/* Framework mappings */}
          {(skillProfile.sfiaMapping || skillProfile.digCompMapping) && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
              {skillProfile.sfiaMapping && (
                <div className="flex items-center">
                  <Badge variant="secondary" className="mr-2">SFIA 9</Badge>
                  <span className="text-sm">{skillProfile.sfiaMapping}</span>
                </div>
              )}
              {skillProfile.digCompMapping && (
                <div className="flex items-center">
                  <Badge variant="secondary" className="mr-2">DigComp 2.2</Badge>
                  <span className="text-sm">{skillProfile.digCompMapping}</span>
                </div>
              )}
            </div>
          )}
        </div>
      
        {/* Main content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-8 grid w-full grid-cols-5 md:grid-cols-5 lg:max-w-3xl mx-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="prerequisites">Prerequisites</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="industries">Industries</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
        
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Skill levels */}
            {skillProfile.levelingCriteria && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Medal className="mr-2 h-5 w-5" />
                    Proficiency Levels
                  </CardTitle>
                  <CardDescription>
                    Understanding the different levels of expertise for this skill
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(skillProfile.levelingCriteria).map(([level, description]) => (
                      <div key={level} className="flex flex-col">
                        <div className="flex items-center mb-2">
                          {renderLevelBadge(level)}
                        </div>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
          )}
          
            {/* Related Skills */}
            {skillProfile.relatedSkills && skillProfile.relatedSkills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Code className="mr-2 h-5 w-5" />
                    Related Skills
                  </CardTitle>
                  <CardDescription>
                    Skills that are commonly used alongside {skillProfile.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skillProfile.relatedSkills.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
          )}
          
            {/* Industry Relevance */}
            {skillProfile.industryRelevance && skillProfile.industryRelevance.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="mr-2 h-5 w-5" />
                    Industry Relevance
                  </CardTitle>
                  <CardDescription>
                    Industries where this skill is particularly valuable
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skillProfile.industryRelevance.map((industry, index) => (
                      <Badge key={index} variant="outline">{industry}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Dependent Skills */}
            {skillProfile.dependentSkills && skillProfile.dependentSkills.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5" />
                    Used For
                  </CardTitle>
                  <CardDescription>
                    Skills that require {skillProfile.name} as a prerequisite
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skillProfile.dependentSkills.map((skill) => (
                      <div key={skill.id} className="flex items-center justify-between border rounded p-3">
                        <div className="flex items-center">
                          <Link href={`/skills/${skill.id}`}>
                            <span className="font-medium hover:text-primary hover:underline">{skill.name}</span>
                          </Link>
                          <Badge variant="outline" className="ml-2">{skill.category}</Badge>
                        </div>
                        {renderImportanceBadge(skill.importance)}
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-muted-foreground">
                    Mastering {skillProfile.name} will make it easier to learn these advanced skills.
                  </p>
                </CardFooter>
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
      </main>
      <Footer />
    </div>
  );
}