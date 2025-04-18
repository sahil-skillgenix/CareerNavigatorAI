import { useState, useRef } from "react";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { LoaderCircle, Upload, Building, BriefcaseBusiness, FileSpreadsheet, BookOpen, GraduationCap, Award, CheckCircle2, Workflow, Share2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

// Sample organizations
const SAMPLE_ORGANIZATIONS = [
  { id: "1", name: "Telstra" },
  { id: "2", name: "Commonwealth Bank" },
  { id: "3", name: "Westpac" },
  { id: "4", name: "Deloitte Australia" },
  { id: "5", name: "BHP" },
  { id: "6", name: "Optus" },
  { id: "7", name: "Woolworths Group" },
  { id: "8", name: "Coles Group" },
  { id: "9", name: "AMP" },
  { id: "10", name: "NAB" },
];

const formSchema = z.object({
  organizationId: z.string().optional(),
  organizationName: z.string().optional(),
  currentRole: z.string().min(2, "Current role is required"),
  skills: z.string().min(5, "Please provide your current skills"),
  desiredRole: z.string().min(2, "Desired role is required"),
}).refine(data => data.organizationId || data.organizationName, {
  message: "Either select an organization or enter a new organization name",
  path: ["organizationId", "organizationName"],
});

type FormData = z.infer<typeof formSchema>;

// Result type
interface OrganizationalAnalysisResult {
  organizationInfo: {
    name: string;
    structureOverview: string;
    industryPosition: string;
  };
  currentRoleAnalysis: {
    role: string;
    level: string;
    keyResponsibilities: string[];
    reportingStructure: string;
  };
  skillMapping: {
    sfia9: Array<{skill: string, level: string, description: string}>;
    digcomp22: Array<{competency: string, level: string, description: string}>;
  };
  skillGapAnalysis: {
    gaps: Array<{skill: string, importance: string, description: string, framework: string}>;
    strengths: Array<{skill: string, level: string, relevance: string, description: string}>;
  };
  careerPathwayOptions: {
    withDegree: Array<{
      step: number;
      role: string;
      level: string;
      timeframe: string;
      keySkillsNeeded: string[];
      description: string;
      requiredQualification?: string;
      licenseRequired?: string;
      licenseInfo?: string;
      courseLink?: string;
      licenseLink?: string;
    }>;
    withoutDegree: Array<{
      step: number;
      role: string;
      level: string;
      timeframe: string;
      keySkillsNeeded: string[];
      description: string;
      alternativeQualification?: string;
      licenseRequired?: string;
      licenseInfo?: string;
      courseLink?: string;
      licenseLink?: string;
    }>;
    lateralMovement: Array<{
      role: string;
      department: string;
      skillTransferability: string;
      requiredAdditionalSkills: string[];
      benefits: string[];
    }>;
  };
  developmentPlan: {
    skillsToAcquire: Array<{
      skill: string,
      priority: string,
      resources: string[],
      estimatedTime: string,
      fastTrackMethod: string,
      licenseRequired?: string,
      licenseInfo?: string,
      licenseLink?: string
    }>;
    recommendedCertifications: {
      university: string[];
      vocational: string[]; // TAFE in Australia, Community College in USA, Further Education in UK, etc.
      online: string[];
      universityLinks?: Array<{name: string, url: string}>;
      vocationalLinks?: Array<{name: string, url: string}>;
    };
    suggestedProjects: string[];
    learningPath: string;
    socialSkills: Array<{
      category: string,
      skills: Array<{name: string, benefit: string, developmentMethod: string}>
    }>;
  };
  similarRoles: Array<{
    title: string;
    similarity: string;
    description: string;
    salaryRange: string;
    growthOutlook: string;
    transferableSkills: string[];
  }>;
  organizationalFitAnalysis: {
    valueAlignment: string;
    culturalFitScore: number;
    growthOpportunityScore: number;
    retentionRiskFactors: string[];
    recommendedActions: string[];
  };
}

export function OrganizationPathwayForm() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("select");
  const [selectedOrganization, setSelectedOrganization] = useState<string | undefined>();
  const [newOrgName, setNewOrgName] = useState("");
  const [orgFile, setOrgFile] = useState<File | null>(null);
  const [currentRole, setCurrentRole] = useState("");
  const [skills, setSkills] = useState("");
  const [desiredRole, setDesiredRole] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<OrganizationalAnalysisResult | null>(null);
  const [pathwayTab, setPathwayTab] = useState("degree");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setOrgFile(e.target.files[0]);
    }
  };

  const handleFileButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const organizationPathwayMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const orgName = data.organizationId ? 
        SAMPLE_ORGANIZATIONS.find(org => org.id === data.organizationId)?.name || "" : 
        data.organizationName || "";
      
      // Return comprehensive mock data
      return {
        organizationInfo: {
          name: orgName,
          structureOverview: "Hierarchical with 5 primary divisions and matrix management",
          industryPosition: "Leader in Australian technology sector",
        },
        currentRoleAnalysis: {
          role: data.currentRole,
          level: "Mid-level",
          keyResponsibilities: [
            "Project management for medium-sized initiatives",
            "Team coordination across multiple departments",
            "Stakeholder communication and engagement",
            "Resource allocation and planning"
          ],
          reportingStructure: "Reports to Senior Manager, with 3 direct reports"
        },
        skillMapping: {
          sfia9: [
            { skill: "Digital Product Management", level: "Level 4", description: "Designs and manages digital products to meet organizational goals and user needs." },
            { skill: "Project Management", level: "Level 3", description: "Plans, schedules, monitors, and reports on activities within established constraints." },
            { skill: "Stakeholder Management", level: "Level 4", description: "Identifies and engages with stakeholders, ensuring their needs are represented in decisions." }
          ],
          digcomp22: [
            { competency: "Communication and Collaboration", level: "Intermediate", description: "Uses digital technologies to share data and collaborate through digital channels." },
            { competency: "Digital Content Creation", level: "Advanced", description: "Creates and edits digital content in different formats, integrating information." },
            { competency: "Problem Solving", level: "Intermediate", description: "Identifies digital needs, solves technical problems and uses digital tools creatively." }
          ]
        },
        skillGapAnalysis: {
          gaps: [
            { skill: "Enterprise Architecture", importance: "High", description: "Understanding of enterprise-wide technical infrastructure and strategies.", framework: "SFIA 9" },
            { skill: "Data Security", importance: "Critical", description: "Implementation of security controls to protect organizational data.", framework: "SFIA 9" },
            { skill: "Digital Literacy", importance: "Medium", description: "Advanced understanding of digital tools and platforms.", framework: "DigComp 2.2" }
          ],
          strengths: [
            { skill: "Project Management", level: "Advanced", relevance: "High", description: "Demonstrated ability to plan, execute and close projects successfully." },
            { skill: "Team Leadership", level: "Proficient", relevance: "High", description: "Experience managing cross-functional teams and developing team members." },
            { skill: "Communication", level: "Advanced", relevance: "High", description: "Strong written and verbal communication with various stakeholders." }
          ]
        },
        careerPathwayOptions: {
          withDegree: [
            {
              step: 1,
              role: "Senior Project Manager",
              level: "Upper-Mid",
              timeframe: "1-2 years",
              keySkillsNeeded: ["Advanced risk management", "Strategic planning", "Executive communication"],
              description: "Lead larger, more complex projects with greater organizational impact",
              requiredQualification: "Bachelor's in Business, IT or related field",
              licenseRequired: "PRINCE2 Practitioner",
              licenseInfo: "Internationally recognized project management certification",
              courseLink: "https://www.axelos.com/certifications/propath/prince2",
              licenseLink: "https://www.axelos.com/certifications/prince2"
            },
            {
              step: 2,
              role: "Portfolio Manager",
              level: "Senior",
              timeframe: "2-3 years",
              keySkillsNeeded: ["Portfolio optimization", "Resource allocation", "Strategic alignment"],
              description: "Oversee multiple projects and programs aligned with organizational strategy",
              requiredQualification: "Master's in Business Administration or Project Management",
              licenseRequired: "Portfolio Management Professional (PfMP)",
              licenseInfo: "Advanced credential for portfolio management professionals",
              courseLink: "https://www.pmi.org/certifications/portfolio-management-pfmp",
              licenseLink: "https://www.pmi.org/certifications/portfolio-management-pfmp"
            }
          ],
          withoutDegree: [
            {
              step: 1,
              role: "Senior Project Coordinator",
              level: "Mid",
              timeframe: "1-2 years",
              keySkillsNeeded: ["Process improvement", "Team management", "Budget tracking"],
              description: "Support multiple projects with increased responsibility and autonomy",
              alternativeQualification: "Certificate IV in Project Management Practice",
              licenseRequired: "CAPM (Certified Associate in Project Management)",
              licenseInfo: "Entry-level certification for project practitioners",
              courseLink: "https://training.gov.au/Training/Details/BSB40920",
              licenseLink: "https://www.pmi.org/certifications/certified-associate-capm"
            },
            {
              step: 2,
              role: "Assistant Project Manager",
              level: "Upper-Mid",
              timeframe: "1-2 years",
              keySkillsNeeded: ["Project planning", "Risk assessment", "Stakeholder engagement"],
              description: "Manage small to medium projects with supervision from senior managers",
              alternativeQualification: "Diploma of Project Management",
              licenseRequired: "Professional in Project Management (PPM)",
              licenseInfo: "Industry-recognized certification for project managers",
              courseLink: "https://training.gov.au/Training/Details/BSB50820",
              licenseLink: "https://www.aipm.com.au/certification/aipm-certification/ppm"
            }
          ],
          lateralMovement: [
            {
              role: "Business Analyst",
              department: "Business Solutions",
              skillTransferability: "High (80%)",
              requiredAdditionalSkills: ["Requirements elicitation", "Process modeling", "Systems analysis"],
              benefits: ["Exposure to different business areas", "More analysis-focused work", "Direct business impact"]
            },
            {
              role: "Product Owner",
              department: "Digital Products",
              skillTransferability: "Medium (65%)",
              requiredAdditionalSkills: ["User story development", "Product roadmapping", "Agile methodologies"],
              benefits: ["Customer-facing role", "Greater influence on product direction", "Exposure to agile practices"]
            }
          ]
        },
        developmentPlan: {
          skillsToAcquire: [
            {
              skill: "Enterprise Architecture",
              priority: "High",
              resources: ["TOGAF Certification", "Enterprise Architecture course at University of Melbourne", "Architecture forums within the organization"],
              estimatedTime: "6-9 months",
              fastTrackMethod: "Intensive TOGAF course with exam voucher",
              licenseRequired: "TOGAF 9.2 Certification",
              licenseInfo: "The Open Group Architecture Framework certification",
              licenseLink: "https://www.opengroup.org/togaf-certification"
            },
            {
              skill: "Data Security",
              priority: "Critical",
              resources: ["ISC2 CISSP preparation", "Cybersecurity fundamentals course", "Information security workshops"],
              estimatedTime: "3-6 months",
              fastTrackMethod: "Security+ certification as stepping stone to CISSP",
              licenseRequired: "Security+ Certification",
              licenseInfo: "CompTIA security certification for IT professionals",
              licenseLink: "https://www.comptia.org/certifications/security"
            }
          ],
          recommendedCertifications: {
            university: ["Graduate Certificate in Enterprise Architecture", "Master of IT Leadership", "Graduate Diploma in Digital Transformation"],
            vocational: ["Advanced Diploma in IT Business Analysis", "Diploma in Project Management", "Certificate IV in Cybersecurity"],
            online: ["Certified ScrumMaster", "AWS Certified Solutions Architect", "Google Project Management Certificate"],
            universityLinks: [
              { name: "Graduate Certificate in Enterprise Architecture - RMIT", url: "https://www.rmit.edu.au/study-with-us/levels-of-study/postgraduate-study/graduate-certificates/gc112" },
              { name: "Master of IT Leadership - University of Technology Sydney", url: "https://www.uts.edu.au/study/find-a-course/master-information-technology-leadership" }
            ],
            vocationalLinks: [
              { name: "Advanced Diploma in IT Business Analysis - TAFE NSW", url: "https://www.tafensw.edu.au/course/-/c/c/ICT60120-01/Advanced-Diploma-of-Information-Technology-(Business-Analysis)" },
              { name: "Diploma in Project Management - TAFE Queensland", url: "https://tafeqld.edu.au/courses/18115/diploma-of-project-management" }
            ]
          },
          suggestedProjects: [
            "Lead a cross-functional working group to optimize internal project management processes",
            "Volunteer to coordinate a digital transformation initiative in your current department",
            "Develop and implement a knowledge management system for project learnings"
          ],
          learningPath: "Focus initially on strengthening project management credentials through advanced certification, then branch into enterprise architecture and data security domains. Balance formal learning with practical application through internal projects.",
          socialSkills: [
            {
              category: "Leadership",
              skills: [
                { name: "Executive Presence", benefit: "Enhances credibility with senior management", developmentMethod: "Leadership coaching and presentation workshops" },
                { name: "Strategic Thinking", benefit: "Enables higher-level decision making", developmentMethod: "Strategy courses and mentorship from executives" }
              ]
            },
            {
              category: "Influence",
              skills: [
                { name: "Negotiation", benefit: "Secures resources and resolves conflicts", developmentMethod: "Negotiation workshops and role-playing exercises" },
                { name: "Stakeholder Management", benefit: "Builds stronger business relationships", developmentMethod: "Relationship-building training and practical application" }
              ]
            }
          ]
        },
        similarRoles: [
          {
            title: "Program Manager",
            similarity: "High (85%)",
            description: "Oversees multiple related projects to achieve strategic objectives",
            salaryRange: "AU$130,000 - AU$180,000",
            growthOutlook: "Strong (15% growth over 5 years)",
            transferableSkills: ["Strategic planning", "Leadership", "Stakeholder management", "Budget oversight"]
          },
          {
            title: "Change Manager",
            similarity: "Medium (70%)",
            description: "Facilitates organizational transitions and manages associated impacts",
            salaryRange: "AU$110,000 - AU$160,000",
            growthOutlook: "Moderate (10% growth over 5 years)",
            transferableSkills: ["Stakeholder engagement", "Communication", "Impact assessment", "Training development"]
          }
        ],
        organizationalFitAnalysis: {
          valueAlignment: "Your interest in collaborative and innovative approaches aligns well with the organization's core values.",
          culturalFitScore: 85,
          growthOpportunityScore: 80,
          retentionRiskFactors: ["Limited advancement opportunities in current role", "Skill development plateau", "Compensation below market rate for advanced skills"],
          recommendedActions: ["Participate in leadership development program", "Seek mentorship from senior executives", "Engage with cross-functional projects"]
        }
      };
    },
    onError: (error: Error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      setResults(data);
      setShowResults(true);
      
      // Scroll to results after a small delay to ensure DOM updates
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData: FormData = {
      organizationId: activeTab === "select" ? selectedOrganization : undefined,
      organizationName: activeTab === "new" ? newOrgName : undefined,
      currentRole,
      skills,
      desiredRole
    };
    
    try {
      // Validate form data
      formSchema.parse(formData);
      
      // Call the API
      organizationPathwayMutation.mutate(formData);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
        toast({
          title: "Validation Error",
          description: errors.join(", "),
          variant: "destructive",
        });
      }
    }
  };

  const handleReset = () => {
    setShowResults(false);
    setResults(null);
    setActiveTab("select");
    setSelectedOrganization(undefined);
    setNewOrgName("");
    setOrgFile(null);
    setCurrentRole("");
    setSkills("");
    setDesiredRole("");
  };

  return (
    <div className="max-w-5xl mx-auto">
      {!showResults ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl border shadow-md overflow-hidden"
        >
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
            <h2 className="text-2xl font-bold">Organizational Career Pathway Analysis</h2>
            <p className="mt-2 text-indigo-100">
              Analyze your career progression opportunities within a specific organization.
              Select an existing organization or add a new one to get started.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="select">Select Organization</TabsTrigger>
                <TabsTrigger value="new">Add New Organization</TabsTrigger>
              </TabsList>
              
              <TabsContent value="select" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="organization">Select Organization</Label>
                  <Select 
                    value={selectedOrganization} 
                    onValueChange={setSelectedOrganization}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {SAMPLE_ORGANIZATIONS.map(org => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              
              <TabsContent value="new" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name</Label>
                  <Input
                    id="organizationName"
                    placeholder="Enter organization name"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="organizationFile">Upload Organization Structure (optional)</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleFileButtonClick}
                      className="flex items-center gap-2"
                    >
                      <Upload size={16} />
                      {orgFile ? 'Change File' : 'Select File'}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      {orgFile ? orgFile.name : 'No file selected (Excel or CSV)'}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="organizationFile"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="grid gap-4 mt-6">
              <div className="space-y-2">
                <Label htmlFor="currentRole">Current Role</Label>
                <Input
                  id="currentRole"
                  placeholder="e.g. IT Project Manager"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="skills">Your Skills</Label>
                <Textarea
                  id="skills"
                  placeholder="List your key skills separated by commas (e.g. project management, stakeholder communication, technical documentation)"
                  className="min-h-[100px]"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="desiredRole">Desired Future Role</Label>
                <Input
                  id="desiredRole"
                  placeholder="e.g. IT Director"
                  value={desiredRole}
                  onChange={(e) => setDesiredRole(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                disabled={organizationPathwayMutation.isPending}
              >
                {organizationPathwayMutation.isPending ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Generating Organizational Career Pathway...
                  </>
                ) : (
                  'Generate Organizational Career Pathway'
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      ) : (
        <div ref={resultsRef}>
          {results && (
            <div className="space-y-8">
              {/* Organization Info Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl border shadow-md overflow-hidden"
              >
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">Organizational Pathway Analysis</h2>
                      <p className="mt-1 text-indigo-100">
                        Career development opportunities at {results.organizationInfo.name}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="bg-white text-indigo-600 hover:bg-indigo-50"
                      onClick={handleReset}
                    >
                      Analyze Another Organization
                    </Button>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Organization Info & Current Role Analysis */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center text-lg">
                          <Building className="mr-2 h-5 w-5 text-indigo-500" />
                          Organization Overview
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <h3 className="font-bold text-lg">{results.organizationInfo.name}</h3>
                        <p className="text-muted-foreground mt-1">{results.organizationInfo.industryPosition}</p>
                        <p className="mt-3">{results.organizationInfo.structureOverview}</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center text-lg">
                          <BriefcaseBusiness className="mr-2 h-5 w-5 text-indigo-500" />
                          Current Role Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <h3 className="font-bold text-lg">{results.currentRoleAnalysis.role}</h3>
                        <p className="text-muted-foreground mt-1">
                          {results.currentRoleAnalysis.level} • {results.currentRoleAnalysis.reportingStructure}
                        </p>
                        
                        <div className="mt-3">
                          <h4 className="font-medium">Key Responsibilities:</h4>
                          <ul className="list-disc list-inside mt-1">
                            {results.currentRoleAnalysis.keyResponsibilities.map((resp, index) => (
                              <li key={index}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Skills Mapping & Analysis */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-8"
                  >
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <FileSpreadsheet className="mr-2 h-5 w-5 text-indigo-500" />
                      Skills Framework Mapping
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <Badge className="mr-2 bg-blue-600">SFIA 9</Badge>
                            Skills Framework for the Information Age
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {results.skillMapping.sfia9.map((skill, index) => (
                            <div key={index} className="mb-3 pb-3 border-b last:border-0 last:pb-0 last:mb-0">
                              <div className="flex justify-between">
                                <h4 className="font-medium">{skill.skill}</h4>
                                <Badge variant="outline" className="ml-2">{skill.level}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{skill.description}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex items-center">
                            <Badge className="mr-2 bg-green-600">DigComp 2.2</Badge>
                            Digital Competence Framework
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {results.skillMapping.digcomp22.map((competency, index) => (
                            <div key={index} className="mb-3 pb-3 border-b last:border-0 last:pb-0 last:mb-0">
                              <div className="flex justify-between">
                                <h4 className="font-medium">{competency.competency}</h4>
                                <Badge variant="outline" className="ml-2">{competency.level}</Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{competency.description}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>

                  {/* Skill Gap Analysis */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8"
                  >
                    <h3 className="text-xl font-bold mb-4">Skill Gap Analysis</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-amber-600">Areas for Development</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {results.skillGapAnalysis.gaps.map((gap, index) => (
                            <div key={index} className="mb-4 last:mb-0">
                              <div className="flex justify-between items-center mb-1">
                                <h4 className="font-medium">{gap.skill}</h4>
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    className={
                                      gap.importance === "Critical" ? "bg-red-500" : 
                                      gap.importance === "High" ? "bg-orange-500" : 
                                      "bg-yellow-500"
                                    }
                                  >
                                    {gap.importance}
                                  </Badge>
                                  <Badge variant="outline" className="border-gray-300 text-xs">
                                    {gap.framework}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">{gap.description}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg text-emerald-600">Current Strengths</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {results.skillGapAnalysis.strengths.map((strength, index) => (
                            <div key={index} className="mb-4 last:mb-0">
                              <div className="flex justify-between items-center mb-1">
                                <h4 className="font-medium">{strength.skill}</h4>
                                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                  {strength.level}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{strength.description}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>
                  </motion.div>

                  {/* Career Pathway Options */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mb-8"
                  >
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <Workflow className="mr-2 h-5 w-5 text-indigo-500" />
                      Career Pathway Options
                    </h3>

                    <Tabs value={pathwayTab} onValueChange={setPathwayTab} className="mb-6">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="degree" className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4" />
                          University Pathway
                        </TabsTrigger>
                        <TabsTrigger value="nondegree" className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          TAFE/Skills Pathway
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="degree" className="space-y-4 mt-4">
                        <div className="grid gap-4">
                          {results.careerPathwayOptions.withDegree.map((step, index) => (
                            <Card key={index}>
                              <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center mb-2">
                                    <div className="bg-indigo-100 text-indigo-800 font-semibold h-8 w-8 rounded-full flex items-center justify-center mr-3">
                                      {step.step}
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-lg">{step.role}</h4>
                                      <p className="text-sm text-muted-foreground">{step.level} • {step.timeframe}</p>
                                    </div>
                                  </div>
                                  <Progress 
                                    value={step.step * 25} 
                                    className="w-20 h-2"
                                  />
                                </div>
                                
                                <p className="mt-3 text-gray-700">{step.description}</p>
                                
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="font-medium text-sm mb-1">Required Skills</h5>
                                    <div className="flex flex-wrap gap-1">
                                      {step.keySkillsNeeded.map((skill, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h5 className="font-medium text-sm mb-1">Required Qualification</h5>
                                    <p className="text-sm">{step.requiredQualification}</p>
                                    
                                    {step.licenseRequired && (
                                      <div className="mt-2">
                                        <h5 className="font-medium text-sm mb-1">License/Certification</h5>
                                        <div className="flex items-center gap-2">
                                          <Badge className="bg-blue-500">{step.licenseRequired}</Badge>
                                          {step.licenseLink && (
                                            <a 
                                              href={step.licenseLink} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-xs inline-flex items-center text-blue-600 hover:underline"
                                            >
                                              <ExternalLink className="h-3 w-3 mr-1" />
                                              Details
                                            </a>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">{step.licenseInfo}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {step.courseLink && (
                                  <div className="mt-3 text-sm">
                                    <a 
                                      href={step.courseLink} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline inline-flex items-center"
                                    >
                                      <BookOpen className="h-3 w-3 mr-1" />
                                      View related course
                                    </a>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="nondegree" className="space-y-4 mt-4">
                        <div className="grid gap-4">
                          {results.careerPathwayOptions.withoutDegree.map((step, index) => (
                            <Card key={index}>
                              <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center mb-2">
                                    <div className="bg-indigo-100 text-indigo-800 font-semibold h-8 w-8 rounded-full flex items-center justify-center mr-3">
                                      {step.step}
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-lg">{step.role}</h4>
                                      <p className="text-sm text-muted-foreground">{step.level} • {step.timeframe}</p>
                                    </div>
                                  </div>
                                  <Progress 
                                    value={step.step * 25} 
                                    className="w-20 h-2"
                                  />
                                </div>
                                
                                <p className="mt-3 text-gray-700">{step.description}</p>
                                
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="font-medium text-sm mb-1">Required Skills</h5>
                                    <div className="flex flex-wrap gap-1">
                                      {step.keySkillsNeeded.map((skill, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                                      ))}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h5 className="font-medium text-sm mb-1">Alternative Qualification</h5>
                                    <p className="text-sm">{step.alternativeQualification}</p>
                                    
                                    {step.licenseRequired && (
                                      <div className="mt-2">
                                        <h5 className="font-medium text-sm mb-1">License/Certification</h5>
                                        <div className="flex items-center gap-2">
                                          <Badge className="bg-blue-500">{step.licenseRequired}</Badge>
                                          {step.licenseLink && (
                                            <a 
                                              href={step.licenseLink} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-xs inline-flex items-center text-blue-600 hover:underline"
                                            >
                                              <ExternalLink className="h-3 w-3 mr-1" />
                                              Details
                                            </a>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">{step.licenseInfo}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {step.courseLink && (
                                  <div className="mt-3 text-sm">
                                    <a 
                                      href={step.courseLink} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline inline-flex items-center"
                                    >
                                      <BookOpen className="h-3 w-3 mr-1" />
                                      View related course
                                    </a>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>

                    <Card className="mt-6">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Share2 className="mr-2 h-5 w-5 text-indigo-500" />
                          Lateral Movement Opportunities
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4">
                          {results.careerPathwayOptions.lateralMovement.map((move, index) => (
                            <div key={index} className={`p-4 rounded-lg ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium text-lg">{move.role}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {move.department}
                                </Badge>
                              </div>
                              
                              <div className="mt-2">
                                <div className="flex items-center mb-1">
                                  <span className="text-sm font-medium mr-2">Skill Transferability:</span>
                                  <span className="text-sm text-green-600 font-medium">{move.skillTransferability}</span>
                                </div>
                                
                                <div className="mt-2">
                                  <h5 className="text-sm font-medium mb-1">Required Additional Skills:</h5>
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {move.requiredAdditionalSkills.map((skill, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">{skill}</Badge>
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="mt-2">
                                  <h5 className="text-sm font-medium mb-1">Benefits:</h5>
                                  <ul className="text-sm list-disc list-inside">
                                    {move.benefits.map((benefit, idx) => (
                                      <li key={idx}>{benefit}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Development Plan & Certifications */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mb-8"
                  >
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <GraduationCap className="mr-2 h-5 w-5 text-indigo-500" />
                      Development Plan
                    </h3>

                    <Accordion type="single" collapsible className="mb-6">
                      <AccordionItem value="skills">
                        <AccordionTrigger className="text-lg font-medium">Skills to Acquire</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-2">
                            {results.developmentPlan.skillsToAcquire.map((skill, index) => (
                              <Card key={index}>
                                <CardContent className="pt-6">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-lg">{skill.skill}</h4>
                                    <Badge 
                                      className={
                                        skill.priority === "Critical" ? "bg-red-500" : 
                                        skill.priority === "High" ? "bg-orange-500" : 
                                        "bg-yellow-500"
                                      }
                                    >
                                      {skill.priority} Priority
                                    </Badge>
                                  </div>
                                  
                                  <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                      <h5 className="text-sm font-medium mb-1">Recommended Resources:</h5>
                                      <ul className="list-disc list-inside text-sm">
                                        {skill.resources.map((resource, idx) => (
                                          <li key={idx}>{resource}</li>
                                        ))}
                                      </ul>
                                    </div>
                                    
                                    <div>
                                      <div className="mb-2">
                                        <h5 className="text-sm font-medium mb-1">Estimated Development Time:</h5>
                                        <p className="text-sm">{skill.estimatedTime}</p>
                                      </div>
                                      
                                      <div>
                                        <h5 className="text-sm font-medium mb-1">Fast-Track Method:</h5>
                                        <p className="text-sm">{skill.fastTrackMethod}</p>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {skill.licenseRequired && (
                                    <div className="mt-3 border-t pt-3">
                                      <div className="flex items-center gap-2">
                                        <Award className="h-4 w-4 text-blue-600" />
                                        <h5 className="text-sm font-medium">Required Certification:</h5>
                                        <Badge className="bg-blue-500 ml-1">{skill.licenseRequired}</Badge>
                                      </div>
                                      <p className="text-sm mt-1">{skill.licenseInfo}</p>
                                      
                                      {skill.licenseLink && (
                                        <a 
                                          href={skill.licenseLink} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-sm text-blue-600 hover:underline inline-flex items-center mt-1"
                                        >
                                          <ExternalLink className="h-3 w-3 mr-1" />
                                          Learn more about certification
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="certifications">
                        <AccordionTrigger className="text-lg font-medium">Recommended Educational Programs</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center">
                                  <GraduationCap className="mr-2 h-5 w-5 text-indigo-500" />
                                  University Options
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="space-y-2">
                                  {results.developmentPlan.recommendedCertifications.university.map((cert, index) => (
                                    <li key={index} className="flex items-start">
                                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                      <span>{cert}</span>
                                    </li>
                                  ))}
                                </ul>
                                
                                {results.developmentPlan.recommendedCertifications.universityLinks && (
                                  <div className="mt-4 pt-3 border-t">
                                    <h5 className="text-sm font-medium mb-2">Featured Programs:</h5>
                                    <ul className="space-y-2">
                                      {results.developmentPlan.recommendedCertifications.universityLinks.map((link, index) => (
                                        <li key={index}>
                                          <a 
                                            href={link.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline inline-flex items-center"
                                          >
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            {link.name}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center">
                                  <Award className="mr-2 h-5 w-5 text-indigo-500" />
                                  TAFE & Vocational Options
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ul className="space-y-2">
                                  {results.developmentPlan.recommendedCertifications.vocational.map((cert, index) => (
                                    <li key={index} className="flex items-start">
                                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                      <span>{cert}</span>
                                    </li>
                                  ))}
                                </ul>
                                
                                {results.developmentPlan.recommendedCertifications.vocationalLinks && (
                                  <div className="mt-4 pt-3 border-t">
                                    <h5 className="text-sm font-medium mb-2">Featured Programs:</h5>
                                    <ul className="space-y-2">
                                      {results.developmentPlan.recommendedCertifications.vocationalLinks.map((link, index) => (
                                        <li key={index}>
                                          <a 
                                            href={link.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:underline inline-flex items-center"
                                          >
                                            <ExternalLink className="h-3 w-3 mr-1" />
                                            {link.name}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </div>
                          
                          <Card className="mt-4">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">Online Learning Options</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {results.developmentPlan.recommendedCertifications.online.map((cert, index) => (
                                  <li key={index} className="flex items-start">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                    <span>{cert}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="projects">
                        <AccordionTrigger className="text-lg font-medium">Suggested Projects</AccordionTrigger>
                        <AccordionContent>
                          <Card>
                            <CardContent className="pt-6">
                              <ul className="space-y-3">
                                {results.developmentPlan.suggestedProjects.map((project, index) => (
                                  <li key={index} className="flex items-start">
                                    <div className="bg-indigo-100 text-indigo-800 font-semibold h-6 w-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                                      {index + 1}
                                    </div>
                                    <p>{project}</p>
                                  </li>
                                ))}
                              </ul>
                              
                              <div className="mt-4 pt-4 border-t">
                                <h5 className="font-medium mb-2">Recommended Learning Path:</h5>
                                <p className="text-gray-700">{results.developmentPlan.learningPath}</p>
                              </div>
                            </CardContent>
                          </Card>
                        </AccordionContent>
                      </AccordionItem>
                      
                      <AccordionItem value="social">
                        <AccordionTrigger className="text-lg font-medium">Social Skills Development</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            {results.developmentPlan.socialSkills.map((category, index) => (
                              <Card key={index}>
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-lg">{category.category} Skills</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-4">
                                    {category.skills.map((skill, skillIndex) => (
                                      <div key={skillIndex} className="border-b pb-3 last:border-0 last:pb-0">
                                        <h4 className="font-medium">{skill.name}</h4>
                                        <div className="grid sm:grid-cols-2 gap-2 mt-1">
                                          <div>
                                            <h5 className="text-xs text-gray-500">BENEFIT</h5>
                                            <p className="text-sm">{skill.benefit}</p>
                                          </div>
                                          <div>
                                            <h5 className="text-xs text-gray-500">DEVELOPMENT METHOD</h5>
                                            <p className="text-sm">{skill.developmentMethod}</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </motion.div>

                  {/* Similar Roles */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mb-8"
                  >
                    <h3 className="text-xl font-bold mb-4">Similar Roles to Consider</h3>
                    <div className="grid gap-4">
                      {results.similarRoles.map((role, index) => (
                        <Card key={index}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-lg">{role.title}</h4>
                                <p className="text-sm text-muted-foreground">Similarity: {role.similarity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">{role.salaryRange}</p>
                                <p className="text-sm text-emerald-600">{role.growthOutlook}</p>
                              </div>
                            </div>
                            
                            <p className="text-gray-700 mt-1">{role.description}</p>
                            
                            <div className="mt-3">
                              <h5 className="text-sm font-medium mb-1">Transferable Skills:</h5>
                              <div className="flex flex-wrap gap-1">
                                {role.transferableSkills.map((skill, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </motion.div>

                  {/* Organizational Fit Analysis */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <h3 className="text-xl font-bold mb-4">Organizational Fit Analysis</h3>
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-gray-700 mb-4">{results.organizationalFitAnalysis.valueAlignment}</p>
                        
                        <div className="grid md:grid-cols-2 gap-6 mb-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Cultural Fit Score</h4>
                            <div className="flex items-center gap-3">
                              <Progress 
                                value={results.organizationalFitAnalysis.culturalFitScore} 
                                className="h-3"
                              />
                              <span className="font-semibold">{results.organizationalFitAnalysis.culturalFitScore}%</span>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Growth Opportunity Score</h4>
                            <div className="flex items-center gap-3">
                              <Progress 
                                value={results.organizationalFitAnalysis.growthOpportunityScore} 
                                className="h-3"
                              />
                              <span className="font-semibold">{results.organizationalFitAnalysis.growthOpportunityScore}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-2">Retention Risk Factors</h4>
                            <ul className="list-disc list-inside text-sm">
                              {results.organizationalFitAnalysis.retentionRiskFactors.map((factor, index) => (
                                <li key={index}>{factor}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Recommended Actions</h4>
                            <ul className="list-disc list-inside text-sm">
                              {results.organizationalFitAnalysis.recommendedActions.map((action, index) => (
                                <li key={index}>{action}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}