import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/api/review",
  "/api/uploadthing",
  "/api/webhooks(.*)",
  "/api/courses",
  "/api/ausbildung",
  "/api/video-proxy",
  "/api/video-stream",
  "/api/auth/reset-password",
  "/api/auth/password-changed",
  "/api/health",
  "/api/me",
  "/courses/(.*)",
  "/course/(.*)",
  "/user/(.*)",
  "/about",
  "/blog",
  "/blog/(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password",
  "/reset-password",
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
];

export default authMiddleware({
  publicRoutes: PUBLIC_ROUTES,
  ignoredRoutes: IGNORED_ROUTES,
  afterAuth(auth, req) {
    // For public routes: always pass through regardless of token state.
    // This breaks the interstitial 401 loop caused by an expired session
    // cookie on pages that don't require authentication.
    if (auth.isPublicRoute) {
      return NextResponse.next();
    }

    // For protected routes: if not signed in, redirect to sign-in.
    if (!auth.userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // Signed in — continue.
    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
