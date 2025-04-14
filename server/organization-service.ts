import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Define input interface
export interface OrganizationPathwayInput {
  organizationId?: string;
  organizationName?: string;
  currentRole: string;
  skills: string;
  desiredRole: string;
}

// Define output interface
export interface OrganizationPathwayOutput {
  organizationInfo: {
    name: string;
    structureOverview: string;
    industryPosition: string;
  };
  currentRoleAnalysis: {
    role: string;
    level: string;
    keyResponsibilities: string[];
    reportingStructure: string;
  };
  careerPathwayOptions: {
    verticalGrowth: Array<{
      role: string;
      level: string;
      estimatedTimeframe: string;
      requiredSkills: string[];
      keyResponsibilities: string[];
    }>;
    lateralMovement: Array<{
      role: string;
      department: string;
      skillTransferability: string;
      requiredAdditionalSkills: string[];
      benefits: string[];
    }>;
  };
  skillGapAnalysis: {
    existingRelevantSkills: string[];
    criticalSkillGaps: Array<{
      skill: string;
      importance: string;
      developmentPathways: string[];
    }>;
    internalTrainingOptions: Array<{
      name: string;
      type: string;
      duration: string;
      keyBenefits: string[];
    }>;
  };
  organizationalFitAnalysis: {
    valueAlignment: string;
    culturalFitScore: number;
    growthOpportunityScore: number;
    retentionRiskFactors: string[];
    recommendedActions: string[];
  };
}

// Sample organizations data - in a real app, this would come from a database
const SAMPLE_ORGANIZATIONS = [
  { id: "1", name: "Telstra" },
  { id: "2", name: "Commonwealth Bank" },
  { id: "3", name: "Westpac" },
  { id: "4", name: "Deloitte Australia" },
  { id: "5", name: "BHP" },
  { id: "6", name: "Optus" },
  { id: "7", name: "Woolworths Group" },
  { id: "8", name: "Coles Group" },
  { id: "9", name: "AMP" },
  { id: "10", name: "NAB" },
];

