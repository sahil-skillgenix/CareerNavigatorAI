/**
 * Structured Career Pathway Page
 * 
 * A dedicated page for generating and viewing structured career pathway analyses
 * using the standardized 11-section format.
 */
import { motion } from 'framer-motion';
import { StructuredCareerPathwayForm } from '@/components/career-pathway/StructuredCareerPathwayForm';
import { AuthenticatedLayout } from '@/components/layouts/AuthenticatedLayout';
import { fadeIn } from '@/lib/animations';

export default function StructuredPathwayPage() {
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
            Skillgenix AI Career Analysis
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            This tool analyzes your skills, experience, and career goals to create a personalized development pathway. It uses both
            SFIA 9 and DigComp 2.2 frameworks to provide comprehensive recommendations.
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
                <p className="text-sm text-muted-foreground">Maps your current skills to industry frameworks</p>
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
                <p className="text-sm text-muted-foreground">Identifies skill gaps for your desired career path</p>
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
                <p className="text-sm text-muted-foreground">Suggests specific education and certifications</p>
              </div>
            </div>
          </div>
        </div>
        
        <StructuredCareerPathwayForm />
      </motion.div>
    </AuthenticatedLayout>
  );
}