import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, BriefcaseBusiness, FileText, Clock, User, Award } from "lucide-react";

export function RecommendedCourses() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-primary" />
          Recommended Courses
        </CardTitle>
        <CardDescription>Based on your career goals and skill gaps</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="bg-primary/10 rounded-md p-3">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Leadership Fundamentals</h3>
              <p className="text-sm text-muted-foreground mb-2">Learn essential leadership skills for career growth</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" /> 8 weeks • 
                <User className="h-3 w-3 mx-1" /> 2,405 enrolled •
                <Award className="h-3 w-3 mx-1" /> Certificate
              </div>
            </div>
            <Button size="sm" variant="outline">Enroll</Button>
          </div>
          
          <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="bg-secondary/10 rounded-md p-3">
              <BriefcaseBusiness className="h-8 w-8 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Strategic Decision Making</h3>
              <p className="text-sm text-muted-foreground mb-2">Master the art of making strategic decisions in business</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" /> 6 weeks • 
                <User className="h-3 w-3 mx-1" /> 1,850 enrolled •
                <Award className="h-3 w-3 mx-1" /> Certificate
              </div>
            </div>
            <Button size="sm" variant="outline">Enroll</Button>
          </div>
          
          <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="bg-primary/10 rounded-md p-3">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">Data-Driven Management</h3>
              <p className="text-sm text-muted-foreground mb-2">Learn to leverage data for better management decisions</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" /> 10 weeks • 
                <User className="h-3 w-3 mx-1" /> 3,120 enrolled •
                <Award className="h-3 w-3 mx-1" /> Certificate
              </div>
            </div>
            <Button size="sm" variant="outline">Enroll</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}