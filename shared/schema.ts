import { pgTable, text, serial, integer, boolean, varchar, timestamp, json, pgEnum, uniqueIndex, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// Industry Fields
export const industryCategories = pgEnum("industry_category", [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Government",
  "Manufacturing",
  "Retail",
  "Media",
  "Agriculture",
  "Energy",
  "Transportation",
  "Construction",
  "Hospitality",
  "Non-profit",
  "Legal",
  "Creative Arts",
  "Sports & Recreation",
  "Other"
]);

// Industries Table
export const industries = pgTable("industries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: industryCategories("category").notNull(),
  description: text("description").notNull(),
  trends: text("trends"),
  growthOutlook: text("growth_outlook"),
  keySkillsDescription: text("key_skills_description"),
  averageSalaryRange: text("average_salary_range"),
  entryRequirements: text("entry_requirements"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Skills Table - with Comprehensive Fields
export const skillLevels = pgEnum("skill_level", [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert"
]);

export const skillCategories = pgEnum("skill_category", [
  "Technical",
  "Soft Skills",
  "Management",
  "Creative",
  "Analytical",
  "Communication",
  "Leadership",
  "Domain-Specific",
  "Certifications"
]);

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: skillCategories("category").notNull(),
  description: text("description").notNull(),
  sfiaMapping: text("sfia_mapping"), // SFIA 9 Framework mapping
  digCompMapping: text("digcomp_mapping"), // DigComp 2.2 Framework mapping
  levelingCriteria: json("leveling_criteria"), // JSON structure defining criteria for different proficiency levels
  relatedSkills: text("related_skills").array(), // Array of related skills
  learningResources: json("learning_resources"), // JSON structure with recommended resources
  industryRelevance: text("industry_relevance").array(), // Industries where this skill is particularly relevant
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Roles Table - with Comprehensive Fields
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  responsibilities: text("responsibilities").array(),
  careerPathways: json("career_pathways"), // JSON structure defining possible career progressions
  educationRequirements: text("education_requirements"),
  experienceRequirements: text("experience_requirements"),
  salaryRange: text("salary_range"),
  growthOutlook: text("growth_outlook"),
  workEnvironment: text("work_environment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Role to Industry Relationship
export const roleIndustries = pgTable("role_industries", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: 'cascade' }),
  industryId: integer("industry_id").notNull().references(() => industries.id, { onDelete: 'cascade' }),
  prevalence: text("prevalence"), // How common this role is in the industry (e.g., "High", "Medium", "Low")
  notes: text("notes"), // Additional context about this role in this specific industry
  specializations: text("specializations"), // Industry-specific specializations of this role
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    roleIndustryUnique: uniqueIndex("role_industry_unique").on(table.roleId, table.industryId)
  };
});

// Role to Skill Relationship
export const roleSkills = pgTable("role_skills", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull().references(() => roles.id, { onDelete: 'cascade' }),
  skillId: integer("skill_id").notNull().references(() => skills.id, { onDelete: 'cascade' }),
  importance: text("importance").notNull(), // "Essential", "Important", "Beneficial"
  levelRequired: skillLevels("level_required").notNull(),
  context: text("context"), // How this skill is applied in this role
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    roleSkillUnique: uniqueIndex("role_skill_unique").on(table.roleId, table.skillId)
  };
});

// Skill to Industry Relationship
export const skillIndustries = pgTable("skill_industries", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull().references(() => skills.id, { onDelete: 'cascade' }),
  industryId: integer("industry_id").notNull().references(() => industries.id, { onDelete: 'cascade' }),
  importance: text("importance").notNull(), // "Essential", "Important", "Beneficial"
  trendDirection: text("trend_direction"), // "Growing", "Stable", "Declining"
  contextualApplication: text("contextual_application"), // How the skill is specifically applied in this industry
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    skillIndustryUnique: uniqueIndex("skill_industry_unique").on(table.skillId, table.industryId)
  };
});

// Skill to Skill Prerequisite Relationship
export const skillPrerequisites = pgTable("skill_prerequisites", {
  id: serial("id").primaryKey(),
  skillId: integer("skill_id").notNull().references(() => skills.id, { onDelete: 'cascade' }),
  prerequisiteId: integer("prerequisite_id").notNull().references(() => skills.id, { onDelete: 'cascade' }),
  importance: text("importance").notNull(), // "Essential", "Helpful", "Optional"
  notes: text("notes"), // Additional context about this relationship
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    skillPrereqUnique: uniqueIndex("skill_prereq_unique").on(table.skillId, table.prerequisiteId)
  };
});

