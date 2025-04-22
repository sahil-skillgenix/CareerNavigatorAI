/**
 * This is a standalone script to generate career data for the Skillgenix platform.
 * Run it with: npx tsx server/data-collection/main-generator.ts
 */

import dotenv from 'dotenv';
import { connectToDatabase } from '../db/mongodb';
import { generateCareerData } from './generate-career-data';

// Load environment variables
dotenv.config();

// Main function
async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await connectToDatabase();
    
    console.log('Starting career data generation...');
    await generateCareerData();
    
    console.log('Career data generation completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error generating career data:', error);
    process.exit(1);
  }
}

// Run the main function
main();