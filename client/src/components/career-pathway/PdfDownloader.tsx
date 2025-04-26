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
      <Button 
        onClick={generatePDF} 
        size="lg" 
        className="bg-white text-gray-800 hover:bg-opacity-95 hover:text-gray-900 shadow-lg text-base gap-2 border-2 border-gray-200 w-full"
        disabled={isGenerating || !chartsReady}
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
            <span className="font-medium">Generating PDF...</span>
          </>
        ) : (
          <>
            <Download className="h-5 w-5 text-primary" />
            <span className="font-medium">Download PDF Report</span>
          </>
        )}
      </Button>
      
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