import { MongoDBStorage, hashPassword } from "../mongodb-storage";
import { connectToDatabase } from "../db/mongodb";
import { log } from "../vite";
import * as readline from 'readline';
import { stdin as input, stdout as output } from 'process';
import { SECURITY_QUESTIONS } from '@shared/schema';

/**
 * Command-line tool to create a new user with admin-provided credentials
 * This is a secure way to create new user accounts without affecting existing data
 * 
 * Usage: 
 *   npx tsx server/tools/create-user.ts
 * 
 * The tool will interactively prompt for:
 * - Email
 * - Full Name
 * - Password
 * - Security Question
 * - Security Answer
 */

// Create interface for readline that we'll initialize inside the function
let rl: readline.Interface;

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

// Email validator
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// Test data with predefined values
const createTestUser = async (storage: MongoDBStorage) => {
  const testEmail = "test@skillgenix.com";
  
  // Check if user already exists
  const existingUser = await storage.getUserByEmail(testEmail);
  if (existingUser) {
    log(`Test user with email ${testEmail} already exists.`, "user-tool");
    return;
  }
  
  // Create test user with strong password
  try {
    const user = await storage.createUser({
      email: testEmail,
      fullName: "Test User",
      password: await hashPassword("Test1234!"),
      securityQuestion: "What is your favorite movie?", // Use one from the shared schema
      securityAnswer: "The Matrix"
    });
    
    log(`Test user created successfully: ${user.email} (${user.id})`, "user-tool");
  } catch (error) {
    log(`Error creating test user: ${error}`, "user-tool");
  }
};

// Create user with interactive prompts
const createInteractiveUser = async (storage: MongoDBStorage) => {
  try {
    // Create a new readline interface within the function scope
    rl = readline.createInterface({ input, output });
    
    // Get email with validation
    let email = "";
    let isValidEmailInput = false;
    
    while (!isValidEmailInput) {
      email = await question("Email address: ");
      
      if (!isValidEmail(email)) {
        log("Invalid email format. Please enter a valid email address.", "user-tool");
        continue;
      }
      
      isValidEmailInput = true;
    }
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      log(`User with email ${email} already exists. Please try with a different email.`, "user-tool");
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
    
    // Use the predefined security questions from schema
    log("Security questions:", "user-tool");
    SECURITY_QUESTIONS.forEach((q, i) => {
      log(`${i + 1}. ${q}`, "user-tool");
    });
    
    let securityQuestion: typeof SECURITY_QUESTIONS[number] | undefined = undefined;
    while (!securityQuestion) {
      const choiceInput = await question(`Select a security question (1-${SECURITY_QUESTIONS.length}): `);
      const choice = parseInt(choiceInput);
      
      if (isNaN(choice) || choice < 1 || choice > SECURITY_QUESTIONS.length) {
        log(`Invalid selection. Please enter a number between 1 and ${SECURITY_QUESTIONS.length}.`, "user-tool");
        continue;
      }
      
      securityQuestion = SECURITY_QUESTIONS[choice - 1];
    }
    
    let securityAnswer = "";
    while (!securityAnswer) {
      securityAnswer = await question("Security answer: ");
      if (!securityAnswer.trim()) {
        log("Security answer cannot be empty. Please try again.", "user-tool");
      }
    }
    
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
    if (rl) rl.close();
  }
};

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
    
    // Check command line arguments
    const args = process.argv.slice(2);
    
    if (args.includes('--test')) {
      // Create test user
      await createTestUser(storage);
      process.exit(0);
    } else {
      // Interactive mode
      await createInteractiveUser(storage);
    }
  } catch (error) {
    log(`Error in main function: ${error}`, "user-tool");
    process.exit(1);
  }
}

// Run the function
createUser();