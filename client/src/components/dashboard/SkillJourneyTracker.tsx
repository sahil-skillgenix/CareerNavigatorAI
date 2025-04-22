import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Lightbulb, Trophy, ChevronRight, CheckCircle2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface UserProgress {
  id: string;
  title: string;
  description: string;
  type: string;
  progress: number;
  milestones: string[];
  notes: string;
  updatedAt: string;
}

interface SkillJourneyTrackerProps {
  progressItems: UserProgress[];
  isLoading?: boolean;
}

export function SkillJourneyTracker({ progressItems, isLoading = false }: SkillJourneyTrackerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProgress, setSelectedProgress] = useState<UserProgress | null>(null);
  const [completedStep, setCompletedStep] = useState<number | null>(null);
  
  // Find a career pathway progress item if available
  useEffect(() => {
    if (progressItems && progressItems.length > 0) {
      const pathwayProgress = progressItems.find(item => item.type === "career_pathway");
      if (pathwayProgress) {
        setSelectedProgress(pathwayProgress);
      } else {
        setSelectedProgress(progressItems[0]);
      }
    } else {
      setSelectedProgress(null);
    }
  }, [progressItems]);
  
  const updateProgressMutation = useMutation({
    mutationFn: async ({ progressId, newProgress, notes }: { progressId: string, newProgress: number, notes?: string }) => {
      const response = await apiRequest('POST', `/api/progress/${progressId}/update`, { 
        progress: newProgress, 
        notes 
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update progress",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
  const completeStep = (index: number) => {
    if (!selectedProgress) return;
    
    // Calculate new progress percentage
    const totalSteps = selectedProgress.milestones.length;
    const newProgress = Math.min(100, Math.round(((index + 1) / totalSteps) * 100));
    
    // Show animation first
    setCompletedStep(index);
    
    // Then update progress
    setTimeout(() => {
      updateProgressMutation.mutate({
        progressId: selectedProgress.id,
        newProgress: newProgress,
        notes: `Completed step: ${selectedProgress.milestones[index]}`
      });
      
      // Reset the animation state after a delay
      setTimeout(() => {
        setCompletedStep(null);
      }, 2000);
    }, 1000);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Lightbulb className="h-5 w-5 mr-2 text-primary" />
            Skill Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!progressItems || progressItems.length === 0 || !selectedProgress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Lightbulb className="h-5 w-5 mr-2 text-primary" />
            Skill Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>Start a career analysis to begin tracking your skill journey.</p>
            <Button className="mt-4" onClick={() => window.location.href = "/career-pathway"}>
              Create Career Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate completed milestones based on progress
  const totalSteps = selectedProgress.milestones.length;
  const completedMilestones = Math.floor((selectedProgress.progress / 100) * totalSteps);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Lightbulb className="h-5 w-5 mr-2 text-primary" />
          {selectedProgress.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center mb-2">
          <div className="mr-4">
            <Progress value={selectedProgress.progress} className="w-60 h-2" />
          </div>
          <span className="text-sm font-medium">{selectedProgress.progress}% Complete</span>
        </div>
        
        <div className="space-y-3">
          {selectedProgress.milestones.map((milestone, index) => {
            const isCompleted = index < completedMilestones;
            const isActive = index === completedMilestones;
            const isAnimating = completedStep === index;
            
            return (
              <div 
                key={index} 
                className={cn(
                  "flex items-start p-3 rounded-lg border transition-all duration-200",
                  isCompleted ? "border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900" : 
                  isActive ? "border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900" : 
                  "border-muted bg-background"
                )}
              >
                <div className="mr-3 mt-0.5">
                  <AnimatePresence>
                    {isAnimating ? (
                      <motion.div
                        key="animating"
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.5, 1] }}
                        exit={{ scale: 1, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Zap className="h-5 w-5 text-amber-500" />
                      </motion.div>
                    ) : isCompleted ? (
                      <motion.div
                        key="completed"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="circle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          "h-5 w-5 rounded-full border-2",
                          isActive ? "border-amber-500" : "border-muted-foreground"
                        )}
                      />
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="flex-grow">
                  <p className={cn(
                    "text-sm transition-colors",
                    isCompleted ? "text-green-700 dark:text-green-300" : 
                    isActive ? "text-amber-700 dark:text-amber-300 font-medium" : 
                    "text-muted-foreground"
                  )}>
                    {milestone}
                  </p>
                </div>
                
                {isActive && !isCompleted && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="ml-2 text-xs"
                    onClick={() => completeStep(index)}
                    disabled={updateProgressMutation.isPending || isAnimating}
                  >
                    {updateProgressMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Mark Complete <ChevronRight className="h-3 w-3 ml-1" /></>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        
        {selectedProgress.progress === 100 && (
          <motion.div 
            className="mt-4 p-3 border border-primary bg-primary/10 rounded-lg flex items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Trophy className="h-5 w-5 text-primary mr-2" />
            <p className="text-sm text-primary">
              Congratulations! You've completed this skill journey.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}