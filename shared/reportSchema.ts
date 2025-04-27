/**
 * Structured Career Analysis Report Schema
 * 
 * This schema defines the structured format for career analysis reports
 * to ensure all 11 sections are properly ordered and consistently named.
 */

// Executive Summary Section
export interface ExecutiveSummary {
  summary: string;
  careerGoal: string;
  keyFindings: string[];
  fitScore: {
    score: number;
    outOf: number;
    description: string;
  };
}

// Skill Mapping Section
export interface SkillMapping {
  sfiaSkills: {
    skill: string;
    proficiency: number;
    description: string;
  }[];
  digCompSkills: {
    skill: string;
    proficiency: number;
    description: string;
  }[];
  otherSkills: {
    skill: string;
    proficiency: number;
    category: string;
  }[];
  skillsAnalysis: string;
}

// Skill Gap Analysis Section
export interface SkillGapAnalysis {
  targetRole: string;
  currentProficiencyData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
    }[];
  };
  gapAnalysisData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
    }[];
  };
  aiAnalysis: string;
  keyGaps: {
    skill: string;
    currentLevel: number;
    requiredLevel: number;
    gap: number;
    priority: 'High' | 'Medium' | 'Low';
    improvementSuggestion: string;
  }[];
  keyStrengths: {
    skill: string;
    currentLevel: number;
    requiredLevel: number;
    advantage: number;
    leverageSuggestion: string;
  }[];
}

// Career Pathway Options Section
export interface CareerPathwayOptions {
  currentRole: string;
  targetRole: string;
  transitionDifficulty: 'Easy' | 'Moderate' | 'Challenging';
  estimatedTimeframe: string;
  universityPathway: {
    degrees: string[];
    institutions: string[];
    estimatedDuration: string;
    outcomes: string[];
  };
  vocationalPathway: {
    certifications: string[];
    providers: string[];
    estimatedDuration: string;
    outcomes: string[];
  };
  aiInsights: string;
  pathwaySteps: {
    step: string;
    timeframe: string;
    description: string;
  }[];
}

// Development Plan Section
export interface DevelopmentPlan {
  skillsAssessment: string;
  technicalSkills: {
    skill: string;
    currentLevel: number;
    targetLevel: number;
    developmentActions: string[];
    resources: string[];
    timeframe: string;
  }[];
  softSkills: {
    skill: string;
    currentLevel: number;
    targetLevel: number;
    developmentActions: string[];
    resources: string[];
    timeframe: string;
  }[];
  skillsToAcquire: {
    skill: string;
    relevance: string;
    developmentActions: string[];
    resources: string[];
    timeframe: string;
  }[];
}

// Educational Programs Section
export interface EducationalPrograms {
  recommendedPrograms: {
    name: string;
    provider: string;
    format: string;
    duration: string;
    url?: string;
    description: string;
    skillsAddressed: string[];
    cost?: string;
  }[];
  suggestedProjects: {
    title: string;
    description: string;
    skillsDeveloped: string[];
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    estimatedTime: string;
    resources: string[];
  }[];
}

// Learning Roadmap Section
export interface LearningRoadmap {
  phases: {
    name: string;
    duration: string;
    focus: string;
    activities: string[];
    outcomes: string[];
    resources: string[];
  }[];
  roadmapOverview: string;
}

// Similar Roles Section
export interface SimilarRoles {
  roles: {
    title: string;
    description: string;
    fitScore: number;
    skillOverlap: string[];
    additionalSkillsNeeded: string[];
    transitionDifficulty: 'Easy' | 'Moderate' | 'Challenging';
    industry: string;
    salary?: string;
  }[];
}

// Quick Tips Section
export interface QuickTips {
  quickWins: string[];
  industryInsights: string[];
  interviewTips: string[];
}

// Growth Trajectory Section
export interface GrowthTrajectory {
  shortTerm: {
    role: string;
    timeframe: string;
    keySkills: string[];
    developmentFocus: string;
  };
  mediumTerm: {
    role: string;
    timeframe: string;
    keySkills: string[];
    developmentFocus: string;
  };
  longTerm: {
    role: string;
    timeframe: string;
    keySkills: string[];
    developmentFocus: string;
  };
  potentialSalaryProgression: {
    stage: string;
    range: string;
    notes?: string;
  }[];
}

// Learning Path Roadmap Section
export interface LearningPathRoadmap {
  careerTrajectory: {
    stage: string;
    role: string;
    timeframe: string;
    keyResponsibilities: string[];
    requiredSkills: string[];
  }[];
  milestones: {
    title: string;
    achievement: string;
    timeframe: string;
    skillsUtilized: string[];
  }[];
}

// Complete Career Analysis Report with all 11 sections in proper order
export interface CareerAnalysisReport {
  // Section 1: Executive Summary
  executiveSummary: ExecutiveSummary;
  
  // Section 2: Skill Mapping
  skillMapping: SkillMapping;
  
  // Section 3: Skill Gap Analysis
  skillGapAnalysis: SkillGapAnalysis;
  
  // Section 4: Career Pathway Options
  careerPathwayOptions: CareerPathwayOptions;
  
  // Section 5: Development Plan
  developmentPlan: DevelopmentPlan;
  
  // Section 6: Educational Programs
  educationalPrograms: EducationalPrograms;
  
  // Section 7: Learning Roadmap
  learningRoadmap: LearningRoadmap;
  
  // Section 8: Similar Roles
  similarRoles: SimilarRoles;
  
  // Section 9: Quick Tips
  quickTips: QuickTips;
  
  // Section 10: Growth Trajectory
  growthTrajectory: GrowthTrajectory;
  
  // Section 11: Learning Path Roadmap
  learningPathRoadmap: LearningPathRoadmap;
  
  // Additional metadata
  timestamp: string;
  version: string;
}