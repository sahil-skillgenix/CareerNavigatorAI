import { useState, useEffect } from 'react';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UserActivity {
  _id: string;
  userId: string;
  timestamp: string;
  activityType: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface LoginActivity {
  _id: string;
  userId: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
}

export const UserActivityHistory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activityTab, setActivityTab] = useState("all");
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserActivityHistory = async () => {
      if (!user?.id) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch user activity history
        const activityResponse = await apiRequest('GET', '/api/user/history/activity');
        if (!activityResponse.ok) {
          throw new Error('Failed to fetch activity history');
        }
        const activityData = await activityResponse.json();
        setActivities(activityData);

        // Fetch login history
        const loginResponse = await apiRequest('GET', '/api/user/history/login');
        if (!loginResponse.ok) {
          throw new Error('Failed to fetch login history');
        }
        const loginData = await loginResponse.json();
        setLoginHistory(loginData);
      } catch (err) {
        console.error('Error fetching user activity history:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        toast({
          title: "Error",
          description: "Failed to load activity history. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserActivityHistory();
  }, [user?.id, toast]);

  // Helper function to format activity types for display
  const formatActivityType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <span className="text-green-500">⟳</span>;
      case 'logout':
        return <span className="text-orange-500">⊗</span>;
      case 'career_analysis':
        return <span className="text-blue-500">📊</span>;
      case 'learning_resource':
        return <span className="text-purple-500">📚</span>;
      case 'profile_update':
        return <span className="text-teal-500">✎</span>;
      default:
        return <span className="text-gray-500">•</span>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>Your recent actions and logins</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading history...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>Your recent actions and logins</CardDescription>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity History</CardTitle>
        <CardDescription>Your recent actions and logins</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activityTab} onValueChange={setActivityTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Activity</TabsTrigger>
            <TabsTrigger value="logins">Login History</TabsTrigger>
            <TabsTrigger value="analyses">Analysis Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {activities.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No activity recorded yet.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-right">When</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities.map((activity) => (
                      <TableRow key={activity._id}>
                        <TableCell>{getActivityIcon(activity.activityType)}</TableCell>
                        <TableCell className="font-medium">
                          {formatActivityType(activity.activityType)}
                        </TableCell>
                        <TableCell className="max-w-[250px] truncate">
                          {activity.details || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="logins" className="mt-4">
            {loginHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No login history recorded yet.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead className="text-right">When</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loginHistory.map((login) => (
                      <TableRow key={login._id}>
                        <TableCell>
                          {login.success ? (
                            <span className="text-green-500 font-medium">Successful</span>
                          ) : (
                            <span className="text-red-500 font-medium">Failed</span>
                          )}
                        </TableCell>
                        <TableCell>{login.ipAddress || "Unknown"}</TableCell>
                        <TableCell className="max-w-[250px] truncate">
                          {login.userAgent ? (
                            login.userAgent.includes("Mozilla") ? 
                              login.userAgent.substring(login.userAgent.indexOf('(') + 1, login.userAgent.indexOf(')')) : 
                              login.userAgent
                          ) : (
                            "Unknown"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatDistanceToNow(new Date(login.timestamp), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analyses" className="mt-4">
            {activities.filter(a => a.activityType.includes('analysis') || a.activityType.includes('pathway')).length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No analysis activity recorded yet.
              </p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-right">When</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activities
                      .filter(a => a.activityType.includes('analysis') || a.activityType.includes('pathway'))
                      .map((activity) => (
                        <TableRow key={activity._id}>
                          <TableCell>{getActivityIcon(activity.activityType)}</TableCell>
                          <TableCell className="font-medium">
                            {formatActivityType(activity.activityType)}
                          </TableCell>
                          <TableCell className="max-w-[250px] truncate">
                            {activity.details || "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserActivityHistory;