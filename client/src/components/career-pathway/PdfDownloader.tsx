import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { CareerAnalysisResult } from './CareerPathwayForm';

interface PdfDownloaderProps {
  results: CareerAnalysisResult;
  userName?: string;
}

export function PdfDownloader({ results, userName = 'User' }: PdfDownloaderProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      toast({
        title: 'Preparing PDF',
        description: 'Creating your career pathway analysis PDF...',
      });

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
      pdf.setTextColor(0, 0, 150);
      pdf.text("Skillgenix Career Analysis", pageWidth/2, 20, { align: "center" });
      
      // Add date and user name
      const today = new Date().toLocaleDateString();
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${today}`, 15, 30);
      pdf.text(`Prepared for: ${userName}`, 15, 36);
      
      // Section: Executive Summary
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 150);
      pdf.text("1. Executive Summary", 15, 46);
      
      // Executive Summary content
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const summaryText = pdf.splitTextToSize(results.executiveSummary, 180);
      pdf.text(summaryText, 15, 54);
      
      // Add second page
      pdf.addPage();
      
      // Section: Skill Analysis
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 150);
      pdf.text("2. Skill Analysis", 15, 20);
      
      // SFIA 9 Skills
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text("SFIA 9 Skills:", 15, 30);
      
      // List SFIA skills
      let yPos = 38;
      pdf.setFontSize(10);
      results.skillMapping.sfia9.forEach((skill, index) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.text(`• ${skill.skill} (${skill.level})`, 20, yPos);
        yPos += 7;
      });
      
      // Add page for DigComp skills
      pdf.addPage();
      
      // DigComp Skills
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 150);
      pdf.text("3. Digital Competencies", 15, 20);
      
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text("DigComp 2.2 Framework:", 15, 30);
      
      // List DigComp skills
      yPos = 38;
      pdf.setFontSize(10);
      results.skillMapping.digcomp22.forEach((comp, index) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.text(`• ${comp.competency} (${comp.level})`, 20, yPos);
        yPos += 7;
      });
      
      // Add page for Skill Gap
      pdf.addPage();
      
      // Skill Gap Analysis
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 150);
      pdf.text("4. Skill Gap Analysis", 15, 20);
      
      // Skill Gaps
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Skill Gaps to Address:", 15, 30);
      
      // List skill gaps
      yPos = 38;
      pdf.setFontSize(10);
      results.skillGapAnalysis.gaps.forEach((gap, index) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.text(`• ${gap.skill} (Importance: ${gap.importance})`, 20, yPos);
        yPos += 7;
      });
      
      // Add page for strengths
      pdf.addPage();
      
      // Strengths
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 150);
      pdf.text("5. Skill Strengths", 15, 20);
      
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Your Current Strengths:", 15, 30);
      
      // List strengths
      yPos = 38;
      pdf.setFontSize(10);
      results.skillGapAnalysis.strengths.forEach((strength, index) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.text(`• ${strength.skill} (Level: ${strength.level}, Relevance: ${strength.relevance})`, 20, yPos);
        yPos += 7;
      });
      
      // Add page for University Pathway
      pdf.addPage();
      
      // University Pathway
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 150);
      pdf.text("6. University Pathway", 15, 20);
      
      // List university pathway steps
      yPos = 30;
      pdf.setFontSize(10);
      results.careerPathway.withDegree.forEach((step, index) => {
        if (yPos > 240) {
          pdf.addPage();
          yPos = 20;
          pdf.setFontSize(14);
          pdf.setTextColor(0, 0, 150);
          pdf.text("6. University Pathway (continued)", 15, yPos);
          yPos += 10;
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
        }
        
        pdf.setTextColor(0, 0, 150);
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
        
        pdf.text("Key Skills:", 20, yPos);
        yPos += 6;
        
        step.keySkillsNeeded.forEach(skill => {
          pdf.text(`- ${skill}`, 25, yPos);
          yPos += 6;
        });
        
        yPos += 6;
      });
      
      // Add page for Vocational Pathway
      pdf.addPage();
      
      // Vocational Pathway
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 150);
      pdf.text("7. Vocational Pathway", 15, 20);
      
      // List vocational pathway steps
      yPos = 30;
      pdf.setFontSize(10);
      results.careerPathway.withoutDegree.forEach((step, index) => {
        if (yPos > 240) {
          pdf.addPage();
          yPos = 20;
          pdf.setFontSize(14);
          pdf.setTextColor(0, 0, 150);
          pdf.text("7. Vocational Pathway (continued)", 15, yPos);
          yPos += 10;
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
        }
        
        pdf.setTextColor(0, 60, 0);
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
        
        pdf.text("Key Skills:", 20, yPos);
        yPos += 6;
        
        step.keySkillsNeeded.forEach(skill => {
          pdf.text(`- ${skill}`, 25, yPos);
          yPos += 6;
        });
        
        yPos += 6;
      });
      
      // Add page for Development Plan
      pdf.addPage();
      
      // Development Plan
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 150);
      pdf.text("8. Development Plan", 15, 20);
      
      // Skills to Acquire
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Skills to Acquire:", 15, 30);
      
      // List skills to acquire
      yPos = 38;
      pdf.setFontSize(10);
      results.developmentPlan.skillsToAcquire.forEach((skill, index) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.text(`• ${skill.skill} (Priority: ${skill.priority})`, 20, yPos);
        yPos += 7;
      });
      
      // Add page for Recommended Programs
      pdf.addPage();
      
      // Recommended Programs 
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 150);
      pdf.text("9. Recommended Programs", 15, 20);
      
      yPos = 30;
      
      // University Programs
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text("University Programs:", 15, yPos);
      yPos += 8;
      
      pdf.setFontSize(10);
      results.developmentPlan.recommendedCertifications.university.forEach(cert => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.text(`• ${cert}`, 20, yPos);
        yPos += 7;
      });
      
      yPos += 5;
      
      // Vocational Programs
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Vocational Programs:", 15, yPos);
      yPos += 8;
      
      pdf.setFontSize(10);
      results.developmentPlan.recommendedCertifications.vocational.forEach(cert => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.text(`• ${cert}`, 20, yPos);
        yPos += 7;
      });
      
      yPos += 5;
      
      // Online Programs
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text("Online Programs:", 15, yPos);
      yPos += 8;
      
      pdf.setFontSize(10);
      results.developmentPlan.recommendedCertifications.online.forEach(cert => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.text(`• ${cert}`, 20, yPos);
        yPos += 7;
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
        description: 'Your career pathway analysis PDF has been downloaded.',
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
    <Button 
      onClick={generatePDF} 
      size="lg" 
      className={`${
        isGenerating 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-white text-gray-800 hover:bg-opacity-95 hover:text-gray-900'
      } shadow-lg text-base gap-2 transition-all duration-200`}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <svg 
            className="h-5 w-5 animate-spin text-blue-600" 
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
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="h-5 w-5" />
          Download PDF Analysis
        </>
      )}
    </Button>
  );
}