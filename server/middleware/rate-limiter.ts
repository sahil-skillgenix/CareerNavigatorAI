import { Request, Response, NextFunction } from 'express';
import { log } from '../vite';

// Define the interface for our rate limit records
interface RateLimitRecord {
  ip: string;
  endpoint: string;
  count: number;
  resetAt: Date;
}

// Create a Map to store rate limit information in memory
// This will reset when the server restarts
const rateLimits = new Map<string, RateLimitRecord>();

// Define timeframes in milliseconds
const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

/**
 * Rate limiter middleware
 * @param maxAttempts Maximum number of attempts allowed within the timeframe
 * @param timeframe Timeframe in milliseconds
 * @param endpoint Optional endpoint identifier to apply different limits to different endpoints
 * @returns Express middleware
 */
export function rateLimiter(maxAttempts: number = 5, timeframe: number = FIFTEEN_MINUTES, endpoint: string = 'default') {
  return (req: Request, res: Response, next: NextFunction) => {
    // Get client IP
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    // Create a key for this IP and endpoint
    const key = `${ip}:${endpoint}`;
    
    // Get current time
    const now = new Date();
    
    // Check if this IP is already in our records
    if (rateLimits.has(key)) {
      const record = rateLimits.get(key)!;
      
      // Check if the timeframe has expired
      if (now > record.resetAt) {
        // Reset the counter
        record.count = 1;
        record.resetAt = new Date(now.getTime() + timeframe);
        rateLimits.set(key, record);
      } else {
        // Increment the counter
        record.count += 1;
        
        // Check if max attempts exceeded
        if (record.count > maxAttempts) {
          // Log the rate limiting
          log(`Rate limit exceeded for IP ${ip} on endpoint ${endpoint}`, 'security');
          
          // Set when they can try again
          const retryAfter = Math.ceil((record.resetAt.getTime() - now.getTime()) / 1000);
          
          // Send 429 response
          res.status(429).json({
            error: 'Too many requests, please try again later',
            retryAfter: retryAfter,
          });
          return;
        }
        
        // Update the record
        rateLimits.set(key, record);
      }
    } else {
      // Create a new record for this IP
      rateLimits.set(key, {
        ip,
        endpoint,
        count: 1,
        resetAt: new Date(now.getTime() + timeframe),
      });
    }
    
    // All good, continue
    next();
  };
}

// Specific rate limiter for login attempts - more strict
export const loginRateLimiter = rateLimiter(5, FIFTEEN_MINUTES, 'login');

// Specific rate limiter for registration attempts
export const registerRateLimiter = rateLimiter(3, ONE_HOUR, 'register');

// Specific rate limiter for password reset attempts
export const passwordResetRateLimiter = rateLimiter(3, ONE_HOUR, 'password-reset');

// API rate limiter - more generous
export const apiRateLimiter = rateLimiter(100, FIFTEEN_MINUTES, 'api');