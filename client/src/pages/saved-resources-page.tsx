import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSavedResources, SavedResource } from "@/hooks/use-saved-resources";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/dashboard/Navigation";
import { Book, BookOpen, Video, GraduationCap, File, Clock, DollarSign, Tag, Bookmark, BookmarkX, ExternalLink, Search, ArrowDownAZ, Calendar, Filter, Trash2 } from "lucide-react";

// Custom component for saved resources card
function SavedResourceCard({ resource, onRemove }: { resource: SavedResource; onRemove: () => void }) {
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

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mb-4"
    >
      <Card className="overflow-hidden bg-white">
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center mr-4 shadow-sm">
              {getResourceIcon(resource.type)}
            </div>
            <div>
              <h4 className="text-lg font-semibold line-clamp-1">{resource.title}</h4>
              <div className="flex items-center text-sm">
                <span className="text-gray-600">by {resource.provider}</span>
                <span className="mx-2 text-gray-400">•</span>
                <span className="text-gray-600">{resource.skillName}</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className={getDifficultyColor(resource.difficulty)}>
            {resource.difficulty}
          </Badge>
        </div>
        
        <div className="p-6">
          <p className="text-gray-700 mb-4 line-clamp-2">{resource.description}</p>
          
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
          
          <div className="mb-4 flex items-center">
            <Calendar className="w-4 h-4 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">Saved on {formatDate(resource.savedAt)}</span>
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
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={onRemove}
              title="Remove from saved resources"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

// Main page component
export default function SavedResourcesPage() {
  const { savedResources, removeResource, clearAllResources } = useSavedResources();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Filter resources based on search term and type
  const filteredResources = savedResources.filter(resource => {
    const matchesSearch = searchTerm === "" || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.skillName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === "all" || resource.type.toLowerCase() === selectedType.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  // Sort resources
  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return b.savedAt - a.savedAt;
      case "oldest":
        return a.savedAt - b.savedAt;
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "hours-asc":
        return a.estimatedHours - b.estimatedHours;
      case "hours-desc":
        return b.estimatedHours - a.estimatedHours;
      default:
        return 0;
    }
  });

  // Handle resource removal
  const handleRemoveResource = (id: string, title: string) => {
    removeResource(id);
    toast({
      title: "Resource removed",
      description: `"${title}" has been removed from your saved resources.`,
      variant: "default"
    });
  };

  // Handle clear all resources
  const handleClearAll = () => {
    clearAllResources();
    setShowDeleteDialog(false);
    toast({
      title: "All resources removed",
      description: "All saved resources have been cleared.",
      variant: "default"
    });
  };

  // Get unique resource types
  const resourceTypes = Array.from(new Set(savedResources.map(resource => resource.type)));

  return (
    <div className="container mx-auto max-w-7xl py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Saved Resources</h1>
        <p className="text-muted-foreground mt-2">
          Your personal collection of learning resources
        </p>
      </div>

      <Navigation />
      
      <Card className="bg-white shadow-sm mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center">
            <Bookmark className="w-5 h-5 mr-2 text-primary" />
            Manage Your Saved Resources
          </CardTitle>
          <CardDescription>
            Browse, search, and filter your saved learning resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                placeholder="Search resources..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <div className="w-40">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {resourceTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase() || "unknown"}>
                        {type || "Unknown"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-40">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <ArrowDownAZ className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                    <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                    <SelectItem value="hours-asc">Duration (Shortest)</SelectItem>
                    <SelectItem value="hours-desc">Duration (Longest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    disabled={savedResources.length === 0}
                  >
                    <BookmarkX className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Clear all saved resources?</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. All your saved resources will be permanently removed.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleClearAll}
                    >
                      Yes, clear all
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          {savedResources.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <BookmarkX className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No saved resources</h3>
              <p className="text-gray-500">
                You don't have any saved resources yet. Browse the learning resources and save them for later.
              </p>
            </div>
          ) : sortedResources.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No matching resources</h3>
              <p className="text-gray-500">
                No resources match your current filters. Try adjusting your search terms or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedResources.map((resource) => (
                <SavedResourceCard
                  key={resource.id}
                  resource={resource}
                  onRemove={() => handleRemoveResource(resource.id, resource.title)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}