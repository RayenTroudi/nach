import { MetadataRoute } from 'next';

/**
 * Dynamic robots.txt generation for SEO
 * This file follows Google's robots.txt best practices
 */
export default function robots(): MetadataRoute.Robots {
  const getBaseUrl = () => {
    const envUrl = process.env.NEXT_PUBLIC_SERVER_URL || '';
    // Ignore placeholder/invalid values
    if (!envUrl || envUrl.includes('your_app_url') || envUrl.includes('localhost')) {
      return 'https://www.taleldeutchlandservices.com';
    }
    return envUrl.replace(/\/$/, '');
  };
  
  const BASE_URL = getBaseUrl();
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/teacher/',
          '/student/',
          '/user/teacher/',
          '/user/student/',
          '/(dashboard)/',
          '/meet/',
          '/_next/',
          '/sign-in/',
          '/sign-up/',
          '/forgot-password',
          '/reset-password',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: ['/'],
      },
      {
        userAgent: 'CCBot',
        disallow: ['/'],
      },
      {
        userAgent: 'anthropic-ai',
        disallow: ['/'],
      },
      {
        userAgent: 'Claude-Web',
        disallow: ['/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
