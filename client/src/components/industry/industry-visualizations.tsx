import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InfoIcon } from 'lucide-react';

interface IndustryRole {
  id: number;
  title: string;
  category: string;
  description: string;
  prevalence: string;
  salaryRange?: string;
  growthRate?: string;
}

interface IndustrySkill {
  id: number;
  name: string;
  category: string;
  description: string;
  importance: string;
  trendDirection: string;
}

interface IndustryData {
  id: number;
  name: string;
  category: string;
  description: string;
  marketSize?: string;
  trendDirection?: string;
  growthRate?: string;
  topCompanies?: string[];
  keyRegions?: string[];
  challenges?: string[];
  technologies?: string[];
  futureOutlook?: string;
  roles: IndustryRole[];
  skills: IndustrySkill[];
}

// Generate consistent colors
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
  '#82CA9D', '#FF6B6B', '#6B66FF', '#FFD700', '#8A2BE2',
];

// Prepare data for role prevalence visualization
const prepareRolePrevalenceData = (roles: IndustryRole[]) => {
  const prevalenceMap = {
    'Very High': 5,
    'High': 4,
    'Medium': 3,
    'Low': 2,
    'Very Low': 1,
  };

  return roles.map(role => ({
    name: role.title,
    value: prevalenceMap[role.prevalence as keyof typeof prevalenceMap] || 3,
    category: role.category,
    fullTitle: role.title,
  }));
};

// Prepare data for skill importance visualization
const prepareSkillImportanceData = (skills: IndustrySkill[]) => {
  const importanceMap = {
    'Critical': 5,
    'High': 4,
    'Medium': 3,
    'Low': 2,
    'Very Low': 1,
  };

  return skills.map(skill => ({
    name: skill.name.length > 15 ? skill.name.substring(0, 12) + '...' : skill.name,
    value: importanceMap[skill.importance as keyof typeof importanceMap] || 3,
    category: skill.category,
    trendDirection: skill.trendDirection,
    fullName: skill.name,
  }));
};

// Prepare data for market overview visualization
const prepareMarketOverviewData = (industry: IndustryData) => {
  const data = [
    {
      name: 'Jobs',
      value: industry.roles.length * 10 // Using role count as a simple metric
    },
    {
      name: 'Skills',
      value: industry.skills.length * 15 // Using skill count as a simple metric
    },
    {
      name: 'Companies',
      value: industry.topCompanies?.length ? industry.topCompanies.length * 20 : 60
    },
    {
      name: 'Regions',
      value: industry.keyRegions?.length ? industry.keyRegions.length * 25 : 75
    }
  ];

  // Normalize values to be percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  return data.map(item => ({
    ...item,
    value: Math.round((item.value / total) * 100)
  }));
};

// Prepare data for trends visualization
const prepareTrendsData = (industry: IndustryData) => {
  // This would typically come from historical data
  // Here we're creating mock data based on growth rate
  const growthRateValue = (() => {
    if (!industry.growthRate) return 5;
    if (industry.growthRate.includes && (industry.growthRate.includes('10%') || industry.growthRate.includes('fast'))) return 10;
    if (industry.growthRate.includes && (industry.growthRate.includes('5%') || industry.growthRate.includes('moderate'))) return 5;
    if (industry.growthRate.includes && (industry.growthRate.includes('2%') || industry.growthRate.includes('slow'))) return 2;
    if (industry.growthRate.includes && (industry.growthRate.includes('-') || industry.growthRate.includes('decline'))) return -3;
    return 5;
  })();

  const baseValue = 100;
  const trendDirectionMultiplier = (() => {
    if (!industry.trendDirection) return 1;
    if (industry.trendDirection.toLowerCase().includes('growing')) return 1.2;
    if (industry.trendDirection.toLowerCase().includes('stable')) return 1;
    if (industry.trendDirection.toLowerCase().includes('declining')) return 0.8;
    return 1;
  })();

  // Generate 5 years of data
  return Array.from({ length: 6 }).map((_, i) => {
    const year = 2020 + i;
    const marketSize = Math.round(baseValue * (1 + (growthRateValue / 100) * i) * trendDirectionMultiplier);
    const jobDemand = Math.round(baseValue * (1 + (growthRateValue / 100) * i) * trendDirectionMultiplier * 0.9);
    const skillDemand = Math.round(baseValue * (1 + (growthRateValue / 100) * i) * trendDirectionMultiplier * 1.1);
    
    return {
      year,
      marketSize,
      jobDemand,
      skillDemand
    };
  });
};

// Prepare radar data for skill categories
const prepareSkillCategoriesData = (skills: IndustrySkill[]) => {
  // Group skills by category and count them
  const categories: Record<string, number> = {};
  
  skills.forEach(skill => {
    if (categories[skill.category]) {
      categories[skill.category]++;
    } else {
      categories[skill.category] = 1;
    }
  });
  
  // Convert to array format needed for the radar chart
  return Object.entries(categories).map(([category, count]) => ({
    subject: category,
    A: count,
    fullMark: skills.length
  }));
};

