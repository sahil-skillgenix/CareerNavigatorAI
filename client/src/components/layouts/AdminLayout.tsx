import React from 'react';
import { Link, useLocation } from "wouter";
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Laptop,
  LayoutDashboard,
  Users,
  Settings,
  Bell,
  Database,
  BarChart2,
  FileText,
  LogOut,
  ChevronDown,
  User
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Laptop className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl text-primary">Skillgenix</span>
                <span className="font-bold text-sm bg-primary/10 text-primary px-2 py-0.5 rounded-md">Admin</span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user?.avatarUrl} alt={user?.fullName || 'User'} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.fullName ? getInitials(user.fullName) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator */}
                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer flex w-full items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-white border-r border-gray-200 md:h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-4 space-y-2">
            <div className="px-3 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</h3>
            </div>
            
            <Link href="/admin">
              <div className={`px-3 py-2 rounded-md cursor-pointer flex items-center text-sm font-medium ${
                location === '/admin' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
              }`}>
                <LayoutDashboard className="h-4 w-4 mr-3" />
                Dashboard
              </div>
            </Link>
            
            <Link href="/admin/users">
              <div className={`px-3 py-2 rounded-md cursor-pointer flex items-center text-sm font-medium ${
                location === '/admin/users' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
              }`}>
                <Users className="h-4 w-4 mr-3" />
                User Management
              </div>
            </Link>
            
            <div className="px-3 py-2 mt-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">System</h3>
            </div>
            
            <Link href="/admin/limits">
              <div className={`px-3 py-2 rounded-md cursor-pointer flex items-center text-sm font-medium ${
                location === '/admin/limits' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
              }`}>
                <Database className="h-4 w-4 mr-3" />
                Feature Limits
              </div>
            </Link>
            
            <Link href="/admin/stats">
              <div className={`px-3 py-2 rounded-md cursor-pointer flex items-center text-sm font-medium ${
                location === '/admin/stats' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
              }`}>
                <BarChart2 className="h-4 w-4 mr-3" />
                Analytics
              </div>
            </Link>
            
            <Link href="/admin/notifications">
              <div className={`px-3 py-2 rounded-md cursor-pointer flex items-center text-sm font-medium ${
                location === '/admin/notifications' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
              }`}>
                <Bell className="h-4 w-4 mr-3" />
                Notifications
              </div>
            </Link>
            
            <Link href="/admin/logs">
              <div className={`px-3 py-2 rounded-md cursor-pointer flex items-center text-sm font-medium ${
                location === '/admin/logs' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
              }`}>
                <FileText className="h-4 w-4 mr-3" />
                System Logs
              </div>
            </Link>
            
            {user?.role === 'superadmin' && (
              <>
                <div className="px-3 py-2 mt-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Advanced</h3>
                </div>
                
                <Link href="/admin/imports">
                  <div className={`px-3 py-2 rounded-md cursor-pointer flex items-center text-sm font-medium ${
                    location === '/admin/imports' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
                  }`}>
                    <Database className="h-4 w-4 mr-3" />
                    Data Imports
                  </div>
                </Link>
                
                <Link href="/admin/config">
                  <div className={`px-3 py-2 rounded-md cursor-pointer flex items-center text-sm font-medium ${
                    location === '/admin/config' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
                  }`}>
                    <Settings className="h-4 w-4 mr-3" />
                    System Config
                  </div>
                </Link>
              </>
            )}
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Skillgenix Admin Portal. All rights reserved.
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="/admin/help">
                <span className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Help</span>
              </Link>
              <Link href="/admin/about">
                <span className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">About</span>
              </Link>
              <Link href="/privacy">
                <span className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">Privacy</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}