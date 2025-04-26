import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import { CareerAnalysisResult } from './CareerPathwayForm';

interface ComparativeBarChartProps {
  results: CareerAnalysisResult;
}

// Function to convert level string to numeric value (0-5)
const levelToValue = (level: string | number | undefined): number => {
  // If level is undefined, return default value
  if (level === undefined) {
    return 2;
  }
  
  // If level is already a number, just ensure it's in range 1-5
  if (typeof level === 'number') {
    return Math.min(5, Math.max(1, level));
  }
  
  // Ensure we have a string for the text operations
  const levelText = String(level);
  
  // Common level terms and their numeric values (1-5 scale)
  const levelMap: Record<string, number> = {
    'novice': 1,
    'basic': 1,
    'foundation': 1,
    'beginner': 1,
    'initial': 1,
    
    'intermediate': 2,
    'practitioner': 2,
    'applied': 2,
    
    'advanced': 3,
    'experienced': 3,
    'established': 3,
    'proficient': 3,
    
    'expert': 4,
    'senior': 4,
    'authority': 4,
    'extensive': 4,
    
    'master': 5,
    'leading': 5,
    'strategic': 5,
    'principal': 5,
    'specialized': 5
  };
  
  // Check for numeric strings like "Level 3" or just "3"
  const numericMatch = levelText.match(/(\d+)/);
  if (numericMatch) {
    return Math.min(5, Math.max(1, parseInt(numericMatch[1])));
  }
  
  // Convert to lowercase for matching
  const lowercaseLevel = levelText.toLowerCase();
  
  // Check each key in the levelMap
  for (const [term, value] of Object.entries(levelMap)) {
    if (lowercaseLevel.includes(term)) {
      return value;
    }
  }
  
  // Default if no match found
  return 2;
};

// Function to extract skills for comparative bar chart
const extractSkillsForBarChart = (results: CareerAnalysisResult): any[] => {
  // Extract gaps to show as bars
  const gapSkills = results.skillGapAnalysis.gaps.map(gap => ({
    name: gap.skill,
    currentLevel: 1, // Set to low value since it's a gap
    requiredLevel: levelToValue(gap.importance) + 1,
    gap: (levelToValue(gap.importance) + 1) - 1,
    importance: gap.importance
  }));
  
  // Sort by gap size (descending)
  gapSkills.sort((a, b) => b.gap - a.gap);
  
  // Take top 8 skills with largest gaps
  return gapSkills.slice(0, 8);
};

export function ComparativeBarChart({ results }: ComparativeBarChartProps) {
  const barData = extractSkillsForBarChart(results);
  
  // Limit to 5 skills for better display in saved analyses view
  const limitedData = barData.slice(0, 5);
  
  return (
    <div className="w-full h-full" id="comparative-bar-chart">
      <ResponsiveContainer width="100%" height="100%" minHeight={300}>
        <BarChart
          data={limitedData}
          layout="vertical"
          margin={{ top: 20, right: 60, left: 100, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.6} />
          <XAxis 
            type="number" 
            domain={[0, 5]} 
            label={{ value: 'Skill Level', position: 'insideBottom', offset: -5 }}
            tick={{ fontSize: 11 }}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            tick={{ fontSize: 12, fontWeight: '500' }}
            width={100}
          />
          <Tooltip 
            formatter={(value, name) => {
              return [
                `Level ${value}`, 
                name === 'currentLevel' ? 'Current Level' : 'Required Level'
              ];
            }}
          />
          <Legend 
            iconSize={10}
            iconType="circle" 
            wrapperStyle={{ paddingTop: '10px' }}
          />
          <Bar 
            dataKey="currentLevel" 
            name="Current Skill Level" 
            fill="#6366f1" 
            barSize={16}
            radius={[0, 4, 4, 0]}
          >
            <LabelList 
              dataKey="currentLevel" 
              position="right" 
              formatter={(value: number) => `${value}`}
              style={{ fontSize: '11px', fill: '#666' }}
            />
          </Bar>
          <Bar 
            dataKey="requiredLevel" 
            name="Required Skill Level" 
            fill="#be123c" 
            barSize={16}
            radius={[0, 4, 4, 0]}
          >
            <LabelList 
              dataKey="requiredLevel" 
              position="right" 
              formatter={(value: number) => `${value}`}
              style={{ fontSize: '11px', fill: '#666' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}