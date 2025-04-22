import { z } from "zod";

// Industry categories enum
export const INDUSTRY_CATEGORIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Government",
  "Manufacturing",
  "Retail",
  "Media and Entertainment",
  "Agriculture",
  "Energy and Utilities",
  "Transportation and Logistics",
  "Construction",
  "Hospitality",
  "Non-profit",
  "Legal",
  "Creative Arts",
  "Sports & Recreation",
  "Other"
] as const;

// Skill levels enum
export const SKILL_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert"
] as const;

// Skill categories enum
export const SKILL_CATEGORIES = [
  "Technical",
  "Soft Skills",
  "Management",
  "Creative",
  "Analytical",
  "Communication",
  "Leadership",
  "Domain-Specific",
  "Certifications"
] as const;

// SFIA 9 categories
export const SFIA9_CATEGORIES = [
  "Strategy and architecture",
  "Change and transformation",
  "Development and implementation",
  "Delivery and operation",
  "Skills and quality",
  "Relationships and engagement"
] as const;

// DigComp 2.2 competence areas
export const DIGCOMP_AREAS = [
  "Information and data literacy",
  "Communication and collaboration",
  "Digital content creation",
  "Safety",
  "Problem solving"
] as const;

// Role categories
export const ROLE_CATEGORIES = [
  "Engineering",
  "Design",
  "Management",
  "Analysis",
  "Support",
  "Sales and Marketing",
  "Research",
  "Operations",
  "Human Resources",
  "Legal and Compliance"
] as const;

// Growth outlook options
export const GROWTH_OUTLOOK = [
  "high growth",
  "moderate growth",
  "stable",
  "declining"
] as const;

// Skill importance levels
export const IMPORTANCE_LEVELS = [
  "critical",
  "important",
  "helpful"
] as const;

// Role prevalence levels
export const PREVALENCE_LEVELS = [
  "high",
  "medium",
  "low"
] as const;

// Demand trend options
export const DEMAND_TRENDS = [
  "increasing",
  "stable",
  "decreasing"
] as const;

// User schema
export const userSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  createdAt: z.string().optional(),
  // Extended user profile fields
  location: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  currentRole: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  skills: z.string().optional(),
  interests: z.string().optional(),
  avatarUrl: z.string().optional(),
});

// Industry schema
export const industrySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  category: z.enum(INDUSTRY_CATEGORIES),
  description: z.string().min(1, "Description is required"),
  trends: z.string().optional().nullable(),
  growthOutlook: z.string().optional().nullable(),
  keySkillsDescription: z.string().optional().nullable(),
  averageSalaryRange: z.string().optional().nullable(),
  entryRequirements: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Skill schema
export const skillSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  category: z.enum(SKILL_CATEGORIES),
  description: z.string().min(1, "Description is required"),
  sfiaMapping: z.string().optional().nullable(),
  digCompMapping: z.string().optional().nullable(),
  levelingCriteria: z.record(z.any()).optional().nullable(),
  relatedSkills: z.array(z.string()).optional().nullable(),
  learningResources: z.record(z.any()).optional().nullable(),
  industryRelevance: z.array(z.string()).optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Role schema
export const roleSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(1, "Description is required"),
  responsibilities: z.array(z.string()).optional().nullable(),
  careerPathways: z.record(z.any()).optional().nullable(),
  educationRequirements: z.string().optional().nullable(),
  experienceRequirements: z.string().optional().nullable(),
  salaryRange: z.string().optional().nullable(),
  growthOutlook: z.string().optional().nullable(),
  workEnvironment: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Role-Industry relationship schema
export const roleIndustrySchema = z.object({
  id: z.string().optional(),
  roleId: z.string(),
  industryId: z.string(),
  prevalence: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  specializations: z.string().optional().nullable(),
  createdAt: z.string().optional(),
});

// Role-Skill relationship schema
export const roleSkillSchema = z.object({
  id: z.string().optional(),
  roleId: z.string(),
  skillId: z.string(),
  importance: z.string(),
  levelRequired: z.enum(SKILL_LEVELS),
  context: z.string().optional().nullable(),
  createdAt: z.string().optional(),
});

// Skill-Industry relationship schema
export const skillIndustrySchema = z.object({
  id: z.string().optional(),
  skillId: z.string(),
  industryId: z.string(),
  importance: z.string(),
  trendDirection: z.string().optional().nullable(),
  contextualApplication: z.string().optional().nullable(),
  createdAt: z.string().optional(),
});

