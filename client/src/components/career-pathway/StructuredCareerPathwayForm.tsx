/**
 * Structured Career Pathway Form
 * 
 * This component provides a form for submitting career information
 * that will be analyzed using the structured report format.
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CareerAnalysisReport } from '../../../shared/reportSchema';
import { StructuredCareerAnalysisResults } from './StructuredCareerAnalysisResults';

// Define form schema with Zod
const formSchema = z.object({
  professionalLevel: z.string().min(1, 'Please select your professional level'),
  currentSkills: z.string().min(10, 'Please describe your current skills in more detail'),
  educationalBackground: z.string().min(10, 'Please provide more details about your education'),
  careerHistory: z.string().min(10, 'Please provide more details about your career history'),
  desiredRole: z.string().min(3, 'Please specify your desired role'),
  state: z.string().optional(),
  country: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function StructuredCareerPathwayForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CareerAnalysisReport | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      professionalLevel: '',
      currentSkills: '',
      educationalBackground: '',
      careerHistory: '',
      desiredRole: '',
      state: '',
      country: '',
    },
  });

  const handleReset = () => {
    setResults(null);
    setFormData(null);
    setError(null);
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    setError(null);
    setFormData(data);

    try {
      // Call the structured API endpoint
      const response = await fetch('/api/career-pathway-analysis-structured', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          userId: user?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate career analysis');
      }

      const result = await response.json();
      setResults(result);
      
      toast({
        title: 'Analysis Complete',
        description: 'Your career pathway analysis has been generated successfully.',
        variant: 'default',
      });
    } catch (err: any) {
      console.error('Error generating career analysis:', err);
      setError(err.message || 'Failed to generate career analysis. Please try again.');
      
      toast({
        title: 'Analysis Failed',
        description: err.message || 'Failed to generate career analysis. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If we have results, show them instead of the form
  if (results && formData) {
    return (
      <StructuredCareerAnalysisResults 
        results={results} 
        formData={formData} 
        onRestart={handleReset} 
      />
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container mx-auto py-6"
    >
      <Card className="w-full shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle>Structured Career Pathway Analysis</CardTitle>
          </div>
          <CardDescription>
            Get a comprehensive career pathway analysis with our structured format including all 11 essential sections.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basics" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basics">Career Details</TabsTrigger>
                  <TabsTrigger value="location">Location (Optional)</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basics" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="professionalLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Level</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your professional level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Entry Level">Entry Level</SelectItem>
                            <SelectItem value="Junior">Junior</SelectItem>
                            <SelectItem value="Mid Level">Mid Level</SelectItem>
                            <SelectItem value="Senior">Senior</SelectItem>
                            <SelectItem value="Lead">Lead</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Director">Director</SelectItem>
                            <SelectItem value="Executive">Executive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentSkills"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Skills</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your current skills and proficiencies. Be as detailed as possible."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="educationalBackground"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Educational Background</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your educational background including degrees, certifications, etc."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="careerHistory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Career History</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your career history, including roles, companies, and key responsibilities."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="desiredRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desired Role or Career Goal</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="What role or career would you like to pursue?"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                
                <TabsContent value="location" className="space-y-4 pt-4">
                  <div className="flex items-center mb-4">
                    <Badge variant="outline" className="mr-2">Optional</Badge>
                    <p className="text-sm text-muted-foreground">
                      Location information helps with region-specific recommendations.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your state or province (optional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Your country (optional)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <Separator className="my-4" />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={isLoading}
                >
                  Reset
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Pathway
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}