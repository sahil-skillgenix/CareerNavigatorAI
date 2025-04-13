import { motion } from 'framer-motion';
import { ButtonHighlighted } from './ui/button-highlighted';
import { Play } from 'lucide-react';
import { Link } from 'wouter';
import careerGrowthAiSvg from '@/assets/images/career-growth-ai.svg';

export default function HeroSection() {
  return (
    <section 
      className="pt-32 pb-20 md:pt-40 md:pb-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-light/10 to-secondary-light/10 overflow-hidden" 
      id="hero"
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
              Chart Your Perfect<br />
              <span className="bg-gradient-to-r from-primary-dark to-secondary-dark bg-clip-text text-transparent">Career Path</span>
              <br />With AI
            </h1>
            <p className="text-lg md:text-xl text-neutral-600 mb-8 max-w-xl">
              Leverage the power of OpenAI technology to map your professional journey, identify skills gaps, and achieve your career aspirations with personalized AI guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth">
                <ButtonHighlighted variant="default" size="lg" className="px-8 py-6 text-lg">
                  Start Your Journey
                </ButtonHighlighted>
              </Link>
              <ButtonHighlighted variant="outline" size="lg" className="px-8 py-6 text-lg">
                <Play className="mr-2 h-5 w-5" /> Watch Demo
              </ButtonHighlighted>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-primary-light/30 flex items-center justify-center text-xs">
                  👩‍💼
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-secondary-light/30 flex items-center justify-center text-xs">
                  👨‍💻
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-primary-light/30 flex items-center justify-center text-xs">
                  👩‍🎓
                </div>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Joined by <span className="font-medium text-neutral-800">5,000+</span> professionals</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-light/20 to-secondary-light/20 transform rotate-3 scale-105 blur-sm"></div>
              <div className="relative bg-white p-4 rounded-2xl shadow-xl overflow-hidden">
                <img 
                  src={careerGrowthAiSvg} 
                  alt="AI-Powered Career Growth Paths" 
                  className="w-full h-auto rounded-xl"
                />
              </div>
            </div>
            <div className="absolute -top-12 -right-12 z-[-1] bg-primary-light/30 rounded-full w-40 h-40 blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 z-[-1] bg-secondary-light/30 rounded-full w-40 h-40 blur-3xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
