import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Animation variants
const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.8, delay: 0.3 }
  }
};

export default function ProfessionalHeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center bg-white overflow-hidden">
      {/* Professional grid background */}
      <div className="absolute inset-0 bg-grid-professional opacity-[0.03] z-0"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={textVariants}
            >
              <h1 className="font-sans font-semibold text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight mb-6 text-[#1c3b82]">
                Chart Your Perfect
                <span className="block mt-2 mb-2">Career Path</span>
                <span className="block">With AI</span>
              </h1>
              <p className="text-lg text-gray-600 mb-10 max-w-xl font-sans leading-relaxed">
                Leverage AI technology to map your professional journey, identify skill gaps, and create a personalized pathway to achieve your career aspirations.
              </p>
            </motion.div>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              variants={fadeInVariants}
              initial="hidden"
              animate="visible"
            >
              <Link href="/auth">
                <Button 
                  size="lg"
                  className="px-6 py-5 text-base bg-[#1c3b82] hover:bg-[#152d63] text-white font-medium"
                >
                  Start Your Journey
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-6 py-5 text-base border-[#1c3b82] text-[#1c3b82] hover:bg-[#f5f7fa] font-medium"
                >
                  Learn More
                </Button>
              </Link>
            </motion.div>
            
            <motion.div 
              className="mt-12 flex items-center"
              variants={fadeInVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="bg-[#f5f7fa] px-5 py-4 rounded border border-[#e4e9f2]">
                <p className="text-sm font-medium text-gray-700">Used by <span className="font-semibold text-[#1c3b82]">5,000+</span> professionals across government and private sectors</p>
              </div>
            </motion.div>
          </div>
          
          <div className="lg:col-span-6">
            <motion.div
              className="relative"
              variants={fadeInVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Professional career path visualization */}
              <div className="relative">
                <div className="bg-white p-5 rounded-lg border border-[#e4e9f2] shadow-sm">
                  <div className="aspect-[4/3] bg-[#f5f7fa] rounded-md overflow-hidden relative">
                    {/* Career Path Graph */}
                    <svg 
                      viewBox="0 0 400 300" 
                      className="w-full h-full"
                    >
                      {/* Background Grid */}
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(28, 59, 130, 0.1)" strokeWidth="1"/>
                      </pattern>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {/* Career Path */}
                      <motion.path 
                        d="M 40,260 C 70,230 100,240 130,200 S 160,150 190,140 S 240,130 270,100 S 330,50 360,30" 
                        fill="none"
                        stroke="#1c3b82"
                        strokeWidth="3"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                      />
                      
                      {/* Milestones */}
                      <motion.circle 
                        cx="40" cy="260" r="6" 
                        fill="#1c3b82"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                      />
                      <motion.circle 
                        cx="130" cy="200" r="6" 
                        fill="#1c3b82"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.1, duration: 0.5 }}
                      />
                      <motion.circle 
                        cx="190" cy="140" r="6" 
                        fill="#1c3b82"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                      />
                      <motion.circle 
                        cx="270" cy="100" r="6" 
                        fill="#1c3b82"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.9, duration: 0.5 }}
                      />
                      <motion.circle 
                        cx="360" cy="30" r="6" 
                        fill="#1c3b82"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.3, duration: 0.5 }}
                      />
                      
                      {/* Labels */}
                      <motion.text 
                        x="40" y="280" 
                        fontSize="10" 
                        fill="#4b5563" 
                        textAnchor="middle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                      >
                        Entry
                      </motion.text>
                      <motion.text 
                        x="130" y="220" 
                        fontSize="10" 
                        fill="#4b5563" 
                        textAnchor="middle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                      >
                        Junior
                      </motion.text>
                      <motion.text 
                        x="190" y="160" 
                        fontSize="10" 
                        fill="#4b5563" 
                        textAnchor="middle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.6, duration: 0.5 }}
                      >
                        Mid-level
                      </motion.text>
                      <motion.text 
                        x="270" y="120" 
                        fontSize="10" 
                        fill="#4b5563" 
                        textAnchor="middle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.0, duration: 0.5 }}
                      >
                        Senior
                      </motion.text>
                      <motion.text 
                        x="360" y="50" 
                        fontSize="10" 
                        fill="#4b5563" 
                        textAnchor="middle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.4, duration: 0.5 }}
                      >
                        Leadership
                      </motion.text>
                    </svg>
                    
                    {/* Title overlay */}
                    <div className="absolute top-4 left-4 bg-white rounded-md p-3 shadow-sm border border-[#e4e9f2]">
                      <h3 className="text-base font-semibold text-[#1c3b82]">Your AI-Generated Career Path</h3>
                      <p className="text-xs text-gray-600">Customized career progression with milestones</p>
                    </div>
                  </div>
                  
                  {/* Controls/Features - Simple, professional layout */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="bg-[#f5f7fa] p-3 rounded border border-[#e4e9f2] text-center">
                      <p className="text-xs font-medium text-[#1c3b82]">Skill Analysis</p>
                    </div>
                    <div className="bg-[#f5f7fa] p-3 rounded border border-[#e4e9f2] text-center">
                      <p className="text-xs font-medium text-[#1c3b82]">Development Plan</p>
                    </div>
                    <div className="bg-[#f5f7fa] p-3 rounded border border-[#e4e9f2] text-center">
                      <p className="text-xs font-medium text-[#1c3b82]">Progress Tracking</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}