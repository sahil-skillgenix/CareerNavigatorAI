import Navbar from '@/components/navbar';
import HeroSection from '@/components/hero-section';
import FeaturesSection from '@/components/features-section';
import HowItWorksSection from '@/components/how-it-works-section';
import BenefitsSection from '@/components/benefits-section';
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
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
