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
    strengths: Array<{skill: string, level: string, relevance: string, description: string}>;
  };
  careerPathway: {
    withDegree: Array<{
      step: number;
      role: string;
      timeframe: string;
      keySkillsNeeded: string[];
      description: string;
      requiredQualification?: string;
    }>;
    withoutDegree: Array<{
      step: number;
      role: string;
      timeframe: string;
      keySkillsNeeded: string[];
      description: string;
      alternativeQualification?: string;
    }>;
  };
  developmentPlan: {
    skillsToAcquire: Array<{skill: string, priority: string, resources: string[]}>;
    recommendedCertifications: {
      university: string[];
      tafe: string[];
      online: string[];
    };
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
    - Thoroughly analyze the user's input using both SFIA 9 and DigComp 2.2 frameworks
    - Identify specific competency areas and levels from both frameworks that apply to the user
    - Create a comprehensive assessment of the user's current position within these frameworks
    
    2. MAP EXISTING SKILLS:
    - For SFIA 9: Map each skill to the appropriate category and assign a level (1-7), with detailed descriptions
    - For DigComp 2.2: Map skills to the appropriate competence area and proficiency level with detailed explanations
    - Be specific about which competencies and levels are already met, with justification
    
    3. PERFORM SKILL GAP ANALYSIS:
    - Compare current skills against requirements for desired role using both frameworks
    - Identify specific skill gaps with importance ratings and detailed descriptions
    - Highlight existing strengths with relevance to desired role and detailed explanations
    - Provide comprehensive analysis of missing competencies and levels across both frameworks
    
    4. GENERATE CAREER PATHWAY:
    - Create TWO distinct pathway options:
      a) WITH Degree + Skills + Experience: Traditional pathway assuming university education
      b) WITHOUT Degree, using Skills + TAFE courses + Experience: Alternative pathway for non-university route
    - For each pathway option, create a logical progression of roles/steps toward the goal
    - Include timeframe estimates for each step
    - List key skills needed for each step
    - Provide detailed descriptions of each role/step
    - For the degree pathway, include specific qualification requirements
    - For the non-degree pathway, include alternative qualifications like TAFE courses
    
    5. CREATE PERSONALIZED DEVELOPMENT PLAN:
    - List specific skills to acquire or improve with priority levels
    - Recommend multiple types of learning resources:
      a) Australian University courses and programs
      b) TAFE courses and certificates
      c) Online learning platforms and courses
    - Suggest specific experiences or projects to pursue
    - Outline a clear learning path with milestones
    - Consider multiple ways to reach the career goal
    
    6. QUALITY ASSURANCE (Two Review Stages):
    - First Review: Validate input data and interpretations for accuracy and consistency
    - Second Review: Re-check the pathway options, gap analysis, and development plan for completeness, coherence, and alignment with the frameworks
    
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
    - careerPathway: {
        withDegree: [{step, role, timeframe, keySkillsNeeded, description, requiredQualification}],
        withoutDegree: [{step, role, timeframe, keySkillsNeeded, description, alternativeQualification}]
      }
    - developmentPlan: {
        skillsToAcquire: [{skill, priority, resources}],
        recommendedCertifications: {
          university: [],
          tafe: [],
          online: []
        },
        suggestedProjects: [],
        learningPath
      }
    - reviewNotes: {
        firstReview,
        secondReview
      }
    
    IMPORTANT: 
    - Only return the final output AFTER both review stages are passed
    - The output must follow the exact format specified above
    - Focus specifically on Australian education options (universities and TAFEs)
    - Provide detailed and actionable information in each section
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an expert career analyst specializing in the SFIA 9 and DigComp 2.2 frameworks with deep knowledge of Australian education and career pathways.
          
          SFIA 9 (Skills Framework for the Information Age) defines IT skills across 7 levels of responsibility and numerous skill categories. The 7 levels represent progressive levels of autonomy, influence, complexity, and business skills.
          
          DigComp 2.2 (European Digital Competence Framework) covers 5 competence areas: Information and data literacy, Communication and collaboration, Digital content creation, Safety, and Problem solving. Each area has proficiency levels from foundation to highly specialized.
          
          Your task is to analyze career information using both frameworks and provide comprehensive, structured career guidance following this exact 6-step process:
          
          1. ANALYZE INPUT USING FRAMEWORKS:
          - Thoroughly analyze the user's skills against both SFIA 9 and DigComp 2.2
          - Map current capabilities to specific competency levels in both frameworks
          - Identify strengths and areas for development
          
          2. MAP EXISTING SKILLS:
          - Create detailed mappings with specific level assignments
          - Provide justifications for each mapping
          - Consider both technical and soft skills
          
          3. PERFORM SKILL GAP ANALYSIS:
          - Identify specific gaps between current skills and desired role requirements
          - Rate importance of each gap
          - Provide detailed context for how each gap impacts career progression
          
          4. GENERATE CAREER PATHWAY:
          - Create TWO distinct pathway options:
            a) WITH university degree + skills + experience
            b) WITHOUT degree, using TAFE qualifications + skills + experience
          - Design logical progression steps for each pathway
          - Include role descriptions, timeframes, and required skills for each step
          
          5. CREATE PERSONALIZED DEVELOPMENT PLAN:
          - Recommend specific Australian university courses and programs
          - Suggest relevant TAFE courses and certificates
          - Include quality online learning resources
          - Provide a structured learning roadmap with clear milestones
          
          6. CONDUCT QUALITY ASSURANCE:
          - Perform two-stage review to ensure accuracy and completeness
          - Validate all recommendations against Australian education standards
          - Ensure pathways are realistic and achievable
          
          Only return output that follows the specified JSON format after both review stages are passed. Focus on providing detailed, accurate, and actionable information specific to Australian education and career contexts.` 
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