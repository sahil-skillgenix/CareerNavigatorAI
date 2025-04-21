import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  Clock, 
  FileCheck, 
  GraduationCap, 
  LinkIcon, 
  MoveRight, 
  Star 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';

interface LearningResource {
  id: string;
  title: string;
  type: string;
  provider: string;
  url?: string;
  description: string;
  estimatedHours: number;
  difficulty: string;
  costType: string;
  tags: string[];
  relevanceScore: number;
  matchReason: string;
}

interface LearningPathStep {
  step: number;
  resources: LearningResource[];
  milestone: string;
  estimatedTimeToComplete: string;
}

interface LearningPathRecommendation {
  skill: string;
  description: string;
  recommendedSequence: LearningPathStep[];
}

interface Skill {
  id: number;
  name: string;
  category: string;
  description: string;
}

export default function SkillLearningPathPage() {
  const [skillId, setSkillId] = useState<number | null>(null);
  const [learningStyle, setLearningStyle] = useState<string>("visual");
  const [currentLevel, setCurrentLevel] = useState<string>("beginner");
  const [targetLevel, setTargetLevel] = useState<string>("intermediate");
  const [context, setContext] = useState<string>("professional");
  
  useEffect(() => {
    // Parse skill ID from URL
    const pathParts = window.location.pathname.split('/');
    const idFromPath = parseInt(pathParts[2]);
    if (!isNaN(idFromPath)) {
      setSkillId(idFromPath);
    }
  }, []);

  // Fetch skill details
  const { data: skill, isLoading: skillLoading } = useQuery<Skill>({
    queryKey: skillId ? ['/api/skills', skillId] : [],
    enabled: !!skillId,
  });

  // Fetch learning path
  const { data: learningPath, isLoading, error } = useQuery<LearningPathRecommendation>({
    queryKey: skillId ? ['/api/skills', skillId, 'learning-path', learningStyle, currentLevel, targetLevel, context] : [],
    queryFn: async () => {
      if (!skillId) throw new Error("Skill ID is required");
      
      const params = new URLSearchParams({
        learningStyle,
        currentLevel,
        targetLevel,
        context
      });
      
      const response = await fetch(`/api/skills/${skillId}/learning-path?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch learning path');
      }
      
      return response.json();
    },
    enabled: !!skillId && !!skill,
  });

  // Handle regeneration of learning path with new parameters
  const regenerateLearningPath = () => {
    // The query will automatically refetch when parameters change
  };

  const renderResourceType = (type: string) => {
    const bgColor = 
      type === "course" ? "bg-blue-100 text-blue-800" :
      type === "book" ? "bg-purple-100 text-purple-800" :
      type === "video" ? "bg-red-100 text-red-800" :
      type === "tutorial" ? "bg-green-100 text-green-800" :
      type === "article" ? "bg-amber-100 text-amber-800" :
      type === "practice" ? "bg-indigo-100 text-indigo-800" :
      type === "certification" ? "bg-emerald-100 text-emerald-800" :
      type === "podcast" ? "bg-pink-100 text-pink-800" :
      "bg-gray-100 text-gray-800";
      
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor}`}>
        {type}
      </span>
    );
  };

  const renderDifficultyBadge = (difficulty: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline";
    
    if (difficulty === "expert" || difficulty === "advanced") {
      variant = "destructive";
    } else if (difficulty === "intermediate") {
      variant = "secondary";
    } else if (difficulty === "beginner") {
      variant = "default";
    }
    
    return <Badge variant={variant}>{difficulty}</Badge>;
  };

  const getTotalEstimatedTime = (steps: LearningPathStep[]) => {
    let totalHours = 0;
    steps.forEach(step => {
      step.resources.forEach(resource => {
        totalHours += resource.estimatedHours;
      });
    });
    return totalHours;
  };

  if (isLoading || skillLoading) {
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

  if (error || !skill) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gray-50 flex justify-center items-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Learning Path</h1>
            <p className="text-gray-600 mb-6">We encountered an error while loading the learning pathway.</p>
            <Button asChild variant="outline">
              <Link href={`/skills/${skillId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Skill
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
                <Link href={`/skills/${skillId}`} className="hover:text-primary">{skill.name}</Link>
                <span>/</span>
                <span className="text-gray-900">Learning Path</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">{skill.name} Learning Path</h1>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href={`/skills/${skillId}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Skill
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="#">
                  <Star className="mr-2 h-4 w-4" />
                  Save Path
                </Link>
              </Button>
            </div>
          </div>

          {/* Customization Panel */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="mr-2 h-5 w-5" />
                Customize Your Learning Journey
              </CardTitle>
              <CardDescription>
                Tailor your learning path to match your preferences and goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Current Level</label>
                  <Select
                    value={currentLevel}
                    onValueChange={setCurrentLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="novice">Novice (No Knowledge)</SelectItem>
                      <SelectItem value="beginner">Beginner (Foundational)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (Working Knowledge)</SelectItem>
                      <SelectItem value="advanced">Advanced (Deep Experience)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Level</label>
                  <Select
                    value={targetLevel}
                    onValueChange={setTargetLevel}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (Foundational)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (Working Knowledge)</SelectItem>
                      <SelectItem value="advanced">Advanced (Deep Experience)</SelectItem>
                      <SelectItem value="expert">Expert (Mastery)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Learning Style</label>
                  <Select
                    value={learningStyle}
                    onValueChange={setLearningStyle}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual</SelectItem>
                      <SelectItem value="auditory">Auditory</SelectItem>
                      <SelectItem value="reading">Reading/Writing</SelectItem>
                      <SelectItem value="kinesthetic">Hands-on/Practical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Learning Context</label>
                  <Select
                    value={context}
                    onValueChange={setContext}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select context" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional Development</SelectItem>
                      <SelectItem value="academic">Academic Education</SelectItem>
                      <SelectItem value="career-change">Career Change</SelectItem>
                      <SelectItem value="hobby">Personal Interest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                className="mt-6 w-full md:w-auto" 
                onClick={regenerateLearningPath}
              >
                <FileCheck className="mr-2 h-4 w-4" />
                Update Learning Path
              </Button>
            </CardContent>
          </Card>

          {/* Learning Path Overview */}
          {learningPath ? (
            <div className="space-y-8">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="text-2xl">Your Personalized Learning Journey</CardTitle>
                  <CardDescription className="text-base">
                    {learningPath.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center mb-2">
                        <Clock className="h-5 w-5 mr-2 text-blue-600" />
                        <h3 className="font-medium">Estimated Time</h3>
                      </div>
                      <p className="text-2xl font-bold">{getTotalEstimatedTime(learningPath.recommendedSequence)} hours</p>
                      <p className="text-sm text-muted-foreground">Total learning time</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                        <h3 className="font-medium">Milestones</h3>
                      </div>
                      <p className="text-2xl font-bold">{learningPath.recommendedSequence.length}</p>
                      <p className="text-sm text-muted-foreground">Learning stages</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center mb-2">
                        <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                        <h3 className="font-medium">Resources</h3>
                      </div>
                      <p className="text-2xl font-bold">
                        {learningPath.recommendedSequence.reduce((sum, step) => sum + step.resources.length, 0)}
                      </p>
                      <p className="text-sm text-muted-foreground">Curated materials</p>
                    </div>
                  </div>
                  
                  <div className="relative pl-8 before:absolute before:left-4 before:top-2 before:h-[calc(100%-16px)] before:w-[2px] before:bg-gray-200">
                    {learningPath.recommendedSequence.map((step, idx) => (
                      <div key={idx} className="relative mb-8 last:mb-0">
                        <div className="absolute -left-4 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                          {step.step}
                        </div>
                        <div className="pt-1">
                          <h3 className="text-lg font-bold mb-1">{step.milestone}</h3>
                          <p className="text-sm text-muted-foreground mb-3 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {step.estimatedTimeToComplete}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>
                    <Star className="mr-2 h-4 w-4" />
                    Save This Learning Path
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Detailed Steps */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Detailed Learning Steps</h2>
                
                <div className="space-y-6">
                  {learningPath.recommendedSequence.map((step, idx) => (
                    <Card key={idx} className="border-l-4 border-l-blue-600">
                      <CardHeader>
                        <div className="flex items-center">
                          <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3">
                            {step.step}
                          </div>
                          <div>
                            <CardTitle>{step.milestone}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <Clock className="h-4 w-4 mr-1" />
                              {step.estimatedTimeToComplete}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                          {step.resources.map((resource, resourceIdx) => (
                            <AccordionItem key={resourceIdx} value={`item-${idx}-${resourceIdx}`}>
                              <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-4">
                                  <div className="flex items-center">
                                    <div className="mr-3">{renderResourceType(resource.type)}</div>
                                    <span className="font-medium">{resource.title}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {renderDifficultyBadge(resource.difficulty)}
                                    <Badge variant="outline">{resource.costType}</Badge>
                                    <Badge variant="secondary">{resource.estimatedHours} hrs</Badge>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                <div className="space-y-4 pt-2 pl-10">
                                  <div>
                                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                                    <p className="text-sm font-medium mt-2">Why we recommend this:</p>
                                    <p className="text-sm text-muted-foreground">{resource.matchReason}</p>
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-2">
                                    {resource.tags.map((tag, tagIdx) => (
                                      <Badge key={tagIdx} variant="outline" className="text-xs">{tag}</Badge>
                                    ))}
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <div className="text-sm">
                                      <span className="text-muted-foreground">Provider: </span>
                                      <span className="font-medium">{resource.provider}</span>
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
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                      <CardFooter className="border-t pt-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MoveRight className="h-4 w-4 mr-2" />
                          Complete this step before moving to the next one for optimal learning progression.
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Learning Path Not Available</CardTitle>
                <CardDescription>
                  We couldn't generate a learning path for this skill at the moment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Try adjusting your learning preferences or check back later.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link href={`/skills/${skillId}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Skill
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}