import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ButtonHighlighted } from './ui/button-highlighted';
import { Menu, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/use-auth';
import { Button } from './ui/button';

// Links for homepage sections (anchor links)
const homeSectionLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#benefits", label: "Benefits" },
  { href: "#testimonials", label: "Testimonials" },
];

// Links for main navigation
const mainNavLinks = [
  { href: "/skills", label: "Skills" },
  { href: "/roles", label: "Roles" },
  { href: "/industries", label: "Industries" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const isHomePage = location === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header 
      className={`fixed w-full ${isScrolled ? 'bg-white bg-opacity-95 backdrop-blur-sm shadow-sm' : 'bg-transparent'} z-50 transition-all duration-300`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center flex-shrink-0">
              <span className="font-bold text-xl text-primary-dark">Skill<span className="text-secondary-dark">genix</span></span>
            </Link>
            <nav className="hidden md:flex space-x-8 ml-10">
              {/* Main navigation links - always visible */}
              {mainNavLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className="text-neutral-700 hover:text-primary-dark transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
              
              {/* Home section links - only visible on homepage */}
              {isHomePage && homeSectionLinks.map((link) => (
                <a 
                  key={link.href} 
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href.substring(1));
                  }}
                  className="text-neutral-700 hover:text-primary-dark transition-colors font-medium"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            {user ? (
              <>
                <div className="hidden md:block text-sm text-muted-foreground">
                  Welcome, <span className="font-medium">{user.fullName}</span>
                </div>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="hidden md:inline-flex">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
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
                  {/* Main navigation links */}
                  {mainNavLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      href={link.href}
                      className="text-neutral-700 hover:text-primary-dark transition-colors font-medium text-lg"
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  {/* Home section links - only visible on homepage */}
                  {isHomePage && homeSectionLinks.map((link) => (
                    <a 
                      key={link.href} 
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.href.substring(1));
                      }}
                      className="text-neutral-700 hover:text-primary-dark transition-colors font-medium text-lg"
                    >
                      {link.label}
                    </a>
                  ))}
                  
                  {user ? (
                    <>
                      <div className="text-sm text-muted-foreground">
                        Welcome, <span className="font-medium">{user.fullName}</span>
                      </div>
                      <Link href="/dashboard" className="w-full">
                        <Button className="w-full justify-start" variant="outline">
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
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
