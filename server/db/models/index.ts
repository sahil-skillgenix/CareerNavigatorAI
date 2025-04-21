// Export all MongoDB models from this file
import UserModel from './user';
import type { UserDocument } from './user';
import IndustryModel from './industry';
import type { IndustryDocument } from './industry';
import SkillModel from './skill';
import type { SkillDocument } from './skill';
import RoleModel from './role';
import type { RoleDocument } from './role';
import RoleSkillModel from './roleSkill';
import type { RoleSkillDocument } from './roleSkill';
import RoleIndustryModel from './roleIndustry';
import type { RoleIndustryDocument } from './roleIndustry';
import SkillIndustryModel from './skillIndustry';
import type { SkillIndustryDocument } from './skillIndustry';
import SkillPrerequisiteModel from './skillPrerequisite';
import type { SkillPrerequisiteDocument } from './skillPrerequisite';
import LearningResourceModel from './learningResource';
import type { LearningResourceDocument } from './learningResource';
import CareerPathwayModel from './careerPathway';
import type { CareerPathwayDocument } from './careerPathway';
import CareerAnalysisModel from './careerAnalysis';
import type { CareerAnalysisDocument } from './careerAnalysis';
import UserBadgeModel from './userBadge';
import type { UserBadgeDocument } from './userBadge';
import UserProgressModel from './userProgress';
import type { UserProgressDocument } from './userProgress';

export {
  UserModel,
  IndustryModel,
  SkillModel,
  RoleModel,
  RoleSkillModel,
  RoleIndustryModel,
  SkillIndustryModel,
  SkillPrerequisiteModel,
  LearningResourceModel,
  CareerPathwayModel,
  CareerAnalysisModel,
  UserBadgeModel,
  UserProgressModel,
  UserDocument,
  IndustryDocument,
  SkillDocument,
  RoleDocument,
  RoleSkillDocument,
  RoleIndustryDocument,
  SkillIndustryDocument,
  SkillPrerequisiteDocument,
  LearningResourceDocument,
  CareerPathwayDocument,
  CareerAnalysisDocument,
  UserBadgeDocument,
  UserProgressDocument
};