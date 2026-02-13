import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/prism.css";
import { ClerkProvider } from "@clerk/nextjs";
import ToasterProvider from "@/components/providers/ToasterProvider";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { CartProvider } from "@/contexts/CartContext";
import { PageLoaderProvider } from "@/contexts/PageLoaderProvider";
import { IntlProvider } from '@/components/providers/IntlProvider';
import { getLocale, getMessages } from '@/lib/locale';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TDS - Talel Deutschland Services",
  description: `
    Our e-learning platform is a comprehensive, AI-powered solution designed to revolutionize the way you learn. It offers a wide range of courses across various disciplines, allowing users to learn at their own pace, anytime, anywhere.

The platform features an intuitive, user-friendly interface that makes navigation and course selection a breeze. It includes interactive lessons, quizzes, and practical exercises to ensure a thorough understanding of the course material.

What sets our platform apart is the integration of advanced AI technologies. The AI-powered recommendation system suggests courses based on the user's interests, learning style, and past performance, providing a personalized learning experience.

Moreover, our AI-driven analytics tool tracks the user's progress and identifies areas of improvement, offering tailored feedback and resources to enhance learning outcomes.

The platform also includes a dynamic discussion forum where learners can interact with peers and instructors, fostering a collaborative learning environment.

Whether you're a beginner looking to learn a new skill or a professional seeking to advance your career, our AI-powered e-learning platform is your go-to resource for quality, accessible, and personalized online education.
  `,
  icons: {
    icon: [
      { url: "/images/nobgLogo.png", sizes: "48x48", type: "image/png" },
      { url: "/images/nobgLogo.png", sizes: "96x96", type: "image/png" },
      { url: "/images/nobgLogo.png", sizes: "192x192", type: "image/png" },
      { url: "/images/nobgLogo.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/images/nobgLogo.png",
    apple: { url: "/images/nobgLogo.png", sizes: "180x180", type: "image/png" },
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TDS',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages(locale);
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.classList.add(theme);
              })()
            `,
          }}
        />
      </head>
      <body
        className={
          inter.className +
          " relative scroll-smooth tracking-wider antialiased w-full max-w-full overflow-x-hidden bg-slate-100/30 dark:bg-slate-950 text-slate-800 dark:text-slate-100 bg-dot-slate-950/5 dark:bg-dot-slate-50/5"
        }
      >
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          appearance={{
            variables: {
              colorPrimary: "#DD0000",
            },
          }}
          afterSignInUrl="/"
          afterSignUpUrl="/"
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
        >
          <IntlProvider locale={locale} messages={messages}>
            <ThemeProvider>
              <PageLoaderProvider>
                <ToasterProvider />
                <CartProvider>
                  {children}
                </CartProvider>
                <Toaster />
              </PageLoaderProvider>
            </ThemeProvider>
          </IntlProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
