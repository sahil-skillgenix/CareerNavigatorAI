import { CareerAnalysisReport } from '../../shared/reportSchema';

/**
 * Service to ensure the data from OpenAI API conforms to our structured report format
 */
export class ReportStructureService {
  
  /**
   * Process and structure raw response data from OpenAI to match the CareerAnalysisReport schema
   * @param rawData - The raw data received from OpenAI API
   * @returns A structured report conforming to CareerAnalysisReport schema
   */
  public structureOpenAIResponse(rawData: any): CareerAnalysisReport {
    console.log("Structuring OpenAI response data to match report schema...");
    
    // Create a structured report with all required sections based on our schema
    const structuredReport: CareerAnalysisReport = {
      // Section 1: Executive Summary
      executiveSummary: this.extractExecutiveSummary(rawData),
      
      // Section 2: Skill Mapping
      skillMapping: this.extractSkillMapping(rawData),
      
      // Section 3: Framework-Based Skill Gap Analysis
      gapAnalysis: this.extractGapAnalysis(rawData),
      
      // Section 4: Career Pathway Options
      pathwayOptions: this.extractPathwayOptions(rawData),
      
      // Section 5: Comprehensive Development Plan
      developmentPlan: this.extractDevelopmentPlan(rawData),
      
      // Section 6: Recommended Educational Programs
      educationalPrograms: this.extractEducationalPrograms(rawData),
      
      // Section 7: AI-Enhanced Learning Roadmap
      learningRoadmap: this.extractLearningRoadmap(rawData),
      
      // Section 8: Similar Roles To Consider
      similarRoles: this.extractSimilarRoles(rawData),
      
      // Section 9: Micro-Learning Quick Tips
      quickTips: this.extractQuickTips(rawData),
      
      // Section 10: Personalized Skill Growth Trajectory
      growthTrajectory: this.extractGrowthTrajectory(rawData),
      
      // Section 11: Learning Path Roadmap
      learningPathRoadmap: this.extractLearningPathRoadmap(rawData)
    };
    
    return structuredReport;
  }
  
  /**
   * Extract executive summary data from raw response
   */
  private extractExecutiveSummary(rawData: any): CareerAnalysisReport['executiveSummary'] {
    try {
      // Try to extract the executive summary from the structured data
      if (rawData.executiveSummary && typeof rawData.executiveSummary === 'object') {
        return {
          overview: rawData.executiveSummary.overview || this.extractOverviewFromString(rawData.executiveSummary),
          keyPoints: Array.isArray(rawData.executiveSummary.keyPoints) 
            ? rawData.executiveSummary.keyPoints 
            : [],
          recommendedNextSteps: Array.isArray(rawData.executiveSummary.recommendedNextSteps) 
            ? rawData.executiveSummary.recommendedNextSteps 
            : []
        };
      }
      
      // If the executive summary is just a string, convert it to our structured format
      if (typeof rawData.executiveSummary === 'string') {
        return {
          overview: this.extractOverviewFromString(rawData.executiveSummary),
          keyPoints: [],
          recommendedNextSteps: []
        };
      }
      
      // Default structure if no data is available
      return {
        overview: "Executive summary not available",
        keyPoints: [],
        recommendedNextSteps: []
      };
    } catch (error) {
      console.error("Error extracting executive summary:", error);
      return {
        overview: "Error extracting executive summary",
        keyPoints: [],
        recommendedNextSteps: []
      };
    }
  }
  
  /**
   * Extract skill mapping data from raw response
   */
  private extractSkillMapping(rawData: any): CareerAnalysisReport['skillMapping'] {
    try {
      const skillMapping: CareerAnalysisReport['skillMapping'] = {
        sfia9: [],
        digcomp22: []
      };
      
      // Extract SFIA 9 Framework data
      if (rawData.skillMapping?.sfia9 && Array.isArray(rawData.skillMapping.sfia9)) {
        skillMapping.sfia9 = rawData.skillMapping.sfia9.map((skill: any) => ({
          skill: skill.skill || 'Unknown Skill',
          level: skill.level || 'Unknown Level',
          description: skill.description || 'No description available'
        }));
      }
      
      // Extract DigComp 2.2 Framework data
      if (rawData.skillMapping?.digcomp22 && Array.isArray(rawData.skillMapping.digcomp22)) {
        skillMapping.digcomp22 = rawData.skillMapping.digcomp22.map((skill: any) => ({
          competence: skill.competence || skill.skill || 'Unknown Competence',
          proficiencyLevel: skill.proficiencyLevel || skill.level || 'Unknown Level',
          description: skill.description || 'No description available'
        }));
      }
      
      return skillMapping;
    } catch (error) {
      console.error("Error extracting skill mapping:", error);
      return {
        sfia9: [],
        digcomp22: []
      };
    }
  }
  
