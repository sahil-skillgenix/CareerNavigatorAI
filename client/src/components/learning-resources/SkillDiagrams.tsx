import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

interface SkillDiagramsProps {
  skillName: string;
  currentLevel: string | number;
  targetLevel: string | number;
  learningStyle?: string;
}

export function SkillDiagrams({ skillName, currentLevel, targetLevel, learningStyle }: SkillDiagramsProps) {
  // Convert level to numerical value
  const getLevelValue = (level: string | number): number => {
    if (typeof level === 'number') return level;
    
    switch(level.toLowerCase()) {
      case 'beginner': return 1;
      case 'intermediate': return 2;
      case 'advanced': return 3;
      case 'expert': return 4;
      default: 
        const num = parseInt(level);
        return isNaN(num) ? 1 : num;
    }
  };
  
  const currentLevelValue = getLevelValue(currentLevel);
  const targetLevelValue = getLevelValue(targetLevel);
  
  // Generate progress data
  const progressData = [
    { name: "Current", value: currentLevelValue },
    { name: "To Complete", value: targetLevelValue - currentLevelValue }
  ];
  
  // Colors for the pie chart
  const COLORS = ["var(--primary)", "var(--secondary-light, #e2e8f0)"];
  
  // Generate projected growth path data
  const generateGrowthData = () => {
    const data = [];
    const weeks = 12; // 12 weeks (3 months) projection
    const currentValue = currentLevelValue;
    const targetValue = targetLevelValue;
    const increment = (targetValue - currentValue) / weeks;
    
    for (let i = 0; i <= weeks; i++) {
      data.push({
        week: `Week ${i}`,
        skill: Math.min(currentValue + (increment * i), targetValue)
      });
    }
    
    return data;
  };
  
  const growthData = generateGrowthData();
  
  // Learning style data for visual representation
  const getLearningStyleData = () => {
    const defaultData = [
      { name: 'Visual', value: 25 },
      { name: 'Auditory', value: 25 },
      { name: 'Reading', value: 25 },
      { name: 'Kinesthetic', value: 25 }
    ];
    
    if (!learningStyle) return defaultData;
    
    return defaultData.map(item => {
      if (item.name.toLowerCase() === learningStyle.toLowerCase()) {
        return { ...item, value: 55 }; // Emphasize selected learning style
      } else {
        return { ...item, value: 15 };
      }
    });
  };
  
  const learningStyleData = getLearningStyleData();
  const LEARNING_STYLE_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f97316"];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden shadow-md">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
            <h3 className="text-lg font-semibold">Skill Progress</h3>
          </div>
          <div className="p-4 flex flex-col items-center">
            <div className="mb-2 text-center">
              <p className="text-sm text-gray-500">
                Progress from <span className="font-medium">{currentLevel}</span> to <span className="font-medium">{targetLevel}</span>
              </p>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={progressData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {progressData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => {
                    if (name === "Current") return [`Current Level: ${value}`, name];
                    return [`Remaining: ${value}`, name];
                  }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-4">
              <div className="text-2xl font-bold text-primary">
                {Math.round((currentLevelValue / targetLevelValue) * 100)}% Complete
              </div>
              <p className="text-sm text-gray-500">Toward mastering {skillName}</p>
            </div>
          </div>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="overflow-hidden shadow-md">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
            <h3 className="text-lg font-semibold">Projected Growth</h3>
          </div>
          <div className="p-4">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={growthData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} interval={Math.ceil(growthData.length / 6)} />
                  <YAxis domain={[currentLevelValue, targetLevelValue]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="skill"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                Based on a 3-month learning trajectory
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
      
      {learningStyle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="overflow-hidden shadow-md">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4">
              <h3 className="text-lg font-semibold">Learning Style Optimization</h3>
            </div>
            <div className="p-4 flex flex-col items-center">
              <div className="mb-2 text-center">
                <p className="text-sm text-gray-500">
                  Resources optimized for your <span className="font-medium capitalize">{learningStyle}</span> learning style
                </p>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={learningStyleData}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {learningStyleData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={LEARNING_STYLE_COLORS[index % LEARNING_STYLE_COLORS.length]}
                          stroke="none"
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-center mt-4 max-w-md">
                <p className="text-sm text-gray-500">
                  Our recommendations emphasize {learningStyle} learning resources to help you learn more efficiently.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}