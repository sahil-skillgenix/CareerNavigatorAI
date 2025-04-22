import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  ProfileSection,
  EducationSection,
  ExperienceSection,
  ProfessionalLevelSection,
  SkillsToolsSection,
  OrganizationSection
} from "@/components/dashboard";
import { AuthenticatedLayout } from "@/components/layouts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Briefcase, GraduationCap } from "lucide-react";

export default function MyDetailsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile"); // Set default active tab
  
  // Function to handle saving changes
  const handleSaveChanges = () => {
    // In a real implementation, you would save the data to the server here
    console.log("Changes saved");
  };
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      return response.json();
    }
  });
  
  return (
    <AuthenticatedLayout title="My Details">
      {/* Welcome Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl py-6 px-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-6">
          <div className="bg-white p-3 rounded-full border-2 border-primary shadow-sm">
            <UserCircle className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">My Personal Details</h1>
            <p className="text-gray-600">
              Manage your profile information, career experience, and organization details
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList className="grid grid-cols-3 w-full max-w-xl">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" /> 
                  Profile
                </TabsTrigger>
                <TabsTrigger value="info" className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" /> 
                  Education & Skills
                </TabsTrigger>
                <TabsTrigger value="organization" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> 
                  Organization
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal details and account information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileSection 
                    userData={{ 
                      fullName: user?.fullName || "Demo User", 
                      email: user?.email || "demo@skillgenix.com" 
                    }} 
                    onSave={handleSaveChanges} 
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="info" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                  <CardDescription>
                    Add your educational background
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EducationSection onAddEducation={() => console.log("Add education clicked")} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Work Experience</CardTitle>
                  <CardDescription>
                    Add your work experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ExperienceSection onAddExperience={() => console.log("Add experience clicked")} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Professional Level</CardTitle>
                  <CardDescription>
                    Set your current professional level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfessionalLevelSection onSave={handleSaveChanges} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Tools</CardTitle>
                  <CardDescription>
                    Add your skills and proficiency levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SkillsToolsSection onSave={handleSaveChanges} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="organization" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Organization Details</CardTitle>
                  <CardDescription>
                    Information about your current organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OrganizationSection />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}