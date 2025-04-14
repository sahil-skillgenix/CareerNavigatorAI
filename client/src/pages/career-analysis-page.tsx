import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { CareerPathwayForm } from "@/components/career-pathway/CareerPathwayForm";
import { motion } from "framer-motion";
import { Navigation } from "@/components/dashboard";

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
      <header className="bg-white border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <motion.h1 
            className="font-bold text-xl text-primary"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Personal Career Analysis
          </motion.h1>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a href="/" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/dashboard" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/career-pathway" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Career Pathway
                </a>
              </li>
              <li>
                <a href="#" className="text-sm font-medium text-primary">
                  Pathway Analysis
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <CareerPathwayForm />
      </main>
    </div>
  );
}