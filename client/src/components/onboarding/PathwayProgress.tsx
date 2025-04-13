import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

interface PathwayProgressStepProps {
  title: string;
  description: string;
  completed: boolean;
  isLast?: boolean;
  delayFactor?: number;
}

const PathwayProgressStep = ({ 
  title, 
  description, 
  completed, 
  isLast = false,
  delayFactor = 0
}: PathwayProgressStepProps) => {
  return (
    <div className="flex items-start">
      <div className="relative">
        <motion.div
          className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
            completed 
              ? "bg-primary text-white" 
              : "bg-gray-100 border border-gray-200 text-gray-400"
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 + (delayFactor * 0.2), type: "spring" }}
        >
          {completed ? <Check className="h-4 w-4" /> : null}
        </motion.div>
        
        {!isLast && (
          <motion.div 
            className={`absolute top-8 left-1/2 w-0.5 h-16 -translate-x-1/2 ${
              completed ? "bg-primary" : "bg-gray-200"
            }`}
            initial={{ height: 0 }}
            animate={{ height: 64 }}
            transition={{ delay: 0.4 + (delayFactor * 0.2) }}
          />
        )}
      </div>
      
      <motion.div 
        className="ml-4 mb-16"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 + (delayFactor * 0.2) }}
      >
        <h3 className={`font-medium text-base ${completed ? "text-primary" : "text-gray-700"}`}>
          {title}
        </h3>
        <p className="text-sm text-gray-500 mt-1 max-w-xs">
          {description}
        </p>
      </motion.div>
    </div>
  );
};

export function PathwayProgress() {
  const [activeSteps, setActiveSteps] = useState<number[]>([]);
  
  const steps = [
    {
      title: "Skills Assessment",
      description: "Evaluate your current skills and competencies."
    },
    {
      title: "Career Goals Definition",
      description: "Set your short and long-term career objectives."
    },
    {
      title: "Pathway Selection",
      description: "Choose between personal or organization-based career paths."
    },
    {
      title: "Growth Plan",
      description: "Review your personalized development roadmap."
    }
  ];
  
  // Animate steps becoming active one by one
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    
    for (let i = 0; i < steps.length; i++) {
      const interval = setTimeout(() => {
        setActiveSteps(prev => [...prev, i]);
      }, 1000 + (i * 1500));
      
      intervals.push(interval);
    }
    
    return () => intervals.forEach(interval => clearTimeout(interval));
  }, []);
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-lg font-semibold mb-6 flex items-center">
        <span className="mr-2">Your Career Pathway Journey</span>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <ArrowRight className="h-5 w-5 text-primary" />
        </motion.div>
      </h2>
      
      <div className="pl-2">
        {steps.map((step, index) => (
          <PathwayProgressStep
            key={index}
            title={step.title}
            description={step.description}
            completed={activeSteps.includes(index)}
            isLast={index === steps.length - 1}
            delayFactor={index}
          />
        ))}
      </div>
    </div>
  );
}