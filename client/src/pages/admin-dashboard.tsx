import React from 'react';
import { Route, Switch } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import AdminLayout from '@/components/layouts/AdminLayout';
import UserManagement from '@/components/admin/UserManagement';
import FeatureLimits from '@/components/admin/FeatureLimits';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Ensure user is admin or superadmin
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">You don't have permission to access this area.</p>
        <a href="/" className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md">
          Return to Home
        </a>
      </div>
    );
  }

  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" exact>
          <AnalyticsDashboard />
        </Route>
        <Route path="/admin/users">
          <UserManagement />
        </Route>
        <Route path="/admin/limits">
          <FeatureLimits />
        </Route>
        <Route path="*">
          <AnalyticsDashboard />
        </Route>
      </Switch>
    </AdminLayout>
  );
}