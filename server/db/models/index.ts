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
  UserProgressModel
};