import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";

interface SkillProgress {
  name: string;
  percentage: number;
  color: "primary" | "secondary";
}

interface CareerProgressTrackerProps {
  skills?: SkillProgress[];
}

export function CareerProgressTracker({ skills }: CareerProgressTrackerProps) {
  const defaultSkills: SkillProgress[] = [
    { name: "Leadership Skills", percentage: 65, color: "primary" },
    { name: "Technical Expertise", percentage: 82, color: "secondary" },
    { name: "Strategic Thinking", percentage: 48, color: "primary" },
    { name: "Communication", percentage: 73, color: "secondary" }
  ];

  const skillsToDisplay = skills || defaultSkills;

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
                className={`h-2 bg-${skill.color} rounded-full`} 
                style={{ width: `${skill.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
        
        <div className="pt-4">
          <Button variant="outline" className="w-full">
            View Full Assessment Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}