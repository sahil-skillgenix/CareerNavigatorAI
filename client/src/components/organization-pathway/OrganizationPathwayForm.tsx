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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoaderCircle, Upload, Building, BriefcaseBusiness, FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";

// Sample organizations - in a real application, these would come from an API
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
});

type FormData = z.infer<typeof formSchema>;

// Sample organizational career analysis result
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
      tafe: string[];
      online: string[];
      universityLinks?: Array<{name: string, url: string}>;
      tafeLinks?: Array<{name: string, url: string}>;
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
      // In a real application, this would be an actual API call to your backend
      // For demo, we'll simulate an API response delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Return mock data
      const orgName = data.organizationId ? 
        SAMPLE_ORGANIZATIONS.find(org => org.id === data.organizationId)?.name || "" : 
        data.organizationName || "";
      
      return {
        organizationInfo: {
          name: orgName,
          structureOverview: "Hierarchical with 5 primary divisions and matrix management",
          industryPosition: "Leader in Australian " + (orgName.includes("Bank") ? "financial services" : "technology and telecommunications") + " sector",
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
            {
              skill: "Stakeholder relationship management",
              level: "Level 4",
              description: "Influences at operational level, facilitates change, monitors compliance with organizational standards."
            },
            {
              skill: "Data management",
              level: "Level 3",
              description: "Performs operational activities related to data quality, implements data management procedures."
            },
            {
              skill: "Project management",
              level: "Level 3",
              description: "Defines, documents and carries out small projects or sub-projects, alone or with a small team."
            },
            {
              skill: "Business analysis",
              level: "Level 3",
              description: "Investigates operational requirements, problems, and opportunities."
            }
          ],
          digcomp22: [
            {
              competency: "Information and data literacy",
              level: "Intermediate (4)",
              description: "Can search and filter data independently, evaluate information reliability, and organize content methodically."
            },
            {
              competency: "Communication and collaboration",
              level: "Advanced (5)",
              description: "Interacts through digital technologies, shares information, engages in citizenship through digital channels."
            },
            {
              competency: "Digital content creation",
              level: "Intermediate (3)",
              description: "Creates and edits digital content in different formats, applies copyright and licenses, uses basic programming."
            },
            {
              competency: "Problem solving",
              level: "Intermediate (4)",
              description: "Identifies needs and problems, solves technical issues, creatively uses technology."
            }
          ]
        },
        skillGapAnalysis: {
          gaps: [
            {
              skill: "Strategic planning and execution",
              importance: "High",
              description: "Ability to develop and execute organizational strategy across divisions and departments.",
              framework: "SFIA 9 - Strategy Level 5"
            },
            {
              skill: "Advanced people management",
              importance: "High",
              description: "Leading diverse teams through complex projects and organizational change.",
              framework: "SFIA 9 - People Management Level 5"
            },
            {
              skill: "Financial acumen",
              importance: "Medium",
              description: "Understanding business finance principles and applying them to departmental budgeting and resource allocation.",
              framework: "SFIA 9 - Financial Management Level 4"
            },
            {
              skill: "Digital security management",
              importance: "Medium",
              description: "Ensuring secure practices across digital operations and fostering security-conscious culture.",
              framework: "DigComp 2.2 - Safety Level 5"
            }
          ],
          strengths: [
            {
              skill: "Project coordination",
              level: "Advanced",
              relevance: "High",
              description: "Strong ability to coordinate cross-functional projects and manage resources effectively."
            },
            {
              skill: "Stakeholder communication",
              level: "Proficient",
              relevance: "High",
              description: "Excellent stakeholder management skills with ability to convey complex information clearly."
            },
            {
              skill: "Technical expertise",
              level: "Intermediate",
              relevance: "Medium",
              description: "Solid understanding of technical aspects related to current role with ability to translate between technical and business domains."
            }
          ]
        },
        careerPathwayOptions: {
          withDegree: [
            {
              step: 1,
              role: "Senior " + data.currentRole,
              level: "Senior",
              timeframe: "1-2 years",
              keySkillsNeeded: [
                "Advanced stakeholder management",
                "Strategic planning",
                "Team leadership",
                "Budget management"
              ],
              description: "Lead complex projects across divisions with increased responsibility for strategy development and team leadership.",
              requiredQualification: "Bachelor's degree in Business, Technology or related field",
              courseLink: "https://www.sydney.edu.au/courses/subject-areas/major/business.html"
            },
            {
              step: 2,
              role: data.currentRole + " Manager",
              level: "Management",
              timeframe: "3-5 years",
              keySkillsNeeded: [
                "Leadership development",
                "Organizational strategy",
                "Financial management",
                "Executive communication"
              ],
              description: "Oversee department operations with responsibility for team performance, budget management, and strategic planning.",
              requiredQualification: "Master's in Business Administration or related field recommended",
              licenseRequired: "Project Management Professional (PMP) certification",
              licenseInfo: "Requires 4,500 hours leading projects and 35 hours of project management education",
              courseLink: "https://www.mq.edu.au/study/find-a-course/business/master-of-business-administration",
              licenseLink: "https://www.pmi.org/certifications/project-management-pmp"
            },
            {
              step: 3,
              role: "Director of " + data.currentRole.split(" ")[0],
              level: "Executive",
              timeframe: "5-8 years",
              keySkillsNeeded: [
                "Executive leadership",
                "Strategic vision",
                "Business development",
                "Organizational transformation"
              ],
              description: "Direct organizational strategy and execution at the executive level with accountability for divisional performance and organizational change initiatives.",
              requiredQualification: "Executive MBA or equivalent advanced degree preferred",
              courseLink: "https://www.business.unsw.edu.au/degrees-courses/mba/emba"
            }
          ],
          withoutDegree: [
            {
              step: 1,
              role: "Senior " + data.currentRole,
              level: "Senior",
              timeframe: "1-3 years",
              keySkillsNeeded: [
                "Advanced stakeholder management",
                "Strategic planning",
                "Team leadership",
                "Budget management"
              ],
              description: "Progress to a senior role through demonstrated expertise and leadership skills, focusing on practical experience and professional certifications.",
              alternativeQualification: "Advanced Diploma of Leadership and Management",
              courseLink: "https://www.tafensw.edu.au/course/advanced-diploma-of-leadership-and-management/BSB60420-01"
            },
            {
              step: 2,
              role: data.currentRole + " Team Lead",
              level: "Team Lead",
              timeframe: "3-5 years",
              keySkillsNeeded: [
                "Team supervision",
                "Process improvement",
                "Performance management",
                "Project coordination"
              ],
              description: "Lead a team with responsibility for day-to-day operations, mentoring team members, and improving departmental processes.",
              alternativeQualification: "TAFE Diploma of Project Management",
              licenseRequired: "PRINCE2 Practitioner certification",
              licenseInfo: "Internationally recognized project management methodology",
              courseLink: "https://www.tafensw.edu.au/course/diploma-of-project-management/BSB50820-01",
              licenseLink: "https://www.axelos.com/certifications/propath/prince2"
            },
            {
              step: 3,
              role: data.currentRole + " Manager",
              level: "Management",
              timeframe: "5-7 years",
              keySkillsNeeded: [
                "Departmental leadership",
                "Strategic planning",
                "Budget management",
                "Cross-functional collaboration"
              ],
              description: "Manage departmental operations through demonstrated expertise, professional development, and industry recognition.",
              alternativeQualification: "Advanced TAFE Diploma in Business or Certified Manager Professional",
              courseLink: "https://www.tafensw.edu.au/course/advanced-diploma-of-business/BSB60120-01"
            }
          ],
          lateralMovement: [
            {
              role: "Product " + data.currentRole.split(" ")[0] + " Specialist",
              department: "Product Development",
              skillTransferability: "High",
              requiredAdditionalSkills: [
                "Product lifecycle management",
                "Market research analysis",
                "User experience design principles",
                "Agile development methodologies"
              ],
              benefits: [
                "Broader exposure to product development",
                "Enhanced understanding of customer needs",
                "Technical skills diversification",
                "Preparation for product management track"
              ]
            },
            {
              role: "Customer Success " + data.currentRole.split(" ")[0],
              department: "Customer Experience",
              skillTransferability: "Medium",
              requiredAdditionalSkills: [
                "Customer relationship management",
                "Solution selling",
                "Client needs assessment",
                "Client feedback implementation"
              ],
              benefits: [
                "Direct client interaction experience",
                "Revenue-driven mindset development",
                "Enhanced communication skills",
                "Market insights acquisition"
              ]
            }
          ]
        },
        developmentPlan: {
          skillsToAcquire: [
            {
              skill: "Strategic planning and execution",
              priority: "High",
              resources: [
                "Internal strategic planning workshop series",
                "Shadow executive planning sessions",
                "Assigned strategy implementation projects",
                "External executive education program"
              ],
              estimatedTime: "6-12 months",
              fastTrackMethod: "Executive mentorship program"
            },
            {
              skill: "Advanced people management",
              priority: "High",
              resources: [
                "Leadership development program",
                "Management mentoring circle",
                "360-degree feedback and coaching",
                "Conflict resolution training"
              ],
              estimatedTime: "3-6 months",
              fastTrackMethod: "Intensive leadership bootcamp"
            },
            {
              skill: "Financial acumen",
              priority: "Medium",
              resources: [
                "Financial management for non-financial managers course",
                "Budget development and monitoring assignments",
                "ROI analysis practice",
                "Business case development workshops"
              ],
              estimatedTime: "2-4 months",
              fastTrackMethod: "One-on-one finance coaching"
            },
            {
              skill: "Project Management Professional (PMP) certification",
              priority: "Medium",
              resources: [
                "PMP exam preparation course",
                "35 contact hours of project management education",
                "PMP study materials and practice exams",
                "Project documentation for application"
              ],
              estimatedTime: "4-6 months",
              fastTrackMethod: "Intensive PMP boot camp",
              licenseRequired: "Project Management Professional (PMP)",
              licenseInfo: "Globally recognized certification for project management professionals",
              licenseLink: "https://www.pmi.org/certifications/project-management-pmp"
            }
          ],
          recommendedCertifications: {
            university: [
              "Graduate Certificate in Business Administration",
              "Master of Business Administration (MBA)",
              "Graduate Diploma in Management",
              "Master of Leadership"
            ],
            tafe: [
              "Advanced Diploma of Leadership and Management",
              "Diploma of Project Management",
              "Advanced Diploma of Business",
              "Certificate IV in Training and Assessment"
            ],
            online: [
              "LinkedIn Learning Executive Leadership Path",
              "Coursera Strategic Leadership Specialization",
              "edX MicroMasters in Management",
              "Udemy Complete Leadership Course"
            ],
            universityLinks: [
              { name: "University of Sydney", url: "https://www.sydney.edu.au/business" },
              { name: "University of Melbourne", url: "https://study.unimelb.edu.au/find/courses/graduate/master-of-business-administration/" },
              { name: "UNSW", url: "https://www.business.unsw.edu.au/" },
              { name: "Monash University", url: "https://www.monash.edu/business/programs" }
            ],
            tafeLinks: [
              { name: "TAFE NSW", url: "https://www.tafensw.edu.au/courses/business-courses" },
              { name: "TAFE Queensland", url: "https://tafeqld.edu.au/courses/business-and-management" },
              { name: "Victoria University Polytechnic", url: "https://www.vu.edu.au/vu-polytechnic" },
              { name: "South Metropolitan TAFE", url: "https://www.southmetrotafe.wa.edu.au/" }
            ]
          },
          suggestedProjects: [
            "Lead a cross-functional process improvement initiative",
            "Develop a departmental strategic plan",
            "Create and implement a mentorship program",
            "Conduct a competitor analysis and present findings to leadership"
          ],
          learningPath: "Focus initially on closing critical skill gaps in strategic planning and people management while pursuing necessary certifications. Begin with internal opportunities for practical application while engaging in formal education. Transition to more advanced leadership development as you progress through career stages, with increasing focus on executive-level competencies in later phases.",
          socialSkills: [
            {
              category: "Communication",
              skills: [
                { 
                  name: "Executive Presence", 
                  benefit: "Builds credibility with senior leadership and enhances influence across the organization",
                  developmentMethod: "Executive communication coaching"
                },
                { 
                  name: "Strategic Storytelling", 
                  benefit: "Enables persuasive communication of complex ideas and organizational vision",
                  developmentMethod: "Storytelling workshops and practice" 
                },
                { 
                  name: "Active Listening", 
                  benefit: "Improves team engagement and problem-solving through better understanding of stakeholder needs",
                  developmentMethod: "Structured listening exercises and feedback" 
                }
              ]
            },
            {
              category: "Leadership",
              skills: [
                { 
                  name: "Emotional Intelligence", 
                  benefit: "Enhances team management and conflict resolution capabilities",
                  developmentMethod: "EQ assessment and coaching" 
                },
                { 
                  name: "Inclusive Leadership", 
                  benefit: "Creates high-performing diverse teams and fosters innovation through multiple perspectives",
                  developmentMethod: "Diversity and inclusion training" 
                },
                { 
                  name: "Strategic Thinking", 
                  benefit: "Enables identification of opportunities and long-term planning aligned with organizational goals",
                  developmentMethod: "Strategic thinking workshops and simulations" 
                }
              ]
            },
            {
              category: "Adaptability",
              skills: [
                { 
                  name: "Change Management", 
                  benefit: "Facilitates successful organizational transformations and team adaptability",
                  developmentMethod: "Change management certification" 
                },
                { 
                  name: "Crisis Leadership", 
                  benefit: "Builds resilience and decision-making capabilities under pressure",
                  developmentMethod: "Crisis simulation exercises" 
                },
                { 
                  name: "Continuous Learning", 
                  benefit: "Maintains relevance and adaptability in rapidly evolving organizational environments",
                  developmentMethod: "Personal learning plan and reflection practices" 
                }
              ]
            }
          ]
        },
        similarRoles: [
          {
            title: "Program Manager",
            similarity: "High",
            description: "Oversees multiple related projects and strategic initiatives, coordinating resources and ensuring alignment with business objectives.",
            salaryRange: "$120,000 - $160,000",
            growthOutlook: "Strong",
            transferableSkills: ["Strategic planning", "Team leadership", "Stakeholder management", "Budget oversight"]
          },
          {
            title: "Business Transformation Lead",
            similarity: "Medium",
            description: "Leads organizational change initiatives, process improvements, and strategy implementation across departments.",
            salaryRange: "$110,000 - $150,000",
            growthOutlook: "Excellent",
            transferableSkills: ["Change management", "Process improvement", "Cross-functional collaboration", "Strategic thinking"]
          },
          {
            title: "Operations Director",
            similarity: "Medium",
            description: "Manages operational activities, ensures efficient processes, and implements strategic business initiatives to support organizational goals.",
            salaryRange: "$130,000 - $180,000",
            growthOutlook: "Good",
            transferableSkills: ["Operational efficiency", "Team management", "Process optimization", "Performance metrics"]
          }
        ],
        organizationalFitAnalysis: {
          valueAlignment: "Strong alignment with organizational values of innovation and customer-centricity",
          culturalFitScore: 85,
          growthOpportunityScore: 78,
          retentionRiskFactors: [
            "Limited advancement in current department",
            "Skills underutilization",
            "Competitive external market for similar roles",
            "Potential compensation gap with market"
          ],
          recommendedActions: [
            "Implement personalized development plan targeting leadership skills",
            "Create cross-departmental project opportunities",
            "Schedule quarterly career discussion with direct manager",
            "Review compensation package against market rates",
            "Consider internal mentorship program participation"
          ]
        }
      } as OrganizationalAnalysisResult;
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
      
      // If we have a file, we would handle the file upload here
      // In a real application, you'd upload the file to your server
      
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
                  <Label>Organization Structure File (Excel)</Label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept=".xlsx,.xls,.csv" 
                      onChange={handleFileChange}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleFileButtonClick}
                      className="flex-1"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Organization Structure
                    </Button>
                    {orgFile && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary" size="sm" className="gap-1">
                            <FileSpreadsheet className="h-4 w-4" />
                            {orgFile.name}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Organization Structure File</DialogTitle>
                            <DialogDescription>
                              Your organization structure file will be used to analyze career pathways.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="bg-slate-50 p-4 rounded-md">
                            <div className="flex items-center gap-2">
                              <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
                              <span className="font-medium">{orgFile.name}</span>
                            </div>
                            <p className="text-sm text-slate-500 mt-2">
                              Size: {(orgFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setOrgFile(null);
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = '';
                                }
                              }}
                            >
                              Remove
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload an Excel file containing your organization's structure, departments, and roles.
                    This will help us provide a more accurate analysis.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="space-y-4 border-t pt-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="currentRole">Current Role</Label>
                <Input
                  id="currentRole"
                  placeholder="Enter your current role in the organization"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="skills">Current Skills</Label>
                <Textarea
                  id="skills"
                  placeholder="Enter your current skills, separated by commas"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="desiredRole">Desired Role</Label>
                <Input
                  id="desiredRole"
                  placeholder="Enter the role you aspire to in the organization"
                  value={desiredRole}
                  onChange={(e) => setDesiredRole(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button 
                type="submit" 
                disabled={organizationPathwayMutation.isPending}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
              >
                {organizationPathwayMutation.isPending ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Generate Organizational Career Pathway'
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
          ref={resultsRef}
        >
          {/* Organization Info Section */}
          <div className="bg-white rounded-xl border shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{results?.organizationInfo.name} Career Analysis</h2>
                  <p className="mt-2 text-indigo-100">
                    Analysis of your career pathway within {results?.organizationInfo.name}
                  </p>
                </div>
                <Building className="h-12 w-12 text-indigo-200" />
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Organization Overview</h3>
                  <p className="text-slate-600">{results?.organizationInfo.structureOverview}</p>
                  <p className="text-slate-600 mt-2">{results?.organizationInfo.industryPosition}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Current Role Analysis</h3>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{results?.currentRoleAnalysis.role}</div>
                      <div className="text-sm bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        {results?.currentRoleAnalysis.level}
                      </div>
                    </div>
                    <div className="text-sm text-slate-600">
                      <div className="mb-2">{results?.currentRoleAnalysis.reportingStructure}</div>
                      <div>
                        <div className="font-medium mb-1">Key Responsibilities:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {results?.currentRoleAnalysis.keyResponsibilities.map((resp, index) => (
                            <li key={index}>{resp}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Career Pathway Options */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Career Pathway Options</h2>
            <div className="space-y-6">
              {/* Vertical Growth */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12 7-7 7 7"/>
                    <path d="M12 19V5"/>
                  </svg>
                  Vertical Career Growth
                </h3>
                
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-[26px] top-8 bottom-0 w-0.5 bg-indigo-300" />
                  
                  <div className="space-y-6">
                    {results?.careerPathwayOptions.verticalGrowth.map((role, index) => (
                      <motion.div 
                        key={index} 
                        className="flex"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg z-10 shadow-md">
                            {index + 1}
                          </div>
                        </div>
                        
                        <div className="flex-1 ml-4 bg-white rounded-lg border border-indigo-200 p-4 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium text-lg mb-1 text-indigo-800">{role.role}</div>
                              <div className="text-sm text-indigo-500">Level: {role.level}</div>
                            </div>
                            <div className="text-sm bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                              {role.estimatedTimeframe}
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4 mt-3">
                            <div>
                              <div className="text-sm font-medium mb-1">Required Skills:</div>
                              <div className="flex flex-wrap gap-1">
                                {role.requiredSkills.map((skill, skillIndex) => (
                                  <span 
                                    key={skillIndex} 
                                    className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm font-medium mb-1">Key Responsibilities:</div>
                              <ul className="text-xs text-slate-600 list-disc list-inside">
                                {role.keyResponsibilities.map((resp, respIndex) => (
                                  <li key={respIndex}>{resp}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
              
              {/* Lateral Movement */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-8"
              >
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/>
                    <path d="m12 5 7 7-7 7"/>
                  </svg>
                  Lateral Movement Opportunities
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {results?.careerPathwayOptions.lateralMovement.map((role, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                      className="bg-white rounded-lg border border-purple-200 p-4 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-medium text-lg mb-1 text-purple-800">{role.role}</div>
                          <div className="text-sm text-purple-600">Department: {role.department}</div>
                        </div>
                        <div className="text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                          Transferability: {role.skillTransferability}
                        </div>
                      </div>
                      
                      <div className="space-y-3 mt-3">
                        <div>
                          <div className="text-sm font-medium mb-1">Required Additional Skills:</div>
                          <div className="flex flex-wrap gap-1">
                            {role.requiredAdditionalSkills.map((skill, skillIndex) => (
                              <span 
                                key={skillIndex} 
                                className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium mb-1">Benefits:</div>
                          <ul className="text-xs text-slate-600 list-disc list-inside">
                            {role.benefits.map((benefit, benefitIndex) => (
                              <li key={benefitIndex}>{benefit}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
          
          {/* Skill Gap Analysis */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Skill Gap Analysis</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-slate-700 flex items-center gap-2 text-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      Existing Relevant Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {results?.skillGapAnalysis.existingRelevantSkills.map((skill, index) => (
                        <div key={index} className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-sm flex items-center">
                          <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                          {skill}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold">Critical Skill Gaps</h3>
                
                {results?.skillGapAnalysis.criticalSkillGaps.map((gap, index) => (
                  <Card key={index} className="bg-white border border-rose-100">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-slate-700 text-base">{gap.skill}</CardTitle>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${
                          gap.importance === 'High' ? 'bg-rose-100 text-rose-700' :
                          gap.importance === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {gap.importance} Priority
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-sm">
                        <div className="font-medium mb-1">Development Pathways:</div>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs">
                          {gap.developmentPathways.map((path, pathIndex) => (
                            <li key={pathIndex}>{path}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </div>
            
            {/* Internal Training Options */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-6"
            >
              <h3 className="text-lg font-semibold mb-3">Internal Training Options</h3>
              
              <div className="grid md:grid-cols-3 gap-4">
                {results?.skillGapAnalysis.internalTrainingOptions.map((option, index) => (
                  <Card key={index} className="bg-gradient-to-b from-white to-slate-50 border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-slate-700 text-base">{option.name}</CardTitle>
                      <div className="flex justify-between mt-1">
                        <div className="text-xs text-slate-500">{option.type}</div>
                        <div className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">{option.duration}</div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="text-sm">
                        <div className="font-medium mb-1">Key Benefits:</div>
                        <ul className="list-disc list-inside space-y-1 text-slate-600 text-xs">
                          {option.keyBenefits.map((benefit, benefitIndex) => (
                            <li key={benefitIndex}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Organizational Fit Analysis */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Organizational Fit Analysis</h2>
            
            <div className="bg-white rounded-xl shadow-md border p-6">
              <div className="grid md:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <h3 className="text-lg font-semibold mb-4">Value & Cultural Alignment</h3>
                  
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mb-4">
                    <p className="text-slate-700">{results?.organizationalFitAnalysis.valueAlignment}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                      <div className="text-sm font-medium text-indigo-700 mb-1">Cultural Fit</div>
                      <div className="flex items-end gap-2">
                        <div className="text-3xl font-bold text-indigo-700">
                          {results?.organizationalFitAnalysis.culturalFitScore}%
                        </div>
                        <div className="text-indigo-500 text-sm">Alignment</div>
                      </div>
                      <div className="w-full bg-indigo-200 rounded-full h-2.5 mt-2">
                        <div 
                          className="bg-indigo-600 h-2.5 rounded-full" 
                          style={{ width: `${results?.organizationalFitAnalysis.culturalFitScore}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                      <div className="text-sm font-medium text-emerald-700 mb-1">Growth Opportunity</div>
                      <div className="flex items-end gap-2">
                        <div className="text-3xl font-bold text-emerald-700">
                          {results?.organizationalFitAnalysis.growthOpportunityScore}%
                        </div>
                        <div className="text-emerald-500 text-sm">Potential</div>
                      </div>
                      <div className="w-full bg-emerald-200 rounded-full h-2.5 mt-2">
                        <div 
                          className="bg-emerald-600 h-2.5 rounded-full" 
                          style={{ width: `${results?.organizationalFitAnalysis.growthOpportunityScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-base font-medium mb-2 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                          <line x1="12" y1="9" x2="12" y2="13"/>
                          <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        Retention Risk Factors
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm">
                        {results?.organizationalFitAnalysis.retentionRiskFactors.map((factor, index) => (
                          <li key={index}>{factor}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-base font-medium mb-2 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <line x1="10" y1="9" x2="8" y2="9"/>
                        </svg>
                        Recommended Actions
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-600 text-sm">
                        {results?.organizationalFitAnalysis.recommendedActions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <motion.div 
            className="flex flex-col items-center gap-6 mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            {/* Save to Dashboard button */}
            <div className="flex justify-center w-full">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 p-0.5 rounded-lg">
                <Button 
                  onClick={() => {
                    // Save analysis to dashboard functionality
                    toast({
                      title: "Analysis Saved",
                      description: "Your organizational career pathway analysis has been saved to your dashboard.",
                      variant: "default",
                    });
                  }}
                  size="lg" 
                  className="bg-white text-gray-800 hover:bg-opacity-95 hover:text-gray-900 shadow-lg text-base gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Save Analysis to Dashboard
                </Button>
              </div>
            </div>
            
            {/* New Analysis button */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-0.5 rounded-lg">
              <Button 
                onClick={handleReset} 
                size="lg" 
                className="bg-white text-gray-800 hover:bg-opacity-95 hover:text-gray-900 shadow-lg text-base gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
                Start a New Organization Analysis
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}