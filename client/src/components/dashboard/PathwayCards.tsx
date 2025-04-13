import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, BookOpen, Globe, Building, FileText, BriefcaseBusiness, ChevronRight } from "lucide-react";

export function PathwayCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardTitle>My Career Pathway</CardTitle>
          <CardDescription>Personal growth journey based on your skills and goals</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-muted-foreground mb-4">
            Create a personalized career development plan tailored to your skills, 
            experience, and aspirations. Get AI-powered recommendations for skills to 
            develop and milestones to achieve.
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <Award className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm">Skill gap analysis</span>
            </li>
            <li className="flex items-center">
              <BookOpen className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm">Learning recommendations</span>
            </li>
            <li className="flex items-center">
              <Globe className="h-4 w-4 text-primary mr-2" />
              <span className="text-sm">Industry-based career paths</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            Explore Career Pathway
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="bg-gradient-to-r from-secondary/10 to-secondary/5">
          <CardTitle>My Organization Growth Pathway</CardTitle>
          <CardDescription>Career development within your organization</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-muted-foreground mb-4">
            Discover career advancement opportunities within your current organization's 
            structure. See potential promotion paths, lateral moves, and the skills needed 
            to progress in your company.
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center">
              <Building className="h-4 w-4 text-secondary mr-2" />
              <span className="text-sm">Organization-specific roles</span>
            </li>
            <li className="flex items-center">
              <FileText className="h-4 w-4 text-secondary mr-2" />
              <span className="text-sm">Internal promotion requirements</span>
            </li>
            <li className="flex items-center">
              <BriefcaseBusiness className="h-4 w-4 text-secondary mr-2" />
              <span className="text-sm">Cross-departmental opportunities</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="secondary">
            Explore Organization Pathway
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}