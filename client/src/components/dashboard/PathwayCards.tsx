import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, BookOpen, Globe, Building, FileText, BriefcaseBusiness, ChevronRight } from "lucide-react";

export function PathwayCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 backdrop-blur-lg bg-white/30 border border-white/50">
        <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-primary/20 filter blur-3xl"></div>
        <CardHeader className="bg-gradient-to-r from-primary/20 to-transparent backdrop-blur-md border-b border-white/20">
          <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">My Career Pathway</CardTitle>
          <CardDescription>Personal growth journey based on your skills and goals</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 relative z-10">
          <p className="text-gray-600 mb-4">
            Create a personalized career development plan tailored to your skills, 
            experience, and aspirations. Get AI-powered recommendations for skills to 
            develop and milestones to achieve.
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center backdrop-blur-md bg-white/20 p-2 rounded-lg border border-white/30">
              <div className="p-1 bg-primary/10 rounded-full mr-3">
                <Award className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm">Skill gap analysis</span>
            </li>
            <li className="flex items-center backdrop-blur-md bg-white/20 p-2 rounded-lg border border-white/30">
              <div className="p-1 bg-primary/10 rounded-full mr-3">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm">Learning recommendations</span>
            </li>
            <li className="flex items-center backdrop-blur-md bg-white/20 p-2 rounded-lg border border-white/30">
              <div className="p-1 bg-primary/10 rounded-full mr-3">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm">Industry-based career paths</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter className="relative z-10">
          <Button className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity">
            Explore Career Pathway
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 backdrop-blur-lg bg-white/30 border border-white/50">
        <div className="absolute -left-20 -top-20 w-40 h-40 rounded-full bg-secondary/20 filter blur-3xl"></div>
        <CardHeader className="bg-gradient-to-r from-secondary/20 to-transparent backdrop-blur-md border-b border-white/20">
          <CardTitle className="bg-clip-text text-transparent bg-gradient-to-r from-secondary to-indigo-600">My Organization Growth Pathway</CardTitle>
          <CardDescription>Career development within your organization</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 relative z-10">
          <p className="text-gray-600 mb-4">
            Discover career advancement opportunities within your current organization's 
            structure. See potential promotion paths, lateral moves, and the skills needed 
            to progress in your company.
          </p>
          <ul className="space-y-3 mb-6">
            <li className="flex items-center backdrop-blur-md bg-white/20 p-2 rounded-lg border border-white/30">
              <div className="p-1 bg-secondary/10 rounded-full mr-3">
                <Building className="h-4 w-4 text-secondary" />
              </div>
              <span className="text-sm">Organization-specific roles</span>
            </li>
            <li className="flex items-center backdrop-blur-md bg-white/20 p-2 rounded-lg border border-white/30">
              <div className="p-1 bg-secondary/10 rounded-full mr-3">
                <FileText className="h-4 w-4 text-secondary" />
              </div>
              <span className="text-sm">Internal promotion requirements</span>
            </li>
            <li className="flex items-center backdrop-blur-md bg-white/20 p-2 rounded-lg border border-white/30">
              <div className="p-1 bg-secondary/10 rounded-full mr-3">
                <BriefcaseBusiness className="h-4 w-4 text-secondary" />
              </div>
              <span className="text-sm">Cross-departmental opportunities</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter className="relative z-10">
          <Button className="w-full bg-gradient-to-r from-secondary to-indigo-600 hover:opacity-90 transition-opacity" variant="secondary">
            Explore Organization Pathway
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}