import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronDown, ChevronUp, BarChart3, Download, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SavedAnalysis {
  id: string;
  professionalLevel: string;
  desiredRole: string;
  createdAt: string;
  progress: number;
  result?: any;
}

export function SavedAnalyses() {
  const [expandedAnalysis, setExpandedAnalysis] = useState<string | null>(null);

  // Fetch saved career analyses
  const { data: analyses, isLoading, error } = useQuery({
    queryKey: ["/api/career-analyses"],
    queryFn: async () => {
      const response = await fetch("/api/career-analyses");
      if (!response.ok) {
        throw new Error("Failed to fetch saved analyses");
      }
      return response.json() as Promise<SavedAnalysis[]>;
    }
  });

  const toggleExpand = (id: string) => {
    if (expandedAnalysis === id) {
      setExpandedAnalysis(null);
    } else {
      setExpandedAnalysis(id);
    }
  };

  const viewFullAnalysis = (id: string) => {
    window.location.href = `/career-analysis/${id}`;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Unknown date";
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Saved Career Analyses
          </CardTitle>
          <CardDescription>Your previously saved career pathway analyses</CardDescription>
        </CardHeader>
        <CardContent className="h-60 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Saved Career Analyses
          </CardTitle>
          <CardDescription>Your previously saved career pathway analyses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>Failed to load saved analyses. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analyses || analyses.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-primary" />
            Saved Career Analyses
          </CardTitle>
          <CardDescription>Your previously saved career pathway analyses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>You haven't saved any career analyses yet.</p>
            <Button className="mt-4" onClick={() => window.location.href = "/career-pathway"}>
              Create Your First Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-primary" />
          Saved Career Analyses
        </CardTitle>
        <CardDescription>Your previously saved career pathway analyses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {analyses.map((analysis) => (
          <Card key={analysis.id} className="border border-muted">
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
      </CardContent>
    </Card>
  );
}