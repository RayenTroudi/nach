// Quick script to check and update your user's isAdmin status
// Run with: node scripts/check-admin.js

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function checkAndUpdateAdmin() {
  try {
    // Connect to MongoDB
    const MONGODB_URL = process.env.MONGODB_URL;
    const DATABASE_NAME = process.env.DATABASE_NAME;
    
    if (!MONGODB_URL) {
      throw new Error('MONGODB_URL not found in .env.local');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URL, {
      dbName: DATABASE_NAME || 'nach',
    });
    console.log('✅ Connected to MongoDB');

    // Get User model
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // Find all users
    const users = await User.find({}).select('clerkId firstName lastName email isAdmin');
    
    console.log('\n📋 All Users in Database:');
    console.log('==========================');
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.firstName || 'Unknown'} ${user.lastName || ''}`);
      console.log(`   Email: ${user.email || 'N/A'}`);
      console.log(`   Clerk ID: ${user.clerkId}`);
      console.log(`   isAdmin: ${user.isAdmin ? '✅ TRUE' : '❌ FALSE'}`);
      console.log(`   MongoDB _id: ${user._id}`);
    });

    console.log('\n\n💡 To make a user admin, note their Clerk ID from above');
    console.log('📝 Then update the ADMIN_CLERK_ID in this script and run again\n');

    // UNCOMMENT AND UPDATE THIS TO MAKE A USER ADMIN:
    // const ADMIN_CLERK_ID = 'user_xxxxx'; // Replace with actual Clerk ID
    // const updatedUser = await User.findOneAndUpdate(
    //   { clerkId: ADMIN_CLERK_ID },
    //   { isAdmin: true },
    //   { new: true }
    // );
    // console.log('✅ Updated user:', updatedUser);

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAndUpdateAdmin();
