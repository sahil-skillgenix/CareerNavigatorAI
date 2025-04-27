/**
 * Type definitions for the X-Gen AI Career Analysis Report
 */

export interface CareerAnalysisReport {
  [key: string]: any; // Allow dynamic access while maintaining specific properties
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

export interface SkillMapping {
  skillsAnalysis: string;
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
    description: string;
  }[];
}

export interface SkillGapAnalysis {
  targetRole: string;
  aiAnalysis: string;
  visualizationData: {
    currentSkills: {
      skill: string;
      value: number;
    }[];
    requiredSkills: {
      skill: string;
      value: number;
    }[];
  };
  keyGaps: {
    skill: string;
    currentLevel: number;
    requiredLevel: number;
    priority: 'High' | 'Medium' | 'Low';
    improvementSuggestion: string;
  }[];
  keyStrengths: {
    skill: string;
    advantage: number;
    leverageSuggestion: string;
  }[];
}

export interface CareerPathwayOptions {
  pathwayDescription: string;
  currentRole: string;
  targetRole: string;
  timeframe: string;
  pathwaySteps: {
    step: string;
    timeframe: string;
    description: string;
  }[];
  universityPathway: {
    degree: string;
    institutions: string[];
    duration: string;
    outcomes: string[];
  }[];
  vocationalPathway: {
    degree: string;
    institutions: string[];
    duration: string;
    outcomes: string[];
  }[];
  aiInsights: string;
}

export interface DevelopmentPlan {
  overview: string;
  technicalSkills: {
    skill: string;
    currentLevel: number;
    targetLevel: number;
    timeframe: string;
    resources: string[];
  }[];
  softSkills: {
    skill: string;
    currentLevel: number;
    targetLevel: number;
    timeframe: string;
    resources: string[];
  }[];
  skillsToAcquire: {
    skill: string;
    reason: string;
    timeframe: string;
    resources: string[];
  }[];
}

export interface EducationalPrograms {
  introduction: string;
  recommendedPrograms: {
    name: string;
    provider: string;
    duration: string;
    format: string;
    skillsCovered: string[];
    description: string;
  }[];
  suggestedProjects: {
    title: string;
    description: string;
    skillsDeveloped: string[];
    difficultyLevel: string;
    completionTime: string;
  }[];
}

export interface LearningRoadmap {
  roadmapOverview: string;
  learningPhases: {
    phase: string;
    focusAreas: string[];
    keyResources: string[];
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

export interface SimilarRoles {
  introduction: string;
  roles: {
    title: string;
    similarityScore: number;
    keyResponsibilities: string[];
    requiredSkills: string[];
    averageSalary: string;
    growthPotential: string;
    prosAndCons: {
      pros: string[];
      cons: string[];
    };
  }[];
}

export interface QuickTips {
  dailyLearningTips: string[];
  interviewPreparationTips: string[];
  networkingRecommendations: string[];
}

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
    salary: string;
    timeframe: string;
  }[];
}

export interface LearningPathRoadmap {
  timelineData: {
    milestone: string;
    timeframe: string;
    description: string;
  }[];
  skillFocus: {
    skill: string;
    priority: 'High' | 'Medium' | 'Low';
    resources: {
      type: string;
      name: string;
      url: string;
    }[];
  }[];
}

// Request and response types for API integration
export interface CareerAnalysisRequestData {
  professionalLevel: string;
  currentSkills: string;
  educationalBackground: string;
  careerHistory: string;
  desiredRole: string;
  state: string;
  country: string;
}

export interface SavedCareerAnalysis {
  _id?: string; 
  userId: string;
  report: CareerAnalysisReport;
  requestData: CareerAnalysisRequestData;
  dateCreated: Date;
}