import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface ProfessionalLevelSectionProps {
  onSave: () => void;
}

export function ProfessionalLevelSection({ onSave }: ProfessionalLevelSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="h-5 w-5 mr-2 text-primary" />
          Professional Level
        </CardTitle>
        <CardDescription>Your current professional status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="professionalLevel">Current Professional Level</Label>
          <select 
            id="professionalLevel"
            className="w-full p-2 border rounded-md bg-background"
          >
            <option value="">-- Select your professional level --</option>
            <option value="student">Student</option>
            <option value="graduate">Graduate</option>
            <option value="intern">Intern</option>
            <option value="working-professional">Working Professional</option>
            <option value="returner">Returner</option>
            <option value="career-switcher">Career Switcher</option>
          </select>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={onSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}