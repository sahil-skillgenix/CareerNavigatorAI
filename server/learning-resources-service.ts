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
    console.log("Starting resource recommendation process for skills:", skills.map(s => s.skill).join(', '));
    
    const userTypePreference = preferredTypes && preferredTypes.length > 0 
      ? `User prefers these resource types: ${preferredTypes.join(', ')}.` 
      : '';
    
    // FIRST PASS - Initial resource generation
    const initialPrompt = `
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
    IMPORTANT: All resources must be real, currently available materials. Do not generate fictional resources. Ensure URLs are valid and accurate.
    `;

    console.log("Executing first pass (initial resource generation)");
    
    const initialResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert learning resource curator with extensive knowledge of educational platforms, courses, books, and other learning materials. You only recommend real, existing resources that are currently available."
        },
        { role: "user", content: initialPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const initialContent = initialResponse.choices[0].message.content || "";
    if (!initialContent) {
      throw new Error("Empty response from OpenAI API during initial resource generation");
    }

    // Parse initial recommendations
    const initialRecommendations = JSON.parse(initialContent) as Record<string, LearningResource[]>;
    console.log(`First pass complete. Found resources for ${Object.keys(initialRecommendations).length} skills`);
    
    // SECOND PASS - Validation and enhancement
    console.log("Executing second pass (validation and enhancement)");
    const validationPrompt = `
    You are a quality assurance specialist for learning resource recommendations. 
    Below is a set of recommended learning resources for various skills.
    
    Please review these recommendations carefully and ensure:
    1. All resources are real, currently available materials
    2. All URLs and providers are accurate and match the resource title
    3. All descriptions accurately describe the content
    4. Resource types are appropriate for the content
    5. Difficulty levels and estimated hours are reasonable
    6. Relevance scores accurately reflect how well the resource matches the skill needs
    
    Add, modify, or remove resources as needed to ensure high quality recommendations.
    If a resource seems questionable or potentially fictional, replace it with a verified alternative.
    
    Here are the current recommendations:
    ${JSON.stringify(initialRecommendations, null, 2)}
    
    Return the validated and improved recommendations in the same JSON format.
    IMPORTANT: Your response must be valid JSON that follows the exact same structure.
    `;

    const validationResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a quality assurance specialist for learning resource recommendations. Your job is to verify that all recommendations are accurate, high-quality, and represent real, available resources."
        },
        { role: "user", content: validationPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more precise validation
    });

    const validationContent = validationResponse.choices[0].message.content || "";
    if (!validationContent) {
      throw new Error("Empty response from OpenAI API during validation");
    }

    // Parse validated recommendations
    const validatedRecommendations = JSON.parse(validationContent) as Record<string, LearningResource[]>;
    console.log(`Second pass complete. Validated resources for ${Object.keys(validatedRecommendations).length} skills`);
    
    // Final processing and normalization
    console.log("Performing final processing and normalization of resources");
    Object.keys(validatedRecommendations).forEach(skill => {
      // Handle case where the skill key exists but the resources array is undefined
      if (!validatedRecommendations[skill]) {
        validatedRecommendations[skill] = [];
        return;
      }
      
      validatedRecommendations[skill] = validatedRecommendations[skill].map(resource => {
        if (!resource) {
          console.warn(`Missing resource found for skill: ${skill}, replacing with default`);
          // Provide default values if resource is undefined
          return {
            id: `resource-${Math.random().toString(36).substring(2, 11)}`,
            title: "Resource unavailable",
            type: "article",
            provider: "Unknown",
            url: "N/A",
            description: "No description available. Please try different search criteria.",
            estimatedHours: 1,
            difficulty: "beginner",
            costType: "free",
            tags: [],
            relevanceScore: 5,
            matchReason: `Default resource for ${skill}. The originally recommended resource could not be verified.`
          };
        }
        
        // Ensure all required fields are present
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

    console.log("Resource recommendation process complete");
    return validatedRecommendations;
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
    console.log(`Starting learning path generation for skill: ${skill}`);
    
    // FIRST PASS - Initial learning path generation
    const initialPrompt = `
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
    - Tags (relevant to the resource)
    - Relevance score (1-10)
    - Why this resource is particularly valuable at this step (matchReason)
    
    Format your response as a JSON object following the LearningPathRecommendation interface.
    IMPORTANT: All resources must be real, currently available materials. Do not invent fictional resources.
    Ensure all URLs are valid and accurately point to the specified resource.
    `;

    console.log("Executing first pass (initial learning path generation)");
    
    const initialResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert learning path designer specializing in skill development. You create structured, effective learning paths using real, currently available resources."
        },
        { role: "user", content: initialPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const initialContent = initialResponse.choices[0].message.content || "";
    if (!initialContent) {
      throw new Error("Empty response from OpenAI API during initial learning path generation");
    }

    // Parse initial learning path
    const initialLearningPath = JSON.parse(initialContent) as LearningPathRecommendation;
    console.log("First pass complete. Initial learning path generated.");
    
    // SECOND PASS - Validation and quality assurance
    console.log("Executing second pass (validation and quality assurance)");
    const validationPrompt = `
    You are a quality assurance specialist for learning path recommendations.
    Below is a learning path for developing skills in "${skill}".
    
    Please review this learning path carefully and ensure:
    1. The sequence of steps is logical and progresses appropriately from ${currentLevel} to ${targetLevel}
    2. All resources are real, currently available materials
    3. All URLs and providers are accurate and match the resource titles
    4. Resource types are appropriate for the content
    5. The milestones are meaningful and achievable
    6. Time estimates are reasonable
    
    Improve the learning path by:
    - Verifying all resources exist and are available
    - Ensuring a clear progression of difficulty
    - Adding more detailed resource descriptions if needed
    - Adjusting time estimates to be realistic
    - Adding relevant resources if steps are missing key components
    
    Here is the current learning path:
    ${JSON.stringify(initialLearningPath, null, 2)}
    
    Return the validated and improved learning path in the same JSON format.
    IMPORTANT: Your response must be valid JSON with the same structure as the original.
    `;

    const validationResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a quality assurance specialist for learning path recommendations. Your job is to verify that learning paths are accurate, high-quality, and include real, available resources."
        },
        { role: "user", content: validationPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more precise validation
    });

    const validationContent = validationResponse.choices[0].message.content || "";
    if (!validationContent) {
      throw new Error("Empty response from OpenAI API during validation");
    }

    // Parse validated learning path
    let learningPath = JSON.parse(validationContent) as LearningPathRecommendation;
    console.log("Second pass complete. Learning path validated and improved.");
    
    // Final processing and normalization
    console.log("Performing final processing and normalization");
    
    // Ensure the learning path has the required structure
    if (!learningPath.recommendedSequence) {
      console.warn("Learning path missing recommendedSequence, adding empty array");
      learningPath.recommendedSequence = [];
    }
    
    // Ensure ID for each resource and validate all resources in each step
    learningPath.recommendedSequence = learningPath.recommendedSequence.map((step, stepIndex) => {
      if (!step) {
        console.warn(`Empty step found at index ${stepIndex}, creating default step`);
        return {
          step: stepIndex + 1,
          resources: [],
          milestone: `Complete step ${stepIndex + 1}`,
          estimatedTimeToComplete: "2-4 weeks"
        };
      }
      
      if (!step.resources) {
        console.warn(`Missing resources in step ${step.step || stepIndex + 1}, initializing empty array`);
        step.resources = [];
        return step;
      }
      
      step.resources = step.resources.map((resource, resourceIndex) => {
        if (!resource) {
          console.warn(`Empty resource found in step ${step.step || stepIndex + 1}, creating default resource`);
          return {
            id: `resource-${Math.random().toString(36).substring(2, 11)}`,
            title: "Resource unavailable",
            type: "article",
            provider: "Unknown",
            description: "No description available. Please try different search criteria.",
            estimatedHours: 1,
            difficulty: "beginner",
            costType: "free",
            tags: [],
            relevanceScore: 5,
            matchReason: `Default resource for ${skill}. The originally recommended resource could not be verified.`
          };
        }
        
        // Ensure all required fields are present
        return {
          ...resource,
          id: resource.id || `resource-${Date.now()}-${stepIndex}-${resourceIndex}`,
          title: resource.title || `Resource for ${skill}`,
          type: resource.type || "article",
          provider: resource.provider || "Unknown",
          url: resource.url || "N/A",
          tags: resource.tags || [],
          relevanceScore: resource.relevanceScore || 7
        };
      });
      
      // Ensure step has all required fields
      return {
        ...step,
        step: step.step || stepIndex + 1,
        milestone: step.milestone || `Complete step ${stepIndex + 1}`,
        estimatedTimeToComplete: step.estimatedTimeToComplete || "2-4 weeks"
      };
    });

    // Ensure all required fields are present at the top level
    if (!learningPath.skill) {
      learningPath.skill = skill;
    }
    
    if (!learningPath.description) {
      learningPath.description = `Learning path for ${skill} from ${currentLevel} to ${targetLevel}`;
    }

    console.log("Learning path generation process complete");
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