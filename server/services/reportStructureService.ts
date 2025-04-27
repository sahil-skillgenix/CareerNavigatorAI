/**
 * Report Structure Service
 * 
 * This service ensures that the OpenAI response conforms to our
 * structured report schema with all 11 sections in the correct order.
 */

import { CareerAnalysisReport } from "../../shared/reportSchema";

/**
 * Creates a structured prompt to ensure OpenAI returns data in our required format
 * @param basePrompt The core analysis prompt
 * @returns Enhanced structured prompt
 */
export function createStructuredPrompt(basePrompt: string): string {
  // Build a structured prompt that specifies the exact format we need
  const structuredPrompt = `
${basePrompt}

Please format your response as a JSON object that strictly adheres to this exact structure:

{
  "executiveSummary": {
    "summary": "Overall career transition analysis summary",
    "careerGoal": "Primary career goal based on input",
    "keyFindings": ["Finding 1", "Finding 2", "Finding 3", "etc."],
    "fitScore": {
      "score": 8,
      "outOf": 10,
      "description": "Explanation of the fit score"
    }
  },
  "skillMapping": {
    "sfiaSkills": [
      {
        "skill": "SFIA skill name",
        "proficiency": 4,
        "description": "Description of proficiency level"
      }
    ],
    "digCompSkills": [
      {
        "skill": "DigComp skill name",
        "proficiency": 3,
        "description": "Description of proficiency level"
      }
    ],
    "otherSkills": [
      {
        "skill": "Other skill name",
        "proficiency": 5,
        "category": "Technical/Soft/Domain"
      }
    ],
    "skillsAnalysis": "Overall analysis of the skill mapping"
  },
  "skillGapAnalysis": {
    "targetRole": "Target role name",
    "currentProficiencyData": {
      "labels": ["Skill 1", "Skill 2", "Skill 3", "etc."],
      "datasets": [
        {
          "label": "Current Skills",
          "data": [4, 3, 5, 2, 4]
        }
      ]
    },
    "gapAnalysisData": {
      "labels": ["Skill 1", "Skill 2", "Skill 3", "etc."],
      "datasets": [
        {
          "label": "Current Skills",
          "data": [4, 3, 5, 2, 4]
        },
        {
          "label": "Required Skills",
          "data": [5, 4, 5, 4, 5]
        }
      ]
    },
    "aiAnalysis": "AI analysis of skill gaps",
    "keyGaps": [
      {
        "skill": "Skill name",
        "currentLevel": 2,
        "requiredLevel": 4,
        "gap": 2,
        "priority": "High",
        "improvementSuggestion": "Suggestion to improve"
      }
    ],
    "keyStrengths": [
      {
        "skill": "Skill name",
        "currentLevel": 5,
        "requiredLevel": 4,
        "advantage": 1,
        "leverageSuggestion": "How to leverage this strength"
      }
    ]
  },
  "careerPathwayOptions": {
    "currentRole": "Current role",
    "targetRole": "Target role",
    "transitionDifficulty": "Moderate",
    "estimatedTimeframe": "1-2 years",
    "universityPathway": {
      "degrees": ["Degree 1", "Degree 2"],
      "institutions": ["Institution 1", "Institution 2"],
      "estimatedDuration": "2-4 years",
      "outcomes": ["Outcome 1", "Outcome 2"]
    },
    "vocationalPathway": {
      "certifications": ["Certification 1", "Certification 2"],
      "providers": ["Provider 1", "Provider 2"],
      "estimatedDuration": "6-12 months",
      "outcomes": ["Outcome 1", "Outcome 2"]
    },
    "aiInsights": "AI insights on career pathway",
    "pathwaySteps": [
      {
        "step": "Step description",
        "timeframe": "Timeline",
        "description": "Detailed description"
      }
    ]
  },
  "developmentPlan": {
    "skillsAssessment": "Overall skills assessment",
    "technicalSkills": [
      {
        "skill": "Skill name",
        "currentLevel": 3,
        "targetLevel": 5,
        "developmentActions": ["Action 1", "Action 2"],
        "resources": ["Resource 1", "Resource 2"],
        "timeframe": "3-6 months"
      }
    ],
    "softSkills": [
      {
        "skill": "Skill name",
        "currentLevel": 3,
        "targetLevel": 5,
        "developmentActions": ["Action 1", "Action 2"],
        "resources": ["Resource 1", "Resource 2"],
        "timeframe": "3-6 months"
      }
    ],
    "skillsToAcquire": [
      {
        "skill": "Skill name",
        "relevance": "Why this skill matters",
        "developmentActions": ["Action 1", "Action 2"],
        "resources": ["Resource 1", "Resource 2"],
        "timeframe": "3-6 months"
      }
    ]
  },
  "educationalPrograms": {
    "recommendedPrograms": [
      {
        "name": "Program name",
        "provider": "Provider name",
        "format": "Online/In-person/Hybrid",
        "duration": "Duration",
        "description": "Program description",
        "skillsAddressed": ["Skill 1", "Skill 2"],
        "cost": "Estimated cost"
      }
    ],
    "suggestedProjects": [
      {
        "title": "Project title",
        "description": "Project description",
        "skillsDeveloped": ["Skill 1", "Skill 2"],
        "difficulty": "Intermediate",
        "estimatedTime": "Time estimate",
        "resources": ["Resource 1", "Resource 2"]
      }
    ]
  },
  "learningRoadmap": {
    "phases": [
      {
        "name": "Phase name",
        "duration": "Duration",
        "focus": "Main focus",
        "activities": ["Activity 1", "Activity 2"],
        "outcomes": ["Outcome 1", "Outcome 2"],
        "resources": ["Resource 1", "Resource 2"]
      }
    ],
    "roadmapOverview": "Overview of learning roadmap"
  },
  "similarRoles": {
    "roles": [
      {
        "title": "Role title",
        "description": "Role description",
        "fitScore": 8,
        "skillOverlap": ["Skill 1", "Skill 2"],
        "additionalSkillsNeeded": ["Skill 1", "Skill 2"],
        "transitionDifficulty": "Moderate",
        "industry": "Industry name",
        "salary": "Salary range"
      }
    ]
  },
  "quickTips": {
    "quickWins": ["Tip 1", "Tip 2"],
    "industryInsights": ["Insight 1", "Insight 2"],
    "interviewTips": ["Tip 1", "Tip 2"]
  },
  "growthTrajectory": {
    "shortTerm": {
      "role": "Role title",
      "timeframe": "0-2 years",
      "keySkills": ["Skill 1", "Skill 2"],
      "developmentFocus": "Development focus"
    },
    "mediumTerm": {
      "role": "Role title",
      "timeframe": "2-5 years",
      "keySkills": ["Skill 1", "Skill 2"],
      "developmentFocus": "Development focus"
    },
    "longTerm": {
      "role": "Role title",
      "timeframe": "5+ years",
      "keySkills": ["Skill 1", "Skill 2"],
      "developmentFocus": "Development focus"
    },
    "potentialSalaryProgression": [
      {
        "stage": "Stage name",
        "range": "Salary range",
        "notes": "Additional notes"
      }
    ]
  },
  "learningPathRoadmap": {
    "careerTrajectory": [
      {
        "stage": "Stage name",
        "role": "Role title",
        "timeframe": "Timeframe",
        "keyResponsibilities": ["Responsibility 1", "Responsibility 2"],
        "requiredSkills": ["Skill 1", "Skill 2"]
      }
    ],
    "milestones": [
      {
        "title": "Milestone title",
        "achievement": "Achievement description",
        "timeframe": "Timeframe",
        "skillsUtilized": ["Skill 1", "Skill 2"]
      }
    ]
  },
  "timestamp": "Current date and time",
  "version": "1.0"
}

All sections are required. Follow this exact structure with all fields populated with REAL content (not placeholders).
Ensure 'currentProficiencyData' and 'gapAnalysisData' are properly formatted for radar charts.
IMPORTANT: The response MUST be a valid, parseable JSON object that strictly follows this structure.
`;

  return structuredPrompt;
}

