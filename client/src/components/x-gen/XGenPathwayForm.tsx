/**
 * XGen Pathway Form Component
 * 
 * Form for collecting user career information needed for X-Gen AI career analysis.
 * Used to generate comprehensive career pathway recommendations with OpenAI integration.
 */
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation } from "wouter";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CareerAnalysisRequestData } from "../../../shared/types/reportTypes";

// Form validation schema
const formSchema = z.object({
  professionalLevel: z.string().min(2, {
    message: "Professional level must be at least 2 characters.",
  }),
  currentSkills: z.string().min(10, {
    message: "Skills should have at least 10 characters. Please provide more details.",
  }),
  educationalBackground: z.string().min(10, {
    message: "Educational background should have at least 10 characters. Please provide more details.",
  }),
  careerHistory: z.string().min(10, {
    message: "Career history should have at least 10 characters. Please provide more details.",
  }),
  desiredRole: z.string().min(2, {
    message: "Desired role must be at least 2 characters.",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }),
  country: z.string().min(2, {
    message: "Country must be at least 2 characters.",
  }),
});

interface XGenPathwayFormProps {
  onAnalysisGenerated: (result: any) => void;
  setIsLoading: (loading: boolean) => void;
}

export function XGenPathwayForm({ onAnalysisGenerated, setIsLoading }: XGenPathwayFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();

  // Initialize form with useForm hook
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      professionalLevel: "",
      currentSkills: "",
      educationalBackground: "",
      careerHistory: "",
      desiredRole: "",
      state: "",
      country: "",
    },
  });

  // Form submission handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      setIsLoading(true);
      
      // API call to backend for analysis
      const response = await fetch("/api/xgen/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values as CareerAnalysisRequestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate career analysis");
      }
      
      const data = await response.json();
      
      // Pass analysis data to parent component
      onAnalysisGenerated(data);
      
      toast({
        title: "Analysis Generated",
        description: "Your X-Gen AI career analysis has been successfully generated.",
      });
    } catch (error: any) {
      console.error("Error generating analysis:", error);
      
      toast({
        title: "Error",
        description: error.message || "Failed to generate career analysis. Please try again.",
        variant: "destructive",
      });
      
      setIsLoading(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border-primary/10">
      <CardHeader className="bg-primary/5 rounded-t-lg">
        <CardTitle className="text-2xl text-primary">X-Gen AI Career Analysis</CardTitle>
        <CardDescription>
          Enter your career information below to receive a comprehensive career analysis powered by advanced AI.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="professionalLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Level</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Entry-level, Mid-career, Senior" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Your current professional level or years of experience
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="desiredRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desired Role</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Data Scientist, Product Manager" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      The role you want to pursue in your career
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State/Province</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., California, Ontario" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Your current state or province
                    </FormDescription>
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
                        placeholder="e.g., United States, Canada" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Your current country
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="currentSkills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Skills</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="List your technical and soft skills (e.g., Python, SQL, project management, communication)" 
                      className="min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Technical and soft skills you currently possess
                  </FormDescription>
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
                      placeholder="Your degrees, certifications, and educational achievements" 
                      className="min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Your formal education, certifications, and training
                  </FormDescription>
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
                      placeholder="Brief overview of your previous roles and responsibilities" 
                      className="min-h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Summary of your work experience and previous roles
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardFooter className="flex justify-end pt-6 px-0">
              <Button 
                type="submit" 
                size="lg"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white w-full md:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Analysis...
                  </>
                ) : (
                  "Generate Career Analysis"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}