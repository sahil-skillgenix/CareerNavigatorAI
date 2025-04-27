/**
 * OpenAI Service
 * 
 * This service provides the interface for interacting with the OpenAI API
 * to generate career analysis reports.
 */
import OpenAI from "openai";
import { CareerAnalysisReport, CareerAnalysisRequestData } from "../../shared/types/reportTypes";
import { formatReport } from "./reportStructureService";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a comprehensive career analysis report using OpenAI
 * 
 * @param requestData User's career information and goals
 * @returns A structured career analysis report
 */
export async function generateCareerAnalysis(requestData: CareerAnalysisRequestData): Promise<CareerAnalysisReport> {
  try {
    console.log("Generating career analysis with OpenAI...");
    
    // Create a detailed prompt for OpenAI
    const prompt = `
You are an expert career counselor and pathway advisor with extensive knowledge of skills frameworks including SFIA 9 and DigComp 2.2.

Analyze the following career information and provide a detailed career pathway analysis with actionable recommendations:

Professional Level: ${requestData.professionalLevel}
Current Skills: ${requestData.currentSkills}
Educational Background: ${requestData.educationalBackground}
Career History: ${requestData.careerHistory}
Desired Role: ${requestData.desiredRole}
State/Province: ${requestData.state}
Country: ${requestData.country}

Please provide a comprehensive, structured analysis in JSON format with the following components:

1. Executive Summary:
   - summary: A concise overview of the career analysis
   - careerGoal: Clear statement of the career objective
   - keyFindings: Array of key insights from the analysis (3-5 points)
   - fitScore: Object with score (0-10), outOf (10), and description of the fit

2. Skill Mapping:
   - skillsAnalysis: Overview of current skill profile
   - sfiaSkills: Array of SFIA framework skills with [skill, proficiency (0-7), description]
   - digCompSkills: Array of DigComp 2.2 framework skills with [skill, proficiency (0-8), description]
   - otherSkills: Array of additional relevant skills with [skill, proficiency (0-10), description]

3. Skill Gap Analysis:
   - targetRole: The desired role being analyzed
   - aiAnalysis: AI's assessment of skill gaps
   - keyGaps: Array of skill gaps with [skill, currentLevel, requiredLevel, gap, priority, improvementSuggestion]
   - keyStrengths: Array of strengths with [skill, currentLevel, requiredLevel, advantage, leverageSuggestion]
   - visualizationData: Data for radar/bar charts {currentSkills: [{skill, value}], requiredSkills: [{skill, value}]}

4. Career Pathway Options:
   - currentRole: Starting position
   - targetRole: Goal position
   - timeframe: Estimated time to reach goal
   - pathwayDescription: Overview of recommended pathway
   - pathwaySteps: Array of steps with [step, timeframe, description]
   - universityPathway: Array of education options with [degree, duration, institutions, outcomes]
   - vocationalPathway: Array of certification options with [degree, duration, institutions, outcomes]
   - aiInsights: Additional AI insights on career transition

5. Development Plan:
   - overview: Summary of development approach
   - technicalSkills: Array of technical skills to develop with [skill, currentLevel, targetLevel, timeframe, resources]
   - softSkills: Array of soft skills to develop with [skill, currentLevel, targetLevel, timeframe, resources]
   - skillsToAcquire: Array of new skills to acquire with [skill, timeframe, reason, resources]

6. Educational Programs:
   - introduction: Overview of educational recommendations
   - recommendedPrograms: Array of programs with [name, provider, format, duration, description, skillsCovered]
   - suggestedProjects: Array of projects with [title, difficultyLevel, completionTime, description, skillsDeveloped]

7. Learning Roadmap:
   - roadmapOverview: Overview of learning approach
   - learningPhases: Array of phases with [phase, focusAreas, keyResources]
   - skillsProgression: Array of skill progressions with [skill, startLevel, targetLevel, milestones[level, achievements]]

8. Similar Roles:
   - introduction: Overview of alternative career paths
   - roles: Array of similar roles with [title, similarityScore, keyResponsibilities, requiredSkills, averageSalary, growthPotential, prosAndCons]

9. Quick Tips:
   - dailyLearningTips: Array of daily learning tips
   - interviewPreparationTips: Array of interview preparation tips
   - networkingRecommendations: Array of networking recommendations

10. Growth Trajectory:
    - shortTermGoals: {timeframe, goals, metrics}
    - mediumTermGoals: {timeframe, goals, metrics}
    - longTermGoals: {timeframe, goals, metrics}
    - potentialSalaryProgression: Array of salary progression with [stage, timeframe, salary]

11. Learning Path Roadmap:
    - timelineData: Array of timeline milestones with [milestone, timeframe, description]
    - skillFocus: Array of skill focus areas with [skill, priority, resources[{name, type, url}]]

Ensure all sections and subsections are included and properly formatted as a valid JSON object.
`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert career counselor using advanced frameworks (SFIA 9 and DigComp 2.2) to provide detailed, personalized career pathway analyses. Format responses in valid JSON exactly as requested."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    // Extract and parse the completion
    const completion = response.choices[0].message.content;
    
    if (!completion) {
      throw new Error("Failed to receive a valid response from OpenAI");
    }
    
    // Parse the JSON response
    const rawReport = JSON.parse(completion);
    
    // Format the report into our required structure
    const structuredReport = formatReport(rawReport);
    
    console.log("Career analysis generated successfully");
    
    return structuredReport;
  } catch (error: any) {
    console.error("Error generating career analysis:", error);
    throw new Error(`Failed to generate career analysis: ${error.message || "Unknown error"}`);
  }
}