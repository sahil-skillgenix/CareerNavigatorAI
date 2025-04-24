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

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleSettingsClick = (path: string) => {
    navigate(path);
  };

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
            <div 
              onClick={handleLogoClick}
              className="flex items-center flex-shrink-0 cursor-pointer"
            >
              <span className="font-bold text-xl text-primary-dark">Skill<span className="text-secondary-dark">genix</span></span>
            </div>
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/search')}
                  >
                    Search
                  </Button>
                </div>
                <div className="hidden md:block">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/dashboard')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </div>
                <div className="hidden md:block">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/my-details')}
                  >
                    My Details
                  </Button>
                </div>
                <div className="hidden md:block">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/learning-resources')}
                  >
                    Learning Resources
                  </Button>
                </div>
                <div className="hidden md:block">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/saved-resources')}
                  >
                    Saved Resources
                  </Button>
                </div>
                
                {/* Profile dropdown menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="icon" className="relative rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" />
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
                      <DropdownMenuItem onClick={() => navigate('/my-details')}>
                        <User className="mr-2 h-4 w-4" />
                        <span>My Details</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className="w-56">
                            <DropdownMenuItem onClick={() => handleSettingsClick('/settings/profile')}>
                              <UserCog className="mr-2 h-4 w-4" />
                              <span>Profile Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSettingsClick('/settings/security')}>
                              <Lock className="mr-2 h-4 w-4" />
                              <span>Security</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSettingsClick('/settings/notifications')}>
                              <Bell className="mr-2 h-4 w-4" />
                              <span>Notifications</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSettingsClick('/settings/2fa')}>
                              <Shield className="mr-2 h-4 w-4" />
                              <span>Email 2FA</span>
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      
                      <DropdownMenuItem onClick={() => navigate('/notifications')}>
                        <Bell className="mr-2 h-4 w-4" />
                        <span>Notifications</span>
                      </DropdownMenuItem>
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
              </>
            ) : (
              <>
                {/* Logged out state */}
                <div className="hidden md:block">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/search')}
                  >
                    Search
                  </Button>
                </div>
                <div className="hidden md:block">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/auth')}
                  >
                    Sign In
                  </Button>
                </div>
                <div>
                  <ButtonHighlighted 
                    variant="default" 
                    size="default"
                    onClick={() => navigate('/auth')}
                  >
                    Get Started
                  </ButtonHighlighted>
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
                  <div onClick={handleLogoClick} className="w-full">
                    <Button 
                      variant="link" 
                      className="w-full justify-start p-0"
                    >
                      <span className="font-bold text-xl text-primary-dark">Skill<span className="text-secondary-dark">genix</span></span>
                    </Button>
                  </div>
                  
                  {user ? (
                    <>
                      {/* Logged in mobile menu */}
                      <div className="text-sm text-muted-foreground">
                        Welcome, <span className="font-medium">{user.fullName}</span>
                      </div>
                      <Button 
                        className="w-full justify-start" 
                        variant="ghost"
                        onClick={() => navigate('/search')}
                      >
                        Search
                      </Button>
                      <Button 
                        className="w-full justify-start" 
                        variant="outline"
                        onClick={() => navigate('/dashboard')}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>
                      <Button 
                        className="w-full justify-start" 
                        variant="ghost"
                        onClick={() => navigate('/my-details')}
                      >
                        My Details
                      </Button>
                      <Button 
                        className="w-full justify-start" 
                        variant="ghost"
                        onClick={() => navigate('/learning-resources')}
                      >
                        Learning Resources
                      </Button>
                      <Button 
                        className="w-full justify-start" 
                        variant="ghost"
                        onClick={() => navigate('/saved-resources')}
                      >
                        Saved Resources
                      </Button>
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
                      <Button 
                        className="w-full justify-start" 
                        variant="ghost"
                        onClick={() => navigate('/search')}
                      >
                        Search
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate('/auth')}
                      >
                        Sign In
                      </Button>
                      <ButtonHighlighted 
                        variant="default" 
                        size="lg" 
                        className="w-full"
                        onClick={() => navigate('/auth')}
                      >
                        Get Started
                      </ButtonHighlighted>
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