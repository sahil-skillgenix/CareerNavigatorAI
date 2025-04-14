import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { CareerPathwayForm } from "@/components/career-pathway/CareerPathwayForm";
import { motion } from "framer-motion";
import { Navigation, DashboardHeader } from "@/components/dashboard";

export default function CareerAnalysisPage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Redirect to auth page if not logged in
  useEffect(() => {
    if (!user) {
      setLocation("/auth");
    }
  }, [user, setLocation]);
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        <Navigation />
        
        <div className="mt-6">
          <CareerPathwayForm />
        </div>
      </main>
    </div>
  );
}