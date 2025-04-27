import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  RecommendedCourses,
  CareerProgressTracker,
  SavedAnalyses,
  BadgeCard,
  SkillJourneyTracker
} from "@/components/dashboard";
import { AuthenticatedLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { BarChart3, Rocket, Lightbulb, Plus, Trophy } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Fetch dashboard data
  const { data: dashboardData, isLoading, error } = useQuery({
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
    <AuthenticatedLayout title="Dashboard">
      {/* Welcome Message */}
      <motion.section 
        className="mb-12 max-w-7xl mx-auto relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="rounded-xl bg-gradient-to-r from-blue-600/10 via-indigo-500/10 to-purple-500/10 p-0.5">
          <div className="bg-white rounded-[calc(0.75rem-1px)] p-8 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-100 rounded-full opacity-70 blur-xl"></div>
            <div className="absolute top-12 -left-12 w-32 h-32 bg-indigo-100 rounded-full opacity-60 blur-xl"></div>
            
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-700 bg-clip-text text-transparent">
                Welcome, {user?.fullName || 'Skillgenix User'}!
              </h1>
              
              <p className="text-gray-600 max-w-3xl text-base md:text-lg">
                This is your personalized dashboard where you can track your career progress, 
                review your saved analyses, and discover recommended learning resources.
              </p>
            </div>
          </div>
        </div>
      </motion.section>
      
      {/* Career History Section */}
      <motion.section 
        className="mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold mb-8 text-center flex items-center justify-center">
          <BarChart3 className="mr-2 h-6 w-6 text-primary" />
          Your Career Analyses
        </h2>
        <div className="max-w-7xl mx-auto">
          <SavedAnalyses />
        </div>
      </motion.section>
      
      {/* Achievements & Gamification Section */}
      <motion.section 
        className="mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold mb-8 text-center flex items-center justify-center">
          <Trophy className="mr-2 h-6 w-6 text-primary" />
          Your Achievements & Journey
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          <BadgeCard 
            badges={dashboardData?.badges || []} 
            isLoading={isLoading}
          />
          <SkillJourneyTracker 
            progressItems={dashboardData?.progressItems || []} 
            isLoading={isLoading}
          />
        </div>
      </motion.section>
      
      {/* Career Insights Section */}
      <motion.section 
        className="mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold mb-8 text-center flex items-center justify-center">
          <Lightbulb className="mr-2 h-6 w-6 text-primary" />
          Career Insights & Progress
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="lg:col-span-2">
            <RecommendedCourses />
          </div>
          <div>
            <CareerProgressTracker />
          </div>
        </div>
      </motion.section>
      
      {/* Quick Links Section */}
      <motion.section 
        className="mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <h2 className="text-2xl font-semibold mb-8 text-center flex items-center justify-center">
          <Rocket className="mr-2 h-6 w-6 text-primary" />
          Quick Links
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Link href="/learning-resources" className="block">
            <div className="bg-white border rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium mb-2">Learning Resources</h3>
              <p className="text-sm text-gray-600">
                Discover personalized learning resources based on your career goals and skills gap
              </p>
            </div>
          </Link>
          <Link href="/saved-resources" className="block">
            <div className="bg-white border rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium mb-2">Saved Resources</h3>
              <p className="text-sm text-gray-600">
                Access your bookmarked learning resources for easy reference
              </p>
            </div>
          </Link>
          <Link href="/search" className="block">
            <div className="bg-white border rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium mb-2">Skills & Roles</h3>
              <p className="text-sm text-gray-600">
                Explore skills, roles and industries in our comprehensive database
              </p>
            </div>
          </Link>
        </div>
      </motion.section>
    </AuthenticatedLayout>
  );
}