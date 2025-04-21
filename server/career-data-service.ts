import { db } from './db';
import { 
  industries, 
  skills, 
  roles, 
  roleSkills, 
  roleIndustries, 
  skillIndustries, 
  skillPrerequisites,
  learningResources,
  careerPathways,
  type Industry,
  type Skill,
  type Role,
  type RoleSkill,
  type RoleIndustry,
  type SkillIndustry,
  type LearningResource,
  type CareerPathway,
  type SkillPrerequisite
} from '@shared/schema';
import { eq, and, like, inArray, sql, desc, asc } from 'drizzle-orm';

// Industries
export async function getAllIndustries(): Promise<Industry[]> {
  return db.select().from(industries).orderBy(industries.name);
}

export async function getIndustryById(id: number): Promise<Industry | undefined> {
  const results = await db.select().from(industries).where(eq(industries.id, id));
  return results[0];
}

export async function searchIndustries(query: string): Promise<Industry[]> {
  return db
    .select()
    .from(industries)
    .where(like(industries.name, `%${query}%`))
    .orderBy(industries.name);
}

export async function getIndustryByCategory(category: string): Promise<Industry[]> {
  return db
    .select()
    .from(industries)
    .where(eq(industries.category, category))
    .orderBy(industries.name);
}

// Skills
export async function getAllSkills(): Promise<Skill[]> {
  return db.select().from(skills).orderBy(skills.name);
}

export async function getSkillById(id: number): Promise<Skill | undefined> {
  const results = await db.select().from(skills).where(eq(skills.id, id));
  return results[0];
}

export async function searchSkills(query: string): Promise<Skill[]> {
  return db
    .select()
    .from(skills)
    .where(like(skills.name, `%${query}%`))
    .orderBy(skills.name);
}

export async function getSkillsByCategory(category: string): Promise<Skill[]> {
  return db
    .select()
    .from(skills)
    .where(eq(skills.category, category))
    .orderBy(skills.name);
}

// Get skills for an industry with relationship details
export async function getSkillsForIndustry(industryId: number): Promise<(Skill & { importance: string, trendDirection: string })[]> {
  const result = await db
    .select({
      ...skills,
      importance: skillIndustries.importance,
      trendDirection: skillIndustries.trendDirection
    })
    .from(skills)
    .innerJoin(skillIndustries, eq(skills.id, skillIndustries.skillId))
    .where(eq(skillIndustries.industryId, industryId))
    .orderBy(skills.name);

  return result;
}

// Get prerequisites for a skill
export async function getPrerequisitesForSkill(skillId: number): Promise<(Skill & { importance: string })[]> {
  const result = await db
    .select({
      ...skills,
      importance: skillPrerequisites.importance
    })
    .from(skills)
    .innerJoin(
      skillPrerequisites, 
      and(
        eq(skills.id, skillPrerequisites.prerequisiteId),
        eq(skillPrerequisites.skillId, skillId)
      )
    )
    .orderBy(skills.name);

  return result;
}

// Learning resources for a skill
export async function getLearningResourcesForSkill(skillId: number): Promise<LearningResource[]> {
  return db
    .select()
    .from(learningResources)
    .where(eq(learningResources.skillId, skillId))
    .orderBy(learningResources.title);
}

// Roles
export async function getAllRoles(): Promise<Role[]> {
  return db.select().from(roles).orderBy(roles.title);
}

export async function getRoleById(id: number): Promise<Role | undefined> {
  const results = await db.select().from(roles).where(eq(roles.id, id));
  return results[0];
}

export async function searchRoles(query: string): Promise<Role[]> {
  return db
    .select()
    .from(roles)
    .where(like(roles.title, `%${query}%`))
    .orderBy(roles.title);
}

export async function getRolesByCategory(category: string): Promise<Role[]> {
  return db
    .select()
    .from(roles)
    .where(eq(roles.category, category))
    .orderBy(roles.title);
}

// Get roles for an industry with relationship details
export async function getRolesForIndustry(industryId: number): Promise<(Role & { prevalence: string })[]> {
  const result = await db
    .select({
      ...roles,
      prevalence: roleIndustries.prevalence
    })
    .from(roles)
    .innerJoin(roleIndustries, eq(roles.id, roleIndustries.roleId))
    .where(eq(roleIndustries.industryId, industryId))
    .orderBy(roles.title);

  return result;
}

// Get skills for a role with relationship details
export async function getSkillsForRole(roleId: number): Promise<(Skill & { importance: string, levelRequired: string })[]> {
  const result = await db
    .select({
      ...skills,
      importance: roleSkills.importance,
      levelRequired: roleSkills.levelRequired
    })
    .from(skills)
    .innerJoin(roleSkills, eq(skills.id, roleSkills.skillId))
    .where(eq(roleSkills.roleId, roleId))
    .orderBy(skills.name);

  return result;
}

