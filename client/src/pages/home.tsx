import Navbar from '@/components/navbar';
import NewHeroSection from '@/components/new-hero-section';
import AnimatedJourneySection from '@/components/animated-journey-section';
import CareerSearchSection from '@/components/career-search-section';
import AiFeaturesSection from '@/components/ai-features-section';
import TestimonialsSection from '@/components/testimonials-section';
import CtaSection from '@/components/cta-section';
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
        <NewHeroSection />
        <AiFeaturesSection />
        <AnimatedJourneySection />
        <CareerSearchSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
