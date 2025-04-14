import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  RecommendedCourses,
  CareerProgressTracker
} from "@/components/dashboard";
import { AuthenticatedLayout } from "@/components/layouts";

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
    <AuthenticatedLayout title="Dashboard">
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
    </AuthenticatedLayout>
  );
}