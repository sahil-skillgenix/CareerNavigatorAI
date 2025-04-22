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
      {/* Welcome Message */}
      <section className="mb-12 bg-blue-50 rounded-xl py-8 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl font-bold mb-4">Welcome, {user?.fullName || 'Skillgenix User'}!</h1>
            <p className="mb-4 text-gray-700">
              This is your personalized dashboard where you can track your career progress, 
              review your saved analyses, and discover recommended learning resources.
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Tip:</span> For a more detailed view of your profile and personal information, 
              check the <a href="/my-details" className="text-primary underline">My Details</a> page.
            </p>
          </div>
          <div className="flex justify-center">
            <img 
              src="/src/assets/images/career-growth-ai.svg" 
              alt="Career Growth" 
              className="max-w-full h-48"
            />
          </div>
        </div>
      </section>
      
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