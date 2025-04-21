import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, PieChart, LineChart, Award, Layers, BarChart } from 'lucide-react';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
};

// AI-powered feature cards
const features = [
  {
    title: "Skill Gap Analysis",
    description: "Using SFIA 9 and DigComp 2.2 frameworks to identify critical skill gaps and development opportunities.",
    icon: <BarChart className="h-10 w-10" />,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "Career Pathway Planning",
    description: "AI-generated pathways aligned with your career goals, showing both university and non-university options.",
    icon: <LineChart className="h-10 w-10" />,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50"
  },
  {
    title: "Framework Mapping",
    description: "Advanced mapping of your skills to industry-standard frameworks for precise career positioning.",
    icon: <Layers className="h-10 w-10" />,
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50"
  },
  {
    title: "Location-Aware Recommendations",
    description: "Education and growth recommendations tailored to your specific location and regional opportunities.",
    icon: <PieChart className="h-10 w-10" />,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50"
  },
  {
    title: "Dual-Review Intelligence",
    description: "Two-stage AI analysis ensures accurate and comprehensive career insights and recommendations.",
    icon: <Brain className="h-10 w-10" />,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50"
  },
  {
    title: "Progression Tracking",
    description: "Monitor your skill development and career growth with intelligent progress tracking and insights.",
    icon: <Award className="h-10 w-10" />,
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50"
  }
];

export default function AiFeaturesSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50 to-white z-0"></div>
      
      <div className="container mx-auto relative z-10">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center px-4 py-1 rounded-full bg-indigo-100 text-indigo-700">
              <Sparkles className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">AI-Powered Features</span>
            </span>
          </div>
          <h2 className="font-bold text-3xl md:text-5xl mb-6">Advanced Career Intelligence</h2>
          <p className="text-lg text-neutral-600 md:text-xl">
            Our platform leverages cutting-edge AI technologies to provide you with the most accurate and personalized career guidance.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              variants={itemVariants}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className={`p-6 ${feature.bgColor}`}>
                <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
              
              {/* Animated accent at bottom */}
              <div className="h-1.5 w-full">
                <div className={`h-full w-full bg-gradient-to-r ${feature.color}`}></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* AI Badge */}
        <motion.div 
          className="mt-20 flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full py-3 px-6 text-white">
            <Brain className="h-5 w-5" />
            <span className="text-sm font-medium">Powered by GPT-4o | The latest OpenAI technology</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}