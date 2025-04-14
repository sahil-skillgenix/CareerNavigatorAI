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
  OrganizationSection,
  SearchHistorySection,
  PathwayCards,
  RecommendedCourses,
  CareerProgressTracker,
  DashboardHeader,
  Navigation
} from "@/components/dashboard";

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("");
  
  // Function to handle saving changes and closing the active tab
  const handleSaveChanges = () => {
    setActiveTab("");
  };
  
  const { data: dashboardData } = useQuery({
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
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        <Navigation />
        
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-bold mb-6">My Details</h1>
          
          <div className="w-full max-w-3xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-center mb-6">
                <TabsList className="grid grid-cols-3 w-full max-w-xl">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="organization">My Organization</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="profile" className="space-y-6">
                <ProfileSection 
                  userData={{ 
                    fullName: user?.fullName || "Demo User", 
                    email: user?.email || "demo@careerpathAI.com" 
                  }} 
                  onSave={handleSaveChanges} 
                />
              </TabsContent>
              
              <TabsContent value="info" className="space-y-6">
                <EducationSection onAddEducation={() => console.log("Add education clicked")} />
                <ExperienceSection onAddExperience={() => console.log("Add experience clicked")} />
                <ProfessionalLevelSection onSave={handleSaveChanges} />
                <SkillsToolsSection onSave={handleSaveChanges} />
              </TabsContent>
              
              <TabsContent value="organization" className="space-y-6">
                <OrganizationSection />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Career Development Pathways Section */}
        <section className="mt-12 mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-center">Career Development Pathways</h2>
          <div className="flex justify-center mb-12">
            <PathwayCards />
          </div>
        </section>

        {/* Career Insights Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-center">Career Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="lg:col-span-2">
              <RecommendedCourses />
            </div>
            <div>
              <CareerProgressTracker />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}