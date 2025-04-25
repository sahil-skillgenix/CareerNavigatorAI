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
import { log } from "./vite";
import { logUserActivity } from "./services/logging-service";

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
      // Log the registration attempt but not the full password data
      log(`Registration attempt for email: ${req.body.email}`, "auth");
      
      const { confirmPassword, ...userData } = req.body;
      
      // Validate required fields
      const requiredFields = ['email', 'fullName', 'password', 'securityQuestion', 'securityAnswer'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({ 
          message: `Missing required fields: ${missingFields.join(', ')}`,
          fields: missingFields
        });
      }
      
      // Validate password matches confirmation
      if (userData.password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      
      // Validate password strength
      const passwordRegex = {
        uppercase: /[A-Z]/,
        lowercase: /[a-z]/,
        number: /[0-9]/,
        special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/
      };
      
      const passwordIssues = [];
      if (userData.password.length < 8) passwordIssues.push("at least 8 characters");
      if (!passwordRegex.uppercase.test(userData.password)) passwordIssues.push("uppercase letter");
      if (!passwordRegex.lowercase.test(userData.password)) passwordIssues.push("lowercase letter");
      if (!passwordRegex.number.test(userData.password)) passwordIssues.push("number");
      if (!passwordRegex.special.test(userData.password)) passwordIssues.push("special character");
      
      if (passwordIssues.length > 0) {
        return res.status(400).json({ 
          message: `Password must contain ${passwordIssues.join(", ")}`,
          issues: passwordIssues
        });
      }
      
      // Check if user already exists
      const existingUser = await storageInstance.getUserByEmail(userData.email);
      if (existingUser) {
        log(`Registration failed: Email ${userData.email} already exists`, "auth");
        return res.status(400).json({ message: "Email already exists" });
      }

      // Create the user with hashed password
      const user = await storageInstance.createUser({
        ...userData,
        password: await hashPassword(userData.password),
      });
      
      log(`User registered successfully: ${userData.email} (${user.id})`, "auth");
      
      // Log the successful registration activity
      try {
        await logUserActivity(
          user.id as string,
          'register',
          'success',
          req,
          { email: userData.email }
        );
      } catch (error) {
        log(`Error logging registration activity: ${error}`, "auth");
        // Don't block registration if activity logging fails
      }

      // Log them in automatically
      req.login(user, (err) => {
        if (err) {
          log(`Auto-login failed after registration: ${err}`, "auth");
          return next(err);
        }
        
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
      log(`Registration error: ${error}`, "auth");
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
      
      // Log the verification attempt without the actual answer
      log(`Password reset: Security answer verification attempt for ${email}`, "auth");
      
      // Validate inputs
      if (!email || !securityAnswer) {
        return res.status(400).json({ 
          message: "Email and security answer are required" 
        });
      }
      
      const user = await storageInstance.getUserByEmail(email);
      if (!user) {
        log(`Password reset: Account not found for ${email}`, "auth");
        return res.status(404).json({ message: "Account not found" });
      }
      
      if (!user.securityQuestion || !user.securityAnswer) {
        log(`Password reset: Security question not set for ${email}`, "auth");
        return res.status(400).json({
          message: "This account doesn't have a security question set up"
        });
      }
      
      // Case insensitive comparison for security answers
      const isAnswerCorrect = 
        user.securityAnswer?.toLowerCase() === securityAnswer.toLowerCase();
      
      if (!isAnswerCorrect) {
        log(`Password reset: Incorrect security answer for ${email}`, "auth");
        
        // Log failed security answer attempt
        await logUserActivity(
          user.id as string,
          'security_answer_verification',
          'failure',
          req,
          { email }
        );
        
        return res.status(400).json({ message: "Incorrect security answer" });
      }
      
      // Generate a one-time reset token that will expire in 15 minutes
      const resetToken = generateToken(
        { userId: user.id, email: user.email, purpose: 'passwordReset' },
        '15m' // 15 minute expiration
      );
      
      // Log successful security answer verification
      await logUserActivity(
        user.id as string,
        'security_answer_verification',
        'success',
        req,
        { email }
      );
      
      log(`Password reset: Security answer verified for ${email}, reset token generated`, "auth");
      
      return res.status(200).json({ 
        message: "Security answer verified",
        resetToken
      });
    } catch (error) {
      log(`Password reset verification error: ${error}`, "auth");
      next(error);
    }
  });
  
  app.post("/api/reset-password", passwordResetRateLimiter, async (req, res, next) => {
    try {
      const { resetToken, newPassword, confirmPassword } = req.body;
      
      // Validate inputs
      if (!resetToken || !newPassword) {
        return res.status(400).json({ 
          message: "Reset token and new password are required" 
        });
      }
      
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ 
          message: "Passwords do not match" 
        });
      }
      
      // Validate password strength
      const passwordRegex = {
        uppercase: /[A-Z]/,
        lowercase: /[a-z]/,
        number: /[0-9]/,
        special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/
      };
      
      const passwordIssues = [];
      if (newPassword.length < 8) passwordIssues.push("at least 8 characters");
      if (!passwordRegex.uppercase.test(newPassword)) passwordIssues.push("uppercase letter");
      if (!passwordRegex.lowercase.test(newPassword)) passwordIssues.push("lowercase letter");
      if (!passwordRegex.number.test(newPassword)) passwordIssues.push("number");
      if (!passwordRegex.special.test(newPassword)) passwordIssues.push("special character");
      
      if (passwordIssues.length > 0) {
        return res.status(400).json({ 
          message: `Password must contain ${passwordIssues.join(", ")}`,
          issues: passwordIssues
        });
      }
      
      // Verify the reset token
      const decoded = verifyToken(resetToken);
      if (!decoded || decoded.purpose !== 'passwordReset') {
        log(`Password reset: Invalid or expired reset token`, "auth");
        return res.status(401).json({ 
          message: "Invalid or expired reset token. Please try the password reset process again."
        });
      }
      
      const userId = decoded.userId;
      
      // Get the user
      const user = await storageInstance.getUser(userId);
      if (!user) {
        log(`Password reset: User not found for ID ${userId}`, "auth");
        return res.status(404).json({ message: "Account not found" });
      }
      
      // Ensure new password is different from old password
      const isSamePassword = await comparePasswords(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({ 
          message: "New password must be different from your current password" 
        });
      }
      
      // Update the password
      const hashedPassword = await hashPassword(newPassword);
      const updatedUser = await storageInstance.updateUserPassword(userId, hashedPassword);
      
      log(`Password reset successful for user ${user.email}`, "auth");
      
      // Log the successful password reset
      await logUserActivity(
        userId,
        'password_reset_complete',
        'success',
        req,
        { email: user.email }
      );
      
      // Invalidate all existing sessions for this user for security
      // (This is a mock as we don't have direct session invalidation)
      
      // Generate a new login token that the client can use immediately
      const newLoginToken = generateToken(user);
      
      return res.status(200).json({ 
        message: "Password reset successful. You can now log in with your new password.",
        token: newLoginToken
      });
    } catch (error) {
      log(`Password reset error: ${error}`, "auth");
      next(error);
    }
  });

  app.post("/api/login", loginRateLimiter, (req, res, next) => {
    const { email } = req.body;
    
    // Log login attempt
    log(`Login attempt for: ${email}`, "auth");
    
    passport.authenticate("local", async (err: any, user: SelectUser | false, info: any) => {
      if (err) {
        // Log authentication error
        await logUserActivity(
          'system', // We don't have a user ID yet
          'login_attempt',
          'failure',
          req,
          { email, error: err.message }
        );
        return next(err);
      }
      
      if (!user) {
        // Log failed login attempt
        await logUserActivity(
          'system' as string, // We don't have a user ID yet
          'login_attempt',
          'failure',
          req,
          { email, reason: 'Invalid email or password' }
        );
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      req.login(user, async (err) => {
        if (err) {
          // Log session creation error
          await logUserActivity(
            user.id as string,
            'login_attempt',
            'failure',
            req,
            { email, error: err.message }
          );
          return next(err);
        }
        
        // Log successful login
        await logUserActivity(
          user.id as string,
          'login',
          'success',
          req
        );
        
        // Generate JWT token with 2 hour expiration
        const token = generateToken(user);
        
        // Remove sensitive data before sending response
        const { password, securityAnswer, ...userWithoutPassword } = user;
        
        log(`User ${email} logged in successfully`, "auth");
        
        // Send token and user data
        return res.status(200).json({
          ...userWithoutPassword,
          token
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", async (req, res, next) => {
    // Get the user ID before logging out
    const userId = req.user?.id as string;
    const userEmail = req.user?.email as string;
    
    // Log the logout request
    log(`Logout request for: ${userEmail || 'unknown user'}`, "auth");
    
    if (userId) {
      try {
        // Log successful logout
        await logUserActivity(
          userId,
          'logout',
          'success',
          req
        );
      } catch (error) {
        // Don't block the logout if logging fails
        log(`Error logging logout activity: ${error}`, "auth");
      }
    }
    
    req.logout((err) => {
      if (err) {
        log(`Error during logout: ${err}`, "auth");
        return next(err);
      }
      log(`User ${userEmail || 'unknown'} logged out successfully`, "auth");
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