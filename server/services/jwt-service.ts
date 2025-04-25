import jwt from 'jsonwebtoken';
import { User } from '@shared/schema';
import { log } from '../vite';
import crypto from 'crypto';

// Default token expiration time (2 hours)
const TOKEN_EXPIRATION = '2h';

// Secret key generation (will be regenerated each time the server restarts)
// In production, this should be a persistent secret stored securely
// Explicitly cast the secret key with proper type to avoid TS errors
const getJwtSecret = (): jwt.Secret => {
  return process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
};
const JWT_SECRET = getJwtSecret();

// Log key generation but not the key itself
if (!process.env.JWT_SECRET) {
  log('JWT secret key generated for this session', 'security');
  // Note: In production, avoid logging security-related information and use a persistent key
}

export interface TokenPayload {
  userId: string | number;
  email: string;
  purpose?: string; // Optional purpose field for specialized tokens like password reset
  iat?: number; // Issued at (automatically added by sign)
  exp?: number; // Expiration (automatically calculated based on expiresIn)
}

/**
 * Generate a new JWT token 
 * @param userOrPayload The user object or custom payload to include in the token
 * @param expiresIn How long the token should be valid (e.g. '15m', '2h', '7d')
 * @returns The signed JWT token
 */
export function generateToken(
  userOrPayload: Pick<User, 'id' | 'email'> | TokenPayload, 
  expiresIn: string | number = TOKEN_EXPIRATION
): string {
  let payload: TokenPayload;
  
  // Check if this is a custom payload (for password reset, etc.)
  if ('purpose' in userOrPayload) {
    payload = userOrPayload as TokenPayload;
  } else {
    // This is a standard user authentication token
    const user = userOrPayload as Pick<User, 'id' | 'email'>;
    
    // Ensure user ID is defined
    if (!user.id) {
      throw new Error('User ID must be defined to generate a token');
    }
    
    payload = {
      userId: user.id,
      email: user.email
    };
  }
  
  // Use any type to bypass TypeScript's strict checking
  // This is a safe exception since jsonwebtoken accepts string expiresIn values
  const options: any = { expiresIn };
  
  log(`Generating JWT token with expiration: ${expiresIn}`, "security");
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verify a JWT token and return the decoded payload
 * @param token The token to verify
 * @returns The decoded token payload or null if invalid
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    // Create verifyOptions first
    const verifyOptions: jwt.VerifyOptions = {};
    // Cast as any first to ensure compatibility with JwtPayload
    const decodedAny = jwt.verify(token, JWT_SECRET, verifyOptions) as any;
    
    // Verify required fields exist
    if (!decodedAny.userId || !decodedAny.email) {
      log('Token missing required fields', 'security');
      return null;
    }
    
    // Construct proper TokenPayload object
    const decoded: TokenPayload = {
      userId: decodedAny.userId,
      email: decodedAny.email,
      purpose: decodedAny.purpose, // Include purpose for password reset tokens
      iat: decodedAny.iat,
      exp: decodedAny.exp
    };
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      log('Token expired', 'security');
    } else if (error instanceof jwt.JsonWebTokenError) {
      log('Invalid token', 'security');
    } else {
      log(`Token verification error: ${error}`, 'security');
    }
    return null;
  }
}

/**
 * Refresh a token if it's valid but approaching expiration
 * @param token The current token
 * @param thresholdMinutes Minutes before expiration when token should be refreshed
 * @returns A new token if refresh is needed, or null if not needed or invalid
 */
export function refreshTokenIfNeeded(token: string, thresholdMinutes: number = 30): string | null {
  try {
    // Use the same verification approach as verifyToken
    const verifyOptions: jwt.VerifyOptions = {};
    const decodedAny = jwt.verify(token, JWT_SECRET, verifyOptions) as any;
    
    // Verify required fields exist
    if (!decodedAny.userId || !decodedAny.email || !decodedAny.exp) {
      return null;
    }
    
    // Calculate if token is approaching expiration
    const expirationTime = new Date(decodedAny.exp * 1000);
    const thresholdTime = new Date(Date.now() + thresholdMinutes * 60 * 1000);
    
    // If token expires soon, refresh it
    if (expirationTime < thresholdTime) {
      // Ensure we have valid values for generateToken
      if (typeof decodedAny.userId === 'string' || typeof decodedAny.userId === 'number') {
        return generateToken({ 
          id: decodedAny.userId, 
          email: decodedAny.email 
        });
      }
    }
    
    return null; // Token is still valid and not near expiration
  } catch (error) {
    // Invalid token, don't refresh
    return null;
  }
}

/**
 * Check if a token has expired
 * @param token The token to check
 * @returns true if token has expired, false if still valid
 */
export function isTokenExpired(token: string): boolean {
  try {
    const verifyOptions: jwt.VerifyOptions = {};
    jwt.verify(token, JWT_SECRET, verifyOptions);
    return false; // Token is valid
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return true; // Token has expired
    }
    return true; // Other errors mean the token is invalid
  }
}

/**
 * Extract user information from token without validation
 * @param token The token to decode
 * @returns The decoded payload without validation, or null if decoding fails
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Create a middleware that validates JWT tokens
 * @param options Configuration options for the middleware
 * @returns Express middleware that validates JWT tokens
 */
export function jwtAuthMiddleware(options: { 
  requireAuth: boolean,
  excludePaths?: string[] 
} = { requireAuth: true }) {
  return (req: any, res: any, next: any) => {
    // Skip JWT validation for excluded paths
    if (options.excludePaths && options.excludePaths.some(path => req.path.startsWith(path))) {
      return next();
    }
    
    // Get token from Authorization header or cookies
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.cookies?.token;
    
    if (!token) {
      if (options.requireAuth) {
        return res.status(401).json({ message: 'No token provided' });
      } else {
        return next();
      }
    }
    
    // Verify the token
    const decoded = verifyToken(token);
    if (!decoded) {
      if (options.requireAuth) {
        return res.status(401).json({ message: 'Invalid or expired token' });
      } else {
        return next();
      }
    }
    
    // Attach user info to request
    req.jwtUser = decoded;
    
    // Check if token needs refresh
    const newToken = refreshTokenIfNeeded(token);
    if (newToken) {
      res.setHeader('X-New-Token', newToken);
    }
    
    next();
  };
}