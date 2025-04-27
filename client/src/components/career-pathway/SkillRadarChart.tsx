/**
 * Skill Radar Chart Component
 * 
 * Visualizes skill proficiency data in a radar chart format, ideal for
 * displaying multiple skills with their proficiency levels.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SkillRadarChartProps {
  results?: any; // Career analysis results
  data?: Array<{
    name: string;
    value: number;
    fullMark?: number;
  }>;
  title?: string;
  maxLevel?: number;
  colorPrimary?: string;
  colorSecondary?: string;
}

export function SkillRadarChart({
  results,
  data,
  title = "Skills Profile",
  maxLevel = 7,
  colorPrimary = 'rgb(28, 59, 130)',
  colorSecondary = 'rgba(28, 59, 130, 0.6)'
}: SkillRadarChartProps) {
  // Extract skills data from results if no direct data is provided
  let skillData = data || 
    (results?.skillMapping?.sfia9?.slice(0, 6)?.map((skill: any) => ({
      name: typeof skill === 'string' ? skill : skill.skill || skill.name || 'Skill',
      value: typeof skill === 'string' ? 3 : parseInt(skill.proficiency || skill.level || '3', 10),
      fullMark: maxLevel
    })) || 
    results?.skillMapping?.digcomp22?.slice(0, 6)?.map((skill: any) => ({
      name: typeof skill === 'string' ? skill : skill.competency || skill.name || 'Skill',
      value: typeof skill === 'string' ? 3 : parseInt(skill.level || skill.proficiency || '3', 10),
      fullMark: maxLevel
    })) || []);

  // Ensure skillData has at least some data
  if (!skillData || skillData.length === 0) {
    skillData = [
      { name: "Technical Skills", value: 3, fullMark: maxLevel },
      { name: "Communication", value: 4, fullMark: maxLevel },
      { name: "Leadership", value: 2, fullMark: maxLevel },
      { name: "Problem Solving", value: 5, fullMark: maxLevel },
      { name: "Domain Knowledge", value: 3, fullMark: maxLevel },
    ];
  }
  
  // Create adjusted data to ensure all skills show on the radar
  const adjustedData = skillData.map(item => ({
    ...item,
    // Add a tiny amount to zero values to ensure they appear on the chart
    value: item.value === 0 ? 0.1 : item.value,
    fullMark: item.fullMark || maxLevel
  }));

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-1.5">
            {title}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full p-0">
                    <Info className="h-4 w-4" />
                    <span className="sr-only">Chart Info</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>This radar chart shows skill proficiency levels on a scale of 1-{maxLevel}.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={adjustedData}>
              <PolarGrid stroke="rgba(0, 0, 0, 0.1)" />
              <PolarAngleAxis dataKey="name" tick={{ fill: 'rgb(100, 116, 139)', fontSize: 12 }} />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, maxLevel]}
                tickCount={maxLevel + 1}
                tick={{ fill: 'rgb(100, 116, 139)', fontSize: 10 }}
              />
              <Radar
                name="Current Level"
                dataKey="value"
                stroke={colorPrimary}
                fill={colorSecondary}
                fillOpacity={0.5}
                activeDot={{ r: 6, stroke: colorPrimary, strokeWidth: 2, fill: "white" }}
              />
              <RechartsTooltip 
                formatter={(value: number) => [`Level ${value}`, 'Proficiency']}
                contentStyle={{ backgroundColor: "white", borderRadius: "8px", border: "1px solid #e2e8f0" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}