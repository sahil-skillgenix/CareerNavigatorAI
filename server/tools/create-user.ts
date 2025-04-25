import { MongoDBStorage, hashPassword } from "../mongodb-storage";
import { connectToDatabase } from "../db/mongodb";
import { log } from "../vite";
import * as readline from 'readline';
import { stdin as input, stdout as output } from 'process';

/**
 * Command-line tool to create a new user with admin-provided credentials
 * This is a secure way to create new user accounts without affecting existing data
 * 
 * Usage: 
 *   npm run ts-node server/tools/create-user.ts
 * 
 * The tool will interactively prompt for:
 * - Email
 * - Full Name
 * - Password
 * - Security Question
 * - Security Answer
 */

// Create interface for readline
const rl = readline.createInterface({ input, output });

// Helper to ask questions and get answers
function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

// Password strength validator
function isStrongPassword(password: string): boolean {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  
  return password.length >= 8 && hasUppercase && hasLowercase && hasNumber && hasSpecial;
}

// Main function
async function createUser() {
  try {
    log("Starting user creation tool...", "user-tool");
    
    // Connect to database
    await connectToDatabase();
    log("Connected to MongoDB database", "user-tool");
    
    // Initialize storage
    const storage = new MongoDBStorage();
    await storage.initialize();
    log("MongoDB storage initialized", "user-tool");
    
    // Get user input
    const email = await question("Email address: ");
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      log(`User with email ${email} already exists. Exiting.`, "user-tool");
      rl.close();
      return;
    }
    
    const fullName = await question("Full name: ");
    
    let password = "";
    let isValidPassword = false;
    
    while (!isValidPassword) {
      password = await question("Password (min 8 chars, must include uppercase, lowercase, number, and special character): ");
      
      if (!isStrongPassword(password)) {
        log("Password does not meet strength requirements. Please try again.", "user-tool");
        continue;
      }
      
      const confirmPassword = await question("Confirm password: ");
      
      if (password !== confirmPassword) {
        log("Passwords do not match. Please try again.", "user-tool");
        continue;
      }
      
      isValidPassword = true;
    }
    
    const securityQuestion = await question("Security question: ");
    const securityAnswer = await question("Security answer: ");
    
    // Create user
    const user = await storage.createUser({
      email,
      fullName,
      password: await hashPassword(password),
      securityQuestion,
      securityAnswer
    });
    
    log(`User created successfully with ID: ${user.id}`, "user-tool");
    log(`User details: ${user.fullName} (${user.email})`, "user-tool");
    log("User creation complete. You can now log in with these credentials.", "user-tool");
    
    rl.close();
  } catch (error) {
    log(`Error creating user: ${error}`, "user-tool");
    rl.close();
  }
}

// Run the function
createUser();