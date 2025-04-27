/**
 * Comparative Bar Chart Component
 * 
 * A specialized bar chart for displaying skill gap analysis data
 * using Recharts library.
 */

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface ChartDataset {
  label: string;
  data: number[];
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ComparativeBarChartProps {
  data: ChartData;
}

export function ComparativeBarChart({ data }: ComparativeBarChartProps) {
  // Transform the data from our schema format to Recharts format
  const transformedData = data.labels.map((label, index) => {
    const dataObject: Record<string, any> = { name: label };
    
    // Add each dataset's value for this label
    data.datasets.forEach(dataset => {
      dataObject[dataset.label] = dataset.data[index] || 0;
    });
    
    return dataObject;
  });
  
  // Generate colors for the bars
  const colors = [
    '#1C3B82', // Primary color - current skills
    '#A31D52', // Accent color - required skills
  ];
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={transformedData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 7]} tickCount={8} />
        <Tooltip />
        <Legend />
        {data.datasets.map((dataset, index) => (
          <Bar 
            key={dataset.label}
            dataKey={dataset.label} 
            fill={colors[index % colors.length]} 
            name={dataset.label}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}