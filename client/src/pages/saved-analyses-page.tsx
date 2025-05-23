/**
 * Saved Analyses Page
 * 
 * This page displays all saved career analyses for the current user,
 * allowing them to view, download, or delete their saved reports.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthenticatedLayout } from '@/components/layouts/AuthenticatedLayout';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { fadeIn, fadeInUp } from '@/lib/animations';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  Eye,
  FileText,
  Filter,
  Search,
  Trash2,
  Target,
  Briefcase,
  GraduationCap,
  Star,
  Calendar,
  MapPin,
  User,
  ChevronRight,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Type for saved career analysis
interface SavedAnalysis {
  userId: string;
  report: any;
  metadata: {
    targetRole: string;
    dateCreated: string;
    professionalLevel: string;
    location: string;
    currentSkills: string;
    educationalBackground: string;
    careerHistory: string;
  };
}

export default function SavedAnalysesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // State for saved analyses
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedAnalysis | null>(null);
  
  // Load saved analyses from localStorage
  useEffect(() => {
    const loadSavedAnalyses = () => {
      setLoading(true);
      
      try {
        // Try to fetch from localStorage first
        const savedFromLocal = localStorage.getItem('savedCareerAnalyses');
        let analyses: SavedAnalysis[] = [];
        
        if (savedFromLocal) {
          analyses = JSON.parse(savedFromLocal);
          console.log(`Found ${analyses.length} saved analyses in localStorage`);
        }
        
        // If user is logged in, also try to fetch from API
        if (user?.id) {
          try {
            // Attempt to fetch from API - for future implementation
            // For now, we only use localStorage
          } catch (error) {
            console.error('Error fetching analyses from API:', error);
          }
        }
        
        // Filter analyses for current user
        if (user?.id) {
          analyses = analyses.filter(analysis => analysis.userId === user.id);
        }
        
        // Sort by date (newest first)
        analyses.sort((a, b) => {
          return new Date(b.metadata.dateCreated).getTime() - new Date(a.metadata.dateCreated).getTime();
        });
        
        setSavedAnalyses(analyses);
      } catch (error) {
        console.error('Error loading saved analyses:', error);
        toast({
          title: 'Error',
          description: 'Failed to load saved analyses. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedAnalyses();
  }, [user, toast]);
  
  // Delete a saved analysis
  const handleDelete = (index: number) => {
    try {
      const updatedAnalyses = [...savedAnalyses];
      updatedAnalyses.splice(index, 1);
      
      // Update localStorage
      localStorage.setItem('savedCareerAnalyses', JSON.stringify(updatedAnalyses));
      
      // Update state
      setSavedAnalyses(updatedAnalyses);
      
      toast({
        title: 'Success',
        description: 'Analysis deleted successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete analysis. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // View a saved analysis
  const handleViewAnalysis = (analysis: SavedAnalysis) => {
    setSelectedAnalysis(analysis);
  };
  
  // Download a saved analysis with all charts and all 11 sections
  const handleDownload = (analysis: SavedAnalysis) => {
    try {
      // Use the new embedded SVG report generator instead of the old approach
      import('../utils/embedded-svg-report').then(({ generateEmbeddedSVGReport }) => {
        // Generate HTML with embedded SVG charts
        const htmlContent = generateEmbeddedSVGReport(analysis.report, analysis.metadata);
        
        // Create a Blob with the HTML content
        const blob = new Blob([htmlContent], { type: 'text/html' });
        
        // Create a download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Skillgenix_Career_Analysis_${analysis.metadata.targetRole.replace(/\s+/g, '_')}_${format(new Date(analysis.metadata.dateCreated), 'yyyy-MM-dd')}.html`;
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
        
        toast({
          title: 'Success',
          description: 'Comprehensive report downloaded successfully',
          variant: 'default',
        });
      }).catch(error => {
        console.error('Error generating HTML report:', error);
        toast({
          title: 'Error',
          description: 'Failed to generate HTML report. Please try again later.',
          variant: 'destructive',
        });
      });
      
      return; // Early return to skip the old implementation
      
      // === Legacy implementation below (kept for reference) ===
      // Create HTML content for the report
      const reportTitle = `Skillgenix Career Analysis - ${analysis.metadata.targetRole}`;
      const report = analysis.report;
      
      // Create SVG chart visualizations based on report data
      const createChartVisualizations = () => {
        // ---- SKILL RADAR CHART ----
        // Extract skill data if available, or use sample data
        let skillData: Array<{name: string, value: number}> = [];
        
        if (report.skillMapping && report.skillMapping.sfiaSkills && report.skillMapping.sfiaSkills.length > 0) {
          skillData = report.skillMapping.sfiaSkills.map(skill => ({
            name: typeof skill === 'string' ? skill : skill.skill || skill.name || 'Skill',
            value: typeof skill === 'string' ? 3 : parseInt(skill.proficiency || skill.level || '3', 10)
          }));
        } else if (report.skillMapping && report.skillMapping.digCompSkills && report.skillMapping.digCompSkills.length > 0) {
          skillData = report.skillMapping.digCompSkills.map(skill => ({
            name: typeof skill === 'string' ? skill : skill.skill || skill.name || 'Skill',
            value: typeof skill === 'string' ? 3 : parseInt(skill.proficiency || skill.level || '3', 10)
          }));
        }
        
        // If we don't have any skills data, add some placeholder skills to ensure chart displays
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
        
        // Create SVG radar chart
        const skillRadarChartSvg = `
          <svg width="100%" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <style type="text/css">
                .radar-chart-title { font-size: 16px; font-weight: bold; fill: #1c3b82; text-anchor: middle; }
                .axis-label { font-size: 10px; fill: #64748b; text-anchor: middle; }
                .axis-line { stroke: rgba(0,0,0,0.1); stroke-width: 1; }
                .level-circle { fill: none; stroke: rgba(0,0,0,0.1); stroke-width: 1; }
                .skill-polygon { fill: rgba(28,59,130,0.5); stroke: rgb(28,59,130); stroke-width: 2; }
                .level-label { font-size: 8px; fill: #64748b; text-anchor: middle; }
              </style>
            </defs>
            
            <text x="200" y="25" class="radar-chart-title">Skills Proficiency Radar</text>
            
            <!-- Level circles -->
            <circle cx="200" cy="150" r="120" class="level-circle" />
            <circle cx="200" cy="150" r="100" class="level-circle" />
            <circle cx="200" cy="150" r="80" class="level-circle" />
            <circle cx="200" cy="150" r="60" class="level-circle" />
            <circle cx="200" cy="150" r="40" class="level-circle" />
            <circle cx="200" cy="150" r="20" class="level-circle" />
            
            <!-- Level labels -->
            <text x="230" y="40" class="level-label">7</text>
            <text x="230" y="60" class="level-label">6</text>
            <text x="230" y="80" class="level-label">5</text>
            <text x="230" y="100" class="level-label">4</text>
            <text x="230" y="120" class="level-label">3</text>
            <text x="230" y="140" class="level-label">2</text>
            <text x="230" y="160" class="level-label">1</text>
            
            ${skillData.map((skill, index) => {
              // Calculate position on the radar chart for each skill label
              const angle = (Math.PI * 2 * index) / skillData.length;
              const labelX = 200 + 140 * Math.sin(angle);
              const labelY = 150 - 140 * Math.cos(angle);
              
              // Draw axis line
              return `
                <line x1="200" y1="150" x2="${labelX}" y2="${labelY}" class="axis-line" />
                <text x="${labelX}" y="${labelY}" dy="${angle > Math.PI ? 15 : -5}" class="axis-label">${skill.name}</text>
              `;
            }).join('')}
            
            <!-- Skill level polygon -->
            <polygon 
              points="${skillData.map((skill, index) => {
                const angle = (Math.PI * 2 * index) / skillData.length;
                const radius = (skill.value / 7) * 120; // Scale based on max level of 7
                return `${200 + radius * Math.sin(angle)},${150 - radius * Math.cos(angle)}`;
              }).join(' ')}"
              class="skill-polygon" 
            />
          </svg>
        `;
        
        // ---- GAP ANALYSIS CHART ----
        // Extract gap data if available
        let gapData: Array<{skill: string, current: number, required: number}> = [];
        
        if (report.skillGapAnalysis && report.skillGapAnalysis.keyGaps && report.skillGapAnalysis.keyGaps.length > 0) {
          gapData = report.skillGapAnalysis.keyGaps.map(gap => ({
            skill: typeof gap === 'string' ? gap : gap.skill || 'Skill',
            current: typeof gap === 'string' ? 3 : parseInt(gap.currentLevel || '3', 10),
            required: typeof gap === 'string' ? 5 : parseInt(gap.requiredLevel || '5', 10)
          }));
        }
        
        // Cap at 5 gaps for the bar chart
        gapData = gapData.slice(0, 5);
        
        // If no gap data, add placeholder data
        if (gapData.length === 0) {
          gapData = [
            { skill: 'Technical', current: 2, required: 5 },
            { skill: 'Data', current: 1, required: 4 },
            { skill: 'Management', current: 4, required: 4 }
          ];
        }

        // Create SVG bar chart for gap analysis
        const gapAnalysisChartSvg = `
          <svg width="100%" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <style type="text/css">
                .chart-title { font-size: 16px; font-weight: bold; fill: #ff9900; text-anchor: middle; }
                .axis-label { font-size: 10px; fill: #64748b; }
                .grid-line { stroke: rgba(0,0,0,0.1); stroke-width: 1; stroke-dasharray: 3,3; }
                .bar-current { fill: rgba(28,59,130,0.8); }
                .bar-required { fill: rgba(163,29,82,0.8); }
                .legend-text { font-size: 10px; fill: #64748b; }
                .legend-rect { stroke: none; }
              </style>
            </defs>
            
            <text x="200" y="25" text-anchor="middle" class="chart-title">Skill Gap Analysis</text>
            
            <!-- Legend -->
            <rect x="260" y="40" width="10" height="10" class="legend-rect bar-current" />
            <text x="275" y="50" class="legend-text">Current</text>
            <rect x="320" y="40" width="10" height="10" class="legend-rect bar-required" />
            <text x="335" y="50" class="legend-text">Required</text>
            
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
              const x = 70 + index * 60;
              const currentHeight = item.current * 25;
              const requiredHeight = item.required * 25;
              
              return `
                <!-- Current level bar -->
                <rect x="${x}" y="${250 - currentHeight}" width="20" height="${currentHeight}" class="bar-current" />
                
                <!-- Required level bar -->
                <rect x="${x + 25}" y="${250 - requiredHeight}" width="20" height="${requiredHeight}" class="bar-required" />
                
                <!-- Skill label -->
                <text x="${x + 22}" y="270" text-anchor="middle" class="axis-label">${item.skill}</text>
              `;
            }).join('')}
          </svg>
        `;
        
        // ---- CAREER PATHWAY VISUALIZATION ----
        // Extract pathway steps
        let pathwaySteps: Array<{step: string, timeframe: string}> = [];
        
        if (report.careerPathwayOptions && report.careerPathwayOptions.pathwaySteps && report.careerPathwayOptions.pathwaySteps.length > 0) {
          pathwaySteps = report.careerPathwayOptions.pathwaySteps.map(step => ({
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
        
        // Create pathway visualization
        const careerPathwayVisualizationSvg = `
          <svg width="100%" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <style type="text/css">
                .pathway-title { font-size: 16px; font-weight: bold; fill: #4f46e5; text-anchor: middle; }
                .step-circle { fill: rgba(79,70,229,0.2); stroke: #4f46e5; stroke-width: 2; }
                .step-line { stroke: #4f46e5; stroke-width: 2; stroke-dasharray: 5,5; }
                .step-number { font-size: 14px; font-weight: bold; fill: #4f46e5; text-anchor: middle; }
                .step-label { font-size: 12px; fill: #1e293b; text-anchor: middle; }
                .timeframe-label { font-size: 10px; fill: #64748b; text-anchor: middle; }
                .current-role { font-size: 12px; fill: #64748b; text-anchor: start; }
                .target-role { font-size: 12px; fill: #64748b; text-anchor: end; }
              </style>
            </defs>
            
            <text x="200" y="25" text-anchor="middle" class="pathway-title">Career Pathway Steps</text>
            
            <!-- Career path line -->
            <line x1="50" y1="150" x2="350" y2="150" class="step-line" />
            
            <!-- Current & Target roles -->
            <text x="50" y="130" class="current-role">Current: ${analysis.metadata.currentRole || analysis.metadata.careerHistory || 'Current Role'}</text>
            <text x="350" y="130" class="target-role">Target: ${analysis.metadata.targetRole || 'Target Role'}</text>
            
            ${pathwaySteps.map((step, index) => {
              const stepCount = pathwaySteps.length;
              const x = 50 + (300 / (stepCount + 1)) * (index + 1);
              
              return `
                <!-- Step ${index + 1} circle -->
                <circle cx="${x}" cy="150" r="25" class="step-circle" />
                <text x="${x}" y="155" class="step-number">${index + 1}</text>
                
                <!-- Step labels -->
                <text x="${x}" y="190" class="step-label">${step.step}</text>
                <text x="${x}" y="210" class="timeframe-label">${step.timeframe}</text>
              `;
            }).join('')}
          </svg>
        `;
        
        // ---- LEARNING ROADMAP VISUALIZATION ----
        // Create a basic learning roadmap timeline
        const learningRoadmapVisualizationSvg = `
          <svg width="100%" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <style type="text/css">
                .roadmap-title { font-size: 16px; font-weight: bold; fill: #a855f7; text-anchor: middle; }
                .timeline-line { stroke: #a855f7; stroke-width: 3; }
                .milestone { fill: white; stroke: #a855f7; stroke-width: 2; }
                .milestone-label { font-size: 12px; fill: #1e293b; text-anchor: middle; }
                .timeline-label { font-size: 10px; fill: #64748b; text-anchor: middle; }
              </style>
            </defs>
            
            <text x="200" y="25" text-anchor="middle" class="roadmap-title">Learning Roadmap Timeline</text>
            
            <!-- Main timeline line -->
            <line x1="50" y1="150" x2="350" y2="150" class="timeline-line" />
            
            <!-- Month markers -->
            <line x1="50" y1="140" x2="50" y2="160" class="timeline-line" />
            <text x="50" y="170" class="timeline-label">Month 1</text>
            
            <line x1="150" y1="140" x2="150" y2="160" class="timeline-line" />
            <text x="150" y="170" class="timeline-label">Month 3</text>
            
            <line x1="250" y1="140" x2="250" y2="160" class="timeline-line" />
            <text x="250" y="170" class="timeline-label">Month 6</text>
            
            <line x1="350" y1="140" x2="350" y2="160" class="timeline-line" />
            <text x="350" y="170" class="timeline-label">Month 12</text>
            
            <!-- Milestones -->
            <circle cx="90" cy="150" r="8" class="milestone" />
            <text x="90" y="130" class="milestone-label">Foundation Skills</text>
            
            <circle cx="180" cy="150" r="8" class="milestone" />
            <text x="180" y="130" class="milestone-label">Intermediate Learning</text>
            
            <circle cx="280" cy="150" r="8" class="milestone" />
            <text x="280" y="130" class="milestone-label">Advanced Skills</text>
            
            <circle cx="350" cy="150" r="8" class="milestone" />
            <text x="350" y="130" class="milestone-label">Career Ready</text>
          </svg>
        `;
        
        return {
          skillRadarChart: skillRadarChartSvg,
          gapAnalysisChart: gapAnalysisChartSvg,
          careerPathwayVisualization: careerPathwayVisualizationSvg,
          learningRoadmapVisualization: learningRoadmapVisualizationSvg
        };
      };
      
      // Get chart visualizations
      const chartImages = createChartVisualizations();
      
      // Create comprehensive HTML report with all 11 sections
      const htmlContent = `
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
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportTitle}</h1>
            <p>Generated on ${format(new Date(analysis.metadata.dateCreated), 'MMMM d, yyyy')} for ${analysis.metadata.professionalLevel} professional</p>
          </div>
          
          <!-- Executive Summary -->
          ${report.executiveSummary ? `
          <div class="section executive-summary">
            <div class="section-title">
              <div class="section-icon">1</div>
              Executive Summary
            </div>
            <div class="summary-box">
              <p>${report.executiveSummary.summary || 'This analysis provides a comprehensive career transition plan based on your profile and target role.'}</p>
            </div>
            <div class="info-grid">
              <div class="info-card">
                <div class="info-card-title">Career Goal</div>
                <div class="info-card-content">
                  <span>${report.executiveSummary.careerGoal || analysis.metadata.targetRole || 'Career advancement in target role'}</span>
                </div>
              </div>
              <div class="info-card">
                <div class="info-card-title">Fit Score</div>
                <div class="info-card-content">
                  <span>
                    ${report.executiveSummary.fitScore && report.executiveSummary.fitScore.score ? 
                      `${report.executiveSummary.fitScore.score}/${report.executiveSummary.fitScore.outOf || 10}` : 
                      report.executiveSummary.compatibilityScore || '7/10'}
                  </span>
                </div>
              </div>
            </div>
            ${report.executiveSummary.keyFindings && report.executiveSummary.keyFindings.length > 0 ? `
            <div>
              <h3>Key Findings</h3>
              <ul class="findings-list">
                ${report.executiveSummary.keyFindings.map((finding: any) => 
                  `<li>${typeof finding === 'string' ? finding : (finding && (finding.point || finding.finding)) || 'Important career insight'}</li>`
                ).join('')}
              </ul>
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          <!-- Skill Mapping -->
          ${report.skillMapping ? `
          <div class="section skill-mapping">
            <div class="section-title">
              <div class="section-icon">2</div>
              Skill Mapping
            </div>
            <div class="summary-box">
              <p>${report.skillMapping.skillsAnalysis || report.skillMapping.overview || report.skillMapping.summary || 'Analysis of your current skills mapped to industry frameworks and your target role requirements.'}</p>
            </div>
            ${report.skillMapping.sfiaSkills && report.skillMapping.sfiaSkills.length > 0 ? `
            <div>
              <h3>SFIA Skills</h3>
              <div>
                ${report.skillMapping.sfiaSkills.map((skill: any) => 
                  `<div class="info-card" style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between;">
                      <div style="font-weight: 600;">${skill.skill || skill.name || skill.title || 'SFIA Skill'}</div>
                      <div class="badge">${skill.proficiency || skill.level || skill.rating || '3'}/7</div>
                    </div>
                    <div style="margin-top: 5px; color: #6b7280; font-size: 14px;">${skill.description || skill.details || 'Industry-standard skill definition for professional roles.'}</div>
                  </div>`
                ).join('')}
              </div>
            </div>
            ` : ''}
            
            ${report.skillMapping.digCompSkills && report.skillMapping.digCompSkills.length > 0 ? `
            <div>
              <h3>Digital Competency Skills</h3>
              <div>
                ${report.skillMapping.digCompSkills.map((skill: any) => 
                  `<div class="info-card" style="margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between;">
                      <div style="font-weight: 600;">${skill.skill || skill.name || skill.title || 'Digital Competency'}</div>
                      <div class="badge">${skill.proficiency || skill.level || skill.rating || '3'}/8</div>
                    </div>
                    <div style="margin-top: 5px; color: #6b7280; font-size: 14px;">${skill.description || skill.details || 'European framework for digital skills and competencies.'}</div>
                  </div>`
                ).join('')}
              </div>
            </div>
            ` : ''}
            <div class="chart-container">
              <h3>Skills Radar Chart</h3>
              ${chartImages.skillRadarChart}
            </div>
          </div>
          ` : ''}
          
          <!-- Skill Gap Analysis -->
          ${report.skillGapAnalysis ? `
          <div class="section gap-analysis">
            <div class="section-title">
              <div class="section-icon">3</div>
              Skill Gap Analysis
            </div>
            <div class="summary-box">
              <p>${report.skillGapAnalysis.aiAnalysis || report.skillGapAnalysis.overview || 'Analysis of your current skill gaps compared to requirements for your target role.'}</p>
            </div>
            ${report.skillGapAnalysis.keyGaps && report.skillGapAnalysis.keyGaps.length > 0 ? `
            <h3>Key Gaps</h3>
            <div class="info-grid">
              ${report.skillGapAnalysis.keyGaps.map((gap: any) => `
                <div class="info-card">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: 600;">${gap.skill || 'Skill'}</div>
                    <div class="badge" style="background-color: rgba(239, 68, 68, 0.1); color: rgb(239, 68, 68);">
                      ${gap.priority ? `${gap.priority} Priority` : gap.gap ? `Gap: ${gap.gap}` : 'Gap Identified'}
                    </div>
                  </div>
                  <div style="margin-top: 10px; display: flex; justify-content: space-between; font-size: 14px;">
                    <div>Current: ${gap.currentLevel || '0'}</div>
                    <div>Required: ${gap.requiredLevel || '0'}</div>
                  </div>
                  <div style="margin-top: 5px; font-size: 14px; color: #6b7280;">
                    ${gap.improvementSuggestion || gap.description || 'Requires development to meet role requirements.'}
                  </div>
                </div>
              `).join('')}
            </div>
            ` : ''}
            <div class="chart-container">
              <h3>Gap Analysis Visualization</h3>
              ${chartImages.gapAnalysisChart}
            </div>
          </div>
          ` : ''}
          
          <!-- Career Pathway Options -->
          ${report.careerPathwayOptions ? `
          <div class="section career-pathway">
            <div class="section-title">
              <div class="section-icon">4</div>
              Career Pathway Options
            </div>
            <div class="summary-box">
              <p>${report.careerPathwayOptions.pathwayDescription || report.careerPathwayOptions.overview || 'Recommended career pathway options for your transition to the target role.'}</p>
            </div>
            ${report.careerPathwayOptions.pathwaySteps && report.careerPathwayOptions.pathwaySteps.length > 0 ? `
            <h3>Pathway Steps</h3>
            ${report.careerPathwayOptions.pathwaySteps.map((step: any, index: number) => `
              <div class="step-container">
                <div class="step-number">${index + 1}</div>
                <div class="step-content">
                  <div class="step-title">
                    <div class="step-name">${step.step || step.title || step.name || `Step ${index + 1}`}</div>
                    <div class="step-time">${step.timeframe || step.duration || step.timeline || '3-6 months'}</div>
                  </div>
                  <div>${step.description || 'Move through this step to progress in your career pathway.'}</div>
                </div>
              </div>
            `).join('')}
            
            <div class="chart-container">
              <h3>Career Pathway Visualization</h3>
              ${chartImages.careerPathwayVisualization}
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          <!-- Development Plan -->
          ${report.developmentPlan ? `
          <div class="section development-plan">
            <div class="section-title">
              <div class="section-icon">5</div>
              Development Plan
            </div>
            <div class="summary-box">
              <p>${report.developmentPlan.overview || 'A structured plan to develop the necessary skills and qualifications for your target role.'}</p>
            </div>
            ${report.developmentPlan.recommendedDegrees && report.developmentPlan.recommendedDegrees.length > 0 ? `
            <h3>Recommended Degrees</h3>
            <div class="info-grid">
              ${report.developmentPlan.recommendedDegrees.map((degree: any) => `
                <div class="info-card">
                  <div style="font-weight: 600;">${degree.degree || degree.name || degree.title || 'Relevant Degree'}</div>
                  <div style="margin-top: 5px; font-size: 14px; color: #6b7280;">
                    ${degree.description || degree.details || 'This educational program will help you build relevant skills for your target role.'}
                  </div>
                </div>
              `).join('')}
            </div>
            ` : ''}
            
            ${report.developmentPlan.recommendedInstitutions && report.developmentPlan.recommendedInstitutions.length > 0 ? `
            <h3>Recommended Institutions</h3>
            <div class="info-grid">
              ${report.developmentPlan.recommendedInstitutions.map((institution: any) => `
                <div class="info-card">
                  <div style="font-weight: 600;">${institution.name || institution.institution || institution.title || 'Educational Institution'}</div>
                  <div style="margin-top: 5px; font-size: 14px; color: #6b7280;">
                    ${institution.description || institution.details || 'This institution offers relevant programs for your career development.'}
                  </div>
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          <!-- Educational Programs -->
          ${report.educationalPrograms ? `
          <div class="section educational-programs">
            <div class="section-title">
              <div class="section-icon">6</div>
              Educational Programs
            </div>
            <div class="summary-box">
              <p>${report.educationalPrograms.overview || 'Recommended educational programs to support your career development journey.'}</p>
            </div>
            ${report.educationalPrograms.learningOutcomes && report.educationalPrograms.learningOutcomes.length > 0 ? `
            <h3>Learning Outcomes</h3>
            <div>
              ${report.educationalPrograms.learningOutcomes.map((outcome: any) => `
                <div style="display: flex; margin-bottom: 10px;">
                  <div style="color: rgb(34, 197, 94); margin-right: 10px;">✓</div>
                  <div>${typeof outcome === 'string' ? outcome : outcome.outcome || outcome.description || 'Important learning outcome'}</div>
                </div>
              `).join('')}
            </div>
            ` : ''}
            
            ${report.educationalPrograms.recommendedCourses && report.educationalPrograms.recommendedCourses.length > 0 ? `
            <h3>Recommended Courses</h3>
            <div class="info-grid">
              ${report.educationalPrograms.recommendedCourses.map((course: any) => `
                <div class="info-card">
                  <div style="font-weight: 600;">${course.title || course.name || course.course || 'Relevant Course'}</div>
                  <div style="margin-top: 5px; font-size: 14px; color: #6b7280;">
                    ${course.description || course.details || 'This course will help you develop important skills for your target role.'}
                  </div>
                  ${course.provider ? `<div style="margin-top: 5px; font-size: 12px; color: #6b7280;">Provider: ${course.provider}</div>` : ''}
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          <!-- Learning Roadmap -->
          ${report.learningRoadmap ? `
          <div class="section learning-roadmap">
            <div class="section-title">
              <div class="section-icon">7</div>
              Learning Roadmap
            </div>
            <div class="summary-box">
              <p>${report.learningRoadmap.overview || 'A structured learning roadmap to help you acquire the necessary skills for your target role.'}</p>
            </div>
            ${report.learningRoadmap.keySkills && report.learningRoadmap.keySkills.length > 0 ? `
            <h3>Key Skills to Learn</h3>
            <div class="info-grid">
              ${report.learningRoadmap.keySkills.map((skill: any) => `
                <div class="info-card">
                  <div style="font-weight: 600;">${skill.skill || skill.name || skill.title || 'Key Skill'}</div>
                  <div style="margin-top: 5px; font-size: 14px; color: #6b7280;">
                    ${skill.description || skill.details || 'This skill is crucial for success in your target role.'}
                  </div>
                  ${skill.timeline ? `<div style="margin-top: 5px; font-size: 12px; color: #6b7280;">Timeline: ${skill.timeline}</div>` : ''}
                </div>
              `).join('')}
            </div>
            ` : ''}
            <div class="chart-container">
              <h3>Learning Roadmap Visualization</h3>
              ${chartImages.learningRoadmapVisualization}
            </div>
          </div>
          ` : ''}
          
          <!-- All remaining sections with proper numbering and styling -->
          
          <!-- Similar Roles -->
          ${report.similarRoles ? `
          <div class="section similar-roles">
            <div class="section-title">
              <div class="section-icon">8</div>
              Similar Roles
            </div>
            <div class="summary-box">
              <p>${report.similarRoles.introduction || 'Other career paths similar to your target role that you might consider.'}</p>
            </div>
            ${report.similarRoles.roles && report.similarRoles.roles.length > 0 ? `
            <h3>Related Roles to Consider</h3>
            <div class="info-grid">
              ${report.similarRoles.roles.map((role: any) => `
                <div class="info-card">
                  <div style="font-weight: 600;">${role.title || role.name || role.role || 'Related Role'}</div>
                  <div style="margin-top: 5px; font-size: 14px; color: #6b7280;">
                    ${role.description || role.overview || 'This role has similarities to your target role and may offer an alternative career path.'}
                  </div>
                  <div style="margin-top: 10px; display: flex; justify-content: space-between; font-size: 14px;">
                    <div>Similarity: ${role.similarityScore ? `${role.similarityScore}%` : role.similarity ? `${role.similarity}%` : 'High'}</div>
                    <div>Avg. Salary: ${role.averageSalary || role.salary || role.compensation || 'Competitive'}</div>
                  </div>
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          <!-- Quick Tips -->
          ${report.quickTips ? `
          <div class="section quick-tips">
            <div class="section-title">
              <div class="section-icon">9</div>
              Quick Tips
            </div>
            <div class="summary-box">
              <p>${report.quickTips.introduction || 'Practical advice to help you succeed in your career transition.'}</p>
            </div>
            ${report.quickTips.resumeTips && report.quickTips.resumeTips.length > 0 ? `
            <h3>Resume Tips</h3>
            <div>
              ${report.quickTips.resumeTips.map((tip: any) => `
                <div style="display: flex; margin-bottom: 10px;">
                  <div style="color: rgb(250, 204, 21); margin-right: 10px;">★</div>
                  <div>${typeof tip === 'string' ? tip : tip.tip || tip.advice || 'Important resume tip'}</div>
                </div>
              `).join('')}
            </div>
            ` : ''}
            
            ${report.quickTips.interviewTips && report.quickTips.interviewTips.length > 0 ? `
            <h3>Interview Tips</h3>
            <div>
              ${report.quickTips.interviewTips.map((tip: any) => `
                <div style="display: flex; margin-bottom: 10px;">
                  <div style="color: rgb(250, 204, 21); margin-right: 10px;">★</div>
                  <div>${typeof tip === 'string' ? tip : tip.tip || tip.advice || 'Important interview tip'}</div>
                </div>
              `).join('')}
            </div>
            ` : ''}
            
            ${report.quickTips.networkingTips && report.quickTips.networkingTips.length > 0 ? `
            <h3>Networking Tips</h3>
            <div>
              ${report.quickTips.networkingTips.map((tip: any) => `
                <div style="display: flex; margin-bottom: 10px;">
                  <div style="color: rgb(250, 204, 21); margin-right: 10px;">★</div>
                  <div>${typeof tip === 'string' ? tip : tip.tip || tip.advice || 'Important networking tip'}</div>
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          <!-- Growth Trajectory -->
          ${report.growthTrajectory ? `
          <div class="section growth-trajectory">
            <div class="section-title">
              <div class="section-icon">10</div>
              Growth Trajectory
            </div>
            <div class="summary-box">
              <p>${report.growthTrajectory.overview || 'Long-term growth trajectory in your target role, including potential promotions and salary progression.'}</p>
            </div>
            ${report.growthTrajectory.promotionTimeline && report.growthTrajectory.promotionTimeline.length > 0 ? `
            <h3>Promotion Timeline</h3>
            <div>
              ${report.growthTrajectory.promotionTimeline.map((step: any, index: number) => `
                <div class="step-container">
                  <div class="step-number">${index + 1}</div>
                  <div class="step-content">
                    <div class="step-title">
                      <div class="step-name">${step.role || step.position || step.title || `Career Stage ${index + 1}`}</div>
                      <div class="step-time">${step.timeframe || step.timeline || step.duration || '1-2 years'}</div>
                    </div>
                    <div>${step.description || step.details || 'This stage represents a progression point in your career journey.'}</div>
                  </div>
                </div>
              `).join('')}
            </div>
            ` : ''}
            
            ${report.growthTrajectory.salaryProgression && report.growthTrajectory.salaryProgression.length > 0 ? `
            <h3>Salary Progression</h3>
            <div class="info-grid">
              ${report.growthTrajectory.salaryProgression.map((item: any) => `
                <div class="info-card">
                  <div style="font-weight: 600;">${item.stage || item.level || item.title || 'Career Stage'}</div>
                  <div style="margin-top: 5px; font-weight: 700; color: rgb(20, 184, 166); font-size: 18px;">
                    ${item.salary || item.compensation || item.pay || '$Competitive'}
                  </div>
                  <div style="margin-top: 5px; font-size: 14px; color: #6b7280;">
                    ${item.timeframe || item.timeline || item.period || '1-2 years'}
                  </div>
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          <!-- Learning Path Roadmap -->
          ${report.learningPathRoadmap ? `
          <div class="section learning-path">
            <div class="section-title">
              <div class="section-icon">11</div>
              Learning Path Roadmap
            </div>
            <div class="summary-box">
              <p>${report.learningPathRoadmap.introduction || report.learningPathRoadmap.overview || 'A comprehensive learning path roadmap to guide your professional development journey.'}</p>
            </div>
            ${report.learningPathRoadmap.milestones && report.learningPathRoadmap.milestones.length > 0 ? `
            <h3>Key Milestones</h3>
            <div>
              ${report.learningPathRoadmap.milestones.map((milestone: any, index: number) => `
                <div class="step-container">
                  <div class="step-number">${index + 1}</div>
                  <div class="step-content" style="background: rgba(236, 72, 153, 0.05);">
                    <div class="step-title">
                      <div class="step-name">${milestone.milestone || milestone.title || milestone.name || `Milestone ${index + 1}`}</div>
                      <div class="step-time" style="color: rgb(236, 72, 153); border-color: rgba(236, 72, 153, 0.3);">${milestone.timeframe || milestone.timeline || milestone.duration || '3-6 months'}</div>
                    </div>
                    <div>${milestone.description || milestone.details || 'This is an important milestone in your learning journey.'}</div>
                  </div>
                </div>
              `).join('')}
            </div>
            ` : ''}
            
            ${report.learningPathRoadmap.resources && report.learningPathRoadmap.resources.length > 0 ? `
            <h3>Key Learning Resources</h3>
            <div class="info-grid">
              ${report.learningPathRoadmap.resources.map((resource: any) => `
                <div class="info-card">
                  <div style="font-weight: 600;">${resource.title || resource.name || resource.resource || 'Learning Resource'}</div>
                  <div style="margin-top: 5px; font-size: 14px; color: #6b7280;">
                    ${resource.description || resource.details || 'This resource will help you develop important skills for your career.'}
                  </div>
                  <div style="margin-top: 10px; font-size: 14px; color: rgb(236, 72, 153);">
                    ${resource.type || resource.category || 'Resource'} • ${resource.duration || resource.length || resource.timeCommitment || 'Self-paced'}
                  </div>
                </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          <div class="footer">
            <p>Generated by Skillgenix - The Career Pathway Platform</p>
            <p>&copy; ${new Date().getFullYear()} Skillgenix</p>
          </div>
        </body>
        </html>
      `;
      
      // Create a Blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Skillgenix_Career_Analysis_${analysis.metadata.targetRole.replace(/\s+/g, '_')}_${format(new Date(analysis.metadata.dateCreated), 'yyyy-MM-dd')}.html`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast({
        title: 'Success',
        description: 'Comprehensive report downloaded successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error downloading analysis:', error);
      toast({
        title: 'Error',
        description: 'Failed to download analysis. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Render a saved analysis card
  const renderAnalysisCard = (analysis: SavedAnalysis, index: number) => {
    const { report, metadata } = analysis;
    
    return (
      <motion.div
        variants={fadeInUp}
        custom={index * 0.1}
        className="w-full"
      >
        <Card className="w-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{metadata.targetRole}</CardTitle>
                <CardDescription>
                  {format(new Date(metadata.dateCreated), 'MMMM d, yyyy')}
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {metadata.professionalLevel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-sm text-muted-foreground mb-3 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {metadata.location}
            </div>
            
            {report.executiveSummary && (
              <div className="mt-3">
                <h4 className="font-medium text-sm mb-1">Executive Summary</h4>
                <p className="text-sm line-clamp-2">{report.executiveSummary.summary}</p>
              </div>
            )}
            
            {report.skillGapAnalysis && (
              <div className="flex flex-wrap mt-3 gap-1">
                {report.skillGapAnalysis.keyGaps && report.skillGapAnalysis.keyGaps.slice(0, 3).map((gap: any, i: number) => (
                  <Badge key={i} variant="outline" className="bg-red-50 text-red-600 text-xs">
                    {gap.skill}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2 flex justify-between">
            <Button variant="ghost" size="sm" onClick={() => handleViewAnalysis(analysis)}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDownload(analysis)}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(index)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };
  
  // Show a modal with the selected analysis details
  const renderAnalysisDetailsModal = () => {
    if (!selectedAnalysis) return null;
    
    const { report, metadata } = selectedAnalysis;
    const { executiveSummary, skillGapAnalysis, careerPathwayOptions } = report;
    
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">{metadata.targetRole} Career Analysis</h2>
            <Button variant="ghost" size="sm" onClick={() => setSelectedAnalysis(null)}>
              &times;
            </Button>
          </div>
          
          <div className="overflow-y-auto flex-grow p-6">
            <div className="space-y-6">
              <div className="flex gap-4 flex-wrap">
                <div className="bg-primary/5 px-3 py-2 rounded-md flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm">{format(new Date(metadata.dateCreated), 'MMMM d, yyyy')}</span>
                </div>
                <div className="bg-primary/5 px-3 py-2 rounded-md flex items-center gap-1.5">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm">{metadata.professionalLevel}</span>
                </div>
                <div className="bg-primary/5 px-3 py-2 rounded-md flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm">{metadata.location}</span>
                </div>
              </div>
              
              <Tabs defaultValue="summary">
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="pathway">Pathway</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="space-y-4 pt-4">
                  {executiveSummary && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
                      <div className="bg-primary/5 p-4 rounded-lg">
                        <p>{executiveSummary.summary}</p>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border rounded-lg p-3">
                          <div className="text-sm text-muted-foreground">Career Goal</div>
                          <div className="font-medium flex items-center gap-1.5 mt-1">
                            <Target className="h-4 w-4 text-primary" />
                            {executiveSummary.careerGoal}
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-3">
                          <div className="text-sm text-muted-foreground">Fit Score</div>
                          <div className="font-medium flex items-center gap-1.5 mt-1">
                            <Star className="h-4 w-4 text-amber-500" />
                            {executiveSummary.fitScore.score}/{executiveSummary.fitScore.outOf}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Key Findings</h4>
                        <ul className="space-y-1">
                          {executiveSummary.keyFindings.map((finding: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
                              <span>{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="skills" className="space-y-4 pt-4">
                  {skillGapAnalysis && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Skill Gap Analysis</h3>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p>{skillGapAnalysis.aiAnalysis}</p>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Key Skill Gaps</h4>
                        <div className="space-y-2">
                          {skillGapAnalysis.keyGaps && skillGapAnalysis.keyGaps.map((gap: any, i: number) => (
                            <div key={i} className="border rounded-lg p-3 relative overflow-hidden">
                              <div className="absolute top-0 right-0 bottom-0 w-1" style={{
                                background: gap.priority === 'High' 
                                  ? 'rgb(239, 68, 68)' 
                                  : gap.priority === 'Medium' 
                                    ? 'rgb(245, 158, 11)' 
                                    : 'rgb(34, 197, 94)'
                              }}></div>
                              
                              <div className="flex justify-between items-center">
                                <div className="font-medium">{gap.skill}</div>
                                <Badge variant={gap.priority === 'High' 
                                  ? 'destructive' 
                                  : gap.priority === 'Medium' 
                                    ? 'default' 
                                    : 'outline'}
                                >
                                  {gap.priority} Priority
                                </Badge>
                              </div>
                              
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(gap.currentLevel / 7) * 100}%` }}></div>
                              </div>
                              
                              <div className="mt-1 text-xs flex justify-between">
                                <span>Current: {gap.currentLevel}/7</span>
                                <span>Required: {gap.requiredLevel}/7</span>
                                <span>Gap: {gap.gap}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="pathway" className="space-y-4 pt-4">
                  {careerPathwayOptions && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Career Pathway</h3>
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <p>{careerPathwayOptions.pathwayDescription}</p>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Pathway Steps</h4>
                        <div className="space-y-3">
                          {careerPathwayOptions.pathwaySteps && careerPathwayOptions.pathwaySteps.map((step: any, i: number) => (
                            <div key={i} className="relative pl-8 pb-6 last:pb-0">
                              {i < careerPathwayOptions.pathwaySteps.length - 1 && (
                                <div className="absolute top-7 bottom-0 left-3.5 border-l-2 border-dashed border-indigo-300"></div>
                              )}
                              <div className="absolute top-1 left-0 bg-indigo-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-medium">
                                {i + 1}
                              </div>
                              <div className="bg-white border border-indigo-100 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                  <div className="font-medium">{step.step}</div>
                                  <Badge variant="outline" className="bg-indigo-50 text-indigo-600">
                                    {step.timeframe}
                                  </Badge>
                                </div>
                                <p className="mt-2 text-sm">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4 pt-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Professional Details</h3>
                    
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="currentSkills">
                        <AccordionTrigger>Current Skills</AccordionTrigger>
                        <AccordionContent>
                          <p className="whitespace-pre-line">{metadata.currentSkills}</p>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="educationalBackground">
                        <AccordionTrigger>Educational Background</AccordionTrigger>
                        <AccordionContent>
                          <p className="whitespace-pre-line">{metadata.educationalBackground}</p>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="careerHistory">
                        <AccordionTrigger>Career History</AccordionTrigger>
                        <AccordionContent>
                          <p className="whitespace-pre-line">{metadata.careerHistory}</p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <div className="p-4 border-t flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setSelectedAnalysis(null)}>
              Close
            </Button>
            <Button onClick={() => handleDownload(selectedAnalysis)}>
              <Download className="h-4 w-4 mr-2" />
              Download Full Report
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <AuthenticatedLayout>
      <motion.div
        className="container py-8"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Saved Career Analyses</h1>
            <p className="text-muted-foreground">View, download, or delete your saved career analyses</p>
          </div>
          <Button onClick={() => navigate('/structured-pathway')}>
            <FileText className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((_, i) => (
              <div key={i} className="h-52 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : savedAnalyses.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No saved analyses found</h2>
            <p className="text-muted-foreground mb-6">
              You haven't saved any career analyses yet. Create a new analysis to get started.
            </p>
            <Button onClick={() => navigate('/structured-pathway')}>
              Create New Analysis
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedAnalyses.map((analysis, index) => renderAnalysisCard(analysis, index))}
          </div>
        )}
        
        {selectedAnalysis && renderAnalysisDetailsModal()}
      </motion.div>
    </AuthenticatedLayout>
  );
}