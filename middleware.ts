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
  "/api/uploadthing(.*)", // UploadThing file uploads (uses own auth)
  "/api/resume-request", // Resume request creation (public)
  "/api/resume-request/(.*)", // Resume request details (public)
  "/api/resume-payment", // Resume payment proof (public, no auth needed)
  "/api/admin/(.*)", // Admin API routes handle their own auth
  "/admin/(.*)", // Admin dashboard pages (protected by layout)
  "/_next/static(.*)",
  "/_next/image(.*)",
  "/favicon.ico",
  "/_vercel/speed-insights(.*)",
];

export default authMiddleware({
  publicRoutes: PUBLIC_ROUTES,
  ignoredRoutes: IGNORED_ROUTES,
  debug: false, // Disable debug in production
  afterAuth(auth, req) {
    // Always allow - let server-side pages handle auth checks
    // With custom Clerk domain, middleware auth is unreliable
    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
