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

    // Create a temporary clone of the section to avoid modifying the original
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = `${section.offsetWidth}px`;
    tempContainer.style.backgroundColor = 'white';
    document.body.appendChild(tempContainer);
    
    // Clone the section
    const clonedSection = section.cloneNode(true) as HTMLElement;
    clonedSection.id = `${sectionId}-clone`;
    tempContainer.appendChild(clonedSection);
    
    // Wait for animations to complete and images to load
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Prepare SVG elements for better capture
    // Convert SVGs to images for better compatibility
    const svgElements = clonedSection.querySelectorAll('svg');
    const svgPromises: Promise<void>[] = [];
    
    svgElements.forEach((svg) => {
      const svgRect = svg.getBoundingClientRect();
      
      // Skip tiny or invalid SVGs
      if (svgRect.width < 5 || svgRect.height < 5) return;
      
      const promise = new Promise<void>((resolve) => {
        try {
          // Convert SVG to data URL
          const svgData = new XMLSerializer().serializeToString(svg);
          const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
          const svgUrl = URL.createObjectURL(svgBlob);
          
          // Create image from SVG
          const img = new Image();
          img.src = svgUrl;
          
          img.onload = () => {
            try {
              // Create a canvas and draw the SVG
              const canvas = document.createElement('canvas');
              canvas.width = svgRect.width;
              canvas.height = svgRect.height;
              canvas.style.width = `${svgRect.width}px`;
              canvas.style.height = `${svgRect.height}px`;
              
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Replace SVG with canvas
                if (svg.parentNode) {
                  svg.parentNode.replaceChild(canvas, svg);
                }
              }
              
              URL.revokeObjectURL(svgUrl);
              resolve();
            } catch (e) {
              console.error("Error converting SVG to canvas:", e);
              resolve();
            }
          };
          
          img.onerror = () => {
            console.error("Error loading SVG image");
            URL.revokeObjectURL(svgUrl);
            resolve();
          };
        } catch (e) {
          console.error("Error processing SVG:", e);
          resolve();
        }
      });
      
      svgPromises.push(promise);
    });
    
    // Handle canvas elements
    const canvasElements = clonedSection.querySelectorAll('canvas');
    canvasElements.forEach((canvas) => {
      try {
        const originalCanvas = section.querySelector(`canvas[id="${canvas.id}"]`) as HTMLCanvasElement;
        if (originalCanvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(originalCanvas, 0, 0);
          }
        }
      } catch (e) {
        console.error("Error copying canvas:", e);
      }
    });
    
    // Wait for all SVG conversions to complete
    await Promise.all(svgPromises);
    
    // Process charts and make sure they're visible
    const chartContainers = clonedSection.querySelectorAll('.recharts-wrapper');
    chartContainers.forEach((container) => {
      (container as HTMLElement).style.backgroundColor = 'white';
    });

    // Use html2canvas to capture the prepared section with higher quality settings
    const canvas = await html2canvas(clonedSection, {
      scale: 3, // Increased from 2 to 3 for better quality
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: "#ffffff",
      imageTimeout: 10000, // Extended timeout for complex sections
    });
    
    // Clean up the temporary elements
    document.body.removeChild(tempContainer);
    
    return canvas;
  };

  // Add divider between sections
  const addDivider = (pdf: jsPDF, pageWidth: number, yPosition: number) => {
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.2);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
  };

  const addSectionToPage = (
    pdf: jsPDF, 
    canvas: HTMLCanvasElement, 
    pageWidth: number, 
    startY: number = 40, 
    maxHeight: number = 220
  ): number => {
    // Use PNG for better quality with charts and diagrams
    const imgData = canvas.toDataURL('image/png', 0.95);
    
    // Calculate dimensions while preserving aspect ratio
    const aspectRatio = canvas.height / canvas.width;
    const imgWidth = pageWidth - 30; // 15mm margins on each side for cleaner look
    let imgHeight = imgWidth * aspectRatio;
    
    // If image is too tall, split it across multiple pages
    if (imgHeight > maxHeight) {
      const pagesRequired = Math.ceil(imgHeight / maxHeight);
      let remainingHeight = imgHeight;
      let currentY = startY;
      let currentPage = 0;
      
      // Calculate source height per page based on aspect ratio
      const sourceHeightPerPage = canvas.height / pagesRequired;
      const destHeightPerPage = Math.min(maxHeight, imgHeight / pagesRequired);
      
      for (let i = 0; i < pagesRequired; i++) {
        // If not the first page of this section, add a new page
        if (i > 0) {
          pdf.addPage();
          addPageHeader(pdf, pageWidth);
          currentY = 40; // Reset Y position for new page
        }
        
        // Create a temporary canvas for this page segment
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Set dimensions for the temporary canvas
        tempCanvas.width = canvas.width;
        tempCanvas.height = sourceHeightPerPage;
        
        if (tempCtx) {
          // Draw the appropriate portion of the original canvas
          tempCtx.fillStyle = 'white';
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          tempCtx.drawImage(
            canvas,
            0, i * sourceHeightPerPage, // Source X, Y
            canvas.width, sourceHeightPerPage, // Source width, height
            0, 0, // Destination X, Y
            tempCanvas.width, tempCanvas.height // Destination width, height
          );
          
          // Convert this segment to image data
          const segmentImgData = tempCanvas.toDataURL('image/png', 0.95);
          
          // Calculate dimensions for this segment
          const segmentWidth = imgWidth;
          const segmentHeight = Math.min(destHeightPerPage, remainingHeight);
          
          // Center the image horizontally
          const leftMargin = (pageWidth - segmentWidth) / 2;
          
          // Add this segment to the PDF
          pdf.addImage(
            segmentImgData,
            'PNG',
            leftMargin,
            currentY,
            segmentWidth,
            segmentHeight,
            undefined,
            'FAST'
          );
          
          // Update remaining height and current Y position
          remainingHeight -= segmentHeight;
          currentY += segmentHeight + 5; // 5mm spacing
          currentPage = i;
        }
      }
      
      // Return final Y position on the last page
      return currentY + 10;
    } else {
      // For content that fits on a single page, center it horizontally
      const leftMargin = (pageWidth - imgWidth) / 2;
      
      pdf.addImage(
        imgData, 
        'PNG', 
        leftMargin, 
        startY, 
        imgWidth, 
        imgHeight,
        undefined,
        'FAST'
      );
      
      return startY + imgHeight + 10; // Return the Y position after this section
    }
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

      // Set enhanced document properties for better metadata
      pdf.setProperties({
        title: 'Skillgenix Career Pathway Analysis',
        subject: 'Detailed career development analysis with personalized pathways',
        author: 'Skillgenix AI Platform',
        keywords: 'Career, AI, Professional Development, Skill Analysis, SFIA 9, DigComp 2.2, PDF Report',
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
        {id: 'vocational-pathway', name: 'Vocational Pathway'},
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
            // Update toast with progress message for better user feedback
            toast({
              title: `Capturing ${section.name}`,
              description: `Processing section ${sectionIndex + 1} of ${sectionOrder.filter(s => elementExists(s.id)).length}`,
              variant: 'default',
            });
            
            // Capture and add section content
            const sectionCanvas = await captureSectionToCanvas(section.id);
            
            // Add section content to the PDF
            addSectionToPage(pdf, sectionCanvas, pageWidth, 35);
            
            // Add divider after section (except on the last section)
            if (sectionIndex < sectionOrder.filter(s => elementExists(s.id)).length - 1) {
              addDivider(pdf, pageWidth, pdf.internal.pageSize.getHeight() - 20);
            }
          } catch (error: any) {
            console.error(`Error capturing section ${section.id}:`, error);
            
            // Add a more informative placeholder if section can't be captured
            pdf.setFontSize(12);
            pdf.setTextColor(255, 0, 0); // red text for better visibility
            pdf.text(`Unable to capture content for ${section.name}.`, pageWidth/2, 50, { align: 'center' });
            
            pdf.setFontSize(10);
            pdf.setTextColor(100, 100, 100);
            pdf.text(`Please try again or view this section directly in the application.`, pageWidth/2, 60, { align: 'center' });
            
            // Log detailed error for troubleshooting
            console.error('PDF section capture error details:', { 
              sectionId: section.id, 
              sectionName: section.name,
              errorMessage: error?.message || 'Unknown error'
            });
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