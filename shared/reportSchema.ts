/**
 * Career Analysis Report Schema
 * 
 * Defines the structure of the standardized career analysis report with 11 sections.
 */

// Executive Summary section
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

// Skill Mapping section
export interface SkillItem {
  skill: string;
  proficiency: number;
  description: string;
  category?: string;
}

export interface SkillMapping {
  skillsAnalysis: string;
  sfiaSkills: SkillItem[];
  digCompSkills: SkillItem[];
  otherSkills: SkillItem[];
}

// Skill Gap Analysis section
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

export interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: 'High' | 'Medium' | 'Low';
  improvementSuggestion: string;
}

export interface SkillStrength {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  advantage: number;
  leverageSuggestion: string;
}

export interface SkillGapAnalysis {
  targetRole: string;
  currentProficiencyData: ChartData;
  gapAnalysisData: ChartData;
  aiAnalysis: string;
  keyGaps: SkillGap[];
  keyStrengths: SkillStrength[];
}

// Career Pathway Options section
export interface PathwayStep {
  step: string;
  timeframe: string;
  description: string;
}

export interface EducationOption {
  degree: string;
  institutions: string[];
  duration: string;
  outcomes: string[];
}

export interface VocationalOption {
  certification: string;
  providers: string[];
  duration: string;
  outcomes: string[];
}

export interface CareerPathwayOptions {
  pathwayDescription: string;
  currentRole: string;
  targetRole: string;
  timeframe: string;
  pathwaySteps: PathwayStep[];
  universityPathway: EducationOption[];
  vocationalPathway: VocationalOption[];
  aiInsights: string;
}

// Development Plan section
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

// Educational Programs section
export interface EducationalProgram {
  name: string;
  provider: string;
  duration: string;
  format: string;
  skillsCovered: string[];
  description: string;
}

export interface ProjectIdea {
  title: string;
  description: string;
  skillsDeveloped: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeEstimate: string;
}

export interface EducationalPrograms {
  introduction: string;
  recommendedPrograms: EducationalProgram[];
  projectIdeas: ProjectIdea[];
}

// Learning Roadmap section
export interface LearningPhase {
  phase: string;
  timeframe: string;
  focus: string;
  milestones: string[];
  resources: {
    type: string;
    name: string;
    link?: string;
  }[];
}

export interface LearningRoadmap {
  overview: string;
  phases: LearningPhase[];
}

// Similar Roles section
export interface SimilarRole {
  role: string;
  similarityScore: number;
  keySkillOverlap: string[];
  additionalSkillsNeeded: string[];
  summary: string;
}

export interface SimilarRoles {
  introduction: string;
  roles: SimilarRole[];
}

// Quick Tips section
export interface QuickTips {
  introduction: string;
  quickWins: {
    tip: string;
    timeframe: string;
    impact: 'High' | 'Medium' | 'Low';
  }[];
  industryInsights: string[];
}

// Growth Trajectory section
export interface CareerStage {
  role: string;
  timeline: string;
  responsibilities: string[];
  skillsRequired: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface GrowthTrajectory {
  introduction: string;
  shortTerm: CareerStage;
  mediumTerm: CareerStage;
  longTerm: CareerStage;
}

// Learning Path Roadmap section
export interface CareerTrajectoryItem {
  stage: string;
  timeframe: string;
  role: string;
  skills: string[];
  milestones: string[];
}

export interface LearningPathRoadmap {
  overview: string;
  careerTrajectory: CareerTrajectoryItem[];
}

// Complete Career Analysis Report
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