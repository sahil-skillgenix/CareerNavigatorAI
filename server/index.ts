import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from "dotenv";
import { connectToDatabase } from "./db/mongodb";
import { registerRoutes } from "./routes";
import { MongoDBStorage } from "./mongodb-storage";

// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple logging middleware
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
    
    // Error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
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