  /**
   * Extract gap analysis data from raw response
   */
  private extractGapAnalysis(rawData: any): CareerAnalysisReport['gapAnalysis'] {
    try {
      const gapAnalysis: CareerAnalysisReport['gapAnalysis'] = {
        radarChartData: [],
        barChartData: [],
        aiAnalysis: '',
        skillGaps: [],
        skillStrengths: []
      };
      
      // Extract Radar Chart Data
      if (rawData.gapAnalysis?.radarChartData && Array.isArray(rawData.gapAnalysis.radarChartData)) {
        gapAnalysis.radarChartData = rawData.gapAnalysis.radarChartData.map((item: any) => ({
          skill: item.skill || 'Unknown Skill',
          currentLevel: typeof item.currentLevel === 'number' ? item.currentLevel : 1,
          requiredLevel: typeof item.requiredLevel === 'number' ? item.requiredLevel : 3,
          fullMark: typeof item.fullMark === 'number' ? item.fullMark : 5
        }));
      } else if (rawData.skillGapAnalysis?.radarChartData) {
        // Alternative location in the data
        gapAnalysis.radarChartData = rawData.skillGapAnalysis.radarChartData;
      }
      
      // Extract Bar Chart Data
      if (rawData.gapAnalysis?.barChartData && Array.isArray(rawData.gapAnalysis.barChartData)) {
        gapAnalysis.barChartData = rawData.gapAnalysis.barChartData.map((item: any) => ({
          name: item.name || item.skill || 'Unknown Skill',
          currentLevel: typeof item.currentLevel === 'number' ? item.currentLevel : 1,
          requiredLevel: typeof item.requiredLevel === 'number' ? item.requiredLevel : 3,
          gap: typeof item.gap === 'number' ? item.gap : 2,
          importance: item.importance || 'Medium'
        }));
      } else if (rawData.skillGapAnalysis?.barChartData) {
        // Alternative location in the data
        gapAnalysis.barChartData = rawData.skillGapAnalysis.barChartData;
      }
      
      // Extract AI Analysis
      gapAnalysis.aiAnalysis = rawData.gapAnalysis?.aiAnalysis || 
                              rawData.skillGapAnalysis?.aiAnalysis || 
                              'No AI-enhanced analysis available';
      
      // Extract Skill Gaps
      if (rawData.gapAnalysis?.skillGaps && Array.isArray(rawData.gapAnalysis.skillGaps)) {
        gapAnalysis.skillGaps = rawData.gapAnalysis.skillGaps;
      } else if (rawData.skillGapAnalysis?.skillGaps) {
        gapAnalysis.skillGaps = rawData.skillGapAnalysis.skillGaps;
      }
      
      // Extract Skill Strengths
      if (rawData.gapAnalysis?.skillStrengths && Array.isArray(rawData.gapAnalysis.skillStrengths)) {
        gapAnalysis.skillStrengths = rawData.gapAnalysis.skillStrengths;
      } else if (rawData.skillGapAnalysis?.skillStrengths) {
        gapAnalysis.skillStrengths = rawData.skillGapAnalysis.skillStrengths;
      }
      
      return gapAnalysis;
    } catch (error) {
      console.error("Error extracting gap analysis:", error);
      return {
        radarChartData: [],
        barChartData: [],
        aiAnalysis: 'Error extracting gap analysis',
        skillGaps: [],
        skillStrengths: []
      };
    }
  }
  
  /**
   * Extract pathway options data from raw response
   */
  private extractPathwayOptions(rawData: any): CareerAnalysisReport['pathwayOptions'] {
    try {
      const pathwayOptions: CareerAnalysisReport['pathwayOptions'] = {
        transitionVisualization: {
          currentRole: '',
          targetRole: '',
          transitionSteps: [],
          estimatedTimeframe: ''
        },
        universityPathway: {
          recommendedDegrees: [],
          institutions: [],
          estimatedTimeframe: '',
          expectedOutcomes: []
        },
        vocationalPathway: {
          recommendedCertifications: [],
          providers: [],
          estimatedTimeframe: '',
          expectedOutcomes: []
        },
        aiInsights: ''
      };
      
      // Extract from pathwayOptions or careerPathwayOptions
      const sourceData = rawData.pathwayOptions || rawData.careerPathwayOptions || {};
      
      // Extract Transition Visualization
      if (sourceData.transitionVisualization) {
        pathwayOptions.transitionVisualization = sourceData.transitionVisualization;
      }
      
      // Extract University Pathway
      if (sourceData.universityPathway) {
        pathwayOptions.universityPathway = sourceData.universityPathway;
      }
      
      // Extract Vocational Pathway
      if (sourceData.vocationalPathway) {
        pathwayOptions.vocationalPathway = sourceData.vocationalPathway;
      }
      
      // Extract AI Insights
      pathwayOptions.aiInsights = sourceData.aiInsights || 'No AI pathway insights available';
      
      return pathwayOptions;
    } catch (error) {
      console.error("Error extracting pathway options:", error);
      return {
        transitionVisualization: {
          currentRole: 'Error',
          targetRole: 'Error',
          transitionSteps: [],
          estimatedTimeframe: 'Unknown'
        },
        universityPathway: {
          recommendedDegrees: [],
          institutions: [],
          estimatedTimeframe: '',
          expectedOutcomes: []
        },
        vocationalPathway: {
          recommendedCertifications: [],
          providers: [],
          estimatedTimeframe: '',
          expectedOutcomes: []
        },
        aiInsights: 'Error extracting pathway options'
      };
    }
  }
  
