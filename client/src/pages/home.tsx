import Navbar from '@/components/navbar-fixed';
import ProfessionalHeroSection from '@/components/professional-hero-section';
import ProfessionalJourneySection from '@/components/professional-journey-section';
import ProfessionalSearchSection from '@/components/professional-search-section';
import ProfessionalFeaturesSection from '@/components/professional-features-section';
import TestimonialsSection from '@/components/testimonials-section';
import Footer from '@/components/footer';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Set page title
    document.title = 'Skillgenix - AI-Powered Career Development Platform';
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <ProfessionalHeroSection />
        <ProfessionalFeaturesSection />
        <ProfessionalJourneySection />
        <ProfessionalSearchSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}
