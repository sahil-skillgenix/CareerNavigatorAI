import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { LogOut, User, Settings, ChevronRight, BarChart4, Briefcase, Award, BookOpen, LineChart } from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useQuery } from "@tanstack/react-query";

export default function DashboardPage() {
  const { user, logoutMutation } = useAuth();
  
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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Your Career Dashboard</h1>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full max-w-md grid grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="growth">Growth Plan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {dashboardData?.careerPaths.map((path: any, index: number) => (
                <motion.div key={path.id} variants={staggerItem}>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {path.title}
                        <span className="text-sm font-normal text-muted-foreground">
                          {path.progress}% complete
                        </span>
                      </CardTitle>
                      <CardDescription>AI-recommended career path</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-2 bg-gray-100 rounded-full mb-4">
                        <div 
                          className="h-2 bg-primary rounded-full" 
                          style={{ width: `${path.progress}%` }}
                        ></div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 mr-2 text-primary" />
                      Suggested Skills
                    </CardTitle>
                    <CardDescription>Skills to develop based on your goals</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {dashboardData?.suggestedSkills.map((skill: any) => (
                        <li key={skill.id} className="flex items-center justify-between p-2 rounded bg-gray-50">
                          <div>
                            <p className="font-medium">{skill.name}</p>
                            <p className="text-xs text-muted-foreground">{skill.category}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <BookOpen className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <LineChart className="h-5 w-5 mr-2 text-primary" />
                      Upcoming Milestones
                    </CardTitle>
                    <CardDescription>Your career progression timeline</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {dashboardData?.upcomingMilestones.map((milestone: any) => (
                        <li key={milestone.id} className="flex items-center justify-between p-2 rounded bg-gray-50">
                          <div>
                            <p className="font-medium">{milestone.title}</p>
                            <p className="text-xs text-muted-foreground">Due: {new Date(milestone.dueDate).toLocaleDateString()}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <BarChart4 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
          
          <TabsContent value="skills">
            <div className="rounded-lg border bg-card p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">Skills Assessment</h3>
              <p className="text-muted-foreground mb-4">Assess your skills to get personalized recommendations</p>
              <Button>Start Skills Assessment</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="growth">
            <div className="rounded-lg border bg-card p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">Your Growth Plan</h3>
              <p className="text-muted-foreground mb-4">Create or view your personalized career growth plan</p>
              <Button>Create Growth Plan</Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}