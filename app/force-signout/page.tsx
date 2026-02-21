'use client';

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Force Sign-out Page
 * 
 * This page helps fix "jwk-remote-missing" errors by:
 * 1. Completely signing out from Clerk
 * 2. Clearing all session cookies
 * 3. Providing instructions to clear browser cookies
 * 
 * Use this when switching between Clerk instances or when experiencing
 * authentication issues due to stale cookies.
 */
export default function ForceSignOutPage() {
  const { signOut, session } = useClerk();
  const router = useRouter();
  const [isSignedOut, setIsSignedOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Auto sign-out on page load
    const performSignOut = async () => {
      try {
        if (session) {
          await signOut();
          setIsSignedOut(true);
        } else {
          setIsSignedOut(true);
        }
      } catch (err) {
        console.error('Sign-out error:', err);
        setError(err instanceof Error ? err.message : 'Failed to sign out');
        setIsSignedOut(true); // Still show success UI
      }
    };

    performSignOut();
  }, [signOut, session]);

  const handleClearCookies = () => {
    // Clear cookies for the current domain
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
    
    alert('Cookies cleared! Please refresh the page.');
    setTimeout(() => {
      router.push('/');
      router.refresh();
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🔐 Force Sign-Out & Cookie Cleanup
        </h1>

        {!isSignedOut ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Signing out...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded p-4">
              <p className="text-green-800 font-medium">✅ Successfully signed out!</p>
            </div>

            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="text-yellow-800 text-sm">⚠️ {error}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h2 className="font-semibold text-blue-900 mb-2">
                🔧 Fixing "jwk-remote-missing" Error:
              </h2>
              <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                <li>Click "Clear All Cookies" below</li>
                <li>Close all browser tabs for this site</li>
                <li>Open a new tab and visit the site again</li>
                <li>Sign in with your credentials</li>
              </ol>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleClearCookies}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                🗑️ Clear All Cookies
              </Button>

              <Button 
                onClick={() => router.push('/sign-in')}
                variant="outline"
                className="w-full"
              >
                Go to Sign In
              </Button>

              <Button 
                onClick={() => router.push('/')}
                variant="ghost"
                className="w-full"
              >
                Return to Home
              </Button>
            </div>

            <div className="bg-gray-50 rounded p-4 text-xs text-gray-600">
              <p className="font-semibold mb-1">📝 What causes this error?</p>
              <p>
                The "jwk-remote-missing" error occurs when your browser has authentication 
                cookies from a different Clerk instance (e.g., development cookies while 
                using production keys, or vice versa). Clearing cookies fixes this.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
