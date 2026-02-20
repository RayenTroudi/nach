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
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
