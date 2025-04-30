import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  insertUserSchema, 
  loginUserSchema, 
  findAccountSchema,
  verifySecurityAnswerSchema,
  resetPasswordSchema,
  SECURITY_QUESTIONS 
} from "@shared/schema";
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
import { Loader2, ArrowLeft, Briefcase, Eye, EyeOff, KeyRound, ArrowRight, Check } from "lucide-react";
import { fadeInLeft, fadeInRight } from "@/lib/animations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

import careerGrowthAiSvg from "@/assets/images/ai-career-guidance.svg";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const { toast } = useToast();
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  
  // Password recovery state
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<"find-account" | "security-question" | "reset-password">("find-account");
  const [recoveryUserId, setRecoveryUserId] = useState<string>("");
  const [recoveryEmail, setRecoveryEmail] = useState<string>("");
  const [securityQuestion, setSecurityQuestion] = useState<string>("");
  
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
  
  // Find account form
  const findAccountForm = useForm<z.infer<typeof findAccountSchema>>({
    resolver: zodResolver(findAccountSchema),
    defaultValues: {
      email: ""
    }
  });
  
  // Security question form
  const securityAnswerForm = useForm<z.infer<typeof verifySecurityAnswerSchema>>({
    resolver: zodResolver(verifySecurityAnswerSchema),
    defaultValues: {
      answer: ""
    }
  });
  
  // Reset password form
  const resetPasswordForm = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });
  
  // Handle find account submission
  const onFindAccountSubmit = async (values: z.infer<typeof findAccountSchema>) => {
    try {
      const response = await fetch('/api/auth/find-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to find account');
      }
      
      setRecoveryUserId(data.userId);
      setRecoveryEmail(values.email);
      setSecurityQuestion(data.securityQuestion);
      setRecoveryStep('security-question');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Please check your email and try again';
      toast({
        title: 'Account not found',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };
  
  // Handle security question verification
  const onSecurityAnswerSubmit = async (values: z.infer<typeof verifySecurityAnswerSchema>) => {
    try {
      const response = await fetch('/api/auth/verify-security-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: recoveryUserId,
          answer: values.answer
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Security answer verification failed');
      }
      
      setRecoveryStep('reset-password');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Please check your answer and try again';
      toast({
        title: 'Verification failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };
  
  // Handle password reset
  const onResetPasswordSubmit = async (values: z.infer<typeof resetPasswordSchema>) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: recoveryUserId,
          password: values.password
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }
      
      toast({
        title: 'Password reset successful',
        description: 'You can now log in with your new password',
        variant: 'default'
      });
      
      // Close dialog and reset state
      setShowRecoveryDialog(false);
      setRecoveryStep('find-account');
      setRecoveryUserId('');
      setRecoveryEmail('');
      setSecurityQuestion('');
      
      // Reset all forms
      findAccountForm.reset();
      securityAnswerForm.reset();
      resetPasswordForm.reset();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Please try again';
      toast({
        title: 'Password reset failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };
  
  // Reset the recovery flow when dialog is closed
  const handleRecoveryDialogClose = () => {
    setShowRecoveryDialog(false);
    setRecoveryStep('find-account');
    setRecoveryUserId('');
    setRecoveryEmail('');
    setSecurityQuestion('');
    
    // Reset all forms
    findAccountForm.reset();
    securityAnswerForm.reset();
    resetPasswordForm.reset();
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
                  
                  <div className="grid grid-cols-1 gap-4 mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={fillDemoCredentials}
                    >
                      Use Demo Credentials
                    </Button>
                    
                    <Button
                      variant="link"
                      type="button"
                      className="w-full text-muted-foreground hover:text-primary"
                      onClick={() => setShowRecoveryDialog(true)}
                    >
                      Forgot Password?
                    </Button>
                  </div>
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
                <h2 className="text-3xl font-bold mb-4">AI-Powered Career Guidance</h2>
                <p className="text-muted-foreground text-lg">
                  Skillgenix's intelligent AI analyzes your skills and aspirations to provide personalized career guidance. 
                  Discover multiple career paths, identify skill gaps, and receive tailored recommendations to accelerate your professional growth.
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
      {/* Password Recovery Dialog */}
      <Dialog open={showRecoveryDialog} onOpenChange={handleRecoveryDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Account Recovery
            </DialogTitle>
            <DialogDescription>
              {recoveryStep === "find-account" && "Enter your email to find your account."}
              {recoveryStep === "security-question" && "Answer your security question to verify your identity."}
              {recoveryStep === "reset-password" && "Create a new password for your account."}
            </DialogDescription>
          </DialogHeader>
          
          {recoveryStep === "find-account" && (
            <Form {...findAccountForm}>
              <form onSubmit={findAccountForm.handleSubmit(onFindAccountSubmit)} className="space-y-4">
                <FormField
                  control={findAccountForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" className="flex items-center gap-2">
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          )}
          
          {recoveryStep === "security-question" && (
            <Form {...securityAnswerForm}>
              <form onSubmit={securityAnswerForm.handleSubmit(onSecurityAnswerSubmit)} className="space-y-4">
                <Alert>
                  <AlertDescription>
                    We found an account associated with <strong>{recoveryEmail}</strong>
                  </AlertDescription>
                </Alert>
                
                <FormField
                  control={securityAnswerForm.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Security Question: {securityQuestion}</FormLabel>
                      <FormControl>
                        <Input placeholder="Your answer" {...field} />
                      </FormControl>
                      <FormDescription>
                        Answer the security question you set up when you created your account.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end">
                  <Button type="submit" className="flex items-center gap-2">
                    Verify
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          )}
          
          {recoveryStep === "reset-password" && (
            <Form {...resetPasswordForm}>
              <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
                <Alert>
                  <AlertDescription className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Security verification successful!
                  </AlertDescription>
                </Alert>
                
                <FormField
                  control={resetPasswordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="Create a new password" 
                            type={showResetPassword ? "text" : "password"} 
                            {...field} 
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={() => setShowResetPassword(!showResetPassword)}
                          >
                            {showResetPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={resetPasswordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Confirm your new password" 
                          type="password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button type="submit" className="flex items-center gap-2">
                    Reset Password
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}