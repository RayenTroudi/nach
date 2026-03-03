/**
 * Clerk to MongoDB User Sync Script
 * 
 * This script fetches all users from Clerk and ensures they exist in MongoDB.
 * Useful when:
 * - Webhook was not configured when users signed up
 * - Switching from old database to new database
 * - After fixing webhook configuration
 * 
 * Run: node scripts/sync-clerk-users.js
 */

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// User Schema (simplified - matches your model)
const UserSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  picture: { type: String },
  isAdmin: { type: Boolean, default: false },
  wallet: { type: Number, default: 0 },
  interests: [{ type: String, default: [] }],
  createdCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: [] }],
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: [] }],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function fetchClerkUsers() {
  const secretKey = process.env.CLERK_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('CLERK_SECRET_KEY not found in environment variables');
  }

  log('blue', '🔍 Fetching users from Clerk...');
  
  try {
    const response = await fetch('https://api.clerk.com/v1/users?limit=100', {
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Clerk API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    log('green', `✅ Found ${data.length} users in Clerk`);
    
    return data;
  } catch (error) {
    log('red', `❌ Failed to fetch users from Clerk: ${error.message}`);
    throw error;
  }
}

async function syncUsers() {
  console.log('\n' + '='.repeat(60));
  log('cyan', '🔄 CLERK TO MONGODB USER SYNC');
  console.log('='.repeat(60) + '\n');

  // Check environment
  const secretKey = process.env.CLERK_SECRET_KEY;
  const mongoUrl = process.env.MONGODB_URL;

  if (!secretKey || !mongoUrl) {
    log('red', '❌ Missing required environment variables');
    log('yellow', '   Required: CLERK_SECRET_KEY, MONGODB_URL');
    process.exit(1);
  }

  const keyType = secretKey.startsWith('sk_live_') ? 'PRODUCTION' : 'DEVELOPMENT';
  log('blue', `📋 Clerk Instance: ${keyType}`);
  console.log();

  // Connect to MongoDB
  try {
    const dbName = process.env.DATABASE_NAME || 'nach';
    await mongoose.connect(mongoUrl, {
      dbName: dbName,
    });
    log('green', '✅ Connected to MongoDB');
    const actualDbName = mongoose.connection.db.databaseName;
    log('blue', `   Database: ${actualDbName}\n`);
  } catch (error) {
    log('red', `❌ MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }

  // Fetch Clerk users
  let clerkUsers;
  try {
    clerkUsers = await fetchClerkUsers();
  } catch (error) {
    await mongoose.disconnect();
    process.exit(1);
  }

  if (!clerkUsers || clerkUsers.length === 0) {
    log('yellow', '⚠️  No users found in Clerk');
    await mongoose.disconnect();
    process.exit(0);
  }

  console.log();
  log('blue', '📊 Starting sync process...\n');

  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const clerkUser of clerkUsers) {
    const email = clerkUser.email_addresses?.[0]?.email_address || 'no-email@example.com';
    const firstName = clerkUser.first_name || clerkUser.username || 'User';
    const lastName = clerkUser.last_name || 'N/A';
    
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ clerkId: clerkUser.id });
      
      if (existingUser) {
        log('yellow', `⏭️  Skipped: ${email} (already exists)`);
        skipped++;
        continue;
      }

      // Create user in MongoDB
      const mongoUser = {
        clerkId: clerkUser.id,
        firstName,
        lastName,
        username: clerkUser.username || `${firstName}${lastName ? ` ${lastName}` : ''}`,
        email,
        picture: clerkUser.image_url || '',
      };

      await User.create(mongoUser);
      log('green', `✅ Created: ${email}`);
      created++;
    } catch (error) {
      log('red', `❌ Failed: ${email} - ${error.message}`);
      errors++;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  log('cyan', '📊 SYNC SUMMARY');
  console.log('='.repeat(60) + '\n');

  log('green', `✅ Created: ${created} users`);
  log('yellow', `⏭️  Skipped: ${skipped} users (already existed)`);
  if (errors > 0) {
    log('red', `❌ Errors: ${errors} users`);
  }
  log('blue', `📋 Total Clerk users: ${clerkUsers.length}`);

  console.log();

  // Verify final count
  const totalUsers = await User.countDocuments();
  log('blue', `💾 Total users in MongoDB: ${totalUsers}\n`);

  await mongoose.disconnect();
  log('green', '✅ Sync complete!\n');

  console.log('='.repeat(60) + '\n');
}

// Run the sync
syncUsers().catch(error => {
  log('red', `\n❌ Fatal error: ${error.message}\n`);
  console.error(error);
  process.exit(1);
});
