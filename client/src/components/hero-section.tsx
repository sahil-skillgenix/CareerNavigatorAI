import { motion } from 'framer-motion';
import { ButtonHighlighted } from './ui/button-highlighted';
import { Play } from 'lucide-react';

export default function HeroSection() {
  return (
    <section 
      className="pt-32 pb-20 md:pt-40 md:pb-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-neutral-50 to-white overflow-hidden" 
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
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Career Path</span>
              <br />With AI
            </h1>
            <p className="text-lg md:text-xl text-gray-700/80 mb-8 max-w-xl">
              Leverage the power of OpenAI technology to map your professional journey, identify skills gaps, and achieve your career aspirations with personalized guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <ButtonHighlighted variant="default" size="lg">
                Start Your Journey
              </ButtonHighlighted>
              <ButtonHighlighted variant="outline" size="lg">
                <Play className="mr-2 h-4 w-4" /> Watch Demo
              </ButtonHighlighted>
            </div>
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs">
                  👩‍💼
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs">
                  👨‍💻
                </div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs">
                  👩‍🎓
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-700/70">Joined by <span className="font-medium text-gray-800">5,000+</span> professionals</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="bg-white p-3 rounded-2xl shadow-xl">
              <div className="w-full h-auto rounded-xl bg-gray-200 aspect-[4/3] flex items-center justify-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
                </svg>
              </div>
            </div>
            <div className="absolute -top-12 -right-12 z-[-1] bg-blue-200/20 rounded-full w-40 h-40 blur-3xl"></div>
            <div className="absolute -bottom-12 -left-12 z-[-1] bg-purple-200/20 rounded-full w-40 h-40 blur-3xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
