/**
 * Clerk Environment Validator
 * 
 * Validates Clerk configuration on startup and warns about common issues
 * that cause "jwk-remote-missing" errors.
 */

export function validateClerkEnvironment() {
  // Only run validation in development
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  const clerkApiUrl = process.env.CLERK_API_URL || process.env.NEXT_PUBLIC_CLERK_API_URL;
  
  console.log('\n🔐 ========== CLERK CONFIGURATION VALIDATION ==========');
  
  // Check if keys are set
  if (!publishableKey || !secretKey) {
    console.error('❌ ERROR: Clerk keys are not configured!');
    console.error('   Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in .env.local');
    return;
  }

  // Detect key type
  const isProdPublishableKey = publishableKey.startsWith('pk_live_');
  const isTestPublishableKey = publishableKey.startsWith('pk_test_');
  const isProdSecretKey = secretKey.startsWith('sk_live_');
  const isTestSecretKey = secretKey.startsWith('sk_test_');

  // Check for key mismatch
  if (isProdPublishableKey !== isProdSecretKey) {
    console.error('❌ CRITICAL ERROR: Clerk key mismatch detected!');
    console.error('   Publishable key type:', isProdPublishableKey ? 'PRODUCTION (pk_live_)' : 'TEST (pk_test_)');
    console.error('   Secret key type:', isProdSecretKey ? 'PRODUCTION (sk_live_)' : 'TEST (sk_test_)');
    console.error('   Both keys must be from the same Clerk instance!');
    return;
  }

  // Warn about production keys on localhost
  if (isProdPublishableKey && isProdSecretKey) {
    console.error('\n❌ ERROR: Using PRODUCTION keys on localhost is NOT recommended!');
    console.error('   This causes inconsistent authentication behavior:');
    console.error('   - Random null userId');
    console.error('   - Unexpected sign-outs');
    console.error('   - Protected route redirect failures');
    console.error('   - jwk-remote-missing errors');
    console.error('\n   ✅ SOLUTION: Use DEVELOPMENT keys for localhost');
    console.error('   Edit .env.local and switch to:');
    console.error('   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...');
    console.error('   CLERK_SECRET_KEY=sk_test_...');
    console.error('\n   Then visit http://localhost:3000/force-signout to clear cookies');
    console.error('\n   Production keys should ONLY be used in production deployment!');
  } else {
    console.log('✅ Using DEVELOPMENT keys - perfect for localhost!');
    console.log('   Reliable authentication, no domain configuration needed.');
  }

  // Check for custom API URL (usually not needed)
  if (clerkApiUrl) {
    console.warn('\n⚠️  WARNING: CLERK_API_URL is set:', clerkApiUrl);
    if (clerkApiUrl !== 'https://api.clerk.com') {
      console.warn('   This might cause issues. Default is: https://api.clerk.com');
      console.warn('   Consider removing CLERK_API_URL and NEXT_PUBLIC_CLERK_API_URL from .env.local');
    }
  }

  // Summary
  console.log('\n📋 Clerk Configuration Summary:');
  console.log('   Environment:', process.env.NODE_ENV);
  console.log('   Key Type:', isProdPublishableKey ? '🚀 PRODUCTION (pk_live_/sk_live_)' : '🔧 DEVELOPMENT (pk_test_/sk_test_)');
  console.log('   Publishable Key:', publishableKey.substring(0, 20) + '...');
  console.log('   Secret Key:', secretKey.substring(0, 15) + '...');
  
  console.log('\n🔐 ===================================================\n');
}
