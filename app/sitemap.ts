import { MetadataRoute } from 'next';
import { connectToDatabase } from '@/lib/mongoose';
import Course from '@/lib/models/course.model';

// Base URL of the website (remove trailing slash if present)
const BASE_URL = (process.env.NEXT_PUBLIC_SERVER_URL || 'https://www.taleldeutchlandservices.com').replace(/\/$/, '');

// Supported locales
const locales = ['ar', 'en', 'de'];

// Static routes that should be included in the sitemap
const staticRoutes = [
  '/',
  '/courses',
  '/contact',
  '/contact/meeting',
  '/contact/call',
  '/contact/message',
  '/contact/resume',
  '/documents',
  '/storefront',
];

/**
 * Generate dynamic sitemap for Google and other search engines
 * This sitemap automatically includes all published courses and static pages
 * in all supported languages (ar, en, de)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];
  
  // Get current timestamp for lastmod
  const currentDate = new Date();

  try {
    // Connect to database
    await connectToDatabase();

    // Fetch all published courses
    const publishedCourses = await Course.find({ isPublished: true })
      .select('_id updatedAt')
      .lean();

    // Add static routes for each locale
    for (const locale of locales) {
      for (const route of staticRoutes) {
        const url = route === '/' 
          ? `${BASE_URL}/${locale}`
          : `${BASE_URL}/${locale}${route}`;
        
        sitemapEntries.push({
          url,
          lastModified: currentDate,
          changeFrequency: route === '/' || route === '/courses' ? 'daily' : 'weekly',
          priority: route === '/' ? 1.0 : 0.8,
        });
      }

      // Add dynamic course routes for each locale
      for (const course of publishedCourses) {
        sitemapEntries.push({
          url: `${BASE_URL}/${locale}/course/${course._id}`,
          lastModified: course.updatedAt || currentDate,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }

    // Also add non-localized routes (for backward compatibility)
    sitemapEntries.push({
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    });

    sitemapEntries.push({
      url: `${BASE_URL}/courses`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    });

    sitemapEntries.push({
      url: `${BASE_URL}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    });

    sitemapEntries.push({
      url: `${BASE_URL}/contact/meeting`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    });

    sitemapEntries.push({
      url: `${BASE_URL}/contact/call`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    });

    sitemapEntries.push({
      url: `${BASE_URL}/contact/message`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    });

    sitemapEntries.push({
      url: `${BASE_URL}/contact/resume`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    });

    sitemapEntries.push({
      url: `${BASE_URL}/documents`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5,
    });

    sitemapEntries.push({
      url: `${BASE_URL}/storefront`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    });

    // Add non-localized course routes
    for (const course of publishedCourses) {
      sitemapEntries.push({
        url: `${BASE_URL}/course/${course._id}`,
        lastModified: course.updatedAt || currentDate,
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    }

  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return at least the static routes if database fails
    for (const locale of locales) {
      for (const route of staticRoutes) {
        const url = route === '/' 
          ? `${BASE_URL}/${locale}`
          : `${BASE_URL}/${locale}${route}`;
        
        sitemapEntries.push({
          url,
          lastModified: currentDate,
          changeFrequency: route === '/' || route === '/courses' ? 'daily' : 'weekly',
          priority: route === '/' ? 1.0 : 0.8,
        });
      }
    }

    // Add fallback non-localized routes
    sitemapEntries.push(
      {
        url: BASE_URL,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${BASE_URL}/courses`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/contact`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.6,
      },
      {
        url: `${BASE_URL}/documents`,
        lastModified: currentDate,
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${BASE_URL}/storefront`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.7,
      }
    );
  }

  return sitemapEntries;
}
