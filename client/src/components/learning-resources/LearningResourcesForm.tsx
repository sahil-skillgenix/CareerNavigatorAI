import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BookOpen, Video, GraduationCap, File, Clock, DollarSign, Tag, ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// Define interfaces
interface SkillToLearn {
  skill: string;
  currentLevel: string;
  targetLevel: string;
  context: string;
  learningStyle?: string;
}

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

// Define the form validation schema
const formSchema = z.object({
  skill: z.string().min(2, "Skill name must be at least 2 characters"),
  currentLevel: z.string().min(1, "Please select your current level"),
  targetLevel: z.string().min(1, "Please select your target level"),
  context: z.string().min(10, "Context must be at least 10 characters"),
  learningStyle: z.string().optional(),
  resourceType: z.string().optional(),
});

export function LearningResourcesForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("singleSkill");
  const [recommendedResources, setRecommendedResources] = useState<Record<string, LearningResource[]> | null>(null);
  const [learningPath, setLearningPath] = useState<LearningPathRecommendation | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      skill: "",
      currentLevel: "",
      targetLevel: "",
      context: "",
      learningStyle: "",
      resourceType: "",
    },
  });

  // Mutation for getting resource recommendations
  const resourceRecommendationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const skills: SkillToLearn[] = [
        {
          skill: data.skill,
          currentLevel: data.currentLevel,
          targetLevel: data.targetLevel,
          context: data.context,
          learningStyle: data.learningStyle,
        },
      ];
      
      const preferredTypes = data.resourceType ? [data.resourceType] : undefined;
      
      const res = await apiRequest("POST", "/api/learning-resources", {
        skills,
        preferredTypes,
        maxResults: 5,
      });
      
      return await res.json();
    },
    onSuccess: (data: Record<string, LearningResource[]>) => {
      setRecommendedResources(data);
      toast({
        title: "Recommendations Retrieved",
        description: "We've found learning resources tailored to your needs.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Getting Recommendations",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation for getting learning path
  const learningPathMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/learning-path", {
        skill: data.skill,
        currentLevel: data.currentLevel,
        targetLevel: data.targetLevel,
        context: data.context,
        learningStyle: data.learningStyle,
      });
      
      return await res.json();
    },
    onSuccess: (data: LearningPathRecommendation) => {
      setLearningPath(data);
      toast({
        title: "Learning Path Generated",
        description: "We've created a customized learning path for you.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error Generating Learning Path",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    if (activeTab === "singleSkill") {
      resourceRecommendationMutation.mutate(data);
    } else {
      learningPathMutation.mutate(data);
    }
  };

  // Helper function to render resource type icon
  const getResourceIcon = (type: string) => {
    if (!type) return <File className="w-4 h-4" />;
    
    switch (type.toLowerCase()) {
      case "book":
        return <BookOpen className="w-4 h-4" />;
      case "video":
      case "tutorial":
        return <Video className="w-4 h-4" />;
      case "course":
      case "certification":
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    if (!difficulty) return "bg-gray-100 text-gray-800";
    
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-orange-100 text-orange-800";
      case "expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get cost type color
  const getCostTypeColor = (costType: string) => {
    if (!costType) return "bg-gray-100 text-gray-800";
    
    switch (costType.toLowerCase()) {
      case "free":
        return "bg-green-100 text-green-800";
      case "freemium":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-purple-100 text-purple-800";
      case "subscription":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Learning Resource Recommender</h1>
      <p className="text-gray-500 mb-8">
        Get personalized learning resources to help you acquire new skills or improve existing ones.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div>
          <Tabs defaultValue="singleSkill" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="w-full">
              <TabsTrigger value="singleSkill" className="flex-1">Resource Recommendations</TabsTrigger>
              <TabsTrigger value="learningPath" className="flex-1">Learning Path</TabsTrigger>
            </TabsList>
            <TabsContent value="singleSkill">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Get Targeted Resource Recommendations</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Tell us about a specific skill you want to learn, and we'll recommend the best resources.
                </p>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="skill"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skill Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Data Visualization, Public Speaking, JavaScript" {...field} />
                          </FormControl>
                          <FormDescription>Enter the specific skill you want to learn</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="currentLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your current level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                                <SelectItem value="expert">Expert</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="targetLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your target level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                                <SelectItem value="expert">Expert</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="context"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Learning Context</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Explain why you want to learn this skill and how you plan to use it"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This helps us provide more relevant recommendations
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="learningStyle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Learning Style (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your preferred learning style" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="visual">Visual</SelectItem>
                                <SelectItem value="auditory">Auditory</SelectItem>
                                <SelectItem value="reading">Reading/Writing</SelectItem>
                                <SelectItem value="kinesthetic">Kinesthetic (Hands-on)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              How do you learn best?
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="resourceType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Resource Type (Optional)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select preferred resource type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="course">Courses</SelectItem>
                                <SelectItem value="book">Books</SelectItem>
                                <SelectItem value="video">Videos</SelectItem>
                                <SelectItem value="tutorial">Tutorials</SelectItem>
                                <SelectItem value="article">Articles</SelectItem>
                                <SelectItem value="podcast">Podcasts</SelectItem>
                                <SelectItem value="practice">Practice Exercises</SelectItem>
                                <SelectItem value="certification">Certifications</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={resourceRecommendationMutation.isPending}
                    >
                      {resourceRecommendationMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Finding Resources...
                        </>
                      ) : (
                        "Get Resource Recommendations"
                      )}
                    </Button>
                  </form>
                </Form>
              </Card>
            </TabsContent>
            
            <TabsContent value="learningPath">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Generate Comprehensive Learning Path</h2>
                <p className="text-sm text-gray-500 mb-6">
                  Create a step-by-step learning path with milestones and curated resources.
                </p>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Same form fields as above */}
                    <FormField
                      control={form.control}
                      name="skill"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skill Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Data Visualization, Public Speaking, JavaScript" {...field} />
                          </FormControl>
                          <FormDescription>Enter the specific skill you want to learn</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="currentLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your current level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                                <SelectItem value="expert">Expert</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="targetLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Level</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your target level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                                <SelectItem value="expert">Expert</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="context"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Learning Context</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Explain why you want to learn this skill and how you plan to use it"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            This helps us create a more relevant learning path
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="learningStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Learning Style (Optional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your preferred learning style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="visual">Visual</SelectItem>
                              <SelectItem value="auditory">Auditory</SelectItem>
                              <SelectItem value="reading">Reading/Writing</SelectItem>
                              <SelectItem value="kinesthetic">Kinesthetic (Hands-on)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            How do you learn best?
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={learningPathMutation.isPending}
                    >
                      {learningPathMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Learning Path...
                        </>
                      ) : (
                        "Generate Learning Path"
                      )}
                    </Button>
                  </form>
                </Form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          {/* Results section */}
          {recommendedResources && activeTab === "singleSkill" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Recommended Learning Resources</h2>
              
              {Object.keys(recommendedResources).map((skillName) => (
                <div key={skillName} className="mb-6">
                  <h3 className="text-xl font-semibold mb-2">For: {skillName}</h3>
                  <Separator className="mb-4" />
                  
                  <div className="space-y-4">
                    {recommendedResources[skillName].map((resource) => (
                      <Card key={resource.id} className="p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-semibold">{resource.title}</h4>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <span className="flex items-center mr-4">
                                {getResourceIcon(resource.type)}
                                <span className="ml-1">{resource.type}</span>
                              </span>
                              <span className="mr-4">by {resource.provider}</span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {resource.estimatedHours} hours
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="text-sm font-medium flex items-center">
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              {resource.relevanceScore}/10
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 my-3 text-sm">{resource.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                          <Badge className={getDifficultyColor(resource.difficulty)}>
                            {resource.difficulty}
                          </Badge>
                          <Badge className={getCostTypeColor(resource.costType)}>
                            <DollarSign className="w-3 h-3 mr-1" /> {resource.costType}
                          </Badge>
                          {resource.tags.slice(0, 3).map((tag, i) => (
                            <Badge key={i} variant="outline" className="flex items-center">
                              <Tag className="w-3 h-3 mr-1" /> {tag}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <div className="text-xs text-gray-500">
                            <strong>Why this resource:</strong> {resource.matchReason}
                          </div>
                          
                          {resource.url && resource.url !== "N/A" && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                Visit Resource
                              </a>
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {learningPath && activeTab === "learningPath" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-2">Learning Path: {learningPath.skill}</h2>
              <p className="text-gray-600 mb-6">{learningPath.description}</p>
              
              <Accordion type="single" collapsible className="w-full">
                {learningPath.recommendedSequence.map((step) => (
                  <AccordionItem key={step.step} value={`step-${step.step}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center">
                        <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center mr-3">
                          {step.step}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">{step.milestone}</div>
                          <div className="text-sm text-gray-500">{step.estimatedTimeToComplete}</div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-11 space-y-4 mt-2">
                        {step.resources.map((resource) => (
                          <Card key={resource.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-md font-semibold">{resource.title}</h4>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <span className="flex items-center mr-4">
                                    {getResourceIcon(resource.type)}
                                    <span className="ml-1">{resource.type}</span>
                                  </span>
                                  <span className="mr-4">by {resource.provider}</span>
                                  <span className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {resource.estimatedHours} hours
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 my-2 text-xs">{resource.description}</p>
                            
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge className={getDifficultyColor(resource.difficulty)} variant="outline">
                                {resource.difficulty}
                              </Badge>
                              <Badge className={getCostTypeColor(resource.costType)} variant="outline">
                                <DollarSign className="w-3 h-3 mr-1" /> {resource.costType}
                              </Badge>
                            </div>
                            
                            <div className="mt-3 flex justify-between items-center">
                              <div className="text-xs text-gray-500">
                                <strong>Match reason:</strong> {resource.matchReason}
                              </div>
                              
                              {resource.url && resource.url !== "N/A" && (
                                <Button variant="outline" size="sm" asChild>
                                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                    Visit
                                  </a>
                                </Button>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
          
          {!recommendedResources && !learningPath && (
            <div className="bg-white/50 rounded-lg border border-dashed border-gray-300 p-8 flex flex-col items-center justify-center h-full">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <GraduationCap className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-2">
                Get personalized learning resources
              </h3>
              <p className="text-gray-500 text-center max-w-md">
                Fill out the form to receive targeted recommendations or a complete learning path tailored to your needs.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}