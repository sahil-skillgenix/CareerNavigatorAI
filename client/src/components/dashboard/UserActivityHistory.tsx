import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, AlertCircle, ClipboardList, Activity, Key, Shield, UserCog } from "lucide-react";

interface UserActivity {
  id: string;
  action: string;
  timestamp: string;
  status: 'success' | 'failure' | 'warning' | 'info';
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Helper function to get icon and color for activity type
function getActivityBadge(actionType: string, status: string) {
  // First determine the status-based color
  let statusColor = '';
  switch (status) {
    case 'success':
      statusColor = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      break;
    case 'failure':
      statusColor = 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      break;
    case 'warning':
      statusColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      break;
    default:
      statusColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  }

  // Then determine the action-based icon
  let icon = <Activity className="h-3.5 w-3.5 mr-1" />;
  
  if (actionType.includes('login')) {
    icon = <Key className="h-3.5 w-3.5 mr-1" />;
  } else if (actionType.includes('logout')) {
    icon = <Key className="h-3.5 w-3.5 mr-1" />;
  } else if (actionType.includes('register')) {
    icon = <UserCog className="h-3.5 w-3.5 mr-1" />;
  } else if (actionType.includes('password') || actionType.includes('security')) {
    icon = <Shield className="h-3.5 w-3.5 mr-1" />;
  } else if (actionType.includes('career')) {
    icon = <ClipboardList className="h-3.5 w-3.5 mr-1" />;
  }

  return { color: statusColor, icon };
}

// Function to format activity type for display
function formatActivityType(type: string): string {
  switch (type) {
    case 'login': return 'Login';
    case 'login_attempt': return 'Login Attempt';
    case 'logout': return 'Logout';
    case 'register': return 'Account Registration';
    case 'password_reset_complete': return 'Password Reset';
    case 'security_answer_verification': return 'Security Answer Verification';
    case 'careerAnalysis': return 'Career Analysis';
    default: return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  }
}

// Get device info from user agent
function getDeviceInfo(userAgent?: string): string {
  if (!userAgent) return 'Unknown Device';
  
  // Simple detection logic
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    return 'iOS Device';
  } else if (userAgent.includes('Android')) {
    return 'Android Device';
  } else if (userAgent.includes('Windows')) {
    return 'Windows Device';
  } else if (userAgent.includes('Mac')) {
    return 'Mac Device';
  } else if (userAgent.includes('Linux')) {
    return 'Linux Device';
  }
  
  return 'Unknown Device';
}

export default function UserActivityHistory() {
  const { user } = useAuth();
  const [activityFilter, setActivityFilter] = useState<string>('all');
  
  const { data: activities, isLoading, error } = useQuery<UserActivity[]>({
    queryKey: ['/api/activity'],
    enabled: !!user,
  });
  
  // Apply filtering
  const filteredActivities = activities?.filter(activity => 
    activityFilter === 'all' || activity.action === activityFilter
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>
            View your recent account activities and login history
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading activity history...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>
            View your recent account activities and login history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-destructive gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>Failed to load activity history. Please try again later.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>
            View your recent account activities and login history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium mb-2">No activity yet</h3>
            <p className="text-muted-foreground mb-4">
              Your account activities will appear here as you use the platform
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get unique activity types for filter
  const activityTypes = Array.from(new Set(activities?.map(a => a.action) || []));

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between sm:flex-row">
        <div>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>
            View your recent account activities and login history
          </CardDescription>
        </div>
        <div className="mt-4 sm:mt-0">
          <Select value={activityFilter} onValueChange={setActivityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Activity Type</SelectLabel>
                <SelectItem value="all">All Activities</SelectItem>
                {activityTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {formatActivityType(type)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities?.map((activity) => {
                const { color, icon } = getActivityBadge(activity.action, activity.status);
                
                return (
                  <TableRow key={activity.id}>
                    <TableCell>
                      <Badge variant="outline" className={`flex items-center w-fit ${color}`}>
                        {icon}
                        <span>{formatActivityType(activity.action)}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {activity.details ? JSON.stringify(activity.details) : 'No details available'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(activity.timestamp), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      {getDeviceInfo(activity.userAgent)}
                    </TableCell>
                    <TableCell>
                      {activity.ipAddress || 'Unknown'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}