import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  User, 
  Award, 
  ArrowRight, 
  CheckCircle2 
} from "lucide-react";
import { useLocation } from "wouter";

interface PathwayOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  benefits: string[];
  color: string; // Just for CSS class names
  buttonVariant: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
}

export function PathwaySelector() {
  const [selectedPathway, setSelectedPathway] = useState<string | null>(null);
  const [_, setLocation] = useLocation();
  
  const pathwayOptions: PathwayOption[] = [
    {
      id: "personal",
      title: "Personal Career Pathway",
      description: "Create a growth path based on your individual skills, experiences, and career aspirations.",
      icon: <User className="h-8 w-8" />,
      benefits: [
        "Personalized skills gap analysis",
        "Cross-industry opportunities",
        "Flexible career progression",
        "Focus on personal development goals"
      ],
      color: "primary",
      buttonVariant: "default"
    },
    {
      id: "organization",
      title: "Organization Growth Pathway",
      description: "Discover advancement opportunities within your current organization's structure.",
      icon: <Building className="h-8 w-8" />,
      benefits: [
        "Clear promotion paths",
        "Organization-specific skill requirements",
        "Internal networking opportunities",
        "Alignment with company growth plans"
      ],
      color: "secondary",
      buttonVariant: "secondary"
    }
  ];
  
  const handleSelect = (id: string) => {
    setSelectedPathway(id);
  };
  
  const handleConfirm = () => {
    // Navigate directly to career analysis page
    setLocation('/career-analysis');
  };
  
  return (
    <div className="w-full">
      <div className="space-y-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h1 className="text-2xl font-bold mb-3">Choose Your Career Pathway</h1>
          <p className="text-muted-foreground">
            Select the pathway type that best fits your career growth needs and professional goals
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pathwayOptions.map((option) => (
            <motion.div
              key={option.id}
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card 
                className={`h-full cursor-pointer transition-colors ${
                  selectedPathway === option.id 
                    ? `border-${option.color} bg-${option.color}/5` 
                    : "hover:border-gray-300"
                }`}
                onClick={() => handleSelect(option.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div 
                      className={`w-14 h-14 rounded-lg flex items-center justify-center bg-${option.color}/10 text-${option.color}`}
                    >
                      {option.icon}
                    </div>
                    
                    {selectedPathway === option.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <CheckCircle2 className={`h-6 w-6 text-${option.color}`} />
                      </motion.div>
                    )}
                  </div>
                  <CardTitle className="mt-4">{option.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{option.description}</p>
                  <div className="space-y-2">
                    {option.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start">
                        <Award className={`h-4 w-4 mr-2 mt-1 text-${option.color}`} />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={selectedPathway === option.id ? option.buttonVariant : "outline"}
                    className="w-full"
                    onClick={() => handleSelect(option.id)}
                  >
                    {selectedPathway === option.id ? "Selected" : "Select"} {option.title.split(" ")[0]} Pathway
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <Button 
            size="lg" 
            onClick={handleConfirm}
            disabled={!selectedPathway}
            className="px-8"
          >
            Continue with Selected Pathway
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}