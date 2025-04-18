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
  const radarData = extractTopSkills(results);
  
  return (
    <div className="w-full h-[400px] mt-4" id="skill-radar-chart">
      <h3 className="text-xl font-semibold text-center mb-2 text-primary">
        Skill Matching and Gap Analysis
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" tick={{ fill: '#666', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 5]} />
          
          <Radar
            name="Current Skill Level"
            dataKey="currentLevel"
            stroke="#888888"
            fill="#d3d3d3"
            fillOpacity={0.6}
          />
          
          <Radar
            name="Required Skill Level"
            dataKey="requiredLevel"
            stroke="rgb(163, 29, 82)"
            fill="rgb(163, 29, 82)"
            fillOpacity={0.4}
          />
          
          <Legend 
            align="center" 
            verticalAlign="bottom" 
            layout="horizontal" 
            wrapperStyle={{ paddingTop: '10px' }}
          />
          
          <Tooltip formatter={(value) => [`Level ${value}`, '']} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}