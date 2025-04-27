/**
 * Enhanced Structured Career Pathway Form Component
 * 
 * Collects user information and generates a structured career analysis report
 * using the OpenAI API integration.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CareerAnalysisReport } from '@shared/reportSchema';
import { StructuredCareerAnalysisResults } from './StructuredCareerAnalysisResults';
import { fadeIn, fadeInUp, staggerChildren } from '@/lib/animations';

// Define form state interface
interface FormData {
  professionalLevel: string;
  currentSkills: string;
  educationalBackground: string;
  careerHistory: string;
  desiredRole: string;
  state: string;
  country: string;
}

// Default form values
const defaultFormData: FormData = {
  professionalLevel: 'Mid-Level',
  currentSkills: 'Project management, user research, UI/UX design, team leadership, Agile methodologies, product roadmapping, stakeholder management',
  educationalBackground: 'Bachelor\'s degree in Business Administration with a concentration in Marketing, Various product management certifications',
  careerHistory: 'Product Manager for a retail tech company (3 years), UX Designer (2 years), Marketing Specialist (2 years)',
  desiredRole: 'Data Scientist',
  state: 'California',
  country: 'United States',
};

// Professional level options
const professionalLevelOptions = [
  'Entry-Level', 
  'Junior', 
  'Mid-Level', 
  'Senior', 
  'Lead', 
  'Manager', 
  'Director', 
  'Executive',
  'career-switcher', // Added to match options seen in the database
  'worker'            // Added to match options seen in the database
];

/**
 * Enhanced Form Component with real API integration
 */
export function StructuredCareerPathwayFormEnhanced() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<CareerAnalysisReport | null>(null);
  
  // Update form field
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Update select fields
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Generate career analysis report with real API call
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      // Get the JWT token from localStorage if available
      const token = localStorage.getItem('auth_token');
      
      // Make a real API call to the structured career analysis endpoint
      const response = await fetch('/api/career-pathway-analysis-structured', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      setResults(result);
      
      toast({
        title: 'Career Analysis Generated',
        description: 'Your structured career analysis report has been created successfully.',
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate your career analysis. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Reset the form and results
  const handleReset = () => {
    setResults(null);
  };
  
  // If results are available, show the results component
  if (results) {
    return (
      <StructuredCareerAnalysisResults
        results={results}
        formData={{ ...formData, userId: user?.id }}
        onRestart={handleReset}
      />
    );
  }
  
  // Otherwise show the form
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="max-w-3xl mx-auto"
    >
      <Card className="mb-6 border-none shadow-lg bg-gradient-to-r from-primary/5 to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mt-20 -mr-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full -mb-16 -ml-16"></div>
        
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary">
              ENHANCED
            </Badge>
            <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
              OpenAI Powered
            </Badge>
          </div>
          <CardTitle className="text-2xl md:text-3xl">AI Career Analysis</CardTitle>
          <CardDescription className="text-base">
            Generate a comprehensive career transition analysis using OpenAI's advanced GPT model with the standardized 11-section report format.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              variants={staggerChildren}
              initial="hidden"
              animate="visible"
              className="grid gap-6 sm:grid-cols-2"
            >
              <motion.div variants={fadeInUp} className="space-y-2">
                <Label htmlFor="professionalLevel">Professional Level</Label>
                <Select
                  value={formData.professionalLevel}
                  onValueChange={(value) => handleSelectChange('professionalLevel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    {professionalLevelOptions.map(level => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
              
              <motion.div variants={fadeInUp} className="space-y-2">
                <Label htmlFor="desiredRole">Desired Role</Label>
                <Input
                  id="desiredRole"
                  name="desiredRole"
                  value={formData.desiredRole}
                  onChange={handleChange}
                  placeholder="e.g., Data Scientist, Product Manager"
                />
              </motion.div>
              
              <motion.div variants={fadeInUp} className="space-y-2 sm:col-span-2">
                <Label htmlFor="currentSkills">Current Skills</Label>
                <Textarea
                  id="currentSkills"
                  name="currentSkills"
                  value={formData.currentSkills}
                  onChange={handleChange}
                  placeholder="List your current skills, separated by commas"
                  rows={3}
                />
              </motion.div>
              
              <motion.div variants={fadeInUp} className="space-y-2 sm:col-span-2">
                <Label htmlFor="educationalBackground">Educational Background</Label>
                <Textarea
                  id="educationalBackground"
                  name="educationalBackground"
                  value={formData.educationalBackground}
                  onChange={handleChange}
                  placeholder="Describe your educational background and any certifications"
                  rows={3}
                />
              </motion.div>
              
              <motion.div variants={fadeInUp} className="space-y-2 sm:col-span-2">
                <Label htmlFor="careerHistory">Career History</Label>
                <Textarea
                  id="careerHistory"
                  name="careerHistory"
                  value={formData.careerHistory}
                  onChange={handleChange}
                  placeholder="Briefly describe your work experience and previous roles"
                  rows={3}
                />
              </motion.div>
              
              <motion.div variants={fadeInUp} className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g., California, Ontario"
                />
              </motion.div>
              
              <motion.div variants={fadeInUp} className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="e.g., United States, Canada"
                />
              </motion.div>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="flex justify-center mt-8">
              <Button
                type="submit"
                size="lg"
                disabled={isGenerating}
                className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Career Pathway...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Analysis
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-blue-50 to-white border-none shadow-sm dark:from-slate-950 dark:to-slate-900">
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <Check className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Comprehensive Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Our AI analyzes your background against industry frameworks like SFIA 9 and DigComp 2.2.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <Check className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Personalized Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Receive detailed insights into skill gaps, development plans, and educational pathways.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-2 rounded-full">
              <Check className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Standardized Format</h3>
              <p className="text-sm text-muted-foreground">
                Results are presented in our 11-section standardized format, allowing easy comparison between analyses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}