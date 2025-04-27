/**
 * Career Pathway Steps Display Component
 * 
 * Visualizes a career pathway as a series of connected steps with timeframes
 * and descriptions.
 */
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { fadeInUp, staggerChildren } from '@/lib/animations';

export interface PathwayStep {
  step: string;
  timeframe: string;
  description: string;
}

export interface CareerPathwayStepsDisplayProps {
  results?: any; // Career analysis results 
  steps?: PathwayStep[];
  currentRole?: string;
  targetRole?: string;
  timeframe?: string;
}

export function CareerPathwayStepsDisplay({
  results,
  steps,
  currentRole = 'Current Role', 
  targetRole = 'Target Role',
  timeframe = 'Total Timeframe'
}: CareerPathwayStepsDisplayProps) {
  // Extract data from results if direct props aren't provided
  const pathwaySteps = steps || 
    results?.careerPathway?.withDegree?.map((step: any) => ({
      step: step.role || step.title || step.name || 'Step',
      timeframe: step.timeframe || step.duration || '3-6 months',
      description: step.description || `Key skills: ${(step.keySkillsNeeded || []).join(', ')}`
    })) || 
    [];
  
  const pathwayCurrentRole = currentRole || results?.userInfo?.currentRole || 'Current Role';
  const pathwayTargetRole = targetRole || results?.userInfo?.targetRole || 'Target Role';
  const pathwayTimeframe = timeframe || results?.careerPathway?.timeframe || 'Total Timeframe';
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <Badge variant="outline" className="bg-primary/10 text-primary">
          {pathwayCurrentRole} → {pathwayTargetRole}
        </Badge>
        <Badge variant="outline" className="bg-primary/10 text-primary">
          {pathwayTimeframe}
        </Badge>
      </div>
      
      <motion.div 
        className="relative"
        variants={staggerChildren}
        initial="hidden"
        animate="visible"
      >
        {/* Vertical connection line */}
        <div className="absolute top-8 bottom-0 left-6 border-l-2 border-dashed border-primary/30 z-0"></div>
        
        {pathwaySteps.map((step, index) => (
          <motion.div 
            key={index}
            variants={fadeInUp}
            custom={index * 0.1}
            className="relative z-10 pl-14 pb-8 last:pb-0"
          >
            {/* Step number circle */}
            <div className="absolute left-0 top-0 flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 text-primary font-bold text-lg">
              {index + 1}
            </div>
            
            <div className="bg-gradient-to-r from-primary/5 to-transparent p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg">{step.step}</h3>
                <Badge variant="outline" className="bg-white text-primary border-primary/20">
                  {step.timeframe}
                </Badge>
              </div>
              <p className="mt-2 text-muted-foreground">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}