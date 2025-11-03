import dotenv from 'dotenv';
import { connectToDatabase } from '../lib/mongoose';
import User from '../lib/models/user.model';

dotenv.config({ path: '.env.local' });

async function updateInstructors() {
  try {
    await connectToDatabase();
    console.log('Connected to database');
    
    const instructorEmails = [
      'sarah.schmidt@germanyformation.com',
      'ahmed.benali@germanyformation.com',
      'fatma.trabelsi@germanyformation.com',
      'mohamed.karim@germanyformation.com'
    ];
    
    const result = await User.updateMany(
      { email: { $in: instructorEmails } },
      { $set: { picture: '' } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} instructor pictures to default`);
    
    process.exit(0);
  } catch (error: any) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateInstructors();
