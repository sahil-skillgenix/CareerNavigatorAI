/**
 * Structured Pathway Page
 * 
 * This page provides access to the structured report generation with proper
 * section ordering and consistent naming across all 11 sections.
 */

import { useAuth } from "@/hooks/use-auth";
import { StructuredCareerPathwayForm } from "@/components/career-pathway/StructuredCareerPathwayForm";
import { AuthenticatedLayout } from "@/components/layouts";
import { Redirect } from "wouter";

function StructuredPathwayContent() {
  const { user } = useAuth();
  
  // Redirect if not authenticated
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  return (
    <AuthenticatedLayout>
      <StructuredCareerPathwayForm />
    </AuthenticatedLayout>
  );
}

export default function StructuredPathwayPage() {
  return (
    <StructuredPathwayContent />
  );
}