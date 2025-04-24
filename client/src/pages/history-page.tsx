import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AuthenticatedLayout } from "@/components/layouts";
import { History } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Clock, Download } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface SavedAnalysis {
  id: string;
  professionalLevel: string;
  desiredRole: string;
  createdAt: string;
  progress: number;
  result?: any;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      return response.json();
    }
  });
  
  // Extract analyses from dashboard data
  const analyses = dashboardData?.careerAnalyses || [];
  
  // Function to refresh dashboard data
  const refreshAnalyses = async () => {
    try {
      toast({
        title: "Refreshing data...",
        description: "Getting your saved analyses",
        variant: "default",
      });
      
      await refetch();
      
      toast({
        title: "Data refreshed",
        description: `Found ${analyses.length} saved analyses`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not refresh analysis data",
        variant: "destructive",
      });
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedAnalysis === id) {
      setExpandedAnalysis(null);
    } else {
      setExpandedAnalysis(id);
    }
  };

  const viewFullAnalysis = (id: string) => {
    window.open(`/career-analysis/${id}`, '_blank');
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Unknown date";
    }
  };

  return (
    <AuthenticatedLayout title="Analysis History" subtitle="Your previously saved career pathway analyses">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-muted-foreground">Failed to load saved analyses. Please try again later.</p>
                <Button onClick={refreshAnalyses} className="mt-4">Try Again</Button>
              </div>
            </CardContent>
          </Card>
        ) : analyses.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <p className="text-muted-foreground">You haven't saved any career analyses yet.</p>
                <Button className="mt-4" onClick={() => window.location.href = "/career-pathway"}>
                  Create Your First Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {analyses.map((analysis: SavedAnalysis) => (
              <Card key={analysis.id} className="border border-muted shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{analysis.desiredRole}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(analysis.createdAt)}
                      </CardDescription>
                    </div>
                    <Badge variant={analysis.progress === 100 ? "default" : "outline"}>
                      {analysis.progress === 100 ? "Complete" : `${analysis.progress}%`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-2">
                  <p className="text-sm text-muted-foreground mb-1">Professional Level: {analysis.professionalLevel}</p>
                  
                  {expandedAnalysis === analysis.id && analysis.result && (
                    <div className="mt-4 space-y-3 text-sm">
                      {analysis.result.executiveSummary && (
                        <div>
                          <p className="font-medium">Executive Summary:</p>
                          <p className="text-muted-foreground">{analysis.result.executiveSummary}</p>
                        </div>
                      )}
                      
                      {analysis.result.skillGapAnalysis?.aiAnalysis && (
                        <div>
                          <p className="font-medium">Skill Gap Analysis:</p>
                          <p className="text-muted-foreground">{analysis.result.skillGapAnalysis.aiAnalysis}</p>
                        </div>
                      )}
                      
                      {analysis.result.careerPathway?.aiRecommendations && (
                        <div>
                          <p className="font-medium">Career Pathway:</p>
                          <p className="text-muted-foreground">{analysis.result.careerPathway.aiRecommendations}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleExpand(analysis.id)}
                  >
                    {expandedAnalysis === analysis.id ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-1" /> Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-1" /> Show More
                      </>
                    )}
                  </Button>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => viewFullAnalysis(analysis.id)}
                    >
                      View Full Analysis
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      className="px-2"
                      onClick={() => window.open(`/api/career-analyses/${analysis.id}/pdf`, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </motion.div>
    </AuthenticatedLayout>
  );
}