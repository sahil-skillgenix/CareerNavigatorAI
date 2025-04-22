import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  RecommendedCourses,
  CareerProgressTracker,
  SavedAnalyses
} from "@/components/dashboard";
import { AuthenticatedLayout } from "@/components/layouts";
import { Button } from "@/components/ui/button";
import { BarChart3, Rocket, Lightbulb, Plus } from "lucide-react";

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
        className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl py-8 px-6 max-w-7xl mx-auto shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl font-bold mb-4">Welcome, {user?.fullName || 'Skillgenix User'}!</h1>
            <p className="mb-4 text-gray-700">
              This is your personalized dashboard where you can track your career progress, 
              review your saved analyses, and discover recommended learning resources.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <a href="/career-pathway">
                <Button className="shadow-sm bg-primary hover:bg-primary/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Analysis
                </Button>
              </a>
              <a href="/my-details">
                <Button variant="outline" className="shadow-sm">
                  My Details
                </Button>
              </a>
            </div>
          </div>
          <div className="flex justify-center">
            <img 
              src="/src/assets/images/career-growth-ai.svg" 
              alt="Career Growth" 
              className="max-w-full h-48"
            />
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
      
      {/* Career Insights Section */}
      <motion.section 
        className="mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
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
          <a href="/learning-resources" className="block">
            <div className="bg-white border rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium mb-2">Learning Resources</h3>
              <p className="text-sm text-gray-600">
                Discover personalized learning resources based on your career goals and skills gap
              </p>
            </div>
          </a>
          <a href="/saved-resources" className="block">
            <div className="bg-white border rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium mb-2">Saved Resources</h3>
              <p className="text-sm text-gray-600">
                Access your bookmarked learning resources for easy reference
              </p>
            </div>
          </a>
          <a href="/search" className="block">
            <div className="bg-white border rounded-xl p-6 text-center hover:shadow-md transition-shadow">
              <h3 className="text-lg font-medium mb-2">Skills & Roles</h3>
              <p className="text-sm text-gray-600">
                Explore skills, roles and industries in our comprehensive database
              </p>
            </div>
          </a>
        </div>
      </motion.section>
    </AuthenticatedLayout>
  );
}