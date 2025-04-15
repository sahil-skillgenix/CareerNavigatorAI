import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { InfoIcon, CheckCircle, AlertTriangle } from "lucide-react";
import { 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from "recharts";

// Define interfaces for the skills data
interface SfiaSkill {
  skill: string;
  level: string;
  description: string;
}

interface DigcompCompetency {
  competency: string;
  level: string;
  description: string;
}

interface SkillGap {
  skill: string;
  importance: string;
  description: string;
  framework?: string;
}

interface SkillStrength {
  skill: string;
  level: string;
  relevance: string;
  description: string;
  framework?: string;
}

interface SkillGapChartsProps {
  sfiaSkills: SfiaSkill[];
  digcompCompetencies: DigcompCompetency[];
  skillGaps: SkillGap[];
  skillStrengths: SkillStrength[];
}

// ProcessedSkill interface for structured skill representation
interface ProcessedSkill {
  name: string;
  description: string;
  framework: string;
  level?: string;
  importance?: string;
  importanceValue?: number;
  relevance?: string;
  relevanceValue?: number;
  isRequired: boolean;
  isValidated: boolean;
  userHas: boolean;
  gapDescription?: string;
  strengthDescription?: string;
}

// Helper function to get importance value
const getImportanceValue = (importance?: string): number => {
  if (!importance) return 2;
  switch (importance.toLowerCase()) {
    case 'high': return 3;
    case 'critical': return 4;
    case 'low': return 1;
    case 'medium':
    default: return 2;
  }
};

// Helper function to get relevance value
const getRelevanceValue = (relevance?: string): number => {
  if (!relevance) return 2;
  switch (relevance.toLowerCase()) {
    case 'high': return 3;
    case 'very high': return 4;
    case 'low': return 1;
    case 'medium':
    default: return 2;
  }
};

export function SkillGapCharts({
  sfiaSkills,
  digcompCompetencies,
  skillGaps,
  skillStrengths
}: SkillGapChartsProps) {
  
  // Process all skills into a unified format
  const allSkills: ProcessedSkill[] = [];
  
  // Add SFIA skills
  sfiaSkills.forEach(skill => {
    allSkills.push({
      name: skill.skill,
      description: skill.description,
      framework: 'SFIA 9',
      level: skill.level,
      isRequired: true,  // Assuming all framework skills are required
      isValidated: false, // Default, updated later
      userHas: false,    // Default, updated later
    });
  });
  
  // Add DigComp skills
  digcompCompetencies.forEach(competency => {
    allSkills.push({
      name: competency.competency,
      description: competency.description,
      framework: 'DigComp 2.2',
      level: competency.level,
      isRequired: true,  // Assuming all framework skills are required
      isValidated: false, // Default, updated later
      userHas: false,    // Default, updated later
    });
  });
  
  // Mark skills that are gaps
  skillGaps.forEach(gap => {
    // Find existing skill or add new one
    const existingSkill = allSkills.find(s => 
      s.name.toLowerCase() === gap.skill.toLowerCase() && 
      (!s.framework || !gap.framework || s.framework === gap.framework)
    );
    
    if (existingSkill) {
      existingSkill.gapDescription = gap.description;
      existingSkill.importance = gap.importance;
      existingSkill.importanceValue = getImportanceValue(gap.importance);
      existingSkill.isRequired = true;
      existingSkill.userHas = false; // It's a gap, so user doesn't have it
    } else {
      allSkills.push({
        name: gap.skill,
        description: gap.description,
        framework: gap.framework || 'General',
        importance: gap.importance,
        importanceValue: getImportanceValue(gap.importance),
        isRequired: true,
        isValidated: false,
        userHas: false,
        gapDescription: gap.description
      });
    }
  });
  
  // Mark skills that are strengths
  skillStrengths.forEach(strength => {
    // Find existing skill or add new one
    const existingSkill = allSkills.find(s => 
      s.name.toLowerCase() === strength.skill.toLowerCase() &&
      (!s.framework || !strength.framework || s.framework === strength.framework)
    );
    
    if (existingSkill) {
      existingSkill.strengthDescription = strength.description;
      existingSkill.relevance = strength.relevance;
      existingSkill.relevanceValue = getRelevanceValue(strength.relevance);
      existingSkill.userHas = true;
      existingSkill.isValidated = true; // It's validated if it's a strength
    } else {
      allSkills.push({
        name: strength.skill,
        description: strength.description,
        framework: strength.framework || 'General',
        level: strength.level,
        relevance: strength.relevance,
        relevanceValue: getRelevanceValue(strength.relevance),
        isRequired: false, // Not explicitly required, but user has it
        isValidated: true, // It's validated if it's a strength
        userHas: true,
        strengthDescription: strength.description
      });
    }
  });

  // Prepare chart data for skill comparison charts
  const prepareBarChartData = (skills: ProcessedSkill[]) => {
    return skills.map(skill => ({
      name: skill.name,
      description: skill.description,
      framework: skill.framework,
      required: skill.isRequired ? 1 : 0,
      validated: skill.isValidated ? 1 : 0,
      userHas: skill.userHas ? 1 : 0,
      level: skill.level || 'Not Specified',
      importance: skill.importance || 'Medium',
      relevance: skill.relevance || 'Medium',
      gapDescription: skill.gapDescription || '',
      strengthDescription: skill.strengthDescription || ''
    }));
  };

  // Split skills by framework
  const sfiaSkillsList = allSkills.filter(skill => skill.framework === 'SFIA 9');
  const digcompSkillsList = allSkills.filter(skill => skill.framework === 'DigComp 2.2');

  // Get top skills (most important or relevant)
  const getTopSkills = (skills: ProcessedSkill[], count = 7) => {
    return [...skills].sort((a, b) => {
      const aIsGap = Boolean(a.gapDescription);
      const bIsGap = Boolean(b.gapDescription);
      
      // Prioritize gaps over strengths
      if (aIsGap && !bIsGap) return -1;
      if (!aIsGap && bIsGap) return 1;
      
      // Then by importance or relevance value
      const aValue = a.importanceValue || a.relevanceValue || 1;
      const bValue = b.importanceValue || b.relevanceValue || 1;
      
      return bValue - aValue;
    }).slice(0, count);
  };

  const topSfiaSkills = getTopSkills(sfiaSkillsList);
  const topDigcompSkills = getTopSkills(digcompSkillsList);

  // Prepare chart data
  const sfiaChartData = prepareBarChartData(topSfiaSkills);
  const digcompChartData = prepareBarChartData(topDigcompSkills);

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

  // Soft color palette for charts
  const chartColors = {
    required: "#93c5fd", // Soft blue
    validated: "#86efac", // Soft green
    userHas: "#c4b5fd",   // Soft purple
    cardGap: "bg-red-50 border border-red-100",
    cardStrength: "bg-green-50 border border-green-100",
    tagRequired: "bg-blue-100 text-blue-800",
    tagValidated: "bg-green-100 text-green-800",
    tagUserHas: "bg-purple-100 text-purple-800"
  };

  // Custom tooltip for skill chart - Using function form to avoid JSX issues
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded shadow-md border text-sm">
          <p className="font-semibold">{data.name}</p>
          <p className="text-gray-600">Framework: {data.framework}</p>
          {data.level && (
            <p className="text-gray-600">Level: {data.level}</p>
          )}
          {data.required === 1 && (
            <p className="text-blue-600">Status: Required for role</p>
          )}
          {data.validated === 1 && (
            <p className="text-green-600">Status: Validated in current role</p>
          )}
          {data.userHas === 1 && (
            <p className="text-purple-600">Status: You have this skill</p>
          )}
          {data.gapDescription && (
            <div className="mt-1 border-t pt-1">
              <p className="text-red-500 font-medium">Gap Analysis:</p>
              <p className="text-gray-600 max-w-[300px]">{data.gapDescription}</p>
            </div>
          )}
          {data.strengthDescription && (
            <div className="mt-1 border-t pt-1">
              <p className="text-green-500 font-medium">Strength Assessment:</p>
              <p className="text-gray-600 max-w-[300px]">{data.strengthDescription}</p>
            </div>
          )}
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
      <Card className="p-6 shadow-md border border-slate-100">
        <motion.h2 
          className="text-2xl font-bold mb-6 text-slate-800"
          variants={itemVariants}
        >
          Framework-Based Skill Gap Analysis
        </motion.h2>
        
        <Tabs defaultValue="sfia" className="w-full">
          <TabsList className="w-full mb-6 bg-slate-100">
            <TabsTrigger value="sfia" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-slate-800">SFIA 9 Skills</TabsTrigger>
            <TabsTrigger value="digcomp" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-slate-800">DigComp 2.2 Skills</TabsTrigger>
          </TabsList>
          
          {/* SFIA 9 Skills Tab */}
          <TabsContent value="sfia">
            <motion.div variants={itemVariants}>
              <Card className="p-4 bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-slate-800">SFIA 9 Framework Skill Comparison</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Compare your current skills against requirements for the desired role
                </p>
                
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={sfiaChartData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        type="number" 
                        domain={[0, 1]} 
                        tickCount={2}
                        tick={false}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={false}
                      />
                      <Tooltip content={CustomTooltip} />
                      <Legend />
                      <Bar 
                        dataKey="required" 
                        name="Required for Role" 
                        stackId="status"
                        fill={chartColors.required}
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      />
                      <Bar 
                        dataKey="validated" 
                        name="Validated in Current Role" 
                        stackId="status"
                        fill={chartColors.validated}
                        radius={[0, 0, 0, 0]}
                        barSize={20}
                      />
                      <Bar 
                        dataKey="userHas" 
                        name="You Have This Skill" 
                        stackId="status"
                        fill={chartColors.userHas}
                        radius={[0, 0, 4, 4]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3 text-slate-700">Legend</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded" style={{ backgroundColor: chartColors.required }}></span>
                      <span className="text-sm text-slate-600">Required for Role</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded" style={{ backgroundColor: chartColors.validated }}></span>
                      <span className="text-sm text-slate-600">Validated in Current Role</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded" style={{ backgroundColor: chartColors.userHas }}></span>
                      <span className="text-sm text-slate-600">You Have This Skill</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <h4 className="text-sm font-medium text-slate-700">SFIA 9 Skills Detail</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sfiaChartData.map((skill, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-md shadow-sm transition-all hover:shadow-md ${
                          skill.gapDescription 
                            ? chartColors.cardGap 
                            : chartColors.cardStrength
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h5 className="font-medium text-slate-800">{skill.name}</h5>
                          <Badge 
                            variant={
                              skill.gapDescription ? "destructive" : "default"
                            }
                            className="ml-2 font-normal"
                          >
                            {skill.gapDescription ? skill.importance : "You Have"}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          {skill.gapDescription || skill.strengthDescription || skill.description}
                        </p>
                        <div className="flex flex-wrap gap-1 text-xs">
                          {skill.required === 1 && (
                            <span className={`px-2 py-0.5 ${chartColors.tagRequired} rounded-full`}>Required</span>
                          )}
                          {skill.validated === 1 && (
                            <span className={`px-2 py-0.5 ${chartColors.tagValidated} rounded-full`}>Validated</span>
                          )}
                          {skill.userHas === 1 && (
                            <span className={`px-2 py-0.5 ${chartColors.tagUserHas} rounded-full`}>You Have</span>
                          )}
                          {skill.level && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full">
                              Level: {skill.level}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
          
          {/* DigComp 2.2 Skills Tab */}
          <TabsContent value="digcomp">
            <motion.div variants={itemVariants}>
              <Card className="p-4 bg-white shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-slate-800">DigComp 2.2 Framework Skill Comparison</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Compare your digital competencies against requirements for the desired role
                </p>
                
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={digcompChartData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 120, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        type="number" 
                        domain={[0, 1]} 
                        tickCount={2}
                        tick={false}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        axisLine={false}
                      />
                      <Tooltip content={CustomTooltip} />
                      <Legend />
                      <Bar 
                        dataKey="required" 
                        name="Required for Role" 
                        stackId="status"
                        fill={chartColors.required}
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      />
                      <Bar 
                        dataKey="validated" 
                        name="Validated in Current Role" 
                        stackId="status"
                        fill={chartColors.validated}
                        radius={[0, 0, 0, 0]}
                        barSize={20}
                      />
                      <Bar 
                        dataKey="userHas" 
                        name="You Have This Skill" 
                        stackId="status"
                        fill={chartColors.userHas}
                        radius={[0, 0, 4, 4]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3 text-slate-700">Legend</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded" style={{ backgroundColor: chartColors.required }}></span>
                      <span className="text-sm text-slate-600">Required for Role</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded" style={{ backgroundColor: chartColors.validated }}></span>
                      <span className="text-sm text-slate-600">Validated in Current Role</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded" style={{ backgroundColor: chartColors.userHas }}></span>
                      <span className="text-sm text-slate-600">You Have This Skill</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <h4 className="text-sm font-medium text-slate-700">DigComp 2.2 Skills Detail</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {digcompChartData.map((skill, index) => (
                      <div 
                        key={index} 
                        className={`p-3 rounded-md shadow-sm transition-all hover:shadow-md ${
                          skill.gapDescription 
                            ? chartColors.cardGap 
                            : chartColors.cardStrength
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <h5 className="font-medium text-slate-800">{skill.name}</h5>
                          <Badge 
                            variant={
                              skill.gapDescription ? "destructive" : "default"
                            }
                            className="ml-2 font-normal"
                          >
                            {skill.gapDescription ? skill.importance : "You Have"}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">
                          {skill.gapDescription || skill.strengthDescription || skill.description}
                        </p>
                        <div className="flex flex-wrap gap-1 text-xs">
                          {skill.required === 1 && (
                            <span className={`px-2 py-0.5 ${chartColors.tagRequired} rounded-full`}>Required</span>
                          )}
                          {skill.validated === 1 && (
                            <span className={`px-2 py-0.5 ${chartColors.tagValidated} rounded-full`}>Validated</span>
                          )}
                          {skill.userHas === 1 && (
                            <span className={`px-2 py-0.5 ${chartColors.tagUserHas} rounded-full`}>You Have</span>
                          )}
                          {skill.level && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full">
                              Level: {skill.level}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </Card>
    </motion.div>
  );
}