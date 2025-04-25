import { Request, Response, NextFunction } from 'express';

/**
 * Middleware that adds various security headers to help protect against
 * common web vulnerabilities and attacks
 */
export function securityHeaders() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Protect against XSS attacks
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Control how much information the browser includes with referrers
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Prevent clickjacking by not allowing the site to be framed
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Set strict Content Security Policy
    // This can be adjusted based on the application's needs
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " + 
      "style-src 'self' 'unsafe-inline'; " + 
      "img-src 'self' data:; " + 
      "font-src 'self'; " +
      "connect-src 'self' https://*.replit.dev;"
    );
    
    // Permissions Policy to limit access to browser features
    res.setHeader('Permissions-Policy', 
      'geolocation=(), camera=(), microphone=(), payment=()'
    );
    
    // Prevent browsers from caching sensitive endpoints
    if (req.path.includes('/api/') && !req.path.includes('/api/health')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
    }
    
    next();
  };
}