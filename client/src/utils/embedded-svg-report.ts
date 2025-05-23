/**
 * Utility function for generating HTML reports with embedded SVG charts
 * This approach embeds SVG directly in the HTML rather than using the base64 image approach
 */

import { format } from 'date-fns';

interface ChartData {
  name: string;
  value: number;
}

interface GapData {
  skill: string;
  current: number;
  required: number;
}

interface PathwayStep {
  step: string;
  timeframe: string;
}

interface AnalysisMetadata {
  targetRole: string;
  dateCreated: string;
  professionalLevel: string;
  location?: string;
  currentSkills?: string;
  educationalBackground?: string;
  careerHistory?: string;
  currentRole?: string;
}

// For simplicity, define a minimal report interface here
interface Report {
  executiveSummary?: any;
  skillMapping?: any;
  skillGapAnalysis?: any;
  careerPathwayOptions?: any;
  learningRoadmap?: any;
  similarRoles?: any;
  quickTips?: any;
  growthTrajectory?: any;
  learningPathRoadmap?: any;
  developmentPlan?: any;
  educationalPrograms?: any;
}

export function generateEmbeddedSVGReport(report: Report, metadata: AnalysisMetadata): string {
  // Generate title for the report
  const reportTitle = `Skillgenix Career Analysis - ${metadata.targetRole}`;
  
  // Ensure all required sections exist in the report (even if empty)
  const ensuredReport = {
    executiveSummary: report.executiveSummary || {
      summary: 'This analysis provides a comprehensive career transition plan based on your profile and target role.',
      careerGoal: metadata.targetRole || 'Career advancement',
      compatibilityScore: '7/10',
      keyFindings: ['Strong transferable skills', 'Development areas identified', 'Clear pathway to target role'],
    },
    skillMapping: report.skillMapping || {
      overview: 'This section maps your current skills to industry frameworks.',
      sfiaSkills: [],
      digCompSkills: []
    },
    skillGapAnalysis: report.skillGapAnalysis || {
      overview: 'This analysis identifies gaps between your current skills and those needed for your target role.',
      keyGaps: [],
      transferableStrengths: []
    },
    careerPathwayOptions: report.careerPathwayOptions || {
      overview: 'This pathway outlines recommended steps to transition to your target role.',
      pathwaySteps: []
    },
    learningRoadmap: report.learningRoadmap || {
      overview: 'This roadmap visualizes your learning journey, from foundational to advanced skills.',
      foundationalSkills: [],
      intermediateSkills: [],
      advancedSkills: []
    },
    similarRoles: report.similarRoles || {
      introduction: 'These roles share similarities with your target position and may offer alternative paths.',
      roles: []
    },
    quickTips: report.quickTips || {
      overview: 'Quick actionable tips to accelerate your career transition.',
      keyTips: []
    },
    growthTrajectory: report.growthTrajectory || {
      overview: 'Your projected career growth and progression path.',
      projectedTimeline: []
    },
    learningPathRoadmap: report.learningPathRoadmap || {
      overview: 'A detailed learning path to achieve your career goals.',
      keyMilestones: []
    },
    developmentPlan: report.developmentPlan || {
      overview: 'Your customized skill development plan.',
      actionItems: []
    },
    educationalPrograms: report.educationalPrograms || {
      overview: 'Recommended educational programs and resources.',
      programs: []
    }
  };
  
  // Extract skill data for radar chart
  let skillData: ChartData[] = [];
  if (ensuredReport.skillMapping.sfiaSkills && ensuredReport.skillMapping.sfiaSkills.length > 0) {
    skillData = ensuredReport.skillMapping.sfiaSkills.map(skill => ({
      name: typeof skill === 'string' ? skill : skill.skill || skill.name || 'Skill',
      value: typeof skill === 'string' ? 3 : parseInt(skill.proficiency || skill.level || '3', 10)
    }));
  } else if (ensuredReport.skillMapping.digCompSkills && ensuredReport.skillMapping.digCompSkills.length > 0) {
    skillData = ensuredReport.skillMapping.digCompSkills.map(skill => ({
      name: typeof skill === 'string' ? skill : skill.skill || skill.name || 'Skill',
      value: typeof skill === 'string' ? 3 : parseInt(skill.proficiency || skill.level || '3', 10)
    }));
  }
  
  // If we don't have any skills data, add placeholder data
  if (skillData.length === 0) {
    skillData = [
      { name: 'Technical Skills', value: 3 },
      { name: 'Communication', value: 4 },
      { name: 'Management', value: 3 },
      { name: 'Domain Knowledge', value: 2 }
    ];
  }
  
  // Cap at 6 skills for the radar chart
  skillData = skillData.slice(0, 6);
  
  // Extract gap data for bar chart
  let gapData: GapData[] = [];
  if (ensuredReport.skillGapAnalysis.keyGaps && ensuredReport.skillGapAnalysis.keyGaps.length > 0) {
    gapData = ensuredReport.skillGapAnalysis.keyGaps.map(gap => ({
      skill: typeof gap === 'string' ? gap : gap.skill || 'Skill',
      current: typeof gap === 'string' ? 3 : parseInt(gap.currentLevel || '3', 10),
      required: typeof gap === 'string' ? 5 : parseInt(gap.requiredLevel || '5', 10)
    }));
  }
  
  // If no gap data, add placeholder data
  if (gapData.length === 0) {
    gapData = [
      { skill: 'Technical', current: 2, required: 5 },
      { skill: 'Data', current: 1, required: 4 },
      { skill: 'Management', current: 4, required: 4 }
    ];
  }
  
  // Cap at 5 gaps for the bar chart
  gapData = gapData.slice(0, 5);
  
  // Extract pathway steps
  let pathwaySteps: PathwayStep[] = [];
  if (ensuredReport.careerPathwayOptions.pathwaySteps && ensuredReport.careerPathwayOptions.pathwaySteps.length > 0) {
    pathwaySteps = ensuredReport.careerPathwayOptions.pathwaySteps.map(step => ({
      step: typeof step === 'string' ? step : step.step || step.title || step.name || 'Step',
      timeframe: typeof step === 'string' ? '3-6 months' : step.timeframe || step.duration || step.timeline || '3-6 months'
    }));
  }
  
  // Add default pathway steps if none exist
  if (pathwaySteps.length === 0) {
    pathwaySteps = [
      { step: 'Skill Building', timeframe: '3-6 months' },
      { step: 'Certification', timeframe: '6-9 months' },
      { step: 'Career Transition', timeframe: '9-12 months' }
    ];
  }
  
  // Cap at 4 steps for the pathway visualization
  pathwaySteps = pathwaySteps.slice(0, 4);
  
  // Create radar chart SVG
  const radarChartSVG = generateRadarChartSVG(skillData);
  
  // Create gap analysis chart SVG
  const gapAnalysisChartSVG = generateGapAnalysisChartSVG(gapData);
  
  // Create career pathway SVG
  const careerPathwaySVG = generateCareerPathwaySVG(pathwaySteps, metadata);
  
  // Create learning roadmap SVG
  const learningRoadmapSVG = generateLearningRoadmapSVG();
  
  // Add spacing between sections to avoid overlapping
  const sectionSpacing = '<div style="height: 30px; clear: both;"></div>';

  // Build the complete HTML report
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${reportTitle}</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .header {
          background: linear-gradient(to right, rgb(28, 59, 130), rgb(41, 82, 173));
          color: white;
          padding: 30px;
          border-radius: 8px;
          margin-bottom: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
        }
        .header p {
          margin: 10px 0 0;
          opacity: 0.9;
        }
        .section {
          background: white;
          border-radius: 8px;
          padding: 25px;
          margin-bottom: 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          border-left: 5px solid #ddd;
        }
        .section-title {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
          font-size: 24px;
          color: rgb(28, 59, 130);
        }
        .section-icon {
          width: 32px;
          height: 32px;
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          background-color: rgb(28, 59, 130);
          border-radius: 50%;
        }
        .executive-summary {
          border-left-color: rgb(28, 59, 130);
        }
        .skill-mapping {
          border-left-color: rgb(56, 128, 255);
        }
        .gap-analysis {
          border-left-color: rgb(255, 153, 0);
        }
        .career-pathway {
          border-left-color: rgb(79, 70, 229);
        }
        .development-plan {
          border-left-color: rgb(34, 197, 94);
        }
        .educational-programs {
          border-left-color: rgb(56, 128, 255);
        }
        .learning-roadmap {
          border-left-color: rgb(168, 85, 247);
        }
        .similar-roles {
          border-left-color: rgb(245, 158, 11);
        }
        .quick-tips {
          border-left-color: rgb(250, 204, 21);
        }
        .growth-trajectory {
          border-left-color: rgb(20, 184, 166);
        }
        .learning-path {
          border-left-color: rgb(236, 72, 153);
        }
        .summary-box {
          background-color: rgba(28, 59, 130, 0.05);
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }
        .info-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .info-card-title {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 8px;
        }
        .info-card-content {
          font-size: 18px;
          font-weight: 600;
          color: rgb(28, 59, 130);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
          background-color: rgba(28, 59, 130, 0.1);
          color: rgb(28, 59, 130);
          margin-right: 5px;
          margin-bottom: 5px;
        }
        .findings-list {
          padding-left: 24px;
        }
        .findings-list li {
          margin-bottom: 8px;
          position: relative;
        }
        .findings-list li::before {
          content: "✓";
          color: rgb(34, 197, 94);
          font-weight: bold;
          display: inline-block;
          position: absolute;
          left: -20px;
        }
        .step-container {
          position: relative;
          padding-left: 30px;
          margin-bottom: 25px;
        }
        .step-number {
          position: absolute;
          left: 0;
          top: 0;
          width: 24px;
          height: 24px;
          background-color: rgb(79, 70, 229);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
        }
        .step-content {
          background: rgba(79, 70, 229, 0.05);
          border-radius: 8px;
          padding: 15px;
        }
        .step-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .step-name {
          font-weight: 600;
        }
        .step-time {
          font-size: 12px;
          background: white;
          padding: 3px 8px;
          border-radius: 9999px;
          color: rgb(79, 70, 229);
          border: 1px solid rgba(79, 70, 229, 0.3);
        }
        .chart-container {
          margin: 25px 0;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 15px;
          background: white;
          width: 100%;
          overflow: visible;
          min-height: 350px;
          box-sizing: border-box;
        }
        .chart-placeholder {
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f8fafc;
          border-radius: 4px;
          color: #94a3b8;
          font-style: italic;
        }
        svg {
          max-width: 100%;
          height: auto;
          max-height: 350px;
          display: block;
          margin: 0 auto;
          overflow: visible;
        }
        .footer {
          text-align: center;
          padding: 20px;
          margin-top: 50px;
          border-top: 1px solid #e2e8f0;
          color: #6b7280;
          font-size: 14px;
        }
        .two-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .two-columns {
            grid-template-columns: 1fr;
          }
        }
        /* SVG specific styles */
        .radar-chart-title { font-size: 16px; font-weight: bold; fill: #1c3b82; text-anchor: middle; }
        .axis-label { font-size: 10px; fill: #64748b; text-anchor: middle; }
        .axis-line { stroke: rgba(0,0,0,0.1); stroke-width: 1; }
        .level-circle { fill: none; stroke: rgba(0,0,0,0.1); stroke-width: 1; }
        .skill-polygon { fill: rgba(28,59,130,0.5); stroke: rgb(28,59,130); stroke-width: 2; }
        .level-label { font-size: 8px; fill: #64748b; text-anchor: middle; }
        .chart-title { font-size: 16px; font-weight: bold; fill: #ff9900; text-anchor: middle; }
        .grid-line { stroke: rgba(0,0,0,0.1); stroke-width: 1; stroke-dasharray: 3,3; }
        .bar-current { fill: rgba(28,59,130,0.8); }
        .bar-required { fill: rgba(163,29,82,0.8); }
        .legend-text { font-size: 10px; fill: #64748b; }
        .legend-rect { stroke: none; }
        .pathway-title { font-size: 16px; font-weight: bold; fill: #4f46e5; text-anchor: middle; }
        .step-circle { fill: rgba(79,70,229,0.2); stroke: #4f46e5; stroke-width: 2; }
        .step-line { stroke: #4f46e5; stroke-width: 2; stroke-dasharray: 5,5; }
        .step-number { font-size: 14px; font-weight: bold; fill: #4f46e5; text-anchor: middle; }
        .step-label { font-size: 12px; fill: #1e293b; text-anchor: middle; }
        .timeframe-label { font-size: 10px; fill: #64748b; text-anchor: middle; }
        .current-role { font-size: 12px; fill: #64748b; text-anchor: start; }
        .target-role { font-size: 12px; fill: #64748b; text-anchor: end; }
        .roadmap-title { font-size: 16px; font-weight: bold; fill: #a855f7; text-anchor: middle; }
        .timeline-line { stroke: #a855f7; stroke-width: 3; }
        .milestone { fill: white; stroke: #a855f7; stroke-width: 2; }
        .milestone-label { font-size: 12px; fill: #1e293b; text-anchor: middle; }
        .timeline-label { font-size: 10px; fill: #64748b; text-anchor: middle; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${reportTitle}</h1>
        <p>Generated on ${format(new Date(metadata.dateCreated), 'MMMM d, yyyy')} for ${metadata.professionalLevel} professional</p>
      </div>
      
      <!-- Executive Summary (Section 1) -->
      <div class="section executive-summary">
        <div class="section-title">
          <div class="section-icon">1</div>
          Executive Summary
        </div>
        <div class="summary-box">
          <p>${ensuredReport.executiveSummary.summary}</p>
        </div>
        <div class="info-grid">
          <div class="info-card">
            <div class="info-card-title">Career Goal</div>
            <div class="info-card-content">
              <span>${ensuredReport.executiveSummary.careerGoal || metadata.targetRole}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="info-card-title">Fit Score</div>
            <div class="info-card-content">
              <span>
                ${ensuredReport.executiveSummary.fitScore && ensuredReport.executiveSummary.fitScore.score ? 
                  `${ensuredReport.executiveSummary.fitScore.score}/${ensuredReport.executiveSummary.fitScore.outOf || 10}` : 
                  ensuredReport.executiveSummary.compatibilityScore || '7/10'}
              </span>
            </div>
          </div>
        </div>
        
        <div>
          <h3>Key Findings</h3>
          <ul class="findings-list">
            ${ensuredReport.executiveSummary.keyFindings && ensuredReport.executiveSummary.keyFindings.length > 0 ? 
              ensuredReport.executiveSummary.keyFindings.map(finding => `<li>${finding}</li>`).join('') : 
              '<li>Strong transferable skills</li><li>Development areas identified</li><li>Clear pathway to target role</li>'}
          </ul>
        </div>
      </div>
      ${sectionSpacing}
      
      <!-- Skill Mapping (Section 2) -->
      <div class="section skill-mapping">
        <div class="section-title">
          <div class="section-icon">2</div>
          Skill Mapping
        </div>
        <div class="summary-box">
          <p>${ensuredReport.skillMapping.overview}</p>
        </div>
        
        ${ensuredReport.skillMapping.sfiaSkills && ensuredReport.skillMapping.sfiaSkills.length > 0 ? `
        <div>
          <h3>SFIA Skills</h3>
          <div>
            ${ensuredReport.skillMapping.sfiaSkills.map(skill => `
              <div class="info-card" style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between;">
                  <div style="font-weight: 600;">${typeof skill === 'string' ? skill : skill.skill || skill.name || 'Skill'}</div>
                  <div class="badge">${typeof skill === 'string' ? '3/7' : skill.proficiency || skill.level || '3'}/7</div>
                </div>
                <div style="margin-top: 5px; color: #6b7280; font-size: 14px;">${typeof skill === 'string' ? 'No description available' : skill.description || 'No description available'}</div>
              </div>`).join('')}
          </div>
        </div>
        ` : `
        <div>
          <h3>SFIA Skills</h3>
          <div class="info-card">
            <div style="font-weight: 600;">No SFIA skills data available</div>
          </div>
        </div>
        `}
        
        ${ensuredReport.skillMapping.digCompSkills && ensuredReport.skillMapping.digCompSkills.length > 0 ? `
        <div>
          <h3>Digital Competency Skills</h3>
          <div>
            ${ensuredReport.skillMapping.digCompSkills.map(skill => `
              <div class="info-card" style="margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between;">
                  <div style="font-weight: 600;">${typeof skill === 'string' ? skill : skill.skill || skill.name || 'Skill'}</div>
                  <div class="badge">${typeof skill === 'string' ? '3/8' : skill.proficiency || skill.level || '3'}/8</div>
                </div>
                <div style="margin-top: 5px; color: #6b7280; font-size: 14px;">${typeof skill === 'string' ? 'No description available' : skill.description || 'No description available'}</div>
              </div>`).join('')}
          </div>
        </div>
        ` : ''}
        
        <div class="chart-container">
          <h3>Skills Radar Chart</h3>
          ${radarChartSVG}
        </div>
      </div>
      ${sectionSpacing}
      
      <!-- Skill Gap Analysis (Section 3) -->
      <div class="section gap-analysis">
        <div class="section-title">
          <div class="section-icon">3</div>
          Skill Gap Analysis
        </div>
        <div class="summary-box">
          <p>${ensuredReport.skillGapAnalysis.overview}</p>
        </div>
        
        <div class="chart-container">
          <h3>Comparative Gap Analysis</h3>
          ${gapAnalysisChartSVG}
        </div>
        
        <div class="two-columns">
          <div>
            <h3>Key Gaps</h3>
            <div>
              ${ensuredReport.skillGapAnalysis.keyGaps && ensuredReport.skillGapAnalysis.keyGaps.length > 0 ? 
                ensuredReport.skillGapAnalysis.keyGaps.map(gap => `
                  <div class="info-card" style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between;">
                      <div style="font-weight: 600;">${typeof gap === 'string' ? gap : gap.skill || 'Skill'}</div>
                      ${typeof gap !== 'string' && (gap.currentLevel || gap.requiredLevel) ? `
                        <div style="color: #ef4444; font-size: 12px;">
                          ${gap.currentLevel || '2'} → ${gap.requiredLevel || '5'}
                        </div>
                      ` : ''}
                    </div>
                    <div style="margin-top: 5px; color: #6b7280; font-size: 14px;">
                      ${typeof gap === 'string' ? 'No description available' : gap.description || 'This skill requires significant development to meet the target role requirements.'}
                    </div>
                  </div>
                `).join('') : 
                '<p>No key gaps identified.</p>'
              }
            </div>
          </div>
          
          <div>
            <h3>Transferable Strengths</h3>
            <div>
              ${ensuredReport.skillGapAnalysis.transferableStrengths && ensuredReport.skillGapAnalysis.transferableStrengths.length > 0 ? 
                ensuredReport.skillGapAnalysis.transferableStrengths.map(strength => `
                  <div class="info-card" style="margin-bottom: 10px;">
                    <div style="font-weight: 600;">${typeof strength === 'string' ? strength : strength.skill || 'Skill'}</div>
                    <div style="margin-top: 5px; color: #6b7280; font-size: 14px;">
                      ${typeof strength === 'string' ? 'No description available' : strength.description || 'This is a valuable transferable skill for your target role.'}
                    </div>
                  </div>
                `).join('') : 
                '<p>No transferable strengths identified.</p>'
              }
            </div>
          </div>
        </div>
      </div>
      ${sectionSpacing}
      
      <!-- Career Pathway (Section 4) -->
      <div class="section career-pathway">
        <div class="section-title">
          <div class="section-icon">4</div>
          Career Pathway
        </div>
        <div class="summary-box">
          <p>${ensuredReport.careerPathwayOptions.overview}</p>
        </div>
        
        <div class="chart-container">
          <h3>Career Pathway Visualization</h3>
          ${careerPathwaySVG}
        </div>
        
        ${ensuredReport.careerPathwayOptions.pathwaySteps && ensuredReport.careerPathwayOptions.pathwaySteps.length > 0 ? `
        <div>
          <h3>Pathway Steps</h3>
          ${ensuredReport.careerPathwayOptions.pathwaySteps.map((step, index) => `
            <div class="step-container">
              <div class="step-number">${index + 1}</div>
              <div class="step-content">
                <div class="step-title">
                  <div class="step-name">${typeof step === 'string' ? step : step.step || step.title || 'Step'}</div>
                  <div class="step-time">${typeof step === 'string' ? '3-6 months' : step.timeframe || step.duration || '3-6 months'}</div>
                </div>
                <p>${typeof step === 'string' ? 'No description available' : step.description || 'No description available'}</p>
              </div>
            </div>
          `).join('')}
        </div>
        ` : `
        <div>
          <h3>Pathway Steps</h3>
          <div class="step-container">
            <div class="step-number">1</div>
            <div class="step-content">
              <div class="step-title">
                <div class="step-name">Skill Building</div>
                <div class="step-time">3-6 months</div>
              </div>
              <p>Focus on developing the required core skills for the target role.</p>
            </div>
          </div>
          <div class="step-container">
            <div class="step-number">2</div>
            <div class="step-content">
              <div class="step-title">
                <div class="step-name">Certification</div>
                <div class="step-time">6-9 months</div>
              </div>
              <p>Obtain relevant certifications to validate your skills.</p>
            </div>
          </div>
          <div class="step-container">
            <div class="step-number">3</div>
            <div class="step-content">
              <div class="step-title">
                <div class="step-name">Career Transition</div>
                <div class="step-time">9-12 months</div>
              </div>
              <p>Apply for roles in the target career field.</p>
            </div>
          </div>
        </div>
        `}
      </div>
      ${sectionSpacing}
      
      <!-- Learning Roadmap (Section 5) -->
      <div class="section learning-roadmap">
        <div class="section-title">
          <div class="section-icon">5</div>
          Learning Roadmap
        </div>
        <div class="summary-box">
          <p>${ensuredReport.learningRoadmap.overview}</p>
        </div>
        
        <div class="chart-container">
          <h3>Learning Timeline</h3>
          ${learningRoadmapSVG}
        </div>
        
        <div>
          <h3>Foundational Skills (First 3 months)</h3>
          <ul class="findings-list">
            ${ensuredReport.learningRoadmap.foundationalSkills && ensuredReport.learningRoadmap.foundationalSkills.length > 0 ? 
              ensuredReport.learningRoadmap.foundationalSkills.map(skill => `<li>${skill}</li>`).join('') : 
              '<li>Basic industry concepts</li><li>Fundamental technical skills</li><li>Entry-level certifications</li>'}
          </ul>
        </div>
        
        <div>
          <h3>Intermediate Skills (Months 3-6)</h3>
          <ul class="findings-list">
            ${ensuredReport.learningRoadmap.intermediateSkills && ensuredReport.learningRoadmap.intermediateSkills.length > 0 ? 
              ensuredReport.learningRoadmap.intermediateSkills.map(skill => `<li>${skill}</li>`).join('') : 
              '<li>Applied techniques</li><li>Practical project experience</li><li>More specialized knowledge</li>'}
          </ul>
        </div>
        
        <div>
          <h3>Advanced Skills (Months 6+)</h3>
          <ul class="findings-list">
            ${ensuredReport.learningRoadmap.advancedSkills && ensuredReport.learningRoadmap.advancedSkills.length > 0 ? 
              ensuredReport.learningRoadmap.advancedSkills.map(skill => `<li>${skill}</li>`).join('') : 
              '<li>Leadership and strategic thinking</li><li>Advanced industry knowledge</li><li>Expert-level technical skills</li>'}
          </ul>
        </div>
      </div>
      ${sectionSpacing}
      
      <!-- Similar Roles (Section 6) -->
      <div class="section similar-roles">
        <div class="section-title">
          <div class="section-icon">6</div>
          Similar Roles
        </div>
        <div class="summary-box">
          <p>${ensuredReport.similarRoles.introduction}</p>
        </div>
        
        <div>
          ${ensuredReport.similarRoles.roles && ensuredReport.similarRoles.roles.length > 0 ? `
            ${ensuredReport.similarRoles.roles.map(role => `
              <div class="info-card" style="margin-bottom: 15px;">
                <div style="font-weight: 600;">${typeof role === 'string' ? role : role.title || role.name || 'Related Role'}</div>
                <div style="margin-top: 5px; color: #6b7280; font-size: 14px;">
                  ${typeof role !== 'string' && role.description ? role.description : 'This role shares similar responsibilities and skill requirements with your target role.'}
                </div>
                ${typeof role !== 'string' && role.matchScore ? `
                  <div style="margin-top: 8px;">
                    <span class="badge">Match: ${role.matchScore}%</span>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          ` : `
            <div class="info-card" style="margin-bottom: 15px;">
              <div style="font-weight: 600;">Senior ${metadata.targetRole || 'Professional'}</div>
              <div style="margin-top: 5px; color: #6b7280; font-size: 14px;">
                Advanced version of your target role with more responsibilities and strategic decision-making.
              </div>
            </div>
            <div class="info-card" style="margin-bottom: 15px;">
              <div style="font-weight: 600;">${metadata.targetRole || 'Role'} Manager</div>
              <div style="margin-top: 5px; color: #6b7280; font-size: 14px;">
                Managerial role that requires both technical knowledge and leadership skills.
              </div>
            </div>
            <div class="info-card">
              <div style="font-weight: 600;">Consultant ${metadata.targetRole || 'Specialist'}</div>
              <div style="margin-top: 5px; color: #6b7280; font-size: 14px;">
                Advisory role focused on providing expert guidance in the field.
              </div>
            </div>
          `}
        </div>
      </div>
      ${sectionSpacing}
      
      <!-- Quick Tips (Section 7) -->
      <div class="section quick-tips">
        <div class="section-title">
          <div class="section-icon">7</div>
          Quick Tips
        </div>
        <div class="summary-box">
          <p>${ensuredReport.quickTips.introduction}</p>
        </div>
        
        <div class="two-columns">
          <div>
            <h3>Career Tips</h3>
            <ul class="findings-list">
              ${ensuredReport.quickTips.careerTips && ensuredReport.quickTips.careerTips.length > 0 ? 
                ensuredReport.quickTips.careerTips.map(tip => `<li>${tip}</li>`).join('') : 
                '<li>Develop a personal brand focused on your target role</li><li>Network with professionals in your field</li><li>Create a portfolio showcasing relevant projects</li>'}
            </ul>
          </div>
          <div>
            <h3>Learning Tips</h3>
            <ul class="findings-list">
              ${ensuredReport.quickTips.learningTips && ensuredReport.quickTips.learningTips.length > 0 ? 
                ensuredReport.quickTips.learningTips.map(tip => `<li>${tip}</li>`).join('') : 
                '<li>Schedule regular learning time</li><li>Join communities of practice</li><li>Apply new skills to real-world problems</li>'}
            </ul>
          </div>
        </div>
      </div>
      ${sectionSpacing}
      
      <!-- Growth Trajectory (Section 8) -->
      <div class="section growth-trajectory">
        <div class="section-title">
          <div class="section-icon">8</div>
          Growth Trajectory
        </div>
        <div class="summary-box">
          <p>${ensuredReport.growthTrajectory.overview}</p>
        </div>
        
        <div>
          <h3>Career Progression</h3>
          <div class="info-card" style="margin-bottom: 15px;">
            <div style="font-weight: 600;">Entry Level</div>
            <div style="margin-top: 5px; color: #6b7280; font-size: 14px;">
              ${ensuredReport.growthTrajectory.shortTermGrowth || 'Initial role focusing on foundational skills and learning core competencies.'}
            </div>
          </div>
          <div class="info-card" style="margin-bottom: 15px;">
            <div style="font-weight: 600;">Mid Level</div>
            <div style="margin-top: 5px; color: #6b7280; font-size: 14px;">
              ${ensuredReport.growthTrajectory.midTermGrowth || 'More responsibilities and autonomy, leading smaller projects and initiatives.'}
            </div>
          </div>
          <div class="info-card">
            <div style="font-weight: 600;">Senior Level</div>
            <div style="margin-top: 5px; color: #6b7280; font-size: 14px;">
              ${ensuredReport.growthTrajectory.longTermGrowth || 'Strategic leadership roles with extensive experience and expert knowledge.'}
            </div>
          </div>
        </div>
      </div>
      ${sectionSpacing}
      
      <!-- Learning Path Roadmap (Section 9) -->
      <div class="section learning-path">
        <div class="section-title">
          <div class="section-icon">9</div>
          Learning Path Roadmap
        </div>
        <div class="summary-box">
          <p>${ensuredReport.learningPathRoadmap.overview}</p>
        </div>
        
        <div>
          <h3>Key Learning Milestones</h3>
          ${ensuredReport.learningPathRoadmap.keyMilestones && ensuredReport.learningPathRoadmap.keyMilestones.length > 0 ? 
            ensuredReport.learningPathRoadmap.keyMilestones.map((milestone, index) => `
              <div class="step-container">
                <div class="step-number">${index + 1}</div>
                <div class="step-content">
                  <div class="step-title">
                    <div class="step-name">${typeof milestone === 'string' ? milestone : milestone.title || 'Milestone'}</div>
                    <div class="step-time">${typeof milestone === 'string' ? 'Month ' + (index + 3) : milestone.timeframe || 'Month ' + (index + 3)}</div>
                  </div>
                  <p>${typeof milestone === 'string' ? 'Important learning achievement in your career development journey.' : milestone.description || 'Important learning achievement in your career development journey.'}</p>
                </div>
              </div>
            `).join('') : 
            `
            <div class="step-container">
              <div class="step-number">1</div>
              <div class="step-content">
                <div class="step-title">
                  <div class="step-name">Core Fundamentals</div>
                  <div class="step-time">Month 3</div>
                </div>
                <p>Master foundational concepts and tools required for the role.</p>
              </div>
            </div>
            <div class="step-container">
              <div class="step-number">2</div>
              <div class="step-content">
                <div class="step-title">
                  <div class="step-name">Project Experience</div>
                  <div class="step-time">Month 6</div>
                </div>
                <p>Complete practical projects to build a professional portfolio.</p>
              </div>
            </div>
            <div class="step-container">
              <div class="step-number">3</div>
              <div class="step-content">
                <div class="step-title">
                  <div class="step-name">Advanced Specialization</div>
                  <div class="step-time">Month 9</div>
                </div>
                <p>Develop expertise in specialized areas within your field.</p>
              </div>
            </div>
            `
          }
        </div>
      </div>
      ${sectionSpacing}
      
      <!-- Development Plan (Section 10) -->
      <div class="section development-plan">
        <div class="section-title">
          <div class="section-icon">10</div>
          Development Plan
        </div>
        <div class="summary-box">
          <p>${ensuredReport.developmentPlan.overview}</p>
        </div>
        
        <div class="two-columns">
          <div>
            <h3>Priority Skills to Develop</h3>
            <ul class="findings-list">
              ${ensuredReport.developmentPlan.prioritySkills && ensuredReport.developmentPlan.prioritySkills.length > 0 ? 
                ensuredReport.developmentPlan.prioritySkills.map(skill => `<li>${skill}</li>`).join('') : 
                '<li>Technical competencies</li><li>Communication skills</li><li>Problem-solving abilities</li>'}
            </ul>
            
            <h3>Action Items</h3>
            <ul class="findings-list">
              ${ensuredReport.developmentPlan.actionItems && ensuredReport.developmentPlan.actionItems.length > 0 ? 
                ensuredReport.developmentPlan.actionItems.map(item => `<li>${item}</li>`).join('') : 
                '<li>Enroll in relevant courses</li><li>Join professional associations</li><li>Seek mentorship opportunities</li>'}
            </ul>
          </div>
          <div>
            <h3>Resources</h3>
            <ul class="findings-list">
              ${ensuredReport.developmentPlan.resources && ensuredReport.developmentPlan.resources.length > 0 ? 
                ensuredReport.developmentPlan.resources.map(resource => `<li>${resource}</li>`).join('') : 
                '<li>Online learning platforms</li><li>Industry-specific books</li><li>Professional networking events</li>'}
            </ul>
            
            <h3>Timeline</h3>
            <ul class="findings-list">
              ${ensuredReport.developmentPlan.timeline && ensuredReport.developmentPlan.timeline.length > 0 ? 
                ensuredReport.developmentPlan.timeline.map(item => `<li>${item}</li>`).join('') : 
                '<li>First 3 months: Build foundation</li><li>Months 4-6: Practice application</li><li>Months 7-12: Specialize and network</li>'}
            </ul>
          </div>
        </div>
      </div>
      ${sectionSpacing}
      
      <!-- Educational Programs (Section 11) -->
      <div class="section educational-programs">
        <div class="section-title">
          <div class="section-icon">11</div>
          Educational Programs
        </div>
        <div class="summary-box">
          <p>${ensuredReport.educationalPrograms.overview}</p>
        </div>
        
        <div>
          <h3>Recommended Courses</h3>
          ${ensuredReport.educationalPrograms.recommendedCourses && ensuredReport.educationalPrograms.recommendedCourses.length > 0 ? 
            ensuredReport.educationalPrograms.recommendedCourses.map(course => `
              <div class="info-card" style="margin-bottom: 15px;">
                <div style="font-weight: 600;">${typeof course === 'string' ? course : course.title || course.name || 'Course'}</div>
                <div style="margin-top: 5px; color: #6b7280; font-size: 14px;">
                  ${typeof course !== 'string' && course.provider ? `Provider: ${course.provider}` : ''}
                  ${typeof course !== 'string' && course.description ? `<br>${course.description}` : ''}
                </div>
                ${typeof course !== 'string' && course.url ? `
                  <div style="margin-top: 8px;">
                    <span class="badge">Online Course</span>
                  </div>
                ` : ''}
              </div>
            `).join('') : 
            `
            <div class="info-card" style="margin-bottom: 15px;">
              <div style="font-weight: 600;">Fundamentals of ${metadata.targetRole || 'the Field'}</div>
              <div style="margin-top: 5px; color: #6b7280; font-size: 14px;">
                Comprehensive introduction to essential concepts and practices.
              </div>
            </div>
            <div class="info-card" style="margin-bottom: 15px;">
              <div style="font-weight: 600;">Advanced ${metadata.targetRole || 'Professional'} Skills</div>
              <div style="margin-top: 5px; color: #6b7280; font-size: 14px;">
                Specialized techniques and methodologies for professional growth.
              </div>
            </div>
            <div class="info-card">
              <div style="font-weight: 600;">${metadata.targetRole || 'Industry'} Certification Program</div>
              <div style="margin-top: 5px; color: #6b7280; font-size: 14px;">
                Recognized certification to validate your expertise and enhance credibility.
              </div>
            </div>
            `
          }
        </div>
      </div>
      ${sectionSpacing}
      
      <div class="footer">
        <p>© 2025 Skillgenix - Career Pathway Analysis Report</p>
        <p>Generated on ${format(new Date(), 'MMMM d, yyyy')}</p>
      </div>
    </body>
    </html>
  `;
}

// Helper functions to generate SVG components
function generateRadarChartSVG(skillData: ChartData[]): string {
  return `
    <svg width="100%" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <style>
        .radar-chart-title { font-size: 16px; font-weight: bold; fill: #1c3b82; text-anchor: middle; }
        .axis-label { font-size: 12px; fill: #64748b; text-anchor: middle; }
        .axis-line { stroke: rgba(0,0,0,0.1); stroke-width: 1; }
        .level-circle { fill: none; stroke: rgba(0,0,0,0.1); stroke-width: 1; }
        .skill-polygon { fill: rgba(28,59,130,0.5); stroke: rgb(28,59,130); stroke-width: 2; }
        .level-label { font-size: 10px; fill: #64748b; text-anchor: middle; }
      </style>
      
      <text x="200" y="30" class="radar-chart-title">Skills Proficiency Radar</text>
      
      <!-- Level circles -->
      <circle cx="200" cy="160" r="120" class="level-circle" />
      <circle cx="200" cy="160" r="100" class="level-circle" />
      <circle cx="200" cy="160" r="80" class="level-circle" />
      <circle cx="200" cy="160" r="60" class="level-circle" />
      <circle cx="200" cy="160" r="40" class="level-circle" />
      <circle cx="200" cy="160" r="20" class="level-circle" />
      
      <!-- Level labels -->
      <text x="230" y="60" class="level-label">7</text>
      <text x="230" y="80" class="level-label">6</text>
      <text x="230" y="100" class="level-label">5</text>
      <text x="230" y="120" class="level-label">4</text>
      <text x="230" y="140" class="level-label">3</text>
      <text x="230" y="160" class="level-label">2</text>
      <text x="230" y="180" class="level-label">1</text>
      
      ${skillData.map((skill, index) => {
        // Calculate position on the radar chart for each skill label
        const angle = (Math.PI * 2 * index) / skillData.length;
        const labelX = 200 + 145 * Math.sin(angle);
        const labelY = 160 - 145 * Math.cos(angle);
        
        // Draw axis line
        return `
          <line x1="200" y1="160" x2="${labelX}" y2="${labelY}" class="axis-line" />
          <text x="${labelX}" y="${labelY}" dy="${angle > Math.PI ? 15 : -5}" class="axis-label">${skill.name}</text>
        `;
      }).join('')}
      
      <!-- Skill level polygon -->
      <polygon 
        points="${skillData.map((skill, index) => {
          const angle = (Math.PI * 2 * index) / skillData.length;
          const radius = (skill.value / 7) * 120; // Scale based on max level of 7
          return `${200 + radius * Math.sin(angle)},${160 - radius * Math.cos(angle)}`;
        }).join(' ')}"
        class="skill-polygon" 
      />
    </svg>
  `;
}

function generateGapAnalysisChartSVG(gapData: GapData[]): string {
  return `
    <svg width="100%" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <style>
        .chart-title { font-size: 16px; font-weight: bold; fill: #ff9900; text-anchor: middle; }
        .axis-label { font-size: 12px; fill: #64748b; }
        .grid-line { stroke: rgba(0,0,0,0.1); stroke-width: 1; stroke-dasharray: 3,3; }
        .bar-current { fill: rgba(28,59,130,0.8); }
        .bar-required { fill: rgba(163,29,82,0.8); }
        .legend-text { font-size: 12px; fill: #64748b; }
        .legend-rect { stroke: none; }
      </style>
      
      <text x="200" y="30" text-anchor="middle" class="chart-title">Skill Gap Analysis</text>
      
      <!-- Legend -->
      <rect x="240" y="45" width="15" height="15" class="legend-rect bar-current" />
      <text x="260" y="57" class="legend-text">Current</text>
      <rect x="310" y="45" width="15" height="15" class="legend-rect bar-required" />
      <text x="330" y="57" class="legend-text">Required</text>
      
      <!-- Horizontal grid lines and y-axis labels -->
      ${[0, 1, 2, 3, 4, 5, 6, 7].map(level => {
        const y = 250 - level * 25;
        return `
          <line x1="50" y1="${y}" x2="350" y2="${y}" class="grid-line" />
          <text x="40" y="${y + 5}" text-anchor="end" class="axis-label">${level}</text>
        `;
      }).join('')}
      
      <!-- Bars for skills -->
      ${gapData.map((item, index) => {
        // Calculate position based on number of items to ensure they fit
        const maxItems = 5;
        const itemWidth = Math.min(55, 250 / Math.min(maxItems, gapData.length));
        const x = 75 + index * (itemWidth + 15);
        const currentHeight = item.current * 25;
        const requiredHeight = item.required * 25;
        const barWidth = Math.max(15, itemWidth / 2 - 5);
        
        return `
          <!-- Current level bar -->
          <rect x="${x}" y="${250 - currentHeight}" width="${barWidth}" height="${currentHeight}" class="bar-current" />
          
          <!-- Required level bar -->
          <rect x="${x + barWidth + 5}" y="${250 - requiredHeight}" width="${barWidth}" height="${requiredHeight}" class="bar-required" />
          
          <!-- Skill label -->
          <text x="${x + (barWidth * 2 + 5) / 2}" y="275" text-anchor="middle" class="axis-label" transform="rotate(-45 ${x + (barWidth * 2 + 5) / 2}, 275)">${item.skill}</text>
        `;
      }).join('')}
    </svg>
  `;
}

function generateCareerPathwaySVG(pathwaySteps: PathwayStep[], metadata: AnalysisMetadata): string {
  return `
    <svg width="100%" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <style>
        .pathway-title { font-size: 16px; font-weight: bold; fill: #4f46e5; text-anchor: middle; }
        .step-circle { fill: rgba(79,70,229,0.2); stroke: #4f46e5; stroke-width: 2; }
        .step-line { stroke: #4f46e5; stroke-width: 2; stroke-dasharray: 5,5; }
        .step-number { font-size: 14px; font-weight: bold; fill: #4f46e5; text-anchor: middle; }
        .step-label { font-size: 12px; fill: #1e293b; text-anchor: middle; }
        .timeframe-label { font-size: 10px; fill: #64748b; text-anchor: middle; }
        .current-role { font-size: 12px; fill: #64748b; text-anchor: start; }
        .target-role { font-size: 12px; fill: #64748b; text-anchor: end; }
      </style>
      
      <text x="200" y="30" text-anchor="middle" class="pathway-title">Career Pathway Steps</text>
      
      <!-- Career path line -->
      <line x1="50" y1="120" x2="350" y2="120" class="step-line" />
      
      <!-- Current & Target roles -->
      <text x="50" y="100" class="current-role">Current: ${metadata.currentRole || metadata.careerHistory || 'Current Role'}</text>
      <text x="350" y="100" class="target-role">Target: ${metadata.targetRole || 'Target Role'}</text>
      
      ${pathwaySteps.map((step, index) => {
        const stepCount = pathwaySteps.length;
        const x = 50 + (300 / (stepCount + 1)) * (index + 1);
        
        return `
          <!-- Step ${index + 1} circle -->
          <circle cx="${x}" cy="120" r="25" class="step-circle" />
          <text x="${x}" y="125" class="step-number">${index + 1}</text>
          
          <!-- Step labels -->
          <text x="${x}" y="165" class="step-label">${step.step}</text>
          <text x="${x}" y="185" class="timeframe-label">${step.timeframe}</text>
        `;
      }).join('')}
    </svg>
  `;
}

function generateLearningRoadmapSVG(): string {
  return `
    <svg width="100%" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <style>
        .roadmap-title { font-size: 16px; font-weight: bold; fill: #a855f7; text-anchor: middle; }
        .timeline-line { stroke: #a855f7; stroke-width: 2; }
        .milestone { fill: white; stroke: #a855f7; stroke-width: 2; }
        .milestone-label { font-size: 12px; fill: #1e293b; text-anchor: middle; }
        .timeline-label { font-size: 10px; fill: #64748b; text-anchor: middle; }
      </style>
      
      <text x="200" y="30" text-anchor="middle" class="roadmap-title">Learning Roadmap Timeline</text>
      
      <!-- Main timeline line -->
      <line x1="50" y1="120" x2="350" y2="120" class="timeline-line" />
      
      <!-- Month markers -->
      <line x1="50" y1="110" x2="50" y2="130" class="timeline-line" />
      <text x="50" y="145" class="timeline-label">Month 1</text>
      
      <line x1="150" y1="110" x2="150" y2="130" class="timeline-line" />
      <text x="150" y="145" class="timeline-label">Month 3</text>
      
      <line x1="250" y1="110" x2="250" y2="130" class="timeline-line" />
      <text x="250" y="145" class="timeline-label">Month 6</text>
      
      <line x1="350" y1="110" x2="350" y2="130" class="timeline-line" />
      <text x="350" y="145" class="timeline-label">Month 12</text>
      
      <!-- Milestones -->
      <circle cx="90" cy="120" r="8" class="milestone" />
      <text x="90" y="95" class="milestone-label">Foundation Skills</text>
      
      <circle cx="180" cy="120" r="8" class="milestone" />
      <text x="180" y="95" class="milestone-label">Intermediate Learning</text>
      
      <circle cx="280" cy="120" r="8" class="milestone" />
      <text x="280" y="95" class="milestone-label">Advanced Skills</text>
      
      <circle cx="350" cy="120" r="8" class="milestone" />
      <text x="350" y="95" class="milestone-label">Career Ready</text>
    </svg>
  `;
}