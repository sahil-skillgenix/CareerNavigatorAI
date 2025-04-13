import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link } from "wouter";
import { 
  LogOut, User, Search, Calendar, Clock, Building, MapPin, Upload, 
  History, FileText, Briefcase, BookOpen, Award, ChevronRight, 
  Globe, Phone, Mail, AtSign, GraduationCap, BriefcaseBusiness,
  LineChart
} from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("");
  
  // Function to handle saving changes and closing the active tab
  const handleSaveChanges = () => {
    setActiveTab("");
  };
  
  const { data: dashboardData } = useQuery({
    queryKey: ["/api/dashboard"],
    queryFn: async () => {
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      return response.json();
    }
  });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container flex items-center justify-between h-16 px-4 mx-auto">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <span className="font-semibold">CareerPathAI</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              Welcome, {user?.fullName}
            </div>
            <div className="relative">
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-2xl font-bold mb-6">Career Dashboard</h1>
          
          <div className="w-full max-w-3xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-center mb-6">
                <TabsList className="grid grid-cols-4 w-full max-w-xl">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="organization">My Organization</TabsTrigger>
                  <TabsTrigger value="history">Search History</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-primary" />
                      Basic Details
                    </CardTitle>
                    <CardDescription>Your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input id="fullName" defaultValue={user?.fullName || "Demo User"} />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" defaultValue={user?.email || "demo@careerpathAI.com"} />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="Enter your phone number" />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <div className="flex gap-2">
                          <Input id="dob" type="date" placeholder="DD/MM/YYYY" />
                          <Button variant="outline" size="icon">
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="timezone">Time Zone</Label>
                        <div className="flex gap-2">
                          <Input id="timezone" defaultValue="UTC+0" />
                          <Button variant="outline" size="icon">
                            <Clock className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" placeholder="Enter your country" />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="state">State/Province</Label>
                        <Input id="state" placeholder="Enter your state or province" />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="city">City</Label>
                        <div className="flex gap-2">
                          <Input id="city" placeholder="Enter your city" />
                          <Button variant="outline" size="icon">
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="info" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2 text-primary" />
                      Education Details
                    </CardTitle>
                    <CardDescription>Your academic background</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="degree">Highest Degree</Label>
                        <Input id="degree" placeholder="e.g. Bachelor of Science" />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="field">Field of Study</Label>
                        <Input id="field" placeholder="e.g. Computer Science" />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="institution">Institution</Label>
                        <Input id="institution" placeholder="Enter your institution name" />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="gradYear">Graduation Year</Label>
                        <Input id="gradYear" type="number" placeholder="e.g. 2020" />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button variant="outline">+ Add Education</Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BriefcaseBusiness className="h-5 w-5 mr-2 text-primary" />
                      Experience Details
                    </CardTitle>
                    <CardDescription>Your work history</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="jobTitle">Current Job Title</Label>
                        <Input id="jobTitle" placeholder="e.g. Software Engineer" />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" placeholder="Enter your company name" />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input id="startDate" type="date" />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="currentJob">Current Job</Label>
                        <div className="flex items-center pt-2">
                          <input type="checkbox" id="currentJob" className="mr-2" />
                          <label htmlFor="currentJob">I currently work here</label>
                        </div>
                      </div>
                      
                      <div className="space-y-3 col-span-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea 
                          id="description" 
                          className="w-full min-h-[100px] p-2 border rounded-md"
                          placeholder="Describe your responsibilities and achievements"
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button variant="outline">+ Add Experience</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="organization" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 mr-2 text-primary" />
                      My Organization
                    </CardTitle>
                    <CardDescription>Connect with your organization or upload org structure</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex w-full max-w-xl mx-auto">
                      <Input placeholder="Search for your organization" className="rounded-r-none" />
                      <Button className="rounded-l-none">
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="text-center p-6 border border-dashed rounded-md bg-gray-50">
                      <Building className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Upload Organization Structure</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload your organization's structure as an Excel file to create customized career pathways
                      </p>
                      <div className="flex justify-center gap-4">
                        <Button variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Browse Files
                        </Button>
                        <Button variant="outline" className="bg-white">
                          Download Template
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <History className="h-5 w-5 mr-2 text-primary" />
                      Career Pathway Search History
                    </CardTitle>
                    <CardDescription>Results from your previous career pathway searches</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-md bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Software Developer to CTO Pathway</h3>
                            <p className="text-sm text-muted-foreground">Searched on April 10, 2025</p>
                          </div>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-md bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Marketing Associate to CMO Pathway</h3>
                            <p className="text-sm text-muted-foreground">Searched on April 5, 2025</p>
                          </div>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-md bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">Data Analyst to Data Science Manager</h3>
                            <p className="text-sm text-muted-foreground">Searched on March 28, 2025</p>
                          </div>
                          <Button variant="outline" size="sm">View</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <div className="flex flex-col items-center mt-12">
          <h2 className="text-xl font-semibold mb-6">Choose Your Pathway</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <CardTitle>My Career Pathway</CardTitle>
                <CardDescription>Personal growth journey based on your skills and goals</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  Create a personalized career development plan tailored to your skills, 
                  experience, and aspirations. Get AI-powered recommendations for skills to 
                  develop and milestones to achieve.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Award className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Skill gap analysis</span>
                  </li>
                  <li className="flex items-center">
                    <BookOpen className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Learning recommendations</span>
                  </li>
                  <li className="flex items-center">
                    <Globe className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm">Industry-based career paths</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  Explore Career Pathway
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="bg-gradient-to-r from-secondary/10 to-secondary/5">
                <CardTitle>My Organization Growth Pathway</CardTitle>
                <CardDescription>Career development within your organization</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-4">
                  Discover career advancement opportunities within your current organization's 
                  structure. See potential promotion paths, lateral moves, and the skills needed 
                  to progress in your company.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <Building className="h-4 w-4 text-secondary mr-2" />
                    <span className="text-sm">Organization-specific roles</span>
                  </li>
                  <li className="flex items-center">
                    <FileText className="h-4 w-4 text-secondary mr-2" />
                    <span className="text-sm">Internal promotion requirements</span>
                  </li>
                  <li className="flex items-center">
                    <BriefcaseBusiness className="h-4 w-4 text-secondary mr-2" />
                    <span className="text-sm">Cross-departmental opportunities</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="secondary">
                  Explore Organization Pathway
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        {/* Recommended Courses and Career Tracking */}
        <div className="mt-12 mb-16">
          <h2 className="text-xl font-semibold mb-6 text-center">Recommended Resources & Progress Tracking</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Recommended Courses */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-primary" />
                  Recommended Courses
                </CardTitle>
                <CardDescription>Based on your career goals and skill gaps</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="bg-primary/10 rounded-md p-3">
                      <GraduationCap className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Leadership Fundamentals</h3>
                      <p className="text-sm text-muted-foreground mb-2">Learn essential leadership skills for career growth</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" /> 8 weeks • 
                        <User className="h-3 w-3 mx-1" /> 2,405 enrolled •
                        <Award className="h-3 w-3 mx-1" /> Certificate
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Enroll</Button>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="bg-secondary/10 rounded-md p-3">
                      <BriefcaseBusiness className="h-8 w-8 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Strategic Decision Making</h3>
                      <p className="text-sm text-muted-foreground mb-2">Master the art of making strategic decisions in business</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" /> 6 weeks • 
                        <User className="h-3 w-3 mx-1" /> 1,850 enrolled •
                        <Award className="h-3 w-3 mx-1" /> Certificate
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Enroll</Button>
                  </div>
                  
                  <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="bg-primary/10 rounded-md p-3">
                      <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Data-Driven Management</h3>
                      <p className="text-sm text-muted-foreground mb-2">Learn to leverage data for better management decisions</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" /> 10 weeks • 
                        <User className="h-3 w-3 mx-1" /> 3,120 enrolled •
                        <Award className="h-3 w-3 mx-1" /> Certificate
                      </div>
                    </div>
                    <Button size="sm" variant="outline">Enroll</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Career Progress Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2 text-primary" />
                  Career Progress
                </CardTitle>
                <CardDescription>Track your growth over time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Leadership Skills</span>
                    <span className="text-sm text-muted-foreground">65%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 bg-primary rounded-full" style={{ width: "65%" }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Technical Expertise</span>
                    <span className="text-sm text-muted-foreground">82%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 bg-secondary rounded-full" style={{ width: "82%" }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Strategic Thinking</span>
                    <span className="text-sm text-muted-foreground">48%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 bg-primary rounded-full" style={{ width: "48%" }}></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Communication</span>
                    <span className="text-sm text-muted-foreground">73%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div className="h-2 bg-secondary rounded-full" style={{ width: "73%" }}></div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button variant="outline" className="w-full">
                    View Full Assessment Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}