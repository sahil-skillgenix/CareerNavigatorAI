import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ButtonHighlighted } from './ui/button-highlighted';
import { 
  Menu, 
  User, 
  LogOut, 
  Settings, 
  Bell, 
  UserCog, 
  Lock, 
  Mail, 
  Shield,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logoutMutation } = useAuth();
  const [location, navigate] = useLocation();

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isDashboard = location.startsWith('/dashboard');

  return (
    <header 
      className={`w-full ${isScrolled ? 'bg-white bg-opacity-95 backdrop-blur-sm shadow-sm' : 'bg-white'} z-50 transition-all duration-300`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/">
              <div className="flex items-center flex-shrink-0 cursor-pointer">
                <span className="font-bold text-xl text-primary-dark">Skill<span className="text-secondary-dark">genix</span></span>
              </div>
            </Link>
          </div>
          
          {/* Right side elements */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {/* Logged in state */}
                {isDashboard ? (
                  <div className="hidden md:block text-sm text-muted-foreground">
                    Welcome, <span className="font-medium">{user.fullName}</span>
                  </div>
                ) : (
                  <Link href="/search">
                    <Button variant="ghost" size="sm">
                      Search
                    </Button>
                  </Link>
                )}

                {/* Profile dropdown menu */}
                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={user?.fullName || 'User'} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {user?.fullName?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      <DropdownMenuGroup>
                        <Link href="/dashboard">
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>Dashboard</span>
                          </DropdownMenuItem>
                        </Link>
                        <Link href="/settings">
                          <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                          </DropdownMenuItem>
                        </Link>
                      </DropdownMenuGroup>
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <>
                {/* Logged out state */}
                <Link href="/search">
                  <Button variant="ghost" size="sm">
                    Search
                  </Button>
                </Link>
                <Link href="/auth">
                  <ButtonHighlighted variant="default" size="default">
                    Get Started
                  </ButtonHighlighted>
                </Link>
              </>
            )}
            
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <button 
                  type="button" 
                  className="md:hidden inline-flex items-center justify-center ml-3 text-neutral-600 hover:text-neutral-800 focus:outline-none"
                  aria-label="Open main menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-6 mt-6">
                  {/* Logo in mobile menu */}
                  <Link href="/">
                    <div className="w-full">
                      <span className="font-bold text-xl text-primary-dark">Skill<span className="text-secondary-dark">genix</span></span>
                    </div>
                  </Link>
                  
                  {user ? (
                    <>
                      {/* Logged in mobile menu */}
                      <div className="text-sm text-muted-foreground">
                        Welcome, <span className="font-medium">{user.fullName}</span>
                      </div>
                      <Link href="/search">
                        <Button className="w-full justify-start" variant="ghost">
                          Search
                        </Button>
                      </Link>
                      <Link href="/dashboard">
                        <Button className="w-full justify-start" variant="outline">
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/settings">
                        <Button className="w-full justify-start" variant="ghost">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        className="w-full justify-start" 
                        onClick={handleLogout}
                        disabled={logoutMutation.isPending}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Logged out mobile menu */}
                      <Link href="/search">
                        <Button className="w-full justify-start" variant="ghost">
                          Search
                        </Button>
                      </Link>
                      <Link href="/auth">
                        <ButtonHighlighted variant="default" size="lg" className="w-full">
                          Get Started
                        </ButtonHighlighted>
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}