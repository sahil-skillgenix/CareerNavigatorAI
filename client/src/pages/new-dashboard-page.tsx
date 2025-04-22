import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  RecommendedCourses,
  CareerProgressTracker,
  SavedAnalyses
} from "@/components/dashboard";
import { AuthenticatedLayout } from "@/components/layouts";

export default function NewDashboardPage() {
  const { user } = useAuth();
  
  return (
    <AuthenticatedLayout title="Dashboard">
      {/* Career History Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-8 text-center">Your Career Analyses</h2>
        <div className="max-w-7xl mx-auto">
          <SavedAnalyses />
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
    </AuthenticatedLayout>
  );
}