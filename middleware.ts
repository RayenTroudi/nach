import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

const PUBLIC_ROUTE_MATCHERS: RegExp[] = [
  /^\/$/,
  /^\/api\/review$/,
  /^\/api\/uploadthing/,
  /^\/api\/webhooks/,
  /^\/api\/courses$/,
  /^\/api\/ausbildung$/,
  /^\/api\/video-proxy$/,
  /^\/api\/video-stream$/,
  /^\/api\/auth\/reset-password$/,
  /^\/api\/auth\/password-changed$/,
  /^\/api\/health$/,
  /^\/api\/me$/,
  /^\/api\/debug\/user$/,
  /^\/courses\/.*$/,
  /^\/course\/.*$/,
  /^\/user\/.*$/,
  /^\/about$/,
  /^\/blog(?:\/.*)?$/,
  /^\/sign-in(?:\/.*)?$/,
  /^\/sign-up(?:\/.*)?$/,
  /^\/forgot-password$/,
  /^\/reset-password$/,
  /^\/force-signout$/,  // Allow cookie cleanup
  /^\/contact(?:\/.*)?$/,
  /^\/documents(?:\/.*)?$/,
  /^\/(en|de|ar)$/,
  /^\/(en|de|ar)\/sign-in(?:\/.*)?$/,
  /^\/(en|de|ar)\/sign-up(?:\/.*)?$/,
  /^\/(en|de|ar)\/forgot-password$/,
  /^\/(en|de|ar)\/reset-password$/,
];


const IGNORED_ROUTES = [
  "/api/webhooks(.*)",
  "/api/health",
  "/_next/static(.*)",
  "/_next/image(.*)",
  "/favicon.ico",
  "/_vercel/speed-insights(.*)",
];

export default authMiddleware({
  publicRoutes: PUBLIC_ROUTE_MATCHERS,
  ignoredRoutes: IGNORED_ROUTES,
  debug: true, // Enable debug mode
  afterAuth(auth, req) {
    const pathname = req.nextUrl.pathname;
    const hasSessionClaims = !!auth.sessionClaims;
    const hasUserId = !!auth.userId;
    
    console.log("🔐 [Middleware] Auth check:", {
      pathname,
      userId: auth.userId || 'null',
      isPublicRoute: auth.isPublicRoute,
      hasSessionClaims,
      hasUserId,
      sessionId: auth.sessionId || 'null',
    });

    // For public routes: always pass through regardless of token state.
    // This breaks the interstitial 401 loop caused by an expired session
    // cookie on pages that don't require authentication.
    if (auth.isPublicRoute) {
      console.log("✅ [Middleware] Public route - allowing access");
      return NextResponse.next();
    }

    // Special case: If we have session claims but no userId yet (race condition)
    // Allow the request and let the client-side Clerk handle it
    if (hasSessionClaims && !hasUserId) {
      console.log("⚠️ [Middleware] Has session claims but userId not yet available - allowing");
      return NextResponse.next();
    }

    // For protected routes: if not signed in, redirect to sign-in.
    if (!auth.userId) {
      console.log("❌ [Middleware] No userId - redirecting to sign-in");
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // Signed in — continue.
    console.log("✅ [Middleware] Authenticated - allowing access");
    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
