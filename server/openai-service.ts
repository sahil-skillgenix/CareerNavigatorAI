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
  state?: string;
  country?: string;
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
    aiAnalysis: string; // New field for GenAI deeper analysis of skill gaps
    recommendations: Array<{area: string, suggestion: string, impactLevel: string}>;
  };
  careerPathway: {
    withDegree: Array<{
      step: number;
      role: string;
      timeframe: string;
      keySkillsNeeded: string[];
      description: string;
      requiredQualification?: string;
      recommendedProjects?: Array<{name: string, description: string, skillsGained: string[]}>;
      jobOpportunities?: Array<{roleType: string, description: string, skillsUtilized: string[]}>;
    }>;
    withoutDegree: Array<{
      step: number;
      role: string;
      timeframe: string;
      keySkillsNeeded: string[];
      description: string;
      alternativeQualification?: string;
      recommendedProjects?: Array<{name: string, description: string, skillsGained: string[]}>;
      jobOpportunities?: Array<{roleType: string, description: string, skillsUtilized: string[]}>;
    }>;
    aiRecommendations: string; // New field for GenAI recommendations for pathway enhancement
  };
  developmentPlan: {
    skillsToAcquire: Array<{skill: string, priority: string, resources: string[]}>;
    recommendedCertifications: {
      university: string[];
      vocational: string[]; // TAFE in Australia, Community College in USA, Further Education in UK, etc.
      online: string[];
    };
    suggestedProjects: string[];
    learningPath: string;
    roadmapStages: Array<{
      stage: number;
      title: string;
      timeframe: string;
      focusAreas: string[];
      milestones: string[];
      description: string;
    }>;
    microLearningTips: Array<{
      skillArea: string;
      tip: string;
      estimatedTimeMinutes: number;
      impactLevel: "high" | "medium" | "low";
      source?: string;
    }>;
    platformSpecificCourses: {
      microsoft: Array<{title: string, url: string, level: string, duration: string}>;
      udemy: Array<{title: string, url: string, instructorName: string, rating: string, studentsCount: string}>;
      linkedinLearning: Array<{title: string, url: string, author: string, level: string, duration: string}>;
      coursera: Array<{title: string, url: string, partner: string, certificationType: string, duration: string}>;
    };
    personalizedGrowthInsights: string;
  };
  similarRoles: Array<{
    role: string;
    similarityScore: number;
    keySkillsOverlap: string[];
    uniqueRequirements: string[];
    potentialSalaryRange: string;
    locationSpecificDemand: string;
  }>;
  socialSkills: {
    criticalSoftSkills: Array<{skill: string, importance: string, developmentStrategies: string[]}>;
    communicationRecommendations: string;
    leadershipDevelopment: string;
    teamworkStrategies: string;
    networkingOpportunities: Array<{type: string, specificRecommendation: string, location: string}>;
  };
  reviewNotes: {
    firstReview: string;
    secondReview: string;
  };
}

// Rate limiting implementation to prevent overuse of the OpenAI API
const API_CALL_INTERVAL = 1000; // Minimum interval between API calls in ms
const MAX_RETRIES = 3; // Maximum number of retry attempts for API calls
let lastAPICallTime = 0; // Timestamp of the last API call

/**
 * Sleep function for rate limiting
 * @param ms Milliseconds to sleep
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Rate limiter to ensure we don't exceed OpenAI's rate limits
 * This creates a controlled delay between API calls
 */
async function enforceRateLimit() {
  const now = Date.now();
  const timeElapsed = now - lastAPICallTime;
  
  if (timeElapsed < API_CALL_INTERVAL) {
    // If we've made a request too recently, wait the appropriate amount of time
    const waitTime = API_CALL_INTERVAL - timeElapsed;
    console.log(`Rate limiting: Waiting ${waitTime}ms before next OpenAI API call`);
    await sleep(waitTime);
  }
  
  lastAPICallTime = Date.now();
}

/**
 * Process and sanitize OpenAI API errors for better debugging and user feedback
 * @param error Error thrown by OpenAI API
 */
function processOpenAIError(error: unknown): Error {
  console.error("OpenAI API Error:", error);
  
  // Error from the OpenAI SDK has specific structure
  if (typeof error === 'object' && error !== null) {
    // Handle rate limiting errors specifically
    if ('status' in error && error.status === 429) {
      return new Error("OpenAI API rate limit exceeded. Please try again in a moment.");
    }
    
    // Handle authentication errors
    if ('status' in error && error.status === 401) {
      return new Error("API key authentication error. Please check your OpenAI API key configuration.");
    }
    
    // Handle API availability errors
    if ('status' in error && (error.status === 503 || error.status === 500)) {
      return new Error("OpenAI service is currently unavailable. Please try again later.");
    }
    
    // Extract error message if available
    if ('message' in error && typeof error.message === 'string') {
      return new Error(`OpenAI API error: ${error.message}`);
    }
  }
  
  // Default error message if we can't extract specifics
  return new Error("An error occurred while processing your request with the AI service.");
}

