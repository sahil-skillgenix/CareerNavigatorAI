import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  RecommendedCourses,
  CareerProgressTracker,
  DashboardHeader,
  Navigation,
  PathwayCards
} from "@/components/dashboard";

export default function NewDashboardPage() {
  const { user } = useAuth();
  
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
          <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
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