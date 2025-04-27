/**
 * OpenAI Integration Service
 * 
 * This service handles all interactions with OpenAI's API for the X-Gen Career Analysis feature.
 * It uses GPT-4o to generate comprehensive, structured career analysis reports.
 */
import OpenAI from "openai";
import { CareerAnalysisReport } from "../../shared/types/reportTypes";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt to guide the AI in generating structured career analyses
const SYSTEM_PROMPT = `
You are SkillgenixGPT, an advanced AI career analyst specializing in creating comprehensive career pathway analyses.
Your task is to generate a complete, detailed career analysis report following a specific 11-section structure.
Each section must be thoroughly populated with relevant, personalized information based on the user's input.

The report MUST follow this EXACT structure (all 11 sections are REQUIRED):

1. Executive Summary
   - Summary overview
   - Career goal assessment
   - Fit score (numeric rating with explanation)
   - Key findings (bulleted list)

2. Skill Mapping
   - Skills analysis overview
   - SFIA 9 Framework skills mapping (skills with proficiency levels 1-5)
   - DigComp 2.2 Framework skills mapping (skills with proficiency levels 1-5)
   - Other relevant skills (skills with proficiency levels 1-5)

3. Skill Gap Analysis
   - Target role requirements
   - Current proficiency visualization data for radar chart
   - Gap analysis visualization data for bar chart comparison
   - AI-enhanced analysis of gaps
   - Key gaps identified (with current level, required level, priority, and improvement suggestions)
   - Key strengths identified (with advantage level and leverage suggestions)

4. Career Pathway Options
   - Pathway description
   - Current to target role transition overview
   - Estimated timeframe
   - Step-by-step pathway with timeframes
   - University pathway options (degrees, institutions, duration, outcomes)
   - Vocational pathway options (certifications, providers, duration, outcomes)
   - AI-enhanced insights on career transition

5. Development Plan
   - Overview of development approach
   - Technical skills to develop (current level, target level, timeframe, resources)
   - Soft skills to develop (current level, target level, timeframe, resources)
   - New skills to acquire (with reasoning, timeframe, resources)

6. Educational Programs
   - Introduction to recommended education
   - Recommended formal programs (name, provider, duration, format, skills covered, description)
   - Suggested projects to build practical skills (title, description, skills developed, difficulty level, estimated completion time)

7. Learning Roadmap
   - Roadmap overview
   - Learning phases (phase name, focus areas, key resources for each phase)
   - Skills progression visualization data for timeline chart
   - Milestone achievements for each phase

8. Similar Roles
   - Introduction to alternative roles
   - Recommended alternative roles (with similarity score, key responsibilities, required skills, average salary, growth potential)
   - Comparison to target role (pros and cons)

9. Micro-Learning Quick Tips
   - Daily learning tips
   - Interview preparation tips
   - Networking recommendations

10. Growth Trajectory
    - Short-term goals (0-6 months)
    - Medium-term goals (6-12 months)
    - Long-term goals (1+ years)
    - Potential salary progression at different career stages

11. Learning Path Roadmap
    - Proposed timeline visualization data
    - Monthly/quarterly milestones
    - Key skills focus for each milestone
    - Recommended resources for each milestone

Respond with a complete JSON object structured exactly according to the format shown. Every section is mandatory.
Generate realistic, detailed content for each section that is specific to the user's background and career goals.
Use professional language and provide actionable insights.
`;

/**
 * Interface for career analysis request data
 */
interface CareerAnalysisRequest {
  professionalLevel: string;
  currentSkills: string;
  educationalBackground: string;
  careerHistory: string;
  desiredRole: string;
  state: string;
  country: string;
}

/**
 * Generates a comprehensive career analysis report using OpenAI's GPT-4o model
 * @param requestData User input data for career analysis
 * @returns A structured career analysis report
 */
export async function generateCareerAnalysis(
  requestData: CareerAnalysisRequest
): Promise<CareerAnalysisReport> {
  try {
    // Format user information for the prompt
    const userPrompt = `
Please analyze my career information and generate a complete career pathway report.

Professional Level: ${requestData.professionalLevel}
Current Skills: ${requestData.currentSkills}
Educational Background: ${requestData.educationalBackground}
Career History: ${requestData.careerHistory}
Desired Role: ${requestData.desiredRole}
Location: ${requestData.state}, ${requestData.country}

Please create a comprehensive career analysis report with all 11 required sections, including realistic data for visualizations.
`;

    // Call OpenAI API with the formatted prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    // Extract and parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    // Parse and validate the JSON response
    const reportData = JSON.parse(content) as CareerAnalysisReport;
    
    // Validate that all required sections are present
    validateReportStructure(reportData);
    
    return reportData;
  } catch (error) {
    console.error("Error generating career analysis:", error);
    throw new Error(`Failed to generate career analysis: ${(error as Error).message}`);
  }
}

/**
 * Validates that the report contains all required sections
 * @param report The career analysis report to validate
 */
function validateReportStructure(report: CareerAnalysisReport): void {
  // List of required top-level sections
  const requiredSections = [
    'executiveSummary',
    'skillMapping',
    'skillGapAnalysis',
    'careerPathwayOptions',
    'developmentPlan',
    'educationalPrograms',
    'learningRoadmap',
    'similarRoles',
    'quickTips',
    'growthTrajectory',
    'learningPathRoadmap'
  ];

  // Check for missing sections
  const missingSections = requiredSections.filter(section => !report[section]);
  
  if (missingSections.length > 0) {
    throw new Error(`Incomplete report structure. Missing sections: ${missingSections.join(', ')}`);
  }
}