// Get industries for a role with relationship details
export async function getIndustriesForRole(roleId: number): Promise<(Industry & { prevalence: string })[]> {
  const result = await db
    .select({
      ...industries,
      prevalence: roleIndustries.prevalence
    })
    .from(industries)
    .innerJoin(roleIndustries, eq(industries.id, roleIndustries.industryId))
    .where(eq(roleIndustries.roleId, roleId))
    .orderBy(industries.name);

  return result;
}

// Career Pathways
export async function getAllCareerPathways(): Promise<CareerPathway[]> {
  return db.select().from(careerPathways).orderBy(careerPathways.name);
}

export async function getCareerPathwayById(id: number): Promise<CareerPathway | undefined> {
  const results = await db.select().from(careerPathways).where(eq(careerPathways.id, id));
  return results[0];
}

export async function getCareerPathwaysByStartingRole(roleId: number): Promise<CareerPathway[]> {
  return db
    .select()
    .from(careerPathways)
    .where(eq(careerPathways.startingRoleId, roleId))
    .orderBy(careerPathways.name);
}

export async function getCareerPathwaysByTargetRole(roleId: number): Promise<CareerPathway[]> {
  return db
    .select()
    .from(careerPathways)
    .where(eq(careerPathways.targetRoleId, roleId))
    .orderBy(careerPathways.name);
}

// Advanced Queries

// Get a complete role profile with all related data
export async function getCompleteRoleProfile(roleId: number) {
  const roleData = await getRoleById(roleId);
  if (!roleData) return null;

  const skillsData = await getSkillsForRole(roleId);
  const industriesData = await getIndustriesForRole(roleId);
  const pathwaysFrom = await getCareerPathwaysByStartingRole(roleId);
  const pathwaysTo = await getCareerPathwaysByTargetRole(roleId);

  return {
    ...roleData,
    skills: skillsData,
    industries: industriesData,
    pathwaysFrom,
    pathwaysTo
  };
}

// Get a complete skill profile with all related data
export async function getCompleteSkillProfile(skillId: number) {
  const skillData = await getSkillById(skillId);
  if (!skillData) return null;

  const prerequisiteSkills = await getPrerequisitesForSkill(skillId);
  
  // Find roles that require this skill
  const rolesWithSkill = await db
    .select({
      ...roles,
      importance: roleSkills.importance,
      levelRequired: roleSkills.levelRequired
    })
    .from(roles)
    .innerJoin(roleSkills, eq(roles.id, roleSkills.roleId))
    .where(eq(roleSkills.skillId, skillId))
    .orderBy(roles.title);

  // Find industries where this skill is relevant
  const relevantIndustries = await db
    .select({
      ...industries,
      importance: skillIndustries.importance,
      trendDirection: skillIndustries.trendDirection
    })
    .from(industries)
    .innerJoin(skillIndustries, eq(industries.id, skillIndustries.industryId))
    .where(eq(skillIndustries.skillId, skillId))
    .orderBy(industries.name);

  // Get learning resources
  const resources = await getLearningResourcesForSkill(skillId);

  // Skills that have this skill as a prerequisite
  const dependentSkills = await db
    .select({
      ...skills,
      importance: skillPrerequisites.importance
    })
    .from(skills)
    .innerJoin(
      skillPrerequisites, 
      and(
        eq(skills.id, skillPrerequisites.skillId),
        eq(skillPrerequisites.prerequisiteId, skillId)
      )
    )
    .orderBy(skills.name);

  return {
    ...skillData,
    prerequisiteSkills,
    dependentSkills,
    roles: rolesWithSkill,
    industries: relevantIndustries,
    learningResources: resources
  };
}

// Get a complete industry profile with all related data
export async function getCompleteIndustryProfile(industryId: number) {
  const industryData = await getIndustryById(industryId);
  if (!industryData) return null;

  const rolesData = await getRolesForIndustry(industryId);
  const skillsData = await getSkillsForIndustry(industryId);

  return {
    ...industryData,
    roles: rolesData,
    skills: skillsData
  };
}

// Create a skill acquisition pathway
export async function getSkillAcquisitionPathway(skillId: number) {
  const skill = await getSkillById(skillId);
  if (!skill) return null;

  // Get prerequisites in order of importance
  const prerequisites = await getPrerequisitesForSkill(skillId);
  
  // Get learning resources
  const resources = await getLearningResourcesForSkill(skillId);

  // For each prerequisite, recursively get its prerequisites (limited to avoid infinite loops)
  const prerequisites_with_deps = await Promise.all(prerequisites.map(async prereq => {
    const prereqData = await getPrerequisitesForSkill(prereq.id);
    return {
      ...prereq,
      prerequisites: prereqData
    };
  }));
  
  // Get roles that require this skill
  const relevantRoles = await db
    .select({
      ...roles,
      importance: roleSkills.importance,
      levelRequired: roleSkills.levelRequired
    })
    .from(roles)
    .innerJoin(roleSkills, eq(roles.id, roleSkills.roleId))
    .where(eq(roleSkills.skillId, skillId))
    .orderBy(roleSkills.importance);

  return {
    skill,
    prerequisites: prerequisites_with_deps,
    learningResources: resources,
    relevantRoles: relevantRoles
  };
}

