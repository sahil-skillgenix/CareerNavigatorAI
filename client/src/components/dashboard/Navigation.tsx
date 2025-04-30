import React from "react";
import { Link, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  Sparkles
} from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  const navigationItems = [
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

  return (
    <Card className="p-4 mb-8">
      <div className="flex flex-wrap justify-center gap-2">
        {navigationItems.map((item) => (
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
      </div>
    </Card>
  );
}