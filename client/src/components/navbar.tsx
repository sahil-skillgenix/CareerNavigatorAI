import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { ButtonHighlighted } from './ui/button-highlighted';
import { Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#benefits", label: "Benefits" },
  { href: "#testimonials", label: "Testimonials" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();

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
      className={`fixed w-full bg-white ${isScrolled ? 'bg-opacity-95 backdrop-blur-sm shadow-sm' : 'bg-opacity-90'} z-50 transition-all duration-300`}
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
              <span className="font-bold text-xl text-primary-dark">Career<span className="text-secondary-dark">Path</span>AI</span>
            </Link>
            <nav className="hidden md:flex space-x-8 ml-10">
              {navLinks.map((link) => (
                <a 
                  key={link.href} 
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.href.substring(1));
                  }}
                  className="text-neutral-darkest hover:text-primary-dark transition-colors font-medium"
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
            className="flex items-center"
          >
            <ButtonHighlighted variant="default" size="default">
              Get Started
            </ButtonHighlighted>
            
            <Sheet>
              <SheetTrigger asChild>
                <button 
                  type="button" 
                  className="md:hidden inline-flex items-center justify-center ml-3 text-neutral-dark hover:text-neutral-darkest focus:outline-none"
                  aria-label="Open main menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col gap-6 mt-6">
                  {navLinks.map((link) => (
                    <a 
                      key={link.href} 
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.href.substring(1));
                      }}
                      className="text-neutral-darkest hover:text-primary-dark transition-colors font-medium text-lg"
                    >
                      {link.label}
                    </a>
                  ))}
                  <ButtonHighlighted variant="default" size="lg" className="mt-4 w-full">
                    Get Started
                  </ButtonHighlighted>
                </div>
              </SheetContent>
            </Sheet>
          </motion.div>
        </div>
      </div>
    </header>
  );
}
