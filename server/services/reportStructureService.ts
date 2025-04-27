/**
 * Report Structure Service
 * 
 * This service ensures OpenAI responses match our expected report structure.
 * It formats and validates all sections of the career analysis report.
 */
import { CareerAnalysisReport } from "../../shared/types/reportTypes";

/**
 * Format raw OpenAI response into structured report format
 * @param rawReport The raw OpenAI response JSON
 * @returns A properly structured and validated report
 */
export function formatReport(rawReport: any): CareerAnalysisReport {
  console.log("Formatting OpenAI response into structured report...");
  
  try {
    // Ensure the report has all required sections
    const report: CareerAnalysisReport = {
      executiveSummary: {
        summary: rawReport.executiveSummary?.summary || "",
        careerGoal: rawReport.executiveSummary?.careerGoal || "",
        keyFindings: Array.isArray(rawReport.executiveSummary?.keyFindings) 
          ? rawReport.executiveSummary.keyFindings 
          : [],
        fitScore: rawReport.executiveSummary?.fitScore || { score: 0, outOf: 10, description: "No score available" },
      },
      
      skillMapping: {
        skillsAnalysis: rawReport.skillMapping?.skillsAnalysis || "",
        sfiaSkills: Array.isArray(rawReport.skillMapping?.sfiaSkills) 
          ? rawReport.skillMapping.sfiaSkills 
          : [],
        digCompSkills: Array.isArray(rawReport.skillMapping?.digCompSkills) 
          ? rawReport.skillMapping.digCompSkills 
          : [],
        otherSkills: Array.isArray(rawReport.skillMapping?.otherSkills) 
          ? rawReport.skillMapping.otherSkills 
          : [],
      },
      
      skillGapAnalysis: {
        targetRole: rawReport.skillGapAnalysis?.targetRole || "",
        aiAnalysis: rawReport.skillGapAnalysis?.aiAnalysis || "",
        keyGaps: Array.isArray(rawReport.skillGapAnalysis?.keyGaps) 
          ? rawReport.skillGapAnalysis.keyGaps 
          : [],
        keyStrengths: Array.isArray(rawReport.skillGapAnalysis?.keyStrengths) 
          ? rawReport.skillGapAnalysis.keyStrengths 
          : [],
        visualizationData: rawReport.skillGapAnalysis?.visualizationData || {
          currentSkills: [],
          requiredSkills: [],
        },
      },
      
      careerPathwayOptions: {
        currentRole: rawReport.careerPathwayOptions?.currentRole || "",
        targetRole: rawReport.careerPathwayOptions?.targetRole || "",
        timeframe: rawReport.careerPathwayOptions?.timeframe || "",
        pathwayDescription: rawReport.careerPathwayOptions?.pathwayDescription || "",
        pathwaySteps: Array.isArray(rawReport.careerPathwayOptions?.pathwaySteps) 
          ? rawReport.careerPathwayOptions.pathwaySteps 
          : [],
        universityPathway: Array.isArray(rawReport.careerPathwayOptions?.universityPathway) 
          ? rawReport.careerPathwayOptions.universityPathway 
          : [],
        vocationalPathway: Array.isArray(rawReport.careerPathwayOptions?.vocationalPathway) 
          ? rawReport.careerPathwayOptions.vocationalPathway 
          : [],
        aiInsights: rawReport.careerPathwayOptions?.aiInsights || "",
      },
      
      developmentPlan: {
        overview: rawReport.developmentPlan?.overview || "",
        technicalSkills: Array.isArray(rawReport.developmentPlan?.technicalSkills) 
          ? rawReport.developmentPlan.technicalSkills 
          : [],
        softSkills: Array.isArray(rawReport.developmentPlan?.softSkills) 
          ? rawReport.developmentPlan.softSkills 
          : [],
        skillsToAcquire: Array.isArray(rawReport.developmentPlan?.skillsToAcquire) 
          ? rawReport.developmentPlan.skillsToAcquire 
          : [],
      },
      
      educationalPrograms: {
        introduction: rawReport.educationalPrograms?.introduction || "",
        recommendedPrograms: Array.isArray(rawReport.educationalPrograms?.recommendedPrograms) 
          ? rawReport.educationalPrograms.recommendedPrograms 
          : [],
        suggestedProjects: Array.isArray(rawReport.educationalPrograms?.suggestedProjects) 
          ? rawReport.educationalPrograms.suggestedProjects 
          : [],
      },
      
      learningRoadmap: {
        roadmapOverview: rawReport.learningRoadmap?.roadmapOverview || "",
        learningPhases: Array.isArray(rawReport.learningRoadmap?.learningPhases) 
          ? rawReport.learningRoadmap.learningPhases 
          : [],
        skillsProgression: Array.isArray(rawReport.learningRoadmap?.skillsProgression) 
          ? rawReport.learningRoadmap.skillsProgression 
          : [],
      },
      
      similarRoles: {
        introduction: rawReport.similarRoles?.introduction || "",
        roles: Array.isArray(rawReport.similarRoles?.roles) 
          ? rawReport.similarRoles.roles 
          : [],
      },
      
      quickTips: {
        dailyLearningTips: Array.isArray(rawReport.quickTips?.dailyLearningTips) 
          ? rawReport.quickTips.dailyLearningTips 
          : [],
        interviewPreparationTips: Array.isArray(rawReport.quickTips?.interviewPreparationTips) 
          ? rawReport.quickTips.interviewPreparationTips 
          : [],
        networkingRecommendations: Array.isArray(rawReport.quickTips?.networkingRecommendations) 
          ? rawReport.quickTips.networkingRecommendations 
          : [],
      },
      
      growthTrajectory: {
        shortTermGoals: rawReport.growthTrajectory?.shortTermGoals || {
          timeframe: "",
          goals: [],
          metrics: [],
        },
        mediumTermGoals: rawReport.growthTrajectory?.mediumTermGoals || {
          timeframe: "",
          goals: [],
          metrics: [],
        },
        longTermGoals: rawReport.growthTrajectory?.longTermGoals || {
          timeframe: "",
          goals: [],
          metrics: [],
        },
        potentialSalaryProgression: Array.isArray(rawReport.growthTrajectory?.potentialSalaryProgression) 
          ? rawReport.growthTrajectory.potentialSalaryProgression 
          : [],
      },
      
      learningPathRoadmap: {
        timelineData: Array.isArray(rawReport.learningPathRoadmap?.timelineData) 
          ? rawReport.learningPathRoadmap.timelineData 
          : [],
        skillFocus: Array.isArray(rawReport.learningPathRoadmap?.skillFocus) 
          ? rawReport.learningPathRoadmap.skillFocus 
          : [],
      }
    };
    
    console.log("Successfully formatted report structure");
    return report;
  } catch (error) {
    console.error("Error formatting report structure:", error);
    throw new Error("Failed to format report structure");
  }
}