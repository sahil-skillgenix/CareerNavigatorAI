import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CareerAnalysisResult } from './CareerPathwayForm';
import type { jsPDF as jsPDFType } from 'jspdf';

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

  // Helper function for adding header to each page
  const addPageHeader = (pdf: jsPDF, pageWidth: number, isFirstPage: boolean = false) => {
    const headerHeight = isFirstPage ? 20 : 15;
    
    pdf.setFillColor(65, 82, 179);
    pdf.rect(0, 0, pageWidth, headerHeight, 'F');
    
    if (isFirstPage) {
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Skill', 20, 12);
      pdf.setTextColor(220, 220, 255);
      pdf.text('genix', 35, 12);
      
      pdf.setTextColor(255, 255, 255);
      pdf.text('Career Pathway Analysis', pageWidth / 2, 12, { align: 'center' });
    } else {
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.text('Skillgenix - Career Pathway Analysis', pageWidth / 2, 10, { align: 'center' });
    }
  };

  // Helper function for adding footer to each page
  const addPageFooter = (pdf: jsPDF, pageWidth: number, pageHeight: number, pageNumber: number, totalPages: number) => {
    pdf.setFillColor(65, 82, 179);
    pdf.rect(0, pageHeight - 10, pageWidth, 10, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.text('© Skillgenix - Generated with AI Career Planning Technology', pageWidth / 2, pageHeight - 4, { align: 'center' });
    
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 10, pageHeight - 4, { align: 'right' });
  };

  // Helper function to add a section title
  const addSectionTitle = (pdf: jsPDF, title: string, yPosition: number) => {
    pdf.setFontSize(14);
    pdf.setTextColor(65, 82, 179);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, 15, yPosition);
    
    // Add an underline
    pdf.setDrawColor(65, 82, 179);
    pdf.setLineWidth(0.5);
    pdf.line(15, yPosition + 1, 190, yPosition + 1);
    
    return yPosition + 10; // Return the new Y position
  };

  // Helper function to add a subsection title
  const addSubsectionTitle = (pdf: jsPDF, title: string, yPosition: number) => {
    pdf.setFontSize(12);
    pdf.setTextColor(80, 80, 80);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, 15, yPosition);
    
    return yPosition + 6; // Return the new Y position
  };

  // Helper function to add paragraph text
  const addParagraph = (pdf: jsPDF, text: string, yPosition: number, maxWidth: number = 180) => {
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    pdf.setFont('helvetica', 'normal');
    
    const splitText = pdf.splitTextToSize(text, maxWidth);
    pdf.text(splitText, 15, yPosition);
    
    return yPosition + (splitText.length * 5) + 5; // Return new Y position
  };

  // Helper function to check if we need a new page
  const checkForNewPage = (pdf: jsPDF, yPosition: number, threshold: number = 250) => {
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    if (yPosition > pageHeight - threshold) {
      pdf.addPage();
      addPageHeader(pdf, pdf.internal.pageSize.getWidth());
      return 30; // Return new Y position
    }
    
    return yPosition; // Return current Y position if no new page needed
  };

  // Generate the PDF using a more structured approach directly with jsPDF
  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      toast({
        title: 'Preparing PDF',
        description: 'We are generating your career pathway analysis PDF. This may take a moment...',
      });

      // Create a new PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Set document properties
      pdf.setProperties({
        title: 'Skillgenix Career Pathway Analysis',
        subject: 'Detailed career development analysis with personalized pathways',
        author: 'Skillgenix AI Platform',
        keywords: 'Career, AI, Professional Development, Skill Analysis, SFIA 9, DigComp 2.2, PDF Report',
        creator: 'Skillgenix Career Platform'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Title page
      addPageHeader(pdf, pageWidth, true);
      
      // Add date and user info
      const today = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      pdf.setFontSize(10);
      pdf.setTextColor(50, 50, 50);
      pdf.text(`Generated on: ${today}`, pageWidth - 15, 30, { align: 'right' });
      pdf.text(`Prepared for: ${userName}`, 15, 30);
      
      // Add title
      pdf.setFontSize(24);
      pdf.setTextColor(65, 82, 179);
      pdf.text('Career Pathway Analysis', pageWidth/2, 60, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Comprehensive Professional Development Report', pageWidth/2, 70, { align: 'center' });
      
      // Add logo/branding
      pdf.setFillColor(65, 82, 179);
      pdf.circle(pageWidth/2, 90, 15, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('S', pageWidth/2, 95, { align: 'center' });
      
      // Add description
      pdf.setFontSize(11);
      pdf.setTextColor(80, 80, 80);
      pdf.setFont('helvetica', 'normal');
      const description = 'This personalized career analysis provides a comprehensive assessment of your skills, details your career pathway options, and outlines a development plan tailored to your professional goals.';
      const splitDescription = pdf.splitTextToSize(description, pageWidth - 60);
      pdf.text(splitDescription, pageWidth/2, 120, { align: 'center' });
      
      // Add table of contents
      pdf.setFontSize(14);
      pdf.setTextColor(65, 82, 179);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Contents:', 20, 145);
      
      pdf.setFontSize(11);
      pdf.setTextColor(80, 80, 80);
      pdf.setFont('helvetica', 'normal');
      
      let contentY = 155;
      const tableOfContents = [
        '1. Executive Summary',
        '2. Framework-Based Skill Analysis',
        '3. Skill Gap Analysis',
        '4. University Pathway',
        '5. Vocational Pathway',
        '6. Development Plan',
        '7. Social Skills Development',
        '8. Similar Roles Analysis'
      ];
      
      tableOfContents.forEach(item => {
        pdf.text(item, 25, contentY);
        contentY += 8;
      });
      
      // Executive Summary
      pdf.addPage();
      addPageHeader(pdf, pageWidth);
      let yPosition = 30;
      
      yPosition = addSectionTitle(pdf, '1. Executive Summary', yPosition);
      yPosition = addParagraph(pdf, results.executiveSummary, yPosition);
      
      // Framework-Based Skill Analysis
      yPosition = checkForNewPage(pdf, yPosition, 60);
      yPosition = addSectionTitle(pdf, '2. Framework-Based Skill Analysis', yPosition);
      
      // SFIA 9 Skills
      yPosition = addSubsectionTitle(pdf, '2.1 SFIA 9 Skills', yPosition);
      
      // Create a table for SFIA 9 skills
      pdf.autoTable({
        startY: yPosition,
        head: [['Skill', 'Level', 'Description']],
        body: results.skillMapping.sfia9.map(skill => [
          skill.skill,
          skill.level,
          skill.description
        ]),
        theme: 'striped',
        headStyles: { fillColor: [65, 82, 179], textColor: 255 },
        margin: { left: 15, right: 15 },
        styles: { fontSize: 9 }
      });
      
      yPosition = (pdf as any).lastAutoTable.finalY + 10;
      
      // DigComp 2.2 Skills
      yPosition = checkForNewPage(pdf, yPosition, 60);
      yPosition = addSubsectionTitle(pdf, '2.2 DigComp 2.2 Competencies', yPosition);
      
      pdf.autoTable({
        startY: yPosition,
        head: [['Competency', 'Level', 'Description']],
        body: results.skillMapping.digcomp22.map(comp => [
          comp.competency,
          comp.level,
          comp.description
        ]),
        theme: 'striped',
        headStyles: { fillColor: [65, 82, 179], textColor: 255 },
        margin: { left: 15, right: 15 },
        styles: { fontSize: 9 }
      });
      
      yPosition = (pdf as any).lastAutoTable.finalY + 10;
      
      // Skill Gap Analysis
      yPosition = checkForNewPage(pdf, yPosition, 60);
      yPosition = addSectionTitle(pdf, '3. Skill Gap Analysis', yPosition);
      
      // Skill Gaps
      yPosition = addSubsectionTitle(pdf, '3.1 Identified Skill Gaps', yPosition);
      
      pdf.autoTable({
        startY: yPosition,
        head: [['Skill', 'Importance', 'Description']],
        body: results.skillGapAnalysis.gaps.map(gap => [
          gap.skill,
          gap.importance,
          gap.description
        ]),
        theme: 'striped',
        headStyles: { fillColor: [220, 53, 69], textColor: 255 },
        margin: { left: 15, right: 15 },
        styles: { fontSize: 9 }
      });
      
      yPosition = (pdf as any).lastAutoTable.finalY + 10;
      
      // Skill Strengths
      yPosition = checkForNewPage(pdf, yPosition, 60);
      yPosition = addSubsectionTitle(pdf, '3.2 Skill Strengths', yPosition);
      
      pdf.autoTable({
        startY: yPosition,
        head: [['Skill', 'Level', 'Relevance', 'Description']],
        body: results.skillGapAnalysis.strengths.map(strength => [
          strength.skill,
          strength.level,
          strength.relevance,
          strength.description
        ]),
        theme: 'striped',
        headStyles: { fillColor: [40, 167, 69], textColor: 255 },
        margin: { left: 15, right: 15 },
        styles: { fontSize: 9 }
      });
      
      yPosition = (pdf as any).lastAutoTable.finalY + 10;
      
      // University Pathway
      yPosition = checkForNewPage(pdf, yPosition, 60);
      yPosition = addSectionTitle(pdf, '4. University Pathway', yPosition);
      
      // Loop through steps in university pathway
      results.careerPathway.withDegree.forEach((step, index) => {
        yPosition = checkForNewPage(pdf, yPosition, 80);
        
        // Step header
        pdf.setFillColor(65, 82, 179);
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        
        // Add step number in circle
        pdf.circle(20, yPosition - 2, 5, 'F');
        pdf.text(step.step.toString(), 20, yPosition, { align: 'center' });
        
        // Add step title
        pdf.text(step.role, 30, yPosition);
        yPosition += 6;
        
        // Add timeframe
        pdf.setFontSize(9);
        pdf.setTextColor(65, 82, 179);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Timeframe: ${step.timeframe}`, 30, yPosition);
        yPosition += 6;
        
        // Add qualification if available
        if (step.requiredQualification) {
          pdf.setFontSize(9);
          pdf.setTextColor(65, 82, 179);
          pdf.text(`Qualification: ${step.requiredQualification}`, 30, yPosition);
          yPosition += 5;
        }
        
        // Add description
        pdf.setFontSize(9);
        pdf.setTextColor(60, 60, 60);
        const descriptionLines = pdf.splitTextToSize(step.description, 150);
        pdf.text(descriptionLines, 30, yPosition);
        yPosition += (descriptionLines.length * 4) + 4;
        
        // Add key skills
        pdf.setFontSize(9);
        pdf.setTextColor(80, 80, 80);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Key Skills:', 30, yPosition);
        yPosition += 5;
        
        // Format skills as bullet points
        pdf.setFont('helvetica', 'normal');
        step.keySkillsNeeded.forEach(skill => {
          pdf.text(`• ${skill}`, 35, yPosition);
          yPosition += 4;
        });
        
        yPosition += 5; // Add some spacing between steps
      });
      
      // Vocational Pathway
      yPosition = checkForNewPage(pdf, yPosition, 60);
      yPosition = addSectionTitle(pdf, '5. Vocational Pathway', yPosition);
      
      // Loop through steps in vocational pathway
      results.careerPathway.withoutDegree.forEach((step, index) => {
        yPosition = checkForNewPage(pdf, yPosition, 80);
        
        // Step header
        pdf.setFillColor(46, 139, 87); // Green for vocational
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        
        // Add step number in circle
        pdf.circle(20, yPosition - 2, 5, 'F');
        pdf.text(step.step.toString(), 20, yPosition, { align: 'center' });
        
        // Add step title
        pdf.text(step.role, 30, yPosition);
        yPosition += 6;
        
        // Add timeframe
        pdf.setFontSize(9);
        pdf.setTextColor(46, 139, 87);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Timeframe: ${step.timeframe}`, 30, yPosition);
        yPosition += 6;
        
        // Add qualification if available
        if (step.alternativeQualification) {
          pdf.setFontSize(9);
          pdf.setTextColor(46, 139, 87);
          pdf.text(`Qualification: ${step.alternativeQualification}`, 30, yPosition);
          yPosition += 5;
        }
        
        // Add description
        pdf.setFontSize(9);
        pdf.setTextColor(60, 60, 60);
        const descriptionLines = pdf.splitTextToSize(step.description, 150);
        pdf.text(descriptionLines, 30, yPosition);
        yPosition += (descriptionLines.length * 4) + 4;
        
        // Add key skills
        pdf.setFontSize(9);
        pdf.setTextColor(80, 80, 80);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Key Skills:', 30, yPosition);
        yPosition += 5;
        
        // Format skills as bullet points
        pdf.setFont('helvetica', 'normal');
        step.keySkillsNeeded.forEach(skill => {
          pdf.text(`• ${skill}`, 35, yPosition);
          yPosition += 4;
        });
        
        yPosition += 5; // Add some spacing between steps
      });
      
      // Development Plan
      yPosition = checkForNewPage(pdf, yPosition, 60);
      yPosition = addSectionTitle(pdf, '6. Development Plan', yPosition);
      
      // Skills to Acquire
      yPosition = addSubsectionTitle(pdf, '6.1 Skills to Acquire', yPosition);
      
      pdf.autoTable({
        startY: yPosition,
        head: [['Skill', 'Priority', 'Resources']],
        body: results.developmentPlan.skillsToAcquire.map(skill => [
          skill.skill,
          skill.priority,
          Array.isArray(skill.resources) ? skill.resources.join(', ') : skill.resources
        ]),
        theme: 'striped',
        headStyles: { fillColor: [65, 82, 179], textColor: 255 },
        margin: { left: 15, right: 15 },
        styles: { fontSize: 9 }
      });
      
      yPosition = (pdf as any).lastAutoTable.finalY + 10;
      
      // Recommended Certifications
      yPosition = checkForNewPage(pdf, yPosition, 60);
      yPosition = addSubsectionTitle(pdf, '6.2 Recommended Certifications', yPosition);
      
      // University Certifications
      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 80);
      pdf.setFont('helvetica', 'bold');
      pdf.text('University:', 15, yPosition);
      yPosition += 5;
      
      pdf.setFont('helvetica', 'normal');
      results.developmentPlan.recommendedCertifications.university.forEach(cert => {
        pdf.text(`• ${cert}`, 20, yPosition);
        yPosition += 4;
      });
      
      yPosition += 2;
      
      // Vocational Certifications
      pdf.setFont('helvetica', 'bold');
      pdf.text('Vocational:', 15, yPosition);
      yPosition += 5;
      
      pdf.setFont('helvetica', 'normal');
      results.developmentPlan.recommendedCertifications.vocational.forEach(cert => {
        pdf.text(`• ${cert}`, 20, yPosition);
        yPosition += 4;
      });
      
      yPosition += 2;
      
      // Online Certifications
      pdf.setFont('helvetica', 'bold');
      pdf.text('Online:', 15, yPosition);
      yPosition += 5;
      
      pdf.setFont('helvetica', 'normal');
      results.developmentPlan.recommendedCertifications.online.forEach(cert => {
        pdf.text(`• ${cert}`, 20, yPosition);
        yPosition += 4;
      });
      
      yPosition += 5;
      
      // Suggested Projects
      yPosition = checkForNewPage(pdf, yPosition, 60);
      yPosition = addSubsectionTitle(pdf, '6.3 Suggested Projects', yPosition);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      results.developmentPlan.suggestedProjects.forEach(project => {
        pdf.text(`• ${project}`, 20, yPosition);
        yPosition += 4;
      });
      
      yPosition += 5;
      
      // Learning Path
      yPosition = checkForNewPage(pdf, yPosition, 60);
      yPosition = addSubsectionTitle(pdf, '6.4 Learning Path', yPosition);
      
      pdf.setFontSize(9);
      pdf.setTextColor(60, 60, 60);
      const learningPathLines = pdf.splitTextToSize(results.developmentPlan.learningPath, 180);
      pdf.text(learningPathLines, 15, yPosition);
      yPosition += (learningPathLines.length * 4) + 10;
      
      // Add the remaining sections if they exist in the data
      
      // Social Skills
      if (results.reviewNotes && (results.reviewNotes.firstReview || results.reviewNotes.secondReview)) {
        yPosition = checkForNewPage(pdf, yPosition, 60);
        yPosition = addSectionTitle(pdf, '7. Social Skills Development', yPosition);
        
        if (results.reviewNotes.firstReview) {
          yPosition = addSubsectionTitle(pdf, '7.1 Professional Development Insights', yPosition);
          const firstReviewLines = pdf.splitTextToSize(results.reviewNotes.firstReview, 180);
          pdf.setFontSize(9);
          pdf.setTextColor(60, 60, 60);
          pdf.text(firstReviewLines, 15, yPosition);
          yPosition += (firstReviewLines.length * 4) + 5;
        }
        
        if (results.reviewNotes.secondReview) {
          yPosition = checkForNewPage(pdf, yPosition, 40);
          yPosition = addSubsectionTitle(pdf, '7.2 Additional Recommendations', yPosition);
          const secondReviewLines = pdf.splitTextToSize(results.reviewNotes.secondReview, 180);
          pdf.setFontSize(9);
          pdf.setTextColor(60, 60, 60);
          pdf.text(secondReviewLines, 15, yPosition);
          yPosition += (secondReviewLines.length * 4) + 5;
        }
      }
      
      // Add footers to all pages
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        addPageFooter(pdf, pageWidth, pageHeight, i, totalPages);
      }
      
      // Save the PDF
      pdf.save(`Skillgenix_Career_Analysis_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
      
      toast({
        title: 'PDF Created Successfully',
        description: 'Your career pathway analysis has been downloaded as a PDF.',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast({
        title: 'PDF Generation Failed',
        description: `Error: ${error?.message || 'There was an error creating your PDF. Please try again later.'}`,
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