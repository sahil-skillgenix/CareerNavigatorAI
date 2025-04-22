/**
 * API endpoints for searching skills, roles, and industries
 */

import { Request, Response } from 'express';
import { 
  SkillModel, 
  RoleModel, 
  IndustryModel,
  RoleSkillModel,
  SkillPrerequisiteModel,
  CareerPathwayModel
} from '../db/models';

// Get all skills
export async function getAllSkills(req: Request, res: Response) {
  try {
    const skills = await SkillModel.find({}).sort({ name: 1 });
    res.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
}

// Get all roles
export async function getAllRoles(req: Request, res: Response) {
  try {
    const roles = await RoleModel.find({}).sort({ title: 1 });
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
}

// Get all industries
export async function getAllIndustries(req: Request, res: Response) {
  try {
    const industries = await IndustryModel.find({}).sort({ name: 1 });
    res.json(industries);
  } catch (error) {
    console.error('Error fetching industries:', error);
    res.status(500).json({ error: 'Failed to fetch industries' });
  }
}

// Search skills by query
export async function searchSkills(req: Request, res: Response) {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json([]);
    }
    
    const skills = await SkillModel.find({
      $or: [
        { name: { $regex: query as string, $options: 'i' } },
        { category: { $regex: query as string, $options: 'i' } },
        { description: { $regex: query as string, $options: 'i' } }
      ]
    }).limit(10).sort({ name: 1 });
    
    res.json(skills);
  } catch (error) {
    console.error('Error searching skills:', error);
    res.status(500).json({ error: 'Failed to search skills' });
  }
}

// Search roles by query
export async function searchRoles(req: Request, res: Response) {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json([]);
    }
    
    const roles = await RoleModel.find({
      $or: [
        { title: { $regex: query as string, $options: 'i' } },
        { category: { $regex: query as string, $options: 'i' } },
        { description: { $regex: query as string, $options: 'i' } }
      ]
    }).limit(10).sort({ title: 1 });
    
    res.json(roles);
  } catch (error) {
    console.error('Error searching roles:', error);
    res.status(500).json({ error: 'Failed to search roles' });
  }
}

// Search industries by query
export async function searchIndustries(req: Request, res: Response) {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json([]);
    }
    
    const industries = await IndustryModel.find({
      $or: [
        { name: { $regex: query as string, $options: 'i' } },
        { category: { $regex: query as string, $options: 'i' } },
        { description: { $regex: query as string, $options: 'i' } }
      ]
    }).limit(10).sort({ name: 1 });
    
    res.json(industries);
  } catch (error) {
    console.error('Error searching industries:', error);
    res.status(500).json({ error: 'Failed to search industries' });
  }
}

// Get skills for a role
export async function getSkillsForRole(req: Request, res: Response) {
  try {
    const { roleId } = req.params;
    
    const roleSkills = await RoleSkillModel.find({ roleId: parseInt(roleId) });
    const skillIds = roleSkills.map(rs => rs.skillId);
    
    if (skillIds.length === 0) {
      return res.json([]);
    }
    
    const skills = await SkillModel.find({ id: { $in: skillIds } });
    
    // Combine skills with their relationship info
    const skillsWithLevels = skills.map(skill => {
      const roleSkill = roleSkills.find(rs => rs.skillId === skill.id);
      return {
        ...skill.toObject(),
        importance: roleSkill?.importance,
        levelRequired: roleSkill?.levelRequired,
        context: roleSkill?.context
      };
    });
    
    res.json(skillsWithLevels);
  } catch (error) {
    console.error('Error fetching skills for role:', error);
    res.status(500).json({ error: 'Failed to fetch skills for role' });
  }
}

// Search all entities
export async function searchAll(req: Request, res: Response) {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json({
        skills: [],
        roles: [],
        industries: []
      });
    }
    
    const skills = await SkillModel.find({
      $or: [
        { name: { $regex: query as string, $options: 'i' } },
        { category: { $regex: query as string, $options: 'i' } }
      ]
    }).limit(10).sort({ name: 1 });
    
    const roles = await RoleModel.find({
      $or: [
        { title: { $regex: query as string, $options: 'i' } },
        { category: { $regex: query as string, $options: 'i' } }
      ]
    }).limit(10).sort({ title: 1 });
    
    const industries = await IndustryModel.find({
      $or: [
        { name: { $regex: query as string, $options: 'i' } },
        { category: { $regex: query as string, $options: 'i' } }
      ]
    }).limit(10).sort({ name: 1 });
    
    res.json({
      skills,
      roles,
      industries
    });
  } catch (error) {
    console.error('Error searching all entities:', error);
    res.status(500).json({ error: 'Failed to search entities' });
  }
}