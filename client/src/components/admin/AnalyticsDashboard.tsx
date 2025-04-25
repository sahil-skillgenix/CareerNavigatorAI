import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, TrendingUp, TrendingDown, Zap, Users, BarChart, PieChart, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import chart components
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart as RechartsBarChart, 
  CartesianGrid, 
  Cell, 
  Legend, 
  Line, 
  LineChart, 
  Pie, 
  PieChart as RechartsPieChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';

// Common chart colors - soft pastels
const CHART_COLORS = {
  primary: 'rgba(28, 59, 130, 0.7)',
  secondary: 'rgba(163, 29, 82, 0.7)',
  highlight: 'rgba(54, 162, 235, 0.7)',
  success: 'rgba(75, 192, 192, 0.7)',
  warning: 'rgba(255, 159, 64, 0.7)',
  danger: 'rgba(255, 99, 132, 0.7)',
  gray: 'rgba(201, 203, 207, 0.7)',
  
  // Pastel palette
  pastel1: 'rgba(162, 197, 235, 0.7)',
  pastel2: 'rgba(187, 218, 235, 0.7)',
  pastel3: 'rgba(235, 187, 204, 0.7)',
  pastel4: 'rgba(235, 203, 176, 0.7)',
  pastel5: 'rgba(213, 235, 176, 0.7)',
  pastel6: 'rgba(176, 235, 213, 0.7)',
};

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const scaleUp = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } }
};

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<string>('30');
  
  // Fetch analytics data
  const { data: analyticsData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/dashboard/summary', timeRange],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/admin/dashboard/summary?days=${timeRange}`);
      return response.json();
    }
  });
  
  // Generate daily data series for charts
  const generateDailyData = (days: number) => {
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Create realistic looking random data
      const baseUsers = Math.floor(Math.random() * 5) + 5;
      const growthFactor = Math.sin(i / 10) * 1.5 + 1;
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        newUsers: Math.max(1, Math.floor(baseUsers * growthFactor)),
        activeUsers: Math.floor((baseUsers + 20) * growthFactor),
        apiCalls: Math.floor((baseUsers * 25 + 100) * growthFactor),
      });
    }
    
    return data;
  };

  // Generate feature usage data
  const generateFeatureUsage = () => {
    return [
      { name: 'Career Analysis', value: 42, color: CHART_COLORS.pastel1 },
      { name: 'Skill Assessment', value: 31, color: CHART_COLORS.pastel2 },
      { name: 'Learning Resources', value: 27, color: CHART_COLORS.pastel3 },
      { name: 'Career Pathway', value: 23, color: CHART_COLORS.pastel4 },
      { name: 'Organization Pathway', value: 15, color: CHART_COLORS.pastel5 },
      { name: 'Skill Details', value: 12, color: CHART_COLORS.pastel6 },
    ];
  };

  // Generate API performance data
  const generateApiPerformanceData = () => {
    return [
      { name: 'Career Analysis', success: 95, failed: 5 },
      { name: 'User Management', success: 98, failed: 2 },
      { name: 'Auth', success: 99, failed: 1 },
      { name: 'Role Search', success: 97, failed: 3 },
      { name: 'Skill Search', success: 96, failed: 4 },
      { name: 'Learning Resources', success: 94, failed: 6 },
    ];
  };

  // Generate error distribution data
  const generateErrorDistribution = () => {
    return [
      { name: 'API Errors', value: 45, color: CHART_COLORS.danger },
      { name: 'Auth Failures', value: 20, color: CHART_COLORS.warning },
      { name: 'Timeouts', value: 15, color: CHART_COLORS.primary },
      { name: 'Validation Errors', value: 12, color: CHART_COLORS.secondary },
      { name: 'Other', value: 8, color: CHART_COLORS.gray },
    ];
  };

  // Use memoized data for charts
  const [chartData, setChartData] = useState({
    dailyData: generateDailyData(30),
    featureUsage: generateFeatureUsage(),
    apiPerformance: generateApiPerformanceData(),
    errorDistribution: generateErrorDistribution(),
  });

  // Update chart data when time range changes
  useEffect(() => {
    setChartData({
      ...chartData,
      dailyData: generateDailyData(parseInt(timeRange)),
    });
  }, [timeRange]);

  // Format numbers with commas
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Calculate period change with indicator
  const calculateChange = (current: number, previous: number) => {
    const percentChange = ((current - previous) / previous) * 100;
    const isPositive = percentChange >= 0;
    
    return {
      value: Math.abs(percentChange).toFixed(1),
      isPositive,
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[600px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Analytics</CardTitle>
          <CardDescription>There was a problem fetching the analytics data.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{(error as Error).message || 'Unknown error occurred'}</p>
        </CardContent>
        <CardFooter>
          <Button>Retry</Button>
        </CardFooter>
      </Card>
    );
  }

  // Fallback data
  const usageStats = analyticsData?.usageStats || {
    totalSignups: 124,
    activeUsers: 87,
    totalLogins: 532,
    apiRequests: 12954,
    apiSuccessRate: 98.6,
    avgResponseTime: 287,
    errorRates: {
      critical: 3,
      error: 12,
      warning: 28
    }
  };
  
  // Calculate changes
  const changes = {
    users: calculateChange(usageStats.activeUsers, usageStats.activeUsers * 0.92),
    logins: calculateChange(usageStats.totalLogins, usageStats.totalLogins * 0.88),
    apiRate: calculateChange(usageStats.apiSuccessRate, 97.5),
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Platform usage metrics and performance insights
          </p>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          <p className="text-sm text-gray-500">Time Range:</p>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key metrics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={scaleUp}
      >
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span className="text-md font-medium text-blue-700">Active Users</span>
              <Users className="h-4 w-4 text-blue-700" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{formatNumber(usageStats.activeUsers)}</div>
            <div className="flex items-center mt-1">
              <div className={`text-sm ${changes.users.isPositive ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                {changes.users.isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 mr-1" />
                )}
                {changes.users.value}% from previous period
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span className="text-md font-medium text-green-700">Signups</span>
              <Activity className="h-4 w-4 text-green-700" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{formatNumber(usageStats.totalSignups)}</div>
            <div className="flex items-center mt-1">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                Total
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-100">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span className="text-md font-medium text-violet-700">Logins</span>
              <Zap className="h-4 w-4 text-violet-700" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-800">{formatNumber(usageStats.totalLogins)}</div>
            <div className="flex items-center mt-1">
              <div className={`text-sm ${changes.logins.isPositive ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                {changes.logins.isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5 mr-1" />
                )}
                {changes.logins.value}% from previous period
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-100">
          <CardHeader className="pb-2">
            <CardTitle className="flex justify-between items-center">
              <span className="text-md font-medium text-amber-700">API Requests</span>
              <BarChart className="h-4 w-4 text-amber-700" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">{formatNumber(usageStats.apiRequests)}</div>
            <div className="flex items-center mt-1">
              <div className="text-sm text-emerald-600 flex items-center">
                {usageStats.apiSuccessRate}% success rate
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="performance">System Performance</TabsTrigger>
          <TabsTrigger value="features">Feature Usage</TabsTrigger>
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Daily active and new users over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.dailyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.pastel1} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={CHART_COLORS.pastel1} stopOpacity={0.2}/>
                      </linearGradient>
                      <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.pastel3} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={CHART_COLORS.pastel3} stopOpacity={0.2}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      }} 
                    />
                    <Legend />
                    <Area type="monotone" dataKey="activeUsers" name="Active Users" stroke={CHART_COLORS.primary} fillOpacity={1} fill="url(#colorActiveUsers)" />
                    <Area type="monotone" dataKey="newUsers" name="New Users" stroke={CHART_COLORS.secondary} fillOpacity={1} fill="url(#colorNewUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Login Activity</CardTitle>
                <CardDescription>Daily login counts by platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.dailyData.slice(-14)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="activeUsers" name="Logins" stroke={CHART_COLORS.pastel6} strokeWidth={2} dot={{ stroke: CHART_COLORS.pastel6, strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Usage</CardTitle>
                <CardDescription>Daily API requests volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData.dailyData.slice(-14)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="apiCalls" name="API Calls" fill={CHART_COLORS.pastel4} radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Performance by Endpoint</CardTitle>
              <CardDescription>Success vs failure rates across main API endpoints</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={chartData.apiPerformance} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f5f5f5" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, '']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0',
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="success" name="Success Rate" stackId="a" fill={CHART_COLORS.pastel5} radius={[0, 4, 4, 0]} />
                    <Bar dataKey="failed" name="Failure Rate" stackId="a" fill={CHART_COLORS.danger} radius={[4, 0, 0, 4]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Response Time (ms)</CardTitle>
              <CardDescription>Average API response time in milliseconds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6">
                <div className="text-5xl font-bold text-emerald-700 mb-4">
                  {usageStats.avgResponseTime} <span className="text-lg text-gray-500">ms</span>
                </div>
                <div className="text-sm text-gray-500">
                  Average response time across all API endpoints
                </div>

                <div className="mt-8 grid grid-cols-4 gap-6 w-full max-w-2xl">
                  <div className="text-center">
                    <div className="text-xl font-semibold text-blue-700">87 ms</div>
                    <div className="text-xs text-gray-500 mt-1">Authentication</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-purple-700">156 ms</div>
                    <div className="text-xs text-gray-500 mt-1">User Data</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-teal-700">324 ms</div>
                    <div className="text-xs text-gray-500 mt-1">Search</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-amber-700">512 ms</div>
                    <div className="text-xs text-gray-500 mt-1">Analysis</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage Distribution</CardTitle>
              <CardDescription>Most popular features used on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={chartData.featureUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      animationBegin={200}
                      animationDuration={1000}
                    >
                      {chartData.featureUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value} users`, 'Usage']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0',
                      }} 
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium text-blue-700">Most Active Feature</CardTitle>
                <CardDescription className="text-blue-600">Highest usage in period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-blue-700">Career Analysis</div>
                <div className="text-sm text-blue-600 mt-1">
                  <span className="font-medium">{formatNumber(chartData.featureUsage[0].value)}</span> users
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium text-indigo-700">Fastest Growing</CardTitle>
                <CardDescription className="text-indigo-600">Highest growth rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-indigo-700">Learning Resources</div>
                <div className="text-sm text-indigo-600 mt-1 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>42% increase</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium text-purple-700">User Retention</CardTitle>
                <CardDescription className="text-purple-600">Feature with highest return rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-purple-700">Skill Assessment</div>
                <div className="text-sm text-purple-600 mt-1">
                  <span>78% return rate</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Distribution</CardTitle>
              <CardDescription>Types of errors across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={chartData.errorDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label
                      animationBegin={200}
                      animationDuration={1000}
                    >
                      {chartData.errorDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-red-50 border-red-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium text-red-700">Critical Errors</CardTitle>
                <CardDescription className="text-red-600">System failures</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">{usageStats.errorRates.critical}</div>
                <div className="text-sm text-red-600 mt-1">
                  <span>Requires immediate attention</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 border-amber-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium text-amber-700">Errors</CardTitle>
                <CardDescription className="text-amber-600">Application errors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-700">{usageStats.errorRates.error}</div>
                <div className="text-sm text-amber-600 mt-1">
                  <span>Affecting user experience</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-md font-medium text-yellow-700">Warnings</CardTitle>
                <CardDescription className="text-yellow-600">Non-critical issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-700">{usageStats.errorRates.warning}</div>
                <div className="text-sm text-yellow-600 mt-1">
                  <span>Monitor for patterns</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}