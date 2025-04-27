/**
 * X-Gen AI Career Analysis Form Component
 * 
 * This component provides a futuristic and professional form interface for users
 * to enter their career information for X-Gen AI analysis.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CareerAnalysisReport, CareerAnalysisRequestData } from "../../../shared/types/reportTypes";

// Define the form schema with validation
const formSchema = z.object({
  professionalLevel: z.string().min(2, {
    message: "Please enter your professional level (e.g., Entry, Mid-level, Senior)",
  }),
  currentSkills: z.string().min(5, {
    message: "Please provide details about your current skills",
  }),
  educationalBackground: z.string().min(5, {
    message: "Please provide your educational background",
  }),
  careerHistory: z.string().min(5, {
    message: "Please provide your career history",
  }),
  desiredRole: z.string().min(2, {
    message: "Please enter your desired role",
  }),
  state: z.string().min(2, {
    message: "Please enter your state/province",
  }),
  country: z.string().min(2, {
    message: "Please enter your country",
  }),
});

export type FormData = z.infer<typeof formSchema>;

interface XGenPathwayFormProps {
  onAnalysisComplete: (report: CareerAnalysisReport, requestData: CareerAnalysisRequestData) => void;
}

export function XGenPathwayForm({ onAnalysisComplete }: XGenPathwayFormProps) {
  const { toast } = useToast();

  // Set up the form
  const form = useForm<FormData>({
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

  // Set up the mutation for the API call
  const analysisMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/xgen/analyze", data);
      const responseData = await response.json();
      return responseData;
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: "Your career analysis has been generated successfully.",
      });
      onAnalysisComplete(data.report, data.requestData);
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to generate career analysis. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = (data: FormData) => {
    analysisMutation.mutate(data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto bg-card rounded-xl shadow-xl p-6 border border-border/50"
    >
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-primary mb-2">X-Gen AI Career Analysis</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our advanced AI analyzes your career data using SFIA 9 and DigComp 2.2 frameworks to provide
          personalized career guidance with visualizations, roadmaps, and actionable insights.
        </p>
      </div>

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
                    <Input placeholder="Entry, Mid-level, Senior, etc." {...field} />
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
                  <FormLabel>Desired Role</FormLabel>
                  <FormControl>
                    <Input placeholder="Data Scientist, Product Manager, etc." {...field} />
                  </FormControl>
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
                    placeholder="List your technical and soft skills..."
                    className="min-h-[100px]"
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
                    placeholder="Degrees, certifications, courses, etc."
                    className="min-h-[100px]"
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
                    placeholder="Brief overview of your previous roles and experiences..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State/Province</FormLabel>
                  <FormControl>
                    <Input placeholder="California, Ontario, etc." {...field} />
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
                    <Input placeholder="USA, Canada, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-center pt-4">
            <Button 
              type="submit" 
              size="lg" 
              className="w-full md:w-auto min-w-[200px] bg-gradient-to-r from-primary to-[#a31d52] hover:opacity-90 transition-all duration-300"
              disabled={analysisMutation.isPending}
            >
              {analysisMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Analysis...
                </>
              ) : (
                "Generate Career Analysis"
              )}
            </Button>
          </div>
        </form>
      </Form>

      {analysisMutation.isPending && (
        <div className="mt-8 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-muted-foreground">
              Our X-Gen AI is analyzing your career data using advanced frameworks...
            </p>
            <div className="mt-4 flex justify-center">
              <div className="w-64 h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 12, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}