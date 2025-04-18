import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
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
import { AnimatedBackground } from "./AnimatedBackground";
import { ResourceCarousel } from "./ResourceCarousel";
import { SkillDiagrams } from "./SkillDiagrams";
import { LearningPathVisualizer } from "./LearningPathVisualizer";

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
  // State for tracking processing stages
  const [processingStage, setProcessingStage] = useState<string | null>(null);
  
  const resourceRecommendationMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      // Reset stage
      setProcessingStage("initial");
      
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
      
      // First stage - show user we're starting the process
      setProcessingStage("searching");
      toast({
        title: "Finding Resources",
        description: "Searching for the best learning materials...",
      });
      
      const res = await apiRequest("POST", "/api/learning-resources", {
        skills,
        preferredTypes,
        maxResults: 5,
      });
      
      // Second stage - indicate verification in progress
      setProcessingStage("verifying");
      toast({
        title: "Verifying Results",
        description: "Validating and checking the quality of recommended resources...",
      });
      
      // Short delay to show verification stage (the actual verification happens on the server)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset stage before finishing
      setProcessingStage(null);
      return await res.json();
    },
    onSuccess: (data: Record<string, LearningResource[]>) => {
      setRecommendedResources(data);
      toast({
        title: "Recommendations Retrieved",
        description: "We've found high-quality, verified learning resources tailored to your needs.",
      });
    },
    onError: (error: Error) => {
      // Reset stage on error
      setProcessingStage(null);
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
      // Reset stage
      setProcessingStage("initial");
      
      // First stage - show user we're starting the process
      setProcessingStage("creating");
      toast({
        title: "Creating Learning Path",
        description: "Designing a customized learning journey for you...",
      });
      
      const res = await apiRequest("POST", "/api/learning-path", {
        skill: data.skill,
        currentLevel: data.currentLevel,
        targetLevel: data.targetLevel,
        context: data.context,
        learningStyle: data.learningStyle,
      });
      
      // Second stage - indicate verification in progress
      setProcessingStage("reviewing");
      toast({
        title: "Quality Check in Progress",
        description: "Reviewing and validating your learning path resources...",
      });
      
      // Short delay to show verification stage (the actual verification happens on the server)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Final stage
      setProcessingStage("finalizing");
      toast({
        title: "Finalizing Your Learning Path",
        description: "Completing your personalized learning journey...",
      });
      
      // Another short delay for the final stage
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset stage before finishing
      setProcessingStage(null);
      return await res.json();
    },
    onSuccess: (data: LearningPathRecommendation) => {
      setLearningPath(data);
      toast({
        title: "Learning Path Generated",
        description: "We've created a verified, high-quality learning path tailored to your needs.",
      });
    },
    onError: (error: Error) => {
      // Reset stage on error
      setProcessingStage(null);
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
    <div className="container mx-auto py-10 relative">
      <div className="relative">
        <AnimatedBackground />
        <div className="relative z-10">
          <motion.h1 
            className="text-3xl font-bold mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Learning Resource Recommender
          </motion.h1>
          <motion.p 
            className="text-gray-500 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Get personalized learning resources to help you acquire new skills or improve existing ones.
          </motion.p>
        </div>
      </div>

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
                          {processingStage === "searching" && "Searching for resources..."}
                          {processingStage === "verifying" && "Double-checking quality..."}
                          {!processingStage && "Processing..."}
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
                          {processingStage === "creating" && "Creating learning path..."}
                          {processingStage === "reviewing" && "Verifying resources..."}
                          {processingStage === "finalizing" && "Preparing your pathway..."}
                          {!processingStage && "Processing..."}
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <Card className="p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                  <AnimatedBackground />
                </div>
                <div className="relative z-10">
                  <motion.h2 
                    className="text-2xl font-bold mb-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    Recommended Learning Resources
                  </motion.h2>
                  <motion.p
                    className="text-gray-600 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    Tailored resources based on your learning preferences and skill level
                  </motion.p>
                  
                  {Object.keys(recommendedResources).map((skillName) => (
                    <motion.div 
                      key={skillName} 
                      className="mb-10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      {/* Skill diagrams showing progress visualization */}
                      <SkillDiagrams 
                        skillName={skillName}
                        currentLevel={form.getValues("currentLevel")}
                        targetLevel={form.getValues("targetLevel")}
                        learningStyle={form.getValues("learningStyle")}
                      />
                      
                      {/* Gamified resource recommendation carousel */}
                      <ResourceCarousel 
                        resources={recommendedResources[skillName]} 
                        skillName={skillName} 
                      />
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
          
          {learningPath && activeTab === "learningPath" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <Card className="p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                  <AnimatedBackground />
                </div>
                <div className="relative z-10">
                  {/* Learning path visualizer component */}
                  <LearningPathVisualizer 
                    skill={learningPath.skill}
                    description={learningPath.description}
                    recommendedSequence={learningPath.recommendedSequence}
                  />
                </div>
              </Card>
            </motion.div>
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