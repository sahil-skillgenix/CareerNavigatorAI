import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  LineChart, 
  Layers, 
  GraduationCap, 
  Star
} from 'lucide-react';

// Journey steps with detailed information
const journeySteps = [
  {
    id: 1,
    title: "Define Your Aspirations",
    description: "Tell us your current role and where you want to be. Our AI analyzes your goals to understand your desired career direction.",
    icon: <User className="w-5 h-5" />
  },
  {
    id: 2,
    title: "Assess Your Skills",
    description: "Our platform maps your current skills using the SFIA 9 and DigComp 2.2 frameworks to identify strengths and growth areas.",
    icon: <Layers className="w-5 h-5" />
  },
  {
    id: 3,
    title: "Generate Your Pathway",
    description: "Watch as AI creates personalized career pathways with professional and educational milestones tailored to your objectives.",
    icon: <LineChart className="w-5 h-5" />
  },
  {
    id: 4,
    title: "Bridge Skill Gaps",
    description: "Receive actionable learning plans and resources to develop the skills needed for your desired role, with location-specific recommendations.",
    icon: <GraduationCap className="w-5 h-5" />
  },
  {
    id: 5,
    title: "Achieve Career Success",
    description: "Track your progress as you move forward, with AI continually adapting your pathway as you grow and achieve new milestones.",
    icon: <Star className="w-5 h-5" />
  }
];

export default function ProfessionalJourneySection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="container mx-auto">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-semibold text-3xl mb-4 text-[#1c3b82]">Your Career Evolution Journey</h2>
          <p className="text-gray-600 text-lg">
            Follow these simple steps to transform your career aspirations into a concrete, actionable pathway toward success.
          </p>
        </motion.div>
        
        <div className="relative">
          {/* Journey path with steps */}
          <div className="relative z-10 max-w-4xl mx-auto">
            {/* Vertical connecting line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-[#e4e9f2] hidden md:block"></div>
            
            {/* Journey Steps */}
            {journeySteps.map((step, index) => (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative flex mb-12 last:mb-0"
              >
                {/* Step Icon */}
                <div className="relative z-10 mr-6 md:mr-12">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white border-2 border-[#1c3b82] text-[#1c3b82]">
                    <div className="text-lg font-bold">{step.id}</div>
                  </div>
                </div>
                
                {/* Step Content */}
                <div className="flex-1">
                  <div className="bg-white p-6 rounded-md border border-[#e4e9f2] shadow-sm">
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 flex items-center justify-center rounded-md bg-[#f5f7fa] text-[#1c3b82] mr-4">
                        {step.icon}
                      </div>
                      <h3 className="font-semibold text-xl text-[#1c3b82]">{step.title}</h3>
                    </div>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Final step button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex justify-center mt-8"
            >
              <button className="bg-[#1c3b82] hover:bg-[#152d63] text-white px-6 py-3 rounded-md font-medium transition-colors">
                Begin Your Journey
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}