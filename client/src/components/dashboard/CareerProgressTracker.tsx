import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

interface SkillProgress {
  name: string;
  percentage: number;
  color: "primary" | "secondary";
}

interface UserProgress {
  id: string;
  userId: number;
  skillName: string;
  category: string;
  currentLevel: number;
  targetLevel: number;
  progress: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface CareerProgressTrackerProps {
  skills?: SkillProgress[];
}

export function CareerProgressTracker({ skills }: CareerProgressTrackerProps) {
  const { user } = useAuth();
  
  // Fetch user progress data
  const { data: progressItems, isLoading, error } = useQuery({
    queryKey: ["/api/progress"],
    queryFn: async () => {
      const response = await fetch("/api/progress");
      if (!response.ok) {
        throw new Error("Failed to fetch progress data");
      }
      return response.json() as Promise<UserProgress[]>;
    },
    enabled: !!user
  });
  
  // Map progress items to skill progress format
  const mapProgressToSkills = (items: UserProgress[]): SkillProgress[] => {
    return items.map((item, index) => ({
      name: item.skillName,
      percentage: item.progress,
      color: index % 2 === 0 ? "primary" : "secondary"
    }));
  };

  // Fallback skills if no progress data
  const defaultSkills: SkillProgress[] = [
    { name: "Leadership Skills", percentage: 65, color: "primary" },
    { name: "Technical Expertise", percentage: 82, color: "secondary" },
    { name: "Strategic Thinking", percentage: 48, color: "primary" },
    { name: "Communication", percentage: 73, color: "secondary" }
  ];

  // Determine which skills to display
  const skillsToDisplay = skills || 
    (progressItems && progressItems.length > 0 
      ? mapProgressToSkills(progressItems) 
      : defaultSkills);

  const handleViewFullReport = () => {
    window.location.href = "/dashboard/progress";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChart className="h-5 w-5 mr-2 text-primary" />
            Career Progress
          </CardTitle>
          <CardDescription>Track your growth over time</CardDescription>
        </CardHeader>
        <CardContent className="h-60 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChart className="h-5 w-5 mr-2 text-primary" />
            Career Progress
          </CardTitle>
          <CardDescription>Track your growth over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p>Failed to load progress data. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <LineChart className="h-5 w-5 mr-2 text-primary" />
          Career Progress
        </CardTitle>
        <CardDescription>Track your growth over time</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {skillsToDisplay.map((skill, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{skill.name}</span>
              <span className="text-sm text-muted-foreground">{skill.percentage}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full">
              <div 
                className={skill.color === "primary" ? "h-2 bg-primary rounded-full" : "h-2 bg-secondary rounded-full"} 
                style={{ width: `${skill.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
        
        <div className="pt-4">
          <Button variant="outline" className="w-full" onClick={handleViewFullReport}>
            View Full Assessment Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}