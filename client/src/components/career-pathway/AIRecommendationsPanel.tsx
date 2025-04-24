import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BrainCircuit, LightbulbIcon, Sparkles, Target, BookOpen, GraduationCap } from 'lucide-react';
import { CareerAnalysisResult } from './CareerPathwayForm';

interface AIRecommendationsPanelProps {
  results: CareerAnalysisResult;
}

export function AIRecommendationsPanel({ results }: AIRecommendationsPanelProps) {
  // Extract AI recommendations
  const skillGapAnalysisAI = results.skillGapAnalysis?.aiAnalysis || '';
  const careerPathwayAI = results.careerPathway?.aiRecommendations || '';
  const personalizedGrowthInsights = results.developmentPlan?.personalizedGrowthInsights || '';
  
  // Function to combine and format recommendations
  const formatRecommendations = (text: string): string[] => {
    if (!text) return [];
    
    // If the text contains bullet points or numbering, split by them
    if (text.includes('•') || /\d+\./.test(text)) {
      return text
        .split(/(?:•|\d+\.)/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
    }
    
    // Otherwise, split by sentences as a fallback
    return text
      .split(/(?<=\.)\s+/)
      .map(item => item.trim())
      .filter(item => item.length > 10 && item.length < 200); // Filter out too short or too long fragments
  };
  
  // Combine and process recommendations
  const allRecommendations = [
    ...formatRecommendations(skillGapAnalysisAI),
    ...formatRecommendations(careerPathwayAI),
    ...formatRecommendations(personalizedGrowthInsights)
  ];
  
  // If no recommendations were extracted
  if (allRecommendations.length === 0) {
    return null;
  }
  
  // Display only top 6 recommendations
  const displayedRecommendations = allRecommendations.slice(0, 6);
  
  // Icon selection based on content
  const getIconForRecommendation = (text: string) => {
    text = text.toLowerCase();
    
    if (text.includes('skill') || text.includes('competency') || text.includes('ability')) {
      return <Target className="h-5 w-5 text-cyan-600" />;
    } else if (text.includes('learn') || text.includes('study') || text.includes('knowledge')) {
      return <BookOpen className="h-5 w-5 text-green-600" />;
    } else if (text.includes('certification') || text.includes('degree') || text.includes('qualification')) {
      return <GraduationCap className="h-5 w-5 text-blue-600" />;
    } else if (text.includes('career') || text.includes('pathway') || text.includes('advancement')) {
      return <Sparkles className="h-5 w-5 text-purple-600" />;
    } else {
      return <LightbulbIcon className="h-5 w-5 text-amber-600" />;
    }
  };

  return (
    <Card className="shadow-sm border-muted-foreground/20">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-4 rounded-t-lg flex items-center gap-2">
        <BrainCircuit className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">AI-Generated Career Recommendations</h3>
        <Badge variant="outline" className="ml-auto">SFIA 9 & DigComp 2.2</Badge>
      </div>
      <CardContent className="p-4">
        <div className="space-y-4">
          {displayedRecommendations.map((recommendation, index) => (
            <div key={index} className="flex gap-3 p-3 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="mt-0.5">
                {getIconForRecommendation(recommendation)}
              </div>
              <p className="text-sm text-muted-foreground">{recommendation}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}