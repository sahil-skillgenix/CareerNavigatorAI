/**
 * Script to add a test industry to the database
 * Run with: npx tsx server/data-collection/add-test-industry.ts
 */

import dotenv from 'dotenv';
import { connectToDatabase } from '../db/mongodb';
import { IndustryModel } from '../db/models';

// Initialize environment variables
dotenv.config();

async function addTestIndustry() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Create a test industry
    const testIndustry = {
      id: 999,
      name: "Information Technology",
      category: "Technology",
      description: "The information technology industry encompasses companies that research, develop, manufacture, or distribute digital technology including software, hardware, electronics, semiconductors, internet, telecom equipment, e-commerce, and AI.",
      trendDescription: "The IT industry continues to grow with emerging technologies such as artificial intelligence, cloud computing, and cybersecurity becoming increasingly important. Remote work has accelerated the adoption of digital tools and platforms.",
      growthOutlook: "high growth",
      disruptiveTechnologies: [
        "Artificial Intelligence", 
        "Blockchain", 
        "Quantum Computing", 
        "Edge Computing", 
        "5G"
      ],
      regulations: [
        "GDPR", 
        "CCPA", 
        "HIPAA", 
        "PCI DSS"
      ],
      topCompanies: [
        "Microsoft", 
        "Apple", 
        "Google", 
        "Amazon", 
        "Meta"
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to database
    const savedIndustry = await IndustryModel.findOneAndUpdate(
      { name: testIndustry.name },
      testIndustry,
      { upsert: true, new: true }
    );
    
    console.log('Test industry added successfully:');
    console.log(JSON.stringify(savedIndustry, null, 2));
    
    return savedIndustry;
  } catch (error) {
    console.error('Error adding test industry:', error);
    throw error;
  }
}

// Run the function
addTestIndustry()
  .then(() => {
    console.log('Test industry creation completed.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in test industry creation:', error);
    process.exit(1);
  });