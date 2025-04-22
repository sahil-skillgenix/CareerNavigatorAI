import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Search as SearchIcon, 
  Code, 
  Briefcase, 
  Building, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  BookOpen,
  Layers,
  ChevronRight, 
  DollarSign
} from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

// Define types for our search results
interface Skill {
  id: number;
  name: string;
  category: string;
  description: string;
  demandTrend?: string;
  learningDifficulty?: string;
  sfiaFrameworkLevel?: string;
  digCompFrameworkLevel?: string;
}

interface Role {
  id: number;
  title: string;
  category: string;
  description: string;
  averageSalary?: string;
  demandOutlook?: string;
  experienceRequired?: string;
  educationRequired?: string;
}

interface Industry {
  id: number;
  name: string;
  category: string;
  description: string;
  growthOutlook?: string;
  disruptionLevel?: string;
  technologyIntensity?: string;
}

interface SearchResults {
  skills: Skill[];
  roles: Role[];
  industries: Industry[];
}

// Featured items for display when no search is performed
const FEATURED_SKILLS: Skill[] = [
  {
    id: 1,
    name: "JavaScript Programming",
    category: "Development",
    description: "Core programming language for web development, enabling interactive and dynamic content on websites.",
    demandTrend: "increasing",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 3-5"
  },
  {
    id: 2,
    name: "Data Analysis",
    category: "Data Science",
    description: "Interpreting data sets to identify patterns, trends and insights to support business decision making.",
    demandTrend: "increasing",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 3-6"
  },
  {
    id: 3,
    name: "Cloud Architecture",
    category: "Infrastructure",
    description: "Designing and implementing cloud-based systems with considerations for scalability, security and performance.",
    demandTrend: "increasing",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 5-7"
  },
  {
    id: 4,
    name: "UX Design",
    category: "Design",
    description: "Creating user-centered designs for digital products focusing on usability, accessibility and user satisfaction.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    digCompFrameworkLevel: "Specialized - Level 6"
  },
  {
    id: 5,
    name: "Machine Learning",
    category: "Artificial Intelligence",
    description: "Developing algorithms and statistical models that enable systems to improve through experience.",
    demandTrend: "increasing",
    learningDifficulty: "high",
    sfiaFrameworkLevel: "Level 5-7"
  },
  {
    id: 6,
    name: "Project Management",
    category: "Management",
    description: "Planning, organizing and overseeing projects to ensure they're completed on time, within scope and budget.",
    demandTrend: "stable",
    learningDifficulty: "medium",
    sfiaFrameworkLevel: "Level 4-7"
  }
];

const FEATURED_ROLES: Role[] = [
  {
    id: 1,
    title: "Full Stack Developer",
    category: "Software Development",
    description: "Develops both client and server software, handling all aspects of web application development.",
    averageSalary: "$90,000 - $140,000",
    demandOutlook: "high demand",
    experienceRequired: "2-5 years"
  },
  {
    id: 2,
    title: "Data Scientist",
    category: "Data Analytics",
    description: "Analyzes and interprets complex data to help organizations make better decisions.",
    averageSalary: "$100,000 - $160,000",
    demandOutlook: "high demand",
    experienceRequired: "3-5 years"
  },
  {
    id: 3,
    title: "Cloud Solutions Architect",
    category: "Cloud Computing",
    description: "Designs and implements cloud-based solutions tailored to business requirements.",
    averageSalary: "$120,000 - $180,000",
    demandOutlook: "high demand",
    experienceRequired: "5-8 years"
  },
  {
    id: 4,
    title: "UX/UI Designer",
    category: "Design",
    description: "Creates visually appealing, user-friendly interfaces for websites and applications.",
    averageSalary: "$85,000 - $130,000",
    demandOutlook: "medium demand",
    experienceRequired: "2-5 years"
  },
  {
    id: 5,
    title: "DevOps Engineer",
    category: "Operations",
    description: "Implements and manages automated processes for software delivery and infrastructure changes.",
    averageSalary: "$95,000 - $150,000",
    demandOutlook: "high demand",
    experienceRequired: "3-6 years"
  },
  {
    id: 6,
    title: "Product Manager",
    category: "Product Management",
    description: "Oversees product development from conception to launch, balancing business goals with user needs.",
    averageSalary: "$100,000 - $160,000",
    demandOutlook: "medium demand",
    experienceRequired: "4-7 years"
  }
];

