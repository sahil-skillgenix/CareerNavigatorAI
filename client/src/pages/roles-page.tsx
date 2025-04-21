import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BookOpen, 
  Briefcase, 
  Building2, 
  ChevronRight, 
  Cog, 
  Filter, 
  Loader2, 
  Network, 
  Search, 
  TrendingUp, 
  Users 
} from 'lucide-react';

interface Role {
  id: number;
  title: string;
  category: string;
  description: string;
  requiredExperience?: string;
  salaryRange?: string;
  demands?: {
    remote: string;
    hybrid: string;
    onsite: string;
  };
  relatedRoles?: string[];
}

export default function RolesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [, setLocation] = useLocation();

  // Fetch roles data
  const { data: roles, isLoading, error } = useQuery<Role[]>({
    queryKey: ['/api/roles', searchQuery, category],
    queryFn: async () => {
      let url = '/api/roles';
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('query', searchQuery);
      }
      
      if (category && category !== 'all') {
        params.append('category', category);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }
      
      return response.json();
    },
  });

  // Fetch popular roles for the featured section
  const { data: popularRoles, isLoading: isLoadingPopular } = useQuery<Role[]>({
    queryKey: ['/api/roles/popular'],
    queryFn: async () => {
      const response = await fetch('/api/roles/popular?limit=4');
      if (!response.ok) {
        throw new Error('Failed to fetch popular roles');
      }
      
      return response.json();
    },
  });

  // Get all available categories from roles data
  const getCategories = () => {
    if (!roles) return [];
    const categories = new Set<string>();
    roles.forEach(role => {
      if (role.category) {
        categories.add(role.category);
      }
    });
    return Array.from(categories);
  };

  const filteredRoles = roles || [];
  const categories = getCategories();

  // Render badge for role seniority/position level
  const getPositionLevelBadge = (title: string) => {
    if (title.includes('Senior') || title.includes('Lead') || title.includes('Manager')) {
      return <Badge className="bg-blue-600 hover:bg-blue-700">Senior</Badge>;
    } else if (title.includes('Junior') || title.includes('Associate') || title.includes('Assistant')) {
      return <Badge className="bg-green-600 hover:bg-green-700">Junior</Badge>;
    } else if (title.includes('Director') || title.includes('Chief') || title.includes('Head')) {
      return <Badge className="bg-purple-600 hover:bg-purple-700">Executive</Badge>;
    }
    return <Badge className="bg-gray-600 hover:bg-gray-700">Mid-level</Badge>;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mt-20 container max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <div className="space-y-6">
          {/* Header section */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1c3b82]">Career Roles</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Explore professional roles across various industries. 
              Discover required skills, experience levels, and potential career paths.
            </p>
          </div>

          {/* Search and filter section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for roles..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Select
                value={category}
                onValueChange={setCategory}
              >
                <SelectTrigger>
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="All Categories" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="all" value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All Roles</TabsTrigger>
              <TabsTrigger value="featured">Featured Roles</TabsTrigger>
            </TabsList>
            
            {/* All Roles Tab */}
            <TabsContent value="all" className="pt-4">
              {isLoading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-10">
                  <p className="text-red-500">Error loading roles. Please try again.</p>
                  <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                    Retry
                  </Button>
                </div>
              ) : filteredRoles.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No roles found. Try adjusting your search criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRoles.map((role) => (
                    <Link key={role.id} href={`/roles/${role.id}`}>
                      <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-semibold hover:text-primary truncate">
                              {role.title}
                            </CardTitle>
                            {getPositionLevelBadge(role.title)}
                          </div>
                          <CardDescription className="flex items-center mt-1">
                            <Building2 className="h-3.5 w-3.5 mr-1" />
                            {role.category}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2 flex-grow">
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {role.description}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-0 flex flex-wrap gap-2">
                          {role.requiredExperience && (
                            <Badge variant="outline" className="text-xs">
                              {role.requiredExperience}
                            </Badge>
                          )}
                          <div className="ml-auto flex items-center text-sm text-muted-foreground">
                            <ChevronRight className="h-4 w-4" />
                          </div>
                        </CardFooter>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>
            
            {/* Featured Roles Tab */}
            <TabsContent value="featured" className="pt-4">
              {isLoadingPopular ? (
                <div className="flex justify-center items-center min-h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : popularRoles && popularRoles.length > 0 ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {popularRoles.slice(0, 2).map((role) => (
                      <Card key={role.id} className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-slate-900">
                        <div className="relative h-full">
                          <CardHeader className="border-b bg-blue-100/50 dark:bg-blue-900/20">
                            <div className="flex items-center justify-between">
                              <Badge className="absolute top-3 right-4 bg-blue-600 hover:bg-blue-700">Featured</Badge>
                              <CardTitle className="text-xl font-bold">{role.title}</CardTitle>
                            </div>
                            <CardDescription className="flex items-center mt-1">
                              <Building2 className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{role.category}</span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <p className="text-muted-foreground">{role.description}</p>
                            
                            <div className="mt-4 space-y-3">
                              {role.requiredExperience && (
                                <div className="flex items-start">
                                  <Users className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 mt-0.5" />
                                  <div>
                                    <p className="font-medium">Experience Level</p>
                                    <p className="text-sm text-muted-foreground">{role.requiredExperience}</p>
                                  </div>
                                </div>
                              )}
                              
                              {role.salaryRange && (
                                <div className="flex items-start">
                                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 mt-0.5" />
                                  <div>
                                    <p className="font-medium">Salary Range</p>
                                    <p className="text-sm text-muted-foreground">{role.salaryRange}</p>
                                  </div>
                                </div>
                              )}
                              
                              {role.demands && (
                                <div className="flex items-start">
                                  <Network className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 mt-0.5" />
                                  <div>
                                    <p className="font-medium">Work Mode Demands</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      <Badge variant="outline" className="text-xs">Remote: {role.demands.remote}</Badge>
                                      <Badge variant="outline" className="text-xs">Hybrid: {role.demands.hybrid}</Badge>
                                      <Badge variant="outline" className="text-xs">Onsite: {role.demands.onsite}</Badge>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter className="border-t bg-blue-50/50 dark:bg-blue-950/50">
                            <div className="w-full flex items-center justify-between">
                              <div className="flex items-center">
                                <Cog className="h-5 w-5 mr-1 text-blue-600" />
                                <span className="text-sm text-muted-foreground">Skill-based role</span>
                              </div>
                              <Button asChild variant="default" size="sm" className="ml-auto">
                                <Link href={`/roles/${role.id}`}>
                                  View Details
                                </Link>
                              </Button>
                            </div>
                          </CardFooter>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Briefcase className="mr-2 h-5 w-5" />
                      More Popular Roles
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {popularRoles.slice(2).map((role) => (
                        <Card key={role.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{role.title}</CardTitle>
                            <CardDescription>{role.category}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-2">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {role.description}
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button asChild variant="outline" size="sm" className="w-full">
                              <Link href={`/roles/${role.id}`}>
                                View Details
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-8">
                    <Button onClick={() => setLocation('/career-pathway')} variant="default" className="group">
                      <BookOpen className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                      Explore Career Pathways
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No featured roles available at the moment.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}