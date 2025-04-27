/**
 * X-Gen AI Career Analysis Page
 * 
 * This page provides users with an advanced AI-powered career analysis using 
 * the X-Gen system which integrates SFIA 9 and DigComp 2.2 frameworks.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

import { XGenPathwayForm } from "@/components/x-gen/XGenPathwayForm";
import { XGenAnalysisResults } from "@/components/x-gen/XGenAnalysisResults";
import { Button } from "@/components/ui/button";
import { CareerAnalysisReport, CareerAnalysisRequestData } from "../../shared/types/reportTypes";

export default function XGenPathwayPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Local state for the analysis report
  const [reportData, setReportData] = useState<{
    report: CareerAnalysisReport | null;
    requestData: CareerAnalysisRequestData | null;
  }>({
    report: null,
    requestData: null,
  });

  // Check if we have a generated report
  const hasReport = reportData.report !== null;

  // Set up the save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!reportData.report || !reportData.requestData) {
        throw new Error("No report data to save");
      }
      
      const response = await apiRequest("POST", "/api/xgen/save", {
        report: reportData.report,
        requestData: reportData.requestData,
      });
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Report Saved",
        description: "Your career analysis has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save your career analysis. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handler for when analysis is complete
  const handleAnalysisComplete = (
    report: CareerAnalysisReport,
    requestData: CareerAnalysisRequestData
  ) => {
    setReportData({
      report,
      requestData,
    });
    
    // Save to localStorage as a backup
    try {
      localStorage.setItem("xgen_latest_report", JSON.stringify({
        report,
        requestData,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error("Failed to save report to localStorage:", error);
    }
  };

  // Handler to start a new analysis
  const handleStartNewAnalysis = () => {
    setReportData({
      report: null,
      requestData: null,
    });
  };

  // Handler to save the current analysis
  const handleSaveAnalysis = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save your career analysis.",
        variant: "destructive",
      });
      return;
    }
    
    saveMutation.mutate();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="container mx-auto py-6 px-4 min-h-screen"
    >
      {/* Page Header */}
      <div className="mb-8 text-center">
        <motion.h1 
          className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-[#a31d52] mb-3"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          X-Gen AI Career Analysis
        </motion.h1>
        <motion.p 
          className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Our advanced AI analyzes your professional profile to create a comprehensive career roadmap with skill gap analysis, 
          personalized development plans, and actionable insights based on SFIA 9 and DigComp 2.2 frameworks.
        </motion.p>
      </div>

      {/* Action Buttons (only shown when a report exists) */}
      {hasReport && (
        <motion.div 
          className="mb-6 flex flex-wrap gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Button
            onClick={handleStartNewAnalysis}
            variant="outline"
            className="gap-2"
          >
            Start New Analysis
          </Button>
          
          <Button
            onClick={handleSaveAnalysis}
            className="gap-2 bg-gradient-to-r from-primary to-[#a31d52] hover:opacity-90 transition-all duration-300"
            disabled={saveMutation.isPending || !user}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Analysis</span>
              </>
            )}
          </Button>
        </motion.div>
      )}

      {/* Main Content */}
      {!hasReport ? (
        // Show form to generate a new analysis
        <XGenPathwayForm onAnalysisComplete={handleAnalysisComplete} />
      ) : (
        // Show results of the analysis
        <XGenAnalysisResults 
          report={reportData.report!} 
          requestData={reportData.requestData!} 
        />
      )}
    </motion.div>
  );
}