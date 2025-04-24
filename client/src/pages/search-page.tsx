import React from 'react';
import Navbar from '@/components/navbar-fixed';
import Footer from '@/components/footer';
import SkillRoleIndustrySearch from '@/components/search/SkillRoleIndustrySearch';
import { useEffect } from 'react';

export default function SearchPage() {
  useEffect(() => {
    // Set page title
    document.title = 'Search Skills, Roles & Industries | Skillgenix';
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-center text-[#1c3b82] mb-8">
            Explore Career Components
          </h1>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
            Search our comprehensive database of skills, roles, and industries to discover 
            relationships between them and plan your career development journey.
          </p>
          <SkillRoleIndustrySearch />
        </div>
      </main>
      <Footer />
    </div>
  );
}