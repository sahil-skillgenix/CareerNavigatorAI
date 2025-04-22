import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Star, Zap, BookOpen, Target, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface UserBadge {
  id: string;
  name: string;
  description: string;
  category: string;
  level: number;
  icon: string;
  earnedAt: string;
}

interface BadgeCardProps {
  badges: UserBadge[];
  isLoading?: boolean;
}

export function BadgeCard({ badges, isLoading = false }: BadgeCardProps) {
  const [animatedBadges, setAnimatedBadges] = useState<string[]>([]);
  
  useEffect(() => {
    // Initially, no badges are animated
    setAnimatedBadges([]);
    
    // After component mounts, animate each badge with a delay
    if (badges.length > 0) {
      const timer = setTimeout(() => {
        badges.forEach((badge, index) => {
          setTimeout(() => {
            setAnimatedBadges(prev => [...prev, badge.id]);
          }, index * 600); // Stagger the animations
        });
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [badges]);
  
  const renderIcon = (iconName: string, size = 20) => {
    switch (iconName) {
      case "trophy":
        return <Trophy size={size} className="text-yellow-500" />;
      case "award":
        return <Award size={size} className="text-blue-500" />;
      case "star":
        return <Star size={size} className="text-purple-500" />;
      case "zap":
        return <Zap size={size} className="text-amber-500" />;
      case "book":
        return <BookOpen size={size} className="text-green-500" />;
      case "target":
        return <Target size={size} className="text-red-500" />;
      default:
        return <CheckCircle2 size={size} className="text-primary" />;
    }
  };
  
  const renderLevelIndicator = (level: number) => {
    return (
      <div className="flex mt-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i}
            className={cn(
              "w-2 h-2 rounded-full mx-0.5",
              i < level ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
            )}
          />
        ))}
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Trophy className="h-5 w-5 mr-2 text-primary" />
            Skill Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 justify-center">
            {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className="w-24 h-32 rounded-lg bg-muted animate-pulse flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-muted-foreground/20 mb-2" />
                <div className="w-16 h-3 bg-muted-foreground/20 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!badges || badges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Trophy className="h-5 w-5 mr-2 text-primary" />
            Skill Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>Complete career analyses and learning paths to earn badges.</p>
            <Badge variant="outline" className="mt-3">Coming soon!</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <Trophy className="h-5 w-5 mr-2 text-primary" />
          Skill Achievements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 justify-center">
          {badges.map((badge) => (
            <motion.div
              key={badge.id}
              className="flex flex-col items-center justify-center w-28 h-36 p-3 rounded-lg bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 shadow-sm border border-border relative overflow-hidden"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={
                animatedBadges.includes(badge.id) 
                  ? { opacity: 1, scale: 1, y: 0 } 
                  : { opacity: 0, scale: 0.8, y: 20 }
              }
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 15,
                delay: 0.1
              }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
              }}
            >
              {/* Animated glow effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-blue-400 via-primary to-purple-500 opacity-10"
                animate={{ 
                  background: [
                    "linear-gradient(0deg, rgba(79,70,229,0.1) 0%, rgba(79,70,229,0) 100%)",
                    "linear-gradient(180deg, rgba(79,70,229,0.1) 0%, rgba(79,70,229,0) 100%)",
                    "linear-gradient(360deg, rgba(79,70,229,0.1) 0%, rgba(79,70,229,0) 100%)",
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
              />
              
              <motion.div 
                className="w-16 h-16 flex items-center justify-center rounded-full mb-2 bg-background shadow-sm"
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
              >
                {renderIcon(badge.icon, 28)}
              </motion.div>
              
              <span className="text-xs font-medium text-center">{badge.name}</span>
              {renderLevelIndicator(badge.level)}
              
              <div className="mt-2 px-2 py-0.5 bg-primary/10 rounded-full text-[10px] text-primary-foreground">
                Level {badge.level}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}