export async function analyzeOrganizationPathway(input: OrganizationPathwayInput): Promise<OrganizationPathwayOutput> {
  try {
    const organizationName = input.organizationId ? 
      SAMPLE_ORGANIZATIONS.find(org => org.id === input.organizationId)?.name || "" : 
      input.organizationName || "";

    // In a production environment, use OpenAI API to generate a real analysis
    // For this example, we'll create a realistic-looking response template
    // but in a real app, you'd use the OpenAI API
    
    // This is commented out to avoid hitting the API in development
    // but would be used in production:
    /*
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert career advisor specializing in organizational career progression analysis.
          You analyze career paths within organizations and provide detailed, actionable advice.
          Format your response as JSON with the structure defined in the user's prompt.`
        },
        {
          role: "user",
          content: `Generate a detailed organizational career pathway analysis for someone 
          currently working at ${organizationName} as a ${input.currentRole}, 
          with the following skills: ${input.skills}, 
          who wants to progress to the role of ${input.desiredRole}. 
          
          Format your response as JSON with the following structure:
          {
            "organizationInfo": {
              "name": string,
              "structureOverview": string,
              "industryPosition": string
            },
            "currentRoleAnalysis": {
              "role": string,
              "level": string,
              "keyResponsibilities": string[],
              "reportingStructure": string
            },
            "careerPathwayOptions": {
              "verticalGrowth": [
                {
                  "role": string,
                  "level": string,
                  "estimatedTimeframe": string,
                  "requiredSkills": string[],
                  "keyResponsibilities": string[]
                }
              ],
              "lateralMovement": [
                {
                  "role": string,
                  "department": string,
                  "skillTransferability": string,
                  "requiredAdditionalSkills": string[],
                  "benefits": string[]
                }
              ]
            },
            "skillGapAnalysis": {
              "existingRelevantSkills": string[],
              "criticalSkillGaps": [
                {
                  "skill": string,
                  "importance": string,
                  "developmentPathways": string[]
                }
              ],
              "internalTrainingOptions": [
                {
                  "name": string,
                  "type": string,
                  "duration": string,
                  "keyBenefits": string[]
                }
              ]
            },
            "organizationalFitAnalysis": {
              "valueAlignment": string,
              "culturalFitScore": number,
              "growthOpportunityScore": number,
              "retentionRiskFactors": string[],
              "recommendedActions": string[]
            }
          }`
        },
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content) as OrganizationPathwayOutput;
    return result;
    */

    // For development, return a mock response
    return {
      organizationInfo: {
        name: organizationName,
        structureOverview: "Hierarchical with 5 primary divisions and matrix management",
        industryPosition: "Leader in Australian market with strong presence in " + (organizationName.includes("Bank") ? "financial services" : "technology and telecommunications"),
      },
      currentRoleAnalysis: {
        role: input.currentRole,
        level: "Mid-level",
        keyResponsibilities: [
          "Project management for medium-sized initiatives",
          "Team coordination across multiple departments",
          "Stakeholder communication and engagement",
          "Resource allocation and planning"
        ],
        reportingStructure: "Reports to Senior Manager, with 3 direct reports"
      },
      careerPathwayOptions: {
        verticalGrowth: [
          {
            role: "Senior " + input.currentRole,
            level: "Senior",
            estimatedTimeframe: "1-2 years",
            requiredSkills: [
              "Advanced stakeholder management",
              "Strategic planning",
              "Team leadership",
              "Budget management"
            ],
            keyResponsibilities: [
              "Lead complex projects across divisions",
              "Develop and implement departmental strategies",
              "Mentor junior team members",
              "Participate in organizational planning"
            ]
          },
          {
            role: input.currentRole + " Manager",
            level: "Management",
            estimatedTimeframe: "3-5 years",
            requiredSkills: [
              "Leadership development",
              "Organizational strategy",
              "Financial management",
              "Executive communication"
            ],
            keyResponsibilities: [
              "Department oversight and strategic direction",
              "Cross-functional leadership",
              "Budget responsibility",
              "Performance management"
            ]
          },
          {
            role: "Director of " + input.currentRole.split(" ")[0],
            level: "Executive",
            estimatedTimeframe: "5-8 years",
            requiredSkills: [
              "Executive leadership",
              "Strategic vision",
              "Business development",
              "Organizational transformation"
            ],
            keyResponsibilities: [
              "Divisional strategy and execution",
              "Executive team collaboration",
              "Organizational change management",
              "Board reporting and engagement"
            ]
          }
        ],
        lateralMovement: [
          {
            role: "Product " + input.currentRole.split(" ")[0] + " Specialist",
            department: "Product Development",
            skillTransferability: "High",
            requiredAdditionalSkills: [
              "Product lifecycle management",
              "Market research analysis",
              "User experience design principles",
              "Agile development methodologies"
            ],
            benefits: [
              "Broader exposure to product development",
              "Enhanced understanding of customer needs",
              "Technical skills diversification",
              "Preparation for product management track"
            ]
          },
          {
            role: "Customer Success " + input.currentRole.split(" ")[0],
            department: "Customer Experience",
            skillTransferability: "Medium",
            requiredAdditionalSkills: [
              "Customer relationship management",
              "Solution selling",
              "Client needs assessment",
              "Client feedback implementation"
            ],
            benefits: [
              "Direct client interaction experience",
              "Revenue-driven mindset development",
              "Enhanced communication skills",
              "Market insights acquisition"
            ]
          }
        ]
      },
      skillGapAnalysis: {
        existingRelevantSkills: input.skills.split(',').map(skill => skill.trim()),
        criticalSkillGaps: [
          {
            skill: "Strategic planning and execution",
            importance: "High",
            developmentPathways: [
              "Internal strategic planning workshop series",
              "Shadow executive planning sessions",
              "Assigned strategy implementation projects",
              "External executive education program"
            ]
          },
          {
            skill: "Advanced people management",
            importance: "High",
            developmentPathways: [
              "Leadership development program",
              "Management mentoring circle",
              "360-degree feedback and coaching",
              "Conflict resolution training"
            ]
          },
          {
            skill: "Financial acumen",
            importance: "Medium",
            developmentPathways: [
              "Financial management for non-financial managers course",
              "Budget development and monitoring assignments",
              "ROI analysis practice",
              "Business case development workshops"
            ]
          }
        ],
        internalTrainingOptions: [
          {
            name: "Leadership Excellence Program",
            type: "Structured program",
            duration: "6 months",
            keyBenefits: [
              "Leadership skills development",
              "Strategic thinking enhancement",
              "Networking with senior leaders",
              "Real-world project application"
            ]
          },
          {
            name: "Career Accelerator Workshop Series",
            type: "Workshop series",
            duration: "3 months (bi-weekly sessions)",
            keyBenefits: [
              "Skill gap targeted development",
              "Interactive learning with peers",
              "Immediate application opportunities",
              "Senior leader engagement"
            ]
          },
          {
            name: "Executive Shadowing Program",
            type: "Experiential learning",
            duration: "2-4 weeks",
            keyBenefits: [
              "Real-time executive decision observation",
              "Executive networking",
              "Leadership style exposure",
              "Organizational perspective broadening"
            ]
          }
        ]
      },
      organizationalFitAnalysis: {
        valueAlignment: "Strong alignment with organizational values of innovation and customer-centricity",
        culturalFitScore: 85,
        growthOpportunityScore: 78,
        retentionRiskFactors: [
          "Limited advancement in current department",
          "Skills underutilization",
          "Competitive external market for similar roles",
          "Potential compensation gap with market"
        ],
        recommendedActions: [
          "Implement personalized development plan targeting leadership skills",
          "Create cross-departmental project opportunities",
          "Schedule quarterly career discussion with direct manager",
          "Review compensation package against market rates",
          "Consider internal mentorship program participation"
        ]
      }
    };
  } catch (error) {
    console.error("Error in organization pathway analysis:", error);
    throw new Error("Failed to analyze organization pathway");
  }
}