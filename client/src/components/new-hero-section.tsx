import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Play, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Animation variants
const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      delay: 0.6,
      ease: "easeOut"
    }
  }
};

const fadeInUpVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8,
      delay: 0.3,
      ease: "easeOut"
    }
  }
};

const drawPathVariants = {
  hidden: { pathLength: 0 },
  visible: { 
    pathLength: 1,
    transition: { 
      duration: 2, 
      ease: "easeInOut",
      delay: 0.5
    }
  }
};

export default function NewHeroSection() {
  // Ref for the canvas element
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Animation for the background
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Create particles
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        
        // Color palette of blues and purples
        const colors = [
          'rgba(79, 70, 229, 0.2)',  // Indigo
          'rgba(139, 92, 246, 0.2)',  // Purple
          'rgba(99, 102, 241, 0.2)',  // Blue
          'rgba(109, 40, 217, 0.15)'  // Violet
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }
      
      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Create an array of particles
    const particles: Particle[] = [];
    const particleCount = Math.min(150, Math.floor(window.innerWidth * 0.08));
    
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    // Animation loop
    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      // Connect particles with lines if they're close
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-to-b from-white via-white to-indigo-50 overflow-hidden">
      {/* Animated canvas background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0"
      />
      
      {/* Decorative background elements */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-purple-300/30 rounded-full filter blur-3xl"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-300/30 rounded-full filter blur-3xl"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={textVariants}
            >
              <h1 className="font-extrabold text-5xl md:text-6xl leading-tight tracking-tight mb-6">
                Chart Your Perfect
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent my-2">
                  Career Path
                </span>
                With AI
              </h1>
              <p className="text-xl text-gray-600 mb-10 max-w-xl">
                Leverage the power of artificial intelligence to map your professional journey, identify skill gaps, and create a personalized pathway to achieve your career aspirations.
              </p>
            </motion.div>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4"
              variants={buttonVariants}
              initial="hidden"
              animate="visible"
            >
              <Link href="/auth">
                <Button 
                  size="lg"
                  className="px-8 py-6 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  Start Your Journey
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              >
                <Play className="mr-2 h-5 w-5" /> Watch Demo
              </Button>
            </motion.div>
            
            <motion.div 
              className="mt-10 flex items-center gap-4"
              variants={fadeInUpVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="relative h-12">
                <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-2 border-white bg-gradient-to-r from-indigo-400 to-indigo-500 flex items-center justify-center text-white font-medium z-10">
                  AJ
                </div>
                <div className="absolute top-0 left-8 h-12 w-12 rounded-full border-2 border-white bg-gradient-to-r from-purple-400 to-purple-500 flex items-center justify-center text-white font-medium z-20">
                  TL
                </div>
                <div className="absolute top-0 left-16 h-12 w-12 rounded-full border-2 border-white bg-gradient-to-r from-blue-400 to-blue-500 flex items-center justify-center text-white font-medium z-30">
                  SH
                </div>
                <div className="absolute top-0 left-24 h-12 w-12 rounded-full border-2 border-white bg-gradient-to-r from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-medium z-40">
                  +
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Joined by <span className="font-bold text-indigo-600">5,000+</span> professionals</p>
                <div className="flex mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-1 text-xs font-medium text-gray-600">4.9/5 rating</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          <motion.div
            className="relative"
            variants={fadeInUpVariants}
            initial="hidden"
            animate="visible"
          >
            {/* 3D career path visualization */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl rotate-2 scale-105 blur-lg"></div>
              <div className="relative bg-white p-6 rounded-2xl shadow-xl">
                <div className="aspect-[4/3] bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl overflow-hidden relative">
                  {/* Animated Career Path Graph */}
                  <svg 
                    viewBox="0 0 400 300" 
                    className="w-full h-full"
                  >
                    {/* Background Grid */}
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="1"/>
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    
                    {/* Career Path */}
                    <motion.path 
                      d="M 40,260 C 70,230 100,240 130,200 S 160,150 190,140 S 240,130 270,100 S 330,50 360,30" 
                      fill="none"
                      stroke="url(#gradientPath)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      variants={drawPathVariants}
                      initial="hidden"
                      animate="visible"
                    />
                    
                    {/* Gradient for path */}
                    <defs>
                      <linearGradient id="gradientPath" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                    
                    {/* Milestones */}
                    <motion.circle 
                      cx="40" cy="260" r="8" 
                      fill="#4f46e5"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    />
                    <motion.circle 
                      cx="130" cy="200" r="8" 
                      fill="#4f46e5"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.1, duration: 0.5 }}
                    />
                    <motion.circle 
                      cx="190" cy="140" r="8" 
                      fill="#6366f1"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.5, duration: 0.5 }}
                    />
                    <motion.circle 
                      cx="270" cy="100" r="8" 
                      fill="#7c3aed"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.9, duration: 0.5 }}
                    />
                    <motion.circle 
                      cx="360" cy="30" r="10" 
                      fill="#7c3aed"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 2.3, duration: 0.5 }}
                    />
                    
                    {/* Labels */}
                    <motion.text 
                      x="40" y="280" 
                      fontSize="12" 
                      fill="#4b5563" 
                      textAnchor="middle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      Entry
                    </motion.text>
                    <motion.text 
                      x="130" y="220" 
                      fontSize="12" 
                      fill="#4b5563" 
                      textAnchor="middle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2, duration: 0.5 }}
                    >
                      Junior
                    </motion.text>
                    <motion.text 
                      x="190" y="160" 
                      fontSize="12" 
                      fill="#4b5563" 
                      textAnchor="middle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.6, duration: 0.5 }}
                    >
                      Mid-level
                    </motion.text>
                    <motion.text 
                      x="270" y="120" 
                      fontSize="12" 
                      fill="#4b5563" 
                      textAnchor="middle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.0, duration: 0.5 }}
                    >
                      Senior
                    </motion.text>
                    <motion.text 
                      x="360" y="50" 
                      fontSize="12" 
                      fill="#4b5563" 
                      textAnchor="middle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2.4, duration: 0.5 }}
                    >
                      Leadership
                    </motion.text>
                  </svg>
                  
                  {/* Title overlay */}
                  <div className="absolute top-4 left-4 bg-white/90 rounded-lg p-3 backdrop-blur-sm border border-indigo-100">
                    <h3 className="text-lg font-semibold text-gray-900">Your AI-Generated Career Path</h3>
                    <p className="text-sm text-gray-600">Customized career progression with milestones</p>
                  </div>
                </div>
                
                {/* Controls/Features */}
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <motion.div 
                    className="bg-indigo-50 p-3 rounded-lg text-center"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-indigo-900">Learning Path</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-purple-50 p-3 rounded-lg text-center"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-purple-900">Skill Analysis</p>
                  </motion.div>
                  
                  <motion.div 
                    className="bg-blue-50 p-3 rounded-lg text-center"
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                      </svg>
                    </div>
                    <p className="text-xs font-medium text-blue-900">Goal Tracking</p>
                  </motion.div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <motion.div 
              className="absolute -top-12 -right-12 bg-gradient-to-br from-indigo-400/20 to-indigo-300/20 rounded-full w-24 h-24"
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, 10, 0]
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            <motion.div 
              className="absolute -bottom-10 -left-10 bg-gradient-to-br from-purple-400/20 to-purple-300/20 rounded-full w-20 h-20"
              animate={{ 
                y: [0, 15, 0],
                rotate: [0, -10, 0]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 1
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}