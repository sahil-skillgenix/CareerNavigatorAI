import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  BarChart4,
  PieChart,
  Info,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { fadeInUp } from "@/lib/animations";

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

interface SkillChartData {
  name: string;
  required: number;
  validated: number;
  userHas: number;
  level?: string;
  importance?: string;
  description?: string;
  framework?: string;
  gapDescription?: string;
  strengthDescription?: string;
}

interface PieChartData {
  name: string;
  value: number;
  fill: string;
}

interface RadarChartData {
  subject: string;
  required: number;
  userHas: number;
  gap: number;
}

interface CombinedFrameworkChartsProps {
  sfiaSkills: SfiaSkill[];
  digcompCompetencies: DigcompCompetency[];
  skillGaps: SkillGap[];
  skillStrengths: SkillStrength[];
  sfiaData: SkillChartData[];
  digcompData: SkillChartData[];
  sfiaPieData: PieChartData[];
  digcompPieData: PieChartData[];
  sfiaRadarData: RadarChartData[];
  digcompRadarData: RadarChartData[];
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

export function CombinedFrameworkCharts({
  sfiaSkills,
  digcompCompetencies,
  skillGaps,
  skillStrengths,
  sfiaData,
  digcompData,
  sfiaPieData,
  digcompPieData,
  sfiaRadarData,
  digcompRadarData
}: CombinedFrameworkChartsProps) {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'radar'>('bar');
  
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

  // Soft color palette for charts
  const chartColors = {
    required: "#93c5fd", // Soft blue
    validated: "#86efac", // Soft green
    userHas: "#c4b5fd",   // Soft purple
    gap: "#fca5a5",       // Soft red
    barBackground: "#f1f5f9", // Light gray background
    cardGap: "bg-red-50 border border-red-100",
    cardStrength: "bg-green-50 border border-green-100",
    tagRequired: "bg-blue-100 text-blue-800",
    tagValidated: "bg-green-100 text-green-800",
    tagUserHas: "bg-purple-100 text-purple-800"
  };

  // Split skills by framework
  const sfiaSkillsList = allSkills.filter(skill => skill.framework === 'SFIA 9');
  const digcompSkillsList = allSkills.filter(skill => skill.framework === 'DigComp 2.2');

  // Get top skills (most important or relevant)
  const getTopSkills = (skills: ProcessedSkill[], count = 10) => {
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

  // Tooltip components for chart
  const SkillTooltip = (props: any) => {
    const { active, payload } = props;
    
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

  // Render bar chart - similar to reference image style
  const renderHorizontalBarChart = (data: SkillChartData[]) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 20, right: 60, left: 180, bottom: 20 }}
        barGap={2}
      >
        <defs>
          <linearGradient id="requiredGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity={1} />
          </linearGradient>
          <linearGradient id="validatedGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#86efac" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#86efac" stopOpacity={1} />
          </linearGradient>
          <linearGradient id="userHasGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#c4b5fd" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#c4b5fd" stopOpacity={1} />
          </linearGradient>
        </defs>
        
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
        <XAxis 
          type="number" 
          domain={[0, 7]} 
          tickCount={8}
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickLine={{ stroke: '#e2e8f0' }}
          axisLine={{ stroke: '#e2e8f0' }}
          tickFormatter={(value) => `${value}`}
        />
        <YAxis 
          type="category" 
          dataKey="name" 
          tick={{ fill: '#334155', fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          width={180}
        />
        <RechartsTooltip content={<SkillTooltip />} />
        <Legend 
          verticalAlign="top" 
          height={36} 
          formatter={(value) => <span className="text-sm text-slate-700">{value}</span>}
        />
        <Bar 
          name="Required Level" 
          dataKey="required"
          barSize={18}
          fill="url(#requiredGradient)"
          radius={[0, 4, 4, 0]}
        />
        <Bar 
          name="Your Current Level" 
          dataKey="userHas"
          barSize={18}
          fill="url(#userHasGradient)"
          radius={[0, 4, 4, 0]}
        />
        <Bar 
          name="Validated Level" 
          dataKey="validated"
          barSize={18}
          fill="url(#validatedGradient)"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  // Render pie chart
  const renderPieChart = (data: PieChartData[]) => (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={5}
          dataKey="value"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <RechartsTooltip />
        <Legend 
          verticalAlign="bottom"
          height={50}
          formatter={(value) => <span className="text-sm text-slate-700">{value}</span>}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );

  // Render radar chart
  const renderRadarChart = (data: RadarChartData[]) => (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.slice(0, 8)}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis 
          dataKey="subject" 
          tick={{ fill: '#64748b', fontSize: 11 }}
          tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
        />
        <PolarRadiusAxis angle={30} domain={[0, 7]} />
        <Radar
          name="Required Skills"
          dataKey="required"
          stroke={chartColors.required}
          fill={chartColors.required}
          fillOpacity={0.4}
        />
        <Radar
          name="Your Skills"
          dataKey="userHas"
          stroke={chartColors.userHas}
          fill={chartColors.userHas}
          fillOpacity={0.4}
        />
        <Radar
          name="Skill Gaps"
          dataKey="gap"
          stroke="#ef4444"
          fill="#ef4444"
          fillOpacity={0.3}
        />
        <Legend />
        <RechartsTooltip formatter={(value, name, props) => {
          if (name === 'Skill Gaps' && value === 0) {
            return 'No gap';
          }
          return value;
        }} />
      </RadarChart>
    </ResponsiveContainer>
  );

  // Prepare skill gap detail cards
  const renderSkillGapDetails = (framework: 'sfia' | 'digcomp') => {
    const frameworkSkills = framework === 'sfia' ? sfiaSkillsList : digcompSkillsList;
    const gapSkills = frameworkSkills.filter(skill => skill.gapDescription);
    const strengthSkills = frameworkSkills.filter(skill => skill.strengthDescription);
    
    return (
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gaps */}
        <div>
          <h4 className="text-sm font-medium text-red-700 mb-3 flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" />
            Skill Gaps
          </h4>
          <div className="space-y-3 max-h-[400px] overflow-y-auto p-1">
            {gapSkills.length > 0 ? (
              gapSkills.map((skill, index) => (
                <div 
                  key={index} 
                  className="p-3 rounded-md shadow-sm transition-all hover:shadow-md bg-red-50 border border-red-100"
                >
                  <div className="flex justify-between items-center mb-1">
                    <h5 className="font-medium text-slate-800">{skill.name}</h5>
                    <Badge 
                      variant="destructive"
                      className="ml-2 font-normal"
                    >
                      {skill.importance || "Medium"}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    {skill.gapDescription || skill.description}
                  </p>
                  <div className="flex flex-wrap gap-1 text-xs">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full">
                      {skill.framework}
                    </span>
                    {skill.level && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full">
                        Level Required: {skill.level}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500 italic">No significant skill gaps detected in this framework area.</div>
            )}
          </div>
        </div>
        
        {/* Strengths */}
        <div>
          <h4 className="text-sm font-medium text-green-700 mb-3 flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Skill Strengths
          </h4>
          <div className="space-y-3 max-h-[400px] overflow-y-auto p-1">
            {strengthSkills.length > 0 ? (
              strengthSkills.map((skill, index) => (
                <div 
                  key={index} 
                  className="p-3 rounded-md shadow-sm transition-all hover:shadow-md bg-green-50 border border-green-100"
                >
                  <div className="flex justify-between items-center mb-1">
                    <h5 className="font-medium text-slate-800">{skill.name}</h5>
                    <Badge 
                      variant="default"
                      className="ml-2 font-normal"
                    >
                      {skill.relevance || "Medium"}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    {skill.strengthDescription || skill.description}
                  </p>
                  <div className="flex flex-wrap gap-1 text-xs">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full">
                      {skill.framework}
                    </span>
                    {skill.level && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded-full">
                        Your Level: {skill.level}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500 italic">No significant strengths detected in this framework area.</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="w-full mb-8"
    >
      <Card className="shadow-md border border-slate-100 overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-blue-50">
          <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="h-6 w-6 text-indigo-600" /> 
            Framework-Based Skill Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Comprehensive analysis of your skills based on SFIA 9 and DigComp 2.2 frameworks
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* Chart Type Selection */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-1 bg-slate-100 rounded-lg">
              <Button 
                variant={chartType === 'bar' ? 'default' : 'ghost'} 
                size="sm"
                className={`rounded-md ${chartType === 'bar' ? 'shadow-sm' : ''}`}
                onClick={() => setChartType('bar')}
              >
                <BarChart4 className="h-4 w-4 mr-2" />
                Bar Chart
              </Button>
              <Button 
                variant={chartType === 'pie' ? 'default' : 'ghost'} 
                size="sm"
                className={`rounded-md ${chartType === 'pie' ? 'shadow-sm' : ''}`}
                onClick={() => setChartType('pie')}
              >
                <PieChart className="h-4 w-4 mr-2" />
                Pie Chart
              </Button>
              <Button 
                variant={chartType === 'radar' ? 'default' : 'ghost'} 
                size="sm"
                className={`rounded-md ${chartType === 'radar' ? 'shadow-sm' : ''}`}
                onClick={() => setChartType('radar')}
              >
                <Activity className="h-4 w-4 mr-2" />
                Radar Chart
              </Button>
            </div>
          </div>
          
          {/* Info Box */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-700 mb-1">About Framework-Based Skill Analysis</h4>
                <p className="text-sm text-blue-600">
                  {chartType === 'bar' && "This bar chart shows skill levels required for your desired role compared to your current skills. Longer bars indicate higher proficiency levels."}
                  {chartType === 'pie' && "This pie chart displays the percentage distribution of skills you have, skills that are validated, and skill gaps that need to be addressed."}
                  {chartType === 'radar' && "This radar chart maps skills across multiple dimensions, showing the relationship between required skills, your current abilities, and skill gaps."}
                </p>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="sfia" className="w-full">
            <TabsList className="w-full mb-6 bg-slate-100">
              <TabsTrigger value="sfia" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-slate-800">
                SFIA 9 Framework
              </TabsTrigger>
              <TabsTrigger value="digcomp" className="flex-1 data-[state=active]:bg-white data-[state=active]:text-slate-800">
                DigComp 2.2 Framework
              </TabsTrigger>
            </TabsList>
            
            {/* SFIA Tab */}
            <TabsContent value="sfia">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-slate-800">SFIA 9 Framework Skills Analysis</h3>
                <p className="text-sm text-slate-500 mb-4">
                  Skills Framework for the Information Age (SFIA) provides a common language for the skills needed in the digital world
                </p>
                
                <div className="h-[400px]">
                  {chartType === 'bar' && renderHorizontalBarChart(sfiaData)}
                  {chartType === 'pie' && renderPieChart(sfiaPieData)}
                  {chartType === 'radar' && renderRadarChart(sfiaRadarData)}
                </div>
                
                {renderSkillGapDetails('sfia')}
              </div>
            </TabsContent>
            
            {/* DigComp Tab */}
            <TabsContent value="digcomp">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-2 text-slate-800">DigComp 2.2 Framework Competencies Analysis</h3>
                <p className="text-sm text-slate-500 mb-4">
                  The European Digital Competence Framework for Citizens (DigComp) offers a tool to improve citizens' digital competence
                </p>
                
                <div className="h-[400px]">
                  {chartType === 'bar' && renderHorizontalBarChart(digcompData)}
                  {chartType === 'pie' && renderPieChart(digcompPieData)}
                  {chartType === 'radar' && renderRadarChart(digcompRadarData)}
                </div>
                
                {renderSkillGapDetails('digcomp')}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Legend */}
          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="text-sm font-medium mb-4 text-slate-700">Chart Legend & Interpretation</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded" style={{ backgroundColor: chartColors.required }}></span>
                  <span className="text-sm text-slate-600">Required Level</span>
                </div>
                <p className="text-xs text-slate-500 ml-6">Skill level needed for your desired position</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded" style={{ backgroundColor: chartColors.userHas }}></span>
                  <span className="text-sm text-slate-600">Your Current Level</span>
                </div>
                <p className="text-xs text-slate-500 ml-6">Your current skill proficiency level</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded" style={{ backgroundColor: chartColors.validated }}></span>
                  <span className="text-sm text-slate-600">Validated Level</span>
                </div>
                <p className="text-xs text-slate-500 ml-6">Skills officially recognized in your current role</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}