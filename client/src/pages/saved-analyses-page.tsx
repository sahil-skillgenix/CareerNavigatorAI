/**
 * Saved Analyses Page
 * 
 * This page displays all saved career analyses for the current user,
 * allowing them to view, download, or delete their saved reports.
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthenticatedLayout } from '@/components/layouts/AuthenticatedLayout';
import { useAuth } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { fadeIn, fadeInUp } from '@/lib/animations';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  Eye,
  FileText,
  Filter,
  Search,
  Trash2,
  Target,
  Briefcase,
  GraduationCap,
  Star,
  Calendar,
  MapPin,
  User,
  ChevronRight,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Type for saved career analysis
interface SavedAnalysis {
  userId: string;
  report: any;
  metadata: {
    targetRole: string;
    dateCreated: string;
    professionalLevel: string;
    location: string;
    currentSkills: string;
    educationalBackground: string;
    careerHistory: string;
  };
}

export default function SavedAnalysesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  // State for saved analyses
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SavedAnalysis | null>(null);
  
  // Load saved analyses from localStorage
  useEffect(() => {
    const loadSavedAnalyses = () => {
      setLoading(true);
      
      try {
        // Try to fetch from localStorage first
        const savedFromLocal = localStorage.getItem('savedCareerAnalyses');
        let analyses: SavedAnalysis[] = [];
        
        if (savedFromLocal) {
          analyses = JSON.parse(savedFromLocal);
          console.log(`Found ${analyses.length} saved analyses in localStorage`);
        }
        
        // If user is logged in, also try to fetch from API
        if (user?.id) {
          try {
            // Attempt to fetch from API - for future implementation
            // For now, we only use localStorage
          } catch (error) {
            console.error('Error fetching analyses from API:', error);
          }
        }
        
        // Filter analyses for current user
        if (user?.id) {
          analyses = analyses.filter(analysis => analysis.userId === user.id);
        }
        
        // Sort by date (newest first)
        analyses.sort((a, b) => {
          return new Date(b.metadata.dateCreated).getTime() - new Date(a.metadata.dateCreated).getTime();
        });
        
        setSavedAnalyses(analyses);
      } catch (error) {
        console.error('Error loading saved analyses:', error);
        toast({
          title: 'Error',
          description: 'Failed to load saved analyses. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedAnalyses();
  }, [user, toast]);
  
  // Delete a saved analysis
  const handleDelete = (index: number) => {
    try {
      const updatedAnalyses = [...savedAnalyses];
      updatedAnalyses.splice(index, 1);
      
      // Update localStorage
      localStorage.setItem('savedCareerAnalyses', JSON.stringify(updatedAnalyses));
      
      // Update state
      setSavedAnalyses(updatedAnalyses);
      
      toast({
        title: 'Success',
        description: 'Analysis deleted successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete analysis. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // View a saved analysis
  const handleViewAnalysis = (analysis: SavedAnalysis) => {
    setSelectedAnalysis(analysis);
  };
  
  // Download a saved analysis
  const handleDownload = (analysis: SavedAnalysis) => {
    try {
      // Create HTML content for the report
      const reportTitle = `Skillgenix Career Analysis - ${analysis.metadata.targetRole}`;
      
      // Create HTML content similar to the download function in StructuredCareerAnalysisResults.tsx
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${reportTitle}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .header {
              background: linear-gradient(to right, rgb(28, 59, 130), rgb(41, 82, 173));
              color: white;
              padding: 30px;
              border-radius: 8px;
              margin-bottom: 30px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
            }
            .header p {
              margin: 10px 0 0;
              opacity: 0.9;
            }
            /* Additional styling would be included here */
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${reportTitle}</h1>
            <p>Generated on ${format(new Date(analysis.metadata.dateCreated), 'MMMM d, yyyy')} for ${analysis.metadata.professionalLevel} professional</p>
          </div>
          
          <!-- Full report content would be generated here -->
          
          <div class="footer">
            <p>Generated by Skillgenix - The Career Pathway Platform</p>
            <p>&copy; ${new Date().getFullYear()} Skillgenix</p>
          </div>
        </body>
        </html>
      `;
      
      // Create a Blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Skillgenix_Career_Analysis_${analysis.metadata.targetRole.replace(/\s+/g, '_')}_${format(new Date(analysis.metadata.dateCreated), 'yyyy-MM-dd')}.html`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast({
        title: 'Success',
        description: 'Report downloaded successfully',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error downloading analysis:', error);
      toast({
        title: 'Error',
        description: 'Failed to download analysis. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Render a saved analysis card
  const renderAnalysisCard = (analysis: SavedAnalysis, index: number) => {
    const { report, metadata } = analysis;
    
    return (
      <motion.div
        variants={fadeInUp}
        custom={index * 0.1}
        className="w-full"
      >
        <Card className="w-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{metadata.targetRole}</CardTitle>
                <CardDescription>
                  {format(new Date(metadata.dateCreated), 'MMMM d, yyyy')}
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {metadata.professionalLevel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-sm text-muted-foreground mb-3 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {metadata.location}
            </div>
            
            {report.executiveSummary && (
              <div className="mt-3">
                <h4 className="font-medium text-sm mb-1">Executive Summary</h4>
                <p className="text-sm line-clamp-2">{report.executiveSummary.summary}</p>
              </div>
            )}
            
            {report.skillGapAnalysis && (
              <div className="flex flex-wrap mt-3 gap-1">
                {report.skillGapAnalysis.keyGaps && report.skillGapAnalysis.keyGaps.slice(0, 3).map((gap: any, i: number) => (
                  <Badge key={i} variant="outline" className="bg-red-50 text-red-600 text-xs">
                    {gap.skill}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2 flex justify-between">
            <Button variant="ghost" size="sm" onClick={() => handleViewAnalysis(analysis)}>
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDownload(analysis)}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(index)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  };
  
  // Show a modal with the selected analysis details
  const renderAnalysisDetailsModal = () => {
    if (!selectedAnalysis) return null;
    
    const { report, metadata } = selectedAnalysis;
    const { executiveSummary, skillGapAnalysis, careerPathwayOptions } = report;
    
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">{metadata.targetRole} Career Analysis</h2>
            <Button variant="ghost" size="sm" onClick={() => setSelectedAnalysis(null)}>
              &times;
            </Button>
          </div>
          
          <div className="overflow-y-auto flex-grow p-6">
            <div className="space-y-6">
              <div className="flex gap-4 flex-wrap">
                <div className="bg-primary/5 px-3 py-2 rounded-md flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm">{format(new Date(metadata.dateCreated), 'MMMM d, yyyy')}</span>
                </div>
                <div className="bg-primary/5 px-3 py-2 rounded-md flex items-center gap-1.5">
                  <User className="h-4 w-4 text-primary" />
                  <span className="text-sm">{metadata.professionalLevel}</span>
                </div>
                <div className="bg-primary/5 px-3 py-2 rounded-md flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm">{metadata.location}</span>
                </div>
              </div>
              
              <Tabs defaultValue="summary">
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="pathway">Pathway</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="summary" className="space-y-4 pt-4">
                  {executiveSummary && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
                      <div className="bg-primary/5 p-4 rounded-lg">
                        <p>{executiveSummary.summary}</p>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border rounded-lg p-3">
                          <div className="text-sm text-muted-foreground">Career Goal</div>
                          <div className="font-medium flex items-center gap-1.5 mt-1">
                            <Target className="h-4 w-4 text-primary" />
                            {executiveSummary.careerGoal}
                          </div>
                        </div>
                        
                        <div className="border rounded-lg p-3">
                          <div className="text-sm text-muted-foreground">Fit Score</div>
                          <div className="font-medium flex items-center gap-1.5 mt-1">
                            <Star className="h-4 w-4 text-amber-500" />
                            {executiveSummary.fitScore.score}/{executiveSummary.fitScore.outOf}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Key Findings</h4>
                        <ul className="space-y-1">
                          {executiveSummary.keyFindings.map((finding: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-1" />
                              <span>{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="skills" className="space-y-4 pt-4">
                  {skillGapAnalysis && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Skill Gap Analysis</h3>
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p>{skillGapAnalysis.aiAnalysis}</p>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Key Skill Gaps</h4>
                        <div className="space-y-2">
                          {skillGapAnalysis.keyGaps && skillGapAnalysis.keyGaps.map((gap: any, i: number) => (
                            <div key={i} className="border rounded-lg p-3 relative overflow-hidden">
                              <div className="absolute top-0 right-0 bottom-0 w-1" style={{
                                background: gap.priority === 'High' 
                                  ? 'rgb(239, 68, 68)' 
                                  : gap.priority === 'Medium' 
                                    ? 'rgb(245, 158, 11)' 
                                    : 'rgb(34, 197, 94)'
                              }}></div>
                              
                              <div className="flex justify-between items-center">
                                <div className="font-medium">{gap.skill}</div>
                                <Badge variant={gap.priority === 'High' 
                                  ? 'destructive' 
                                  : gap.priority === 'Medium' 
                                    ? 'default' 
                                    : 'outline'}
                                >
                                  {gap.priority} Priority
                                </Badge>
                              </div>
                              
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(gap.currentLevel / 7) * 100}%` }}></div>
                              </div>
                              
                              <div className="mt-1 text-xs flex justify-between">
                                <span>Current: {gap.currentLevel}/7</span>
                                <span>Required: {gap.requiredLevel}/7</span>
                                <span>Gap: {gap.gap}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="pathway" className="space-y-4 pt-4">
                  {careerPathwayOptions && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Career Pathway</h3>
                      <div className="bg-indigo-50 p-4 rounded-lg">
                        <p>{careerPathwayOptions.pathwayDescription}</p>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Pathway Steps</h4>
                        <div className="space-y-3">
                          {careerPathwayOptions.pathwaySteps && careerPathwayOptions.pathwaySteps.map((step: any, i: number) => (
                            <div key={i} className="relative pl-8 pb-6 last:pb-0">
                              {i < careerPathwayOptions.pathwaySteps.length - 1 && (
                                <div className="absolute top-7 bottom-0 left-3.5 border-l-2 border-dashed border-indigo-300"></div>
                              )}
                              <div className="absolute top-1 left-0 bg-indigo-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-medium">
                                {i + 1}
                              </div>
                              <div className="bg-white border border-indigo-100 rounded-lg p-3">
                                <div className="flex justify-between items-center">
                                  <div className="font-medium">{step.step}</div>
                                  <Badge variant="outline" className="bg-indigo-50 text-indigo-600">
                                    {step.timeframe}
                                  </Badge>
                                </div>
                                <p className="mt-2 text-sm">{step.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4 pt-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Professional Details</h3>
                    
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="currentSkills">
                        <AccordionTrigger>Current Skills</AccordionTrigger>
                        <AccordionContent>
                          <p className="whitespace-pre-line">{metadata.currentSkills}</p>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="educationalBackground">
                        <AccordionTrigger>Educational Background</AccordionTrigger>
                        <AccordionContent>
                          <p className="whitespace-pre-line">{metadata.educationalBackground}</p>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="careerHistory">
                        <AccordionTrigger>Career History</AccordionTrigger>
                        <AccordionContent>
                          <p className="whitespace-pre-line">{metadata.careerHistory}</p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <div className="p-4 border-t flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setSelectedAnalysis(null)}>
              Close
            </Button>
            <Button onClick={() => handleDownload(selectedAnalysis)}>
              <Download className="h-4 w-4 mr-2" />
              Download Full Report
            </Button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <AuthenticatedLayout>
      <motion.div
        className="container py-8"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Saved Career Analyses</h1>
            <p className="text-muted-foreground">View, download, or delete your saved career analyses</p>
          </div>
          <Button onClick={() => navigate('/structured-pathway')}>
            <FileText className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((_, i) => (
              <div key={i} className="h-52 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : savedAnalyses.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No saved analyses found</h2>
            <p className="text-muted-foreground mb-6">
              You haven't saved any career analyses yet. Create a new analysis to get started.
            </p>
            <Button onClick={() => navigate('/structured-pathway')}>
              Create New Analysis
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedAnalyses.map((analysis, index) => renderAnalysisCard(analysis, index))}
          </div>
        )}
        
        {selectedAnalysis && renderAnalysisDetailsModal()}
      </motion.div>
    </AuthenticatedLayout>
  );
}