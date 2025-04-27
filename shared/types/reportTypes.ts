/**
 * Career Analysis Report Types
 * 
 * This file defines all the type structures used for the X-Gen AI Career Analysis feature.
 * It includes types for both the request data sent to OpenAI and the structured response.
 */

/**
 * Career Analysis Request Data
 * User input data sent to the API for career analysis
 */
export interface CareerAnalysisRequestData {
  professionalLevel: string;
  currentSkills: string;
  educationalBackground: string;
  careerHistory: string;
  desiredRole: string;
  state: string;
  country: string;
}

/**
 * Career Analysis Report
 * Full structured report returned from OpenAI
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
}

/**
 * Saved Career Analysis
 * Model for storing career analyses in the database
 */
export interface SavedCareerAnalysis {
  userId: string;
  report: CareerAnalysisReport;
  requestData: CareerAnalysisRequestData;
  dateCreated: string;
}

// Section 1: Executive Summary
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

// Section 2: Skill Mapping
export interface SkillMapping {
  skillsAnalysis: string;
  sfiaSkills: [string, number, string][];
  digCompSkills: [string, number, string][];
  otherSkills: [string, number, string][];
}

// Section 3: Skill Gap Analysis
export interface SkillGapAnalysis {
  targetRole: string;
  aiAnalysis: string;
  keyGaps: [string, number, number, number, string, string][];
  keyStrengths: [string, number, number, number, string][];
  visualizationData: {
    currentSkills: { skill: string; value: number }[];
    requiredSkills: { skill: string; value: number }[];
  };
}

// Section 4: Career Pathway Options
export interface CareerPathwayOptions {
  currentRole: string;
  targetRole: string;
  timeframe: string;
  pathwayDescription: string;
  pathwaySteps: [string, string, string][];
  universityPathway: {
    degree: string;
    duration: string;
    institutions: string[];
    outcomes: string[];
  }[];
  vocationalPathway: {
    certification: string;
    duration: string;
    providers: string[];
    outcomes: string[];
  }[];
  aiInsights: string;
}

// Section 5: Development Plan
export interface DevelopmentPlan {
  overview: string;
  technicalSkills: [string, number, number, string, string[]][];
  softSkills: [string, number, number, string, string[]][];
  skillsToAcquire: [string, string, string, string[]][];
}

// Section 6: Educational Programs
export interface EducationalPrograms {
  introduction: string;
  recommendedPrograms: {
    name: string;
    provider: string;
    format: string;
    duration: string;
    description: string;
    skillsCovered: string[];
  }[];
  suggestedProjects: {
    title: string;
    difficultyLevel: string;
    completionTime: string;
    description: string;
    skillsDeveloped: string[];
  }[];
}

// Section 7: Learning Roadmap
export interface LearningRoadmap {
  roadmapOverview: string;
  learningPhases: {
    phase: string;
    focusAreas: string[];
    keyResources: {
      name: string;
      type: string;
      url?: string;
    }[];
  }[];
  skillsProgression: {
    skill: string;
    startLevel: number;
    targetLevel: number;
    milestones: {
      level: number;
      achievements: string[];
    }[];
  }[];
}

// Section 8: Similar Roles
export interface SimilarRoles {
  introduction: string;
  roles: {
    title: string;
    similarityScore: number;
    keyResponsibilities: string[];
    requiredSkills: string[];
    averageSalary: string;
    growthPotential: string;
    pros: string[];
    cons: string[];
  }[];
}

// Section 9: Quick Tips
export interface QuickTips {
  dailyLearningTips: string[];
  interviewPreparationTips: string[];
  networkingRecommendations: string[];
}

// Section 10: Growth Trajectory
export interface GrowthTrajectory {
  shortTermGoals: {
    timeframe: string;
    goals: string[];
    metrics: string[];
  };
  mediumTermGoals: {
    timeframe: string;
    goals: string[];
    metrics: string[];
  };
  longTermGoals: {
    timeframe: string;
    goals: string[];
    metrics: string[];
  };
  potentialSalaryProgression: {
    stage: string;
    timeframe: string;
    salary: string;
  }[];
}

// Section 11: Learning Path Roadmap
export interface LearningPathRoadmap {
  timelineData: {
    milestone: string;
    timeframe: string;
    description: string;
  }[];
  skillFocus: {
    skill: string;
    priority: string;
    resources: {
      name: string;
      type: string;
      url?: string;
    }[];
  }[];
}