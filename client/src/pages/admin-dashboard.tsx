import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Users, Database, AlertTriangle, Bell, Shield, BarChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Admin user management component
const UserManagement = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/user-management/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/user-management/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
    enabled: true,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button 
          onClick={() => {
            toast({
              title: "Feature coming soon",
              description: "User creation will be available in the next update."
            });
          }}
        >
          Add User
        </Button>
      </div>
      
      {usersLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground">
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.users?.map((user: any) => (
                <tr key={user.id} className="border-b">
                  <td className="p-3 font-mono text-xs">{user.id.substring(0, 8)}...</td>
                  <td className="p-3">{user.fullName}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' :
                      user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-3">{user.role}</td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Feature coming soon",
                            description: "Edit functionality will be available in the next update."
                          });
                        }}
                      >
                        Edit
                      </Button>
                      {user.status === 'active' ? (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Feature coming soon",
                              description: "Suspend functionality will be available in the next update."
                            });
                          }}
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Feature coming soon",
                              description: "Activate functionality will be available in the next update."
                            });
                          }}
                        >
                          Activate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {/* If no users or empty array */}
              {(!users?.users || users.users.length === 0) && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No users found. 
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// System logs component
const SystemLogs = () => {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['/api/admin/errors'],
    queryFn: async () => {
      const response = await fetch('/api/admin/errors');
      if (!response.ok) throw new Error('Failed to fetch error logs');
      return response.json();
    },
    enabled: true,
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">System Logs</h2>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{logs?.summary?.criticalErrors || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{logs?.summary?.totalErrors || 0}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{logs?.summary?.unresolvedErrors || 0}</div>
              </CardContent>
            </Card>
          </div>
          
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground">
                  <th className="p-3 text-left">Time</th>
                  <th className="p-3 text-left">Message</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Severity</th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs?.errors?.map((log: any) => (
                  <tr key={log.id} className="border-b">
                    <td className="p-3 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3">{log.message.substring(0, 50)}{log.message.length > 50 ? '...' : ''}</td>
                    <td className="p-3">{log.category}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        log.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        log.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.resolved ? 'Resolved' : 'Unresolved'}
                      </span>
                    </td>
                  </tr>
                ))}
                
                {/* If no logs or empty array */}
                {(!logs?.errors || logs.errors.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No error logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Feature limits component
const FeatureLimits = () => {
  const { toast } = useToast();
  const { data: featureLimits, isLoading } = useQuery({
    queryKey: ['/api/admin/feature-limits'],
    queryFn: async () => {
      const response = await fetch('/api/admin/feature-limits');
      if (!response.ok) throw new Error('Failed to fetch feature limits');
      return response.json();
    },
    enabled: true,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Feature Limits</h2>
        <Button 
          onClick={() => {
            toast({
              title: "Initializing default limits",
              description: "This will reinitialize all feature limits to their default values."
            });
          }}
        >
          Initialize Default Limits
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground">
                <th className="p-3 text-left">Feature Name</th>
                <th className="p-3 text-left">Description</th>
                <th className="p-3 text-left">Default Limit</th>
                <th className="p-3 text-left">Default Frequency</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {featureLimits?.map((limit: any) => (
                <tr key={limit.name} className="border-b">
                  <td className="p-3 font-medium">{limit.name}</td>
                  <td className="p-3">{limit.description}</td>
                  <td className="p-3">{limit.defaultLimit}</td>
                  <td className="p-3">{limit.defaultFrequency}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      limit.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {limit.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        toast({
                          title: "Feature coming soon",
                          description: "Edit limits will be available in the next update."
                        });
                      }}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
              
              {/* If no limits or empty array */}
              {(!featureLimits || featureLimits.length === 0) && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No feature limits found. Click "Initialize Default Limits" to create them.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Notifications component
const Notifications = () => {
  const { toast } = useToast();
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['/api/admin/notifications'],
    queryFn: async () => {
      const response = await fetch('/api/admin/notifications');
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    },
    enabled: true,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Notifications</h2>
        <Button 
          onClick={() => {
            toast({
              title: "Feature coming soon",
              description: "Creating new notifications will be available soon."
            });
          }}
        >
          Create Notification
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {notifications?.notifications?.map((notification: any) => (
            <Card key={notification.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{notification.title}</CardTitle>
                    <CardDescription>{new Date(notification.createdAt).toLocaleString()}</CardDescription>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    notification.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {notification.priority}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p>{notification.message}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    Type: {notification.type}
                  </span>
                  <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                    For: {notification.forAllUsers ? 'All Users' : 'Specific Users'}
                  </span>
                  {notification.expiresAt && (
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      Expires: {new Date(notification.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  <span className="text-xs text-muted-foreground">
                    Read by {notification.readBy?.length || 0} users
                  </span>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Feature coming soon",
                      description: "Deleting notifications will be available soon."
                    });
                  }}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
          
          {/* If no notifications or empty array */}
          {(!notifications?.notifications || notifications.notifications.length === 0) && (
            <div className="p-8 text-center border rounded-md">
              <Bell className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Stats component
const SystemStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['/api/admin/dashboard/summary'],
    queryFn: async () => {
      const response = await fetch('/api/admin/dashboard/summary');
      if (!response.ok) throw new Error('Failed to fetch dashboard summary');
      return response.json();
    },
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const usageStats = stats?.usageStats || {
    totalSignups: 0,
    activeUsers: 0,
    totalLogins: 0,
    apiRequests: 0,
    apiSuccessRate: 0,
    avgResponseTime: 0,
    featureUsage: {},
    errorRates: {}
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">System Statistics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats.totalSignups}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats.activeUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats.totalLogins}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">API Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats.apiSuccessRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>
      
      <h3 className="text-lg font-semibold mt-6">Feature Usage</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Object.entries(usageStats.featureUsage || {}).map(([key, value]) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <h3 className="text-lg font-semibold mt-6">Error Rates</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats.errorRates?.critical || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats.errorRates?.error || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageStats.errorRates?.warning || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Data Imports component
const DataImports = () => {
  const { toast } = useToast();
  const { data: imports, isLoading } = useQuery({
    queryKey: ['/api/admin/imports'],
    queryFn: async () => {
      const response = await fetch('/api/admin/imports');
      if (!response.ok) throw new Error('Failed to fetch import logs');
      return response.json();
    },
    enabled: true,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Data Imports</h2>
        <Button 
          onClick={() => {
            toast({
              title: "Feature coming soon",
              description: "Data import functionality will be available soon."
            });
          }}
        >
          New Import
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-muted-foreground">
                <th className="p-3 text-left">Import Date</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Filename</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Progress</th>
                <th className="p-3 text-left">Created By</th>
              </tr>
            </thead>
            <tbody>
              {imports?.imports?.map((importLog: any) => (
                <tr key={importLog.id} className="border-b">
                  <td className="p-3">{new Date(importLog.createdAt).toLocaleString()}</td>
                  <td className="p-3">{importLog.importType}</td>
                  <td className="p-3 font-mono text-xs">{importLog.filename}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      importLog.status === 'completed' ? 'bg-green-100 text-green-800' :
                      importLog.status === 'failed' ? 'bg-red-100 text-red-800' :
                      importLog.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {importLog.status}
                    </span>
                  </td>
                  <td className="p-3">
                    {importLog.processedRecords !== undefined && importLog.totalRecords !== undefined ? (
                      `${importLog.processedRecords}/${importLog.totalRecords} (${Math.round((importLog.processedRecords / importLog.totalRecords) * 100)}%)`
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="p-3">{importLog.createdBy}</td>
                </tr>
              ))}
              
              {/* If no imports or empty array */}
              {(!imports?.imports || imports.imports.length === 0) && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No import logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, system settings, and monitor platform usage.
        </p>
      </div>

      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-6 lg:w-auto">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span className="hidden md:inline">Statistics</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden md:inline">System Logs</span>
          </TabsTrigger>
          <TabsTrigger value="limits" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden md:inline">Feature Limits</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="imports" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden md:inline">Data Imports</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats" className="space-y-4">
          <SystemStats />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <SystemLogs />
        </TabsContent>
        
        <TabsContent value="limits" className="space-y-4">
          <FeatureLimits />
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Notifications />
        </TabsContent>
        
        <TabsContent value="imports" className="space-y-4">
          <DataImports />
        </TabsContent>
      </Tabs>
    </div>
  );
}