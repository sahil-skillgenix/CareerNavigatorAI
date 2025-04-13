import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BriefcaseBusiness } from "lucide-react";

interface ExperienceSectionProps {
  onAddExperience?: () => void;
}

export function ExperienceSection({ onAddExperience }: ExperienceSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BriefcaseBusiness className="h-5 w-5 mr-2 text-primary" />
          Experience Details
        </CardTitle>
        <CardDescription>Your work history</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="jobTitle">Current Job Title</Label>
            <Input id="jobTitle" placeholder="e.g. Software Engineer" />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="company">Company</Label>
            <Input id="company" placeholder="Enter your company name" />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" />
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="currentJob">Current Job</Label>
            <div className="flex items-center pt-2">
              <input type="checkbox" id="currentJob" className="mr-2" />
              <label htmlFor="currentJob">I currently work here</label>
            </div>
          </div>
          
          <div className="space-y-3 col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea 
              id="description" 
              className="w-full min-h-[100px] p-2 border rounded-md"
              placeholder="Describe your responsibilities and achievements"
            ></textarea>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={onAddExperience}>+ Add Experience</Button>
        </div>
      </CardContent>
    </Card>
  );
}