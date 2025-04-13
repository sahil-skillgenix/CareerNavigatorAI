import { motion } from 'framer-motion';
import { ButtonHighlighted } from './ui/button-highlighted';
import profileCreationSvg from '@/assets/images/profile-creation.svg';
import skillsAssessmentSvg from '@/assets/images/skills-assessment.svg';
import pathGenerationSvg from '@/assets/images/path-generation.svg';
import continuousGrowthSvg from '@/assets/images/continuous-growth.svg';

const steps = [
  {
    number: "01",
    title: "Profile Creation",
    description: "Build your professional profile by importing your resume, LinkedIn profile, or entering your details manually. Our AI analyzes your background to understand your career journey.",
    image: profileCreationSvg,
    color: "bg-primary-dark",
  },
  {
    number: "02",
    title: "Skills Assessment",
    description: "Complete comprehensive assessments based on SFIA 9 and DigComp 2.2 frameworks to identify your current skill levels and competencies across various domains.",
    image: skillsAssessmentSvg,
    color: "bg-secondary-dark",
  },
  {
    number: "03",
    title: "Path Generation",
    description: "Our AI analyzes thousands of career trajectories to generate personalized career path options aligned with your goals, interests, and current skills profile.",
    image: pathGenerationSvg,
    color: "bg-primary-dark",
  },
  {
    number: "04",
    title: "Continuous Growth",
    description: "Track your progress, access recommended learning resources, and receive regular updates as you develop new skills and approach career milestones.",
    image: continuousGrowthSvg,
    color: "bg-secondary-dark",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-neutral-50" id="how-it-works">
      <div className="container mx-auto">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-bold text-3xl md:text-5xl mb-6">How CareerPathAI Works</h2>
          <p className="text-lg text-neutral-600 md:text-xl max-w-2xl mx-auto">
            Our platform uses advanced AI to create personalized career development plans in just a few simple steps.
          </p>
        </motion.div>
        
        <div className="grid gap-24">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              {/* Text side - Always on left for mobile, alternating for desktop */}
              <div className={`order-2 ${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                <div className="flex items-center mb-4">
                  <div className={`w-14 h-14 rounded-full ${step.color} flex items-center justify-center text-white font-medium text-lg`}>
                    {step.number}
                  </div>
                  <div className="h-px w-16 bg-gradient-to-r from-neutral-300 to-neutral-200 ml-4"></div>
                </div>
                
                <h3 className="font-bold text-2xl md:text-3xl mb-4">{step.title}</h3>
                <p className="text-neutral-600 text-lg mb-8 max-w-xl">
                  {step.description}
                </p>
                
                <div className="inline-flex items-center font-medium text-primary-dark cursor-pointer group">
                  <span>Learn more</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
              
              {/* Image side - Always on right for mobile, alternating for desktop */}
              <div className={`order-1 ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'} flex justify-center`}>
                <div className="relative w-full max-w-md">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary-light/20 to-secondary-light/20 transform rotate-3 scale-105 blur-sm"></div>
                  <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden">
                    <img 
                      src={step.image} 
                      alt={step.title} 
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <ButtonHighlighted variant="default" size="lg" className="px-10 py-6 text-lg">
            Start Your Career Journey
          </ButtonHighlighted>
        </motion.div>
      </div>
    </section>
  );
}
