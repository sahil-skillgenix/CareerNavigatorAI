import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CareerAnalysisInput {
  professionalLevel: string;
  currentSkills: string;
  educationalBackground: string;
  careerHistory: string;
  desiredRole: string;
}

export interface CareerAnalysisOutput {
  executiveSummary: string;
  skillMapping: {
    sfia9: Array<{skill: string, level: string, description: string}>;
    digcomp22: Array<{competency: string, level: string, description: string}>;
  };
  skillGapAnalysis: {
    gaps: Array<{skill: string, importance: string, description: string}>;
    strengths: Array<{skill: string, level: string, relevance: string}>;
  };
  careerPathway: Array<{
    step: number;
    role: string;
    timeframe: string;
    keySkillsNeeded: string[];
    description: string;
  }>;
  developmentPlan: {
    skillsToAcquire: Array<{skill: string, priority: string, resources: string[]}>;
    recommendedCertifications: string[];
    suggestedProjects: string[];
    learningPath: string;
  };
  reviewNotes: {
    firstReview: string;
    secondReview: string;
  };
}

export async function analyzeCareerPathway(input: CareerAnalysisInput): Promise<CareerAnalysisOutput> {
  try {
    const prompt = `
    You are an expert career analyst with deep knowledge of SFIA 9 and DigComp 2.2 frameworks. 
    Analyze this career information and provide a comprehensive career pathway:
    
    Current Professional Level: ${input.professionalLevel}
    Current Skills: ${input.currentSkills}
    Educational Background: ${input.educationalBackground}
    Career History: ${input.careerHistory}
    Desired Role or Career Goal: ${input.desiredRole}
    
    STRICTLY follow this 6-step process in order:
    
    1. ANALYZE INPUT USING FRAMEWORKS:
    - Use both SFIA 9 and DigComp 2.2 frameworks to analyze the user's current skills and experience
    - Identify competency areas and levels from both frameworks that apply to the user
    
    2. MAP EXISTING SKILLS:
    - For SFIA 9: Map each skill to the appropriate category and assign a level (1-7)
    - For DigComp 2.2: Map skills to the appropriate competence area and proficiency level
    - Be specific about which competencies and levels are already met
    
    3. PERFORM SKILL GAP ANALYSIS:
    - Compare current skills against requirements for desired role
    - Identify specific skill gaps with importance ratings
    - Highlight existing strengths with relevance to desired role
    
    4. GENERATE CAREER PATHWAY:
    - Create a logical progression of roles or steps toward goal
    - Include timeframe estimates for each step
    - List key skills needed for each step
    - Provide detailed descriptions of each role/step
    
    5. CREATE PERSONALIZED DEVELOPMENT PLAN:
    - List specific skills to acquire or improve with priority levels
    - Recommend concrete learning resources or certifications
    - Suggest specific experiences or projects to pursue
    - Outline a clear learning path with milestones
    
    6. QUALITY ASSURANCE (Two Review Stages):
    - First Review: Validate input data and interpretations for accuracy and consistency
    - Second Review: Re-check the pathway, gap analysis, and development plan for completeness, coherence, and alignment with the frameworks
    
    Return the result as a JSON object with these EXACT sections:
    - executiveSummary: A concise overview of the analysis
    - skillMapping: {
        sfia9: [{skill, level, description}],
        digcomp22: [{competency, level, description}]
      }
    - skillGapAnalysis: {
        gaps: [{skill, importance, description}],
        strengths: [{skill, level, relevance, description}]
      }
    - careerPathway: [{step, role, timeframe, keySkillsNeeded, description}]
    - developmentPlan: {
        skillsToAcquire: [{skill, priority, resources}],
        recommendedCertifications: [],
        suggestedProjects: [],
        learningPath
      }
    - reviewNotes: {
        firstReview,
        secondReview
      }
    
    IMPORTANT: Only return the final output AFTER both review stages are passed. The output must follow the exact format specified above.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an expert career analyst specializing in the SFIA 9 and DigComp 2.2 frameworks.
          
          SFIA 9 (Skills Framework for the Information Age) defines IT skills across 7 levels of responsibility and numerous skill categories.
          
          DigComp 2.2 (European Digital Competence Framework) covers 5 competence areas: Information and data literacy, Communication and collaboration, Digital content creation, Safety, and Problem solving.
          
          Your task is to analyze career information using both frameworks and provide comprehensive, structured career guidance following the exact 6-step process:
          1. Analyze the input using both frameworks 
          2. Map existing skills to both frameworks
          3. Perform skill gap analysis
          4. Generate career pathway
          5. Create personalized development plan 
          6. Conduct quality assurance through two review stages
          
          Only return output that follows the specified JSON format after both review stages are passed.` 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5, // Lower temperature for more consistent results
      max_tokens: 4000,
    });

    const content = response.choices[0].message.content || "";
    if (!content) {
      throw new Error("Empty response from OpenAI API");
    }
    return JSON.parse(content) as CareerAnalysisOutput;
  } catch (error: unknown) {
    console.error("Error analyzing career pathway:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to analyze career pathway: ${error.message}`);
    } else {
      throw new Error("Failed to analyze career pathway: Unknown error");
    }
  }
}