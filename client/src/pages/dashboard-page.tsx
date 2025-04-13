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
  DashboardHeader
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      {/* Background elements for glassmorphism effect */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/20 rounded-full filter blur-3xl opacity-30"></div>
        <div className="absolute top-60 -right-20 w-96 h-96 bg-secondary/20 rounded-full filter blur-3xl opacity-40"></div>
        <div className="absolute -bottom-40 left-60 w-72 h-72 bg-purple-400/20 rounded-full filter blur-3xl opacity-30"></div>
      </div>
      
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center mb-12"
        >
          <h1 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Career Dashboard</h1>
          
          <div className="w-full max-w-3xl backdrop-blur-lg bg-white/30 border border-white/50 rounded-xl shadow-lg p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-center mb-6">
                <TabsList className="grid grid-cols-4 w-full max-w-xl backdrop-blur-md bg-white/50 border border-white/50">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="organization">My Organization</TabsTrigger>
                  <TabsTrigger value="history">Search History</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="profile" className="space-y-6 backdrop-blur-md bg-white/40 rounded-lg p-6 border border-white/50">
                <ProfileSection 
                  userData={{ 
                    fullName: user?.fullName || "Demo User", 
                    email: user?.email || "demo@careerpathAI.com" 
                  }} 
                  onSave={handleSaveChanges} 
                />
              </TabsContent>
              
              <TabsContent value="info" className="space-y-6 backdrop-blur-md bg-white/40 rounded-lg p-6 border border-white/50">
                <EducationSection onAddEducation={() => console.log("Add education clicked")} />
                <ExperienceSection onAddExperience={() => console.log("Add experience clicked")} />
                <ProfessionalLevelSection onSave={handleSaveChanges} />
                <SkillsToolsSection onSave={handleSaveChanges} />
              </TabsContent>
              
              <TabsContent value="organization" className="space-y-6 backdrop-blur-md bg-white/40 rounded-lg p-6 border border-white/50">
                <OrganizationSection />
              </TabsContent>
              
              <TabsContent value="history" className="space-y-6 backdrop-blur-md bg-white/40 rounded-lg p-6 border border-white/50">
                <SearchHistorySection />
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
        
        {/* Career Development Pathways Section */}
        <motion.section 
          className="mt-12 mb-16"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <h2 className="text-2xl font-semibold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Career Development Pathways</h2>
          <motion.div 
            className="flex justify-center mb-12"
            variants={staggerItem}
          >
            <div className="backdrop-blur-lg bg-white/30 border border-white/50 rounded-xl shadow-lg p-6 w-full max-w-4xl">
              <PathwayCards />
            </div>
          </motion.div>
        </motion.section>

        {/* Career Insights Section */}
        <motion.section 
          className="mb-16"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Career Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <motion.div 
              className="lg:col-span-2 backdrop-blur-lg bg-white/30 border border-white/50 rounded-xl shadow-lg p-6"
              variants={staggerItem}
            >
              <RecommendedCourses />
            </motion.div>
            <motion.div 
              className="backdrop-blur-lg bg-white/30 border border-white/50 rounded-xl shadow-lg p-6"
              variants={staggerItem}
            >
              <CareerProgressTracker />
            </motion.div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}