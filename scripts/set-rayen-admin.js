// Script to set Rayen as admin
// Run with: node scripts/set-rayen-admin.js

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function setRayenAsAdmin() {
  try {
    // Connect to MongoDB
    const MONGODB_URL = process.env.MONGODB_URL;
    const DATABASE_NAME = process.env.DATABASE_NAME;
    
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URL, {
      dbName: DATABASE_NAME || 'nach',
    });
    console.log('✅ Connected to MongoDB');

    // Get User model
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // Update Rayen's user to be admin
    const RAYEN_CLERK_ID = 'user_351RfTo5Cc4J7PXl3IFAcwq3mzC';
    
    console.log(`\n🔄 Setting Rayen (${RAYEN_CLERK_ID}) as admin...`);
    
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: RAYEN_CLERK_ID },
      { isAdmin: true },
      { new: true }
    );

    if (updatedUser) {
      console.log('✅ Successfully updated user to admin!');
      console.log('\n📋 Updated User:');
      console.log(`   Name: ${updatedUser.firstName} ${updatedUser.lastName}`);
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Clerk ID: ${updatedUser.clerkId}`);
      console.log(`   isAdmin: ${updatedUser.isAdmin ? '✅ TRUE' : '❌ FALSE'}`);
    } else {
      console.log('❌ User not found');
    }

    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    console.log('\n🎉 Done! Refresh your browser to see the "Instructor" button');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setRayenAsAdmin();