export const IndustryRolesChart = ({ roles }: { roles: IndustryRole[] }) => {
  if (!roles || roles.length === 0) {
    return null;
  }

  const roleData = prepareRolePrevalenceData(roles);
  
  // Sort roles by prevalence for better visualization
  roleData.sort((a, b) => b.value - a.value);
  
  // Take top 8 roles for better visualization
  const displayRoles = roleData.slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Roles by Demand</CardTitle>
        <CardDescription>
          The most in-demand roles in this industry by prevalence
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={displayRoles}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 5]} tick={{fontSize: 12}} />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120} 
                tick={{fontSize: 12}}
              />
              <Tooltip 
                formatter={(value: any, name: string, props: any) => [
                  ['Very Low', 'Low', 'Medium', 'High', 'Very High'][Number(value) - 1], 
                  props.payload.fullTitle
                ]}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                name="Demand Level" 
                fill="#0088FE" 
                background={{ fill: '#eee' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-muted-foreground mt-3 flex items-center">
          <InfoIcon className="h-3 w-3 mr-1" />
          Based on industry data and market research
        </div>
      </CardContent>
    </Card>
  );
};

export const IndustrySkillsChart = ({ skills }: { skills: IndustrySkill[] }) => {
  if (!skills || skills.length === 0) {
    return null;
  }
  
  const skillData = prepareSkillImportanceData(skills);
  
  // Sort skills by importance for better visualization
  skillData.sort((a, b) => b.value - a.value);
  
  // Take top 8 skills for better visualization
  const displaySkills = skillData.slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Skills in Industry</CardTitle>
        <CardDescription>
          The most important skills for success in this industry
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={displaySkills}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 5]} tick={{fontSize: 12}} />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120} 
                tick={{fontSize: 12}}
              />
              <Tooltip 
                formatter={(value: any, name: string, props: any) => [
                  ['Very Low', 'Low', 'Medium', 'High', 'Critical'][Number(value) - 1], 
                  props.payload.fullName
                ]}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                name="Importance Level" 
                fill="#00C49F" 
                background={{ fill: '#eee' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-muted-foreground mt-3 flex items-center">
          <InfoIcon className="h-3 w-3 mr-1" />
          Skills ranked by importance and demand in industry
        </div>
      </CardContent>
    </Card>
  );
};

export const IndustryMarketOverview = ({ industry }: { industry: IndustryData }) => {
  const data = prepareMarketOverviewData(industry);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Composition</CardTitle>
        <CardDescription>
          Breakdown of key components in the {industry.name} industry
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex justify-center">
          <ResponsiveContainer width="80%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }: any) => `${name}: ${(Number(percent) * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm">{item.name}: {item.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export const IndustryTrendsChart = ({ industry }: { industry: IndustryData }) => {
  const data = prepareTrendsData(industry);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Industry Growth Trends</CardTitle>
        <CardDescription>
          Projected growth trends in the {industry.name} industry
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              width={500}
              height={300}
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="marketSize" 
                name="Market Size" 
                stroke="#8884d8" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="jobDemand" 
                name="Job Demand" 
                stroke="#82ca9d" 
              />
              <Line 
                type="monotone" 
                dataKey="skillDemand" 
                name="Skill Demand" 
                stroke="#ffc658" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex mt-4 justify-center">
          <Badge variant="outline" className="mx-1">
            Base Year: 2020 = 100
          </Badge>
          <Badge variant="outline" className="mx-1">
            Growth Rate: {industry.growthRate || 'Variable'}
          </Badge>
          <Badge variant="outline" className="mx-1">
            Trend: {industry.trendDirection || 'Stable'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export const IndustrySkillRadarChart = ({ skills }: { skills: IndustrySkill[] }) => {
  if (!skills || skills.length === 0) {
    return null;
  }
  
  const data = prepareSkillCategoriesData(skills);
  
  if (data.length < 3) {
    return null; // Radar chart needs at least 3 points to look good
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skill Category Distribution</CardTitle>
        <CardDescription>
          Distribution of skills across different categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis />
              <Radar
                name="Skills"
                dataKey="A"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.6}
              />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="text-xs text-muted-foreground mt-3 flex items-center">
          <InfoIcon className="h-3 w-3 mr-1" />
          Shows the diversity and concentration of skills across categories
        </div>
      </CardContent>
    </Card>
  );
};

// Export all visualizations as a combined component
export const IndustryVisualizations = ({ industry }: { industry: IndustryData }) => {
  if (!industry) return null;
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Industry Insights</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IndustryTrendsChart industry={industry} />
        <IndustryMarketOverview industry={industry} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IndustryRolesChart roles={industry.roles} />
        <IndustrySkillsChart skills={industry.skills} />
      </div>
      
      <IndustrySkillRadarChart skills={industry.skills} />
    </div>
  );
};

export default IndustryVisualizations;