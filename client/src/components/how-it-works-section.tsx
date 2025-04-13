import { motion } from 'framer-motion';
import { ButtonHighlighted } from './ui/button-highlighted';

const steps = [
  {
    number: 1,
    title: "Profile Creation",
    description: "Build your professional profile by importing your resume, LinkedIn profile, or entering your details manually. Our AI analyzes your background to understand your career journey.",
    imageAlign: "right", // Image is on the right side
  },
  {
    number: 2,
    title: "Skills Assessment",
    description: "Complete comprehensive assessments based on SFIA 9 and DigComp 2.2 frameworks to identify your current skill levels and competencies across various domains.",
    imageAlign: "left", // Image is on the left side
  },
  {
    number: 3,
    title: "Path Generation",
    description: "Our AI analyzes thousands of career trajectories to generate personalized career path options aligned with your goals, interests, and current skills profile.",
    imageAlign: "right", // Image is on the right side
  },
  {
    number: 4,
    title: "Continuous Growth",
    description: "Track your progress, access recommended learning resources, and receive regular updates as you develop new skills and approach career milestones.",
    imageAlign: "left", // Image is on the left side
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8" id="how-it-works">
      <div className="container mx-auto">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-bold text-3xl md:text-4xl mb-4">How CareerPathAI Works</h2>
          <p className="text-lg text-gray-700/70">Our platform uses advanced AI to create personalized career development plans in just a few simple steps.</p>
        </motion.div>
        
        <div className="relative py-10">
          {/* Career path vertical line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary to-secondary top-0 hidden md:block"></div>
          
          {/* For mobile view */}
          <div className="absolute left-6 md:left-auto h-full w-0.5 bg-gradient-to-b from-primary to-secondary top-0 md:hidden"></div>
          
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className={`flex flex-col ${step.imageAlign === 'right' ? 'md:flex-row' : 'md:flex-row-reverse'} md:items-center mb-16 relative`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className={`md:w-1/2 ${step.imageAlign === 'right' ? 'md:pr-12 md:text-right' : 'md:pl-12'} order-2 ${step.imageAlign === 'right' ? 'md:order-1' : 'md:order-2'}`}>
                <div className="bg-white rounded-xl shadow-md p-8 inline-block">
                  <h3 className="font-semibold text-xl mb-3">{step.number}. {step.title}</h3>
                  <p className="text-gray-700/70">{step.description}</p>
                </div>
              </div>
              
              <div className={`md:w-1/2 flex ${step.imageAlign === 'right' ? 'justify-center md:justify-start' : 'justify-center md:justify-end'} items-center order-1 ${step.imageAlign === 'right' ? 'md:order-2' : 'md:order-1'} mb-8 md:mb-0`}>
                <div className="relative z-10 w-10 h-10 rounded-full bg-primary-dark flex items-center justify-center text-white font-semibold shadow-lg">
                  {step.number}
                </div>
                <div className={`bg-white p-2 rounded-xl shadow-md ${step.imageAlign === 'right' ? 'ml-8' : 'mr-8'}`}>
                  <div className="w-full max-w-xs rounded-lg bg-gray-200 aspect-[4/3] flex items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ButtonHighlighted variant="default" size="lg">
            Start Your Career Journey
          </ButtonHighlighted>
        </motion.div>
      </div>
    </section>
  );
}