// Skill-Prerequisite relationship schema
export const skillPrerequisiteSchema = z.object({
  id: z.string().optional(),
  skillId: z.string(),
  prerequisiteId: z.string(),
  importance: z.string(),
  notes: z.string().optional().nullable(),
  createdAt: z.string().optional(),
});

// Learning Resource schema
export const learningResourceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  type: z.string().min(1, "Type is required"),
  provider: z.string().optional().nullable(),
  url: z.string().optional().nullable(),
  description: z.string().min(1, "Description is required"),
  skillId: z.string(),
  difficulty: z.enum(SKILL_LEVELS),
  estimatedHours: z.number().optional().nullable(),
  costType: z.string().optional().nullable(),
  cost: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  rating: z.number().optional().nullable(),
  reviewCount: z.number().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Career Pathway schema
export const careerPathwaySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  startingRoleId: z.string().optional().nullable(),
  targetRoleId: z.string().optional().nullable(),
  estimatedTimeYears: z.number().optional().nullable(),
  steps: z.record(z.any()).optional().nullable(),
  alternativeRoutes: z.record(z.any()).optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Career Analysis schema
export const careerAnalysisSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  professionalLevel: z.string().min(1, "Professional level is required"),
  currentSkills: z.string().min(1, "Current skills are required"),
  educationalBackground: z.string().min(1, "Educational background is required"),
  careerHistory: z.string().min(1, "Career history is required"),
  desiredRole: z.string().min(1, "Desired role is required"),
  state: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  result: z.record(z.any()).optional(),
  progress: z.number().default(0),
  badges: z.array(z.string()).optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// User Badge schema
export const userBadgeSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  level: z.number().default(1),
  icon: z.string().optional().nullable(),
  earnedAt: z.string().optional(),
});

// Progress item types
export const PROGRESS_TYPES = [
  "career_pathway",
  "skill_acquisition",
  "learning_path",
  "goal"
] as const;

// User Progress schema
export const userProgressSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  type: z.enum(PROGRESS_TYPES).default("career_pathway"),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  relatedItemId: z.string().optional().nullable(),
  analysisId: z.string().optional().nullable(),
  skillId: z.string().optional().nullable(),
  currentLevel: z.string().optional().nullable(),
  targetLevel: z.string().optional().nullable(),
  progress: z.number().default(0),
  milestones: z.array(z.string()).optional().default([]),
  notes: z.string().optional().nullable(),
  updatedAt: z.string().optional(),
});

// Authentication schema
export const loginUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// User registration schema
export const insertUserSchema = userSchema
  .omit({ id: true, createdAt: true })
  .extend({
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Career analysis input schema
export const insertCareerAnalysisSchema = careerAnalysisSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// User badge input schema
export const insertUserBadgeSchema = userBadgeSchema.omit({ 
  id: true, 
  earnedAt: true 
});

// User progress input schema
export const insertUserProgressSchema = userProgressSchema.omit({ 
  id: true, 
  updatedAt: true 
});

// Export types
export type User = z.infer<typeof userSchema>;
export type Industry = z.infer<typeof industrySchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Role = z.infer<typeof roleSchema>;
export type RoleIndustry = z.infer<typeof roleIndustrySchema>;
export type RoleSkill = z.infer<typeof roleSkillSchema>;
export type SkillIndustry = z.infer<typeof skillIndustrySchema>;
export type SkillPrerequisite = z.infer<typeof skillPrerequisiteSchema>;
export type LearningResource = z.infer<typeof learningResourceSchema>;
export type CareerPathway = z.infer<typeof careerPathwaySchema>;
export type CareerAnalysis = z.infer<typeof careerAnalysisSchema>;
export type UserBadge = z.infer<typeof userBadgeSchema>;
export type UserProgress = z.infer<typeof userProgressSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCareerAnalysis = z.infer<typeof insertCareerAnalysisSchema>;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

// Types for handling string dates in MongoDB storage responses
export type CareerAnalysisWithStringDates = CareerAnalysis & {
  createdAt?: string;
  updatedAt?: string;
};

export type UserBadgeWithStringDates = UserBadge & {
  earnedAt?: string;
};

export type UserProgressWithStringDates = UserProgress & {
  updatedAt?: string;
};