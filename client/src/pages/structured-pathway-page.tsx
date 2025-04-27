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
            AI Career Analysis
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Generate a comprehensive career analysis with our structured 11-section format
            powered by SFIA 9 and DigComp 2.2 frameworks.
          </p>
        </div>
        
        <StructuredCareerPathwayForm />
      </motion.div>
    </AuthenticatedLayout>
  );
}