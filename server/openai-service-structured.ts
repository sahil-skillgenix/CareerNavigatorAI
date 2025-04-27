/**
 * Structured OpenAI Service
 * 
 * Provides an interface to OpenAI for generating career pathway analyses
 * using the structured report format defined in reportSchema.ts.
 */

import OpenAI from "openai";
import { 
  createStructuredPrompt, 
  ensureReportStructure 
} from "./services/reportStructureService";
import { CareerAnalysisReport } from "../shared/reportSchema";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Interface for career analysis input
export interface CareerAnalysisInput {
  professionalLevel: string;
  currentSkills: string;
  educationalBackground: string;
  careerHistory: string;
  desiredRole: string;
  state?: string;
  country?: string;
}

/**
 * Analyzes the provided career information and generates a structured career pathway analysis
 * @param input User's career information
 * @returns A fully structured career analysis report
 */
export async function analyzeCareerPathway(input: CareerAnalysisInput): Promise<CareerAnalysisReport> {
  try {
    console.log("Generating structured career analysis with OpenAI...");
    
    // Construct the base prompt from the input
    const basePrompt = `
You are an expert career counselor and pathway advisor with extensive knowledge of skills frameworks including SFIA 9 and DigComp 2.2.

Analyze the following career information and provide a detailed career pathway analysis with actionable recommendations:

Professional Level: ${input.professionalLevel}
Current Skills: ${input.currentSkills}
Educational Background: ${input.educationalBackground}
Career History: ${input.careerHistory}
Desired Role: ${input.desiredRole}
${input.state ? `State: ${input.state}` : ''}
${input.country ? `Country: ${input.country}` : ''}

Please provide a comprehensive, structured analysis with the following components:
1. Executive Summary (with current state assessment, fit score, and key findings)
2. Skill Mapping (using SFIA 9 and DigComp 2.2 frameworks)
3. Framework-Based Skill Gap Analysis (using radar/bar charts data format)
4. Career Pathway Options (including university and vocational pathways)
5. Comprehensive Development Plan
6. Recommended Educational Programs
7. AI-Enhanced Learning Roadmap
8. Similar Roles To Consider
9. Micro-Learning Quick Tips
10. Personalized Skill Growth Trajectory
11. Learning Path Roadmap
`;

    // Apply the structured format to ensure consistent report structure
    const structuredPrompt = createStructuredPrompt(basePrompt);
    
    // Call OpenAI with the structured prompt
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { 
          role: "system", 
          content: "You are an expert career counselor using advanced frameworks (SFIA 9 and DigComp 2.2) to provide detailed, personalized career pathway analyses. Format responses in valid JSON exactly as requested." 
        },
        { role: "user", content: structuredPrompt }
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
    
    try {
      // Parse the JSON response
      const reportData = JSON.parse(completion);
      
      // Ensure the report structure is complete and valid
      const structuredReport = ensureReportStructure(reportData);
      
      console.log("Structured career analysis generated successfully");
      
      return structuredReport;
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      throw new Error("Failed to parse the career analysis response from OpenAI");
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(`Failed to generate career analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}