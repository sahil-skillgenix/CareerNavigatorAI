import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Route, 
  Book, 
  Bookmark,
  Building,
  User,
  History,
  FileJson,
  Sparkles,
  Save,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function Navigation() {
  const [location] = useLocation();
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  const primaryNavItems = [
    {
      name: "Personal Career Pathway",
      path: "/career-pathway",
      icon: <GraduationCap className="h-5 w-5 mr-2" />,
    },
    {
      name: "Demo - Structured Pathway",
      path: "/structured-pathway",
      icon: <Sparkles className="h-5 w-5 mr-2" />,
    },
  ];

  const comingSoonItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5 mr-2" />,
    },
    {
      name: "My Details",
      path: "/my-details",
      icon: <User className="h-5 w-5 mr-2" />,
    },
    {
      name: "History",
      path: "/history",
      icon: <History className="h-5 w-5 mr-2" />,
    },
    {
      name: "Organization Pathway",
      path: "/organization-pathway",
      icon: <Building className="h-5 w-5 mr-2" />,
    },
    {
      name: "Learning Resources",
      path: "/learning-resources",
      icon: <Book className="h-5 w-5 mr-2" />,
    },
    {
      name: "Saved Resources",
      path: "/saved-resources",
      icon: <Bookmark className="h-5 w-5 mr-2" />,
    },
    {
      name: "Saved Analyses",
      path: "/saved-analyses",
      icon: <Save className="h-5 w-5 mr-2" />,
    },
  ];

  return (
    <Card className="p-4 mb-8">
      <div className="flex flex-wrap justify-center gap-2">
        {/* Primary Navigation Items */}
        {primaryNavItems.map((item) => (
          <Button
            key={item.path}
            variant={location === item.path ? "default" : "outline"}
            className="flex items-center"
            asChild
          >
            <Link href={item.path}>
              {item.icon}
              {item.name}
            </Link>
          </Button>
        ))}
        
        {/* Coming Soon Section */}
        <Collapsible
          open={isComingSoonOpen}
          onOpenChange={setIsComingSoonOpen}
          className="w-full max-w-[300px] mx-auto mt-4"
        >
          <CollapsibleTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center">
                <Route className="h-5 w-5 mr-2" />
                Coming Soon
              </div>
              {isComingSoonOpen ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-2 space-y-2">
            {comingSoonItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                className="flex items-center w-full justify-start"
                disabled={true}
              >
                {item.icon}
                {item.name}
              </Button>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}