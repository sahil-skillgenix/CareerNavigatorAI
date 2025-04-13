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
    Please analyze this career information and provide a comprehensive career pathway using SFIA 9 and DigComp 2.2 frameworks:
    
    Current Professional Level: ${input.professionalLevel}
    Current Skills: ${input.currentSkills}
    Educational Background: ${input.educationalBackground}
    Career History: ${input.careerHistory}
    Desired Role or Career Goal: ${input.desiredRole}
    
    Please follow this process:
    1. Analyze the input using both SFIA 9 and DigComp 2.2 frameworks.
    2. Map the existing skills to both frameworks, identifying competencies and levels already met.
    3. Perform a Skill Gap Analysis comparing current skills and experience against the desired role requirements.
    4. Generate a Career Pathway showing logical progression toward the goal.
    5. Create a Personalized Development Plan with skills to acquire, recommended learning resources, and projects.
    6. Conduct two review stages: first validating input data and interpretations, then re-checking the generated pathway for completeness and framework alignment.
    
    Return the result as a JSON object with these sections:
    - executiveSummary: A concise overview of the analysis
    - skillMapping: How current skills map to SFIA 9 and DigComp 2.2
    - skillGapAnalysis: Gaps and strengths identified
    - careerPathway: Step-by-step progression to reach the goal
    - developmentPlan: Skills to acquire, resources, certifications, projects
    - reviewNotes: Validation notes from both review stages
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert career analyst with deep knowledge of SFIA 9 and DigComp 2.2 frameworks. Provide thorough career analyses using structured JSON format." 
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