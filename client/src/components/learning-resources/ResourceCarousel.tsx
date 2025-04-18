import React from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, BookOpen, Video, GraduationCap, File, Clock, DollarSign, Tag, ThumbsUp, Award, Bookmark, BookmarkCheck } from "lucide-react";
import { useSavedResources, SavedResource } from "@/hooks/use-saved-resources";
import { useToast } from "@/hooks/use-toast";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface LearningResource {
  id: string;
  title: string;
  type: string;
  provider: string;
  url?: string;
  description: string;
  estimatedHours: number;
  difficulty: string;
  costType: string;
  tags: string[];
  relevanceScore: number;
  matchReason: string;
}

interface ResourceCarouselProps {
  resources: LearningResource[];
  skillName: string;
}

export function ResourceCarousel({ resources = [], skillName = "General Skill" }: ResourceCarouselProps) {
  const { savedResources, saveResource, removeResource, isResourceSaved } = useSavedResources();
  const { toast } = useToast();

  // Skip rendering if no resources
  if (!resources || resources.length === 0) {
    return null;
  }

  const handleSaveResource = (resource: LearningResource) => {
    try {
      // Simple approach - just pass the original resource
      // saveResource function has internal validation
      
      if (isResourceSaved(resource.id || '')) {
        // If resource is already saved, remove it
        removeResource(resource.id || '');
        toast({
          title: "Resource removed",
          description: `"${resource.title}" has been removed from your saved resources.`,
          variant: "default"
        });
      } else {
        // If resource is not saved, add with skill context
        const resourceWithContext = {
          ...resource,
          skillName: skillName || "General Skill"
        };
        saveResource(resourceWithContext);
      }
    } catch (error) {
      console.error("Error saving/removing resource:", error);
      toast({
        title: "Error",
        description: "There was a problem processing this resource. Please try again.",
        variant: "destructive"
      });
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    adaptiveHeight: true,
    arrows: true,
  };

  // Helper function to render resource type icon
  const getResourceIcon = (type: string) => {
    if (!type) return <File className="w-5 h-5" />;
    
    switch (type.toLowerCase()) {
      case "book":
        return <BookOpen className="w-5 h-5" />;
      case "video":
      case "tutorial":
        return <Video className="w-5 h-5" />;
      case "course":
      case "certification":
        return <GraduationCap className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    if (!difficulty) return "bg-gray-100 text-gray-800";
    
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-orange-100 text-orange-800";
      case "expert":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get cost type color
  const getCostTypeColor = (costType: string) => {
    if (!costType) return "bg-gray-100 text-gray-800";
    
    switch (costType.toLowerCase()) {
      case "free":
        return "bg-green-100 text-green-800";
      case "freemium":
        return "bg-blue-100 text-blue-800";
      case "paid":
        return "bg-purple-100 text-purple-800";
      case "subscription":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get relevance star rating
  const getRelevanceStars = (score: number) => {
    const maxScore = 10;
    const normalizedScore = Math.round((score / maxScore) * 5);
    
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, index) => (
          <Award 
            key={index} 
            className={`w-4 h-4 ${index < normalizedScore ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{score}/10</span>
      </div>
    );
  };

  return (
    <div className="w-full mt-6 mb-10">
      <h3 className="text-xl font-semibold mb-2">Top Resources for {skillName}</h3>
      <p className="text-sm text-gray-500 mb-6">Swipe through our carefully selected resources</p>
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-1 rounded-xl">
        <Slider {...sliderSettings}>
          {resources.map((resource) => (
            <div key={resource.id} className="p-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="overflow-hidden bg-white">
                  <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center mr-4 shadow-sm">
                        {getResourceIcon(resource.type)}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold line-clamp-1">{resource.title}</h4>
                        <p className="text-sm text-gray-600">by {resource.provider}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className={getDifficultyColor(resource.difficulty)}>
                      {resource.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-700 mb-4">{resource.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm">{resource.estimatedHours} hours</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
                        <Badge variant="outline" className={getCostTypeColor(resource.costType)}>
                          {resource.costType}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="text-sm font-medium mb-1">Relevance</div>
                      {getRelevanceStars(resource.relevanceScore)}
                    </div>
                    
                    <div className="mb-6">
                      <div className="text-sm font-medium mb-1">Why this resource?</div>
                      <p className="text-sm text-gray-600 italic">{resource.matchReason}</p>
                    </div>
                    
                    {resource.tags && resource.tags.length > 0 && (
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                          {resource.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {resource.url && resource.url !== "N/A" && (
                        <Button 
                          variant="default" 
                          className="flex-1"
                          onClick={() => window.open(resource.url, '_blank')}
                        >
                          View Resource <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                      
                      <Button
                        variant={isResourceSaved(resource.id || '') ? "secondary" : "outline"}
                        className={`${isResourceSaved(resource.id || '') ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : ""}`}
                        onClick={() => handleSaveResource(resource)}
                        title={isResourceSaved(resource.id || '') ? "Remove from saved resources" : "Save this resource"}
                      >
                        {isResourceSaved(resource.id || '') ? (
                          <BookmarkCheck className="w-5 h-5" />
                        ) : (
                          <Bookmark className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}