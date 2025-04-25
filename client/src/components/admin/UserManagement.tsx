import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Loader2, MoreHorizontal, UserCog, Mail, Trash2, AlertTriangle, CheckCircle, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

// User type definition
interface User {
  id: string;
  fullName: string;
  email: string;
  status: 'active' | 'suspended' | 'restricted' | 'deleted';
  role: 'user' | 'admin' | 'superadmin';
  createdAt: string;
  lastLoginAt?: string;
  location?: string;
  currentRole?: string;
}

export default function UserManagement() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false);

  // Fetch users
  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/user-management/users'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/user-management/users');
      const data = await response.json();
      return data;
    }
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest('POST', `/api/admin/user-management/reset-password/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Password reset link sent',
        description: `A password reset link has been sent to ${selectedUser?.email}`,
        variant: 'default'
      });
      setIsResetPasswordDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to send reset link',
        description: error.message || 'There was an error sending the password reset link',
        variant: 'destructive'
      });
    }
  });

  // Update user status mutation
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string, status: string }) => {
      const response = await apiRequest('PATCH', `/api/admin/user-management/users/${userId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-management/users'] });
      toast({
        title: 'User status updated',
        description: `The user status has been updated successfully`,
        variant: 'default'
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update user status',
        description: error.message || 'There was an error updating the user status',
        variant: 'destructive'
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiRequest('DELETE', `/api/admin/user-management/users/${userId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/user-management/users'] });
      toast({
        title: 'User deleted',
        description: `The user has been deleted successfully`,
        variant: 'default'
      });
      setIsDeleteUserDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete user',
        description: error.message || 'There was an error deleting the user',
        variant: 'destructive'
      });
    }
  });

  // Handle sending password reset link
  const handleResetPassword = () => {
    if (selectedUser) {
      resetPasswordMutation.mutate(selectedUser.id);
    }
  };

  // Handle user status change
  const handleStatusChange = (userId: string, newStatus: string) => {
    updateUserStatusMutation.mutate({ userId, status: newStatus });
  };

  // Handle user deletion
  const handleDeleteUser = () => {
    if (selectedUser) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  // Filter users based on search query and filters
  const filteredUsers = usersData?.users?.filter((user: User) => {
    const matchesSearch = searchQuery === '' || 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  }) || [];

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Suspended</Badge>;
      case 'restricted':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Restricted</Badge>;
      case 'deleted':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Deleted</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Super Admin</Badge>;
      case 'admin':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Admin</Badge>;
      case 'user':
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">User</Badge>;
      default:
        return <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">{role}</Badge>;
    }
  };

  if (error) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Users</CardTitle>
          <CardDescription>There was a problem fetching the user data.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{(error as Error).message || 'Unknown error occurred'}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/user-management/users'] })}>
            Retry
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button className="flex items-center gap-2 bg-primary/90 hover:bg-primary transition-all duration-200">
          <UserPlus className="h-4 w-4" />
          Add New User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-md font-medium">Total Users</CardTitle>
            <CardDescription className="text-sm">All registered accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                usersData?.users?.length || 0
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-md font-medium">Active Users</CardTitle>
            <CardDescription className="text-sm">Currently active accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                usersData?.users?.filter((user: User) => user.status === 'active').length || 0
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-md font-medium">Suspended Users</CardTitle>
            <CardDescription className="text-sm">Temporarily disabled accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                usersData?.users?.filter((user: User) => user.status === 'suspended').length || 0
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-md font-medium">Admins</CardTitle>
            <CardDescription className="text-sm">Admin & super admin accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                usersData?.users?.filter((user: User) => 
                  user.role === 'admin' || user.role === 'superadmin'
                ).length || 0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative w-full sm:w-96">
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="rounded-lg border">
          <ScrollArea className="h-[450px] w-full">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-4 text-left font-medium text-gray-500">Name</th>
                  <th className="p-4 text-left font-medium text-gray-500">Email</th>
                  <th className="p-4 text-left font-medium text-gray-500">Role</th>
                  <th className="p-4 text-left font-medium text-gray-500">Status</th>
                  <th className="p-4 text-left font-medium text-gray-500">Join Date</th>
                  <th className="p-4 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center">
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user: User) => (
                    <tr key={user.id} className="border-b hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium">{user.fullName}</div>
                        {user.currentRole && (
                          <div className="text-sm text-gray-500">{user.currentRole}</div>
                        )}
                      </td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">{getRoleBadge(user.role)}</td>
                      <td className="p-4">{getStatusBadge(user.status)}</td>
                      <td className="p-4">
                        <div className="text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user);
                                // Add edit user functionality here
                                toast({
                                  title: "Edit User",
                                  description: "Edit user functionality will be implemented soon.",
                                });
                              }}
                            >
                              <UserCog className="mr-2 h-4 w-4" />
                              <span>Edit User</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setIsResetPasswordDialogOpen(true);
                              }}
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              <span>Reset Password</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === 'active' ? (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, 'suspended')}
                                className="text-amber-600"
                              >
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                <span>Suspend User</span>
                              </DropdownMenuItem>
                            ) : user.status === 'suspended' || user.status === 'restricted' ? (
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(user.id, 'active')}
                                className="text-green-600"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                <span>Reactivate User</span>
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setIsDeleteUserDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete User</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      No users found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              This will send a password reset link to {selectedUser?.email}. The link will expire in 24 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to send a password reset link to this user?
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsResetPasswordDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleResetPassword}
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : 'Send Reset Link'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete User Account</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the user account and remove all their data.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Warning</h3>
                  <p className="text-sm text-amber-700 mt-1">
                    You are about to delete the account for <strong>{selectedUser?.fullName}</strong> ({selectedUser?.email}).
                    All associated data will be permanently removed.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteUserDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}