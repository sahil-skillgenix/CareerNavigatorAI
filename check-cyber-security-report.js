import 'dotenv/config';
import { MongoClient } from 'mongodb';

async function main() {
  const uri = "mongodb+srv://sahil:L12So8uUyN7TyNZy@skillgenix.4lthw6g.mongodb.net/careerpathAI?retryWrites=true&w=majority";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('careerpathAI');
    const collection = database.collection('skillgenix_careeranalysis');
    
    // Count total documents
    const count = await collection.countDocuments();
    console.log(`Total career analyses in collection: ${count}`);

    // Find reports for Cyber Security Specialist
    const cyberSecurityReports = await collection.find({ 
      desiredRole: { $regex: /cyber security specialist/i } 
    }).toArray();
    
    console.log(`Found ${cyberSecurityReports.length} reports for Cyber Security Specialist`);
    
    if (cyberSecurityReports.length > 0) {
      console.log('Most recent report details:');
      const latestReport = cyberSecurityReports[0];
      console.log(`ID: ${latestReport._id}`);
      console.log(`Created: ${latestReport.createdAt}`);
      console.log(`Professional Level: ${latestReport.professionalLevel}`);
      console.log(`Has result object: ${Boolean(latestReport.result)}`);
      
      if (latestReport.result) {
        console.log('Result sections:');
        console.log(Object.keys(latestReport.result));
      }
    }
    
    // List 5 most recent reports to see what's available
    console.log('\nMost recent 5 reports in the collection:');
    const recentReports = await collection.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .project({ desiredRole: 1, createdAt: 1 })
      .toArray();
    
    recentReports.forEach((report, index) => {
      console.log(`${index + 1}. Role: ${report.desiredRole}, Created: ${report.createdAt}`);
    });

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

main().catch(console.error);