const FEATURED_INDUSTRIES: Industry[] = [
  {
    id: 1,
    name: "Software Development",
    category: "Technology",
    description: "Creation and maintenance of applications, frameworks, and other software components.",
    growthOutlook: "high growth",
    disruptionLevel: "high",
    technologyIntensity: "very high"
  },
  {
    id: 2,
    name: "Data Analytics",
    category: "Technology",
    description: "Examination of data sets to draw conclusions about the information they contain.",
    growthOutlook: "high growth",
    disruptionLevel: "high",
    technologyIntensity: "very high"
  },
  {
    id: 3,
    name: "Cloud Services",
    category: "Technology",
    description: "Delivery of computing services over the internet, including servers, storage, and software.",
    growthOutlook: "high growth",
    disruptionLevel: "high",
    technologyIntensity: "very high"
  },
  {
    id: 4,
    name: "Cybersecurity",
    category: "Technology",
    description: "Protection of computer systems from theft or damage to hardware, software, or data.",
    growthOutlook: "high growth",
    disruptionLevel: "medium",
    technologyIntensity: "high"
  },
  {
    id: 5,
    name: "Artificial Intelligence",
    category: "Technology",
    description: "Simulation of human intelligence processes by machines, especially computer systems.",
    growthOutlook: "high growth",
    disruptionLevel: "very high",
    technologyIntensity: "very high"
  },
  {
    id: 6,
    name: "Healthcare Technology",
    category: "Healthcare",
    description: "Application of organized knowledge and skills in the form of devices, medicines, procedures, and systems.",
    growthOutlook: "high growth",
    disruptionLevel: "medium",
    technologyIntensity: "high"
  }
];

