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
  Building, 
  Building2, 
  ChevronRight, 
  Filter, 
  Globe, 
  LayoutGrid, 
  Loader2, 
  PieChart, 
  Search, 
  TrendingUp 
} from 'lucide-react';

interface Industry {
  id: number;
  name: string;
  category: string;
  description: string;
  marketSize?: string;
  trendDirection?: string;
  topCompanies?: string[];
  keyRegions?: string[];
  futureOutlook?: string;
}

export default function IndustriesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [, setLocation] = useLocation();

  // Fetch industries data
  const { data: industries, isLoading, error } = useQuery<Industry[]>({
    queryKey: ['/api/industries', searchQuery, category],
    queryFn: async () => {
      let url = '/api/industries';
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
        throw new Error('Failed to fetch industries');
      }
      
      return response.json();
    },
  });

  // Fetch popular industries for the featured section
  const { data: popularIndustries, isLoading: isLoadingPopular } = useQuery<Industry[]>({
    queryKey: ['/api/industries/popular'],
    queryFn: async () => {
      const response = await fetch('/api/industries/popular?limit=4');
      if (!response.ok) {
        throw new Error('Failed to fetch popular industries');
      }
      
      return response.json();
    },
  });

  // Get all available categories from industries data
  const getCategories = () => {
    if (!industries) return [];
    const categories = new Set<string>();
    industries.forEach(industry => {
      if (industry.category) {
        categories.add(industry.category);
      }
    });
    return Array.from(categories);
  };

  const filteredIndustries = industries || [];
  const categories = getCategories();

  // Render trend direction badge
  const getTrendBadge = (trend?: string) => {
    if (!trend) return null;
    
    let bgColor = "bg-gray-600 hover:bg-gray-700";
    if (trend === "Growing" || trend === "Expanding") {
      bgColor = "bg-green-600 hover:bg-green-700";
    } else if (trend === "Stable") {
      bgColor = "bg-blue-600 hover:bg-blue-700";
    } else if (trend === "Declining") {
      bgColor = "bg-red-600 hover:bg-red-700";
    } else if (trend === "Emerging") {
      bgColor = "bg-purple-600 hover:bg-purple-700";
    } else if (trend === "Transforming") {
      bgColor = "bg-amber-600 hover:bg-amber-700";
    }
    
    return <Badge className={bgColor}>{trend}</Badge>;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mt-20 container max-w-7xl mx-auto py-8 px-4 sm:px-6">
        <div className="space-y-6">
          {/* Header section */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1c3b82]">Industries Explorer</h1>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Explore various industries and sectors to understand roles, skills, and career opportunities.
              Get insight into market trends and find the perfect sector for your career growth.
            </p>
          </div>

          {/* Search and filter section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for industries..."
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
              <TabsTrigger value="all">All Industries</TabsTrigger>
              <TabsTrigger value="featured">Featured Industries</TabsTrigger>
            </TabsList>
            
            {/* All Industries Tab */}
            <TabsContent value="all" className="pt-4">
              {isLoading ? (
                <div className="flex justify-center items-center min-h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-10">
                  <p className="text-red-500">Error loading industries. Please try again.</p>
                  <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                    Retry
                  </Button>
                </div>
              ) : filteredIndustries.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No industries found. Try adjusting your search criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredIndustries.map((industry) => (
                    <Link key={industry.id} href={`/industries/${industry.id}`}>
                      <Card className="h-full cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg font-semibold hover:text-primary truncate">
                              {industry.name}
                            </CardTitle>
                            {getTrendBadge(industry.trendDirection)}
                          </div>
                          <CardDescription className="flex items-center mt-1">
                            <Building2 className="h-3.5 w-3.5 mr-1" />
                            {industry.category}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2 flex-grow">
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {industry.description}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-0 flex justify-between items-center">
                          {industry.marketSize && (
                            <span className="text-xs text-muted-foreground">
                              Market size: {industry.marketSize}
                            </span>
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
            
            {/* Featured Industries Tab */}
            <TabsContent value="featured" className="pt-4">
              {isLoadingPopular ? (
                <div className="flex justify-center items-center min-h-[300px]">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : popularIndustries && popularIndustries.length > 0 ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {popularIndustries.slice(0, 2).map((industry) => (
                      <Card key={industry.id} className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-slate-900">
                        <div className="relative h-full">
                          <CardHeader className="border-b bg-blue-100/50 dark:bg-blue-900/20">
                            <div className="flex items-center justify-between">
                              <Badge className="absolute top-3 right-4 bg-blue-600 hover:bg-blue-700">Featured</Badge>
                              <CardTitle className="text-xl font-bold">{industry.name}</CardTitle>
                            </div>
                            <CardDescription className="flex items-center mt-1">
                              <Building2 className="h-4 w-4 mr-1 text-muted-foreground" />
                              <span>{industry.category}</span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-6">
                            <p className="text-muted-foreground">{industry.description}</p>
                            
                            <div className="mt-4 space-y-3">
                              {industry.keyRegions && industry.keyRegions.length > 0 && (
                                <div className="flex items-start">
                                  <Globe className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 mt-0.5" />
                                  <div>
                                    <p className="font-medium">Key Regions</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {industry.keyRegions.slice(0, 3).map((region, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">{region}</Badge>
                                      ))}
                                      {industry.keyRegions.length > 3 && (
                                        <Badge variant="outline" className="text-xs">+{industry.keyRegions.length - 3} more</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {industry.trendDirection && (
                                <div className="flex items-start">
                                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 mt-0.5" />
                                  <div>
                                    <p className="font-medium">Trend Direction</p>
                                    <p className="text-sm text-muted-foreground">{industry.trendDirection}</p>
                                  </div>
                                </div>
                              )}
                              
                              {industry.marketSize && (
                                <div className="flex items-start">
                                  <PieChart className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400 mt-0.5" />
                                  <div>
                                    <p className="font-medium">Market Size</p>
                                    <p className="text-sm text-muted-foreground">{industry.marketSize}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                          <CardFooter className="border-t bg-blue-50/50 dark:bg-blue-950/50">
                            <div className="w-full flex items-center justify-between">
                              <div className="flex items-center">
                                <LayoutGrid className="h-5 w-5 mr-1 text-blue-600" />
                                <span className="text-sm text-muted-foreground">Multiple career paths</span>
                              </div>
                              <Button asChild variant="default" size="sm" className="ml-auto">
                                <Link href={`/industries/${industry.id}`}>
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
                      <Building className="mr-2 h-5 w-5" />
                      More Popular Industries
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {popularIndustries.slice(2).map((industry) => (
                        <Card key={industry.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{industry.name}</CardTitle>
                            <CardDescription>{industry.category}</CardDescription>
                          </CardHeader>
                          <CardContent className="pt-2">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {industry.description}
                            </p>
                          </CardContent>
                          <CardFooter>
                            <Button asChild variant="outline" size="sm" className="w-full">
                              <Link href={`/industries/${industry.id}`}>
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
                      <TrendingUp className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                      Explore Career Pathways
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No featured industries available at the moment.</p>
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