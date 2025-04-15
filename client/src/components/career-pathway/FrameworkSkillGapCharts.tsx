import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LabelList
} from "recharts";

// Define interfaces for the skills data
interface SfiaSkill {
  skill: string;
  level: string;
  description: string;
  levelValue?: number; // Numeric value for chart
}

interface DigcompCompetency {
  competency: string;
  level: string;
  description: string;
  levelValue?: number; // Numeric value for chart
}

interface SkillGap {
  skill: string;
  importance: string;
  description: string;
  importanceValue?: number; // Numeric value for chart
}

interface SkillStrength {
  skill: string;
  level: string;
  relevance: string;
  description: string;
  levelValue?: number; // Numeric value for chart
  relevanceValue?: number; // Numeric value for chart
}

interface FrameworkSkillGapChartsProps {
  sfiaSkills: SfiaSkill[];
  digcompCompetencies: DigcompCompetency[];
  skillGaps: SkillGap[];
  skillStrengths: SkillStrength[];
}

export function FrameworkSkillGapCharts({
  sfiaSkills = [],
  digcompCompetencies = [],
  skillGaps = [],
  skillStrengths = []
}: FrameworkSkillGapChartsProps) {
  // Helper function to convert level text to numeric value
  const getLevelValue = (level: string): number => {
    // SFIA levels are typically 1-7
    if (level.match(/^level\s*\d$/i)) {
      const levelNum = parseInt(level.replace(/[^0-9]/g, ''));
      return levelNum || 1;
    }
    
    // Convert text level to number (for both SFIA and DigComp)
    switch(level.toLowerCase()) {
      case 'foundation': 
      case 'basic': 
      case 'beginner': return 1;
      case 'intermediate': return 3;
      case 'advanced': return 5;
      case 'expert': 
      case 'specialized': 
      case 'master': return 7;
      default: 
        // Try to extract numbers
        const num = parseInt(level.replace(/[^0-9]/g, ''));
        return num || 1;
    }
  };

  // Process SFIA skills data for radar chart
  const processedSfiaData = sfiaSkills.map(skill => ({
    skill: skill.skill,
    level: skill.level,
    description: skill.description,
    levelValue: getLevelValue(skill.level),
    fullMark: 7 // SFIA has 7 levels
  }));

  // Process DigComp skills data for radar chart
  const processedDigcompData = digcompCompetencies.map(comp => ({
    skill: comp.competency,
    level: comp.level,
    description: comp.description,
    levelValue: getLevelValue(comp.level),
    fullMark: 7 // Standardizing to same scale for visualization
  }));

  // Process skill gaps for bar chart
  const processedGapsData = skillGaps.map(gap => {
    // Convert importance to numeric value
    let importanceValue = 1;
    if (gap.importance.toLowerCase().includes('high')) importanceValue = 3;
    else if (gap.importance.toLowerCase().includes('medium')) importanceValue = 2;
    else if (gap.importance.toLowerCase().includes('critical')) importanceValue = 4;
    
    return {
      ...gap,
      importanceValue
    };
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  // Custom tooltip for the radar chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded shadow-md border text-sm">
          <p className="font-semibold">{data.skill}</p>
          <p className="text-gray-600">Level: {data.level}</p>
          <p className="text-gray-600 mt-1 max-w-[250px]">{data.description}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full mb-8"
    >
      <Card className="p-6">
        <motion.h2 
          className="text-2xl font-bold mb-6"
          variants={itemVariants}
        >
          Framework-Based Skill Gap Analysis
        </motion.h2>
        
        <Tabs defaultValue="radar" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="radar" className="flex-1">Framework Radar Comparison</TabsTrigger>
            <TabsTrigger value="gaps" className="flex-1">Skill Gaps Analysis</TabsTrigger>
            <TabsTrigger value="strengths" className="flex-1">Skill Strengths</TabsTrigger>
          </TabsList>
          
          <TabsContent value="radar">
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SFIA Skills Radar Chart */}
              <Card className="p-4 relative">
                <h3 className="text-lg font-semibold mb-2">SFIA 9 Framework Skills</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Skills Framework for the Information Age - measuring proficiency on a scale of 1-7
                </p>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius="80%" data={processedSfiaData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                      <PolarRadiusAxis domain={[0, 7]} tickCount={8} />
                      <Radar
                        name="Your Level"
                        dataKey="levelValue"
                        stroke="var(--primary)"
                        fill="var(--primary)"
                        fillOpacity={0.5}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">SFIA Skills Legend</h4>
                  <div className="flex flex-wrap gap-2">
                    {processedSfiaData.map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <span className="w-2 h-2 rounded-full bg-primary"></span>
                        {skill.skill} (L{skill.levelValue})
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
              
              {/* DigComp Skills Radar Chart */}
              <Card className="p-4 relative">
                <h3 className="text-lg font-semibold mb-2">DigComp 2.2 Framework Competencies</h3>
                <p className="text-sm text-gray-500 mb-4">
                  European Digital Competence Framework - standardized for comparison
                </p>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius="80%" data={processedDigcompData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--foreground)', fontSize: 12 }} />
                      <PolarRadiusAxis domain={[0, 7]} tickCount={8} />
                      <Radar
                        name="Your Level"
                        dataKey="levelValue"
                        stroke="var(--secondary, #8b5cf6)"
                        fill="var(--secondary, #8b5cf6)"
                        fillOpacity={0.5}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">DigComp Competencies Legend</h4>
                  <div className="flex flex-wrap gap-2">
                    {processedDigcompData.map((skill, index) => (
                      <Badge 
                        key={index} 
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        {skill.skill} (L{skill.levelValue})
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="gaps">
            <motion.div variants={itemVariants}>
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-2">Critical Skill Gaps</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Skills you need to develop based on SFIA 9 and DigComp 2.2 framework analysis
                </p>
                
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={processedGapsData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        domain={[0, 4]} 
                        tickCount={5}
                        label={{ value: 'Importance Level', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="skill" 
                        tick={{ fill: 'var(--foreground)', fontSize: 12 }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded shadow-md border text-sm">
                                <p className="font-semibold">{data.skill}</p>
                                <p className="text-gray-600">Importance: {data.importance}</p>
                                <p className="text-gray-600 mt-1 max-w-[250px]">{data.description}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="importanceValue" 
                        name="Importance" 
                        fill="var(--destructive, #ef4444)"
                      >
                        <LabelList dataKey="importance" position="right" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 space-y-4">
                  <h4 className="text-sm font-medium">Development Priorities</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {processedGapsData.map((gap, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-center mb-1">
                          <h5 className="font-medium">{gap.skill}</h5>
                          <Badge 
                            variant={
                              gap.importanceValue > 3 ? "destructive" : 
                              gap.importanceValue > 2 ? "default" : "secondary"
                            }
                          >
                            {gap.importance}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{gap.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="strengths">
            <motion.div variants={itemVariants}>
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-2">Identified Strengths</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Your existing skills that match well with your desired career path
                </p>
                
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={skillStrengths.map(s => ({
                        ...s,
                        levelValue: getLevelValue(s.level),
                        relevanceValue: s.relevance?.toLowerCase().includes('high') ? 3 : 
                                      s.relevance?.toLowerCase().includes('medium') ? 2 : 1
                      }))}
                      margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 7]} />
                      <YAxis type="category" dataKey="skill" />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 rounded shadow-md border text-sm">
                                <p className="font-semibold">{data.skill}</p>
                                <p className="text-gray-600">Level: {data.level}</p>
                                <p className="text-gray-600">Relevance: {data.relevance}</p>
                                <p className="text-gray-600 mt-1 max-w-[250px]">{data.description}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="levelValue" 
                        name="Skill Level" 
                        fill="var(--primary)"
                        barSize={20}
                      >
                        <LabelList dataKey="level" position="right" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </Card>
    </motion.div>
  );
}