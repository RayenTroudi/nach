/**
 * Clerk Webhook Configuration Tester
 * 
 * This script helps diagnose webhook configuration issues between
 * Clerk (authentication service) and your MongoDB database.
 * 
 * Run: node scripts/test-clerk-webhook.js
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
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testWebhookConfiguration() {
  console.log('\n' + '='.repeat(60));
  log('cyan', '🔍 CLERK WEBHOOK CONFIGURATION TESTER');
  console.log('='.repeat(60) + '\n');

  const errors = [];
  const warnings = [];

  // 1. Check environment variables
  log('blue', '📋 Step 1: Checking Environment Variables...\n');

  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  const webhookSecret = process.env.WEBHOOK_SECRET;
  const mongoUrl = process.env.MONGODB_URL;

  // Check Clerk keys
  if (!publishableKey) {
    log('red', '  ❌ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is missing');
    errors.push('Clerk publishable key not set');
  } else {
    const keyType = publishableKey.startsWith('pk_live_') ? 'PRODUCTION' : 
                    publishableKey.startsWith('pk_test_') ? 'DEVELOPMENT' : 'UNKNOWN';
    log('green', `  ✅ Clerk Publishable Key: ${keyType}`);
    log('blue', `     ${publishableKey.substring(0, 20)}...`);
  }

  if (!secretKey) {
    log('red', '  ❌ CLERK_SECRET_KEY is missing');
    errors.push('Clerk secret key not set');
  } else {
    const keyType = secretKey.startsWith('sk_live_') ? 'PRODUCTION' : 
                    secretKey.startsWith('sk_test_') ? 'DEVELOPMENT' : 'UNKNOWN';
    log('green', `  ✅ Clerk Secret Key: ${keyType}`);
    log('blue', `     ${secretKey.substring(0, 15)}...`);
  }

  // Check for key mismatch
  if (publishableKey && secretKey) {
    const pubIsProd = publishableKey.startsWith('pk_live_');
    const secretIsProd = secretKey.startsWith('sk_live_');
    
    if (pubIsProd !== secretIsProd) {
      log('red', '\n  ⚠️  KEY MISMATCH DETECTED!');
      log('red', '     Publishable and Secret keys are from different Clerk instances');
      errors.push('Clerk key mismatch - must use matching dev or prod keys');
    }
  }

  // Check webhook secret
  if (!webhookSecret) {
    log('red', '  ❌ WEBHOOK_SECRET is missing');
    errors.push('Webhook secret not set');
  } else {
    log('green', `  ✅ Webhook Secret set`);
    log('blue', `     ${webhookSecret.substring(0, 15)}...`);
    
    // Check if webhook secret matches key type
    if (publishableKey) {
      const usingProdKeys = publishableKey.startsWith('pk_live_');
      log('yellow', `\n  ⚠️  Important: Verify your webhook secret matches your Clerk instance:`);
      log('blue', `     Current keys: ${usingProdKeys ? 'PRODUCTION' : 'DEVELOPMENT'}`);
      log('blue', `     Expected webhook: ${usingProdKeys ? 'Production instance' : 'Development instance'}`);
      
      if (usingProdKeys && webhookSecret === 'whsec_sGCjjHqBQsDkeSAWtSHdkVOQeyLrsJPa') {
        log('red', '\n  ❌ CRITICAL: You are using PRODUCTION keys with DEVELOPMENT webhook!');
        log('red', '     This is why login fails!');
        log('yellow', '     Fix: Get production webhook secret from Clerk dashboard');
        errors.push('Production keys with development webhook secret');
      }
    }
  }

  // Check MongoDB URL
  if (!mongoUrl) {
    log('red', '  ❌ MONGODB_URL is missing');
    errors.push('MongoDB URL not set');
  } else {
    log('green', `  ✅ MongoDB URL set`);
  }

  // 2. Test MongoDB Connection
  console.log('\n' + '-'.repeat(60));
  log('blue', '📋 Step 2: Testing MongoDB Connection...\n');

  try {
    const dbName = process.env.DATABASE_NAME || 'nach';
    await mongoose.connect(mongoUrl, {
      dbName: dbName,
    });
    log('green', '  ✅ Connected to MongoDB successfully');
    
    const actualDbName = mongoose.connection.db.databaseName;
    log('blue', `     Database: ${actualDbName}`);

    // Check users collection
    const usersCollection = mongoose.connection.db.collection('users');
    const userCount = await usersCollection.countDocuments();
    log('blue', `     Users in database: ${userCount}`);

    if (userCount === 0) {
      log('yellow', '     ⚠️  No users found - webhook may not be working');
      warnings.push('No users in MongoDB database');
    }

    await mongoose.disconnect();
    log('green', '  ✅ Disconnected from MongoDB');
  } catch (error) {
    log('red', `  ❌ MongoDB connection failed: ${error.message}`);
    errors.push(`MongoDB connection error: ${error.message}`);
  }

  // 3. Summary and Recommendations
  console.log('\n' + '='.repeat(60));
  log('cyan', '📊 DIAGNOSIS SUMMARY');
  console.log('='.repeat(60) + '\n');

  if (errors.length === 0 && warnings.length === 0) {
    log('green', '✅ All checks passed! Webhook configuration looks good.\n');
  } else {
    if (errors.length > 0) {
      log('red', `❌ Found ${errors.length} error(s):\n`);
      errors.forEach((error, i) => {
        log('red', `   ${i + 1}. ${error}`);
      });
      console.log();
    }

    if (warnings.length > 0) {
      log('yellow', `⚠️  Found ${warnings.length} warning(s):\n`);
      warnings.forEach((warning, i) => {
        log('yellow', `   ${i + 1}. ${warning}`);
      });
      console.log();
    }
  }

  // 4. Action Items
  log('cyan', '🔧 RECOMMENDED ACTIONS:\n');

  if (publishableKey && publishableKey.startsWith('pk_live_')) {
    log('yellow', '1. You are using PRODUCTION Clerk keys');
    log('blue', '   → Go to Clerk Dashboard (Production Instance)');
    log('blue', '   → Navigate to Webhooks');
    log('blue', '   → Verify webhook exists: https://www.taleldeutchlandservices.com/api/webhooks');
    log('blue', '   → Copy the Production webhook secret');
    log('blue', '   → Update WEBHOOK_SECRET in .env file');
    console.log();
  }

  if (errors.some(e => e.includes('webhook'))) {
    log('yellow', '2. Webhook Configuration Issue Detected');
    log('blue', '   → Read: CLERK_WEBHOOK_SETUP_GUIDE.md');
    log('blue', '   → Follow the step-by-step setup instructions');
    console.log();
  }

  if (warnings.some(w => w.includes('No users'))) {
    log('yellow', '3. No users in MongoDB database');
    log('blue', '   → If you have existing Clerk users, run: node scripts/sync-clerk-users.js');
    log('blue', '   → Or try signing up a new user to test');
    console.log();
  }

  log('cyan', '📝 Next Steps:');
  log('blue', '   1. Fix any errors shown above');
  log('blue', '   2. Restart your development server');
  log('blue', '   3. Try signing up with a new account');
  log('blue', '   4. Check application logs for webhook events');
  log('blue', '   5. Verify user was created in MongoDB\n');

  console.log('='.repeat(60) + '\n');

  process.exit(errors.length > 0 ? 1 : 0);
}

// Run the test
testWebhookConfiguration().catch(error => {
  log('red', `\n❌ Fatal error: ${error.message}\n`);
  console.error(error);
  process.exit(1);
});