  /**
   * Extract development plan data from raw response
   */
  private extractDevelopmentPlan(rawData: any): CareerAnalysisReport['developmentPlan'] {
    try {
      const developmentPlan: CareerAnalysisReport['developmentPlan'] = {
        existingSkills: [],
        skillsToDevelop: [],
        softSkills: [],
        skillPriorityDistribution: [],
        skillsToAcquire: []
      };
      
      // Extract from developmentPlan or comprehensiveDevelopmentPlan
      const sourceData = rawData.developmentPlan || rawData.comprehensiveDevelopmentPlan || {};
      
      // Extract Existing Skills
      if (sourceData.existingSkills && Array.isArray(sourceData.existingSkills)) {
        developmentPlan.existingSkills = sourceData.existingSkills;
      }
      
      // Extract Skills To Develop
      if (sourceData.skillsToDevelop && Array.isArray(sourceData.skillsToDevelop)) {
        developmentPlan.skillsToDevelop = sourceData.skillsToDevelop;
      }
      
      // Extract Soft Skills
      if (sourceData.softSkills && Array.isArray(sourceData.softSkills)) {
        developmentPlan.softSkills = sourceData.softSkills;
      }
      
      // Extract Skill Priority Distribution
      if (sourceData.skillPriorityDistribution && Array.isArray(sourceData.skillPriorityDistribution)) {
        developmentPlan.skillPriorityDistribution = sourceData.skillPriorityDistribution;
      }
      
      // Extract Skills To Acquire
      if (sourceData.skillsToAcquire && Array.isArray(sourceData.skillsToAcquire)) {
        developmentPlan.skillsToAcquire = sourceData.skillsToAcquire;
      }
      
      return developmentPlan;
    } catch (error) {
      console.error("Error extracting development plan:", error);
      return {
        existingSkills: [],
        skillsToDevelop: [],
        softSkills: [],
        skillPriorityDistribution: [],
        skillsToAcquire: []
      };
    }
  }
  
  /**
   * Extract educational programs data from raw response
   */
  private extractEducationalPrograms(rawData: any): CareerAnalysisReport['educationalPrograms'] {
    try {
      const educationalPrograms: CareerAnalysisReport['educationalPrograms'] = {
        institutions: [],
        onlineCourses: [],
        suggestedProjects: []
      };
      
      // Extract from educationalPrograms or recommendedEducationalPrograms
      const sourceData = rawData.educationalPrograms || rawData.recommendedEducationalPrograms || {};
      
      // Extract Institutions
      if (sourceData.institutions && Array.isArray(sourceData.institutions)) {
        educationalPrograms.institutions = sourceData.institutions;
      }
      
      // Extract Online Courses
      if (sourceData.onlineCourses && Array.isArray(sourceData.onlineCourses)) {
        educationalPrograms.onlineCourses = sourceData.onlineCourses;
      }
      
      // Extract Suggested Projects
      if (sourceData.suggestedProjects && Array.isArray(sourceData.suggestedProjects)) {
        educationalPrograms.suggestedProjects = sourceData.suggestedProjects;
      }
      
      return educationalPrograms;
    } catch (error) {
      console.error("Error extracting educational programs:", error);
      return {
        institutions: [],
        onlineCourses: [],
        suggestedProjects: []
      };
    }
  }
  
