import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CareerAnalysisResult } from './CareerPathwayForm';

interface PdfDownloaderProps {
  results: CareerAnalysisResult;
  userName?: string;
}

// Add the autotable type to jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function PdfDownloader({ results, userName = 'User' }: PdfDownloaderProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      toast({
        title: 'Preparing PDF',
        description: 'Generating your career pathway analysis PDF...',
      });

      // Create PDF Document
      const pdf = new jsPDF();
      
      // Set document properties
      pdf.setProperties({
        title: 'Skillgenix Career Pathway Analysis',
        subject: 'Career Development Report',
        author: 'Skillgenix AI Platform'
      });
      
      // Basic Setup
      const pageWidth = pdf.internal.pageSize.getWidth();
      const maxLineWidth = pageWidth - 20; // 10mm margins on each side
      
      // Title and Date
      pdf.setFontSize(22);
      pdf.setTextColor(0, 0, 128);
      pdf.text('Skillgenix Career Analysis', pageWidth/2, 20, { align: 'center' });
      
      // Current Date
      const today = new Date().toLocaleDateString();
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated: ${today} | For: ${userName}`, pageWidth/2, 28, { align: 'center' });
      
      // Executive Summary
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 128);
      pdf.text('Executive Summary', 10, 40);
      
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const summaryLines = pdf.splitTextToSize(results.executiveSummary, maxLineWidth);
      pdf.text(summaryLines, 10, 48);
      
      // Move position based on summary length
      let yPos = 50 + (summaryLines.length * 5);
      
      // Check if we need a new page
      if (yPos > 270) {
        pdf.addPage();
        yPos = 20;
      }
      
      // Framework Skills Section
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 128);
      pdf.text('Framework-Based Skills', 10, yPos);
      yPos += 10;
      
      // SFIA 9 Skills Table
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text('SFIA 9 Skills', 10, yPos);
      yPos += 5;
      
      // Create SFIA skills table
      pdf.autoTable({
        startY: yPos,
        head: [['Skill', 'Level', 'Description']],
        body: results.skillMapping.sfia9.map(skill => [
          skill.skill,
          skill.level,
          skill.description
        ]),
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 128], textColor: 255 },
        margin: { left: 10, right: 10 },
      });
      
      yPos = (pdf as any).lastAutoTable.finalY + 10;
      
      // Check if we need a new page
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }
      
      // DigComp 2.2 Competencies Table
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text('DigComp 2.2 Competencies', 10, yPos);
      yPos += 5;
      
      pdf.autoTable({
        startY: yPos,
        head: [['Competency', 'Level', 'Description']],
        body: results.skillMapping.digcomp22.map(comp => [
          comp.competency,
          comp.level,
          comp.description
        ]),
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 128], textColor: 255 },
        margin: { left: 10, right: 10 },
      });
      
      yPos = (pdf as any).lastAutoTable.finalY + 10;
      
      // Check if we need a new page
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }
      
      // Skill Gap Analysis
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 128);
      pdf.text('Skill Gap Analysis', 10, yPos);
      yPos += 10;
      
      // Skill Gaps Table
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Identified Skill Gaps', 10, yPos);
      yPos += 5;
      
      pdf.autoTable({
        startY: yPos,
        head: [['Skill', 'Importance', 'Description']],
        body: results.skillGapAnalysis.gaps.map(gap => [
          gap.skill,
          gap.importance,
          gap.description
        ]),
        theme: 'grid',
        headStyles: { fillColor: [220, 50, 50], textColor: 255 },
        margin: { left: 10, right: 10 },
      });
      
      yPos = (pdf as any).lastAutoTable.finalY + 10;
      
      // Check if we need a new page
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }
      
      // Skill Strengths Table
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Skill Strengths', 10, yPos);
      yPos += 5;
      
      pdf.autoTable({
        startY: yPos,
        head: [['Skill', 'Level', 'Relevance']],
        body: results.skillGapAnalysis.strengths.map(strength => [
          strength.skill,
          strength.level,
          strength.relevance
        ]),
        theme: 'grid',
        headStyles: { fillColor: [40, 167, 69], textColor: 255 },
        margin: { left: 10, right: 10 },
      });
      
      yPos = (pdf as any).lastAutoTable.finalY + 10;
      
      // Add new page for career pathways
      pdf.addPage();
      yPos = 20;
      
      // University Pathway
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 128);
      pdf.text('University Pathway', 10, yPos);
      yPos += 10;
      
      // Create pathway steps table
      pdf.autoTable({
        startY: yPos,
        head: [['Step', 'Role', 'Timeframe', 'Qualification', 'Skills Needed']],
        body: results.careerPathway.withDegree.map(step => [
          step.step,
          step.role,
          step.timeframe,
          step.requiredQualification || 'N/A',
          step.keySkillsNeeded.join(', ')
        ]),
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 128], textColor: 255 },
        margin: { left: 10, right: 10 },
      });
      
      yPos = (pdf as any).lastAutoTable.finalY + 10;
      
      // Check if we need a new page
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }
      
      // Vocational Pathway
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 128);
      pdf.text('Vocational Pathway', 10, yPos);
      yPos += 10;
      
      // Create pathway steps table
      pdf.autoTable({
        startY: yPos,
        head: [['Step', 'Role', 'Timeframe', 'Qualification', 'Skills Needed']],
        body: results.careerPathway.withoutDegree.map(step => [
          step.step,
          step.role,
          step.timeframe,
          step.alternativeQualification || 'N/A',
          step.keySkillsNeeded.join(', ')
        ]),
        theme: 'grid',
        headStyles: { fillColor: [46, 139, 87], textColor: 255 },
        margin: { left: 10, right: 10 },
      });
      
      yPos = (pdf as any).lastAutoTable.finalY + 10;
      
      // Add new page for development plan
      pdf.addPage();
      yPos = 20;
      
      // Development Plan
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 128);
      pdf.text('Development Plan', 10, yPos);
      yPos += 10;
      
      // Skills to Acquire
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Skills to Acquire', 10, yPos);
      yPos += 5;
      
      pdf.autoTable({
        startY: yPos,
        head: [['Skill', 'Priority']],
        body: results.developmentPlan.skillsToAcquire.map(skill => [
          skill.skill,
          skill.priority
        ]),
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 128], textColor: 255 },
        margin: { left: 10, right: 10 },
      });
      
      yPos = (pdf as any).lastAutoTable.finalY + 10;
      
      // Check if we need a new page
      if (yPos > 250) {
        pdf.addPage();
        yPos = 20;
      }
      
      // Recommended Certifications
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Recommended Certifications', 10, yPos);
      yPos += 5;
      
      // University
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text('University Programs:', 10, yPos);
      yPos += 5;
      
      results.developmentPlan.recommendedCertifications.university.forEach(cert => {
        pdf.text(`• ${cert}`, 15, yPos);
        yPos += 5;
      });
      
      yPos += 5;
      
      // Vocational
      pdf.setFontSize(10);
      pdf.text('Vocational Programs:', 10, yPos);
      yPos += 5;
      
      results.developmentPlan.recommendedCertifications.vocational.forEach(cert => {
        pdf.text(`• ${cert}`, 15, yPos);
        yPos += 5;
      });
      
      yPos += 5;
      
      // Online
      pdf.setFontSize(10);
      pdf.text('Online Programs:', 10, yPos);
      yPos += 5;
      
      results.developmentPlan.recommendedCertifications.online.forEach(cert => {
        pdf.text(`• ${cert}`, 15, yPos);
        yPos += 5;
      });
      
      // Add page numbers to all pages
      const pageCount = pdf.internal.getNumberOfPages();
      for(let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth/2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
        
        // Add footer
        pdf.setFontSize(8);
        pdf.text('© Skillgenix - AI-Powered Career Analysis Platform', pageWidth/2, pdf.internal.pageSize.getHeight() - 5, { align: 'center' });
      }
      
      // Save PDF
      pdf.save(`Skillgenix_Career_Analysis_${userName.replace(/\s+/g, '_')}_${today.replace(/\//g, '-')}.pdf`);
      
      toast({
        title: 'PDF Created Successfully',
        description: 'Your career pathway analysis has been downloaded as a PDF.',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast({
        title: 'PDF Generation Failed',
        description: error?.message || 'Failed to generate PDF. Please try again.',
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