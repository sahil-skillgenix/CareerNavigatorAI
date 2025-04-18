import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

// Define the interface for learning resources
export interface SavedResource {
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
  skillName: string;
  savedAt: number;
}

type SavedResourcesContextType = {
  savedResources: SavedResource[];
  saveResource: (resource: SavedResource) => void;
  removeResource: (id: string) => void;
  isResourceSaved: (id: string) => boolean;
  clearAllResources: () => void;
};

const SavedResourcesContext = createContext<SavedResourcesContextType | null>(null);

export const SavedResourcesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedResources, setSavedResources] = useState<SavedResource[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load saved resources from localStorage when the component mounts
  useEffect(() => {
    if (user) {
      try {
        const userId = user.id;
        const savedData = localStorage.getItem(`saved_resources_${userId}`);
        
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            if (Array.isArray(parsed)) {
              setSavedResources(parsed);
            } else {
              console.error("Saved resources is not an array");
              setSavedResources([]);
            }
          } catch (e) {
            console.error("Error parsing saved resources", e);
            setSavedResources([]);
          }
        } else {
          // No saved data, initialize with empty array
          setSavedResources([]);
        }
      } catch (error) {
        console.error("Error loading saved resources:", error);
        setSavedResources([]);
      }
      
      setIsInitialized(true);
    }
  }, [user]);

  // Save to localStorage whenever savedResources changes
  useEffect(() => {
    if (user && isInitialized) {
      try {
        const userId = user.id;
        localStorage.setItem(`saved_resources_${userId}`, JSON.stringify(savedResources));
      } catch (error) {
        console.error("Error saving resources to localStorage:", error);
        toast({
          title: "Error",
          description: "Could not save your resources. Please try again.",
          variant: "destructive"
        });
      }
    }
  }, [savedResources, user, isInitialized, toast]);

  // Ensure all required fields exist on a resource
  const validateResource = (resource: any): SavedResource => {
    return {
      id: resource.id || `resource-${Date.now()}`,
      title: resource.title || "Untitled Resource",
      type: resource.type || "Other",
      provider: resource.provider || "Unknown Provider",
      url: resource.url || "",
      description: resource.description || "No description available",
      estimatedHours: Number(resource.estimatedHours) || 0,
      difficulty: resource.difficulty || "Beginner",
      costType: resource.costType || "Unknown",
      tags: Array.isArray(resource.tags) ? resource.tags : [],
      relevanceScore: Number(resource.relevanceScore) || 5,
      matchReason: resource.matchReason || "",
      skillName: resource.skillName || "General Skill",
      savedAt: resource.savedAt || Date.now()
    };
  };

  const saveResource = (resource: any) => {
    if (!resource || typeof resource !== 'object') {
      console.error("Invalid resource object:", resource);
      return;
    }
    
    try {
      const validatedResource = validateResource(resource);
      
      setSavedResources((prevResources) => {
        // Check if resource with same ID already exists
        if (prevResources.some((r) => r.id === validatedResource.id)) {
          return prevResources; // Resource already saved
        }
        
        return [...prevResources, validatedResource];
      });
    } catch (error) {
      console.error("Error saving resource:", error);
      toast({
        title: "Error",
        description: "Could not save this resource. Please try again.",
        variant: "destructive"
      });
    }
  };

  const removeResource = (id: string) => {
    if (!id) {
      console.error("Invalid resource ID for removal:", id);
      return;
    }
    
    try {
      setSavedResources((prevResources) => 
        prevResources.filter((resource) => resource.id !== id)
      );
    } catch (error) {
      console.error("Error removing resource:", error);
      toast({
        title: "Error",
        description: "Could not remove this resource. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isResourceSaved = (id: string): boolean => {
    if (!id) return false;
    return savedResources.some((resource) => resource.id === id);
  };

  const clearAllResources = () => {
    try {
      setSavedResources([]);
      if (user) {
        const userId = user.id;
        localStorage.removeItem(`saved_resources_${userId}`);
      }
    } catch (error) {
      console.error("Error clearing resources:", error);
      toast({
        title: "Error",
        description: "Could not clear your resources. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <SavedResourcesContext.Provider
      value={{
        savedResources,
        saveResource,
        removeResource,
        isResourceSaved,
        clearAllResources,
      }}
    >
      {children}
    </SavedResourcesContext.Provider>
  );
};

export const useSavedResources = () => {
  const context = useContext(SavedResourcesContext);
  if (!context) {
    throw new Error("useSavedResources must be used within SavedResourcesProvider");
  }
  return context;
};