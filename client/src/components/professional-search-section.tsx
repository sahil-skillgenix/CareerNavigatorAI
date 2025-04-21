import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Briefcase, Code, Book, Building, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';

interface Skill {
  id: number;
  name: string;
  category: string;
  description?: string;
}

interface Role {
  id: number;
  title: string;
  category: string;
  description?: string;
}

interface Industry {
  id: number;
  name: string;
  category: string;
  description?: string;
}

export default function ProfessionalSearchSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<{
    skills: Skill[];
    roles: Role[];
    industries: Industry[];
  } | null>(null);
  
  // Use keyboard enter key to search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  const [activeTab, setActiveTab] = useState("skills");
  const [isSearching, setIsSearching] = useState(false);

  // Fetch popular skills
  const { 
    data: popularSkills, 
    isLoading: isLoadingSkills 
  } = useQuery<Skill[]>({
    queryKey: ['/api/skills/popular'],
    queryFn: async () => {
      const response = await fetch('/api/skills/popular?limit=6');
      if (!response.ok) {
        throw new Error('Failed to fetch popular skills');
      }
      return response.json();
    },
  });

  // Fetch popular roles (using empty query because we don't have a dedicated endpoint yet)
  const { 
    data: popularRoles, 
    isLoading: isLoadingRoles 
  } = useQuery<Role[]>({
    queryKey: ['/api/roles/popular'],
    queryFn: async () => {
      const response = await fetch('/api/roles/popular?limit=6');
      if (!response.ok) {
        throw new Error('Failed to fetch popular roles');
      }
      return response.json();
    },
  });

  // Fetch popular industries (using empty query because we don't have a dedicated endpoint yet)
  const { 
    data: popularIndustries, 
    isLoading: isLoadingIndustries 
  } = useQuery<Industry[]>({
    queryKey: ['/api/industries/popular'],
    queryFn: async () => {
      const response = await fetch('/api/industries/popular?limit=6');
      if (!response.ok) {
        throw new Error('Failed to fetch popular industries');
      }
      return response.json();
    },
  });
  
  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      console.log('Searching for:', searchTerm);
      const encodedTerm = encodeURIComponent(searchTerm.trim());
      console.log('Search URL:', `/api/search?query=${encodedTerm}`);
      
      const response = await fetch(`/api/search?query=${encodedTerm}`);
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      console.log('Search results received:', data);
      setSearchResults(data);
      
      // Auto-select a tab with results if current tab has no results
      if (data) {
        if (activeTab === 'skills' && data.skills.length === 0) {
          if (data.roles.length > 0) {
            setActiveTab('roles');
          } else if (data.industries.length > 0) {
            setActiveTab('industries');
          }
        } else if (activeTab === 'roles' && data.roles.length === 0) {
          if (data.skills.length > 0) {
            setActiveTab('skills');
          } else if (data.industries.length > 0) {
            setActiveTab('industries');
          }
        } else if (activeTab === 'industries' && data.industries.length === 0) {
          if (data.skills.length > 0) {
            setActiveTab('skills');
          } else if (data.roles.length > 0) {
            setActiveTab('roles');
          }
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#f5f7fa]">
      <div className="container mx-auto">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-semibold text-3xl mb-4 text-[#1c3b82]">
            Explore Career Possibilities
          </h2>
          <p className="text-gray-600 text-lg">
            Discover pathways for skills you want to develop, roles you aspire to, or industries that interest you.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-lg shadow-sm border border-[#e4e9f2] max-w-5xl mx-auto overflow-hidden"
        >
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for skills, roles, or industries..."
                className="pl-12 py-6 rounded-md border-[#e4e9f2] text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#1c3b82] hover:bg-[#152d63] text-white"
                onClick={handleSearch}
                disabled={!searchTerm.trim() || isSearching}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </Button>
            </div>
            
            <Tabs 
              defaultValue="skills" 
              className="mt-8"
              value={activeTab} 
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-3 bg-[#f5f7fa]">
                <TabsTrigger value="skills" className="data-[state=active]:bg-white data-[state=active]:text-[#1c3b82] data-[state=active]:shadow-sm">Skills</TabsTrigger>
                <TabsTrigger value="roles" className="data-[state=active]:bg-white data-[state=active]:text-[#1c3b82] data-[state=active]:shadow-sm">Roles</TabsTrigger>
                <TabsTrigger value="industries" className="data-[state=active]:bg-white data-[state=active]:text-[#1c3b82] data-[state=active]:shadow-sm">Industries</TabsTrigger>
              </TabsList>
              
              {/* Skills Tab */}
              <TabsContent value="skills" className="mt-6">
                {/* Loading State */}
                {isLoadingSkills ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1c3b82]" />
                    <span className="ml-2">Loading skills...</span>
                  </div>
                ) : searchResults && activeTab === "skills" ? (
                  <>
                    {/* Search Results */}
                    <h3 className="text-lg font-medium mb-4">Search Results for "{searchTerm}"</h3>
                    {searchResults.skills.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {searchResults.skills.map((skill) => (
                          <Link key={skill.id} href={`/skills/${skill.id}`}>
                            <div className="flex items-center p-4 border border-[#e4e9f2] rounded-md hover:bg-[#f5f7fa] transition-colors cursor-pointer">
                              <div className="mr-4 w-10 h-10 flex items-center justify-center rounded-md bg-[#f5f7fa] text-[#1c3b82]">
                                <Code className="h-5 w-5" />
                              </div>
                              <div className="flex-grow">
                                <h4 className="font-medium text-gray-900">{skill.name}</h4>
                                <p className="text-sm text-gray-500">{skill.category}</p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No skills found matching "{searchTerm}".</p>
                      </div>
                    )}
                  </>
                ) : popularSkills && popularSkills.length > 0 ? (
                  <>
                    {/* Popular Skills */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {popularSkills.map((skill) => (
                        <Link key={skill.id} href={`/skills/${skill.id}`}>
                          <div className="flex items-center p-4 border border-[#e4e9f2] rounded-md hover:bg-[#f5f7fa] transition-colors cursor-pointer">
                            <div className="mr-4 w-10 h-10 flex items-center justify-center rounded-md bg-[#f5f7fa] text-[#1c3b82]">
                              <Code className="h-5 w-5" />
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-medium text-gray-900">{skill.name}</h4>
                              <p className="text-sm text-gray-500">{skill.category}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    <div className="mt-6 flex justify-center">
                      <Link href="/skills">
                        <Button variant="outline" className="border-[#1c3b82] text-[#1c3b82]">
                          View All Skills
                        </Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No skills available at the moment.</p>
                  </div>
                )}
              </TabsContent>
              
              {/* Roles Tab */}
              <TabsContent value="roles" className="mt-6">
                {isLoadingRoles ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1c3b82]" />
                    <span className="ml-2">Loading roles...</span>
                  </div>
                ) : searchResults && activeTab === "roles" ? (
                  <>
                    <h3 className="text-lg font-medium mb-4">Search Results for "{searchTerm}"</h3>
                    {searchResults.roles.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {searchResults.roles.map((role) => (
                          <Link key={role.id} href={`/roles/${role.id}`}>
                            <div className="flex items-center p-4 border border-[#e4e9f2] rounded-md hover:bg-[#f5f7fa] transition-colors cursor-pointer">
                              <div className="mr-4 w-10 h-10 flex items-center justify-center rounded-md bg-[#f5f7fa] text-[#1c3b82]">
                                <Briefcase className="h-5 w-5" />
                              </div>
                              <div className="flex-grow">
                                <h4 className="font-medium text-gray-900">{role.title}</h4>
                                <p className="text-sm text-gray-500">{role.category}</p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No roles found matching "{searchTerm}".</p>
                      </div>
                    )}
                  </>
                ) : popularRoles && popularRoles.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {popularRoles.map((role) => (
                        <Link key={role.id} href={`/roles/${role.id}`}>
                          <div className="flex items-center p-4 border border-[#e4e9f2] rounded-md hover:bg-[#f5f7fa] transition-colors cursor-pointer">
                            <div className="mr-4 w-10 h-10 flex items-center justify-center rounded-md bg-[#f5f7fa] text-[#1c3b82]">
                              <Briefcase className="h-5 w-5" />
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-medium text-gray-900">{role.title}</h4>
                              <p className="text-sm text-gray-500">{role.category}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    <div className="mt-6 flex justify-center">
                      <Button variant="outline" className="border-[#1c3b82] text-[#1c3b82]">
                        View All Roles
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No roles available at the moment.</p>
                  </div>
                )}
              </TabsContent>
              
              {/* Industries Tab */}
              <TabsContent value="industries" className="mt-6">
                {isLoadingIndustries ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#1c3b82]" />
                    <span className="ml-2">Loading industries...</span>
                  </div>
                ) : searchResults && activeTab === "industries" ? (
                  <>
                    <h3 className="text-lg font-medium mb-4">Search Results for "{searchTerm}"</h3>
                    {searchResults.industries.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {searchResults.industries.map((industry) => (
                          <Link key={industry.id} href={`/industries/${industry.id}`}>
                            <div className="flex items-center p-4 border border-[#e4e9f2] rounded-md hover:bg-[#f5f7fa] transition-colors cursor-pointer">
                              <div className="mr-4 w-10 h-10 flex items-center justify-center rounded-md bg-[#f5f7fa] text-[#1c3b82]">
                                <Building className="h-5 w-5" />
                              </div>
                              <div className="flex-grow">
                                <h4 className="font-medium text-gray-900">{industry.name}</h4>
                                <p className="text-sm text-gray-500">{industry.category}</p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-400" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No industries found matching "{searchTerm}".</p>
                      </div>
                    )}
                  </>
                ) : popularIndustries && popularIndustries.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {popularIndustries.map((industry) => (
                        <Link key={industry.id} href={`/industries/${industry.id}`}>
                          <div className="flex items-center p-4 border border-[#e4e9f2] rounded-md hover:bg-[#f5f7fa] transition-colors cursor-pointer">
                            <div className="mr-4 w-10 h-10 flex items-center justify-center rounded-md bg-[#f5f7fa] text-[#1c3b82]">
                              <Building className="h-5 w-5" />
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-medium text-gray-900">{industry.name}</h4>
                              <p className="text-sm text-gray-500">{industry.category}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    <div className="mt-6 flex justify-center">
                      <Button variant="outline" className="border-[#1c3b82] text-[#1c3b82]">
                        View All Industries
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No industries available at the moment.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="bg-[#1c3b82] p-6 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Ready to explore your personalized career path?</h3>
                <p className="text-blue-100">Create an account to get detailed insights and recommendations.</p>
              </div>
              <Link href="/auth">
                <Button className="mt-4 md:mt-0 bg-white text-[#1c3b82] hover:bg-gray-100">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}