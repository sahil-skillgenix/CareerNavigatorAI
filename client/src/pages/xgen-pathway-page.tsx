/**
 * X-Gen AI Career Pathway Page
 * 
 * A dedicated page for generating and viewing structured career pathway analyses
 * using a simplified X-Gen AI implementation that's more stable and reliable.
 */
import { motion } from 'framer-motion';
import { SimpleXGenPathwayForm } from '@/components/x-gen/SimpleXGenPathwayForm';
import { AuthenticatedLayout } from '@/components/layouts/AuthenticatedLayout';
import { fadeIn } from '@/lib/animations';

export default function XGenPathwayPage() {
  return (
    <AuthenticatedLayout>
      <motion.div
        className="container py-8 md:py-12"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            X-Gen AI Career Analysis
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            This streamlined tool analyzes your skills, experience, and career goals to create a personalized 
            development pathway with essential recommendations and practical guidance.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-start">
              <div className="text-primary mr-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4m0-4h.01"/>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-primary">Skill Assessment</h3>
                <p className="text-sm text-muted-foreground">Evaluates your current skills against requirements</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="text-primary mr-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18"/>
                  <path d="m19 9-5 5-4-4-3 3"/>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-primary">Gap Analysis</h3>
                <p className="text-sm text-muted-foreground">Identifies priority skill gaps to address</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="text-primary mr-2 mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-primary">Learning Recommendations</h3>
                <p className="text-sm text-muted-foreground">Suggests targeted resources for skill development</p>
              </div>
            </div>
          </div>
        </div>
        
        <SimpleXGenPathwayForm />
      </motion.div>
    </AuthenticatedLayout>
  );
}