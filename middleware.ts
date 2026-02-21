import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/api/review",
  "/api/uploadthing(.*)",
  "/api/webhooks(.*)",
  "/api/courses",
  "/api/ausbildung",
  "/api/video-proxy",
  "/api/video-stream",
  "/api/auth/reset-password",
  "/api/auth/password-changed",
  "/api/health",
  "/api/me",
  "/api/debug/user",
  "/courses(.*)",
  "/course(.*)",
  "/user(.*)",
  "/about",
  "/blog(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password",
  "/reset-password",
  "/force-signout",
  "/contact(.*)",
  "/documents(.*)",
  "/(en|de|ar)",
  "/(en|de|ar)/sign-in(.*)",
  "/(en|de|ar)/sign-up(.*)",
  "/(en|de|ar)/forgot-password",
  "/(en|de|ar)/reset-password",
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
  publicRoutes: PUBLIC_ROUTES,
  ignoredRoutes: IGNORED_ROUTES,
  debug: true, // Enable debug mode
  afterAuth(auth, req) {
    const pathname = req.nextUrl.pathname;
    const hasSessionClaims = !!auth.sessionClaims;
    const hasUserId = !!auth.userId;
    const hasSessionId = !!auth.sessionId;
    
    console.log("🔐 [Middleware] Auth check:", {
      pathname,
      userId: auth.userId || 'null',
      sessionId: auth.sessionId || 'null',
      isPublicRoute: auth.isPublicRoute,
      hasSessionClaims,
      hasUserId,
      hasSessionId,
    });

    // For public routes: always pass through regardless of token state.
    if (auth.isPublicRoute) {
      console.log("✅ [Middleware] Public route - allowing access");
      return NextResponse.next();
    }

    // IMPORTANT: With custom Clerk domain, auth.userId might be null even when authenticated
    // Allow if we have ANY sign of authentication (sessionId, sessionClaims, or userId)
    // Let server-side auth() in pages handle the authoritative check
    if (hasSessionId || hasSessionClaims || hasUserId) {
      console.log("✅ [Middleware] Has auth signals - allowing (server will validate)");
      return NextResponse.next();
    }

    // No auth signals at all - redirect to sign-in
    console.log("❌ [Middleware] No auth signals - redirecting to sign-in");
    return redirectToSignIn({ returnBackUrl: req.url });
  },
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
