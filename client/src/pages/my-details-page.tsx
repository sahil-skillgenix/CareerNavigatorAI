import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AuthenticatedLayout } from "@/components/layouts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, BookIcon, BriefcaseIcon, GraduationCapIcon, ChevronRightIcon, BadgeCheck, Settings, User, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function MyDetailsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Fetch user details data
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ["/api/user/details"],
    queryFn: async () => {
      const response = await fetch("/api/user/details");
      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }
      return response.json();
    },
    enabled: !!user // Only fetch if user is logged in
  });
  
  // Update user details mutation
  const updateUserMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("POST", "/api/user/details", data);
      if (!response.ok) {
        throw new Error("Failed to update user details");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your profile has been updated successfully.",
      });
      // Invalidate and refetch user details
      queryClient.invalidateQueries({ queryKey: ["/api/user/details"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    },
  });
  
  // Initialize form state
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    location: "",
    phone: "",
    bio: "",
    currentRole: "",
    experience: "",
    education: "",
    skills: "",
    interests: ""
  });
  
  // Update form when user data is loaded
  useEffect(() => {
    if (userData) {
      setFormData({
        fullName: userData.fullName || "",
        email: userData.email || "",
        location: userData.location || "",
        phone: userData.phone || "",
        bio: userData.bio || "",
        currentRole: userData.currentRole || "",
        experience: userData.experience || "",
        education: userData.education || "",
        skills: userData.skills || "",
        interests: userData.interests || ""
      });
    }
  }, [userData]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserMutation.mutate(formData);
  };
  
  const userInitials = user?.fullName
    ? user.fullName.split(" ").map(name => name[0]).join("")
    : "SU";
  
  return (
    <AuthenticatedLayout title="My Details">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <motion.div 
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage src={userData?.avatarUrl} />
              <AvatarFallback className="text-xl bg-primary text-white">{userInitials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{user?.fullName || 'Your Profile'}</h1>
              <p className="text-gray-600 mt-1">{user?.email || ''}</p>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline" className="bg-blue-50">
                  <User className="w-3 h-3 mr-1" />
                  Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                </Badge>
                {userData?.location && (
                  <Badge variant="outline" className="bg-green-50">
                    <MapPin className="w-3 h-3 mr-1" />
                    {userData.location}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
              <TabsTrigger value="profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="career" className="flex items-center">
                <BriefcaseIcon className="mr-2 h-4 w-4" />
                <span>Career History</span>
              </TabsTrigger>
              <TabsTrigger value="education" className="flex items-center">
                <GraduationCapIcon className="mr-2 h-4 w-4" />
                <span>Education</span>
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center">
                <BadgeCheck className="mr-2 h-4 w-4" />
                <span>Skills & Interests</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and how others can contact you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                          id="fullName" 
                          name="fullName" 
                          value={formData.fullName} 
                          onChange={handleInputChange}
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          value={formData.email} 
                          onChange={handleInputChange}
                          placeholder="Your email address"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input 
                          id="location" 
                          name="location" 
                          value={formData.location} 
                          onChange={handleInputChange}
                          placeholder="City, Country"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input 
                          id="phone" 
                          name="phone" 
                          value={formData.phone} 
                          onChange={handleInputChange}
                          placeholder="Your phone number"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                        id="bio" 
                        name="bio" 
                        value={formData.bio} 
                        onChange={handleInputChange}
                        placeholder="Tell us a bit about yourself"
                        rows={4}
                      />
                    </div>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleSubmit}>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Career History Tab */}
            <TabsContent value="career">
              <Card>
                <CardHeader>
                  <CardTitle>Career History</CardTitle>
                  <CardDescription>
                    Add your work experience to help Skillgenix provide better career recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentRole">Current Role</Label>
                      <Input 
                        id="currentRole" 
                        name="currentRole" 
                        value={formData.currentRole} 
                        onChange={handleInputChange}
                        placeholder="Your current job title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Work Experience</Label>
                      <Textarea 
                        id="experience" 
                        name="experience" 
                        value={formData.experience} 
                        onChange={handleInputChange}
                        placeholder="List your previous roles and responsibilities"
                        rows={6}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleSubmit}>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Education Tab */}
            <TabsContent value="education">
              <Card>
                <CardHeader>
                  <CardTitle>Education</CardTitle>
                  <CardDescription>
                    Add your educational background to enhance your career recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="education">Educational Background</Label>
                    <Textarea 
                      id="education" 
                      name="education" 
                      value={formData.education} 
                      onChange={handleInputChange}
                      placeholder="List your degrees, certifications, and educational achievements"
                      rows={6}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleSubmit}>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Skills & Interests Tab */}
            <TabsContent value="skills">
              <Card>
                <CardHeader>
                  <CardTitle>Skills & Interests</CardTitle>
                  <CardDescription>
                    Let us know about your skills and interests to personalize your experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="skills">Professional Skills</Label>
                      <Textarea 
                        id="skills" 
                        name="skills" 
                        value={formData.skills} 
                        onChange={handleInputChange}
                        placeholder="List your technical and soft skills (e.g., Python, Project Management, Communication)"
                        rows={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interests">Professional Interests</Label>
                      <Textarea 
                        id="interests" 
                        name="interests" 
                        value={formData.interests} 
                        onChange={handleInputChange}
                        placeholder="What areas are you interested in exploring in your career?"
                        rows={4}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleSubmit}>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AuthenticatedLayout>
  );
}