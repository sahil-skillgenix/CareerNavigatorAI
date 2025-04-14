import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { PathwaySelector } from "@/components/onboarding/PathwaySelector";
import { motion } from "framer-motion";
import { AuthenticatedLayout } from "@/components/layouts";

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
    <AuthenticatedLayout title="Career Pathway">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PathwaySelector />
      </motion.div>
    </AuthenticatedLayout>
  );
}