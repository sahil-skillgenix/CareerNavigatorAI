/**
 * Animation variants for Framer Motion
 * 
 * A collection of reusable animation variants for creating consistent
 * and smooth animations throughout the Skillgenix application.
 */

import { Variants } from 'framer-motion';

/**
 * Fade in animation from invisible to visible
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

/**
 * Fade in from the bottom with slight upward movement
 */
export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: (custom = 0) => ({ 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      delay: custom
    }
  })
};

/**
 * Fade in from the top with slight downward movement
 */
export const fadeInDown: Variants = {
  hidden: { 
    opacity: 0, 
    y: -20 
  },
  visible: (custom = 0) => ({ 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      delay: custom
    }
  })
};

/**
 * Fade in from the left with rightward movement
 */
export const fadeInLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: (custom = 0) => ({ 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.5,
      delay: custom
    }
  })
};

/**
 * Fade in from the right with leftward movement
 */
export const fadeInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 20 
  },
  visible: (custom = 0) => ({ 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.5,
      delay: custom
    }
  })
};

/**
 * Zoom in animation from small to full size
 */
export const zoomIn: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5 }
  }
};

/**
 * Stagger animation for child elements
 */
export const staggerChildren: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

/**
 * Pulse animation for highlighting elements
 */
export const pulse: Variants = {
  hidden: { 
    scale: 1 
  },
  visible: { 
    scale: [1, 1.05, 1],
    transition: { 
      duration: 1.5, 
      repeat: Infinity, 
      repeatType: 'loop',
      ease: 'easeInOut'
    }
  }
};

/**
 * Slide in from left to right, good for progress indicators
 */
export const slideInLeft: Variants = {
  hidden: { 
    width: 0
  },
  visible: (custom = 0) => ({ 
    width: '100%',
    transition: { 
      duration: 1,
      delay: custom
    }
  })
};

/**
 * Bounce animation for playful UI elements
 */
export const bounce: Variants = {
  hidden: { y: 0 },
  visible: {
    y: [0, -15, 0],
    transition: { 
      duration: 0.6, 
      repeat: Infinity, 
      repeatType: 'loop',
      repeatDelay: 2,
      ease: 'easeInOut'
    }
  }
};