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
        description: 'We are generating your career pathway analysis PDF...',
      });

      // Create a new jsPDF instance
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Set document properties
      pdf.setProperties({
        title: 'Career Pathway Analysis',
        subject: 'Career Development Plan',
        author: 'Skillgenix',
        creator: 'Skillgenix Platform'
      });

      // Get the content to be printed
      const contentElement = document.getElementById('career-analysis-results');
      if (!contentElement) {
        throw new Error('Content element not found');
      }

      // Set starting position
      let yPosition = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      
      // Add header
      pdf.setFillColor(65, 82, 179); // Primary blue color
      pdf.rect(0, 0, pageWidth, 15, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.text('Skillgenix - Career Pathway Analysis', pageWidth / 2, 10, { align: 'center' });
      
      // Add date
      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(10);
      const today = new Date().toLocaleDateString('en-AU', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      pdf.text(`Generated on: ${today}`, pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 10;
      
      // Add user name
      pdf.setTextColor(50, 50, 50);
      pdf.setFontSize(12);
      pdf.text(`Prepared for: ${userName}`, margin, yPosition);
      yPosition += 10;
      
      // Add title
      pdf.setTextColor(65, 82, 179);
      pdf.setFontSize(16);
      pdf.text('Career Pathway Analysis', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
      
      // Add executive summary
      pdf.setTextColor(50, 50, 50);
      pdf.setFontSize(14);
      pdf.text('Executive Summary', margin, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(11);
      const splitSummary = pdf.splitTextToSize(results.executiveSummary, contentWidth);
      pdf.text(splitSummary, margin, yPosition);
      yPosition += splitSummary.length * 6 + 10;
      
      // Check if we need a new page
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Add skill mapping section
      pdf.setTextColor(65, 82, 179);
      pdf.setFontSize(14);
      pdf.text('Framework-Based Skill Analysis', margin, yPosition);
      yPosition += 7;
      
      // Add SFIA skills
      pdf.setTextColor(50, 50, 50);
      pdf.setFontSize(12);
      pdf.text('SFIA 9 Skills', margin, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(10);
      results.skillMapping.sfia9.forEach((skill, index) => {
        // Check if we need a new page
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const skillText = `• ${skill.skill} (Level: ${skill.level})`;
        pdf.text(skillText, margin, yPosition);
        yPosition += 5;
        
        const splitDesc = pdf.splitTextToSize(skill.description, contentWidth - 5);
        pdf.setTextColor(100, 100, 100);
        pdf.text(splitDesc, margin + 5, yPosition);
        pdf.setTextColor(50, 50, 50);
        yPosition += splitDesc.length * 5 + 3;
      });
      
      yPosition += 5;
      
      // Check if we need a new page
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Add DigComp skills
      pdf.setFontSize(12);
      pdf.text('DigComp 2.2 Competencies', margin, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(10);
      results.skillMapping.digcomp22.forEach((skill, index) => {
        // Check if we need a new page
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const skillText = `• ${skill.competency} (Level: ${skill.level})`;
        pdf.text(skillText, margin, yPosition);
        yPosition += 5;
        
        const splitDesc = pdf.splitTextToSize(skill.description, contentWidth - 5);
        pdf.setTextColor(100, 100, 100);
        pdf.text(splitDesc, margin + 5, yPosition);
        pdf.setTextColor(50, 50, 50);
        yPosition += splitDesc.length * 5 + 3;
      });
      
      yPosition += 5;
      
      // Add a new page for Skill Gap Analysis
      pdf.addPage();
      yPosition = 20;
      
      // Add skill gap analysis
      pdf.setTextColor(65, 82, 179);
      pdf.setFontSize(14);
      pdf.text('Skill Gap Analysis', margin, yPosition);
      yPosition += 7;
      
      // Add gaps
      pdf.setTextColor(50, 50, 50);
      pdf.setFontSize(12);
      pdf.text('Skills Gaps', margin, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(10);
      results.skillGapAnalysis.gaps.forEach((gap, index) => {
        // Check if we need a new page
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const gapText = `• ${gap.skill} (Importance: ${gap.importance})`;
        pdf.text(gapText, margin, yPosition);
        yPosition += 5;
        
        const splitDesc = pdf.splitTextToSize(gap.description, contentWidth - 5);
        pdf.setTextColor(100, 100, 100);
        pdf.text(splitDesc, margin + 5, yPosition);
        pdf.setTextColor(50, 50, 50);
        yPosition += splitDesc.length * 5 + 3;
      });
      
      yPosition += 5;
      
      // Check if we need a new page
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Add strengths
      pdf.setFontSize(12);
      pdf.text('Existing Strengths', margin, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(10);
      results.skillGapAnalysis.strengths.forEach((strength, index) => {
        // Check if we need a new page
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const strengthText = `• ${strength.skill} (Level: ${strength.level}, Relevance: ${strength.relevance})`;
        pdf.text(strengthText, margin, yPosition);
        yPosition += 5;
        
        const splitDesc = pdf.splitTextToSize(strength.description, contentWidth - 5);
        pdf.setTextColor(100, 100, 100);
        pdf.text(splitDesc, margin + 5, yPosition);
        pdf.setTextColor(50, 50, 50);
        yPosition += splitDesc.length * 5 + 3;
      });
      
      // Add a new page for Career Pathway
      pdf.addPage();
      yPosition = 20;
      
      // Add career pathway section
      pdf.setTextColor(65, 82, 179);
      pdf.setFontSize(14);
      pdf.text('Career Pathway Options', margin, yPosition);
      yPosition += 7;
      
      // Add with degree pathway
      pdf.setTextColor(50, 50, 50);
      pdf.setFontSize(12);
      pdf.text('University Degree Pathway', margin, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(10);
      results.careerPathway.withDegree.forEach((step, index) => {
        // Check if we need a new page
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setTextColor(65, 82, 179);
        const stepTitle = `Step ${step.step}: ${step.role}`;
        pdf.text(stepTitle, margin, yPosition);
        yPosition += 5;
        
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Timeframe: ${step.timeframe}`, margin + 5, yPosition);
        yPosition += 5;
        
        if (step.requiredQualification) {
          pdf.text(`Required Qualification: ${step.requiredQualification}`, margin + 5, yPosition);
          yPosition += 5;
        }
        
        pdf.text('Key Skills Needed:', margin + 5, yPosition);
        yPosition += 5;
        
        step.keySkillsNeeded.forEach(skill => {
          pdf.text(`  • ${skill}`, margin + 10, yPosition);
          yPosition += 5;
        });
        
        const splitDesc = pdf.splitTextToSize(step.description, contentWidth - 5);
        pdf.text(splitDesc, margin + 5, yPosition);
        yPosition += splitDesc.length * 5 + 8;
        
        pdf.setTextColor(50, 50, 50);
      });
      
      // Add a new page for non-degree pathway
      pdf.addPage();
      yPosition = 20;
      
      // Add without degree pathway
      pdf.setTextColor(50, 50, 50);
      pdf.setFontSize(12);
      pdf.text('TAFE/Industry Certification Pathway', margin, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(10);
      results.careerPathway.withoutDegree.forEach((step, index) => {
        // Check if we need a new page
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setTextColor(65, 82, 179);
        const stepTitle = `Step ${step.step}: ${step.role}`;
        pdf.text(stepTitle, margin, yPosition);
        yPosition += 5;
        
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Timeframe: ${step.timeframe}`, margin + 5, yPosition);
        yPosition += 5;
        
        if (step.alternativeQualification) {
          pdf.text(`Alternative Qualification: ${step.alternativeQualification}`, margin + 5, yPosition);
          yPosition += 5;
        }
        
        pdf.text('Key Skills Needed:', margin + 5, yPosition);
        yPosition += 5;
        
        step.keySkillsNeeded.forEach(skill => {
          pdf.text(`  • ${skill}`, margin + 10, yPosition);
          yPosition += 5;
        });
        
        const splitDesc = pdf.splitTextToSize(step.description, contentWidth - 5);
        pdf.text(splitDesc, margin + 5, yPosition);
        yPosition += splitDesc.length * 5 + 8;
        
        pdf.setTextColor(50, 50, 50);
      });
      
      // Add a new page for Development Plan
      pdf.addPage();
      yPosition = 20;
      
      // Add development plan section
      pdf.setTextColor(65, 82, 179);
      pdf.setFontSize(14);
      pdf.text('Development Plan', margin, yPosition);
      yPosition += 10;
      
      // Add skills to acquire
      pdf.setTextColor(50, 50, 50);
      pdf.setFontSize(12);
      pdf.text('Skills To Acquire', margin, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(10);
      results.developmentPlan.skillsToAcquire.forEach((skill, index) => {
        // Check if we need a new page
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const skillText = `• ${skill.skill} (Priority: ${skill.priority})`;
        pdf.text(skillText, margin, yPosition);
        yPosition += 5;
        
        pdf.setTextColor(100, 100, 100);
        pdf.text('Resources:', margin + 5, yPosition);
        yPosition += 5;
        
        skill.resources.forEach(resource => {
          // Check if we need a new page
          if (yPosition > 280) {
            pdf.addPage();
            yPosition = 20;
          }
          
          const splitResource = pdf.splitTextToSize(`- ${resource}`, contentWidth - 10);
          pdf.text(splitResource, margin + 10, yPosition);
          yPosition += splitResource.length * 5;
        });
        
        pdf.setTextColor(50, 50, 50);
        yPosition += 3;
      });
      
      // Check if we need a new page
      if (yPosition > 220) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Add recommended certifications
      pdf.setFontSize(12);
      pdf.text('Recommended Certifications', margin, yPosition);
      yPosition += 7;
      
      // University certifications
      pdf.setFontSize(10);
      pdf.text('University Programs:', margin + 5, yPosition);
      yPosition += 5;
      
      results.developmentPlan.recommendedCertifications.university.forEach(cert => {
        // Check if we need a new page
        if (yPosition > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const splitCert = pdf.splitTextToSize(`• ${cert}`, contentWidth - 10);
        pdf.text(splitCert, margin + 10, yPosition);
        yPosition += splitCert.length * 5;
      });
      
      yPosition += 3;
      
      // TAFE certifications
      pdf.text('TAFE Programs:', margin + 5, yPosition);
      yPosition += 5;
      
      results.developmentPlan.recommendedCertifications.tafe.forEach(cert => {
        // Check if we need a new page
        if (yPosition > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const splitCert = pdf.splitTextToSize(`• ${cert}`, contentWidth - 10);
        pdf.text(splitCert, margin + 10, yPosition);
        yPosition += splitCert.length * 5;
      });
      
      yPosition += 3;
      
      // Online certifications
      pdf.text('Online Programs:', margin + 5, yPosition);
      yPosition += 5;
      
      results.developmentPlan.recommendedCertifications.online.forEach(cert => {
        // Check if we need a new page
        if (yPosition > 280) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const splitCert = pdf.splitTextToSize(`• ${cert}`, contentWidth - 10);
        pdf.text(splitCert, margin + 10, yPosition);
        yPosition += splitCert.length * 5;
      });
      
      // Check if we need a new page
      if (yPosition > 220) {
        pdf.addPage();
        yPosition = 20;
      } else {
        yPosition += 10;
      }
      
      // Add suggested projects
      pdf.setFontSize(12);
      pdf.text('Suggested Projects', margin, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(10);
      results.developmentPlan.suggestedProjects.forEach((project, index) => {
        // Check if we need a new page
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const splitProject = pdf.splitTextToSize(`• ${project}`, contentWidth - 5);
        pdf.text(splitProject, margin + 5, yPosition);
        yPosition += splitProject.length * 5 + 2;
      });
      
      // Add learning path
      if (yPosition > 220) {
        pdf.addPage();
        yPosition = 20;
      } else {
        yPosition += 10;
      }
      
      pdf.setFontSize(12);
      pdf.text('Learning Path', margin, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(10);
      const splitLearningPath = pdf.splitTextToSize(results.developmentPlan.learningPath, contentWidth - 5);
      pdf.text(splitLearningPath, margin + 5, yPosition);
      
      // Add footer to all pages
      const pageCount = (pdf as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`Skillgenix Career Analysis - Page ${i} of ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
      }
      
      // Save the PDF
      pdf.save(`Career_Pathway_Analysis_${userName.replace(/\s+/g, '_')}.pdf`);
      
      toast({
        title: 'PDF Generated',
        description: 'Your career pathway analysis PDF has been downloaded.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'PDF Generation Failed',
        description: 'There was an error generating your PDF. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generatePDF} 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-1"
      disabled={isGenerating}
    >
      <Download className="h-4 w-4" />
      {isGenerating ? 'Generating...' : 'Download PDF'}
    </Button>
  );
}