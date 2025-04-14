import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SkillToLearn {
  skill: string;
  currentLevel: string | number;
  targetLevel: string | number;
  context: string;
  learningStyle?: "visual" | "auditory" | "reading" | "kinesthetic" | string;
}

export interface LearningResource {
  id: string;
  title: string;
  type: "course" | "book" | "tutorial" | "video" | "podcast" | "article" | "practice" | "certification" | string;
  provider: string;
  url?: string;
  description: string;
  estimatedHours: number;
  difficulty: "beginner" | "intermediate" | "advanced" | "expert" | string;
  costType: "free" | "freemium" | "paid" | "subscription" | string;
  tags: string[];
  relevanceScore: number; // 1-10
  matchReason: string;
}

export interface LearningPathRecommendation {
  skill: string;
  description: string;
  recommendedSequence: {
    step: number;
    resources: LearningResource[];
    milestone: string;
    estimatedTimeToComplete: string;
  }[];
}

export async function getResourceRecommendations(
  skills: SkillToLearn[],
  preferredTypes?: string[],
  maxResults: number = 5
): Promise<Record<string, LearningResource[]>> {
  try {
    const userTypePreference = preferredTypes && preferredTypes.length > 0 
      ? `User prefers these resource types: ${preferredTypes.join(', ')}.` 
      : '';
    
    const prompt = `
    Act as an expert learning resource curator with extensive knowledge of educational platforms, courses, books, and other learning materials.

    I need specific, high-quality learning resources for each of the following skills:
    ${skills.map(skill => `
    SKILL: ${skill.skill}
    Current Level: ${skill.currentLevel}
    Target Level: ${skill.targetLevel}
    Context: ${skill.context}
    ${skill.learningStyle ? `Learning Style: ${skill.learningStyle}` : ''}
    `).join('\n')}

    ${userTypePreference}

    For each skill, provide exactly ${maxResults} learning resources. Each resource MUST include:
    1. A specific title (exact name of the resource)
    2. The resource type (course, book, tutorial, video, podcast, article, practice, certification)
    3. Provider (platform/publisher/organization offering the resource)
    4. A URL if available (put "N/A" if not applicable)
    5. A brief description (2-3 sentences max)
    6. Estimated hours to complete (a reasonable number)
    7. Difficulty level (beginner, intermediate, advanced, expert)
    8. Cost type (free, freemium, paid, subscription)
    9. Tags (relevant keywords)
    10. Relevance score (1-10, where 10 is most relevant)
    11. Match reason (brief explanation of why this resource is relevant)

    Format your response as a JSON object where the keys are skill names and the values are arrays of learning resources.
    IMPORTANT: All resources must be real, currently available materials. Do not generate fictional resources.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert learning resource curator with extensive knowledge of educational platforms, courses, books, and other learning materials. You only recommend real, existing resources that are currently available."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const content = response.choices[0].message.content || "";
    if (!content) {
      throw new Error("Empty response from OpenAI API");
    }

    const recommendations = JSON.parse(content) as Record<string, LearningResource[]>;
    
    // Validate and ensure each resource has required fields
    Object.keys(recommendations).forEach(skill => {
      // Handle case where the skill key exists but the resources array is undefined
      if (!recommendations[skill]) {
        recommendations[skill] = [];
        return;
      }
      
      recommendations[skill] = recommendations[skill].map(resource => {
        if (!resource) {
          // Provide default values if resource is undefined
          return {
            id: `resource-${Math.random().toString(36).substring(2, 11)}`,
            title: "Resource unavailable",
            type: "article",
            provider: "Unknown",
            url: "N/A",
            description: "No description available",
            estimatedHours: 1,
            difficulty: "beginner",
            costType: "free",
            tags: [],
            relevanceScore: 5,
            matchReason: `Default resource for ${skill}`
          };
        }
        
        return {
          id: resource.id || `resource-${Math.random().toString(36).substring(2, 11)}`,
          title: resource.title || "Untitled Resource",
          type: resource.type || "article",
          provider: resource.provider || "Unknown",
          url: resource.url || "N/A",
          description: resource.description || "No description available",
          estimatedHours: resource.estimatedHours || 10,
          difficulty: resource.difficulty || "beginner",
          costType: resource.costType || "free",
          tags: resource.tags || [],
          relevanceScore: resource.relevanceScore || 7,
          matchReason: resource.matchReason || `Recommended for learning ${skill}`
        };
      });
    });

    return recommendations;
  } catch (error: unknown) {
    console.error("Error getting learning resources:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to get learning resources: ${error.message}`);
    } else {
      throw new Error("Failed to get learning resources: Unknown error");
    }
  }
}

export async function generateLearningPath(
  skill: string, 
  currentLevel: string | number, 
  targetLevel: string | number,
  context: string,
  learningStyle?: string
): Promise<LearningPathRecommendation> {
  try {
    const prompt = `
    Create a comprehensive learning path for someone who wants to develop the following skill:
    
    SKILL: ${skill}
    Current Level: ${currentLevel}
    Target Level: ${targetLevel}
    Context: ${context}
    ${learningStyle ? `Learning Style: ${learningStyle}` : ''}
    
    The learning path should include:
    1. A brief description of the skill and its importance
    2. A sequential series of steps (3-5 steps) to progress from current level to target level
    3. For each step, recommend 2-3 specific, real learning resources
    4. A clear milestone to achieve at each step
    5. Estimated time to complete each step
    
    Each resource MUST include:
    - Title (exact name of the resource)
    - Type (course, book, tutorial, video, etc.)
    - Provider (platform/publisher/creator)
    - URL if available (put "N/A" if not applicable)
    - A brief description
    - Estimated hours to complete
    - Difficulty level
    - Cost type (free, freemium, paid, subscription)
    - Why this resource is particularly valuable at this step
    
    Format your response as a JSON object following the LearningPathRecommendation interface.
    IMPORTANT: All resources must be real, currently available materials. Do not invent fictional resources.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert learning path designer specializing in skill development. You create structured, effective learning paths using real, currently available resources."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const content = response.choices[0].message.content || "";
    if (!content) {
      throw new Error("Empty response from OpenAI API");
    }

    let learningPath = JSON.parse(content) as LearningPathRecommendation;
    
    // Ensure the learning path has the required structure
    if (!learningPath.recommendedSequence) {
      learningPath.recommendedSequence = [];
    }
    
    // Ensure ID for each resource
    learningPath.recommendedSequence = learningPath.recommendedSequence.map(step => {
      if (!step.resources) {
        step.resources = [];
        return step;
      }
      
      step.resources = step.resources.map(resource => {
        if (!resource) return {
          id: `resource-${Math.random().toString(36).substring(2, 11)}`,
          title: "Resource unavailable",
          type: "article",
          provider: "Unknown",
          description: "No description available",
          estimatedHours: 1,
          difficulty: "beginner",
          costType: "free",
          tags: [],
          relevanceScore: 5,
          matchReason: "Added as fallback"
        };
        
        return {
          ...resource,
          id: resource.id || `resource-${Math.random().toString(36).substring(2, 11)}`
        };
      });
      return step;
    });

    // Ensure all required fields are present
    if (!learningPath.skill) {
      learningPath.skill = skill;
    }
    
    if (!learningPath.description) {
      learningPath.description = `Learning path for ${skill}`;
    }

    return learningPath;
  } catch (error: unknown) {
    console.error("Error generating learning path:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate learning path: ${error.message}`);
    } else {
      throw new Error("Failed to generate learning path: Unknown error");
    }
  }
}