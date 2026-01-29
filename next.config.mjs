/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    mdxRs: true,
    serverComponentsExternalPackages: ["mongoose"],
  },
  images: {
    domains: [
      "utfs.io",
      "img.clerk.com",
      "images.unsplash.com",
      "aceternity.com",
    ],
  },
  // Add CORS headers for API routes
  async headers() {
    return [
      {
        source: '/api/video-proxy',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Range, Content-Type, Content-Length',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
        ],
      },
    ];
  },
  // Optimize build for Vercel
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
