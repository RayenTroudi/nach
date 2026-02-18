/**
 * Structured Data (JSON-LD) for SEO
 * Helps Google understand your site better and appear in rich results
 */

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'TDS - Talel Deutschland Services',
    alternateName: 'TDS',
    url: 'https://www.taleldeutchlandservices.com',
    logo: 'https://www.taleldeutchlandservices.com/images/nobgLogo.png',
    description: 'Professional e-learning and vocational training services in Germany. Specialized courses in healthcare, IT, and business.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'DE',
    },
    sameAs: [
      // Add your social media URLs here
      // 'https://www.facebook.com/tds',
      // 'https://www.linkedin.com/company/tds',
      // 'https://twitter.com/tds',
    ],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.taleldeutchlandservices.com/courses?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TDS - Talel Deutschland Services',
    url: 'https://www.taleldeutchlandservices.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.taleldeutchlandservices.com/courses?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: ['ar', 'en', 'de'],
  };
}

export function generateCourseSchema(course: {
  id: string;
  title: string;
  description: string;
  price?: number;
  currency?: string;
  instructor?: { name: string };
  thumbnail?: string;
  level?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    url: `https://www.taleldeutchlandservices.com/course/${course.id}`,
    image: course.thumbnail || 'https://www.taleldeutchlandservices.com/images/nobgLogo.png',
    provider: {
      '@type': 'EducationalOrganization',
      name: 'TDS - Talel Deutschland Services',
      url: 'https://www.taleldeutchlandservices.com',
    },
    ...(course.instructor && {
      instructor: {
        '@type': 'Person',
        name: course.instructor.name,
      },
    }),
    ...(course.price && {
      offers: {
        '@type': 'Offer',
        price: course.price,
        priceCurrency: course.currency || 'EUR',
        availability: 'https://schema.org/InStock',
        url: `https://www.taleldeutchlandservices.com/course/${course.id}`,
      },
    }),
    educationalLevel: course.level || 'Beginner',
    inLanguage: ['ar', 'en', 'de'],
  };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
