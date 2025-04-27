import OpenAI from "openai";
import { CareerAnalysisReport } from '../shared/reportSchema';
import { ReportStructureService } from './services/reportStructureService';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize the report structure service
const reportStructureService = new ReportStructureService();

export interface CareerAnalysisInput {
  professionalLevel: string;
  currentSkills: string;
  educationalBackground: string;
  careerHistory: string;
  desiredRole: string;
  state?: string;
  country?: string;
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
 * Analyzes career pathway with structured output using the ReportStructureService
 * @param input The career analysis input data
 * @returns A structured career analysis report
 */
export async function analyzeCareerPathway(input: CareerAnalysisInput): Promise<CareerAnalysisReport> {
  let retries = 0;
  
  while (retries <= MAX_RETRIES) {
    try {
      // Apply rate limiting
      await enforceRateLimit();
      
      const prompt = `
      You are an expert career analyst specialized in SFIA 9 and DigComp 2.2 frameworks. 
      Analyze this career information deeply and contextually, explicitly taking into account the provided state and country to deliver localized insights.
      
      Format your entire response as a JSON object following this exact structure:
      
      {
        "executiveSummary": {
          "overview": "string",
          "keyPoints": ["string"],
          "recommendedNextSteps": ["string"]
        },
        "skillMapping": {
          "sfia9": [{"skill": "string", "level": "string", "description": "string"}],
          "digcomp22": [{"competence": "string", "proficiencyLevel": "string", "description": "string"}]
        },
        "gapAnalysis": {
          "radarChartData": [{"skill": "string", "currentLevel": 1, "requiredLevel": 3, "fullMark": 5}],
          "barChartData": [{"name": "string", "currentLevel": 1, "requiredLevel": 3, "gap": 2, "importance": "High"}],
          "aiAnalysis": "string",
          "skillGaps": [{"skill": "string", "description": "string", "priorityLevel": "High"}],
          "skillStrengths": [{"skill": "string", "description": "string", "relevanceLevel": "High"}]
        },
        "pathwayOptions": {
          "transitionVisualization": {
            "currentRole": "string",
            "targetRole": "string",
            "transitionSteps": ["string"],
            "estimatedTimeframe": "string"
          },
          "universityPathway": {
            "recommendedDegrees": ["string"],
            "institutions": ["string"],
            "estimatedTimeframe": "string",
            "expectedOutcomes": ["string"]
          },
          "vocationalPathway": {
            "recommendedCertifications": ["string"],
            "providers": ["string"],
            "estimatedTimeframe": "string",
            "expectedOutcomes": ["string"]
          },
          "aiInsights": "string"
        },
        "developmentPlan": {
          "existingSkills": [{"skill": "string", "proficiencyLevel": "string", "applicability": "string"}],
          "skillsToDevelop": [{"skill": "string", "currentLevel": "string", "targetLevel": "string", "importance": "High"}],
          "softSkills": [{"skill": "string", "developmentStrategy": "string", "resources": ["string"]}],
          "skillPriorityDistribution": [{"category": "string", "count": 2, "percentage": 25}],
          "skillsToAcquire": [{"skill": "string", "description": "string", "learningResources": ["string"], "estimatedTimeToAcquire": "string"}]
        },
        "educationalPrograms": {
          "institutions": [{"name": "string", "location": "string", "programName": "string", "duration": "string", "highlights": ["string"]}],
          "onlineCourses": [{"provider": "string", "courseName": "string", "duration": "string", "highlights": ["string"]}],
          "suggestedProjects": [{"title": "string", "description": "string", "skillsDeveloped": ["string"], "difficulty": "Beginner", "estimatedCompletion": "string"}]
        },
        "learningRoadmap": {
          "phases": [{"title": "string", "duration": "string", "focusAreas": ["string"], "milestones": ["string"], "resources": ["string"]}],
          "aiGeneratedInsights": "string"
        },
        "similarRoles": [{"role": "string", "description": "string", "skillOverlap": 75, "growthPotential": "High", "transitionDifficulty": "Moderate"}],
        "quickTips": [{"category": "string", "tips": ["string"]}],
        "growthTrajectory": {
          "shortTerm": ["string"],
          "mediumTerm": ["string"],
          "longTerm": ["string"],
          "potentialRoles": ["string"]
        },
        "learningPathRoadmap": {
          "timeline": [{"timeframe": "string", "milestone": "string", "skills": ["string"], "activities": ["string"]}]
        }
      }
      
      Current Professional Level: ${input.professionalLevel}
      Current Skills: ${input.currentSkills}
      Educational Background: ${input.educationalBackground}
      Career History: ${input.careerHistory}
      Desired Role or Career Goal: ${input.desiredRole}
      State/Province: ${input.state || 'Not specified'}
      Country: ${input.country || 'Not specified'}
      
      STRICTLY follow this enhanced 11-step analysis process in order and provide the results in the exact JSON format specified above:
      
      1. EXECUTIVE SUMMARY:
      - Provide a concise overview of the career transition
      - List key points about the transition
      - Recommend clear next steps
      
      2. SKILL MAPPING USING FRAMEWORKS:
      - Map skills to SFIA 9 framework with appropriate levels
      - Map digital competencies to DigComp 2.2 framework
      - Assign appropriate levels with justification
      
      3. FRAMEWORK-BASED SKILL GAP ANALYSIS:
      - Create radar chart data comparing current vs. required skills
      - Generate bar chart data for skill gaps
      - Provide AI-enhanced analysis of the gaps
      - Identify specific gaps with priority levels
      - Highlight existing strengths relevant to desired role
      
      4. CAREER PATHWAY OPTIONS:
      - Visualize the career transition with steps
      - Create university pathway option with degrees and institutions
      - Create vocational pathway with certifications and providers
      - Provide AI insights on optimal pathway selection
      
      5. COMPREHENSIVE DEVELOPMENT PLAN:
      - Assess existing skills and their applicability
      - Identify skills to develop with importance levels
      - Recommend soft skills development strategies
      - Create skill priority distribution by category
      - List skills to acquire with resources and timeframes
      
      6. RECOMMENDED EDUCATIONAL PROGRAMS:
      - Suggest institutions and programs
      - Recommend online courses
      - Propose practical projects to develop skills
      
      7. AI-ENHANCED LEARNING ROADMAP:
      - Design learning phases with resources
      - Provide AI-generated insights on optimal learning approach
      
      8. SIMILAR ROLES TO CONSIDER:
      - Identify alternative roles with skill overlap
      - Describe roles with growth potential and transition difficulty
      
      9. MICRO-LEARNING QUICK TIPS:
      - Provide categorized quick tips for skill development
      
      10. PERSONALIZED SKILL GROWTH TRAJECTORY:
      - Outline short, medium, and long-term growth goals
      - Suggest potential future roles
      
      11. LEARNING PATH ROADMAP:
      - Create a timeline with milestones, skills, and activities
      
      All recommendations must be specific to the user's state/province and country.`;

      console.log(`Making OpenAI API call (attempt ${retries + 1}/${MAX_RETRIES + 1})`);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          { 
            role: "system", 
            content: `You are an expert career analyst specializing in the SFIA 9 and DigComp 2.2 frameworks with deep knowledge of global education and career pathways worldwide. Always provide responses in well-structured JSON format matching the CareerAnalysisReport schema.`
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
        // Parse JSON response
        const parsedResponse = JSON.parse(content);
        
        // Apply our report structuring service to ensure consistent format
        const structuredReport = reportStructureService.structureOpenAIResponse(parsedResponse);
        
        console.log("Career analysis generated successfully with structured report format");
        return structuredReport;
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