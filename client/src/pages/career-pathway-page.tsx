import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { PathwaySelector } from "@/components/onboarding/PathwaySelector";
import { motion } from "framer-motion";
import { Navigation, DashboardHeader } from "@/components/dashboard";

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
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-10">
        <Navigation />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-6"
        >
          <PathwaySelector />
        </motion.div>
      </main>
    </div>
  );
}