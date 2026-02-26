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
  "/api/resume-request",
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
  "/api/resume-request/(.*)", // Let API route handle its own auth
  "/api/admin/(.*)", // Admin routes handle their own auth
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
    
    console.log("🔐 [Middleware] Auth check:", {
      pathname,
      userId: auth.userId || 'null',
      sessionId: auth.sessionId || 'null',
      isPublicRoute: auth.isPublicRoute,
      hasSessionClaims: !!auth.sessionClaims,
    });

    // Always allow - let server-side pages handle auth checks
    // With custom Clerk domain, middleware auth is unreliable
    console.log("✅ [Middleware] Allowing all requests - server will validate");
    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
