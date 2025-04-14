import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { AuthenticatedLayout } from "@/components/layouts";
import { Card, CardContent } from "@/components/ui/card";
import { User, BookOpen, Award, BarChart } from "lucide-react";
import { CareerPathwayForm } from "@/components/career-pathway/CareerPathwayForm";

export default function CareerPathwayPage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!user) {
      setLocation("/auth");
    }
  }, [user, setLocation]);
  
  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  return (
    <AuthenticatedLayout title="Personal Career Pathway" subtitle="Plan your personal career journey based on your skills and aspirations">
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6"
        >
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-white p-4 rounded-full shadow-md">
              <User className="h-12 w-12 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-blue-800 mb-2">Your Personal Career Journey</h2>
              <p className="text-blue-700">
                This tool analyzes your skills, experience, and career goals to create a personalized development pathway.
                It uses both SFIA 9 and DigComp 2.2 frameworks to provide comprehensive recommendations.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-start">
                  <Award className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <strong>Skill Assessment</strong>
                    <p>Maps your current skills to industry frameworks</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <BarChart className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <strong>Gap Analysis</strong>
                    <p>Identifies skill gaps for your desired career path</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <BookOpen className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <strong>Learning Recommendations</strong>
                    <p>Suggests specific education and certifications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CareerPathwayForm />
        </motion.div>
      </div>
    </AuthenticatedLayout>
  );
}