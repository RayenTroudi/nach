import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
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
  ],
  ignoredRoutes: [
    "/api/webhooks(.*)",
    "/api/health",
    "/_next/static(.*)",
    "/_next/image(.*)",
    "/favicon.ico",
  ],
  // Required when using a custom Clerk domain (clerk.taleldeutchlandservices.com)
  // so the middleware can resolve the session handshake cross-domain.
  domain: process.env.NEXT_PUBLIC_APP_URL || "https://www.taleldeutchlandservices.com",
  isSatellite: process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === "true",
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)", "/(api|trpc)(.*)"],
};