/**
 * Validates and ensures a report conforms to the required structure
 * @param reportData Raw report data from OpenAI
 * @returns A properly structured report
 */
export function ensureReportStructure(reportData: any): CareerAnalysisReport {
  // Create a base structure to ensure all required sections exist
  const baseStructure: CareerAnalysisReport = {
    executiveSummary: {
      summary: reportData?.executiveSummary?.summary || "No summary provided",
      careerGoal: reportData?.executiveSummary?.careerGoal || "No goal provided",
      keyFindings: reportData?.executiveSummary?.keyFindings || [],
      fitScore: reportData?.executiveSummary?.fitScore || {
        score: 0,
        outOf: 10,
        description: "Score unavailable"
      }
    },
    skillMapping: {
      sfiaSkills: reportData?.skillMapping?.sfiaSkills || [],
      digCompSkills: reportData?.skillMapping?.digCompSkills || [],
      otherSkills: reportData?.skillMapping?.otherSkills || [],
      skillsAnalysis: reportData?.skillMapping?.skillsAnalysis || "No skill analysis provided"
    },
    skillGapAnalysis: {
      targetRole: reportData?.skillGapAnalysis?.targetRole || "Unknown target role",
      currentProficiencyData: reportData?.skillGapAnalysis?.currentProficiencyData || {
        labels: [],
        datasets: [{ label: "Current Skills", data: [] }]
      },
      gapAnalysisData: reportData?.skillGapAnalysis?.gapAnalysisData || {
        labels: [],
        datasets: [
          { label: "Current Skills", data: [] },
          { label: "Required Skills", data: [] }
        ]
      },
      aiAnalysis: reportData?.skillGapAnalysis?.aiAnalysis || "No analysis available",
      keyGaps: reportData?.skillGapAnalysis?.keyGaps || [],
      keyStrengths: reportData?.skillGapAnalysis?.keyStrengths || []
    },
    careerPathwayOptions: {
      currentRole: reportData?.careerPathwayOptions?.currentRole || "Current role not specified",
      targetRole: reportData?.careerPathwayOptions?.targetRole || "Target role not specified",
      transitionDifficulty: reportData?.careerPathwayOptions?.transitionDifficulty || "Moderate",
      estimatedTimeframe: reportData?.careerPathwayOptions?.estimatedTimeframe || "Not specified",
      universityPathway: reportData?.careerPathwayOptions?.universityPathway || {
        degrees: [],
        institutions: [],
        estimatedDuration: "Not specified",
        outcomes: []
      },
      vocationalPathway: reportData?.careerPathwayOptions?.vocationalPathway || {
        certifications: [],
        providers: [],
        estimatedDuration: "Not specified",
        outcomes: []
      },
      aiInsights: reportData?.careerPathwayOptions?.aiInsights || "No insights available",
      pathwaySteps: reportData?.careerPathwayOptions?.pathwaySteps || []
    },
    developmentPlan: {
      skillsAssessment: reportData?.developmentPlan?.skillsAssessment || "No assessment available",
      technicalSkills: reportData?.developmentPlan?.technicalSkills || [],
      softSkills: reportData?.developmentPlan?.softSkills || [],
      skillsToAcquire: reportData?.developmentPlan?.skillsToAcquire || []
    },
    educationalPrograms: {
      recommendedPrograms: reportData?.educationalPrograms?.recommendedPrograms || [],
      suggestedProjects: reportData?.educationalPrograms?.suggestedProjects || []
    },
    learningRoadmap: {
      phases: reportData?.learningRoadmap?.phases || [],
      roadmapOverview: reportData?.learningRoadmap?.roadmapOverview || "No roadmap overview available"
    },
    similarRoles: {
      roles: reportData?.similarRoles?.roles || []
    },
    quickTips: {
      quickWins: reportData?.quickTips?.quickWins || [],
      industryInsights: reportData?.quickTips?.industryInsights || [],
      interviewTips: reportData?.quickTips?.interviewTips || []
    },
    growthTrajectory: {
      shortTerm: reportData?.growthTrajectory?.shortTerm || {
        role: "Not specified",
        timeframe: "0-2 years",
        keySkills: [],
        developmentFocus: "Not specified"
      },
      mediumTerm: reportData?.growthTrajectory?.mediumTerm || {
        role: "Not specified",
        timeframe: "2-5 years",
        keySkills: [],
        developmentFocus: "Not specified"
      },
      longTerm: reportData?.growthTrajectory?.longTerm || {
        role: "Not specified",
        timeframe: "5+ years",
        keySkills: [],
        developmentFocus: "Not specified"
      },
      potentialSalaryProgression: reportData?.growthTrajectory?.potentialSalaryProgression || []
    },
    learningPathRoadmap: {
      careerTrajectory: reportData?.learningPathRoadmap?.careerTrajectory || [],
      milestones: reportData?.learningPathRoadmap?.milestones || []
    },
    timestamp: reportData?.timestamp || new Date().toISOString(),
    version: reportData?.version || "1.0"
  };

  return baseStructure;
}