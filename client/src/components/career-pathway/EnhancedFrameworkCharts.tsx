import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart4, PieChart, Activity, Info } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Label
} from "recharts";

// Define the chart data interface
interface SkillChartData {
  name: string;
  required: number;
  validated: number;
  userHas: number;
  level?: string;
  importance?: string;
  description?: string;
  framework?: string;
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

interface EnhancedFrameworkChartsProps {
  sfiaData: SkillChartData[];
  digcompData: SkillChartData[];
  sfiaPieData: PieChartData[];
  digcompPieData: PieChartData[];
  sfiaRadarData: RadarChartData[];
  digcompRadarData: RadarChartData[];
  chartColors: { [key: string]: string };
}

export function EnhancedFrameworkCharts({
  sfiaData,
  digcompData,
  sfiaPieData,
  digcompPieData,
  sfiaRadarData,
  digcompRadarData,
  chartColors
}: EnhancedFrameworkChartsProps) {
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'radar'>('bar');
  
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Custom tooltip for skill chart
  const SkillTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded shadow-md border text-sm">
          <p className="font-semibold">{data.name}</p>
          {data.framework && <p className="text-gray-600">Framework: {data.framework}</p>}
          {data.level && (
            <p className="text-gray-600">Level: {data.level}</p>
          )}
          {data.description && (
            <p className="text-gray-600 max-w-[300px] mt-1">{data.description}</p>
          )}
          <div className="flex flex-col gap-1 mt-2">
            {data.required > 0 && (
              <p className="text-blue-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-400 rounded-full inline-block"></span>
                Required for role
              </p>
            )}
            {data.validated > 0 && (
              <p className="text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
                Validated in current role
              </p>
            )}
            {data.userHas > 0 && (
              <p className="text-purple-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-400 rounded-full inline-block"></span>
                You have this skill
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const renderBarChart = (data: SkillChartData[]) => (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
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
        <Tooltip content={<SkillTooltip />} />
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
  );

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
        <Tooltip />
        <Legend 
          verticalAlign="bottom"
          height={50}
          formatter={(value) => <span className="text-sm text-slate-700">{value}</span>}
        />
      </RechartsPieChart>
    </ResponsiveContainer>
  );

  const renderRadarChart = (data: RadarChartData[]) => (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#e5e7eb" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
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
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      className="w-full mb-8"
    >
      <Card className="p-6 shadow-md border border-slate-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="h-6 w-6 text-indigo-600" /> 
            Enhanced Framework-Based Skill Analysis
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Comparing your skills against role requirements using SFIA 9 and DigComp 2.2 frameworks
          </p>
        </CardHeader>
        
        <CardContent>
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
                <h4 className="text-sm font-semibold text-blue-700 mb-1">About Framework-Based Skill Gap Analysis</h4>
                <p className="text-sm text-blue-600">
                  {chartType === 'bar' && "This bar chart shows your skill coverage compared to role requirements. Each bar indicates if a skill is required, validated in your current role, and whether you possess it."}
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
                  {chartType === 'bar' && renderBarChart(sfiaData)}
                  {chartType === 'pie' && renderPieChart(sfiaPieData)}
                  {chartType === 'radar' && renderRadarChart(sfiaRadarData)}
                </div>
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
                  {chartType === 'bar' && renderBarChart(digcompData)}
                  {chartType === 'pie' && renderPieChart(digcompPieData)}
                  {chartType === 'radar' && renderRadarChart(digcompRadarData)}
                </div>
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
                  <span className="text-sm text-slate-600">Required for Role</span>
                </div>
                <p className="text-xs text-slate-500 ml-6">Skills needed for your desired position</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded" style={{ backgroundColor: chartColors.validated }}></span>
                  <span className="text-sm text-slate-600">Validated in Current Role</span>
                </div>
                <p className="text-xs text-slate-500 ml-6">Skills officially recognized in your current position</p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded" style={{ backgroundColor: chartColors.userHas }}></span>
                  <span className="text-sm text-slate-600">You Have This Skill</span>
                </div>
                <p className="text-xs text-slate-500 ml-6">Skills you currently possess based on your profile</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}