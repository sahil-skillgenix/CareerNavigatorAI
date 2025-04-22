/**
 * Run this script to generate only role data for the database
 * This is helpful when you want to populate just one type of data
 * Run with: npx tsx server/data-collection/generate-roles-only.ts
 */

import dotenv from 'dotenv';
import { generateRoles } from './modular-generator';

// Load environment variables
dotenv.config();

console.log('Starting role-only generation...');

generateRoles()
  .then((count) => {
    console.log(`Role-only generation completed successfully! Generated ${count} roles.`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error generating roles:', error);
    process.exit(1);
  });