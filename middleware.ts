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
  "/api/storefront(.*)",
  "/api/documents(.*)",
  "/api/document-bundles(.*)",
  "/api/document-purchases(.*)",
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
  "/storefront(.*)",
  "/(en|de|ar)",
  "/(en|de|ar)/sign-in(.*)",
  "/(en|de|ar)/sign-up(.*)",
  "/(en|de|ar)/forgot-password",
  "/(en|de|ar)/reset-password",
];

const IGNORED_ROUTES = [
  "/api/webhooks(.*)",
  "/api/health",
  "/api/resume-payment", // Resume payment proof (public, no auth needed)
  "/api/admin/(.*)", // Admin API routes handle their own auth

  "/_next/static(.*)",
  "/_next/image(.*)",
  "/favicon.ico",
  "/_vercel/speed-insights(.*)",
];

export default authMiddleware({
  publicRoutes: PUBLIC_ROUTES,
  ignoredRoutes: IGNORED_ROUTES,
  debug: false, // Disable debug in production
  clockSkewInMs: 300000, // Allow 5 minutes clock skew tolerance for production
  afterAuth(auth, req) {
    // Allow public routes through
    if (auth.isPublicRoute) {
      return NextResponse.next();
    }
    
    // For API routes, let them handle their own auth
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.next();
    }
    
    // For protected routes, check if user has valid session
    // If no userId (expired or invalid token), redirect to sign-in
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
    
    // Valid session - allow through
    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
