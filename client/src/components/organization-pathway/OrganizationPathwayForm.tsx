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
import { LoaderCircle, Upload, Building, BriefcaseBusiness } from "lucide-react";
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
      // Simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const orgName = data.organizationId ? 
        SAMPLE_ORGANIZATIONS.find(org => org.id === data.organizationId)?.name || "" : 
        data.organizationName || "";
      
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
                  <div className="grid md:grid-cols-2 gap-6">
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
                  
                  <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-orange-800 font-medium">🚧 Optimization in Progress</p>
                    <p className="mt-1 text-orange-700">
                      We're enhancing this analysis with SFIA 9 and DigComp 2.2 framework mappings, 
                      dual career pathways (Degree vs. TAFE), social skills development, and more detailed visualizations.
                      Check back soon for the complete analysis!
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}