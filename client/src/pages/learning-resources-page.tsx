import React from "react";
import { LearningResourcesForm } from "@/components/learning-resources/LearningResourcesForm";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { AuthenticatedLayout } from "@/components/layouts/AuthenticatedLayout";

export default function LearningResourcesPage() {
  const { user, isLoading } = useAuth();

  // If the user is not authenticated, redirect to the auth page
  if (!isLoading && !user) {
    return <Redirect to="/auth" />;
  }

  return (
    <AuthenticatedLayout 
      title="Learning Resources" 
      subtitle="Discover personalized learning resources to help you achieve your career goals."
    >
      <LearningResourcesForm />
    </AuthenticatedLayout>
  );
}