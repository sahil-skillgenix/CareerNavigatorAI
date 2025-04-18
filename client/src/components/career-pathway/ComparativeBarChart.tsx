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
  
  return (
    <div className="w-full h-[400px] mt-8" id="comparative-bar-chart">
      <h3 className="text-xl font-semibold text-center mb-2 text-primary">
        Skill Gap Comparison
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={barData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            domain={[0, 5]} 
            label={{ value: 'Skill Level', position: 'insideBottom', offset: -5 }}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            tick={{ fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value, name) => {
              return [
                `Level ${value}`, 
                name === 'currentLevel' ? 'Current Level' : 'Required Level'
              ];
            }}
          />
          <Legend />
          <Bar 
            dataKey="currentLevel" 
            name="Current Skill Level" 
            fill="#8884d8" 
            barSize={20}
          >
            <LabelList dataKey="currentLevel" position="right" />
          </Bar>
          <Bar 
            dataKey="requiredLevel" 
            name="Required Skill Level" 
            fill="rgb(163, 29, 82)" 
            barSize={20}
          >
            <LabelList dataKey="requiredLevel" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}