import React, { ReactNode } from "react";
import { DashboardHeader, Navigation } from "@/components/dashboard";

interface AuthenticatedLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthenticatedLayout({ 
  children, 
  title, 
  subtitle 
}: AuthenticatedLayoutProps) {
  return (
    <div className="bg-gray-50">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        <Navigation />
        
        {(title || subtitle) && (
          <div className="mb-8">
            {title && <h1 className="text-2xl font-bold mb-2">{title}</h1>}
            {subtitle && <p className="text-lg text-gray-500">{subtitle}</p>}
          </div>
        )}
        
        {children}
      </main>
    </div>
  );
}