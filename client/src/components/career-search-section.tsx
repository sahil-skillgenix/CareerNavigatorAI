import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Briefcase, 
  Lightbulb, 
  Building2, 
  GraduationCap, 
  ArrowRight, 
  BriefcaseIcon, 
  Code,
  UsersRound
} from 'lucide-react';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';

// Sample data for demonstration
const popularSkills = [
  { id: 1, name: "Data Analysis", icon: <Code className="h-5 w-5" /> },
  { id: 2, name: "Project Management", icon: <Briefcase className="h-5 w-5" /> },
  { id: 3, name: "User Experience Design", icon: <Lightbulb className="h-5 w-5" /> },
  { id: 4, name: "Machine Learning", icon: <Code className="h-5 w-5" /> },
  { id: 5, name: "Digital Marketing", icon: <Building2 className="h-5 w-5" /> },
  { id: 6, name: "Leadership", icon: <UsersRound className="h-5 w-5" /> },
];

const popularRoles = [
  { id: 1, name: "Software Engineer", icon: <Code className="h-5 w-5" /> },
  { id: 2, name: "Product Manager", icon: <Briefcase className="h-5 w-5" /> },
  { id: 3, name: "UX Designer", icon: <Lightbulb className="h-5 w-5" /> },
  { id: 4, name: "Data Scientist", icon: <Code className="h-5 w-5" /> },
  { id: 5, name: "Marketing Specialist", icon: <Building2 className="h-5 w-5" /> },
  { id: 6, name: "Team Lead", icon: <UsersRound className="h-5 w-5" /> },
];

const popularIndustries = [
  { id: 1, name: "Technology", icon: <Code className="h-5 w-5" /> },
  { id: 2, name: "Healthcare", icon: <Building2 className="h-5 w-5" /> },
  { id: 3, name: "Finance", icon: <Building2 className="h-5 w-5" /> },
  { id: 4, name: "Education", icon: <GraduationCap className="h-5 w-5" /> },
  { id: 5, name: "Government", icon: <Building2 className="h-5 w-5" /> },
  { id: 6, name: "Creative Arts", icon: <Lightbulb className="h-5 w-5" /> },
];

export default function CareerSearchSection() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-20 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100 rounded-full filter blur-3xl opacity-20 translate-y-1/4"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-indigo-100 rounded-full filter blur-3xl opacity-20"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-bold text-3xl md:text-5xl mb-6">
            Explore Career Possibilities
          </h2>
          <p className="text-lg text-neutral-600 md:text-xl max-w-2xl mx-auto">
            Discover pathways for skills you want to develop, roles you aspire to, or industries that interest you.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bg-white rounded-xl shadow-xl max-w-5xl mx-auto overflow-hidden"
        >
          <div className="p-8">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for skills, roles, or industries..."
                className="pl-12 pr-4 py-6 w-full rounded-lg text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button 
                className="absolute right-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Search
              </Button>
            </div>
            
            <Tabs defaultValue="skills" className="mt-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="roles">Roles</TabsTrigger>
                <TabsTrigger value="industries">Industries</TabsTrigger>
              </TabsList>
              
              <TabsContent value="skills" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularSkills.map((skill) => (
                    <Card key={skill.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <Link href={`/auth`} className="block">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-600">
                            {skill.icon}
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-medium text-gray-900">{skill.name}</h4>
                            <p className="text-sm text-gray-500">Explore pathways</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400" />
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Link href="/auth">
                    <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:text-indigo-700 hover:border-indigo-700">
                      View All Skills
                    </Button>
                  </Link>
                </div>
              </TabsContent>
              
              <TabsContent value="roles" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularRoles.map((role) => (
                    <Card key={role.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <Link href={`/auth`} className="block">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-600">
                            {role.icon}
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-medium text-gray-900">{role.name}</h4>
                            <p className="text-sm text-gray-500">Explore pathways</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400" />
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Link href="/auth">
                    <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:text-indigo-700 hover:border-indigo-700">
                      View All Roles
                    </Button>
                  </Link>
                </div>
              </TabsContent>
              
              <TabsContent value="industries" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {popularIndustries.map((industry) => (
                    <Card key={industry.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <Link href={`/auth`} className="block">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-indigo-600">
                            {industry.icon}
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-medium text-gray-900">{industry.name}</h4>
                            <p className="text-sm text-gray-500">Explore pathways</p>
                          </div>
                          <ArrowRight className="h-5 w-5 text-gray-400" />
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Link href="/auth">
                    <Button variant="outline" className="border-indigo-600 text-indigo-600 hover:text-indigo-700 hover:border-indigo-700">
                      View All Industries
                    </Button>
                  </Link>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Ready to explore your personalized career path?</h3>
                <p className="text-indigo-100">Create an account to get detailed insights and recommendations.</p>
              </div>
              <Link href="/auth">
                <Button className="mt-4 md:mt-0 bg-white text-indigo-600 hover:bg-indigo-50">
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