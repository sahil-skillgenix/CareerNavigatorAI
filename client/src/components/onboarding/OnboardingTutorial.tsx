import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, X, Lightbulb, Target, Award, ArrowRight } from "lucide-react";
import { fadeInUp } from "@/lib/animations";

interface TutorialStep {
  title: string;
  description: string;
  image: React.ReactNode;
  emphasis?: string;
}

export function OnboardingTutorial() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showTutorialButton, setShowTutorialButton] = useState(false);
  
  // Tutorial steps
  const steps: TutorialStep[] = [
    {
      title: "Welcome to Career Pathways",
      description: "Let's explore how to find and select the right career path for your professional growth.",
      emphasis: "Your journey to career success starts here!",
      image: (
        <div className="bg-primary/10 rounded-lg p-6 flex items-center justify-center h-48 mb-4">
          <Lightbulb className="h-20 w-20 text-primary animate-pulse" />
        </div>
      ),
    },
    {
      title: "Explore Personal Career Pathways",
      description: "The Career Pathway option creates a personalized growth plan based on your skills and goals.",
      emphasis: "Personalized for your unique career journey",
      image: (
        <div className="relative bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 h-48 mb-4 overflow-hidden">
          <motion.div 
            className="absolute top-6 left-6 bg-white/80 p-4 rounded-lg border shadow-sm"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Target className="h-8 w-8 text-primary mb-2" />
            <div className="text-sm font-medium">Personal Goals</div>
          </motion.div>
          
          <motion.div 
            className="absolute bottom-6 right-6 bg-white/80 p-4 rounded-lg border shadow-sm"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Award className="h-8 w-8 text-primary mb-2" />
            <div className="text-sm font-medium">Skill Analysis</div>
          </motion.div>
          
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <ArrowRight className="h-16 w-16 text-primary" />
          </motion.div>
        </div>
      ),
    },
    {
      title: "Discover Organization-based Pathways",
      description: "The Organization Growth Pathway shows career advancement options within your current company.",
      emphasis: "See how to climb the ladder in your organization",
      image: (
        <div className="relative bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-lg p-6 h-48 mb-4">
          <div className="flex flex-col items-center justify-center h-full">
            <motion.div 
              className="w-full max-w-xs bg-white/80 p-3 rounded-lg border shadow-sm mb-3"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-sm font-semibold text-center">Executive Level</div>
            </motion.div>
            
            <motion.div 
              className="w-full max-w-xs bg-white/80 p-3 rounded-lg border shadow-sm mb-3"
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-sm font-semibold text-center">Management Level</div>
            </motion.div>
            
            <motion.div 
              className="w-full max-w-xs bg-white/80 p-3 rounded-lg border shadow-sm"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <div className="text-sm font-semibold text-center">Current Role</div>
            </motion.div>
          </div>
        </div>
      ),
    },
    {
      title: "Take Action on Your Career",
      description: "Select the pathway that aligns with your goals and explore detailed career steps, skill requirements, and timeline.",
      emphasis: "Your career growth is just a click away!",
      image: (
        <div className="relative bg-gray-50 rounded-lg p-6 h-48 mb-4 flex items-center justify-center">
          <motion.div 
            className="bg-white p-4 rounded-lg border shadow-md w-full max-w-xs"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-center mb-4">
              <div className="font-bold text-lg mb-1">Choose Your Path</div>
              <div className="text-sm text-muted-foreground">Click to explore career options</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" className="w-full">
                Career Path
              </Button>
              <Button size="sm" variant="secondary" className="w-full">
                Org Path
              </Button>
            </div>
          </motion.div>
        </div>
      ),
    }
  ];

  // Show the tutorial button after a short delay when user logs in
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowTutorialButton(true);
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, []);

  // Reset to the first step when closing
  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setCurrentStep(0), 300);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <>
      {/* Tutorial Button */}
      <AnimatePresence>
        {showTutorialButton && (
          <motion.div
            className="fixed bottom-8 right-8 z-50"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <Button 
              className="rounded-full shadow-lg px-6 font-medium"
              onClick={() => setOpen(true)}
            >
              <Lightbulb className="mr-2 h-5 w-5" />
              Career Pathway Tutorial
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>{steps[currentStep].title}</DialogTitle>
            <DialogDescription>
              {steps[currentStep].description}
            </DialogDescription>
          </DialogHeader>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {steps[currentStep].image}
              
              {steps[currentStep].emphasis && (
                <motion.div 
                  className="bg-primary/5 border border-primary/10 p-3 rounded-md text-center mb-4"
                  variants={fadeInUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-sm text-primary font-medium">{steps[currentStep].emphasis}</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
          
          <DialogFooter className="flex sm:justify-between gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <Button
                size="sm"
                onClick={nextStep}
              >
                {currentStep === steps.length - 1 ? "Finish" : "Next"}
                {currentStep !== steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
            >
              <X className="h-4 w-4 mr-1" />
              Skip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}