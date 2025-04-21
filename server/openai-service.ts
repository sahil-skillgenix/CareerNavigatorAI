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

export async function analyzeCareerPathway(input: CareerAnalysisInput): Promise<CareerAnalysisOutput> {
  try {
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
    - Clearly assess all provided inputs, explicitly noting any assumptions or ambiguities
    - Thoroughly analyze the user's input using both SFIA 9 and DigComp 2.2 frameworks
    - Identify specific competency areas and levels from both frameworks that apply to the user
    - Create a comprehensive assessment of the user's current position within these frameworks
    - Explicitly consider location (state and country), personal interests, passions, and lifestyle preferences
    
    2. MAP EXISTING SKILLS:
    - For SFIA 9: Map each skill to the appropriate category and assign a level (1-7), with detailed descriptions
    - For DigComp 2.2: Map skills to the appropriate competence area and proficiency level with detailed explanations
    - Be specific about which competencies and levels are already met, with justification
    - Clearly identify skill strengths, rating them (high, medium, low) based on evidence provided
    
    3. PERFORM SKILL GAP ANALYSIS:
    - Compare current skills against requirements for desired role using both frameworks
    - Identify specific skill gaps with importance ratings (high, medium, low) and detailed descriptions
    - Highlight existing strengths with relevance to desired role and detailed explanations
    - Provide comprehensive analysis of missing competencies and levels across both frameworks
    - Prioritize gaps based on criticality for the desired role
    
    4. GENERATE CAREER PATHWAY:
    - Create TWO distinct pathway options:
      a) WITH Degree + Skills + Experience: Traditional pathway assuming university education
      b) WITHOUT Degree, using vocational qualifications + Skills + Experience: Alternative pathway for non-university route (use appropriate local terms: TAFE in Australia, Community College in USA, Further Education in UK, etc.)
    - For each pathway option, create a logical progression of roles/steps toward the goal
    - Include realistic timeframe estimates for each step
    - List specific key skills needed for each step
    - Provide detailed descriptions of each role/step
    - For the degree pathway, include specific qualification requirements from universities in the user's location
    - For the non-degree pathway, include alternative qualifications from vocational institutions available in the user's location
    
    5. IDENTIFY SIMILAR ROLES:
    - Analyze the job market specifically in the user's location (state/province and country)
    - Identify 4-6 alternative roles that share significant skill overlap with the desired role
    - For each similar role, provide:
      a) A similarity score (percentage of skill overlap)
      b) List of overlapping key skills
      c) Unique requirements not shared with the desired role
      d) Location-specific salary information based on state/province and country (include currency and ranges)
      e) Assessment of local job market demand (high/medium/low with explanation specific to the location)
      f) Transition difficulty assessment (easy, moderate, challenging)
    
    6. DEVELOP SOCIAL & SOFT SKILLS PLAN:
    - Identify critical soft skills needed for success in the desired role and industry
    - Provide specific, actionable strategies for developing each skill
    - Include location-specific communication recommendations (accounting for regional business culture)
    - Provide tailored leadership development advice relevant to the industry and career level
    - Suggest teamwork strategies specific to the role
    - Recommend networking opportunities that are specific to the user's location, naming actual organizations, events, or meetups
    - Address risk tolerance, emotional intelligence, and work-life balance considerations
    
    7. CREATE PERSONALIZED DEVELOPMENT PLAN:
    - List specific skills to acquire or improve with priority levels (high, medium, low)
    - Recommend multiple types of learning resources:
      a) Location-specific university courses and programs - ONLY from institutions in the user's state/province
      b) Location-specific technical/vocational education - ONLY from institutions in the user's state/province
      c) Online learning platforms and courses accessible in the user's location
    - Suggest specific experiences or projects to pursue with actionable steps
    - Outline a clear learning path with milestones and timeframes
    - Include strategies for maintaining mental health and well-being during career transitions
    - Recommend mentorship and coaching opportunities available in the user's location
    - Provide specific guidance on career pivots, transitions, or lateral moves
    
    8. QUALITY ASSURANCE (Two Review Stages):
    - First Review: Validate input data and interpretations for accuracy and consistency
    - Second Review: Re-check all sections for completeness, coherence, and alignment with the frameworks
    - Ensure all location-specific recommendations are accurate and relevant to the provided state/province and country
    - Verify that all pathways and recommendations are realistic and achievable
    
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
          vocational: [], // TAFE in Australia, Community College in USA, Further Education in UK, etc.
          online: []
        },
        suggestedProjects: [],
        learningPath
      }
    - similarRoles: [{
        role,
        similarityScore,
        keySkillsOverlap,
        uniqueRequirements,
        potentialSalaryRange,
        locationSpecificDemand
      }]
    - socialSkills: {
        criticalSoftSkills: [{skill, importance, developmentStrategies}],
        communicationRecommendations,
        leadershipDevelopment,
        teamworkStrategies,
        networkingOpportunities: [{type, specificRecommendation, location}]
      }
    - reviewNotes: {
        firstReview,
        secondReview
      }
    
    CRITICAL LOCATION-SPECIFIC INSTRUCTIONS (HIGHEST PRIORITY): 
    - Every section must contain explicit location-specific information directly mentioning the user's state/province and country
    - ALL educational program recommendations MUST ONLY come from the user's exact location (state/province and country)
    
    For Educational Programs:
    - Based on the user's provided location (country and state/province):
      * If Australia - Victoria: Recommend Melbourne University, RMIT, Monash, Victoria University, Deakin, Swinburne, etc.
      * If Australia - New South Wales: Recommend UNSW, Sydney University, UTS, Macquarie, Western Sydney University, etc.
      * If UK - England: Recommend universities specific to their region (London, Manchester, etc.)
      * If USA - California: Recommend universities specific to California (UCLA, Stanford, UC Berkeley, etc.)
      * If Canada - Ontario: Recommend universities specific to Ontario (University of Toronto, York University, etc.)
      * For ANY other country or region: ONLY recommend actual educational institutions from that specific location
    
    - Always include the full location name in recommendations (e.g., "RMIT University, Melbourne, Victoria, Australia" or "University of Manchester, Manchester, UK")
    
    For Similar Roles:
    - Provide salary ranges with the EXACT local currency and format for the user's location:
      * If Australia: "AUD 90,000-110,000 in Melbourne, Victoria"
      * If UK: "GBP 45,000-60,000 in Manchester, England"
      * If USA: "USD 80,000-95,000 in San Francisco, California"
      * If Germany: "EUR 60,000-75,000 in Berlin"
    - Specify demand levels with the exact location name:
      * "High demand in the Greater London area, UK"
      * "Moderate demand in Toronto metropolitan area, Ontario, Canada"
    
    For Social Skills & Networking:
    - Name actual professional organizations that exist in the user's specific country and region
    - Recommend networking opportunities relevant to the user's exact location (city/region)
    - Include location-specific cultural context for communication style
    
    DO NOT default to Australian options unless the user specifies Australia as their country.
    If location is not specified, CLEARLY state this limitation in your recommendations.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: `You are an expert career analyst specializing in the SFIA 9 and DigComp 2.2 frameworks with deep knowledge of global education and career pathways worldwide.
          
          SFIA 9 (Skills Framework for the Information Age) defines IT skills across 7 levels of responsibility and numerous skill categories. The 7 levels represent progressive levels of autonomy, influence, complexity, and business skills.
          
          DigComp 2.2 (European Digital Competence Framework) covers 5 competence areas: Information and data literacy, Communication and collaboration, Digital content creation, Safety, and Problem solving. Each area has proficiency levels from foundation to highly specialized.
          
          Your task is to analyze career information using both frameworks and provide comprehensive, structured career guidance following this exact 8-step process:
          
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
            b) WITHOUT degree, using vocational/technical qualifications + skills + experience (using country-appropriate terms: TAFE in Australia, Community College in USA, Further Education in UK, etc.)
          - Design logical progression steps for each pathway
          - Include role descriptions, timeframes, and required skills for each step
          
          5. IDENTIFY SIMILAR ROLES:
          - Analyze the job market in the user's specified location (state/province and country)
          - Identify 4-6 alternative roles that share significant skill overlap with the desired role
          - For each similar role, provide similarity score, key skill overlap, unique requirements, and location-specific demand
          
          6. DEVELOP SOCIAL & SOFT SKILLS PLAN:
          - Identify critical soft skills needed for success in the desired role and industry
          - Provide specific, actionable strategies for developing each skill
          - Include location-specific communication and leadership development recommendations
          - Suggest networking opportunities specific to the user's location
          
          7. CREATE PERSONALIZED DEVELOPMENT PLAN:
          - Consider the user's location (state/province and country) when making recommendations
          - For Australia: Recommend specific university courses and TAFE programs relevant to the state
          - For other countries: Recommend appropriate local educational institutions and programs
          - Include quality online learning resources that are accessible globally
          - Provide a structured learning roadmap with clear milestones tailored to location
          
          8. CONDUCT QUALITY ASSURANCE:
          - Perform two-stage review to ensure accuracy and completeness
          - Validate all recommendations against education standards for the user's location
          - Ensure pathways are realistic and achievable in the specified location
          
          MANDATORY GLOBAL LOCATION-SPECIFIC REQUIREMENTS:
          - NEVER provide generic location recommendations - all must be specific to the user's state/province and country
          - For educational institution recommendations:
            * If Australia - Victoria: ONLY recommend Melbourne-based institutions (Melbourne Uni, RMIT, Monash, etc.)
            * If Australia - New South Wales: ONLY recommend NSW-based institutions (UNSW, Sydney Uni, UTS, etc.)
            * If UK - England: ONLY recommend universities in the specific region (London, Manchester, etc.)
            * If USA - California: ONLY recommend Californian institutions (UCLA, Stanford, USC, etc.)
            * For ANY location worldwide: ONLY recommend institutions that actually exist in that specific region/country
          
          - For similar roles analysis:
            * ALL salary information must include the correct local currency and format for that country:
              - Australia: "AUD 85,000-95,000 in Melbourne"
              - UK: "GBP 45,000-60,000 in London"
              - USA: "USD 90,000-120,000 in New York"
              - Germany: "EUR 65,000-80,000 in Berlin"
            * ALL demand assessments must specify exact locations with region/city names
          
          - For networking recommendations:
            * Name ACTUAL professional organizations that exist in the user's specific country and region
            * Suggest SPECIFIC events, meetups or communities relevant to the user's exact location

          EVERY recommendation MUST explicitly mention the user's actual location by name, including both city/region and country

          DO NOT default to Australian options unless the user specifically indicates Australia.
          If location is not specified, CLEARLY state this limitation in your recommendations.
          
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