import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Milestone, ChevronRight, ExternalLink, BookOpen, Video, GraduationCap, File, Clock, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface LearningResource {
  id: string;
  title: string;
  type: string;
  provider: string;
  url?: string;
  description: string;
  estimatedHours: number;
  difficulty: string;
  costType: string;
  tags: string[];
  relevanceScore: number;
  matchReason: string;
}

interface LearningPathStep {
  step: number;
  resources: LearningResource[];
  milestone: string;
  estimatedTimeToComplete: string;
}

interface LearningPathVisualizerProps {
  skill: string;
  description: string;
  recommendedSequence: LearningPathStep[];
}

export function LearningPathVisualizer({ skill, description, recommendedSequence }: LearningPathVisualizerProps) {
  // Helper functions
  const getResourceIcon = (type: string) => {
    if (!type) return <File className="w-4 h-4" />;
    
    switch (type.toLowerCase()) {
      case "book":
        return <BookOpen className="w-4 h-4" />;
      case "video":
      case "tutorial":
        return <Video className="w-4 h-4" />;
      case "course":
      case "certification":
        return <GraduationCap className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  // Process data for charts
  const timeData = recommendedSequence.map(step => ({
    name: `Step ${step.step}`,
    hours: parseInt(step.estimatedTimeToComplete.split(' ')[0]) || step.step * 10, // Fallback to step-based estimation
  }));

  const resourceTypesData = [];
  const typeCounts = {};

  recommendedSequence.forEach(step => {
    step.resources.forEach(resource => {
      const type = resource.type.toLowerCase();
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
  });

  Object.keys(typeCounts).forEach(type => {
    resourceTypesData.push({
      type,
      count: typeCounts[type],
    });
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3
      }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const lineVariants = {
    hidden: { pathLength: 0 },
    visible: { 
      pathLength: 1,
      transition: { duration: 1, ease: "easeInOut" }
    }
  };

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 }
    }
  };

  // Early return if no sequence
  if (!recommendedSequence || recommendedSequence.length === 0) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <h3 className="text-xl font-medium mb-2">No Learning Path Available</h3>
        <p className="text-gray-500">Try generating a learning path first.</p>
      </div>
    );
  }

  return (
    <div className="w-full mt-6 mb-10">
      <div className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-xl">
        <h2 className="text-2xl font-bold mb-2">{skill} Learning Journey</h2>
        <p className="text-gray-600 mb-6">{description}</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
          <motion.div
            variants={chartVariants}
            initial="hidden"
            animate="visible"
            className="bg-white p-4 rounded-lg shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-3">Time Investment</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={timeData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="hours" fill="var(--primary)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            variants={chartVariants}
            initial="hidden"
            animate="visible"
            className="bg-white p-4 rounded-lg shadow-sm"
          >
            <h3 className="text-lg font-semibold mb-3">Resource Types</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={80} data={resourceTypesData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="type" />
                  <PolarRadiusAxis />
                  <Radar
                    name="Resource Count"
                    dataKey="count"
                    stroke="var(--primary)"
                    fill="var(--primary)"
                    fillOpacity={0.5}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative"
      >
        {/* Timeline Path Line */}
        <div className="absolute left-[30px] top-10 bottom-10 w-0.5 bg-gray-200" />

        {recommendedSequence.map((step, index) => (
          <motion.div
            key={index}
            variants={stepVariants}
            className="relative mb-12"
          >
            <div className="flex">
              {/* Step Circle */}
              <div className="relative z-10">
                <motion.div 
                  className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white text-xl font-bold shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {step.step}
                </motion.div>

                {/* Milestone flag */}
                <div className="absolute -right-2 -bottom-2 bg-secondary text-white rounded-full p-1">
                  <Milestone className="w-5 h-5" />
                </div>
              </div>

              {/* Step Content */}
              <div className="ml-6 flex-1">
                <Card className="overflow-hidden bg-white border-none shadow-md">
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
                    <h3 className="text-xl font-bold">Step {step.step}</h3>
                    <p className="text-sm text-gray-600">
                      <Clock className="inline-block mr-1 w-4 h-4" /> 
                      Approximately {step.estimatedTimeToComplete}
                    </p>
                  </div>

                  <div className="p-6">
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-2">Milestone:</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-md border-l-4 border-primary">
                        {step.milestone}
                      </p>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-3">Recommended Resources:</h4>
                      <div className="space-y-4">
                        {step.resources.map((resource, resIndex) => (
                          <motion.div 
                            key={resource.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * (resIndex + 1) }}
                            className="bg-gray-50 p-4 rounded-md"
                          >
                            <div className="flex items-start">
                              <div className="mr-3 mt-1">
                                {getResourceIcon(resource.type)}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-semibold">{resource.title}</h5>
                                <p className="text-sm text-gray-600 mb-2">by {resource.provider}</p>
                                <p className="text-sm mb-3">{resource.description}</p>
                                
                                <div className="flex flex-wrap gap-2 mb-3">
                                  <Badge variant="outline">{resource.type}</Badge>
                                  <Badge variant="outline">{resource.difficulty}</Badge>
                                  <Badge variant="outline">{resource.costType}</Badge>
                                  <Badge variant="outline">{resource.estimatedHours} hours</Badge>
                                </div>
                                
                                <div className="flex items-center mb-3">
                                  <div className="text-sm mr-2">Relevance:</div>
                                  <div className="flex">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Award 
                                        key={i} 
                                        className={`w-3 h-3 ${i < (resource.relevanceScore / 2) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                
                                {resource.url && resource.url !== "N/A" && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => window.open(resource.url, '_blank')}
                                  >
                                    View Resource <ExternalLink className="w-3 h-3 ml-1" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    
                    {index < recommendedSequence.length - 1 && (
                      <div className="mt-6 text-center">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center justify-center bg-primary/10 text-primary p-2 rounded-full"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </motion.div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}