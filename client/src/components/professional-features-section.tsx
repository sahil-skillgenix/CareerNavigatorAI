import React from 'react';
import { motion } from 'framer-motion';
import { ChartBar, Brain, Layers, GraduationCap, LineChart, MapPin } from 'lucide-react';

// Features
const features = [
  {
    title: "Skill Gap Analysis",
    description: "Using SFIA 9 and DigComp 2.2 frameworks to identify critical skill gaps and development opportunities.",
    icon: <ChartBar className="h-6 w-6" />
  },
  {
    title: "Career Pathway Planning",
    description: "AI-generated pathways aligned with your career goals, showing both university and non-university options.",
    icon: <LineChart className="h-6 w-6" />
  },
  {
    title: "Framework Mapping",
    description: "Advanced mapping of your skills to industry-standard frameworks for precise career positioning.",
    icon: <Layers className="h-6 w-6" />
  },
  {
    title: "Location-Aware Recommendations",
    description: "Education and growth recommendations tailored to your specific location and regional opportunities.",
    icon: <MapPin className="h-6 w-6" />
  },
  {
    title: "AI-Powered Analysis",
    description: "Two-stage AI analysis ensures accurate and comprehensive career insights and recommendations.",
    icon: <Brain className="h-6 w-6" />
  },
  {
    title: "Professional Development",
    description: "Monitor your skill development and career growth with intelligent progress tracking and insights.",
    icon: <GraduationCap className="h-6 w-6" />
  }
];

export default function ProfessionalFeaturesSection() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#f5f7fa]">
      <div className="container mx-auto">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-block mb-4 px-4 py-1 bg-[#e4e9f2] rounded-full">
            <span className="text-sm font-medium text-[#1c3b82]">AI-Powered Features</span>
          </div>
          <h2 className="font-semibold text-3xl mb-4 text-[#1c3b82]">Advanced Career Intelligence</h2>
          <p className="text-gray-600 text-lg">
            Our platform leverages cutting-edge AI technologies to provide you with the most accurate and personalized career guidance.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-md border border-[#e4e9f2] shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="w-12 h-12 flex items-center justify-center rounded-md bg-[#f5f7fa] text-[#1c3b82] mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#1c3b82] mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* AI Badge */}
        <motion.div 
          className="mt-16 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 bg-[#1c3b82] rounded-full py-2 px-4 text-white">
            <Brain className="h-4 w-4" />
            <span className="text-sm font-medium">Powered by GPT-4o | The latest OpenAI technology</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}