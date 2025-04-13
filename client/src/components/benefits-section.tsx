import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Layers, PieChart } from 'lucide-react';

export default function BenefitsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50/30 to-purple-50/30 px-4 sm:px-6 lg:px-8" id="benefits">
      <div className="container mx-auto">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-bold text-3xl md:text-4xl mb-4">Why Choose CareerPathAI</h2>
          <p className="text-lg text-gray-700/70">Our platform offers unique advantages to accelerate your professional growth.</p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white rounded-xl shadow-md overflow-hidden h-full">
              <CardContent className="p-8">
                <h3 className="font-semibold text-2xl mb-6">Skill Gap Visualization</h3>
                <p className="text-gray-700/70 mb-8">Clearly see the competencies you need to develop to reach your career goals with interactive skill gap charts.</p>
                
                {/* Skill Gap Chart */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Leadership</span>
                      <span className="text-sm text-gray-600">70%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2.5 rounded-full">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Technical Skills</span>
                      <span className="text-sm text-gray-600">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2.5 rounded-full">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Communication</span>
                      <span className="text-sm text-gray-600">60%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2.5 rounded-full">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">Project Management</span>
                      <span className="text-sm text-gray-600">45%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2.5 rounded-full">
                      <div className="bg-primary h-2.5 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-white rounded-xl shadow-md overflow-hidden h-full">
              <CardContent className="p-8">
                <h3 className="font-semibold text-2xl mb-6">Career Path Visualization</h3>
                <p className="text-gray-700/70 mb-8">See a clear visual representation of potential career paths and milestones tailored to your goals.</p>
                
                {/* Career Path Visualization */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <svg viewBox="0 0 500 200" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
                    {/* Career Path Chart */}
                    <path d="M50,150 C100,150 100,100 150,100 C200,100 200,50 250,50 C300,50 300,100 350,100 C400,100 400,50 450,50" fill="none" stroke="#3B82F6" strokeWidth="3"/>
                    
                    {/* Points */}
                    <circle cx="50" cy="150" r="8" fill="#3B82F6"/>
                    <circle cx="150" cy="100" r="8" fill="#3B82F6"/>
                    <circle cx="250" cy="50" r="8" fill="#3B82F6"/>
                    <circle cx="350" cy="100" r="8" fill="#8B5CF6"/>
                    <circle cx="450" cy="50" r="8" fill="#8B5CF6" opacity="0.5"/>
                    
                    {/* Labels */}
                    <text x="50" y="175" textAnchor="middle" fontSize="12" fill="#4B5563">Current</text>
                    <text x="150" y="125" textAnchor="middle" fontSize="12" fill="#4B5563">1-2 Years</text>
                    <text x="250" y="75" textAnchor="middle" fontSize="12" fill="#4B5563">3-4 Years</text>
                    <text x="350" y="125" textAnchor="middle" fontSize="12" fill="#4B5563">5-6 Years</text>
                    <text x="450" y="75" textAnchor="middle" fontSize="12" fill="#4B5563">7+ Years</text>
                  </svg>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 h-full">
              <CardContent className="p-4">
                <div className="w-14 h-14 mb-6 bg-primary-light/30 rounded-lg flex items-center justify-center">
                  <Zap className="text-2xl text-primary-dark" />
                </div>
                <h3 className="font-semibold text-xl mb-3">AI-Powered Recommendations</h3>
                <p className="text-gray-700/70">Our advanced algorithms provide tailored learning resources and opportunities specific to your career goals.</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 h-full">
              <CardContent className="p-4">
                <div className="w-14 h-14 mb-6 bg-secondary-light/30 rounded-lg flex items-center justify-center">
                  <Layers className="text-2xl text-secondary-dark" />
                </div>
                <h3 className="font-semibold text-xl mb-3">Industry Standard Frameworks</h3>
                <p className="text-gray-700/70">Assessment based on SFIA 9 and DigComp 2.2 frameworks ensures alignment with recognized professional standards.</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 h-full">
              <CardContent className="p-4">
                <div className="w-14 h-14 mb-6 bg-primary-light/30 rounded-lg flex items-center justify-center">
                  <PieChart className="text-2xl text-primary-dark" />
                </div>
                <h3 className="font-semibold text-xl mb-3">Data-Driven Insights</h3>
                <p className="text-gray-700/70">Access comprehensive analytics about your professional development progress and achievement milestones.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
