import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from "dotenv";
import { connectToDatabase } from "./db/mongodb";
import { registerRoutes } from "./routes";
import { MongoDBStorage } from "./mongodb-storage";
import { logError, logUserActivity, getAPIRequestLogs } from "./services/logging-service";
import { apiRequestLogger, authEventLogger, errorLogger } from "./services/activity-logger";
import { inputSanitizer } from "./middleware/input-sanitizer";
import { apiRateLimiter } from "./middleware/rate-limiter";
import { securityHeaders } from "./middleware/security-headers";

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Apply security middleware
// 1. Security headers to protect against common web vulnerabilities
app.use(securityHeaders());

// 2. Input sanitizer to prevent XSS and injection attacks
app.use(inputSanitizer);

// 3. API rate limiter to prevent abuse
app.use("/api", apiRateLimiter);

// MongoDB-based API request logging middleware
app.use(apiRequestLogger());

// Authentication event logging middleware
app.use(authEventLogger());

// Simple console logging middleware (kept for immediate feedback)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  next();
});

// Simple health check route to test if the server is running
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

(async () => {
  try {
    // Create HTTP server
    const server = createServer(app);
    
    // Initialize MongoDB connection and storage
    console.log("Testing MongoDB connection...");
    try {
      await connectToDatabase();
      console.log("MongoDB connection successful!");
      
      // Initialize MongoDB storage
      const mongoDBStorage = new MongoDBStorage();
      await mongoDBStorage.initialize();
      console.log("MongoDB storage initialized");
      
      // Register all routes with MongoDB storage
      await registerRoutes(app, mongoDBStorage);
      console.log("Routes registered with MongoDB storage");
    } catch (dbError) {
      console.error("MongoDB connection failed:", dbError);
      console.log("Falling back to in-memory storage");
      
      // Register routes with default in-memory storage
      await registerRoutes(app);
    }
    
    // Database error logging middleware
    app.use(errorLogger());
    
    // Final error handler
    app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error("Error:", err);
      res.status(status).json({ message });
    });

    // Set up Vite for development
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start server on port 5000
    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Fatal server error:", error);
    process.exit(1);
  }
})();
