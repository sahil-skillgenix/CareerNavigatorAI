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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Learning Resources</h1>
          <p className="text-xl text-gray-500 mt-2">
            Discover personalized learning resources to help you achieve your career goals.
          </p>
        </div>

        <LearningResourcesForm />
      </div>
    </div>
  );
}