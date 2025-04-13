import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";
import { useState } from "react";
import Select from 'react-select';

interface SkillsToolsSectionProps {
  onSave: () => void;
}

export function SkillsToolsSection({ onSave }: SkillsToolsSectionProps) {
  const [skills, setSkills] = useState<any>([]);
  const [tools, setTools] = useState<any>([]);
  
  const skillOptions = [
    { value: 'leadership', label: 'Leadership' },
    { value: 'communication', label: 'Communication' },
    { value: 'problem-solving', label: 'Problem Solving' },
    { value: 'teamwork', label: 'Teamwork' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'react', label: 'React' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'nodejs', label: 'Node.js' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'data-analysis', label: 'Data Analysis' },
    { value: 'machine-learning', label: 'Machine Learning' },
    { value: 'ux-design', label: 'UX Design' },
    { value: 'project-management', label: 'Project Management' },
    { value: 'agile', label: 'Agile' },
    { value: 'critical-thinking', label: 'Critical Thinking' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'conflict-resolution', label: 'Conflict Resolution' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
  ];
  
  const toolOptions = [
    { value: 'ms-office', label: 'Microsoft Office' },
    { value: 'google-suite', label: 'Google Suite' },
    { value: 'figma', label: 'Figma' },
    { value: 'sketch', label: 'Sketch' },
    { value: 'adobe-xd', label: 'Adobe XD' },
    { value: 'photoshop', label: 'Adobe Photoshop' },
    { value: 'illustrator', label: 'Adobe Illustrator' },
    { value: 'git', label: 'Git' },
    { value: 'github', label: 'GitHub' },
    { value: 'gitlab', label: 'GitLab' },
    { value: 'jira', label: 'Jira' },
    { value: 'trello', label: 'Trello' },
    { value: 'asana', label: 'Asana' },
    { value: 'slack', label: 'Slack' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'aws', label: 'AWS' },
    { value: 'azure', label: 'Microsoft Azure' },
    { value: 'gcp', label: 'Google Cloud Platform' },
    { value: 'docker', label: 'Docker' },
    { value: 'kubernetes', label: 'Kubernetes' },
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="h-5 w-5 mr-2 text-primary" />
          Skills & Tools
        </CardTitle>
        <CardDescription>Your expertise and toolset</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="skills">Skills (select up to 50)</Label>
          <Select
            isMulti
            name="skills"
            value={skills}
            onChange={(val) => setSkills(val)}
            placeholder="Search and select your skills..."
            className="basic-multi-select"
            classNamePrefix="select"
            options={skillOptions}
          />
          <p className="text-xs text-muted-foreground mt-1">Select the skills you possess (maximum 50)</p>
        </div>
        
        <div className="space-y-4 mt-6">
          <Label htmlFor="tools">Tools & Software (select up to 50)</Label>
          <Select
            isMulti
            name="tools"
            value={tools}
            onChange={(val) => setTools(val)}
            placeholder="Search and select tools you use..."
            className="basic-multi-select"
            classNamePrefix="select"
            options={toolOptions}
          />
          <p className="text-xs text-muted-foreground mt-1">Select the tools and software you're proficient with (maximum 50)</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={onSave}>Save Changes</Button>
      </CardFooter>
    </Card>
  );
}