  /**
   * Extract learning roadmap data from raw response
   */
  private extractLearningRoadmap(rawData: any): CareerAnalysisReport['learningRoadmap'] {
    try {
      const learningRoadmap: CareerAnalysisReport['learningRoadmap'] = {
        phases: [],
        aiGeneratedInsights: ''
      };
      
      // Extract from learningRoadmap or aiEnhancedLearningRoadmap
      const sourceData = rawData.learningRoadmap || rawData.aiEnhancedLearningRoadmap || {};
      
      // Extract Phases
      if (sourceData.phases && Array.isArray(sourceData.phases)) {
        learningRoadmap.phases = sourceData.phases;
      }
      
      // Extract AI Generated Insights
      learningRoadmap.aiGeneratedInsights = sourceData.aiGeneratedInsights || 'No AI-generated insights available';
      
      return learningRoadmap;
    } catch (error) {
      console.error("Error extracting learning roadmap:", error);
      return {
        phases: [],
        aiGeneratedInsights: 'Error extracting learning roadmap'
      };
    }
  }
  
  /**
   * Extract similar roles data from raw response
   */
  private extractSimilarRoles(rawData: any): CareerAnalysisReport['similarRoles'] {
    try {
      // Extract Similar Roles
      if (rawData.similarRoles && Array.isArray(rawData.similarRoles)) {
        return rawData.similarRoles.map((role: any) => ({
          role: role.role || 'Unknown Role',
          description: role.description || 'No description available',
          skillOverlap: typeof role.skillOverlap === 'number' ? role.skillOverlap : 0,
          averageSalary: role.averageSalary || undefined,
          growthPotential: role.growthPotential || 'Medium',
          transitionDifficulty: role.transitionDifficulty || 'Moderate'
        }));
      }
      
      return [];
    } catch (error) {
      console.error("Error extracting similar roles:", error);
      return [];
    }
  }
  
  /**
   * Extract quick tips data from raw response
   */
  private extractQuickTips(rawData: any): CareerAnalysisReport['quickTips'] {
    try {
      // Extract from quickTips or microLearningQuickTips
      const sourceData = rawData.quickTips || rawData.microLearningQuickTips || [];
      
      if (Array.isArray(sourceData)) {
        return sourceData;
      }
      
      return [];
    } catch (error) {
      console.error("Error extracting quick tips:", error);
      return [];
    }
  }
  
  /**
   * Extract growth trajectory data from raw response
   */
  private extractGrowthTrajectory(rawData: any): CareerAnalysisReport['growthTrajectory'] {
    try {
      const growthTrajectory: CareerAnalysisReport['growthTrajectory'] = {
        shortTerm: [],
        mediumTerm: [],
        longTerm: [],
        potentialRoles: []
      };
      
      // Extract from growthTrajectory or personalizedSkillGrowthTrajectory
      const sourceData = rawData.growthTrajectory || rawData.personalizedSkillGrowthTrajectory || {};
      
      // Extract Short Term
      if (sourceData.shortTerm && Array.isArray(sourceData.shortTerm)) {
        growthTrajectory.shortTerm = sourceData.shortTerm;
      }
      
      // Extract Medium Term
      if (sourceData.mediumTerm && Array.isArray(sourceData.mediumTerm)) {
        growthTrajectory.mediumTerm = sourceData.mediumTerm;
      }
      
      // Extract Long Term
      if (sourceData.longTerm && Array.isArray(sourceData.longTerm)) {
        growthTrajectory.longTerm = sourceData.longTerm;
      }
      
      // Extract Potential Roles
      if (sourceData.potentialRoles && Array.isArray(sourceData.potentialRoles)) {
        growthTrajectory.potentialRoles = sourceData.potentialRoles;
      }
      
      return growthTrajectory;
    } catch (error) {
      console.error("Error extracting growth trajectory:", error);
      return {
        shortTerm: [],
        mediumTerm: [],
        longTerm: [],
        potentialRoles: []
      };
    }
  }
  
  /**
   * Extract learning path roadmap data from raw response
   */
  private extractLearningPathRoadmap(rawData: any): CareerAnalysisReport['learningPathRoadmap'] {
    try {
      const learningPathRoadmap: CareerAnalysisReport['learningPathRoadmap'] = {
        timeline: []
      };
      
      // Extract from learningPathRoadmap
      const sourceData = rawData.learningPathRoadmap || {};
      
      // Extract Timeline
      if (sourceData.timeline && Array.isArray(sourceData.timeline)) {
        learningPathRoadmap.timeline = sourceData.timeline;
      }
      
      return learningPathRoadmap;
    } catch (error) {
      console.error("Error extracting learning path roadmap:", error);
      return {
        timeline: []
      };
    }
  }
  
  /**
   * Extract overview from a string (for cases where executive summary is just a string)
   */
  private extractOverviewFromString(text: string): string {
    if (!text) return '';
    
    // If the text is longer than 1000 characters, truncate it
    if (text.length > 1000) {
      return text.substring(0, 997) + '...';
    }
    
    return text;
  }
}