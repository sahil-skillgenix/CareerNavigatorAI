import React from "react";
import { LearningResourcesForm } from "@/components/learning-resources/LearningResourcesForm";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { DashboardHeader, Navigation } from "@/components/dashboard";

export default function LearningResourcesPage() {
  const { user, isLoading } = useAuth();

  // If the user is not authenticated, redirect to the auth page
  if (!isLoading && !user) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        <Navigation />
        
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Learning Resources</h1>
          <p className="text-lg text-gray-500">
            Discover personalized learning resources to help you achieve your career goals.
          </p>
        </div>

        <LearningResourcesForm />
      </main>
    </div>
  );
}