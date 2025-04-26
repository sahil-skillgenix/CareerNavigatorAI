import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';
import { CareerAnalysisResult } from './CareerPathwayForm';

interface SkillRadarChartProps {
  results: CareerAnalysisResult;
}

type SkillLevel = {
  skill: string;
  level: string;
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

// Function to extract most significant skills from the analysis
const extractTopSkills = (results: CareerAnalysisResult): any[] => {
  // Combine SFIA and DigComp skills
  const allSkills = [
    ...results.skillMapping.sfia9.map(s => ({ 
      name: s.skill,
      currentLevel: levelToValue(s.level),
      requiredLevel: levelToValue(s.level) + 1, // Usually requirement is higher
      framework: 'SFIA 9'
    })),
    ...results.skillMapping.digcomp22.map(s => ({ 
      name: s.competency,
      currentLevel: levelToValue(s.level),
      requiredLevel: levelToValue(s.level) + 1,
      framework: 'DigComp 2.2'
    }))
  ];
  
  // Extract skills from gaps for required level
  results.skillGapAnalysis.gaps.forEach(gap => {
    const existingSkill = allSkills.find(s => s.name.toLowerCase() === gap.skill.toLowerCase());
    if (existingSkill) {
      existingSkill.requiredLevel = Math.max(existingSkill.requiredLevel, levelToValue(gap.importance) + 1);
    } else {
      allSkills.push({
        name: gap.skill,
        currentLevel: 1, // Minimal current level since it's a gap
        requiredLevel: levelToValue(gap.importance) + 1,
        framework: 'Gap Analysis'
      });
    }
  });
  
  // Extract skills from strengths for current level
  results.skillGapAnalysis.strengths.forEach(strength => {
    const existingSkill = allSkills.find(s => s.name.toLowerCase() === strength.skill.toLowerCase());
    if (existingSkill) {
      existingSkill.currentLevel = Math.max(existingSkill.currentLevel, levelToValue(strength.level));
    } else {
      allSkills.push({
        name: strength.skill,
        currentLevel: levelToValue(strength.level),
        requiredLevel: levelToValue(strength.level), // Assume requirement is same since it's a strength
        framework: 'Strength Analysis'
      });
    }
  });
  
  // Sort skills by gap size (required - current)
  allSkills.sort((a, b) => (b.requiredLevel - b.currentLevel) - (a.requiredLevel - a.currentLevel));
  
  // Take top skills for radar chart (5-6 skills works best for radar)
  return allSkills.slice(0, 6).map(skill => ({
    skill: skill.name,
    currentLevel: skill.currentLevel,
    requiredLevel: skill.requiredLevel,
    fullMark: 5
  }));
};

export function SkillRadarChart({ results }: SkillRadarChartProps) {
  try {
    // Check if required data properties exist
    if (!results || !results.skillMapping || !results.skillGapAnalysis) {
      console.error('SkillRadarChart: Missing required data structure', { 
        hasResults: !!results,
        hasSkillMapping: results && !!results.skillMapping,
        hasSkillGapAnalysis: results && !!results.skillGapAnalysis
      });
      
      return (
        <div className="w-full h-full flex items-center justify-center border rounded p-4 bg-gray-50">
          <div className="text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Chart data is incomplete</p>
            <p className="text-xs mt-1">Skills data is missing or invalid</p>
          </div>
        </div>
      );
    }
    
    // Extract data for the chart
    const radarData = extractTopSkills(results);
    
    console.log('SkillRadarChart: Data prepared successfully', { 
      dataPoints: radarData.length,
      firstPoint: radarData[0]
    });
    
    return (
      <div className="w-full h-full" id="skill-radar-chart">
        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
            <PolarGrid stroke="#cccccc" />
            <PolarAngleAxis 
              dataKey="skill" 
              tick={{ 
                fill: '#555555', 
                fontSize: 12,
                fontWeight: 'bold',
              }} 
              axisLineType="polygon"
              stroke="#aaaaaa"
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 5]} 
              tick={{ fill: '#888888', fontSize: 11 }}
              stroke="#bbbbbb"
            />
            
            <Radar
              name="Current Skill Level"
              dataKey="currentLevel"
              stroke="#7b8cb8"
              fill="#a4b4d5"
              fillOpacity={0.6}
            />
            
            <Radar
              name="Required Skill Level"
              dataKey="requiredLevel"
              stroke="#1c3b82"
              fill="#1c3b82"
              fillOpacity={0.4}
            />
            
            <Legend 
              align="center" 
              verticalAlign="bottom" 
              layout="horizontal" 
              wrapperStyle={{ paddingTop: '10px' }}
              iconSize={10}
              iconType="circle"
            />
            
            <Tooltip formatter={(value) => [`Level ${value}`, '']} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  } catch (error) {
    console.error('SkillRadarChart: Error rendering chart', error);
    
    return (
      <div className="w-full h-full flex items-center justify-center border rounded p-4 bg-gray-50">
        <div className="text-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p>Error rendering chart</p>
          <p className="text-xs mt-1">{error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    );
  }
}