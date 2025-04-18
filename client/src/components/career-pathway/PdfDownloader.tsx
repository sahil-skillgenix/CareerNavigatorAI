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

    // Wait for animations to complete and images to load
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Special handling for sections with charts and graphics
    const hasCanvas = section.querySelectorAll('canvas').length > 0;
    const hasSvg = section.querySelectorAll('svg').length > 0;
    
    return html2canvas(section, {
      scale: scale,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: "#ffffff",
      // Higher quality rendering for sections with graphics
      imageTimeout: 5000, // increase timeout for image loading
      // Use foreign objects for SVG elements
      foreignObjectRendering: hasSvg,
      // Ensure canvas elements are captured properly
      onclone: (clonedDoc) => {
        if (hasCanvas) {
          const sourceCanvases = section.querySelectorAll('canvas');
          const clonedCanvases = clonedDoc.getElementById(sectionId)?.querySelectorAll('canvas');
          
          if (sourceCanvases && clonedCanvases) {
            for (let i = 0; i < sourceCanvases.length; i++) {
              if (i < clonedCanvases.length) {
                const context = clonedCanvases[i].getContext('2d');
                if (context) {
                  context.drawImage(sourceCanvases[i], 0, 0);
                }
              }
            }
          }
        }
      }
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
      
      // First page - Title page with logo and summary
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
      
      // First, get all section IDs to ensure we're capturing everything
      const sectionOrder = [
        {id: 'executive-summary', name: 'Executive Summary'},
        {id: 'framework-analysis', name: 'Framework-Based Skill Analysis'},
        {id: 'skill-gap-analysis', name: 'Skill Gap Analysis'},
        {id: 'university-pathway', name: 'University Pathway'},
        {id: 'tafe-pathway', name: 'TAFE Pathway'},
        {id: 'development-plan', name: 'Development Plan'},
        {id: 'social-skills', name: 'Social Skills Development'},
        {id: 'similar-roles', name: 'Similar Roles'}
      ];

      // Function to check if element exists in DOM
      const elementExists = (id: string) => document.getElementById(id) !== null;
      
      // Add title page
      pdf.setFontSize(24);
      pdf.setTextColor(65, 82, 179);
      pdf.text('Career Pathway Analysis', pageWidth/2, 60, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Comprehensive Professional Development Report', pageWidth/2, 70, { align: 'center' });
      
      // Add Skillgenix logo/branding
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
      sectionOrder.forEach((section, index) => {
        if (elementExists(section.id)) {
          pdf.text(`${index + 1}. ${section.name}`, 25, contentY);
          contentY += 8;
        }
      });
      
      // Process each section and add to PDF
      let sectionIndex = 0;
      for (const section of sectionOrder) {
        if (elementExists(section.id)) {
          // Add new page for each section (except first one)
          if (sectionIndex > 0) {
            pdf.addPage();
          } else {
            // First content section starts on page 2
            pdf.addPage();
          }
          
          // Add header
          addPageHeader(pdf, pageWidth);
          
          // Add section title
          pdf.setFontSize(16);
          pdf.setTextColor(65, 82, 179);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${sectionIndex + 1}. ${section.name}`, 10, 25);
          
          try {
            // Capture and add section content
            const sectionCanvas = await captureSectionToCanvas(section.id);
            addSectionToPage(pdf, sectionCanvas, pageWidth, 35);
          } catch (error) {
            console.error(`Error capturing section ${section.id}:`, error);
            
            // Add a placeholder if section can't be captured
            pdf.setFontSize(12);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`[Content for ${section.name} could not be captured]`, pageWidth/2, 50, { align: 'center' });
          }
          
          sectionIndex++;
        }
      }
      
      // Add footer to all pages
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        addPageFooter(pdf, pageWidth, pageHeight);
        
        // Add page numbers
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth/2, pageHeight - 15, { align: 'center' });
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