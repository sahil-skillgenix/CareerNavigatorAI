import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ButtonHighlighted } from './ui/button-highlighted';
import { Menu, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';

// Simple navbar with only Skillgenix logo, Sign In, and Get Started buttons
export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logoutMutation } = useAuth();

  // Handle scroll effect for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top of page when Skillgenix logo is clicked
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <Link 
              href="/" 
              className="flex items-center flex-shrink-0"
              onClick={scrollToTop}
            >
              <span className="font-bold text-xl text-primary-dark">Skill<span className="text-secondary-dark">genix</span></span>
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
                <Link href="/search">
                  <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                    Search
                  </Button>
                </Link>
                <Link href="/my-details">
                  <Button variant="outline" size="sm" className="hidden md:inline-flex">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/learning-resources">
                  <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                    Learning Resources
                  </Button>
                </Link>
                <Link href="/saved-resources">
                  <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                    Saved Resources
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="hidden md:inline-flex"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                {/* Logged out state */}
                <Link href="/search" className="hidden md:block">
                  <Button variant="ghost" size="sm">Search</Button>
                </Link>
                <Link href="/auth" className="hidden md:block">
                  <Button variant="ghost" size="sm">Sign In</Button>
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
                  <Link href="/" className="w-full">
                    <Button variant="link" className="w-full justify-start p-0">
                      <span className="font-bold text-xl text-primary-dark">Skill<span className="text-secondary-dark">genix</span></span>
                    </Button>
                  </Link>
                  
                  {user ? (
                    <>
                      {/* Logged in mobile menu */}
                      <div className="text-sm text-muted-foreground">
                        Welcome, <span className="font-medium">{user.fullName}</span>
                      </div>
                      <Link href="/search" className="w-full">
                        <Button className="w-full justify-start" variant="ghost">
                          Search
                        </Button>
                      </Link>
                      <Link href="/my-details" className="w-full">
                        <Button className="w-full justify-start" variant="outline">
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/learning-resources" className="w-full">
                        <Button className="w-full justify-start" variant="ghost">
                          Learning Resources
                        </Button>
                      </Link>
                      <Link href="/saved-resources" className="w-full">
                        <Button className="w-full justify-start" variant="ghost">
                          Saved Resources
                        </Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        className="w-full justify-start" 
                        onClick={() => logoutMutation.mutate()}
                        disabled={logoutMutation.isPending}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Logged out mobile menu */}
                      <Link href="/search" className="w-full">
                        <Button className="w-full justify-start" variant="ghost">
                          Search
                        </Button>
                      </Link>
                      <Link href="/auth" className="w-full">
                        <Button variant="outline" className="w-full">Sign In</Button>
                      </Link>
                      <Link href="/auth" className="w-full">
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
