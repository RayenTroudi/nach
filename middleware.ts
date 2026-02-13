import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
  publicRoutes: [
    "/",
    "/api/review",
    "/api/payment_flouci/(.*)",
    "/api/uploadthing",
    "/api/webhooks",
    "/api/courses",
    "/api/ausbildung",
    "/api/video-proxy",
    "/api/video-stream",
    "/api/auth/reset-password",
    "/api/auth/password-changed",
    "/courses/(.*)",
    "/course/(.*)",
    "/user/(.*)",
    "/about",
    "/blog",
    "/blog/(.*)",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/forgot-password",
    "/contact(.*)",
    "/documents(.*)",
  ],
  ignoredRoutes: [
    "/api/webhooks",
    "/api/webhooks/clerk",
    "/api/ausbildung",
    "/api/video-stream",
    "/_next/static(.*)",
    "/_next/image(.*)",
    "/favicon.ico",
    "/public(.*)",
  ],
  debug: false,
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
