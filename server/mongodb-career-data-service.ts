// Import MongoDB models
import {
  IndustryModel,
  SkillModel,
  RoleModel,
  RoleSkillModel,
  RoleIndustryModel,
  SkillIndustryModel,
  SkillPrerequisiteModel,
  LearningResourceModel,
  CareerPathwayModel
} from './db/models';

// Import types from schema for compatibility with existing code
import {
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

// Helper functions for converting between MongoDB and schema types
const convertIndustry = (doc: any): Industry => ({
  id: doc._id.toString(),
  name: doc.name,
  category: doc.category,
  description: doc.description,
  growthRate: doc.growthRate,
  averageSalary: doc.averageSalary,
  jobCount: doc.jobCount,
  entryLevelPercentage: doc.entryLevelPercentage,
  topCompanies: doc.topCompanies,
  createdAt: doc.createdAt?.toISOString() || new Date().toISOString()
});

const convertSkill = (doc: any): Skill => ({
  id: doc._id.toString(),
  name: doc.name,
  category: doc.category,
  description: doc.description,
  difficulty: doc.difficulty,
  timeToLearn: doc.timeToLearn,
  popularity: doc.popularity,
  futureDemand: doc.futureDemand,
  createdAt: doc.createdAt?.toISOString() || new Date().toISOString()
});

const convertRole = (doc: any): Role => ({
  id: doc._id.toString(),
  title: doc.title,
  category: doc.category,
  description: doc.description,
  averageSalary: doc.averageSalary,
  entryLevelSalary: doc.entryLevelSalary,
  seniorLevelSalary: doc.seniorLevelSalary,
  education: doc.education,
  experience: doc.experience,
  popularity: doc.popularity,
  createdAt: doc.createdAt?.toISOString() || new Date().toISOString()
});

// Industries
export async function getAllIndustries(): Promise<Industry[]> {
  try {
    const industries = await IndustryModel.find().sort({ name: 1 });
    return industries.map(industry => convertIndustry(industry));
  } catch (error) {
    console.error('Error fetching industries:', error);
    return [];
  }
}

export async function getIndustryById(id: number): Promise<Industry | undefined> {
  try {
    const industry = await IndustryModel.findById(id);
    return industry ? convertIndustry(industry) : undefined;
  } catch (error) {
    console.error(`Error fetching industry ${id}:`, error);
    return undefined;
  }
}

export async function searchIndustries(query: string): Promise<Industry[]> {
  try {
    const industries = await IndustryModel.find({
      name: { $regex: query, $options: 'i' }
    }).sort({ name: 1 });
    
    return industries.map(industry => convertIndustry(industry));
  } catch (error) {
    console.error(`Error searching industries for "${query}":`, error);
    return [];
  }
}

export async function getIndustryByCategory(category: string): Promise<Industry[]> {
  try {
    const industries = await IndustryModel.find({ category }).sort({ name: 1 });
    return industries.map(industry => convertIndustry(industry));
  } catch (error) {
    console.error(`Error fetching industries by category "${category}":`, error);
    return [];
  }
}

// Skills
export async function getAllSkills(): Promise<Skill[]> {
  try {
    const skills = await SkillModel.find().sort({ name: 1 });
    return skills.map(skill => convertSkill(skill));
  } catch (error) {
    console.error('Error fetching skills:', error);
    return [];
  }
}

export async function getSkillById(id: number): Promise<Skill | undefined> {
  try {
    const skill = await SkillModel.findById(id);
    return skill ? convertSkill(skill) : undefined;
  } catch (error) {
    console.error(`Error fetching skill ${id}:`, error);
    return undefined;
  }
}

export async function searchSkills(query: string): Promise<Skill[]> {
  try {
    const skills = await SkillModel.find({
      name: { $regex: query, $options: 'i' }
    }).sort({ name: 1 });
    
    return skills.map(skill => convertSkill(skill));
  } catch (error) {
    console.error(`Error searching skills for "${query}":`, error);
    return [];
  }
}

export async function getSkillsByCategory(category: string): Promise<Skill[]> {
  try {
    const skills = await SkillModel.find({ category }).sort({ name: 1 });
    return skills.map(skill => convertSkill(skill));
  } catch (error) {
    console.error(`Error fetching skills by category "${category}":`, error);
    return [];
  }
}

export async function getSkillsForIndustry(industryId: number): Promise<(Skill & { importance: string, trendDirection: string })[]> {
  try {
    const skillIndustries = await SkillIndustryModel.find({ industryId });
    
    const skillIds = skillIndustries.map(si => si.skillId);
    const skills = await SkillModel.find({ _id: { $in: skillIds } });
    
    // Create a map for quick lookup
    const skillIdMap = new Map();
    skills.forEach(skill => {
      skillIdMap.set(skill._id.toString(), skill);
    });
    
    // Map each relationship to the combined object
    return skillIndustries.map(si => {
      const skill = skillIdMap.get(si.skillId.toString());
      if (!skill) return null;
      
      return {
        ...convertSkill(skill),
        importance: si.importance,
        trendDirection: si.trendDirection
      };
    }).filter(Boolean); // Remove null values
  } catch (error) {
    console.error(`Error fetching skills for industry ${industryId}:`, error);
    return [];
  }
}

export async function getPrerequisitesForSkill(skillId: number): Promise<(Skill & { importance: string })[]> {
  try {
    const prerequisites = await SkillPrerequisiteModel.find({ skillId });
    
    const prerequisiteIds = prerequisites.map(p => p.prerequisiteId);
    const skills = await SkillModel.find({ _id: { $in: prerequisiteIds } });
    
    // Create a map for quick lookup
    const skillIdMap = new Map();
    skills.forEach(skill => {
      skillIdMap.set(skill._id.toString(), skill);
    });
    
    // Map each relationship to the combined object
    return prerequisites.map(p => {
      const skill = skillIdMap.get(p.prerequisiteId.toString());
      if (!skill) return null;
      
      return {
        ...convertSkill(skill),
        importance: p.importance
      };
    }).filter(Boolean); // Remove null values
  } catch (error) {
    console.error(`Error fetching prerequisites for skill ${skillId}:`, error);
    return [];
  }
}

export async function getLearningResourcesForSkill(skillId: number): Promise<LearningResource[]> {
  try {
    const resources = await LearningResourceModel.find({ skillId }).sort({ rating: -1 });
    
    return resources.map(resource => ({
      id: resource._id.toString(),
      skillId: resource.skillId.toString(),
      title: resource.title,
      provider: resource.provider,
      type: resource.type,
      url: resource.url,
      description: resource.description,
      estimatedHours: resource.estimatedHours,
      difficulty: resource.difficulty,
      costType: resource.costType,
      rating: resource.rating,
      createdAt: resource.createdAt?.toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error(`Error fetching learning resources for skill ${skillId}:`, error);
    return [];
  }
}

// Roles
export async function getAllRoles(): Promise<Role[]> {
  try {
    const roles = await RoleModel.find().sort({ title: 1 });
    return roles.map(role => convertRole(role));
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
}

export async function getRoleById(id: number): Promise<Role | undefined> {
  try {
    const role = await RoleModel.findById(id);
    return role ? convertRole(role) : undefined;
  } catch (error) {
    console.error(`Error fetching role ${id}:`, error);
    return undefined;
  }
}

export async function searchRoles(query: string): Promise<Role[]> {
  try {
    const roles = await RoleModel.find({
      title: { $regex: query, $options: 'i' }
    }).sort({ title: 1 });
    
    return roles.map(role => convertRole(role));
  } catch (error) {
    console.error(`Error searching roles for "${query}":`, error);
    return [];
  }
}

export async function getRolesByCategory(category: string): Promise<Role[]> {
  try {
    const roles = await RoleModel.find({ category }).sort({ title: 1 });
    return roles.map(role => convertRole(role));
  } catch (error) {
    console.error(`Error fetching roles by category "${category}":`, error);
    return [];
  }
}

export async function getRolesForIndustry(industryId: number): Promise<(Role & { prevalence: string })[]> {
  try {
    const roleIndustries = await RoleIndustryModel.find({ industryId });
    
    const roleIds = roleIndustries.map(ri => ri.roleId);
    const roles = await RoleModel.find({ _id: { $in: roleIds } });
    
    // Create a map for quick lookup
    const roleIdMap = new Map();
    roles.forEach(role => {
      roleIdMap.set(role._id.toString(), role);
    });
    
    // Map each relationship to the combined object
    return roleIndustries.map(ri => {
      const role = roleIdMap.get(ri.roleId.toString());
      if (!role) return null;
      
      return {
        ...convertRole(role),
        prevalence: ri.prevalence
      };
    }).filter(Boolean); // Remove null values
  } catch (error) {
    console.error(`Error fetching roles for industry ${industryId}:`, error);
    return [];
  }
}

export async function getSkillsForRole(roleId: number): Promise<(Skill & { importance: string, levelRequired: string })[]> {
  try {
    const roleSkills = await RoleSkillModel.find({ roleId });
    
    const skillIds = roleSkills.map(rs => rs.skillId);
    const skills = await SkillModel.find({ _id: { $in: skillIds } });
    
    // Create a map for quick lookup
    const skillIdMap = new Map();
    skills.forEach(skill => {
      skillIdMap.set(skill._id.toString(), skill);
    });
    
    // Map each relationship to the combined object
    return roleSkills.map(rs => {
      const skill = skillIdMap.get(rs.skillId.toString());
      if (!skill) return null;
      
      return {
        ...convertSkill(skill),
        importance: rs.importance,
        levelRequired: rs.levelRequired
      };
    }).filter(Boolean); // Remove null values
  } catch (error) {
    console.error(`Error fetching skills for role ${roleId}:`, error);
    return [];
  }
}

export async function getIndustriesForRole(roleId: number): Promise<(Industry & { prevalence: string })[]> {
  try {
    const roleIndustries = await RoleIndustryModel.find({ roleId });
    
    const industryIds = roleIndustries.map(ri => ri.industryId);
    const industries = await IndustryModel.find({ _id: { $in: industryIds } });
    
    // Create a map for quick lookup
    const industryIdMap = new Map();
    industries.forEach(industry => {
      industryIdMap.set(industry._id.toString(), industry);
    });
    
    // Map each relationship to the combined object
    return roleIndustries.map(ri => {
      const industry = industryIdMap.get(ri.industryId.toString());
      if (!industry) return null;
      
      return {
        ...convertIndustry(industry),
        prevalence: ri.prevalence
      };
    }).filter(Boolean); // Remove null values
  } catch (error) {
    console.error(`Error fetching industries for role ${roleId}:`, error);
    return [];
  }
}

// Pathways
export async function getAllCareerPathways(): Promise<CareerPathway[]> {
  try {
    const pathways = await CareerPathwayModel.find().sort({ name: 1 });
    
    return pathways.map(pathway => ({
      id: pathway._id.toString(),
      name: pathway.name,
      description: pathway.description,
      startingRoleId: pathway.startingRoleId.toString(),
      targetRoleId: pathway.targetRoleId.toString(),
      estimatedTimeMonths: pathway.estimatedTimeMonths,
      difficultyLevel: pathway.difficultyLevel,
      requiredEducation: pathway.requiredEducation,
      stepsJson: pathway.stepsJson,
      popularity: pathway.popularity,
      createdAt: pathway.createdAt?.toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching career pathways:', error);
    return [];
  }
}

export async function getCareerPathwayById(id: number): Promise<CareerPathway | undefined> {
  try {
    const pathway = await CareerPathwayModel.findById(id);
    
    if (!pathway) return undefined;
    
    return {
      id: pathway._id.toString(),
      name: pathway.name,
      description: pathway.description,
      startingRoleId: pathway.startingRoleId.toString(),
      targetRoleId: pathway.targetRoleId.toString(),
      estimatedTimeMonths: pathway.estimatedTimeMonths,
      difficultyLevel: pathway.difficultyLevel,
      requiredEducation: pathway.requiredEducation,
      stepsJson: pathway.stepsJson,
      popularity: pathway.popularity,
      createdAt: pathway.createdAt?.toISOString() || new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching career pathway ${id}:`, error);
    return undefined;
  }
}

export async function getCareerPathwaysByStartingRole(roleId: number): Promise<CareerPathway[]> {
  try {
    const pathways = await CareerPathwayModel.find({ startingRoleId: roleId }).sort({ name: 1 });
    
    return pathways.map(pathway => ({
      id: pathway._id.toString(),
      name: pathway.name,
      description: pathway.description,
      startingRoleId: pathway.startingRoleId.toString(),
      targetRoleId: pathway.targetRoleId.toString(),
      estimatedTimeMonths: pathway.estimatedTimeMonths,
      difficultyLevel: pathway.difficultyLevel,
      requiredEducation: pathway.requiredEducation,
      stepsJson: pathway.stepsJson,
      popularity: pathway.popularity,
      createdAt: pathway.createdAt?.toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error(`Error fetching career pathways by starting role ${roleId}:`, error);
    return [];
  }
}

export async function getCareerPathwaysByTargetRole(roleId: number): Promise<CareerPathway[]> {
  try {
    const pathways = await CareerPathwayModel.find({ targetRoleId: roleId }).sort({ name: 1 });
    
    return pathways.map(pathway => ({
      id: pathway._id.toString(),
      name: pathway.name,
      description: pathway.description,
      startingRoleId: pathway.startingRoleId.toString(),
      targetRoleId: pathway.targetRoleId.toString(),
      estimatedTimeMonths: pathway.estimatedTimeMonths,
      difficultyLevel: pathway.difficultyLevel,
      requiredEducation: pathway.requiredEducation,
      stepsJson: pathway.stepsJson,
      popularity: pathway.popularity,
      createdAt: pathway.createdAt?.toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error(`Error fetching career pathways by target role ${roleId}:`, error);
    return [];
  }
}

// Composite operations
export async function getCompleteRoleProfile(roleId: number) {
  try {
    const role = await getRoleById(roleId);
    if (!role) return null;
    
    const skills = await getSkillsForRole(roleId);
    const industries = await getIndustriesForRole(roleId);
    const pathwaysAsStarting = await getCareerPathwaysByStartingRole(roleId);
    const pathwaysAsTarget = await getCareerPathwaysByTargetRole(roleId);
    
    return {
      role,
      skills,
      industries,
      pathways: {
        asStarting: pathwaysAsStarting,
        asTarget: pathwaysAsTarget
      }
    };
  } catch (error) {
    console.error(`Error fetching complete role profile for ${roleId}:`, error);
    return null;
  }
}

export async function getCompleteSkillProfile(skillId: number) {
  try {
    const skill = await getSkillById(skillId);
    if (!skill) return null;
    
    const prerequisites = await getPrerequisitesForSkill(skillId);
    const industries = await SkillIndustryModel.find({ skillId })
      .populate('industryId')
      .lean();
      
    const mappedIndustries = industries.map(si => ({
      ...convertIndustry(si.industryId),
      importance: si.importance,
      trendDirection: si.trendDirection
    }));
    
    const roles = await RoleSkillModel.find({ skillId })
      .populate('roleId')
      .lean();
      
    const mappedRoles = roles.map(rs => ({
      ...convertRole(rs.roleId),
      importance: rs.importance,
      levelRequired: rs.levelRequired
    }));
    
    const learningResources = await getLearningResourcesForSkill(skillId);
    
    return {
      skill,
      prerequisites,
      industries: mappedIndustries,
      roles: mappedRoles,
      learningResources
    };
  } catch (error) {
    console.error(`Error fetching complete skill profile for ${skillId}:`, error);
    return null;
  }
}

export async function getCompleteIndustryProfile(industryId: number) {
  try {
    const industry = await getIndustryById(industryId);
    if (!industry) return null;
    
    const skills = await getSkillsForIndustry(industryId);
    const roles = await getRolesForIndustry(industryId);
    
    return {
      industry,
      skills,
      roles
    };
  } catch (error) {
    console.error(`Error fetching complete industry profile for ${industryId}:`, error);
    return null;
  }
}

export async function getSkillAcquisitionPathway(skillId: number) {
  try {
    const skill = await getSkillById(skillId);
    if (!skill) return null;
    
    const prerequisites = await getPrerequisitesForSkill(skillId);
    const resources = await getLearningResourcesForSkill(skillId);
    
    // For each prerequisite, get its prerequisites recursively to a maximum depth
    const prerequisiteTree = await buildPrerequisiteTree(skillId, 3);
    
    return {
      targetSkill: skill,
      prerequisites,
      prerequisiteTree,
      learningResources: resources
    };
  } catch (error) {
    console.error(`Error fetching skill acquisition pathway for ${skillId}:`, error);
    return null;
  }
}

// Helper function to build the prerequisite tree
async function buildPrerequisiteTree(skillId: number, depth: number): Promise<any> {
  if (depth <= 0) return null;
  
  const prerequisites = await getPrerequisitesForSkill(skillId);
  if (!prerequisites.length) return null;
  
  const result = [];
  for (const prereq of prerequisites) {
    const children = await buildPrerequisiteTree(Number(prereq.id), depth - 1);
    result.push({
      skill: prereq,
      children
    });
  }
  
  return result;
}

export async function getCareerTransitionPathway(fromRoleId: number, toRoleId: number) {
  try {
    const fromRole = await getRoleById(fromRoleId);
    const toRole = await getRoleById(toRoleId);
    
    if (!fromRole || !toRole) return null;
    
    // Find direct pathways between these roles
    const directPathways = await CareerPathwayModel.find({
      startingRoleId: fromRoleId,
      targetRoleId: toRoleId
    }).lean();
    
    // If direct pathway exists, use it
    if (directPathways.length > 0) {
      return {
        fromRole,
        toRole,
        pathway: {
          ...directPathways[0],
          id: directPathways[0]._id.toString(),
          startingRoleId: directPathways[0].startingRoleId.toString(),
          targetRoleId: directPathways[0].targetRoleId.toString(),
          createdAt: directPathways[0].createdAt?.toISOString() || new Date().toISOString()
        },
        skillGap: await getSkillGapBetweenRoles(fromRoleId, toRoleId)
      };
    }
    
    // Otherwise construct a synthetic pathway
    const fromRoleSkills = await getSkillsForRole(fromRoleId);
    const toRoleSkills = await getSkillsForRole(toRoleId);
    
    // Identify missing skills
    const missingSkills = toRoleSkills.filter(targetSkill => 
      !fromRoleSkills.some(currentSkill => currentSkill.id === targetSkill.id)
    );
    
    // Identify skills that need improvement
    const skillsToImprove = toRoleSkills.filter(targetSkill => {
      const currentSkill = fromRoleSkills.find(s => s.id === targetSkill.id);
      if (!currentSkill) return false;
      
      // Compare level required
      const currentLevel = currentSkill.levelRequired;
      const targetLevel = targetSkill.levelRequired;
      
      // Simple mapping of levels to numeric values for comparison
      const levelMap: Record<string, number> = {
        'Basic': 1,
        'Intermediate': 2,
        'Advanced': 3,
        'Expert': 4
      };
      
      return levelMap[targetLevel] > levelMap[currentLevel];
    });
    
    return {
      fromRole,
      toRole,
      pathway: null,
      skillGap: {
        missingSkills,
        skillsToImprove
      }
    };
  } catch (error) {
    console.error(`Error fetching career transition pathway from ${fromRoleId} to ${toRoleId}:`, error);
    return null;
  }
}

async function getSkillGapBetweenRoles(fromRoleId: number, toRoleId: number) {
  try {
    const fromRoleSkills = await getSkillsForRole(fromRoleId);
    const toRoleSkills = await getSkillsForRole(toRoleId);
    
    // Identify missing skills
    const missingSkills = toRoleSkills.filter(targetSkill => 
      !fromRoleSkills.some(currentSkill => currentSkill.id === targetSkill.id)
    );
    
    // Identify skills that need improvement
    const skillsToImprove = toRoleSkills.filter(targetSkill => {
      const currentSkill = fromRoleSkills.find(s => s.id === targetSkill.id);
      if (!currentSkill) return false;
      
      // Compare level required
      const currentLevel = currentSkill.levelRequired;
      const targetLevel = targetSkill.levelRequired;
      
      // Simple mapping of levels to numeric values for comparison
      const levelMap: Record<string, number> = {
        'Basic': 1,
        'Intermediate': 2,
        'Advanced': 3,
        'Expert': 4
      };
      
      return levelMap[targetLevel] > levelMap[currentLevel];
    });
    
    return {
      missingSkills,
      skillsToImprove
    };
  } catch (error) {
    console.error(`Error calculating skill gap between roles ${fromRoleId} and ${toRoleId}:`, error);
    return {
      missingSkills: [],
      skillsToImprove: []
    };
  }
}

export async function searchAll(query: string) {
  try {
    const industries = await searchIndustries(query);
    const skills = await searchSkills(query);
    const roles = await searchRoles(query);
    
    return {
      industries,
      skills,
      roles
    };
  } catch (error) {
    console.error(`Error performing global search for "${query}":`, error);
    return {
      industries: [],
      skills: [],
      roles: []
    };
  }
}

export async function getPopularSkills(limit: number = 10): Promise<Skill[]> {
  try {
    const skills = await SkillModel.find()
      .sort({ popularity: -1 })
      .limit(limit);
      
    return skills.map(skill => convertSkill(skill));
  } catch (error) {
    console.error(`Error fetching popular skills:`, error);
    return [];
  }
}

export async function getPopularRoles(limit: number = 10): Promise<Role[]> {
  try {
    const roles = await RoleModel.find()
      .sort({ popularity: -1 })
      .limit(limit);
      
    return roles.map(role => convertRole(role));
  } catch (error) {
    console.error(`Error fetching popular roles:`, error);
    return [];
  }
}

export async function getPopularIndustries(limit: number = 10): Promise<Industry[]> {
  try {
    const industries = await IndustryModel.find()
      .sort({ jobCount: -1 })
      .limit(limit);
      
    return industries.map(industry => convertIndustry(industry));
  } catch (error) {
    console.error(`Error fetching popular industries:`, error);
    return [];
  }
}