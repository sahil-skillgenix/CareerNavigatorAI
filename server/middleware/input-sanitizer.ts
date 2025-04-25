import { Request, Response, NextFunction } from 'express';
import { log } from '../vite';

// Characters to be considered suspicious in inputs
const SUSPICIOUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
  /javascript:/gi, // JavaScript protocol
  /on\w+\s*=/gi, // Inline event handlers
  /<%=.*%>/gi, // Server-side includes
  /{{.*}}/gi, // Template injection
  /(\b)(on\S+)(\s*)=/gi, // JavaScript event handlers
  /document\./gi, // DOM manipulation
  /\.\./gi, // Path traversal
  /\beval\(/gi, // Eval execution
  /\bexec\(/gi, // Shell command execution
  /\balert\(/gi, // Alert dialogs
  /\bconsole\./gi, // Console API
  /\bprompt\(/gi, // Prompt dialogs
  /\bconfirm\(/gi, // Confirm dialogs
  /\$\{.*\}/gi, // Template literals
];

/**
 * Checks if a given value contains suspicious patterns that could indicate an injection attack
 * @param value The value to check
 * @returns true if suspicious patterns are found, false otherwise
 */
function hasSuspiciousPatterns(value: string): boolean {
  if (typeof value !== 'string') return false;
  
  // Check for common XSS or injection patterns
  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(value));
}

/**
 * Recursively checks all properties of an object for suspicious patterns
 * @param obj The object to check
 * @returns true if any property contains suspicious patterns, false otherwise
 */
function hasObjectSuspiciousPatterns(obj: any): boolean {
  if (obj === null || obj === undefined) return false;
  
  if (typeof obj === 'string') {
    return hasSuspiciousPatterns(obj);
  }
  
  if (typeof obj === 'object') {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && hasSuspiciousPatterns(obj[key])) {
        return true;
      } else if (typeof obj[key] === 'object' && hasObjectSuspiciousPatterns(obj[key])) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Middleware that checks all request parameters for suspicious patterns
 * that could indicate XSS or injection attacks
 */
export function inputSanitizer(req: Request, res: Response, next: NextFunction) {
  // Check query parameters
  if (hasObjectSuspiciousPatterns(req.query)) {
    log(`Suspicious pattern detected in query parameters: ${JSON.stringify(req.query)}`, 'security');
    return res.status(400).json({ 
      error: 'Invalid input detected in query parameters' 
    });
  }
  
  // Check body parameters
  if (hasObjectSuspiciousPatterns(req.body)) {
    log(`Suspicious pattern detected in request body: ${JSON.stringify(req.body)}`, 'security');
    return res.status(400).json({ 
      error: 'Invalid input detected in request body' 
    });
  }
  
  // Check URL parameters
  if (hasObjectSuspiciousPatterns(req.params)) {
    log(`Suspicious pattern detected in URL parameters: ${JSON.stringify(req.params)}`, 'security');
    return res.status(400).json({ 
      error: 'Invalid input detected in URL parameters' 
    });
  }
  
  // All good, continue
  next();
}