// Comprehensive Report Schema Structure
// This schema defines the structure for career pathway analysis reports
// following the 11-section format specification

export interface CareerAnalysisReport {
  // Section 1: Executive Summary
  executiveSummary: {
    overview: string;
    keyPoints: string[];
    recommendedNextSteps: string[];
  };

  // Section 2: Skill Mapping
  skillMapping: {
    // Section 2.1: SFIA 9 Framework
    sfia9: {
      skill: string;
      level: string;
      description: string;
    }[];
    
    // Section 2.2: DigComp 2.2 Framework
    digcomp22: {
      competence: string;
      proficiencyLevel: string;
      description: string;
    }[];
  };

  // Section 3: Framework-Based Skill Gap Analysis
  gapAnalysis: {
    // Section 3.1: Radar Chart Data
    radarChartData: {
      skill: string;
      currentLevel: number;
      requiredLevel: number;
      fullMark: number;
    }[];
    
    // Section 3.2: Bar Chart Data
    barChartData: {
      name: string;
      currentLevel: number;
      requiredLevel: number;
      gap: number;
      importance: 'High' | 'Medium' | 'Low';
    }[];
    
    // Section 3.3: AI-Enhanced Analysis
    aiAnalysis: string;
    
    // Section 3.4: Skill Gaps and Strengths
    skillGaps: {
      skill: string;
      description: string;
      priorityLevel: 'High' | 'Medium' | 'Low';
    }[];
    
    skillStrengths: {
      skill: string;
      description: string;
      relevanceLevel: 'High' | 'Medium' | 'Low';
    }[];
  };

  // Section 4: Career Pathway Options
  pathwayOptions: {
    // Section 4.1: Career Transition Visualization
    transitionVisualization: {
      currentRole: string;
      targetRole: string;
      transitionSteps: string[];
      estimatedTimeframe: string;
    };
    
    // Section 4.2: University Pathway and Vocational Pathway
    universityPathway: {
      recommendedDegrees: string[];
      institutions: string[];
      estimatedTimeframe: string;
      expectedOutcomes: string[];
    };
    
    vocationalPathway: {
      recommendedCertifications: string[];
      providers: string[];
      estimatedTimeframe: string;
      expectedOutcomes: string[];
    };
    
    // Section 4.3: AI Pathway Enhancement Insights
    aiInsights: string;
  };

  // Section 5: Comprehensive Development Plan
  developmentPlan: {
    // Section 5.1: Skills Assessment Overview
    existingSkills: {
      skill: string;
      proficiencyLevel: string;
      applicability: string;
    }[];
    
    skillsToDevelop: {
      skill: string;
      currentLevel: string;
      targetLevel: string;
      importance: 'High' | 'Medium' | 'Low';
    }[];
    
    // Section 5.2: Social & Soft Skills Development
    softSkills: {
      skill: string;
      developmentStrategy: string;
      resources: string[];
    }[];
    
    // Section 5.3: Skills To Acquire
    skillPriorityDistribution: {
      category: string;
      count: number;
      percentage: number;
    }[];
    
    skillsToAcquire: {
      skill: string;
      description: string;
      learningResources: string[];
      estimatedTimeToAcquire: string;
    }[];
  };

  // Section 6: Recommended Educational Programs
  educationalPrograms: {
    // Section 6.1: Institutions and Courses
    institutions: {
      name: string;
      location: string;
      programName: string;
      duration: string;
      highlights: string[];
      url?: string;
    }[];
    
    onlineCourses: {
      provider: string;
      courseName: string;
      duration: string;
      highlights: string[];
      url?: string;
    }[];
    
    // Section 6.2: Suggested Projects
    suggestedProjects: {
      title: string;
      description: string;
      skillsDeveloped: string[];
      difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
      estimatedCompletion: string;
    }[];
  };

  // Section 7: AI-Enhanced Learning Roadmap
  learningRoadmap: {
    phases: {
      title: string;
      duration: string;
      focusAreas: string[];
      milestones: string[];
      resources: string[];
    }[];
    aiGeneratedInsights: string;
  };

  // Section 8: Similar Roles To Consider
  similarRoles: {
    role: string;
    description: string;
    skillOverlap: number; // Percentage
    averageSalary?: string;
    growthPotential: 'High' | 'Medium' | 'Low';
    transitionDifficulty: 'Easy' | 'Moderate' | 'Challenging';
  }[];

  // Section 9: Micro-Learning Quick Tips
  quickTips: {
    category: string;
    tips: string[];
  }[];

  // Section 10: Personalized Skill Growth Trajectory
  growthTrajectory: {
    shortTerm: string[];
    mediumTerm: string[];
    longTerm: string[];
    potentialRoles: string[];
  };

  // Section 11: Learning Path Roadmap
  learningPathRoadmap: {
    // Career Development Timeline
    timeline: {
      timeframe: string;
      milestone: string;
      skills: string[];
      activities: string[];
    }[];
  };
}