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

  const generatePDF = async () => {
    try {
      setIsGenerating(true);
      toast({
        title: 'Preparing PDF',
        description: 'We are generating your career pathway analysis PDF. This may take a moment...',
      });

      // Get the content to be printed
      const contentElement = document.getElementById('career-analysis-results');
      if (!contentElement) {
        throw new Error('Content element not found');
      }

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

      // Use html2canvas to capture the entire content with styling
      const scale = 2; // Higher scale for better quality
      const canvas = await html2canvas(contentElement, {
        scale: scale,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#ffffff",
        windowWidth: 1200, // Fixed width for consistency
        onclone: (clonedDoc) => {
          // Add print-specific styling to the cloned document
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            * { box-sizing: border-box; }
            body { background: white !important; }
            .pdf-page-break { page-break-after: always; }
          `;
          clonedDoc.head.appendChild(style);
          
          // Mark page breaks for main sections
          const sections = clonedDoc.querySelectorAll('.mb-12');
          sections.forEach(section => {
            if (section.nextElementSibling && section.nextElementSibling.classList.contains('mb-12')) {
              section.classList.add('pdf-page-break');
            }
          });
        }
      });

      // Canvas dimensions
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add header to first page
      pdf.setFillColor(65, 82, 179); // Primary blue color
      pdf.rect(0, 0, pageWidth, 20, 'F');
      
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
      
      // Calculate dimensions for fitting canvas to PDF
      const canvasRatio = canvas.height / canvas.width;
      const usablePageHeight = pageHeight - 40; // Account for header and margins
      
      // How many pages we need based on the content height
      const totalSlices = Math.ceil((canvas.height * (pageWidth / canvas.width)) / usablePageHeight);
      
      for (let i = 0; i < totalSlices; i++) {
        // First page starts after header (40mm from top)
        const yPos = i === 0 ? 40 : 10;
        
        // Height to use from source canvas for this page
        const sourceY = i * (canvas.width * (usablePageHeight / pageWidth));
        const sliceHeight = Math.min(
          canvas.width * (usablePageHeight / pageWidth),
          canvas.height - sourceY
        );
        
        // Calculate the destination height for this slice
        const destHeight = (sliceHeight * pageWidth) / canvas.width;
        
        // Add this slice of the canvas to the PDF
        pdf.addImage(
          imgData,
          'JPEG',
          0, // x position - full width
          yPos, // y position
          pageWidth, // width (full page width)
          destHeight, // proportional height
          '', // alias
          'MEDIUM', // compression
          0, // rotation
          sourceY, // source Y (cropping start)
          canvas.width, // source width
          sliceHeight // source height (cropping height)
        );
        
        // Add new page if needed
        if (i < totalSlices - 1) {
          pdf.addPage();
          
          // Add header to subsequent pages
          pdf.setFillColor(65, 82, 179);
          pdf.rect(0, 0, pageWidth, 15, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(12);
          pdf.text('Skillgenix - Career Pathway Analysis', pageWidth / 2, 10, { align: 'center' });
        }
      }
      
      // Add footer
      pdf.setFillColor(65, 82, 179);
      pdf.rect(0, pageHeight - 10, pageWidth, 10, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text('© Skillgenix - Generated with AI Career Planning Technology', pageWidth / 2, pageHeight - 4, { align: 'center' });

      // Save the PDF
      pdf.save(`Skillgenix_Career_Analysis_${userName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`);
      
      toast({
        title: 'PDF Created Successfully',
        description: 'Your career pathway analysis has been downloaded as a PDF.',
        variant: 'success',
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