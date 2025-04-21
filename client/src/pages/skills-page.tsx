import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
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
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Briefcase, 
  Building2, 
  Code2, 
  CodeSquare, 
  Filter, 
  Loader2, 
  Search, 
  Sparkles, 
  TrendingUp 
} from 'lucide-react';

interface Skill {
  id: number;
  name: string;
  category: string;
  description: string;
  sfiaMapping?: string;
  digCompMapping?: string;
  learningResources?: {
    courses: string[];
    books: string[];
  };
  industryRelevance?: string[];
}

export default function SkillsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [, setLocation] = useLocation();

  // Fetch skills data
  const { data: skills, isLoading, error } = useQuery<Skill[]>({
    queryKey: ['/api/skills', searchQuery, category],
    queryFn: async () => {
      let url = '/api/skills';
      const params = new URLSearchParams();
      
      if (searchQuery) {
        params.append('query', searchQuery);
      }
      
      if (category) {
        params.append('category', category);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch skills');
      }
      
      return response.json();
    },
  });

  // Fetch popular skills for the featured section
  const { data: popularSkills, isLoading: isLoadingPopular } = useQuery<Skill[]>({
    queryKey: ['/api/skills/popular'],
    queryFn: async () => {
      const response = await fetch('/api/skills/popular?limit=4');
      if (!response.ok) {
        throw new Error('Failed to fetch popular skills');
      }
      
      return response.json();
    },
  });

  // Get all available categories from skills data
  const getCategories = () => {
    if (!skills) return [];
    const categories = new Set<string>();
    skills.forEach(skill => {
      if (skill.category) {
        categories.add(skill.category);
      }
    });
    return Array.from(categories);
  };

  const filteredSkills = skills || [];
  const categories = getCategories();

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1c3b82]">Skills Explorer</h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Explore our comprehensive database of skills across various categories. 
            Find detailed information on skill requirements, learning resources, and career relevance.
          </p>
        </div>

        {/* Search and filter section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for skills..."
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
                <SelectItem value="">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Skills</TabsTrigger>
            <TabsTrigger value="featured">Featured Skills</TabsTrigger>
          </TabsList>
          
          {/* All Skills Tab */}
          <TabsContent value="all" className="pt-4">
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500">Error loading skills. Please try again.</p>
                <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                  Retry
                </Button>
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No skills found. Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSkills.map((skill) => (
                  <Link key={skill.id} href={`/skills/${skill.id}`}>
                    <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-start justify-between">
                          <span className="text-lg font-semibold hover:text-primary truncate">
                            {skill.name}
                          </span>
                          <Badge variant="outline">{skill.category}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-2 flex-grow">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {skill.description}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0 flex flex-wrap gap-2">
                        {skill.sfiaMapping && (
                          <Badge variant="secondary" className="text-xs">SFIA 9</Badge>
                        )}
                        {skill.digCompMapping && (
                          <Badge variant="secondary" className="text-xs">DigComp 2.2</Badge>
                        )}
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Featured Skills Tab */}
          <TabsContent value="featured" className="pt-4">
            {isLoadingPopular ? (
              <div className="flex justify-center items-center min-h-[300px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : popularSkills && popularSkills.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {popularSkills.slice(0, 2).map((skill) => (
                    <Card key={skill.id} className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-slate-900">
                      <div className="relative h-full">
                        <CardHeader className="border-b bg-blue-100/50 dark:bg-blue-900/20">
                          <div className="flex items-center justify-between">
                            <Badge className="absolute top-3 right-4 bg-blue-600 hover:bg-blue-700">Featured</Badge>
                            <CardTitle className="text-xl font-bold">{skill.name}</CardTitle>
                          </div>
                          <CardDescription className="flex items-center mt-1">
                            <CodeSquare className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>{skill.category}</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                          <p className="text-muted-foreground">{skill.description}</p>
                          
                          <div className="mt-4 space-y-3">
                            {skill.industryRelevance && skill.industryRelevance.length > 0 && (
                              <div className="flex items-start">
                                <Building2 className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                  <p className="font-medium">Industry Relevance</p>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {skill.industryRelevance.slice(0, 3).map((industry, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">{industry}</Badge>
                                    ))}
                                    {skill.industryRelevance.length > 3 && (
                                      <Badge variant="outline" className="text-xs">+{skill.industryRelevance.length - 3} more</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {skill.sfiaMapping && (
                              <div className="flex items-start">
                                <Sparkles className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 mt-0.5" />
                                <div>
                                  <p className="font-medium">SFIA 9 Mapping</p>
                                  <p className="text-sm text-muted-foreground">{skill.sfiaMapping}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="border-t bg-blue-50/50 dark:bg-blue-950/50">
                          <div className="w-full flex items-center justify-between">
                            <div className="flex items-center">
                              <TrendingUp className="h-5 w-5 mr-1 text-green-600" />
                              <span className="text-sm text-muted-foreground">High demand</span>
                            </div>
                            <Button asChild variant="default" size="sm" className="ml-auto">
                              <Link href={`/skills/${skill.id}`}>
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
                    <BookOpen className="mr-2 h-5 w-5" />
                    More Popular Skills
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {popularSkills.slice(2).map((skill) => (
                      <Card key={skill.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{skill.name}</CardTitle>
                          <CardDescription>{skill.category}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {skill.description}
                          </p>
                        </CardContent>
                        <CardFooter>
                          <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href={`/skills/${skill.id}`}>
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
                    <Briefcase className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                    Explore Career Pathways
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No featured skills available at the moment.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}