// Learning Resources for Skills
export const learningResources = pgTable("learning_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // "Course", "Book", "Tutorial", "Certification", etc.
  provider: text("provider"),
  url: text("url"),
  description: text("description").notNull(),
  skillId: integer("skill_id").notNull().references(() => skills.id, { onDelete: 'cascade' }),
  difficulty: skillLevels("difficulty").notNull(),
  estimatedHours: integer("estimated_hours"),
  costType: text("cost_type"), // "Free", "Paid", "Subscription"
  cost: text("cost"),
  tags: text("tags").array(),
  rating: integer("rating"), // 1-5 scale
  reviewCount: integer("review_count"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Career Pathways
export const careerPathways = pgTable("career_pathways", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  startingRoleId: integer("starting_role_id").references(() => roles.id, { onDelete: 'set null' }),
  targetRoleId: integer("target_role_id").references(() => roles.id, { onDelete: 'set null' }),
  estimatedTimeYears: integer("estimated_time_years"),
  steps: json("steps"), // JSON array with progression steps
  alternativeRoutes: json("alternative_routes"), // JSON structure with alternative paths
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Career Analyses - Store user career analysis results
export const careerAnalyses = pgTable("career_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  professionalLevel: text("professional_level").notNull(),
  currentSkills: text("current_skills").notNull(),
  educationalBackground: text("educational_background").notNull(),
  careerHistory: text("career_history").notNull(),
  desiredRole: text("desired_role").notNull(),
  state: text("state"),
  country: text("country"),
  result: json("result").notNull(), // Stores the complete analysis result
  progress: integer("progress").default(0), // Track user's progress as percentage
  badges: text("badges").array(), // Store badges earned through this analysis
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Badges
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // e.g., "Skills", "Learning", "Career Path"
  level: integer("level").default(1), // Badge level (1, 2, 3, etc.)
  icon: text("icon"), // Icon identifier or path
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// User Progress Tracking
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  analysisId: integer("analysis_id").references(() => careerAnalyses.id, { onDelete: 'set null' }),
  skillId: integer("skill_id").references(() => skills.id, { onDelete: 'set null' }),
  currentLevel: text("current_level"),
  targetLevel: text("target_level"),
  progress: integer("progress").default(0), // 0-100 percentage
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  savedPathways: many(careerPathways),
  careerAnalyses: many(careerAnalyses),
  badges: many(userBadges),
  progressItems: many(userProgress),
}));

export const industriesRelations = relations(industries, ({ many }) => ({
  roles: many(roleIndustries),
  skills: many(skillIndustries),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  roles: many(roleSkills),
  industries: many(skillIndustries),
  prerequisites: many(skillPrerequisites, { relationName: "skillToPrerequisites" }),
  dependentSkills: many(skillPrerequisites, { relationName: "prerequisiteToSkills" }),
  learningResources: many(learningResources),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  skills: many(roleSkills),
  industries: many(roleIndustries),
}));

export const roleIndustriesRelations = relations(roleIndustries, ({ one }) => ({
  role: one(roles, {
    fields: [roleIndustries.roleId],
    references: [roles.id],
  }),
  industry: one(industries, {
    fields: [roleIndustries.industryId],
    references: [industries.id],
  }),
}));

export const roleSkillsRelations = relations(roleSkills, ({ one }) => ({
  role: one(roles, {
    fields: [roleSkills.roleId],
    references: [roles.id],
  }),
  skill: one(skills, {
    fields: [roleSkills.skillId],
    references: [skills.id],
  }),
}));

export const skillIndustriesRelations = relations(skillIndustries, ({ one }) => ({
  skill: one(skills, {
    fields: [skillIndustries.skillId],
    references: [skills.id],
  }),
  industry: one(industries, {
    fields: [skillIndustries.industryId],
    references: [industries.id],
  }),
}));

export const skillPrerequisitesRelations = relations(skillPrerequisites, ({ one }) => ({
  skill: one(skills, {
    fields: [skillPrerequisites.skillId],
    references: [skills.id],
    relationName: "skillToPrerequisites",
  }),
  prerequisite: one(skills, {
    fields: [skillPrerequisites.prerequisiteId],
    references: [skills.id],
    relationName: "prerequisiteToSkills",
  }),
}));

export const learningResourcesRelations = relations(learningResources, ({ one }) => ({
  skill: one(skills, {
    fields: [learningResources.skillId],
    references: [skills.id],
  }),
}));

export const careerAnalysesRelations = relations(careerAnalyses, ({ one, many }) => ({
  user: one(users, {
    fields: [careerAnalyses.userId],
    references: [users.id],
  }),
  progressItems: many(userProgress),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  analysis: one(careerAnalyses, {
    fields: [userProgress.analysisId],
    references: [careerAnalyses.id],
  }),
  skill: one(skills, {
    fields: [userProgress.skillId],
    references: [skills.id],
  }),
}));

// Authentication schemas
export const loginUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    fullName: true,
    email: true,
    password: true,
    createdAt: true,
  })
  .extend({
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// Export types
export type LoginUser = z.infer<typeof loginUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Industry = typeof industries.$inferSelect;
export type Skill = typeof skills.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type RoleIndustry = typeof roleIndustries.$inferSelect;
export type RoleSkill = typeof roleSkills.$inferSelect;
export type SkillIndustry = typeof skillIndustries.$inferSelect;
export type SkillPrerequisite = typeof skillPrerequisites.$inferSelect;
export type LearningResource = typeof learningResources.$inferSelect;
export type CareerPathway = typeof careerPathways.$inferSelect;
export type CareerAnalysis = typeof careerAnalyses.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;

// Define custom types with string timestamps
export type CareerAnalysisWithStringDates = Omit<CareerAnalysis, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

export type UserBadgeWithStringDates = Omit<UserBadge, 'earnedAt'> & {
  earnedAt: string;
};

export type UserProgressWithStringDates = Omit<UserProgress, 'updatedAt'> & {
  updatedAt: string;
};

// Create insert schemas for new tables
export const insertCareerAnalysisSchema = createInsertSchema(careerAnalyses).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({ 
  id: true, 
  earnedAt: true 
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ 
  id: true, 
  updatedAt: true 
});

// Insert types
export type InsertCareerAnalysis = z.infer<typeof insertCareerAnalysisSchema>;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