export default function SkillRoleIndustrySearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch search results
  const { data, isLoading, error, refetch } = useQuery<SearchResults>({
    queryKey: ['/api/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) {
        return { skills: [], roles: [], industries: [] };
      }
      console.log(`Searching for: ${searchQuery}`);
      
      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery.trim())}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch search results: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Search results:', data);
        return data;
      } catch (error) {
        console.error('Error in search:', error);
        throw error;
      }
    },
    enabled: false, // Don't run on component mount
  });

  // Popular items queries
  const { data: popularSkills, isLoading: isLoadingPopularSkills } = useQuery<Skill[]>({
    queryKey: ['/api/skills/popular'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/skills/popular?limit=6');
        if (!response.ok) {
          // If the endpoint doesn't exist or fails, fall back to our featured skills
          console.log('Using featured skills as fallback');
          return FEATURED_SKILLS;
        }
        return response.json();
      } catch (error) {
        console.log('Using featured skills due to error:', error);
        return FEATURED_SKILLS;
      }
    },
  });

  const { data: popularRoles, isLoading: isLoadingPopularRoles } = useQuery<Role[]>({
    queryKey: ['/api/roles/popular'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/roles/popular?limit=6');
        if (!response.ok) {
          // If the endpoint doesn't exist or fails, fall back to our featured roles
          console.log('Using featured roles as fallback');
          return FEATURED_ROLES;
        }
        return response.json();
      } catch (error) {
        console.log('Using featured roles due to error:', error);
        return FEATURED_ROLES;
      }
    },
  });

  const { data: popularIndustries, isLoading: isLoadingPopularIndustries } = useQuery<Industry[]>({
    queryKey: ['/api/industries/popular'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/industries/popular?limit=6');
        if (!response.ok) {
          // If the endpoint doesn't exist or fails, fall back to our featured industries
          console.log('Using featured industries as fallback');
          return FEATURED_INDUSTRIES;
        }
        return response.json();
      } catch (error) {
        console.log('Using featured industries due to error:', error);
        return FEATURED_INDUSTRIES;
      }
    },
  });

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast({
        title: 'Please enter a search query',
        variant: 'destructive',
      });
      return;
    }
    setHasSearched(true);
    refetch();
  };

  // Handle keydown for search input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  // Count total results
  const totalResults = 
    (data?.skills?.length || 0) + 
    (data?.roles?.length || 0) + 
    (data?.industries?.length || 0);

  // Container animation
  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Item animation
  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold mb-3 text-[#1c3b82]">
          Explore The Career Ecosystem
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Discover how skills, roles, and industries connect in today's dynamic job market. 
          Search to find what you need or explore our featured selections.
        </p>
      </div>

      <Card className="mb-12 overflow-hidden border-2 border-[#f0f4f9] shadow-md">
        <CardHeader className="bg-gradient-to-r from-[#1c3b82] to-[#2a4ea6] text-white pb-8">
          <CardTitle className="text-center text-2xl font-bold">
            Search Skills, Roles & Industries
          </CardTitle>
          <p className="text-center text-white/80 mt-2">
            Enter keywords to find specific skills, job roles, or industries
          </p>
        </CardHeader>
        <CardContent className="px-8 pt-0 -mt-4">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-grow">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Try 'JavaScript', 'Data Scientist', or 'Cloud Computing'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 py-6 text-base rounded-lg shadow-sm"
              />
            </div>
            <Button type="submit" disabled={isLoading} size="lg" className="bg-[#1c3b82] hover:bg-[#152d63]">
              {isLoading ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <SearchIcon className="h-5 w-5 mr-2" />
              )}
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="text-red-500 mb-8 p-6 bg-red-50 rounded-lg border border-red-200">
          <h3 className="text-lg font-semibold mb-2">Search Error</h3>
          <p>{error instanceof Error ? error.message : 'Failed to perform search'}</p>
          <p className="mt-2 text-sm">Please try a different search term or check back later.</p>
        </div>
      )}

      {/* Search Results or Featured Content */}
      {hasSearched && data ? (
        <div className="mb-8">
          {totalResults > 0 ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-8 bg-[#f5f7fa]">
                <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-[#1c3b82] data-[state=active]:shadow-sm">
                  All Results ({totalResults})
                </TabsTrigger>
                <TabsTrigger value="skills" disabled={!data.skills.length} className="data-[state=active]:bg-white data-[state=active]:text-[#1c3b82] data-[state=active]:shadow-sm">
                  Skills ({data.skills.length})
                </TabsTrigger>
                <TabsTrigger value="roles" disabled={!data.roles.length} className="data-[state=active]:bg-white data-[state=active]:text-[#1c3b82] data-[state=active]:shadow-sm">
                  Roles ({data.roles.length})
                </TabsTrigger>
                <TabsTrigger value="industries" disabled={!data.industries.length} className="data-[state=active]:bg-white data-[state=active]:text-[#1c3b82] data-[state=active]:shadow-sm">
                  Industries ({data.industries.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <div className="space-y-12">
                  {data.skills.length > 0 && (
                    <div>
                      <div className="flex items-center mb-6">
                        <Code className="h-6 w-6 mr-3 text-[#1c3b82]" />
                        <h2 className="text-2xl font-semibold text-[#1c3b82]">Skills</h2>
                      </div>
                      <motion.div 
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                        variants={containerAnimation}
                        initial="hidden"
                        animate="show"
                      >
                        {data.skills.slice(0, 6).map((skill) => (
                          <motion.div key={skill.id} variants={itemAnimation}>
                            <SkillCard skill={skill} />
                          </motion.div>
                        ))}
                      </motion.div>
                      {data.skills.length > 6 && (
                        <div className="mt-6 text-center">
                          <Button 
                            variant="outline" 
                            onClick={() => setActiveTab('skills')}
                            className="border-[#1c3b82] text-[#1c3b82]"
                          >
                            View All {data.skills.length} Skills
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {data.roles.length > 0 && (
                    <div>
                      <div className="flex items-center mb-6">
                        <Briefcase className="h-6 w-6 mr-3 text-[#1c3b82]" />
                        <h2 className="text-2xl font-semibold text-[#1c3b82]">Roles</h2>
                      </div>
                      <motion.div 
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                        variants={containerAnimation}
                        initial="hidden"
                        animate="show"
                      >
                        {data.roles.slice(0, 6).map((role) => (
                          <motion.div key={role.id} variants={itemAnimation}>
                            <RoleCard role={role} />
                          </motion.div>
                        ))}
                      </motion.div>
                      {data.roles.length > 6 && (
                        <div className="mt-6 text-center">
                          <Button 
                            variant="outline" 
                            onClick={() => setActiveTab('roles')}
                            className="border-[#1c3b82] text-[#1c3b82]"
                          >
                            View All {data.roles.length} Roles
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {data.industries.length > 0 && (
                    <div>
                      <div className="flex items-center mb-6">
                        <Building className="h-6 w-6 mr-3 text-[#1c3b82]" />
                        <h2 className="text-2xl font-semibold text-[#1c3b82]">Industries</h2>
                      </div>
                      <motion.div 
                        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                        variants={containerAnimation}
                        initial="hidden"
                        animate="show"
                      >
                        {data.industries.slice(0, 6).map((industry) => (
                          <motion.div key={industry.id} variants={itemAnimation}>
                            <IndustryCard industry={industry} />
                          </motion.div>
                        ))}
                      </motion.div>
                      {data.industries.length > 6 && (
                        <div className="mt-6 text-center">
                          <Button 
                            variant="outline" 
                            onClick={() => setActiveTab('industries')}
                            className="border-[#1c3b82] text-[#1c3b82]"
                          >
                            View All {data.industries.length} Industries
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="skills">
                <div className="flex items-center mb-6">
                  <Code className="h-6 w-6 mr-3 text-[#1c3b82]" />
                  <h2 className="text-2xl font-semibold text-[#1c3b82]">Skills</h2>
                </div>
                <motion.div 
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  variants={containerAnimation}
                  initial="hidden"
                  animate="show"
                >
                  {data.skills.map((skill) => (
                    <motion.div key={skill.id} variants={itemAnimation}>
                      <SkillCard skill={skill} />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="roles">
                <div className="flex items-center mb-6">
                  <Briefcase className="h-6 w-6 mr-3 text-[#1c3b82]" />
                  <h2 className="text-2xl font-semibold text-[#1c3b82]">Roles</h2>
                </div>
                <motion.div 
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  variants={containerAnimation}
                  initial="hidden"
                  animate="show"
                >
                  {data.roles.map((role) => (
                    <motion.div key={role.id} variants={itemAnimation}>
                      <RoleCard role={role} />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>

              <TabsContent value="industries">
                <div className="flex items-center mb-6">
                  <Building className="h-6 w-6 mr-3 text-[#1c3b82]" />
                  <h2 className="text-2xl font-semibold text-[#1c3b82]">Industries</h2>
                </div>
                <motion.div 
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  variants={containerAnimation}
                  initial="hidden"
                  animate="show"
                >
                  {data.industries.map((industry) => (
                    <motion.div key={industry.id} variants={itemAnimation}>
                      <IndustryCard industry={industry} />
                    </motion.div>
                  ))}
                </motion.div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-12 bg-[#f5f7fa] rounded-lg border border-[#e4e9f2]">
              <SearchIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-2xl font-semibold mb-2 text-gray-700">No results found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                We couldn't find any skills, roles, or industries matching "{searchQuery}".
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery('');
                  setHasSearched(false);
                }}
                className="border-[#1c3b82] text-[#1c3b82]"
              >
                View Featured Items
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div>
          <Tabs defaultValue="skills" className="w-full">
            <TabsList className="grid grid-cols-3 mb-8 bg-[#f5f7fa]">
              <TabsTrigger value="skills" className="data-[state=active]:bg-white data-[state=active]:text-[#1c3b82] data-[state=active]:shadow-sm">
                Featured Skills
              </TabsTrigger>
              <TabsTrigger value="roles" className="data-[state=active]:bg-white data-[state=active]:text-[#1c3b82] data-[state=active]:shadow-sm">
                Featured Roles
              </TabsTrigger>
              <TabsTrigger value="industries" className="data-[state=active]:bg-white data-[state=active]:text-[#1c3b82] data-[state=active]:shadow-sm">
                Featured Industries
              </TabsTrigger>
            </TabsList>

            <TabsContent value="skills">
              <div className="flex items-center mb-6">
                <Code className="h-6 w-6 mr-3 text-[#1c3b82]" />
                <h2 className="text-2xl font-semibold text-[#1c3b82]">Featured Skills</h2>
              </div>
              
              {isLoadingPopularSkills ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#1c3b82]" />
                  <span className="ml-3 text-lg">Loading skills...</span>
                </div>
              ) : (
                <motion.div 
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  variants={containerAnimation}
                  initial="hidden"
                  animate="show"
                >
                  {(popularSkills || FEATURED_SKILLS).map((skill) => (
                    <motion.div key={skill.id} variants={itemAnimation}>
                      <SkillCard skill={skill} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="roles">
              <div className="flex items-center mb-6">
                <Briefcase className="h-6 w-6 mr-3 text-[#1c3b82]" />
                <h2 className="text-2xl font-semibold text-[#1c3b82]">Featured Roles</h2>
              </div>
              
              {isLoadingPopularRoles ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#1c3b82]" />
                  <span className="ml-3 text-lg">Loading roles...</span>
                </div>
              ) : (
                <motion.div 
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  variants={containerAnimation}
                  initial="hidden"
                  animate="show"
                >
                  {(popularRoles || FEATURED_ROLES).map((role) => (
                    <motion.div key={role.id} variants={itemAnimation}>
                      <RoleCard role={role} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="industries">
              <div className="flex items-center mb-6">
                <Building className="h-6 w-6 mr-3 text-[#1c3b82]" />
                <h2 className="text-2xl font-semibold text-[#1c3b82]">Featured Industries</h2>
              </div>
              
              {isLoadingPopularIndustries ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#1c3b82]" />
                  <span className="ml-3 text-lg">Loading industries...</span>
                </div>
              ) : (
                <motion.div 
                  className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                  variants={containerAnimation}
                  initial="hidden"
                  animate="show"
                >
                  {(popularIndustries || FEATURED_INDUSTRIES).map((industry) => (
                    <motion.div key={industry.id} variants={itemAnimation}>
                      <IndustryCard industry={industry} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

// Skill Card Component with new design
function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-md border-2 border-[#f0f4f9] hover:border-[#d3e0f5]">
      <div className="h-2 bg-gradient-to-r from-[#1c3b82] to-[#2a4ea6]"></div>
      <CardContent className="p-6">
        <div className="flex items-start">
          <div className="mr-4 mt-1 w-10 h-10 flex items-center justify-center rounded-md bg-[#f0f4f9] text-[#1c3b82]">
            <Code className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-[#1c3b82] mb-2">{skill.name}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="bg-[#f5f7fa]">{skill.category}</Badge>
              
              {skill.demandTrend && (
                <Badge variant={
                  skill.demandTrend.includes('increas') ? 'default' : 
                  skill.demandTrend.includes('decreas') ? 'destructive' : 
                  'secondary'
                }>
                  {skill.demandTrend.includes('increas') && <TrendingUp className="h-3 w-3 mr-1" />}
                  {skill.demandTrend.includes('decreas') && <TrendingDown className="h-3 w-3 mr-1" />}
                  {skill.demandTrend}
                </Badge>
              )}
              
              {skill.learningDifficulty && (
                <Badge variant="outline" className="bg-[#f5f7fa]">
                  <Zap className="h-3 w-3 mr-1" />
                  {skill.learningDifficulty} difficulty
                </Badge>
              )}
            </div>
            
            {skill.sfiaFrameworkLevel && (
              <div className="text-xs text-gray-500 mb-1">
                <span className="font-medium">SFIA:</span> {skill.sfiaFrameworkLevel}
              </div>
            )}
            
            {skill.digCompFrameworkLevel && (
              <div className="text-xs text-gray-500 mb-1">
                <span className="font-medium">DigComp:</span> {skill.digCompFrameworkLevel}
              </div>
            )}
            
            <Separator className="my-3" />
            <p className="text-sm text-gray-600 line-clamp-3 mb-4">{skill.description}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-0">
        <Link href={`/skills/${skill.id}`} className="w-full">
          <div className="flex items-center justify-between px-6 py-3 bg-[#f5f7fa] hover:bg-[#e9f0fa] transition-colors">
            <span className="text-sm font-medium text-[#1c3b82]">View Skill Details</span>
            <ChevronRight className="h-4 w-4 text-[#1c3b82]" />
          </div>
        </Link>
      </CardFooter>
    </Card>
  );
}

// Role Card Component with new design
function RoleCard({ role }: { role: Role }) {
  return (
    <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-md border-2 border-[#f0f4f9] hover:border-[#d3e0f5]">
      <div className="h-2 bg-gradient-to-r from-[#a31d52] to-[#c42261]"></div>
      <CardContent className="p-6">
        <div className="flex items-start">
          <div className="mr-4 mt-1 w-10 h-10 flex items-center justify-center rounded-md bg-[#f9f0f4] text-[#a31d52]">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-[#a31d52] mb-2">{role.title}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="bg-[#f9f5f7]">{role.category}</Badge>
              
              {role.demandOutlook && (
                <Badge variant={
                  role.demandOutlook.includes('high') ? 'default' : 
                  role.demandOutlook.includes('low') ? 'destructive' : 
                  'secondary'
                }>
                  {role.demandOutlook}
                </Badge>
              )}
              
              {role.experienceRequired && (
                <Badge variant="outline" className="bg-[#f9f5f7]">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {role.experienceRequired} exp
                </Badge>
              )}
            </div>
            
            {role.averageSalary && (
              <div className="text-sm flex items-center mb-2 text-emerald-700">
                <DollarSign className="h-4 w-4 mr-0.5" />
                <span>{role.averageSalary}</span>
              </div>
            )}
            
            {role.educationRequired && (
              <div className="text-xs text-gray-500 mb-1">
                <span className="font-medium">Education:</span> {role.educationRequired}
              </div>
            )}
            
            <Separator className="my-3" />
            <p className="text-sm text-gray-600 line-clamp-3 mb-4">{role.description}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-0">
        <Link href={`/roles/${role.id}`} className="w-full">
          <div className="flex items-center justify-between px-6 py-3 bg-[#f9f5f7] hover:bg-[#f5e9ed] transition-colors">
            <span className="text-sm font-medium text-[#a31d52]">View Role Details</span>
            <ChevronRight className="h-4 w-4 text-[#a31d52]" />
          </div>
        </Link>
      </CardFooter>
    </Card>
  );
}

// Industry Card Component with new design
function IndustryCard({ industry }: { industry: Industry }) {
  return (
    <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-md border-2 border-[#f0f4f9] hover:border-[#d3e0f5]">
      <div className="h-2 bg-gradient-to-r from-[#2d6a4f] to-[#40916c]"></div>
      <CardContent className="p-6">
        <div className="flex items-start">
          <div className="mr-4 mt-1 w-10 h-10 flex items-center justify-center rounded-md bg-[#f0f9f4] text-[#2d6a4f]">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-[#2d6a4f] mb-2">{industry.name}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="bg-[#f0f9f4]">{industry.category}</Badge>
              
              {industry.growthOutlook && (
                <Badge variant={
                  industry.growthOutlook.includes('high') ? 'default' : 
                  industry.growthOutlook.includes('low') ? 'destructive' : 
                  'secondary'
                }>
                  {industry.growthOutlook}
                </Badge>
              )}
              
              {industry.technologyIntensity && (
                <Badge variant="outline" className="bg-[#f0f9f4]">
                  <Layers className="h-3 w-3 mr-1" />
                  {industry.technologyIntensity} tech
                </Badge>
              )}
            </div>
            
            {industry.disruptionLevel && (
              <div className="text-xs text-gray-500 mb-1">
                <span className="font-medium">Disruption:</span> {industry.disruptionLevel}
              </div>
            )}
            
            <Separator className="my-3" />
            <p className="text-sm text-gray-600 line-clamp-3 mb-4">{industry.description}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-0">
        <Link href={`/industries/${industry.id}`} className="w-full">
          <div className="flex items-center justify-between px-6 py-3 bg-[#f0f9f4] hover:bg-[#e1f3e8] transition-colors">
            <span className="text-sm font-medium text-[#2d6a4f]">View Industry Details</span>
            <ChevronRight className="h-4 w-4 text-[#2d6a4f]" />
          </div>
        </Link>
      </CardFooter>
    </Card>
  );
}