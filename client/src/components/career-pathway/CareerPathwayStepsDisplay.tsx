/**
 * Career Pathway Steps Display Component
 * 
 * Visualizes the career pathway steps from current role to target role
 * in a timeline format.
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Goal, Milestone, Timer } from 'lucide-react';

interface PathwayStep {
  step: string;
  timeframe: string;
  description: string;
}

interface CareerPathwayStepsDisplayProps {
  currentRole: string;
  targetRole: string;
  steps: PathwayStep[];
  timeframe: string;
}

export function CareerPathwayStepsDisplay({
  currentRole,
  targetRole,
  steps,
  timeframe
}: CareerPathwayStepsDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Overall Transition</div>
          <div className="flex items-center gap-2 text-lg font-medium">
            <span>{currentRole}</span>
            <ArrowRight className="h-4 w-4 text-primary" />
            <span className="text-primary">{targetRole}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Estimated timeframe:</span>
          <Badge variant="outline">{timeframe}</Badge>
        </div>
      </div>
      
      <div className="relative">
        {/* Vertical line connecting steps */}
        <div className="absolute left-3 top-5 bottom-5 w-0.5 bg-border" />
        
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="relative pl-10">
              {/* Step number circle */}
              <div className="absolute left-0 top-1 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                {index + 1}
              </div>
              
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{step.step}</h3>
                    <Badge variant="outline">{step.timeframe}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}