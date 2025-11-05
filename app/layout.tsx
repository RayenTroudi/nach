import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/prism.css";
import { ClerkProvider } from "@clerk/nextjs";
import ToasterProvider from "@/components/providers/ToasterProvider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { PageLoaderProvider } from "@/contexts/PageLoaderProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Welearn",
  description: `
    Our e-learning platform is a comprehensive, AI-powered solution designed to revolutionize the way you learn. It offers a wide range of courses across various disciplines, allowing users to learn at their own pace, anytime, anywhere.

The platform features an intuitive, user-friendly interface that makes navigation and course selection a breeze. It includes interactive lessons, quizzes, and practical exercises to ensure a thorough understanding of the course material.

What sets our platform apart is the integration of advanced AI technologies. The AI-powered recommendation system suggests courses based on the user's interests, learning style, and past performance, providing a personalized learning experience.

Moreover, our AI-driven analytics tool tracks the user's progress and identifies areas of improvement, offering tailored feedback and resources to enhance learning outcomes.

The platform also includes a dynamic discussion forum where learners can interact with peers and instructors, fostering a collaborative learning environment.

Whether you're a beginner looking to learn a new skill or a professional seeking to advance your career, our AI-powered e-learning platform is your go-to resource for quality, accessible, and personalized online education.
  `,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#DD0000",
        },
        layout: {
          logoPlacement: "inside",
          logoImageUrl: "/images/logo.png",
        },
      }}
    >
      <ThemeProvider>
        <PageLoaderProvider>
          <html lang="en" className="dark">
            <body
              className={
                inter.className +
                "relative scroll-smooth	tracking-widest overflow-x-hidden bg-slate-100/30 dark:bg-slate-950 text-slate-800 dark:text-slate-100 bg-dot-slate-950/5 dark:bg-dot-slate-50/5"
              }
            >
              <ToasterProvider />
              <CartProvider>
                <WishlistProvider>{children}</WishlistProvider>
              </CartProvider>

              <Toaster />
            </body>
          </html>
        </PageLoaderProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}
