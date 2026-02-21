import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    clerkConfig: {
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20) + "...",
      signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
      signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
      afterSignInUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
      afterSignUpUrl: process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      hasSecretKey: !!process.env.CLERK_SECRET_KEY,
    },
  });
}
