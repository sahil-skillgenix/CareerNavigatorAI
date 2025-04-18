import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CareerAnalysisResult } from './CareerPathwayForm';
import type { jsPDF as jsPDFType } from 'jspdf';

interface PdfDownloaderProps {
  results: CareerAnalysisResult;
  userName?: string;
}

export function PdfDownloader({ results, userName = 'User' }: PdfDownloaderProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const addPageHeader = (pdf: jsPDF, pageWidth: number, isFirstPage: boolean = false) => {
    // Header height is taller on first page
    const headerHeight = isFirstPage ? 20 : 15;
    
    pdf.setFillColor(65, 82, 179);
    pdf.rect(0, 0, pageWidth, headerHeight, 'F');
    
    if (isFirstPage) {
      // Add Skillgenix text logo
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Skill', 20, 12);
      pdf.setTextColor(220, 220, 255);
      pdf.text('genix', 35, 12);
      
      // Add title
      pdf.setTextColor(255, 255, 255);
      pdf.text('Career Pathway Analysis', pageWidth / 2, 12, { align: 'center' });
    } else {
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(12);
      pdf.text('Skillgenix - Career Pathway Analysis', pageWidth / 2, 10, { align: 'center' });
    }
  };

  const addPageFooter = (pdf: jsPDF, pageWidth: number, pageHeight: number) => {
    pdf.setFillColor(65, 82, 179);
    pdf.rect(0, pageHeight - 10, pageWidth, 10, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.text('© Skillgenix - Generated with AI Career Planning Technology', pageWidth / 2, pageHeight - 4, { align: 'center' });
  };

  const captureSectionToCanvas = async (sectionId: string, scale: number = 2): Promise<HTMLCanvasElement> => {
    const section = document.getElementById(sectionId);
    if (!section) {
      throw new Error(`Section not found: ${sectionId}`);
    }

    return html2canvas(section, {
      scale: scale,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });
  };

  const addSectionToPage = (
    pdf: jsPDF, 
    canvas: HTMLCanvasElement, 
    pageWidth: number, 
    startY: number = 40, 
    maxHeight: number = 220
  ): number => {
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
    // Calculate dimensions while preserving aspect ratio
    const aspectRatio = canvas.height / canvas.width;
    const imgWidth = pageWidth - 20; // 10mm margins on each side
    let imgHeight = imgWidth * aspectRatio;
    
    // If image is too tall, scale it down to fit the page
    if (imgHeight > maxHeight) {
      imgHeight = maxHeight;
      // Recalculate width to maintain aspect ratio
      const newWidth = imgHeight / aspectRatio;
      // Center the image
      const leftMargin = (pageWidth - newWidth) / 2;
      
      pdf.addImage(
        imgData, 
        'JPEG', 
        leftMargin, 
        startY, 
        newWidth, 
        imgHeight
      );
    } else {
      // Center the image horizontally
      const leftMargin = (pageWidth - imgWidth) / 2;
      pdf.addImage(
        imgData, 
        'JPEG', 
        leftMargin, 
        startY, 
        imgWidth, 
        imgHeight
      );
    }
    
    return startY + imgHeight + 10; // Return the Y position after this section
  };

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      toast({
        title: 'Preparing PDF',
        description: 'We are generating your career pathway analysis PDF. This may take a moment...',
      });

      // Create a new jsPDF instance
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Set document properties
      pdf.setProperties({
        title: 'Skillgenix Career Pathway Analysis',
        subject: 'Professional Career Development Plan',
        author: 'Skillgenix',
        creator: 'Skillgenix Career Platform'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // First page - Executive Summary
      addPageHeader(pdf, pageWidth, true);
      
      // Add date and user info
      const today = new Date().toLocaleDateString('en-AU', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      pdf.setFontSize(10);
      pdf.setTextColor(50, 50, 50);
      pdf.text(`Generated on: ${today}`, pageWidth - 10, 30, { align: 'right' });
      pdf.text(`Prepared for: ${userName}`, 10, 30);
      
      // Get each section individually for better quality and control
      // Executive Summary
      const executiveSummaryCanvas = await captureSectionToCanvas('executive-summary');
      const yAfterSummary = addSectionToPage(pdf, executiveSummaryCanvas, pageWidth, 40);
      
      // Framework-Based Skill Analysis
      pdf.addPage();
      addPageHeader(pdf, pageWidth);
      const frameworkAnalysisCanvas = await captureSectionToCanvas('framework-analysis');
      addSectionToPage(pdf, frameworkAnalysisCanvas, pageWidth, 20);
      
      // Skill Gap Analysis
      pdf.addPage();
      addPageHeader(pdf, pageWidth);
      const skillGapCanvas = await captureSectionToCanvas('skill-gap-analysis');
      addSectionToPage(pdf, skillGapCanvas, pageWidth, 20);
      
      // Career Pathway University
      pdf.addPage();
      addPageHeader(pdf, pageWidth);
      const universityPathCanvas = await captureSectionToCanvas('university-pathway');
      addSectionToPage(pdf, universityPathCanvas, pageWidth, 20);
      
      // Career Pathway TAFE
      pdf.addPage();
      addPageHeader(pdf, pageWidth);
      const tafePathCanvas = await captureSectionToCanvas('tafe-pathway');
      addSectionToPage(pdf, tafePathCanvas, pageWidth, 20);
      
      // Development Plan
      pdf.addPage();
      addPageHeader(pdf, pageWidth);
      const developmentPlanCanvas = await captureSectionToCanvas('development-plan');
      addSectionToPage(pdf, developmentPlanCanvas, pageWidth, 20);
      
      // Social Skills Development
      pdf.addPage();
      addPageHeader(pdf, pageWidth);
      const socialSkillsCanvas = await captureSectionToCanvas('social-skills');
      addSectionToPage(pdf, socialSkillsCanvas, pageWidth, 20);
      
      // Similar Roles
      pdf.addPage();
      addPageHeader(pdf, pageWidth);
      const similarRolesCanvas = await captureSectionToCanvas('similar-roles');
      addSectionToPage(pdf, similarRolesCanvas, pageWidth, 20);
      
      // Add footer to all pages
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        addPageFooter(pdf, pageWidth, pageHeight);
      }

      // Save the PDF
      pdf.save(`Skillgenix_Career_Analysis_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
      
      toast({
        title: 'PDF Created Successfully',
        description: 'Your career pathway analysis has been downloaded as a PDF.',
        variant: 'default',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'PDF Generation Failed',
        description: 'There was an error creating your PDF. Please try again later.',
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
      className="bg-white text-gray-800 hover:bg-opacity-95 hover:text-gray-900 shadow-lg text-base gap-2"
      disabled={isGenerating}
    >
      <Download className="h-5 w-5" />
      {isGenerating ? 'Generating PDF...' : 'Download PDF Analysis'}
    </Button>
  );
}