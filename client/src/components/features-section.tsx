import { motion } from 'framer-motion';
import { ArrowRight, Brain, Route, ChartLine, ClipboardCheck, GraduationCap, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: <Brain className="text-2xl text-primary-dark" />,
    title: "AI-Driven Career Planning",
    description: "Leverage machine learning algorithms to identify optimal career paths based on your experience, skills, and aspirations.",
    bgColor: "bg-primary-light/30",
  },
  {
    icon: <Route className="text-2xl text-secondary-dark" />,
    title: "Personalized Career Pathways",
    description: "Receive customized roadmaps with specific milestones and achievements tailored to your unique professional goals.",
    bgColor: "bg-secondary-light/30",
  },
  {
    icon: <ChartLine className="text-2xl text-primary-dark" />,
    title: "Skill Gap Analysis",
    description: "Identify skill deficiencies using SFIA 9 and DigComp 2.2 frameworks to focus your learning and development efforts.",
    bgColor: "bg-primary-light/30",
  },
  {
    icon: <ClipboardCheck className="text-2xl text-secondary-dark" />,
    title: "Comprehensive Assessments",
    description: "Complete in-depth skill evaluations that accurately measure your capabilities against industry standards.",
    bgColor: "bg-secondary-light/30",
  },
  {
    icon: <GraduationCap className="text-2xl text-primary-dark" />,
    title: "Targeted Learning Resources",
    description: "Access curated educational content and training opportunities aligned with your professional development needs.",
    bgColor: "bg-primary-light/30",
  },
  {
    icon: <Trophy className="text-2xl text-secondary-dark" />,
    title: "Progress Tracking",
    description: "Monitor your growth with visual dashboards that showcase achievements and advancement toward career goals.",
    bgColor: "bg-secondary-light/30",
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-neutral-50 px-4 sm:px-6 lg:px-8" id="features">
      <div className="container mx-auto">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-bold text-3xl md:text-4xl mb-4">AI-Powered Features For Your Career Success</h2>
          <p className="text-lg text-gray-700/70">Discover how our innovative tools can transform your professional development journey.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardContent className="p-4">
                  <div className={`w-14 h-14 mb-6 ${feature.bgColor} rounded-lg flex items-center justify-center`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-xl mb-3">{feature.title}</h3>
                  <p className="text-gray-700/70 mb-4">{feature.description}</p>
                  <a href="#" className="inline-flex items-center text-primary font-medium hover:text-primary-dark transition-colors">
                    Learn more <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
