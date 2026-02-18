import { MetadataRoute } from 'next';
import { connectToDatabase } from '@/lib/mongoose';
import Course from '@/lib/models/course.model';
import Category from '@/lib/models/category.model';

// Base URL of the website (remove trailing slash if present)
// Always use production URL, ignore placeholder values
const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SERVER_URL || '';
  // Ignore placeholder/invalid values
  if (!envUrl || envUrl.includes('your_app_url') || envUrl.includes('localhost')) {
    return 'https://www.taleldeutchlandservices.com';
  }
  return envUrl.replace(/\/$/, '');
};

const BASE_URL = getBaseUrl();

// Supported locales
const locales = ['ar', 'en', 'de'];

// Static routes with SEO importance
const staticRoutes = [
  { path: '/', priority: 1.0, changefreq: 'daily' as const },
  { path: '/courses', priority: 0.9, changefreq: 'daily' as const },
  { path: '/contact', priority: 0.7, changefreq: 'weekly' as const },
  { path: '/contact/meeting', priority: 0.6, changefreq: 'weekly' as const },
  { path: '/contact/call', priority: 0.6, changefreq: 'weekly' as const },
  { path: '/contact/message', priority: 0.6, changefreq: 'weekly' as const },
  { path: '/contact/resume', priority: 0.6, changefreq: 'weekly' as const },
  { path: '/documents', priority: 0.7, changefreq: 'weekly' as const },
  { path: '/storefront', priority: 0.8, changefreq: 'weekly' as const },
];

/**
 * Generate comprehensive SEO-optimized sitemap for Google Search
 * Includes:
 * - Multi-language support (ar, en, de)
 * - All published courses
 * - Categories
 * - Static pages
 * - Proper priorities and change frequencies
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [];
  
  // Get current timestamp for lastmod
  const currentDate = new Date();

  try {
    // Connect to database
    await connectToDatabase();

    // Fetch all published courses with more details
    const publishedCourses = await Course.find({ isPublished: true })
      .select('_id title updatedAt category')
      .lean();

    // Fetch all categories
    const categories = await Category.find({})
      .select('_id name')
      .lean();

    // 1. Add homepage and static routes for EACH locale
    for (const locale of locales) {
      for (const route of staticRoutes) {
        const url = route.path === '/' 
          ? `${BASE_URL}/${locale}`
          : `${BASE_URL}/${locale}${route.path}`;
        
        sitemapEntries.push({
          url,
          lastModified: currentDate,
          changeFrequency: route.changefreq,
          priority: route.priority,
        });
      }

      // 2. Add category pages for each locale
      for (const category of categories) {
        sitemapEntries.push({
          url: `${BASE_URL}/${locale}/courses?category=${category._id}`,
          lastModified: currentDate,
          changeFrequency: 'daily',
          priority: 0.8,
        });
      }

      // 3. Add dynamic course routes for each locale
      for (const course of publishedCourses) {
        sitemapEntries.push({
          url: `${BASE_URL}/${locale}/course/${course._id}`,
          lastModified: course.updatedAt || currentDate,
          changeFrequency: 'weekly',
          priority: 0.9, // High priority for course pages
        });
      }
    }

    // 4. Add non-localized routes (default/fallback)
    // Homepage
    sitemapEntries.push({
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    });

    // Static pages non-localized
    staticRoutes.forEach(route => {
      if (route.path !== '/') {
        sitemapEntries.push({
          url: `${BASE_URL}${route.path}`,
          lastModified: currentDate,
          changeFrequency: route.changefreq,
          priority: route.priority,
        });
      }
    });

    // Categories non-localized
    for (const category of categories) {
      sitemapEntries.push({
        url: `${BASE_URL}/courses?category=${category._id}`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 0.8,
      });
    }

    // Courses non-localized
    for (const course of publishedCourses) {
      sitemapEntries.push({
        url: `${BASE_URL}/course/${course._id}`,
        lastModified: course.updatedAt || currentDate,
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }

  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Return at least the static routes if database fails
    for (const locale of locales) {
      for (const route of staticRoutes) {
        const url = route.path === '/' 
          ? `${BASE_URL}/${locale}`
          : `${BASE_URL}/${locale}${route.path}`;
        
        sitemapEntries.push({
          url,
          lastModified: currentDate,
          changeFrequency: route.changefreq,
          priority: route.priority,
        });
      }
    }

    // Add fallback non-localized routes
    sitemapEntries.push({
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    });

    staticRoutes.forEach(route => {
      if (route.path !== '/') {
        sitemapEntries.push({
          url: `${BASE_URL}${route.path}`,
          lastModified: currentDate,
          changeFrequency: route.changefreq,
          priority: route.priority,
        });
      }
    });
  }

  return sitemapEntries;
}
