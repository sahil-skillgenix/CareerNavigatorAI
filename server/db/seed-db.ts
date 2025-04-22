import { connectToDatabase } from './mongodb';
import { 
  SkillModel, 
  RoleModel, 
  IndustryModel,
  CareerPathwayModel
} from './models';
import { generateCareerData } from '../data-collection/generate-career-data';

/**
 * Checks if the database needs seeding and seeds it if necessary.
 * This runs on application startup.
 */
export async function checkAndSeedDatabase() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Check if essential models have any data
    const skillCount = await SkillModel.countDocuments();
    const roleCount = await RoleModel.countDocuments();
    const industryCount = await IndustryModel.countDocuments();
    const pathwayCount = await CareerPathwayModel.countDocuments();
    
    // If any of these are empty, we need to seed the database
    if (skillCount === 0 || roleCount === 0 || industryCount === 0 || pathwayCount === 0) {
      console.log('Database needs seeding. Starting seed process...');
      await generateCareerData();
      console.log('Database seeding completed successfully.');
    } else {
      console.log('Database already seeded. Skipping seed process.');
    }
    
    // Log some stats about the database
    console.log(`Database contains: 
      - ${skillCount} skills
      - ${roleCount} roles
      - ${industryCount} industries
      - ${pathwayCount} career pathways`);
    
    console.log('Database check/seed completed');
  } catch (error) {
    console.error('Error checking/seeding database:', error);
    // Don't throw the error, just log it, as this shouldn't block app startup
  }
}

// Run the check/seed function if this file is executed directly
if (require.main === module) {
  checkAndSeedDatabase()
    .then(() => {
      console.log('Database check/seed completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Database check/seed failed:', error);
      process.exit(1);
    });
}