// Get suggested learning pathway between two roles
export async function getCareerTransitionPathway(fromRoleId: number, toRoleId: number) {
  const fromRole = await getRoleById(fromRoleId);
  const toRole = await getRoleById(toRoleId);
  
  if (!fromRole || !toRole) return null;

  // Get skills for the current role
  const currentSkills = await getSkillsForRole(fromRoleId);
  
  // Get skills for the target role
  const targetSkills = await getSkillsForRole(toRoleId);
  
  // Identify skill gaps (skills in target role but not in current role)
  const currentSkillIds = currentSkills.map(s => s.id);
  const skillGaps = targetSkills.filter(s => !currentSkillIds.includes(s.id));
  
  // For each skill gap, get learning resources and prerequisites
  const skillGapsWithDetails = await Promise.all(
    skillGaps.map(async skill => {
      const prerequisites = await getPrerequisitesForSkill(skill.id);
      const resources = await getLearningResourcesForSkill(skill.id);
      
      return {
        ...skill,
        prerequisites,
        learningResources: resources
      };
    })
  );
  
  // Sort skill gaps by importance
  const sortedSkillGaps = skillGapsWithDetails.sort((a, b) => {
    const importanceOrder = { "Essential": 1, "Important": 2, "Beneficial": 3 };
    return (importanceOrder[a.importance as keyof typeof importanceOrder] || 99) - 
           (importanceOrder[b.importance as keyof typeof importanceOrder] || 99);
  });
  
  // Get existing pathways between these roles
  const existingPathways = await db
    .select()
    .from(careerPathways)
    .where(
      and(
        eq(careerPathways.startingRoleId, fromRoleId),
        eq(careerPathways.targetRoleId, toRoleId)
      )
    );
  
  return {
    fromRole,
    toRole,
    currentSkills,
    targetSkills,
    skillGaps: sortedSkillGaps,
    existingPathways
  };
}

// Search across all entities (skills, roles, industries)
export async function searchAll(query: string) {
  console.log('searchAll function called with query:', query);
  
  // Log all existing skills for debugging
  const allSkills = await getAllSkills();
  console.log('All skills in database:', allSkills.map(s => s.name));
  
  // Perform searches in parallel for better performance
  const [skillResults, roleResults, industryResults] = await Promise.all([
    searchSkills(query),
    searchRoles(query),
    searchIndustries(query)
  ]);
  
  console.log('Skill results:', skillResults);
  console.log('Role results:', roleResults);
  console.log('Industry results:', industryResults);
  
  return {
    skills: skillResults,
    roles: roleResults,
    industries: industryResults
  };
}

// Get popular (most referenced) items
export async function getPopularSkills(limit: number = 10): Promise<Skill[]> {
  // Skills that are required by the most roles
  const result = await db
    .select({
      skill: skills,
      roleCount: sql<number>`count(${roleSkills.roleId})`
    })
    .from(skills)
    .leftJoin(roleSkills, eq(skills.id, roleSkills.skillId))
    .groupBy(skills.id)
    .orderBy(desc(sql`count(${roleSkills.roleId})`))
    .limit(limit);
  
  return result.map(r => r.skill);
}

export async function getPopularRoles(limit: number = 10): Promise<Role[]> {
  // Roles that are present in the most industries
  const result = await db
    .select({
      role: roles,
      industryCount: sql<number>`count(${roleIndustries.industryId})`
    })
    .from(roles)
    .leftJoin(roleIndustries, eq(roles.id, roleIndustries.roleId))
    .groupBy(roles.id)
    .orderBy(desc(sql`count(${roleIndustries.industryId})`))
    .limit(limit);
  
  return result.map(r => r.role);
}

export async function getPopularIndustries(limit: number = 10): Promise<Industry[]> {
  // Industries with the most roles
  const result = await db
    .select({
      industry: industries,
      roleCount: sql<number>`count(${roleIndustries.roleId})`
    })
    .from(industries)
    .leftJoin(roleIndustries, eq(industries.id, roleIndustries.industryId))
    .groupBy(industries.id)
    .orderBy(desc(sql`count(${roleIndustries.roleId})`))
    .limit(limit);
  
  return result.map(r => r.industry);
}