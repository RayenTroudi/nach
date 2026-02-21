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
    console.warn('\n⚠️  WARNING: Using PRODUCTION keys on localhost!');
    console.warn('   This works but requires:');
    console.warn('   1. Add http://localhost:3000 to "Allowed origins" in Clerk Dashboard');
    console.warn('      → Dashboard → Settings → Domains → Allowed origins');
    console.warn('   2. Custom domain must be fully configured (Pro/Enterprise plan required)');
    console.warn('   3. If you see "jwk-remote-missing" errors:');
    console.warn('      → Clear all cookies for localhost:3000');
    console.warn('      → Visit http://localhost:3000/force-signout');
    console.warn('      → Sign in again');
    console.warn('\n   💡 TIP: For easier development, consider using pk_test_/sk_test_ keys');
    console.warn('       on localhost and pk_live_/sk_live_ only in production.');
  } else {
    console.log('✅ Using TEST/DEVELOPMENT keys - perfect for localhost!');
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
