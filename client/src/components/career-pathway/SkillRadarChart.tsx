/**
 * Skill Radar Chart Component
 * 
 * A specialized radar chart for displaying skill proficiency data
 * using Recharts library.
 */

import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface ChartDataset {
  label: string;
  data: number[];
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface SkillRadarChartProps {
  data: ChartData;
}

export function SkillRadarChart({ data }: SkillRadarChartProps) {
  // Transform the data from our schema format to Recharts format
  const transformedData = data.labels.map((label, index) => {
    const dataObject: Record<string, any> = { name: label };
    
    // Add each dataset's value for this label
    data.datasets.forEach(dataset => {
      dataObject[dataset.label] = dataset.data[index] || 0;
    });
    
    return dataObject;
  });
  
  // Generate a color for each dataset
  const colors = [
    '#1C3B82', // Primary color
    '#A31D52', // Accent color
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Amber
  ];
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart 
        outerRadius={90} 
        data={transformedData}
      >
        <PolarGrid strokeDasharray="3 3" />
        <PolarAngleAxis dataKey="name" />
        <PolarRadiusAxis angle={30} domain={[0, 7]} tickCount={8} />
        
        {data.datasets.map((dataset, index) => (
          <Radar
            key={dataset.label}
            name={dataset.label}
            dataKey={dataset.label}
            stroke={colors[index % colors.length]}
            fill={colors[index % colors.length]}
            fillOpacity={0.2}
          />
        ))}
        
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
}