/**
 * Analyzes career pathway with error handling and retry logic
 * @param input The career analysis input data
 * @returns A structured career analysis output
 */
export async function analyzeCareerPathway(input: CareerAnalysisInput): Promise<CareerAnalysisOutput> {
  let retries = 0;
  
  while (retries <= MAX_RETRIES) {
    try {
      // Apply rate limiting
      await enforceRateLimit();
      
      const prompt = `
      You are an expert career analyst specialized in SFIA 9 and DigComp 2.2 frameworks. 
      Analyze this career information deeply and contextually, explicitly taking into account the provided state and country to deliver localized insights:
      
      Current Professional Level: ${input.professionalLevel}
      Current Skills: ${input.currentSkills}
      Educational Background: ${input.educationalBackground}
      Career History: ${input.careerHistory}
      Desired Role or Career Goal: ${input.desiredRole}
      State/Province: ${input.state || 'Not specified'}
      Country: ${input.country || 'Not specified'}
      
      STRICTLY follow this enhanced 8-step process in order:
      
      1. INPUT ANALYSIS USING FRAMEWORKS:
      - Clearly assess all provided inputs
      - Thoroughly analyze using both SFIA 9 and DigComp 2.2 
      - Identify competency areas and levels
      - Create assessment of current position within frameworks
      
      2. MAP EXISTING SKILLS:
      - Map skills to SFIA 9 and DigComp 2.2 frameworks
      - Assign appropriate levels with justification
      - Identify strengths clearly
      
      3. PERFORM SKILL GAP ANALYSIS:
      - Compare current skills against desired role requirements
      - Identify specific gaps with importance ratings
      - Highlight existing strengths relevant to desired role
      - Provide comprehensive analysis of missing competencies
      
      4. GENERATE CAREER PATHWAY:
      - Create two distinct pathway options (with/without degree)
      - Design logical progression steps
      - Include timeframes, skills, and descriptions
      - Provide qualification details appropriate to location
      
      5. IDENTIFY SIMILAR ROLES:
      - Analyze job market in the user's location
      - Identify alternative roles with skill overlap
      - Include similarity scores, skills, requirements
      - Provide location-specific salary information
      
      6. DEVELOP SOCIAL SKILLS PLAN:
      - Identify critical soft skills
      - Provide development strategies
      - Include location-specific recommendations
      - Suggest location-specific networking opportunities
      
      7. CREATE PERSONALIZED DEVELOPMENT PLAN:
      - List skills to acquire with priority levels
      - Recommend learning resources specific to location
      - Suggest projects and experiences
      - Create a clear roadmap with milestones
      
      8. QUALITY ASSURANCE:
      - Validate all input interpretations
      - Ensure all recommendations are location-specific
      - Verify pathways are realistic and achievable
      
      All recommendations must be specific to the user's state/province and country.`;

      console.log(`Making OpenAI API call (attempt ${retries + 1}/${MAX_RETRIES + 1})`);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          { 
            role: "system", 
            content: `You are an expert career analyst specializing in the SFIA 9 and DigComp 2.2 frameworks with deep knowledge of global education and career pathways worldwide.`
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
      
      try {
        // Parse JSON with extra validation
        const parsedResponse = JSON.parse(content) as CareerAnalysisOutput;
        
        // Validate essential fields to ensure we have a complete analysis
        const requiredFields = ['executiveSummary', 'skillMapping', 'skillGapAnalysis', 'careerPathway', 'developmentPlan'];
        const missingFields = requiredFields.filter(field => !parsedResponse[field as keyof CareerAnalysisOutput]);
        
        if (missingFields.length > 0) {
          throw new Error(`Incomplete analysis response. Missing fields: ${missingFields.join(', ')}`);
        }
        
        console.log("Career analysis generated successfully");
        return parsedResponse;
      } catch (parseError) {
        throw new Error(`Failed to parse OpenAI response: ${parseError instanceof Error ? parseError.message : 'Invalid JSON format'}`);
      }
    } catch (error) {
      // Increment retry counter
      retries++;
      
      if (retries <= MAX_RETRIES) {
        // Exponential backoff for retries: 2^retry * 1000ms (2s, 4s, 8s, etc.)
        const backoffTime = Math.pow(2, retries) * 1000;
        console.log(`OpenAI API call failed. Retrying in ${backoffTime}ms...`);
        await sleep(backoffTime);
        continue;
      }
      
      // If we've exhausted all retries, throw a processed error
      throw processOpenAIError(error);
    }
  }
  
  // Should never reach here, but TypeScript requires a return
  throw new Error("Failed to analyze career pathway after multiple attempts");
}