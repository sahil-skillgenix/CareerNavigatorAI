/**
 * Run this script to generate only skill data for the database
 * This is helpful when you want to populate just one type of data
 * Run with: npx tsx server/data-collection/generate-skills-only.ts
 */

import dotenv from 'dotenv';
import { generateSkills } from './modular-generator';

// Load environment variables
dotenv.config();

console.log('Starting skill-only generation...');

generateSkills()
  .then((count) => {
    console.log(`Skill-only generation completed successfully! Generated ${count} skills.`);
    process.exit(0);
  })
  .catch(error => {
    console.error('Error generating skills:', error);
    process.exit(1);
  });