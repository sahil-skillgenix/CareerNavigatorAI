/**
 * Structured Pathway Page
 * 
 * This page displays the structured career pathway analysis form
 * and results using the standardized 11-section format.
 */

import React from 'react';
import { StructuredCareerPathwayForm } from '@/components/career-pathway/StructuredCareerPathwayForm';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { AuthenticatedLayout } from '@/components/layouts/AuthenticatedLayout';

export default function StructuredPathwayPage() {
  return (
    <AuthenticatedLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="py-6 px-4 md:px-6"
      >
        <div className="w-full max-w-7xl mx-auto">
          <StructuredCareerPathwayForm />
        </div>
      </motion.div>
    </AuthenticatedLayout>
  );
}