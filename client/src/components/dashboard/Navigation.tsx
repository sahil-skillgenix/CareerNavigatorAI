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
  Archive,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const [location] = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Main navigation items (visible in the main navbar)
  const mainNavigationItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5 mr-2" />,
    },
    {
      name: "Skillgenix AI Career Analysis",
      path: "/structured-pathway",
      icon: <Sparkles className="h-5 w-5 mr-2" />,
    },
    {
      name: "Saved Analyses",
      path: "/saved-analyses",
      icon: <Save className="h-5 w-5 mr-2" />,
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
      name: "History",
      path: "/history",
      icon: <History className="h-5 w-5 mr-2" />,
    },
  ];

  // Items to move to "Not Used" dropdown
  const notUsedItems = [
    {
      name: "My Details",
      path: "/my-details",
      icon: <User className="h-5 w-5 mr-2" />,
    },
    {
      name: "Personal Career Pathway",
      path: "/career-pathway",
      icon: <GraduationCap className="h-5 w-5 mr-2" />,
    },
    {
      name: "Organization Pathway",
      path: "/organization-pathway",
      icon: <Building className="h-5 w-5 mr-2" />,
    },
  ];

  return (
    <Card className="p-4 mb-8">
      <div className="flex flex-wrap justify-center gap-2">
        {/* Main navigation items */}
        {mainNavigationItems.map((item) => (
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

        {/* Not Used dropdown */}
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center">
              <Archive className="h-5 w-5 mr-2" />
              Not Used
              {dropdownOpen ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {notUsedItems.map((item) => (
              <DropdownMenuItem key={item.path} asChild>
                <Link href={item.path} className="flex items-center w-full cursor-pointer">
                  {item.icon}
                  {item.name}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}