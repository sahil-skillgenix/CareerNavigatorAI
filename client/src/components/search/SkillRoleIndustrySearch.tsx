import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search as SearchIcon } from 'lucide-react';

// Define types for our search results
interface Skill {
  id: number;
  name: string;
  category: string;
  description: string;
  demandTrend: string;
  learningDifficulty: string;
}

interface Role {
  id: number;
  title: string;
  category: string;
  description: string;
  averageSalary: string;
  demandOutlook: string;
}

interface Industry {
  id: number;
  name: string;
  category: string;
  description: string;
  growthOutlook: string;
}

interface SearchResults {
  skills: Skill[];
  roles: Role[];
  industries: Industry[];
}

export default function SkillRoleIndustrySearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  // Fetch search results
  const { data, isLoading, error, refetch } = useQuery<SearchResults>({
    queryKey: ['/api/search', searchQuery],
    queryFn: async () => {
      if (!searchQuery.trim()) {
        return { skills: [], roles: [], industries: [] };
      }
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      return response.json();
    },
    enabled: false, // Don't run on component mount
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
    refetch();
  };

  // Count total results
  const totalResults = 
    (data?.skills?.length || 0) + 
    (data?.roles?.length || 0) + 
    (data?.industries?.length || 0);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Search Skills, Roles & Industries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search for skills, roles, or industries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <SearchIcon className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="text-red-500 mb-4 p-4 bg-red-50 rounded-md">
          Error: {error instanceof Error ? error.message : 'Failed to search'}
        </div>
      )}

      {data && totalResults > 0 && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">
              All Results ({totalResults})
            </TabsTrigger>
            <TabsTrigger value="skills" disabled={!data.skills.length}>
              Skills ({data.skills.length})
            </TabsTrigger>
            <TabsTrigger value="roles" disabled={!data.roles.length}>
              Roles ({data.roles.length})
            </TabsTrigger>
            <TabsTrigger value="industries" disabled={!data.industries.length}>
              Industries ({data.industries.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-6">
              {data.skills.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Skills</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {data.skills.slice(0, 6).map((skill) => (
                      <SkillCard key={skill.id} skill={skill} />
                    ))}
                  </div>
                  {data.skills.length > 6 && (
                    <Button 
                      variant="link" 
                      onClick={() => setActiveTab('skills')}
                      className="mt-2"
                    >
                      See all {data.skills.length} skills
                    </Button>
                  )}
                </div>
              )}

              {data.roles.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Roles</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {data.roles.slice(0, 6).map((role) => (
                      <RoleCard key={role.id} role={role} />
                    ))}
                  </div>
                  {data.roles.length > 6 && (
                    <Button 
                      variant="link" 
                      onClick={() => setActiveTab('roles')}
                      className="mt-2"
                    >
                      See all {data.roles.length} roles
                    </Button>
                  )}
                </div>
              )}

              {data.industries.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Industries</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {data.industries.slice(0, 6).map((industry) => (
                      <IndustryCard key={industry.id} industry={industry} />
                    ))}
                  </div>
                  {data.industries.length > 6 && (
                    <Button 
                      variant="link" 
                      onClick={() => setActiveTab('industries')}
                      className="mt-2"
                    >
                      See all {data.industries.length} industries
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="skills">
            <div className="grid gap-4 md:grid-cols-2">
              {data.skills.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="roles">
            <div className="grid gap-4 md:grid-cols-2">
              {data.roles.map((role) => (
                <RoleCard key={role.id} role={role} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="industries">
            <div className="grid gap-4 md:grid-cols-2">
              {data.industries.map((industry) => (
                <IndustryCard key={industry.id} industry={industry} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {data && totalResults === 0 && searchQuery && !isLoading && (
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold mb-2">No results found</h3>
          <p className="text-gray-500">
            We couldn't find any skills, roles, or industries matching "{searchQuery}".
          </p>
        </div>
      )}
    </div>
  );
}

// Skill Card Component
function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="font-semibold text-lg mb-1">{skill.name}</h4>
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="outline">{skill.category}</Badge>
          <Badge 
            variant={skill.demandTrend === 'increasing' ? 'default' : 
                  skill.demandTrend === 'decreasing' ? 'destructive' : 'secondary'}
          >
            {skill.demandTrend}
          </Badge>
          <Badge variant="outline">
            Difficulty: {skill.learningDifficulty}
          </Badge>
        </div>
        <Separator className="my-2" />
        <p className="text-sm text-gray-600 line-clamp-3">{skill.description}</p>
        <Button variant="link" className="p-0 h-auto mt-2">
          View Skill Details
        </Button>
      </CardContent>
    </Card>
  );
}

// Role Card Component
function RoleCard({ role }: { role: Role }) {
  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="font-semibold text-lg mb-1">{role.title}</h4>
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="outline">{role.category}</Badge>
          <Badge 
            variant={role.demandOutlook.includes('high') ? 'default' : 
                  role.demandOutlook.includes('low') ? 'destructive' : 'secondary'}
          >
            {role.demandOutlook}
          </Badge>
        </div>
        <p className="text-sm text-gray-700 mb-2">
          {role.averageSalary}
        </p>
        <Separator className="my-2" />
        <p className="text-sm text-gray-600 line-clamp-3">{role.description}</p>
        <Button variant="link" className="p-0 h-auto mt-2">
          View Role Details
        </Button>
      </CardContent>
    </Card>
  );
}

// Industry Card Component
function IndustryCard({ industry }: { industry: Industry }) {
  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="font-semibold text-lg mb-1">{industry.name}</h4>
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge variant="outline">{industry.category}</Badge>
          <Badge 
            variant={industry.growthOutlook.includes('high') ? 'default' : 
                  industry.growthOutlook.includes('low') ? 'destructive' : 'secondary'}
          >
            {industry.growthOutlook}
          </Badge>
        </div>
        <Separator className="my-2" />
        <p className="text-sm text-gray-600 line-clamp-3">{industry.description}</p>
        <Button variant="link" className="p-0 h-auto mt-2">
          View Industry Details
        </Button>
      </CardContent>
    </Card>
  );
}