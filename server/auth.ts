import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { IStorage, storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { 
  loginRateLimiter, 
  registerRateLimiter, 
  passwordResetRateLimiter 
} from "./middleware/rate-limiter";
import { 
  generateToken, 
  verifyToken, 
  jwtAuthMiddleware 
} from "./services/jwt-service";
import { encryptFields, decryptFields } from "./services/encryption-service";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express, storageInstance: IStorage = storage) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "career-path-ai-secret",
    resave: false,
    saveUninitialized: false,
    store: storageInstance.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        const user = await storageInstance.getUserByEmail(email);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storageInstance.getUser(id);
      if (!user) {
        // If user not found (possibly due to database repair), logout
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      console.error("Error deserializing user:", error);
      // For session deserialization issues, just return false rather than error
      // This will log the user out without crashing the application
      done(null, false);
    }
  });

  app.post("/api/register", registerRateLimiter, async (req, res, next) => {
    try {
      const { confirmPassword, ...userData } = req.body;
      
      const existingUser = await storageInstance.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const user = await storageInstance.createUser({
        ...userData,
        password: await hashPassword(userData.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        
        // Generate JWT token with 2 hour expiration
        const token = generateToken(user);
        
        // Remove sensitive data before sending response
        const { password, securityAnswer, ...userWithoutPassword } = user;
        
        // Send token and user data
        res.status(201).json({
          ...userWithoutPassword,
          token
        });
      });
    } catch (error) {
      next(error);
    }
  });
  
  // Account recovery endpoints
  app.post("/api/find-account", passwordResetRateLimiter, async (req, res, next) => {
    try {
      const { email } = req.body;
      
      const user = await storageInstance.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Return the security question but not the answer
      const { securityQuestion } = user;
      
      if (!securityQuestion) {
        return res.status(400).json({ 
          message: "This account doesn't have a security question set up" 
        });
      }
      
      return res.status(200).json({ 
        email,
        securityQuestion 
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/verify-security-answer", passwordResetRateLimiter, async (req, res, next) => {
    try {
      const { email, securityAnswer } = req.body;
      
      const user = await storageInstance.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Case insensitive comparison for security answers
      const isAnswerCorrect = 
        user.securityAnswer?.toLowerCase() === securityAnswer.toLowerCase();
      
      if (!isAnswerCorrect) {
        return res.status(400).json({ message: "Incorrect security answer" });
      }
      
      return res.status(200).json({ 
        message: "Security answer verified" 
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/reset-password", passwordResetRateLimiter, async (req, res, next) => {
    try {
      const { email, securityAnswer, newPassword } = req.body;
      
      const user = await storageInstance.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Case insensitive comparison for security answers
      const isAnswerCorrect = 
        user.securityAnswer?.toLowerCase() === securityAnswer.toLowerCase();
      
      if (!isAnswerCorrect) {
        return res.status(400).json({ message: "Incorrect security answer" });
      }
      
      // Update the password
      const hashedPassword = await hashPassword(newPassword);
      // Ensure ID is not undefined before passing it
      if (!user.id) {
        return res.status(500).json({ message: "User ID not found" });
      }
      const updatedUser = await storageInstance.updateUserPassword(user.id, hashedPassword);
      
      return res.status(200).json({ 
        message: "Password reset successful. You can now log in with your new password." 
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", loginRateLimiter, (req, res, next) => {
    passport.authenticate("local", (err: any, user: SelectUser | false, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid email or password" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Generate JWT token with 2 hour expiration
        const token = generateToken(user);
        
        // Remove sensitive data before sending response
        const { password, securityAnswer, ...userWithoutPassword } = user;
        
        // Send token and user data
        return res.status(200).json({
          ...userWithoutPassword,
          token
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Add JWT auth middleware to the API routes that need protection
  app.use("/api/user", jwtAuthMiddleware({ requireAuth: false, excludePaths: ["/api/login", "/api/register", "/api/find-account", "/api/verify-security-answer", "/api/reset-password"] }));
  
  app.get("/api/user", (req, res) => {
    // First check JWT authentication
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.cookies?.token;
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        // Find user in database
        storageInstance.getUser(decoded.userId)
          .then(user => {
            if (!user) {
              return res.status(401).json({ message: "User not found" });
            }
            const { password, securityAnswer, ...userWithoutPassword } = user;
            return res.json({
              ...userWithoutPassword,
              token  // Return the token for auto-refresh on client
            });
          })
          .catch(err => {
            console.error("JWT user lookup error:", err);
            return res.status(500).json({ message: "Error retrieving user data" });
          });
        return;
      }
    }
    
    // Fall back to session-based authentication
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const { password, securityAnswer, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
}