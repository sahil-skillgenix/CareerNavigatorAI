import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  BarChart3, 
  Users, 
  Sliders, 
  Bell, 
  Upload, 
  AlertTriangle,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'User Management', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { name: 'Feature Limits', href: '/admin/limits', icon: <Sliders className="w-5 h-5" /> },
    { name: 'Notifications', href: '/admin/notifications', icon: <Bell className="w-5 h-5" /> },
    { name: 'Data Imports', href: '/admin/imports', icon: <Upload className="w-5 h-5" /> },
    { name: 'System Logs', href: '/admin/logs', icon: <AlertTriangle className="w-5 h-5" /> },
  ];

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.fullName) return 'U';
    return user.fullName.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top navbar */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px] pt-10">
                <nav className="flex flex-col gap-4 mt-6">
                  {navItems.map((item) => (
                    <div 
                      key={item.href}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        window.history.pushState({}, "", item.href);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer ${
                        location === item.href 
                          ? 'bg-primary/10 text-primary font-medium' 
                          : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                      }`}
                    >
                      {item.icon}
                      {item.name}
                    </div>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            
            <a href="/" className="font-bold text-xl text-primary flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 12h4l3 8 4-16 3 8h4" />
              </svg>
              <span className="hidden md:inline">Skillgenix Admin</span>
            </a>
          </div>

          {/* User profile dropdown */}
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600 hidden md:block">
              {user?.role === 'superadmin' ? (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs font-medium">
                  Super Admin
                </span>
              ) : (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">
                  Admin
                </span>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt={user?.fullName} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.fullName}</span>
                    <span className="text-xs text-gray-500">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Desktop sidebar and main content */}
      <div className="flex flex-1 container mx-auto">
        <aside className="w-64 border-r hidden md:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => (
              <div 
                key={item.href}
                onClick={() => {
                  window.history.pushState({}, "", item.href);
                }}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer ${
                  location === item.href 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {item.icon}
                {item.name}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-4 mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Skillgenix. All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <a href="/help">Help</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="/privacy">Privacy</a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="/terms">Terms</a>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}