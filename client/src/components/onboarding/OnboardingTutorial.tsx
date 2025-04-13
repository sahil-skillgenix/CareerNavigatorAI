import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  LineChart,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface TutorialStep {
  title: string;
  description: string;
  image: React.ReactNode;
  emphasis?: string;
}

export function OnboardingTutorial() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  // Auto-show tutorial after a short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTutorial(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  const tutorialSteps: TutorialStep[] = [
    {
      title: "Welcome to Career Pathway Selection",
      description: "Our AI-powered system helps you visualize and plan your career development journey based on your unique skills and goals.",
      image: <Sparkles className="w-16 h-16 text-primary" />,
      emphasis: "Let's get started!"
    },
    {
      title: "Choose Your Path Type",
      description: "Select between a personal career path focused on your individual growth or an organization-based path for advancement within your company.",
      image: <Target className="w-16 h-16 text-secondary" />,
      emphasis: "Pick the path that aligns with your ambitions"
    },
    {
      title: "Personalized Analysis",
      description: "After selection, our AI analyzes your skills and experience to identify gaps and opportunities that will help you progress.",
      image: <BarChart3 className="w-16 h-16 text-purple-500" />,
      emphasis: "Get insights tailored to your profile"
    },
    {
      title: "Track Your Progress",
      description: "Watch your career growth in real-time with visual progress indicators and milestone achievements.",
      image: <LineChart className="w-16 h-16 text-green-500" />,
      emphasis: "See your career trajectory evolve"
    }
  ];

  const closeTutorial = () => {
    setShowTutorial(false);
    setShowSkipConfirm(false);
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!showTutorial) {
    return (
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-4 right-4 z-50 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
        onClick={() => setShowTutorial(true)}
      >
        <Sparkles className="w-5 h-5" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      {showTutorial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 30 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            {!showSkipConfirm ? (
              <>
                <div className="flex justify-between items-center p-4 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium">Tutorial {currentStep + 1}/{tutorialSteps.length}</h3>
                  </div>
                  <button
                    onClick={() => setShowSkipConfirm(true)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex flex-col items-center mb-6">
                    <motion.div
                      key={`image-${currentStep}`}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring" }}
                      className="bg-gray-50 p-8 rounded-full mb-6"
                    >
                      {tutorialSteps[currentStep].image}
                    </motion.div>

                    <motion.h2
                      key={`title-${currentStep}`}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-xl font-bold text-center mb-2"
                    >
                      {tutorialSteps[currentStep].title}
                    </motion.h2>

                    <motion.p
                      key={`desc-${currentStep}`}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="text-center text-gray-600 mb-4"
                    >
                      {tutorialSteps[currentStep].description}
                    </motion.p>

                    {tutorialSteps[currentStep].emphasis && (
                      <motion.div
                        key={`emphasis-${currentStep}`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-primary/5 border border-primary/10 px-4 py-2 rounded-lg text-primary font-medium mt-2"
                      >
                        {tutorialSteps[currentStep].emphasis}
                      </motion.div>
                    )}
                  </div>

                  <div className="flex justify-between items-center mt-8">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className={currentStep === 0 ? "opacity-50 cursor-not-allowed" : ""}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    <div className="flex space-x-1">
                      {tutorialSteps.map((_, index) => (
                        <motion.div
                          key={index}
                          className={`h-1.5 rounded-full ${
                            index === currentStep ? "w-6 bg-primary" : "w-2 bg-gray-200"
                          } transition-all`}
                        ></motion.div>
                      ))}
                    </div>

                    <Button onClick={nextStep}>
                      {currentStep === tutorialSteps.length - 1 ? (
                        "Start Selecting"
                      ) : (
                        <>
                          Next
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6">
                <div className="text-center mb-6">
                  <X className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Skip the tutorial?</h3>
                  <p className="text-gray-500 mt-2">
                    The tutorial provides helpful tips on selecting the best career
                    pathway for your professional growth.
                  </p>
                </div>

                <div className="flex space-x-3 justify-center">
                  <Button variant="outline" onClick={() => setShowSkipConfirm(false)}>
                    Continue Tutorial
                  </Button>
                  <Button variant="destructive" onClick={closeTutorial}>
                    Skip Tutorial
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}