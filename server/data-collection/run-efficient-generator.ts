/**
 * Runner script for the efficient data generator
 * Run with: npx tsx server/data-collection/run-efficient-generator.ts
 */

import dotenv from 'dotenv';
import { generateEfficientCareerData } from './efficient-generator';

// Load environment variables
dotenv.config();

console.log('Starting efficient career data generation...');

generateEfficientCareerData()
  .then(() => {
    console.log('Efficient career data generation completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error generating career data:', error);
    process.exit(1);
  });