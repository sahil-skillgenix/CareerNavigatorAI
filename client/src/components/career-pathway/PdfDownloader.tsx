/**
 * ⚠️ PROTECTED COMPONENT - DO NOT MODIFY ⚠️
 * 
 * This component is part of the Career Pathway Analysis feature which is
 * considered stable and production-ready. Any changes to this file could
 * disrupt critical functionality. See PROTECTED_FEATURES.md at project root.
 * 
 * Last modified: April 26, 2025
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { CareerAnalysisResult } from './CareerPathwayForm';
import { SkillRadarChart } from './SkillRadarChart';
import { ComparativeBarChart } from './ComparativeBarChart';

interface PdfDownloaderProps {
  results: CareerAnalysisResult;
  userName?: string;
}

export function PdfDownloader({ results, userName = 'User' }: PdfDownloaderProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const radarChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const [chartsReady, setChartsReady] = useState(false);
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Render the charts but hide them so we can capture them
  useEffect(() => {
    // Reset state when results change
    setChartsReady(false);
    
    // Validate the results to ensure we have the necessary data
    const hasRequiredData = 
      results && 
      results.skillMapping && 
      results.skillGapAnalysis &&
      results.skillGapAnalysis.gaps && 
      results.skillGapAnalysis.gaps.length > 0;
    
    console.log('PdfDownloader: Results changed, validating data structure', {
      hasRequiredData,
      skillMappingPresent: !!results.skillMapping,
      gapAnalysisPresent: !!results.skillGapAnalysis,
      gapsCount: results.skillGapAnalysis?.gaps?.length || 0
    });
    
    // Set charts as ready after a delay to ensure they're properly rendered
    const timer = setTimeout(() => {
      setChartsReady(hasRequiredData);
    }, 1000); // Longer delay for better rendering
    
    return () => clearTimeout(timer);
  }, [results]);

  // Function to capture a chart as an image with enhanced reliability
  const captureChart = async (ref: React.RefObject<HTMLDivElement>): Promise<string | null> => {
    if (!ref || !ref.current) {
      console.warn('Chart capture failed: reference is null or not rendered');
      return null;
    }
    
    try {
      // Wait to ensure chart is fully rendered
      await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay to ensure rendering
      
      // Ensure element dimensions are set
      const element = ref.current;
      console.log('CHART DEBUG - Attempting to capture chart:', {
        id: element.id || 'unnamed-element',
        width: element.offsetWidth,
        height: element.offsetHeight,
        childElements: element.children.length,
        childElementIds: Array.from(element.querySelectorAll('[id]')).map(el => (el as HTMLElement).id),
        svgElements: element.querySelectorAll('svg').length,
        hasSvgContent: !!element.querySelector('svg > g'),
        rechartComponents: element.querySelectorAll('.recharts-wrapper').length
      });
      
      if (element.offsetWidth === 0 || element.offsetHeight === 0) {
        console.warn('Chart capture failed: element has zero width or height', {
          width: element.offsetWidth,
          height: element.offsetHeight
        });
        return null;
      }
      
      // Force dimensions on SVG elements
      const svgElements = element.querySelectorAll('svg');
      svgElements.forEach((svg, index) => {
        const svgElement = svg as SVGElement;
        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', '100%');
        svgElement.style.display = 'block';
        console.log(`Prepared SVG element ${index}:`, {
          width: svgElement.getAttribute('width'),
          height: svgElement.getAttribute('height')
        });
      });
      
      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better resolution
        backgroundColor: '#ffffff',
        logging: true, // Enable logging for debugging
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => {
          // Don't ignore anything that might be part of the chart
          return false;
        },
        onclone: (clonedDoc) => {
          // Force charts to be visible in the clone
          const elementId = element.id || element.className;
          const clonedElement = elementId ? 
            (element.id ? clonedDoc.getElementById(element.id) : clonedDoc.querySelector(`.${element.className}`)) : 
            null;
            
          if (clonedElement) {
            // Cast to HTMLElement to avoid TypeScript errors
            const htmlElement = clonedElement as HTMLElement;
            htmlElement.style.height = `${element.offsetHeight}px`;
            htmlElement.style.width = `${element.offsetWidth}px`;
            htmlElement.style.position = 'relative';
            htmlElement.style.overflow = 'visible';
            htmlElement.style.opacity = '1';
            htmlElement.style.visibility = 'visible';
            
            // Apply styles to all SVG elements in the clone
            const svgElements = clonedElement.querySelectorAll('svg');
            svgElements.forEach((svg, index) => {
              const svgElement = svg as SVGElement;
              svgElement.setAttribute('width', '100%');
              svgElement.setAttribute('height', '100%');
              svgElement.style.display = 'block';
            });
            
            // Ensure recharts components are visible
            const rechartsWrappers = clonedElement.querySelectorAll('.recharts-wrapper');
            rechartsWrappers.forEach((wrapper, index) => {
              const wrapperElement = wrapper as HTMLElement;
              wrapperElement.style.width = '100%';
              wrapperElement.style.height = '100%';
              wrapperElement.style.position = 'relative';
              wrapperElement.style.overflow = 'visible';
            });
          }
        }
      });
      
      const imageUrl = canvas.toDataURL('image/png');
      console.log('Chart capture successful, image size:', imageUrl.length);
      return imageUrl;
    } catch (error) {
      console.error('Error capturing chart:', error);
      return null;
    }
  };

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      toast({
        title: 'Preparing PDF',
        description: 'Creating your career pathway analysis PDF with visualizations...',
      });

      // Capture charts first
      const radarChartImage = await captureChart(radarChartRef);
      const barChartImage = await captureChart(barChartRef);

      // Create PDF Document with portrait orientation
      const pdf = new jsPDF();
      
      // Set document properties
      pdf.setProperties({
        title: 'Skillgenix Career Analysis',
        subject: 'Career Analysis Report',
        author: 'Skillgenix'
      });
      
      // Get page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Title
      pdf.setFontSize(18);
      pdf.setTextColor(163, 29, 82); // Using the accent color mentioned
      pdf.text("Skillgenix Career Analysis", pageWidth/2, 20, { align: "center" });
      
      // Add date and user name
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${currentDate}`, 15, 30);
      pdf.text(`Prepared for: ${userName}`, 15, 36);
      
      // Section: Executive Summary
      pdf.setFontSize(14);
      pdf.setTextColor(163, 29, 82);
      pdf.text("1. Executive Summary", 15, 46);
      
      // Executive Summary content
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const summaryText = pdf.splitTextToSize(results.executiveSummary, 180);
      pdf.text(summaryText, 15, 54);
      
      // Skill Gap Visualization Page
      pdf.addPage();
      
      // Section: Skill Gap Visualization
      pdf.setFontSize(14);
      pdf.setTextColor(163, 29, 82);
      pdf.text("2. Skill Gap Visualization", 15, 20);
      
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);
      pdf.text("This visualization shows your current skills compared to required skills for your desired role.", 15, 28);
      
      // Add the radar chart
      if (radarChartImage) {
        const imgWidth = 180;
        const imgHeight = 120;
        pdf.addImage(radarChartImage, 'PNG', 15, 35, imgWidth, imgHeight);
      } else {
        pdf.setTextColor(255, 0, 0);
        pdf.text("Chart visualization could not be generated.", 15, 50);
      }
      
      // Add the bar chart on the same page
      if (barChartImage) {
        const imgWidth = 180;
        const imgHeight = 120;
        pdf.addImage(barChartImage, 'PNG', 15, 160, imgWidth, imgHeight);
      }
      
      // Add page numbers to each page
      const pageCount = pdf.internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 287, { align: 'center' });
        pdf.text('© Skillgenix - AI-Powered Career Analysis', pageWidth / 2, 293, { align: 'center' });
      }
      
      // Save the PDF file
      pdf.save(`Skillgenix_Career_Analysis_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
      
      toast({
        title: 'PDF Created Successfully',
        description: 'Your career pathway analysis PDF has been downloaded with visualizations.',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast({
        title: 'PDF Generation Failed',
        description: 'Sorry, we could not generate your PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // HTML Report Generation Function
  const generateHTMLReport = async () => {
    try {
      setIsGenerating(true);
      toast({
        title: 'Preparing HTML Report',
        description: 'Creating your career pathway analysis HTML report with visualizations...',
      });
      
      // Function to retry chart capture with timeout
      const captureChartWithRetry = async (ref: React.RefObject<HTMLDivElement>, maxAttempts: number = 3): Promise<string | null> => {
        let attempts = 0;
        let chartImage: string | null = null;
        
        while (attempts < maxAttempts && !chartImage) {
          attempts++;
          console.log(`Capturing chart, attempt ${attempts}...`);
          
          // Slight delay between attempts
          if (attempts > 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          chartImage = await captureChart(ref);
        }
        
        return chartImage;
      };
      
      // Add data validation logging to help diagnose issues
      console.log('Starting data validation for HTML report...');
      const hasSkillMapping = results.skillMapping && 
        results.skillMapping.sfia9 && 
        results.skillMapping.digcomp22;
      const hasGapAnalysis = results.skillGapAnalysis && 
        results.skillGapAnalysis.gaps && 
        results.skillGapAnalysis.strengths;
      
      console.log('Data validation results:', {
        hasSkillMapping,
        skillMappingSfia: results.skillMapping?.sfia9?.length || 0,
        skillMappingDigcomp: results.skillMapping?.digcomp22?.length || 0,
        hasGapAnalysis,
        gapsCount: results.skillGapAnalysis?.gaps?.length || 0,
        strengthsCount: results.skillGapAnalysis?.strengths?.length || 0,
        hasCareerPathway: !!results.careerPathway,
        hasAiAnalysis: !!results.careerPathway?.aiAnalysis
      });
      
      // Capture charts first with retry capabilities
      console.log('Starting chart capture for HTML report...');
      const radarChartImage = await captureChartWithRetry(radarChartRef);
      const barChartImage = await captureChartWithRetry(barChartRef);
      
      // Log outcome with detailed info
      if (radarChartImage) {
        console.log('Radar chart successfully captured');
      } else {
        console.warn('Failed to capture radar chart - data validation:', 
          results.skillMapping ? 'Has skillMapping' : 'Missing skillMapping',
          results.skillGapAnalysis ? 'Has skillGapAnalysis' : 'Missing skillGapAnalysis');
      }
      
      if (barChartImage) {
        console.log('Bar chart successfully captured');
      } else {
        console.warn('Failed to capture bar chart - data validation:',
          results.skillGapAnalysis?.gaps ? `Has ${results.skillGapAnalysis.gaps.length} gaps` : 'Missing gaps array');
      }
      
      // Create HTML content for download - Break into sections to handle large base64 data
      let chartSections = '';
      
      // Add radar chart if available
      if (radarChartImage) {
        chartSections += `
        <div style="text-align: center; margin-bottom: 30px;">
          <h4>Skill Radar Chart</h4>
          <img src="${radarChartImage}" alt="Skill Radar Chart" style="max-width: 100%; height: auto;" />
        </div>`;
      } else {
        chartSections += `<p>Skill radar chart visualization could not be generated.</p>`;
      }
      
      // Add bar chart if available
      if (barChartImage) {
        chartSections += `
        <div style="text-align: center;">
          <h4>Skill Gap Comparison</h4>
          <img src="${barChartImage}" alt="Skill Gap Comparison Chart" style="max-width: 100%; height: auto;" />
        </div>`;
      } else {
        chartSections += `<p>Skill gap comparison chart could not be generated.</p>`;
      }
      
      // Main HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Skillgenix Career Analysis - ${results.desiredRole || 'Career Analysis'}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
            h1, h2, h3, h4 { color: #1c3b82; }
            h1 { font-size: 28px; text-align: center; margin-bottom: 30px; }
            h2 { font-size: 24px; margin-top: 40px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
            h3 { font-size: 20px; }
            p { margin-bottom: 16px; }
            .card { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
            .header { text-align: center; margin-bottom: 40px; }
            .badge { display: inline-block; border-radius: 4px; padding: 3px 8px; font-size: 12px; font-weight: 600; }
            .badge-primary { background: rgba(28,59,130,0.1); color: #1c3b82; }
            .badge-success { background: rgba(34,197,94,0.1); color: #166534; }
            .badge-danger { background: rgba(239,68,68,0.1); color: #b91c1c; }
            .badge-info { background: rgba(6,182,212,0.1); color: #155e75; }
            .skill-item { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
            .skill-item:last-child { border-bottom: none; }
            .two-columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(480px, 1fr)); gap: 20px; }
            .pathway-step { display: flex; margin-bottom: 20px; }
            .step-number { display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; background: rgba(28,59,130,0.1); color: #1c3b82; border-radius: 50%; font-weight: bold; margin-right: 15px; flex-shrink: 0; }
            .skills-list { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 10px; }
            .skill-tag { background: #f5f5f5; padding: 3px 8px; border-radius: 4px; font-size: 12px; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #666; }
            @media print {
              body { font-size: 12pt; }
              .no-print { display: none; }
              h2 { font-size: 18pt; }
              h3 { font-size: 16pt; }
              .card { border: none; box-shadow: none; padding: 0; margin-bottom: 30px; }
              .two-columns { grid-template-columns: 1fr 1fr; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Career Pathway Analysis</h1>
            <p>From <strong>${results.careerHistory || "Current Position"}</strong> to <strong>${results.desiredRole || "Target Position"}</strong></p>
            <p>Professional Level: <strong>${results.professionalLevel || "Not specified"}</strong></p>
            <p>Generated on: <strong>${currentDate}</strong></p>
          </div>
          
          <h2>Executive Summary</h2>
          <div class="card">
            <p>${results.executiveSummary}</p>
          </div>
          
          <h2>Skill Mapping</h2>
          <div class="two-columns">
            <!-- SFIA 9 Skills -->
            <div class="card">
              <h3><span class="badge badge-primary">SFIA 9</span> Framework Skills</h3>
              ${results.skillMapping?.sfia9 ? 
                results.skillMapping.sfia9.map(skill => `
                  <div class="skill-item">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="font-weight: 600;">${skill.skill}</span>
                      <span class="badge badge-primary">Level ${skill.level}</span>
                    </div>
                    <p style="font-size: 14px; color: #666;">${skill.description}</p>
                  </div>
                `).join('') : '<p>No SFIA 9 skills mapped.</p>'}
            </div>
            
            <!-- DigComp 2.2 Skills -->
            <div class="card">
              <h3><span class="badge badge-info">DigComp 2.2</span> Framework Competencies</h3>
              ${results.skillMapping?.digcomp22 ? 
                results.skillMapping.digcomp22.map(comp => `
                  <div class="skill-item">
                    <div style="display: flex; justify-content: space-between;">
                      <span style="font-weight: 600;">${comp.competency}</span>
                      <span class="badge badge-info">Level ${comp.level}</span>
                    </div>
                    <p style="font-size: 14px; color: #666;">${comp.description}</p>
                  </div>
                `).join('') : '<p>No DigComp 2.2 competencies mapped.</p>'}
            </div>
          </div>
          
          <h2>Skill Gap Analysis</h2>
          ${results.skillGapAnalysis?.aiAnalysis ? `
          <div class="card">
            <h3>Analysis Overview</h3>
            <p>${results.skillGapAnalysis.aiAnalysis}</p>
          </div>` : ''}
          
          <!-- Skill Visualizations -->
          <div class="card">
            <h3>Skill Visualization</h3>
            ${radarChartImage ? `
              <div style="text-align: center; margin-bottom: 30px;">
                <h4>Skill Radar Chart</h4>
                <img src="${radarChartImage}" alt="Skill Radar Chart" style="max-width: 100%; height: auto;" />
              </div>
            ` : '<p>Skill radar chart visualization could not be generated.</p>'}
            
            ${barChartImage ? `
              <div style="text-align: center;">
                <h4>Skill Gap Comparison</h4>
                <img src="${barChartImage}" alt="Skill Gap Comparison Chart" style="max-width: 100%; height: auto;" />
              </div>
            ` : '<p>Skill gap comparison chart could not be generated.</p>'}
          </div>
          
          <div class="two-columns">
            <!-- Skill Gaps -->
            <div class="card">
              <h3>Key Skill Gaps</h3>
              ${results.skillGapAnalysis?.gaps ? 
                results.skillGapAnalysis.gaps.map(gap => `
                  <div class="skill-item">
                    <div style="display: flex; align-items: center; margin-bottom: 4px;">
                      <span class="badge badge-danger" style="margin-right: 8px;">${gap.importance}</span>
                      <span style="font-weight: 600;">${gap.skill}</span>
                    </div>
                    <p style="font-size: 14px; color: #666;">${gap.description}</p>
                  </div>
                `).join('') : '<p>No skill gaps identified.</p>'}
            </div>
            
            <!-- Strengths -->
            <div class="card">
              <h3>Key Strengths</h3>
              ${results.skillGapAnalysis?.strengths ? 
                results.skillGapAnalysis.strengths.map(strength => `
                  <div class="skill-item">
                    <div style="display: flex; align-items: center; margin-bottom: 4px;">
                      <span class="badge badge-success" style="margin-right: 8px;">${strength.level}</span>
                      <span style="font-weight: 600;">${strength.skill}</span>
                    </div>
                    <p style="font-size: 14px; color: #666;">${strength.description || ''}</p>
                    ${strength.relevance ? `<p style="font-size: 14px; color: #666;"><strong>Relevance:</strong> ${strength.relevance}</p>` : ''}
                  </div>
                `).join('') : '<p>No strengths identified.</p>'}
            </div>
          </div>
          
          <h2>Career Pathway</h2>
          ${results.careerPathway?.aiAnalysis ? `
          <div class="card">
            <h3>Transition Strategy</h3>
            <p>${results.careerPathway.aiAnalysis}</p>
          </div>` : 
          results.careerPathway?.aiRecommendations ? `
          <div class="card">
            <h3>Transition Strategy</h3>
            <p>${results.careerPathway.aiRecommendations}</p>
          </div>` : ''}
          
          <div class="card">
            <h3>Career Progression Steps</h3>
            ${results.careerPathway?.steps ? 
              results.careerPathway.steps.map((step, index) => `
                <div class="pathway-step">
                  <div class="step-number">${index + 1}</div>
                  <div>
                    <h4>${step.title}</h4>
                    <p>${step.description}</p>
                    ${step.duration ? `<p><strong>Duration:</strong> ${step.duration}</p>` : ''}
                    ${step.skills ? `
                      <div>
                        <strong>Key Skills to Develop:</strong>
                        <div class="skills-list">
                          ${step.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                      </div>` : ''}
                  </div>
                </div>
              `).join('') : 
              
              // Handle legacy format
              (results.careerPathway?.withDegree || results.careerPathway?.withoutDegree) ? `
                ${results.careerPathway.withDegree ? `
                  <div>
                    <h4>University Pathway</h4>
                    ${results.careerPathway.withDegree.map((step, index) => `
                      <div class="pathway-step">
                        <div class="step-number">${index + 1}</div>
                        <div>
                          <h4>${step.role}</h4>
                          <p>${step.timeframe}</p>
                          <div>
                            <strong>Key Skills:</strong>
                            <div class="skills-list">
                              ${step.keySkillsNeeded.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                            </div>
                          </div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
                
                ${results.careerPathway.withoutDegree ? `
                  <div style="margin-top: 20px;">
                    <h4>Vocational Pathway</h4>
                    ${results.careerPathway.withoutDegree.map((step, index) => `
                      <div class="pathway-step">
                        <div class="step-number" style="background: rgba(16,185,129,0.1); color: #047857;">${index + 1}</div>
                        <div>
                          <h4>${step.role}</h4>
                          <p>${step.timeframe}</p>
                          <div>
                            <strong>Key Skills:</strong>
                            <div class="skills-list">
                              ${step.keySkillsNeeded.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                            </div>
                          </div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              ` : '<p>No career pathway steps defined.</p>'}
          </div>
          
          ${results.developmentPlan?.resources ? `
          <h2>Learning Recommendations</h2>
          <div class="card">
            <h3>Recommended Resources</h3>
            ${results.developmentPlan.resources.map(resource => `
              <div class="skill-item">
                <h4>${resource.title}</h4>
                <p>${resource.description}</p>
                <p><strong>Resource Type:</strong> ${resource.type}</p>
                ${resource.link ? `<p><strong>Link:</strong> <a href="${resource.link}" target="_blank">${resource.link}</a></p>` : ''}
                ${resource.estimatedTime ? `<p><strong>Estimated Time:</strong> ${resource.estimatedTime}</p>` : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          <div class="footer">
            <p>Generated by Skillgenix Career Analysis | ${new Date().toISOString().split('T')[0]}</p>
          </div>
        </body>
        </html>
      `;
    
      // Create separate files for charts to better handle large base64 data
      if (radarChartImage && barChartImage) {
        try {
          console.log('Creating separate chart HTML files to avoid data truncation');
          
          // Create chart-optimized HTML content
          const radarHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Radar Chart - Skill Proficiency</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #333; text-align: center; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <h2>Skill Proficiency Radar Chart</h2>
            <img src="${radarChartImage}" alt="Skill Radar Chart" />
          </body>
          </html>`;
          
          const barHtml = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bar Chart - Skill Gap Analysis</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #333; text-align: center; }
              img { max-width: 100%; height: auto; }
            </style>
          </head>
          <body>
            <h2>Skill Gap Comparison Chart</h2>
            <img src="${barChartImage}" alt="Skill Gap Chart" />
          </body>
          </html>`;
          
          // Download function for chart files
          const downloadHtmlFile = (content: string, filename: string) => {
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          };
          
          // Download radar chart
          downloadHtmlFile(
            radarHtml, 
            `Skillgenix_Radar_Chart_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`
          );
          
          // Download bar chart
          downloadHtmlFile(
            barHtml, 
            `Skillgenix_Bar_Chart_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`
          );
          
          // Replace the large base64 data in the main HTML with links
          const mainHtmlWithLinks = htmlContent.replace(
            /<img src="data:image\/png;base64,[^"]+"/g, 
            '<p>Chart images have been downloaded as separate files for better quality.</p>'
          );
          
          // Download the main HTML file
          downloadHtmlFile(
            mainHtmlWithLinks,
            `Skillgenix_Career_Analysis_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`
          );
          
        } catch (error) {
          console.error('Error creating chart files:', error);
          
          // Fallback - download original HTML
          const blob = new Blob([htmlContent], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Skillgenix_Career_Analysis_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 0);
        }
      } else {
        // Standard download if no chart images
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Skillgenix_Career_Analysis_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 0);
      }
      
      toast({
        title: 'HTML Report Created',
        description: 'Your career pathway analysis HTML report has been downloaded.',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('HTML generation error:', error);
      toast({
        title: 'HTML Report Generation Failed',
        description: 'Sorry, we could not generate your HTML report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full">
      {/* HTML Report Button */}
      <Button 
        onClick={generateHTMLReport} 
        size="lg" 
        className="bg-white text-gray-800 hover:bg-opacity-95 hover:text-gray-900 shadow-lg text-base gap-2 border-2 border-gray-200 w-full"
        disabled={isGenerating}
        data-html-report-btn="true"
      >
        {isGenerating ? (
          <>
            <svg 
              className="h-5 w-5 animate-spin text-primary" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="font-medium">Generating Report...</span>
          </>
        ) : (
          <>
            <Download className="h-5 w-5 text-primary" />
            <span className="font-medium">Download HTML Report</span>
          </>
        )}
      </Button>
      
      {/* Hidden divs for chart rendering - these will be captured for the PDF */}
      <div style={{ position: 'absolute', left: '-9999px', width: '800px', height: '1000px', overflow: 'visible' }}>
        <div ref={radarChartRef} style={{ 
          backgroundColor: '#fff', 
          padding: '20px', 
          width: '600px', 
          height: '400px', 
          position: 'relative',
          overflow: 'visible',
          marginBottom: '50px'
        }}>
          <div style={{ width: '100%', height: '100%' }} id="radar-chart-container">
            <SkillRadarChart results={results} />
          </div>
        </div>
        <div ref={barChartRef} style={{ 
          backgroundColor: '#fff', 
          padding: '20px', 
          width: '600px', 
          height: '400px', 
          position: 'relative',
          overflow: 'visible'
        }}>
          <div style={{ width: '100%', height: '100%' }} id="bar-chart-container">
            <ComparativeBarChart results={results} />
          </div>
        </div>
      </div>
    </div>
  );
}