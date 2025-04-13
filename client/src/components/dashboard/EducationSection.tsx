import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

interface EducationSectionProps {
  onAddEducation?: () => void;
}

export function EducationSection({ onAddEducation }: EducationSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <GraduationCap className="h-5 w-5 mr-2 text-primary" />
          Education Details
        </CardTitle>
        <CardDescription>Your academic background</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="degree">Highest Degree</Label>
            <Input id="degree" placeholder="e.g. Bachelor of Science" />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="field">Field of Study</Label>
            <Input id="field" placeholder="e.g. Computer Science" />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="institution">Institution</Label>
            <Input id="institution" placeholder="Enter your institution name" />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="gradYear">Graduation Year</Label>
            <Input id="gradYear" type="number" placeholder="e.g. 2020" />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={onAddEducation}>+ Add Education</Button>
        </div>
      </CardContent>
    </Card>
  );
}