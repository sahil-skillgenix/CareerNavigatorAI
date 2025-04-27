/**
 * OpenAI Integration Service
 * 
 * This service handles all interactions with OpenAI's API for the X-Gen Career Analysis feature.
 * It uses GPT-4o to generate comprehensive, structured career analysis reports.
 */
import OpenAI from "openai";
import { CareerAnalysisReport, CareerAnalysisRequestData } from "../../shared/types/reportTypes";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize the OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a comprehensive career analysis report using OpenAI's GPT-4o model
 * @param requestData User input data for career analysis
 * @returns A structured career analysis report
 */
export async function generateCareerAnalysis(
  requestData: CareerAnalysisRequestData
): Promise<CareerAnalysisReport> {
  try {
    // Create a detailed prompt that specifies the exact structure we need
    const systemPrompt = `You are an AI Career Analyst that specializes in creating comprehensive career pathway analyses.
    You will create a detailed career analysis report based on the user's professional level, skills, education, history, and desired role.
    Your analysis must follow this EXACT structure and include all required sections with proper subsections:

    1. Executive Summary: Provide a concise overview with career goal, fit score (1-10), and key findings
    2. Skill Mapping: Map current skills to SFIA 9 and DigComp 2.2 frameworks with proficiency levels (1-5)
    3. Skill Gap Analysis: Identify key gaps between current and required skills with visual data
    4. Career Pathway Options: Outline both university and vocational pathways with specific steps
    5. Development Plan: Detail technical and soft skills to develop with timeframes
    6. Educational Programs: Recommend specific programs and projects to build skills
    7. Learning Roadmap: Create phased learning plan with skill progression milestones
    8. Similar Roles: Analyze alternative careers with similarity scores and pros/cons
    9. Quick Tips: Provide actionable micro-learning tips and interview preparation advice
    10. Growth Trajectory: Map short, medium, and long-term goals with salary progression
    11. Learning Path Roadmap: Create a timeline with key milestones and skill focus areas

    Your response must be a valid JSON object matching the expected schema with all required sections and subsections.
    All lists should have at least 3-5 items where applicable.
    Be realistic, specific, and actionable in all recommendations.`;

    // Create the user prompt with the specific user data
    const userPrompt = `
    Please analyze the following career information and generate a comprehensive career pathway analysis:

    Professional Level: ${requestData.professionalLevel}
    Current Skills: ${requestData.currentSkills}
    Educational Background: ${requestData.educationalBackground}
    Career History: ${requestData.careerHistory}
    Desired Role: ${requestData.desiredRole}
    Location: ${requestData.state}, ${requestData.country}

    Please provide a detailed, structured analysis with all 11 required sections, including real comparisons to SFIA 9 and DigComp 2.2 frameworks.
    Ensure the pathway options include both university and vocational paths.
    Be realistic, specific, and actionable in all recommendations.
    Format your response as a valid JSON object.`;

    // Make the API call to OpenAI
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" }
    });

    // Parse the response into our expected structure
    const result = JSON.parse(response.choices[0].message.content || "{}") as CareerAnalysisReport;
    
    // Validate the response to ensure it has all required sections
    validateReportStructure(result);
    
    return result;
  } catch (error) {
    console.error("Error generating career analysis with OpenAI:", error);
    throw new Error(
      "Failed to generate career analysis. Please try again later or contact support."
    );
  }
}

/**
 * Validates that the report contains all required sections
 * @param report The career analysis report to validate
 */
function validateReportStructure(report: CareerAnalysisReport): void {
  // Define all required sections
  const requiredSections = [
    "executiveSummary",
    "skillMapping",
    "skillGapAnalysis",
    "careerPathwayOptions",
    "developmentPlan",
    "educationalPrograms",
    "learningRoadmap",
    "similarRoles",
    "quickTips",
    "growthTrajectory",
    "learningPathRoadmap"
  ];

  // Check if any section is missing
  const missingSections = requiredSections.filter(
    section => !report[section]
  );

  if (missingSections.length > 0) {
    throw new Error(
      `Generated report is missing the following sections: ${missingSections.join(", ")}`
    );
  }
}