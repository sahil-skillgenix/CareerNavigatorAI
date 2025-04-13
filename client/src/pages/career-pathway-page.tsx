import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { PathwaySelector } from "@/components/onboarding/PathwaySelector";
import { OnboardingTutorial } from "@/components/onboarding/OnboardingTutorial";
import { motion } from "framer-motion";

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
      <header className="bg-white border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <h1 className="font-bold text-xl text-primary">Career Pathway Selection</h1>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <a href="/" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="#" className="text-sm font-medium text-primary">
                  Pathway Selection
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Resources
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PathwaySelector />
        </motion.div>
      </main>
      
      {/* Add the onboarding tutorial component */}
      <OnboardingTutorial />
    </div>
  );
}