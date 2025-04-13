import React from "react";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  GraduationCap, 
  Route, 
  Book, 
  Bookmark
} from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5 mr-2" />,
    },
    {
      name: "Career Analysis",
      path: "/career-analysis",
      icon: <Route className="h-5 w-5 mr-2" />,
    },
    {
      name: "Career Pathway",
      path: "/career-pathway",
      icon: <GraduationCap className="h-5 w-5 mr-2" />,
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
      disabled: true,
    },
  ];

  return (
    <Card className="p-4 mb-8">
      <div className="flex flex-wrap justify-center gap-2">
        {navigationItems.map((item) => (
          <Button
            key={item.path}
            variant={location === item.path ? "default" : "outline"}
            className="flex items-center"
            asChild={!item.disabled}
            disabled={item.disabled}
          >
            {!item.disabled ? (
              <Link href={item.path}>
                {item.icon}
                {item.name}
              </Link>
            ) : (
              <span className="flex items-center">
                {item.icon}
                {item.name}
              </span>
            )}
          </Button>
        ))}
      </div>
    </Card>
  );
}