/**
 * Career Analysis Report Schema
 * 
 * Defines the standardized structure for career analysis reports,
 * consisting of 11 sections that follow a specific order and format.
 */

/**
 * Executive Summary section - Provides a high-level overview of the career analysis
 */
export interface ExecutiveSummary {
  summary: string;
  careerGoal: string;
  fitScore: {
    score: number;
    outOf: number;
    description: string;
  };
  keyFindings: string[];
}

/**
 * Skill Mapping section - Maps the user's current skills against industry frameworks
 */
export interface SkillMapping {
  skillsAnalysis: string;
  sfiaSkills: Array<{
    skill: string;
    proficiency: number;
    description: string;
    category: string;
  }>;
  digCompSkills: Array<{
    skill: string;
    proficiency: number;
    description: string;
    category: string;
  }>;
  otherSkills: Array<{
    skill: string;
    proficiency: number;
    description: string;
    category: string;
  }>;
}

/**
 * Skill Gap Analysis section - Analyzes gaps between current skills and target role requirements
 */
export interface SkillGapAnalysis {
  targetRole: string;
  currentProficiencyData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  };
  gapAnalysisData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  };
  aiAnalysis: string;
  keyGaps: Array<{
    skill: string;
    currentLevel: number;
    requiredLevel: number;
    gap: number;
    priority: string;
    improvementSuggestion: string;
  }>;
  keyStrengths: Array<{
    skill: string;
    currentLevel: number;
    requiredLevel: number;
    advantage: number;
    leverageSuggestion: string;
  }>;
}

/**
 * Career Pathway Options section - Outlines potential career pathways
 */
export interface CareerPathwayOptions {
  pathwayDescription: string;
  currentRole: string;
  targetRole: string;
  timeframe: string;
  pathwaySteps: Array<{
    step: string;
    timeframe: string;
    description: string;
  }>;
  universityPathway: Array<{
    degree: string;
    institutions: string[];
    duration: string;
    outcomes: string[];
  }>;
  vocationalPathway: Array<{
    certification: string;
    providers: string[];
    duration: string;
    outcomes: string[];
  }>;
  aiInsights: string;
}

/**
 * Development Plan section - Details a structured plan for skill development
 */
export interface DevelopmentPlan {
  overview: string;
  technicalSkills: Array<{
    skill: string;
    currentLevel: number;
    targetLevel: number;
    timeframe: string;
    resources: string[];
  }>;
  softSkills: Array<{
    skill: string;
    currentLevel: number;
    targetLevel: number;
    timeframe: string;
    resources: string[];
  }>;
  skillsToAcquire: Array<{
    skill: string;
    reason: string;
    timeframe: string;
    resources: string[];
  }>;
}

/**
 * Educational Programs section - Recommends relevant educational programs
 */
export interface EducationalPrograms {
  introduction: string;
  recommendedPrograms: Array<{
    name: string;
    provider: string;
    duration: string;
    format: string;
    skillsCovered: string[];
    description: string;
  }>;
  projectIdeas: Array<{
    title: string;
    description: string;
    skillsDeveloped: string[];
    difficulty: string;
    timeEstimate: string;
  }>;
}

/**
 * Learning Roadmap section - Provides a phased approach to learning
 */
export interface LearningRoadmap {
  overview: string;
  phases: Array<{
    phase: string;
    timeframe: string;
    focus: string;
    milestones: string[];
    resources: Array<{
      type: string;
      name: string;
      link?: string;
    }>;
  }>;
}

/**
 * Similar Roles section - Suggests alternative career paths
 */
export interface SimilarRoles {
  introduction: string;
  roles: Array<{
    role: string;
    similarityScore: number;
    keySkillOverlap: string[];
    additionalSkillsNeeded: string[];
    summary: string;
  }>;
}

/**
 * Quick Tips section - Provides actionable tips for immediate progress
 */
export interface QuickTips {
  introduction: string;
  quickWins: Array<{
    tip: string;
    timeframe: string;
    impact: string;
  }>;
  industryInsights: string[];
}

/**
 * Growth Trajectory section - Outlines potential long-term career growth
 */
export interface GrowthTrajectory {
  introduction: string;
  shortTerm: {
    role: string;
    timeline: string;
    responsibilities: string[];
    skillsRequired: string[];
    salary: {
      min: number;
      max: number;
      currency: string;
    };
  };
  mediumTerm: {
    role: string;
    timeline: string;
    responsibilities: string[];
    skillsRequired: string[];
    salary: {
      min: number;
      max: number;
      currency: string;
    };
  };
  longTerm: {
    role: string;
    timeline: string;
    responsibilities: string[];
    skillsRequired: string[];
    salary: {
      min: number;
      max: number;
      currency: string;
    };
  };
}

/**
 * Learning Path Roadmap section - Visualizes the learning journey
 */
export interface LearningPathRoadmap {
  overview: string;
  careerTrajectory: Array<{
    stage: string;
    timeframe: string;
    role: string;
    skills: string[];
    milestones: string[];
  }>;
}

/**
 * Complete Career Analysis Report structure that combines all 11 sections
 */
export interface CareerAnalysisReport {
  executiveSummary: ExecutiveSummary;
  skillMapping: SkillMapping;
  skillGapAnalysis: SkillGapAnalysis;
  careerPathwayOptions: CareerPathwayOptions;
  developmentPlan: DevelopmentPlan;
  educationalPrograms: EducationalPrograms;
  learningRoadmap: LearningRoadmap;
  similarRoles: SimilarRoles;
  quickTips: QuickTips;
  growthTrajectory: GrowthTrajectory;
  learningPathRoadmap: LearningPathRoadmap;
  timestamp: string;
}