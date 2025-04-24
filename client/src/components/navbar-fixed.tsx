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
  Shield
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
  const [, navigate] = useLocation();

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

  return (
    <header 
      className={`fixed w-full ${isScrolled ? 'bg-white bg-opacity-95 backdrop-blur-sm shadow-sm' : 'bg-transparent'} z-50 transition-all duration-300`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/">
              <div className="flex items-center flex-shrink-0 cursor-pointer">
                <span className="font-bold text-xl text-primary-dark">Skill<span className="text-secondary-dark">genix</span></span>
              </div>
            </Link>
          </motion.div>
          
          {/* Right side buttons */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            {user ? (
              <>
                {/* Logged in state */}
                <div className="hidden md:block text-sm text-muted-foreground">
                  Welcome, <span className="font-medium">{user.fullName}</span>
                </div>
                <div className="hidden md:block">
                  <Link href="/search">
                    <Button variant="ghost" size="sm">
                      Search
                    </Button>
                  </Link>
                </div>
                <div className="hidden md:block">
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                </div>
                <div className="hidden md:block">
                  <Link href="/my-details">
                    <Button variant="ghost" size="sm">
                      My Details
                    </Button>
                  </Link>
                </div>
                <div className="hidden md:block">
                  <Link href="/learning-resources">
                    <Button variant="ghost" size="sm">
                      Learning Resources
                    </Button>
                  </Link>
                </div>
                <div className="hidden md:block">
                  <Link href="/saved-resources">
                    <Button variant="ghost" size="sm">
                      Saved Resources
                    </Button>
                  </Link>
                </div>
                
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
                        <Link href="/my-details">
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            <span>My Details</span>
                          </DropdownMenuItem>
                        </Link>
                        
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent className="w-56">
                              <Link href="/settings/profile">
                                <DropdownMenuItem>
                                  <UserCog className="mr-2 h-4 w-4" />
                                  <span>Profile Settings</span>
                                </DropdownMenuItem>
                              </Link>
                              <Link href="/settings/security">
                                <DropdownMenuItem>
                                  <Lock className="mr-2 h-4 w-4" />
                                  <span>Security</span>
                                </DropdownMenuItem>
                              </Link>
                              <Link href="/settings/notifications">
                                <DropdownMenuItem>
                                  <Bell className="mr-2 h-4 w-4" />
                                  <span>Notifications</span>
                                </DropdownMenuItem>
                              </Link>
                              <Link href="/settings/2fa">
                                <DropdownMenuItem>
                                  <Shield className="mr-2 h-4 w-4" />
                                  <span>Email 2FA</span>
                                </DropdownMenuItem>
                              </Link>
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                        
                        <Link href="/notifications">
                          <DropdownMenuItem>
                            <Bell className="mr-2 h-4 w-4" />
                            <span>Notifications</span>
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
                <div className="hidden md:block">
                  <Link href="/search">
                    <Button variant="ghost" size="sm">
                      Search
                    </Button>
                  </Link>
                </div>
                <div className="hidden md:block">
                  <Link href="/auth">
                    <Button variant="ghost" size="sm">
                      Sign In
                    </Button>
                  </Link>
                </div>
                <div>
                  <Link href="/auth">
                    <ButtonHighlighted variant="default" size="default">
                      Get Started
                    </ButtonHighlighted>
                  </Link>
                </div>
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
                      <Link href="/my-details">
                        <Button className="w-full justify-start" variant="ghost">
                          My Details
                        </Button>
                      </Link>
                      <Link href="/learning-resources">
                        <Button className="w-full justify-start" variant="ghost">
                          Learning Resources
                        </Button>
                      </Link>
                      <Link href="/saved-resources">
                        <Button className="w-full justify-start" variant="ghost">
                          Saved Resources
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
                        <Button variant="outline" className="w-full">
                          Sign In
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
          </motion.div>
        </div>
      </div>
    </header>
  );
}