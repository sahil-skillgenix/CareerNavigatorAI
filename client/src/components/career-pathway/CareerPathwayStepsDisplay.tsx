import React, { useState } from 'react';
import { CareerAnalysisResult } from './CareerPathwayForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookType, 
  Calendar, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  Lightbulb, 
  Locate, 
  School, 
  Trophy, 
  Workflow 
} from 'lucide-react';

interface CareerPathwayStepsDisplayProps {
  results: CareerAnalysisResult;
}

type PathwayStep = {
  step: number;
  role: string;
  timeframe: string;
  keySkillsNeeded: string[];
  description: string;
  requiredQualification?: string;
  alternativeQualification?: string;
  recommendedProjects?: Array<{name: string, description: string, skillsGained: string[]}>;
  jobOpportunities?: Array<{roleType: string, description: string, skillsUtilized: string[]}>;
};

export function CareerPathwayStepsDisplay({ results }: CareerPathwayStepsDisplayProps) {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, number[]>>({
    university: [],
    vocational: []
  });
  
  const toggleStepExpansion = (pathway: 'university' | 'vocational', stepNumber: number) => {
    setExpandedSteps(prev => {
      const currentExpanded = [...prev[pathway]];
      const index = currentExpanded.indexOf(stepNumber);
      
      if (index >= 0) {
        currentExpanded.splice(index, 1);
      } else {
        currentExpanded.push(stepNumber);
      }
      
      return {
        ...prev,
        [pathway]: currentExpanded
      };
    });
  };
  
  const isStepExpanded = (pathway: 'university' | 'vocational', stepNumber: number) => {
    return expandedSteps[pathway].includes(stepNumber);
  };
  
  // Render a single pathway step card
  const renderPathwayStep = (
    step: PathwayStep, 
    index: number, 
    pathway: 'university' | 'vocational'
  ) => {
    const isExpanded = isStepExpanded(pathway, step.step);
    const qualification = pathway === 'university' ? step.requiredQualification : step.alternativeQualification;
    
    return (
      <div key={index} className="relative mb-6 last:mb-0">
        {/* Timeline connector */}
        {index < (pathway === 'university' ? results.careerPathway.withDegree.length - 1 : results.careerPathway.withoutDegree.length - 1) && (
          <div className="absolute top-12 bottom-0 left-6 w-0.5 bg-muted-foreground/20"></div>
        )}
        
        <Card className={`border ${isExpanded ? 'border-primary/30' : 'border-muted'} shadow-sm transition-all`}>
          <CardContent className="p-0">
            {/* Card header with step number and role */}
            <div 
              className={`p-4 flex items-start cursor-pointer ${
                isExpanded ? 'bg-primary/5 rounded-t-lg' : ''
              }`}
              onClick={() => toggleStepExpansion(pathway, step.step)}
            >
              <div className="flex-shrink-0 mr-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold text-xl">
                  {step.step}
                </div>
              </div>
              
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{step.role}</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-1 h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStepExpansion(pathway, step.step);
                    }}
                  >
                    {isExpanded ? 
                      <ChevronDown className="h-5 w-5" /> : 
                      <ChevronRight className="h-5 w-5" />
                    }
                  </Button>
                </div>
                
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{step.timeframe}</span>
                  {qualification && (
                    <>
                      <div className="w-1 h-1 rounded-full bg-muted-foreground/50 mx-1"></div>
                      <School className="h-3.5 w-3.5" />
                      <span>{qualification}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Expanded content */}
            {isExpanded && (
              <div className="p-4 pt-0 space-y-4 text-sm">
                <div className="mt-4 p-3 bg-muted/20 rounded">
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                
                {/* Key skills section */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-600" />
                    Key Skills Required
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {step.keySkillsNeeded.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="outline" className="bg-muted/30">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Recommended projects */}
                {step.recommendedProjects && step.recommendedProjects.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-1.5 text-amber-500" />
                      Recommended Projects
                    </h4>
                    
                    <div className="space-y-2">
                      {step.recommendedProjects.map((project, projectIndex) => (
                        <div key={projectIndex} className="p-2 bg-muted/10 rounded border-l-2 border-amber-500">
                          <p className="font-medium">{project.name}</p>
                          <p className="text-xs text-muted-foreground">{project.description}</p>
                          {project.skillsGained && project.skillsGained.length > 0 && (
                            <div className="mt-1">
                              <span className="text-xs font-medium">Skills gained: </span>
                              <span className="text-xs text-muted-foreground">{project.skillsGained.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Job opportunities */}
                {step.jobOpportunities && step.jobOpportunities.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Locate className="h-4 w-4 mr-1.5 text-blue-500" />
                      Job Opportunities
                    </h4>
                    
                    <div className="space-y-2">
                      {step.jobOpportunities.map((job, jobIndex) => (
                        <div key={jobIndex} className="p-2 bg-muted/10 rounded border-l-2 border-blue-500">
                          <p className="font-medium">{job.roleType}</p>
                          <p className="text-xs text-muted-foreground">{job.description}</p>
                          {job.skillsUtilized && job.skillsUtilized.length > 0 && (
                            <div className="mt-1">
                              <span className="text-xs font-medium">Skills utilized: </span>
                              <span className="text-xs text-muted-foreground">{job.skillsUtilized.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center">
        <Workflow className="h-5 w-5 mr-2 text-primary" />
        <h3 className="text-xl font-semibold">Career Pathway Options</h3>
      </div>
      
      <Tabs defaultValue="university" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="university" className="flex gap-2 items-center">
            <BookType className="h-4 w-4" />
            <span>University Pathway</span>
          </TabsTrigger>
          <TabsTrigger value="vocational" className="flex gap-2 items-center">
            <Trophy className="h-4 w-4" />
            <span>Vocational Pathway</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="university" className="mt-0">
          <div className="bg-primary/5 border rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <h4 className="font-medium">University-Based Career Pathway</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              This pathway focuses on traditional degree-based career progression with formal qualifications
              and academic credentials. Ideal if you prefer structured educational environments.
            </p>
          </div>
          
          <div className="space-y-0">
            {results.careerPathway.withDegree.map((step, index) => 
              renderPathwayStep(step, index, 'university')
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="vocational" className="mt-0">
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <Calendar className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-medium">Vocational Career Pathway</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              This pathway emphasizes practical skills, certifications, and on-the-job training without 
              the necessity of a traditional university degree. Great for hands-on learners.
            </p>
          </div>
          
          <div className="space-y-0">
            {results.careerPathway.withoutDegree.map((step, index) => 
              renderPathwayStep(step, index, 'vocational')
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}