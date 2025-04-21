import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Briefcase, Code, Book, Building, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample data for demonstration
const popularSkills = [
  { id: 1, name: "Data Analysis", category: "Technical" },
  { id: 2, name: "Project Management", category: "Management" },
  { id: 3, name: "User Experience Design", category: "Design" },
  { id: 4, name: "Machine Learning", category: "Technical" },
  { id: 5, name: "Digital Marketing", category: "Marketing" },
  { id: 6, name: "Leadership", category: "Soft Skills" },
];

const popularRoles = [
  { id: 1, name: "Software Engineer", category: "Technology" },
  { id: 2, name: "Product Manager", category: "Management" },
  { id: 3, name: "UX Designer", category: "Design" },
  { id: 4, name: "Data Scientist", category: "Technology" },
  { id: 5, name: "Marketing Specialist", category: "Marketing" },
  { id: 6, name: "Team Lead", category: "Management" },
];

const popularIndustries = [
  { id: 1, name: "Technology", category: "Private Sector" },
  { id: 2, name: "Healthcare", category: "Public/Private" },
  { id: 3, name: "Finance", category: "Private Sector" },
  { id: 4, name: "Education", category: "Public Sector" },
  { id: 5, name: "Government", category: "Public Sector" },
  { id: 6, name: "Creative Arts", category: "Various" },
];

export default function ProfessionalSearchSection() {
  const [searchTerm, setSearchTerm] = useState("");

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
              />
              <Button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#1c3b82] hover:bg-[#152d63] text-white"
              >
                Search
              </Button>
            </div>
            
            <Tabs defaultValue="skills" className="mt-8">
              <TabsList className="grid w-full grid-cols-3 bg-[#f5f7fa]">
                <TabsTrigger value="skills" className="data-[state=active]:bg-white data-[state=active]:text-[#1c3b82] data-[state=active]:shadow-sm">Skills</TabsTrigger>
                <TabsTrigger value="roles" className="data-[state=active]:bg-white data-[state=active]:text-[#1c3b82] data-[state=active]:shadow-sm">Roles</TabsTrigger>
                <TabsTrigger value="industries" className="data-[state=active]:bg-white data-[state=active]:text-[#1c3b82] data-[state=active]:shadow-sm">Industries</TabsTrigger>
              </TabsList>
              
              <TabsContent value="skills" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularSkills.map((skill) => (
                    <Link key={skill.id} href="/auth">
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
                  <Link href="/auth">
                    <Button variant="outline" className="border-[#1c3b82] text-[#1c3b82]">
                      View All Skills
                    </Button>
                  </Link>
                </div>
              </TabsContent>
              
              <TabsContent value="roles" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularRoles.map((role) => (
                    <Link key={role.id} href="/auth">
                      <div className="flex items-center p-4 border border-[#e4e9f2] rounded-md hover:bg-[#f5f7fa] transition-colors cursor-pointer">
                        <div className="mr-4 w-10 h-10 flex items-center justify-center rounded-md bg-[#f5f7fa] text-[#1c3b82]">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="font-medium text-gray-900">{role.name}</h4>
                          <p className="text-sm text-gray-500">{role.category}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </Link>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-center">
                  <Link href="/auth">
                    <Button variant="outline" className="border-[#1c3b82] text-[#1c3b82]">
                      View All Roles
                    </Button>
                  </Link>
                </div>
              </TabsContent>
              
              <TabsContent value="industries" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularIndustries.map((industry) => (
                    <Link key={industry.id} href="/auth">
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
                  <Link href="/auth">
                    <Button variant="outline" className="border-[#1c3b82] text-[#1c3b82]">
                      View All Industries
                    </Button>
                  </Link>
                </div>
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