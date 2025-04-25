import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, loginUserSchema, SECURITY_QUESTIONS } from "@shared/schema";
import { Redirect, Link as WouterLink } from "wouter";
import { motion } from "framer-motion";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Loader2, ArrowLeft, Briefcase, Eye, EyeOff } from "lucide-react";
import { fadeInLeft, fadeInRight } from "@/lib/animations";

import careerGrowthAiSvg from "@/assets/images/career-growth-ai.svg";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // We'll handle redirect after all hooks
  const shouldRedirect = !!user;

  // Login form setup
  const loginForm = useForm<z.infer<typeof loginUserSchema>>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onLoginSubmit = (values: z.infer<typeof loginUserSchema>) => {
    loginMutation.mutate(values);
  };

  // Registration form setup
  const registerForm = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      securityQuestion: undefined,
      securityAnswer: ""
    }
  });

  const onRegisterSubmit = (values: z.infer<typeof insertUserSchema>) => {
    registerMutation.mutate(values);
  };

  // Demo login credentials
  const fillDemoCredentials = () => {
    loginForm.setValue("email", "demo@skillgenix.com");
    loginForm.setValue("password", "demo123456");
  };
  
  // Demo signup credentials
  const fillDemoSignupCredentials = () => {
    registerForm.setValue("fullName", "Demo User");
    registerForm.setValue("email", "demo.user@skillgenix.com");
    registerForm.setValue("password", "demo123456");
    registerForm.setValue("confirmPassword", "demo123456");
  };

  // Now safe to redirect after all hook calls
  if (shouldRedirect) {
    return <Redirect to="/dashboard" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 px-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <WouterLink href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </WouterLink>
        </Button>
        <WouterLink href="/" className="flex items-center">
            <span className="font-bold text-xl text-primary-dark">Skill<span className="text-secondary-dark">genix</span></span>
        </WouterLink>
      </header>
      
      <div className="flex-grow flex flex-col md:flex-row">
        <motion.div 
          className="w-full md:w-1/2 p-6 md:p-12 flex items-center justify-center"
          initial="hidden"
          animate="visible"
          variants={fadeInLeft}
        >
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">Welcome to Skillgenix</h1>
              <p className="text-muted-foreground mt-2">Your AI-powered career development platform</p>
            </div>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-0">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your email" 
                              type="email" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="Enter your password" 
                                type={showLoginPassword ? "text" : "password"} 
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                onClick={() => setShowLoginPassword(!showLoginPassword)}
                              >
                                {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : "Login"}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={fillDemoCredentials}
                  >
                    Use Demo Credentials
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="register" className="mt-0">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your email" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="Create a password" 
                                type={showRegisterPassword ? "text" : "password"} 
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                              >
                                {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="Confirm your password" 
                                type={showConfirmPassword ? "text" : "password"} 
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4 p-4 bg-muted/20 rounded-md border">
                      <h4 className="text-sm font-medium">Account Recovery</h4>
                      <p className="text-xs text-muted-foreground">
                        Set up a security question to help recover your account if you forget your password.
                      </p>
                      
                      <FormField
                        control={registerForm.control}
                        name="securityQuestion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Security Question</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a security question" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {SECURITY_QUESTIONS.map((question) => (
                                  <SelectItem key={question} value={question}>
                                    {question}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="securityAnswer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Answer</FormLabel>
                            <FormControl>
                              <Input placeholder="Your answer" {...field} />
                            </FormControl>
                            <FormDescription>
                              Remember this answer as it will be used to recover your account.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : "Create Account"}
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={fillDemoSignupCredentials}
                  >
                    Use Demo Credentials
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
        
        <motion.div 
          className="hidden md:flex md:w-1/2 bg-primary-light/10 relative overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={fadeInRight}
        >
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="max-w-lg">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4">Plan Your Career Growth With AI</h2>
                <p className="text-muted-foreground text-lg">
                  Skillgenix uses advanced AI to help you visualize and navigate your professional journey, 
                  identify skill gaps, and achieve your career aspirations.
                </p>
              </div>
              
              <div className="rounded-xl overflow-hidden border bg-white shadow-lg">
                <img 
                  src={careerGrowthAiSvg} 
                  alt="AI-Powered Career Growth Paths" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}