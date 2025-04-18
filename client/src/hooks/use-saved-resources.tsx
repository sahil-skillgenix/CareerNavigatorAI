import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

/**
 * Saved resource interface
 */
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

/**
 * Context type definition
 */
type SavedResourcesContextType = {
  savedResources: SavedResource[];
  saveResource: (resource: any) => void;
  removeResource: (id: string) => void;
  isResourceSaved: (id: string) => boolean;
  clearAllResources: () => void;
};

// Create context with null as default value
const SavedResourcesContext = createContext<SavedResourcesContextType | null>(null);

/**
 * SavedResourcesProvider component that manages saved resources
 */
export function SavedResourcesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedResources, setSavedResources] = useState<SavedResource[]>([]);

  // Load saved resources when user logs in
  useEffect(() => {
    if (user && user.id) {
      try {
        const key = `saved_resources_${user.id}`;
        const saved = localStorage.getItem(key);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setSavedResources(parsed);
            console.log(`Loaded ${parsed.length} resources from localStorage`);
          }
        }
      } catch (error) {
        console.error("Failed to load saved resources:", error);
      }
    }
  }, [user]);

  // Save resources to localStorage when they change
  useEffect(() => {
    if (user && user.id && savedResources) {
      try {
        const key = `saved_resources_${user.id}`;
        localStorage.setItem(key, JSON.stringify(savedResources));
        console.log(`Saved ${savedResources.length} resources to localStorage`);
      } catch (error) {
        console.error("Failed to save resources:", error);
      }
    }
  }, [savedResources, user]);

  /**
   * Save a resource to the saved resources list
   */
  const saveResource = (resource: any) => {
    if (!resource) {
      console.error("Cannot save null resource");
      return;
    }

    try {
      // Create a safe resource object with all required fields
      const safeResource: SavedResource = {
        id: resource.id || `resource-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
        savedAt: Date.now()
      };

      // Check if already saved to avoid duplicates
      if (savedResources.some(r => r.id === safeResource.id)) {
        console.log("Resource already saved", safeResource.id);
        return;
      }

      // Add to saved resources
      setSavedResources(prev => [...prev, safeResource]);
      
      // Show success toast
      toast({
        title: "Resource saved",
        description: `"${safeResource.title}" has been saved to your collection.`,
      });
      
    } catch (error) {
      console.error("Error saving resource:", error);
      toast({
        title: "Error saving resource",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  /**
   * Remove a resource from the saved resources list
   */
  const removeResource = (id: string) => {
    if (!id) return;
    
    setSavedResources(prev => prev.filter(resource => resource.id !== id));
  };

  /**
   * Check if a resource is already saved
   */
  const isResourceSaved = (id: string): boolean => {
    if (!id) return false;
    return savedResources.some(resource => resource.id === id);
  };

  /**
   * Clear all saved resources
   */
  const clearAllResources = () => {
    setSavedResources([]);
    if (user && user.id) {
      localStorage.removeItem(`saved_resources_${user.id}`);
    }
  };

  return (
    <SavedResourcesContext.Provider
      value={{
        savedResources,
        saveResource,
        removeResource,
        isResourceSaved,
        clearAllResources
      }}
    >
      {children}
    </SavedResourcesContext.Provider>
  );
}

/**
 * Hook to use saved resources
 */
export function useSavedResources() {
  const context = useContext(SavedResourcesContext);
  if (!context) {
    throw new Error("useSavedResources must be used within SavedResourcesProvider");
  }
  return context;
}