import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
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
    // Set charts as ready after a small delay to ensure they're properly rendered
    const timer = setTimeout(() => {
      setChartsReady(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [results]);

  // Function to capture a chart as an image
  const captureChart = async (ref: React.RefObject<HTMLDivElement>): Promise<string | null> => {
    if (!ref.current) return null;
    
    try {
      const canvas = await html2canvas(ref.current, {
        scale: 2, // Higher scale for better resolution
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });
      
      return canvas.toDataURL('image/png');
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
      
      // Skill Analysis Page
      pdf.addPage();
      
      // Section: Skill Analysis
      pdf.setFontSize(14);
      pdf.setTextColor(163, 29, 82);
      pdf.text("3. Framework-Based Skill Analysis", 15, 20);
      
      // SFIA 9 Skills
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);
      pdf.text("SFIA 9 Skills:", 15, 30);
      
      // List SFIA skills
      let yPos = 38;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      results.skillMapping.sfia9.forEach((skill, index) => {
        if (yPos > 270) {
          pdf.addPage();
          pdf.setFontSize(14);
          pdf.setTextColor(163, 29, 82);
          pdf.text("3. Framework-Based Skill Analysis (continued)", 15, 20);
          yPos = 30;
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
        }
        
        pdf.text(`• ${skill.skill} (${skill.level})`, 20, yPos);
        yPos += 7;
      });
      
      // DigComp Skills
      yPos += 5;
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);
      pdf.text("DigComp 2.2 Framework:", 15, yPos);
      yPos += 8;
      
      // List DigComp skills
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      results.skillMapping.digcomp22.forEach((comp, index) => {
        if (yPos > 270) {
          pdf.addPage();
          pdf.setFontSize(14);
          pdf.setTextColor(163, 29, 82);
          pdf.text("3. Framework-Based Skill Analysis (continued)", 15, 20);
          yPos = 30;
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
        }
        
        pdf.text(`• ${comp.competency} (${comp.level})`, 20, yPos);
        yPos += 7;
      });
      
      // Add page for Skill Gap Analysis
      pdf.addPage();
      
      // Skill Gap Analysis
      pdf.setFontSize(14);
      pdf.setTextColor(163, 29, 82);
      pdf.text("4. Skill Gap Analysis", 15, 20);
      
      // Skill Gaps
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);
      pdf.text("Skill Gaps to Address:", 15, 30);
      
      // List skill gaps
      yPos = 38;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      results.skillGapAnalysis.gaps.forEach((gap, index) => {
        if (yPos > 270) {
          pdf.addPage();
          pdf.setFontSize(14);
          pdf.setTextColor(163, 29, 82);
          pdf.text("4. Skill Gap Analysis (continued)", 15, 20);
          yPos = 30;
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
        }
        
        pdf.text(`• ${gap.skill} (Importance: ${gap.importance})`, 20, yPos);
        const descText = pdf.splitTextToSize(`   ${gap.description}`, 170);
        yPos += 6;
        pdf.text(descText, 20, yPos);
        yPos += (descText.length * 5) + 2;
      });
      
      // Strengths on same page if space allows
      if (yPos < 200) {
        yPos += 10;
        pdf.setFontSize(12);
        pdf.setTextColor(80, 80, 80);
        pdf.text("Your Current Strengths:", 15, yPos);
        yPos += 8;
      } else {
        pdf.addPage();
        pdf.setFontSize(14);
        pdf.setTextColor(163, 29, 82);
        pdf.text("4. Skill Gap Analysis (continued)", 15, 20);
        yPos = 30;
        pdf.setFontSize(12);
        pdf.setTextColor(80, 80, 80);
        pdf.text("Your Current Strengths:", 15, yPos);
        yPos += 8;
      }
      
      // List strengths
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      results.skillGapAnalysis.strengths.forEach((strength, index) => {
        if (yPos > 270) {
          pdf.addPage();
          pdf.setFontSize(14);
          pdf.setTextColor(163, 29, 82);
          pdf.text("4. Skill Gap Analysis (continued)", 15, 20);
          yPos = 30;
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
        }
        
        pdf.text(`• ${strength.skill} (Level: ${strength.level}, Relevance: ${strength.relevance})`, 20, yPos);
        const descText = pdf.splitTextToSize(`   ${strength.description}`, 170);
        yPos += 6;
        pdf.text(descText, 20, yPos);
        yPos += (descText.length * 5) + 2;
      });
      
      // Add page for University Pathway
      pdf.addPage();
      
      // University Pathway
      pdf.setFontSize(14);
      pdf.setTextColor(163, 29, 82);
      pdf.text("5. University Pathway", 15, 20);
      
      // List university pathway steps
      yPos = 30;
      pdf.setFontSize(10);
      results.careerPathway.withDegree.forEach((step, index) => {
        if (yPos > 240) {
          pdf.addPage();
          pdf.setFontSize(14);
          pdf.setTextColor(163, 29, 82);
          pdf.text("5. University Pathway (continued)", 15, 20);
          yPos = 30;
        }
        
        pdf.setTextColor(163, 29, 82);
        pdf.setFontSize(12);
        pdf.text(`Step ${step.step}: ${step.role}`, 15, yPos);
        yPos += 7;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.text(`Timeframe: ${step.timeframe}`, 20, yPos);
        yPos += 6;
        
        if (step.requiredQualification) {
          pdf.text(`Qualification: ${step.requiredQualification}`, 20, yPos);
          yPos += 6;
        }
        
        const descText = pdf.splitTextToSize(step.description, 170);
        pdf.text(descText, 20, yPos);
        yPos += (descText.length * 5) + 2;
        
        pdf.text("Key Skills:", 20, yPos);
        yPos += 6;
        
        step.keySkillsNeeded.forEach(skill => {
          pdf.text(`- ${skill}`, 25, yPos);
          yPos += 6;
        });
        
        yPos += 10;
      });
      
      // Add page for Vocational Pathway
      pdf.addPage();
      
      // Vocational Pathway
      pdf.setFontSize(14);
      pdf.setTextColor(46, 139, 87); // Green for vocational
      pdf.text("6. Vocational Pathway", 15, 20);
      
      // List vocational pathway steps
      yPos = 30;
      pdf.setFontSize(10);
      results.careerPathway.withoutDegree.forEach((step, index) => {
        if (yPos > 240) {
          pdf.addPage();
          pdf.setFontSize(14);
          pdf.setTextColor(46, 139, 87);
          pdf.text("6. Vocational Pathway (continued)", 15, 20);
          yPos = 30;
        }
        
        pdf.setTextColor(46, 139, 87);
        pdf.setFontSize(12);
        pdf.text(`Step ${step.step}: ${step.role}`, 15, yPos);
        yPos += 7;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.text(`Timeframe: ${step.timeframe}`, 20, yPos);
        yPos += 6;
        
        if (step.alternativeQualification) {
          pdf.text(`Qualification: ${step.alternativeQualification}`, 20, yPos);
          yPos += 6;
        }
        
        const descText = pdf.splitTextToSize(step.description, 170);
        pdf.text(descText, 20, yPos);
        yPos += (descText.length * 5) + 2;
        
        pdf.text("Key Skills:", 20, yPos);
        yPos += 6;
        
        step.keySkillsNeeded.forEach(skill => {
          pdf.text(`- ${skill}`, 25, yPos);
          yPos += 6;
        });
        
        yPos += 10;
      });
      
      // Add page for Development Plan
      pdf.addPage();
      
      // Development Plan
      pdf.setFontSize(14);
      pdf.setTextColor(163, 29, 82);
      pdf.text("7. Development Plan", 15, 20);
      
      // Skills to Acquire
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);
      pdf.text("Skills to Acquire:", 15, 30);
      
      // List skills to acquire
      yPos = 38;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      results.developmentPlan.skillsToAcquire.forEach((skill, index) => {
        if (yPos > 270) {
          pdf.addPage();
          pdf.setFontSize(14);
          pdf.setTextColor(163, 29, 82);
          pdf.text("7. Development Plan (continued)", 15, 20);
          yPos = 30;
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
        }
        
        pdf.text(`• ${skill.skill} (Priority: ${skill.priority})`, 20, yPos);
        
        if (Array.isArray(skill.resources) && skill.resources.length > 0) {
          yPos += 5;
          pdf.text("  Resources:", 25, yPos);
          yPos += 5;
          
          skill.resources.forEach(resource => {
            const resourceText = pdf.splitTextToSize(`  - ${resource}`, 165);
            pdf.text(resourceText, 25, yPos);
            yPos += (resourceText.length * 5);
          });
        }
        
        yPos += 5;
      });
      
      // Recommended Certifications
      yPos += 5;
      pdf.setFontSize(12);
      pdf.setTextColor(80, 80, 80);
      pdf.text("Recommended Certifications:", 15, yPos);
      yPos += 8;
      
      // University Programs
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text("University Programs:", 15, yPos);
      yPos += 6;
      
      results.developmentPlan.recommendedCertifications.university.forEach(cert => {
        if (yPos > 270) {
          pdf.addPage();
          pdf.setFontSize(14);
          pdf.setTextColor(163, 29, 82);
          pdf.text("7. Development Plan (continued)", 15, 20);
          yPos = 30;
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
        }
        
        const certText = pdf.splitTextToSize(`• ${cert}`, 175);
        pdf.text(certText, 20, yPos);
        yPos += (certText.length * 5) + 2;
      });
      
      // Vocational Programs
      yPos += 5;
      pdf.setFontSize(10);
      pdf.text("Vocational Programs:", 15, yPos);
      yPos += 6;
      
      results.developmentPlan.recommendedCertifications.vocational.forEach(cert => {
        if (yPos > 270) {
          pdf.addPage();
          pdf.setFontSize(14);
          pdf.setTextColor(163, 29, 82);
          pdf.text("7. Development Plan (continued)", 15, 20);
          yPos = 30;
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
        }
        
        const certText = pdf.splitTextToSize(`• ${cert}`, 175);
        pdf.text(certText, 20, yPos);
        yPos += (certText.length * 5) + 2;
      });
      
      // Online Programs
      yPos += 5;
      pdf.setFontSize(10);
      pdf.text("Online Programs:", 15, yPos);
      yPos += 6;
      
      results.developmentPlan.recommendedCertifications.online.forEach(cert => {
        if (yPos > 270) {
          pdf.addPage();
          pdf.setFontSize(14);
          pdf.setTextColor(163, 29, 82);
          pdf.text("7. Development Plan (continued)", 15, 20);
          yPos = 30;
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
        }
        
        const certText = pdf.splitTextToSize(`• ${cert}`, 175);
        pdf.text(certText, 20, yPos);
        yPos += (certText.length * 5) + 2;
      });
      
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

  return (
    <div className="w-full">
      <div className="border rounded-lg p-4 bg-muted/10 shadow-sm">
        <div className="flex items-center mb-4">
          <FileText className="h-5 w-5 mr-2 text-primary" />
          <h3 className="text-lg font-semibold">Complete Analysis Report</h3>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">
          Your complete career analysis contains all sections including executive summary, 
          skill mapping, gap analysis, career pathways, and development plan with 
          recommended resources in a professionally designed report.
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-muted-foreground">
            <span className="inline-flex items-center mr-3">
              <FileText className="h-3 w-3 mr-1" /> PDF Format
            </span>
            <span className="inline-flex items-center">
              <svg viewBox="0 0 24 24" className="h-3 w-3 mr-1 fill-current">
                <path d="M12 16l-5-5h3V7h4v4h3l-5 5zm0-14a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
              {isGenerating ? 'Preparing...' : 'Ready for download'}
            </span>
          </div>
          
          <Button 
            onClick={generatePDF} 
            size="sm" 
            className={`${
              isGenerating 
                ? 'bg-primary/10 text-primary border border-primary/30' 
                : 'bg-primary text-white hover:bg-primary/90 shadow-md'
            } font-medium gap-2 transition-all rounded-md`}
            disabled={isGenerating || !chartsReady}
          >
            {isGenerating ? (
              <>
                <svg 
                  className="h-4 w-4 animate-spin text-primary" 
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
                <span>Generating Report...</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Download PDF Report</span>
              </>
            )}
          </Button>
        </div>
        
        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
          <p>
            Your report includes professionally designed data visualizations and 
            comprehensive development recommendations based on SFIA 9 and DigComp 2.2 frameworks.
          </p>
        </div>
      </div>
      
      {/* Hidden divs for chart rendering - these will be captured for the PDF */}
      <div style={{ position: 'absolute', left: '-9999px', width: '800px' }}>
        <div ref={radarChartRef} style={{ backgroundColor: '#fff', padding: '20px' }}>
          <SkillRadarChart results={results} />
        </div>
        <div ref={barChartRef} style={{ backgroundColor: '#fff', padding: '20px' }}>
          <ComparativeBarChart results={results} />
        </div>
      </div>
    </div>
  );
}