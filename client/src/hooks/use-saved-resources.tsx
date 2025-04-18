import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";

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
  const [savedResources, setSavedResources] = useState<SavedResource[]>([]);

  // Load saved resources from localStorage when the component mounts
  useEffect(() => {
    if (user) {
      const userId = user.id;
      const savedData = localStorage.getItem(`saved_resources_${userId}`);
      if (savedData) {
        try {
          setSavedResources(JSON.parse(savedData));
        } catch (e) {
          console.error("Error parsing saved resources", e);
          setSavedResources([]);
        }
      }
    }
  }, [user]);

  // Save to localStorage whenever savedResources changes
  useEffect(() => {
    if (user && savedResources.length > 0) {
      const userId = user.id;
      localStorage.setItem(`saved_resources_${userId}`, JSON.stringify(savedResources));
    }
  }, [savedResources, user]);

  const saveResource = (resource: SavedResource) => {
    setSavedResources((prevResources) => {
      // Check if resource with same ID already exists
      if (prevResources.some((r) => r.id === resource.id)) {
        return prevResources; // Resource already saved
      }
      
      // Add savedAt timestamp if not provided
      const resourceWithTimestamp = {
        ...resource,
        savedAt: resource.savedAt || Date.now(),
      };
      
      return [...prevResources, resourceWithTimestamp];
    });
  };

  const removeResource = (id: string) => {
    setSavedResources((prevResources) => 
      prevResources.filter((resource) => resource.id !== id)
    );
  };

  const isResourceSaved = (id: string): boolean => {
    return savedResources.some((resource) => resource.id === id);
  };

  const clearAllResources = () => {
    setSavedResources([]);
    if (user) {
      const userId = user.id;
      localStorage.removeItem(`saved_resources_${userId}`);
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