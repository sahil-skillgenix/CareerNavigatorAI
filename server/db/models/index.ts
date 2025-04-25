// Import and export all models
import SkillModel from "./skill";
import RoleModel from "./role";
import IndustryModel from "./industry";
import RoleSkillModel from "./roleSkill";
import RoleIndustryModel from "./roleIndustry";
import SkillIndustryModel from "./skillIndustry";
import SkillPrerequisiteModel from "./skillPrerequisite";
import LearningResourceModel from "./learningResource";
import CareerPathwayModel from "./careerPathway";
import UserModel from "./user";
import CareerAnalysisModel from "./careerAnalysis";
import UserBadgeModel from "./userBadge";
import UserProgressModel from "./userProgress";
import ErrorLogModel from "./errorLog";
import UserActivityModel from "./userActivity";
import APIRequestLogModel from "./apiRequestLog";
import { FeatureLimitsModel } from "./feature-limits";
import { UserActivityLogModel } from "./user-activity-log";
import { SystemErrorLogModel } from "./system-error-log";

// Export document types
export type { 
  SkillDocument } from "./skill";
export type { RoleDocument } from "./role";
export type { IndustryDocument } from "./industry";
export type { RoleSkillDocument } from "./roleSkill";
export type { RoleIndustryDocument } from "./roleIndustry";
export type { SkillIndustryDocument } from "./skillIndustry";
export type { SkillPrerequisiteDocument } from "./skillPrerequisite";
export type { LearningResourceDocument } from "./learningResource";
export type { CareerPathwayDocument } from "./careerPathway";
export type { UserDocument } from "./user";
export type { CareerAnalysisDocument } from "./careerAnalysis";
export type { UserBadgeDocument } from "./userBadge";
export type { UserProgressDocument } from "./userProgress";
export type { ErrorLogDocument } from "./errorLog";
export type { UserActivityDocument } from "./userActivity";
export type { APIRequestLogDocument } from "./apiRequestLog";

// Re-export models for easy imports elsewhere
export { 
  SkillModel,
  RoleModel,
  IndustryModel,
  RoleSkillModel,
  RoleIndustryModel,
  SkillIndustryModel,
  SkillPrerequisiteModel,
  LearningResourceModel,
  CareerPathwayModel,
  UserModel,
  CareerAnalysisModel,
  UserBadgeModel,
  UserProgressModel,
  ErrorLogModel,
  UserActivityModel,
  APIRequestLogModel,
  FeatureLimitsModel,
  UserActivityLogModel,
  SystemErrorLogModel
};