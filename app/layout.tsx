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
import { getClerkLocalization } from "@/lib/clerk-localizations";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/utils/structured-data";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { validateClerkEnvironment } from "@/lib/clerk-env-validator";

// Validate Clerk configuration on server startup (dev only)
validateClerkEnvironment();

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.taleldeutchlandservices.com'),
  title: {
    default: "TDS - Talel Deutschland Services | E-Learning & Professional Training",
    template: "%s | TDS - Talel Deutschland Services",
  },
  description: `TDS (Talel Deutschland Services) - Your premier destination for professional e-learning and vocational training in Germany. Specialized courses in healthcare (Pflegefachmann/Pflegefachfrau), IT, business, and more. Multi-language support (Arabic, English, German). Expert instructors, flexible learning, career-focused education. Start your journey to success in Germany today!`,
  keywords: [
    'TDS',
    'Talel Deutschland Services',
    'e-learning Germany',
    'online courses Germany',
    'vocational training',
    'Pflegefachmann',
    'Pflegefachfrau',
    'healthcare training',
    'IT courses',
    'professional development',
    'Arabic courses Germany',
    'German language courses',
    'career training',
    'online education',
    'Deutschland Ausbildung',
  ],
  authors: [{ name: 'Talel Deutschland Services' }],
  creator: 'TDS',
  publisher: 'Talel Deutschland Services',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    alternateLocale: ['en_US', 'de_DE'],
    url: 'https://www.taleldeutchlandservices.com',
    siteName: 'TDS - Talel Deutschland Services',
    title: 'TDS - Professional E-Learning & Training in Germany',
    description: 'Quality online courses and professional training for success in Germany. Healthcare, IT, business courses in multiple languages.',
    images: [
      {
        url: '/images/nobgLogo.png',
        width: 1200,
        height: 630,
        alt: 'TDS - Talel Deutschland Services',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TDS - Talel Deutschland Services',
    description: 'Professional e-learning and training courses in Germany',
    images: ['/images/nobgLogo.png'],
  },
  alternates: {
    canonical: 'https://www.taleldeutchlandservices.com',
    languages: {
      'ar': 'https://www.taleldeutchlandservices.com/ar',
      'en': 'https://www.taleldeutchlandservices.com/en',
      'de': 'https://www.taleldeutchlandservices.com/de',
    },
  },
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
  verification: {
    // Add your Google Search Console verification code here when you get it
    // google: 'your-verification-code',
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
  const clerkLocalization = getClerkLocalization(locale);

  // Generate structured data for SEO
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <head>
        {/* Structured Data for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
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
          localization={clerkLocalization as any}
          appearance={{
            variables: {
              colorPrimary: "#DD0000",
            },
          }}
          afterSignInUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL}
          afterSignUpUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL}
          signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
          signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}
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
        <SpeedInsights />
      </body>
    </html>
  );
}
